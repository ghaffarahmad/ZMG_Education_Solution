import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { noticeSchema, validationMessage } from "@/lib/apiValidation";
import { writeAuditLog } from "@/lib/adminAudit";

export async function GET() {
  try {
    await connectToDatabase();
    const notices = await Notice.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const parsed = noticeSchema.safeParse(data);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "notice_update",
        recordType: "Notice",
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    // Check if slug exists
    const existingNotice = await Notice.findOne({ slug: parsed.data.slug });
    if (existingNotice) {
      return NextResponse.json(
        { success: false, message: "Notice with this slug already exists" },
        { status: 400 }
      );
    }

    const newNotice = await Notice.create(parsed.data);

    await writeAuditLog({
      request,
      action: "notice_update",
      recordType: "Notice",
      recordId: newNotice._id.toString(),
      success: true,
      metadata: { slug: newNotice.slug, mode: "create" },
    });

    return NextResponse.json({ success: true, data: newNotice });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
