import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { noticeSchema, validationMessage } from "@/lib/apiValidation";
import { writeAuditLog } from "@/lib/adminAudit";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const notice = await Notice.findById(id);
    if (!notice) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const data = await request.json();
    const parsed = noticeSchema.safeParse(data);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "notice_update",
        recordType: "Notice",
        recordId: id,
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!updatedNotice) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    await writeAuditLog({
      request,
      action: "notice_update",
      recordType: "Notice",
      recordId: id,
      success: true,
      metadata: { slug: updatedNotice.slug, mode: "update" },
    });

    return NextResponse.json({ success: true, data: updatedNotice });
  } catch (error: any) {
    // Check for duplicate slug error (code 11000 in MongoDB)
    if (error.code === 11000) {
      await writeAuditLog({
        request,
        action: "notice_update",
        recordType: "Notice",
        success: false,
        reason: "A notice with this slug already exists",
      });
      return NextResponse.json(
        { success: false, message: "A notice with this slug already exists" },
        { status: 400 }
      );
    }
    await writeAuditLog({
      request,
      action: "notice_update",
      recordType: "Notice",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const deletedNotice = await Notice.findByIdAndDelete(id);
    
    if (!deletedNotice) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
