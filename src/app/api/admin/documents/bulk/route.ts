import { NextResponse } from "next/server";
import JSZip from "jszip";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import Student from "@/models/Student";
import { deleteFromOracleStorage, uploadToOracleStorage } from "@/lib/oracleStorage";
import { normalizeCnic } from "@/lib/studentRules";
import { writeAuditLog } from "@/lib/adminAudit";

const MAX_PDF_SIZE = 10 * 1024 * 1024;

const bulkDocumentSchema = z.object({
  mode: z.enum(["preview", "confirm"]),
  documentType: z.enum(["admit_card", "enrollment_card", "other"]),
  isPublished: z.boolean(),
  downloadAllowed: z.boolean(),
  requiresFeeClearance: z.boolean(),
  replaceExisting: z.boolean(),
});

type BulkPdf = {
  fileName: string;
  buffer: Buffer;
  size: number;
};

type BulkPreview = {
  fileName: string;
  matchedStudent: string;
  cnicOrBform: string;
  studentId?: string;
  documentType: string;
  status: "ready" | "error";
  error?: string;
  willReplace?: boolean;
};

function parseFlags(formData: FormData) {
  return bulkDocumentSchema.safeParse({
    mode: formData.get("mode"),
    documentType: formData.get("documentType"),
    isPublished: formData.get("isPublished") === "true",
    downloadAllowed: formData.get("downloadAllowed") === "true",
    requiresFeeClearance: formData.get("requiresFeeClearance") === "true",
    replaceExisting: formData.get("replaceExisting") === "true",
  });
}

function keyFromFilename(fileName: string) {
  const base = fileName.split("/").pop()?.replace(/\.pdf$/i, "") || "";
  const [key] = base.split("_");
  return key?.trim() || "";
}

async function extractPdfs(files: File[]) {
  const pdfs: BulkPdf[] = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (lowerName.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
      const zip = await JSZip.loadAsync(buffer);
      const entries = Object.values(zip.files).filter((entry) => !entry.dir);
      for (const entry of entries) {
        if (!entry.name.toLowerCase().endsWith(".pdf")) {
          pdfs.push({ fileName: entry.name, buffer: Buffer.alloc(0), size: 0 });
          continue;
        }

        const entryBuffer = await entry.async("nodebuffer");
        pdfs.push({ fileName: entry.name.split("/").pop() || entry.name, buffer: entryBuffer, size: entryBuffer.length });
      }
    } else {
      pdfs.push({ fileName: file.name, buffer, size: file.size });
    }
  }

  return pdfs;
}

