import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import { deleteFromOracleStorage } from "@/lib/oracleStorage";
import { deletePdfFromR2 } from "@/lib/r2";
import { writeAuditLog } from "@/lib/adminAudit";

const ALLOWED_DOCUMENT_UPDATES = new Set(["isPublished", "downloadAllowed", "requiresFeeClearance", "title"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const updates = await request.json();
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => ALLOWED_DOCUMENT_UPDATES.has(key))
    );

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid document updates provided" }, { status: 400 });
    }

    const document = await Document.findByIdAndUpdate(id, { $set: safeUpdates }, { new: true });
    
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    const action =
      "isPublished" in safeUpdates
        ? document.isPublished
          ? "document_publish"
          : "document_unpublish"
        : "requiresFeeClearance" in safeUpdates
          ? document.requiresFeeClearance
            ? "document_lock"
            : "document_unlock"
          : "document_update";

    await writeAuditLog({
      request,
      action,
      recordType: "Document",
      recordId: id,
      success: true,
      metadata: safeUpdates,
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    console.error("PATCH Document Error:", error);
    await writeAuditLog({
      request,
      action: "document_update",
      recordType: "Document",
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
    
    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    // 1. Delete from Storage
    if (document.storageProvider === "r2" && document.fileKey) {
      try {
        await deletePdfFromR2(document.fileKey);
      } catch (r2Error) {
        console.error("Failed to delete from R2:", r2Error);
        return NextResponse.json({ success: false, message: "Failed to delete document from storage provider." }, { status: 500 });
      }
    } else if (document.oracleObjectName) {
      try {
        await deleteFromOracleStorage(document.oracleObjectName);
      } catch (oracleError) {
        console.error("Failed to delete from Oracle:", oracleError);
        // Continue delete for Oracle legacy items in case they are missing
      }
    }

    // 2. Delete from DB
    await Document.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
