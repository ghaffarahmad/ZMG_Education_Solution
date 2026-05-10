import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { documentUploadSchema, validationMessage } from "@/lib/apiValidation";
import { uploadPdfToR2, buildPdfKey, deletePdfFromR2 } from "@/lib/r2";
import Document from "@/models/Document";
import Student from "@/models/Student";

const MAX_PDF_SIZE = 10 * 1024 * 1024;

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
  console.info("[documents:quick-upload] created MongoDB document record", {
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

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const studentId = formData.get("studentId") as string;
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;
    const isPublished = parseBooleanFlag(formData, "isPublished", true);
    const downloadAllowed = parseBooleanFlag(formData, "downloadAllowed", true);
    const requiresFeeClearance = parseBooleanFlag(formData, "requiresFeeClearance", type === "admit_card");

    if (!studentId || !type || !title || !file) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ success: false, message: "PDF file must be 10MB or smaller" }, { status: 400 });
    }

    const parsed = documentUploadSchema.safeParse({
      studentId,
      title,
      type,
      isPublished,
      requiresFeeClearance,
      downloadAllowed,
    });

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const student = await Student.findById(parsed.data.studentId).select("_id");
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/pdf";
    
    // Upload to Cloudflare R2
    const fileKey = buildPdfKey(parsed.data.studentId, file.name);
    await uploadPdfToR2(buffer, fileKey, mimeType);

    try {
      const document = await Document.create({
        studentId: parsed.data.studentId,
        type: parsed.data.type,
        title: parsed.data.title,
        fileName: file.name,
        originalFileName: file.name,
        fileKey,
        storageProvider: "r2",
        mimeType,
        fileSize: file.size,
        isPublished: parsed.data.isPublished,
        requiresFeeClearance: parsed.data.requiresFeeClearance,
        downloadAllowed: parsed.data.downloadAllowed,
        uploadedBy: "Admin",
      });

      logCreatedDocument(document);

      return NextResponse.json({ success: true, data: document }, { status: 201 });
    } catch (dbError) {
      // If DB save fails, clean up the R2 object
      console.error("DB Save failed, cleaning up R2:", dbError);
      await deletePdfFromR2(fileKey).catch(err => console.error("R2 Cleanup failed:", err));
      return NextResponse.json(
        {
          success: false,
          message: "Document was uploaded to storage, but the database record could not be saved. The storage upload was rolled back. Please retry.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