async function buildPreview(pdfs: BulkPdf[], documentType: string, replaceExisting: boolean) {
  const previews: BulkPreview[] = [];
  const seen = new Set<string>();

  for (const pdf of pdfs) {
    const key = keyFromFilename(pdf.fileName);
    const cnic = normalizeCnic(key);
    const isPdf = pdf.fileName.toLowerCase().endsWith(".pdf") && pdf.buffer.length > 0;
    let preview: BulkPreview = {
      fileName: pdf.fileName,
      matchedStudent: "-",
      cnicOrBform: cnic || key,
      documentType,
      status: "error",
      error: "",
    };

    if (!isPdf) {
      preview.error = "Only PDF files are allowed";
      previews.push(preview);
      continue;
    }

    if (pdf.size > MAX_PDF_SIZE) {
      preview.error = "PDF file must be 10MB or smaller";
      previews.push(preview);
      continue;
    }

    if (!key) {
      preview.error = "Filename must start with CNIC/B-Form or studentId before an underscore";
      previews.push(preview);
      continue;
    }

    const matchClauses: Record<string, string>[] = [{ cnicOrBform: cnic }];
    if (/^[0-9a-f]{24}$/i.test(key)) {
      matchClauses.push({ _id: key });
    }

    const student = await Student.findOne({ $or: matchClauses });

    if (!student) {
      preview.error = "Student not found";
      previews.push(preview);
      continue;
    }

    const duplicateKey = `${student._id.toString()}:${documentType}`;
    if (seen.has(duplicateKey)) {
      preview.error = "Duplicate file for the same student and document type in this upload";
      previews.push(preview);
      continue;
    }
    seen.add(duplicateKey);

    const existingDocument = await Document.findOne({ studentId: student._id, type: documentType });
    if (existingDocument && !replaceExisting) {
      preview = {
        ...preview,
        matchedStudent: student.studentName,
        cnicOrBform: student.cnicOrBform,
        studentId: student._id.toString(),
        error: "Document already exists for this student and type. Enable Replace existing to continue.",
      };
      previews.push(preview);
      continue;
    }

    previews.push({
      ...preview,
      matchedStudent: student.studentName,
      cnicOrBform: student.cnicOrBform,
      studentId: student._id.toString(),
      status: "ready",
      error: undefined,
      willReplace: Boolean(existingDocument),
    });
  }

  return previews;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const parsed = parseFlags(formData);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues.map((issue) => issue.message).join("; ") },
        { status: 400 }
      );
    }

    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ success: false, message: "Upload at least one PDF file or ZIP file" }, { status: 400 });
    }

    const pdfs = await extractPdfs(files);
    const previews = await buildPreview(pdfs, parsed.data.documentType, parsed.data.replaceExisting);

    if (parsed.data.mode === "preview") {
      return NextResponse.json({
        success: true,
        data: {
          rows: previews,
          hasErrors: previews.some((row) => row.status === "error"),
          readyCount: previews.filter((row) => row.status === "ready").length,
          errorCount: previews.filter((row) => row.status === "error").length,
        },
      });
    }

    const errors = previews.filter((row) => row.status === "error");
    if (errors.length > 0) {
      await writeAuditLog({
        request,
        action: "document_bulk_upload",
        recordType: "Document",
        success: false,
        reason: "Bulk document upload contains validation errors",
        metadata: { errors },
      });
      return NextResponse.json({ success: false, message: "Fix preview errors before confirming upload", data: { rows: previews } }, { status: 400 });
    }

    let uploaded = 0;
    let replaced = 0;

    for (const row of previews) {
      const pdf = pdfs.find((item) => item.fileName === row.fileName);
      if (!pdf || !row.studentId) continue;

      const existing = await Document.findOne({ studentId: row.studentId, type: parsed.data.documentType });
      if (existing && parsed.data.replaceExisting) {
        try {
          await deleteFromOracleStorage(existing.oracleObjectName);
        } catch (error) {
          console.error("Failed to delete replaced Oracle object:", error);
        }
        await Document.deleteOne({ _id: existing._id });
        replaced += 1;
      }

      const fileKey = await uploadToOracleStorage(pdf.buffer, pdf.fileName, "application/pdf");
      await Document.create({
        studentId: row.studentId,
        title: `${row.documentType.replace(/_/g, " ")} - ${row.matchedStudent}`,
        type: parsed.data.documentType,
        oracleObjectName: fileKey,
        originalFileName: pdf.fileName,
        mimeType: "application/pdf",
        fileSize: pdf.size,
        isPublished: parsed.data.isPublished,
        downloadAllowed: parsed.data.downloadAllowed,
        requiresFeeClearance: parsed.data.requiresFeeClearance,
        uploadedBy: "Admin",
      });
      uploaded += 1;
    }

    await writeAuditLog({
      request,
      action: "document_bulk_upload",
      recordType: "Document",
      success: true,
      metadata: { uploaded, replaced, documentType: parsed.data.documentType },
    });

    return NextResponse.json({ success: true, data: { uploaded, replaced } });
  } catch (error: any) {
    await writeAuditLog({
      request,
      action: "document_bulk_upload",
      recordType: "Document",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Bulk document upload failed" }, { status: 500 });
  }
}
