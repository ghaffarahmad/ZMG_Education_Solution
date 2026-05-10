import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AcademicOption from "@/models/AcademicOption";
import { z } from "zod";

const optionSchema = z.object({
  type: z.enum(["board", "program", "group"]),
  name: z.string().min(1, "Name is required"),
  boardId: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  isCombined: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
  notes: z.string().optional().nullable(),
});

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const query: any = {};
    if (type) query.type = type;
    if (activeOnly) query.isActive = true;

    const options = await AcademicOption.find(query).sort({ type: 1, sortOrder: 1, name: 1 });

    return NextResponse.json({ success: true, data: options });
  } catch (error) {
    console.error("GET /api/admin/academic-options error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const parseResult = optionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: "Validation error", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parseResult.data;
    const slug = generateSlug(data.name);

    // Check for existing
    const existing = await AcademicOption.findOne({
      type: data.type,
      slug: slug,
      boardId: data.boardId || null,
      programId: data.programId || null,
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "An option with this name already exists in this context." }, { status: 400 });
    }

    const newOption = await AcademicOption.create({
      ...data,
      slug,
    });

    return NextResponse.json({ success: true, data: newOption }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/academic-options error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
