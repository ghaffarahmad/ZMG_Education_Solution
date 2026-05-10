import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import { deleteFromOracleStorage } from "@/lib/oracleStorage";
import { deletePdfFromR2 } from "@/lib/r2";
import { writeAuditLog } from "@/lib/adminAudit";

const ALLOWED_DOCUMENT_UPDATES = new Set(["isPublished", "downloadAllowed", "requiresFeeClearance", "title"]);
const BOOLEAN_DOCUMENT_UPDATES = new Set(["isPublished", "downloadAllowed", "requiresFeeClearance"]);

function sanitizeDocument(document: { toObject(): Record<string, unknown> }) {
  const plain = document.toObject();
  delete plain.oracleObjectName;
  delete plain.fileKey;
  return plain;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid document id" }, { status: 400 });
    }

    const updates = await request.json().catch(() => null);
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 });
    }

    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_DOCUMENT_UPDATES.has(key)) continue;

      if (BOOLEAN_DOCUMENT_UPDATES.has(key)) {
        if (typeof value !== "boolean") {
          return NextResponse.json({ success: false, message: `${key} must be a boolean` }, { status: 400 });
        }
        safeUpdates[key] = value;
        continue;
      }

      if (key === "title") {
        if (typeof value !== "string" || value.trim().length === 0) {
          return NextResponse.json({ success: false, message: "Title must be a non-empty string" }, { status: 400 });
        }
        safeUpdates.title = value.trim();
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid document updates provided" }, { status: 400 });
    }

    const document = await Document.findByIdAndUpdate(id, { $set: safeUpdates }, { new: true, runValidators: true })
      .populate("studentId", "studentName cnicOrBform board program feeStatus finalPayableFee totalPaid remainingBalance isManuallyBlocked");
    
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
          : "downloadAllowed" in safeUpdates
            ? document.downloadAllowed
              ? "document_download_allow"
              : "document_download_lock"
          : "document_update";

    await writeAuditLog({
      request,
      action,
      recordType: "Document",
      recordId: id,
      success: true,
      metadata: safeUpdates,
    });

    return NextResponse.json({ success: true, data: sanitizeDocument(document) });
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
