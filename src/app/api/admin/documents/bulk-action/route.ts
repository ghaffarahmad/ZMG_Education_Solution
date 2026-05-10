import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import { writeAuditLog } from "@/lib/adminAudit";

const bulkActionSchema = z.object({
  documentIds: z.array(z.string().min(1)).min(1, "Select at least one document"),
  action: z.enum(["publish", "unpublish", "lock", "unlock"]),
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const parsed = bulkActionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues.map((issue) => issue.message).join("; ") },
        { status: 400 }
      );
    }

    const { documentIds, action } = parsed.data;
    const update =
      action === "publish"
        ? { isPublished: true }
        : action === "unpublish"
          ? { isPublished: false }
          : action === "lock"
            ? { requiresFeeClearance: true }
            : { requiresFeeClearance: false };

    const result = await Document.updateMany({ _id: { $in: documentIds } }, { $set: update });

    await writeAuditLog({
      request,
      action: action === "publish" ? "document_publish" : action === "unpublish" ? "document_unpublish" : action === "lock" ? "document_lock" : "document_unlock",
      recordType: "Document",
      success: true,
      metadata: { documentIds, modifiedCount: result.modifiedCount },
    });

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    await writeAuditLog({
      request,
      action: "document_bulk_action",
      recordType: "Document",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
