import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AcademicOption from "@/models/AcademicOption";
import { BOARD_OPTIONS, PROGRAM_OPTIONS, GROUP_OPTIONS } from "@/lib/studentRules";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    let addedCount = 0;

    // Seed Boards
    for (let i = 0; i < BOARD_OPTIONS.length; i++) {
      const name = BOARD_OPTIONS[i];
      const slug = generateSlug(name);
      const existing = await AcademicOption.findOne({ type: "board", slug });
      if (!existing) {
        await AcademicOption.create({ type: "board", name, slug, sortOrder: i });
        addedCount++;
      }
    }

    // Seed Programs (Global)
    for (let i = 0; i < PROGRAM_OPTIONS.length; i++) {
      const name = PROGRAM_OPTIONS[i];
      const slug = generateSlug(name);
      const existing = await AcademicOption.findOne({ type: "program", slug, boardId: null });
      if (!existing) {
        await AcademicOption.create({ type: "program", name, slug, sortOrder: i });
        addedCount++;
      }
    }

    // Seed Groups (Global)
    for (let i = 0; i < GROUP_OPTIONS.length; i++) {
      const name = GROUP_OPTIONS[i];
      const slug = generateSlug(name);
      const existing = await AcademicOption.findOne({ type: "group", slug, boardId: null, programId: null });
      if (!existing) {
        await AcademicOption.create({ type: "group", name, slug, sortOrder: i });
        addedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${addedCount} default options.` });
  } catch (error) {
    console.error("POST /api/admin/academic-options/seed error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
