import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import Student from "@/models/Student";
import { backfillStudentDocumentsToDocuments } from "@/lib/documentBackfill";
import { uploadPdfToR2, buildPdfKey, deletePdfFromR2 } from "@/lib/r2";
import { documentUploadSchema, validationMessage } from "@/lib/apiValidation";
import { writeAuditLog } from "@/lib/adminAudit";

function parseBooleanFlag(formData: FormData, key: string, fallback: boolean) {
  const values = formData.getAll(key);
  return values.length > 0 ? values.some((value) => value === "true") : fallback;
}

function logCreatedDocument(document: {
  _id: { toString(): string };
  studentId: { toString(): string };
  storageProvider?: string;
  fileKey?: string;
  isPublished?: boolean;
  downloadAllowed?: boolean;
}) {
  console.info("[documents:admin-upload] created MongoDB document record", {
    studentId: document.studentId.toString(),
    documentId: document._id.toString(),
    model: "Document",
    collection: Document.collection.name,
    storageProvider: document.storageProvider,
    fileKey: document.fileKey,
    isPublished: document.isPublished,
    downloadAllowed: document.downloadAllowed,
  });
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Explicitly load Student model for population
    if (!Student) console.log("Loading student model");
    await backfillStudentDocumentsToDocuments();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const board = searchParams.get("board");
    const program = searchParams.get("program");
    const feeStatus = searchParams.get("feeStatus");
    const published = searchParams.get("published");
    const locked = searchParams.get("locked");
    
    const query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (type) query.type = type;
    if (published === "true") query.isPublished = true;
    if (published === "false") query.isPublished = false;
    if (locked === "true") query.requiresFeeClearance = true;
    if (locked === "false") query.requiresFeeClearance = false;

    let documents = await Document.find(query)
      .populate("studentId", "studentName cnicOrBform board program feeStatus finalPayableFee totalPaid remainingBalance isManuallyBlocked")
      .sort({ createdAt: -1 });

    documents = documents.filter((doc: any) => {
      const student = doc.studentId;
      if (board && student?.board !== board) return false;
      if (program && student?.program !== program) return false;
      if (feeStatus && student?.feeStatus !== feeStatus) return false;
      if (search) {
        const term = search.toLowerCase();
        const haystack = [
          doc.title,
          doc.originalFileName,
          doc.type,
          student?.studentName,
          student?.cnicOrBform,
        ].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    const safeDocuments = documents.map((doc: any) => {
      const plain = doc.toObject();
      delete plain.oracleObjectName;
      delete plain.fileKey; // Secure: Don't expose keys
      return plain;
    });

    return NextResponse.json({ success: true, data: safeDocuments });
  } catch (error: any) {
    console.error("GET Documents Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const studentId = formData.get("studentId") as string;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const isPublished = parseBooleanFlag(formData, "isPublished", true);
    const requiresFeeClearance = parseBooleanFlag(formData, "requiresFeeClearance", type === "admit_card");
    const downloadAllowed = parseBooleanFlag(formData, "downloadAllowed", true);

    const parsed = documentUploadSchema.safeParse({ studentId, title, type, isPublished, requiresFeeClearance, downloadAllowed });
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "document_upload",
        recordType: "Document",
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ success: false, message: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "PDF file must be 10MB or smaller" }, { status: 400 });
    }

    // Verify student exists
    const student = await Student.findById(parsed.data.studentId);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Convert File to Buffer for R2 Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/pdf";

    // Upload to Cloudflare R2
    const fileKey = buildPdfKey(parsed.data.studentId, file.name);
    await uploadPdfToR2(buffer, fileKey, mimeType);

    try {
      // Save to DB
      const document = await Document.create({
        studentId: parsed.data.studentId,
        title: parsed.data.title,
        type: parsed.data.type,
        storageProvider: "r2",
        fileKey,
        fileName: file.name,
        originalFileName: file.name,
        mimeType,
        fileSize: file.size,
        isPublished: parsed.data.isPublished,
        requiresFeeClearance: parsed.data.requiresFeeClearance,
        downloadAllowed: parsed.data.downloadAllowed,
        uploadedBy: "Admin", // Replace with session name when real auth is used
      });

      logCreatedDocument(document);

      await writeAuditLog({
        request,
        action: "document_upload",
        recordType: "Document",
        recordId: document._id.toString(),
        success: true,
        metadata: { studentId: parsed.data.studentId, type: parsed.data.type, fileName: file.name },
      });

      return NextResponse.json({ success: true, data: document }, { status: 201 });
    } catch (dbError) {
      console.error("DB Save failed, cleaning up R2:", dbError);
      await deletePdfFromR2(fileKey).catch(err => console.error("R2 Cleanup failed:", err));
      await writeAuditLog({
        request,
        action: "document_upload",
        recordType: "Document",
        success: false,
        reason: "Database save failed after R2 upload; attempted R2 rollback",
        metadata: { studentId: parsed.data.studentId, type: parsed.data.type, fileName: file.name },
      });
      return NextResponse.json(
        {
          success: false,
          message: "Document was uploaded to storage, but the database record could not be saved. The storage upload was rolled back. Please retry.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("POST Document Error:", error);
    await writeAuditLog({
      request,
      action: "document_upload",
      recordType: "Document",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
