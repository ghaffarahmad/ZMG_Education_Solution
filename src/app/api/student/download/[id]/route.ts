import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Readable } from "stream";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import Student from "@/models/Student";
import DownloadLog from "@/models/DownloadLog";
import { backfillStudentDocumentsToDocuments } from "@/lib/documentBackfill";
import { getSafeRemainingBalance } from "@/lib/feeMath";
import { getFileStreamFromOracle } from "@/lib/oracleStorage";
import { getSignedPdfDownloadUrl } from "@/lib/r2";
import { verifyToken } from "@/lib/auth";

// Helper function to log download attempts
async function logAttempt(studentId: string, documentId: string, status: "success" | "failed", reason?: string, request?: Request) {
  try {
    const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("remote-addr") || "unknown";
    const userAgent = request?.headers.get("user-agent") || "unknown";
    
    await DownloadLog.create({
      studentId,
      documentId,
      status,
      reason,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error("Failed to write to DownloadLog", err);
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id: documentId } = await context.params;

    // 1. Fetch Document
    let document = await Document.findById(documentId);
    if (!document) {
      await backfillStudentDocumentsToDocuments({ _id: documentId });
      document = await Document.findById(documentId);
    }
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    const documentStudentId = document.studentId?.toString();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("student_session")?.value;
    const session = sessionToken ? await verifyToken(sessionToken) : null;
    if (!documentStudentId || !session || session.studentId !== documentStudentId) {
      await logAttempt(documentStudentId || "unknown", documentId, "failed", "Invalid student session", request);
      return NextResponse.json({ success: false, message: "Please sign in to the student portal again." }, { status: 403 });
    }

    // 2. Fetch Student linked to the verified session and document
    const student = await Student.findById(documentStudentId);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student record not found" }, { status: 404 });
    }

    // 3. Security Check: Is it published?
    if (!document.isPublished) {
      await logAttempt(student._id.toString(), documentId, "failed", "Document not published", request);
      return NextResponse.json({ success: false, message: "Document is not currently published or available." }, { status: 403 });
    }

    // 4. Security Check: Is student active?
    if (student.status !== "active") {
      await logAttempt(student._id.toString(), documentId, "failed", "Student account inactive", request);
      return NextResponse.json({ success: false, message: "Student account is inactive." }, { status: 403 });
    }

    // 5. Security Check: Fee/status gates and explicit admin download lock
    const requiresFeeClearance = Boolean(document.requiresFeeClearance);
    if (requiresFeeClearance) {
      if (student.isManuallyBlocked) {
        await logAttempt(student._id.toString(), documentId, "failed", "Manually Blocked by Admin", request);
        return NextResponse.json({ success: false, message: "Admit card access is blocked. Please contact administration." }, { status: 403 });
      }

      const remainingBalance = getSafeRemainingBalance({
        finalPayableFee: student.finalPayableFee,
        totalProgramFee: student.totalProgramFee,
        discountAmount: student.discountAmount,
        totalPaid: student.totalPaid,
        remainingBalance: student.remainingBalance,
      });

      if (remainingBalance > 0 || student.feeStatus !== "clear") {
        await logAttempt(student._id.toString(), documentId, "failed", "Fee Pending", request);
        return NextResponse.json({ success: false, message: "Please clear your pending dues to download this document." }, { status: 403 });
      }
    }

    if (document.downloadAllowed === false) {
      await logAttempt(student._id.toString(), documentId, "failed", "Document download locked by admin", request);
      return NextResponse.json({ success: false, message: "Document download is currently locked by administration." }, { status: 403 });
    }

    // 6. Security Check Passed: Fetch from R2 or Oracle
    if (document.storageProvider === "r2" && document.fileKey) {
      try {
        const signedUrl = await getSignedPdfDownloadUrl(document.fileKey, document.originalFileName);
        await logAttempt(student._id.toString(), documentId, "success", "Generated R2 signed URL", request);

        if (request.headers.get("accept")?.includes("application/json")) {
          return NextResponse.json({ success: true, url: signedUrl });
        }
        
        // Next.js standard way to redirect to the signed URL
        return NextResponse.redirect(signedUrl);
      } catch (r2Err) {
        console.error("R2 fetch error:", r2Err);
        await logAttempt(student._id.toString(), documentId, "failed", "R2 Storage Error", request);
        return NextResponse.json({ success: false, message: "File not found in secure storage." }, { status: 404 });
      }
    }

    // 7. Fallback to Oracle for legacy documents
    if (!process.env.OCI_PRIVATE_KEY) {
      await logAttempt(student._id.toString(), documentId, "failed", "Oracle Legacy Config Missing", request);
      return NextResponse.json({ success: false, message: "This legacy document is currently unavailable. Please contact administration." }, { status: 503 });
    }

    let fileStream;
    try {
      fileStream = await getFileStreamFromOracle(document.oracleObjectName);
    } catch (oracleErr) {
      console.error("Oracle fetch error:", oracleErr);
      await logAttempt(student._id.toString(), documentId, "failed", "Oracle Storage Error", request);
      return NextResponse.json({ success: false, message: "File not found in legacy secure storage." }, { status: 404 });
    }

    // 8. Log success for Oracle legacy
    await logAttempt(student._id.toString(), documentId, "success", "Oracle Legacy Stream", request);

    // 9. Stream the file to client (Legacy)
    const webStream = Readable.toWeb(fileStream as Readable);

    const headers = new Headers();
    headers.set("Content-Type", document.mimeType || "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${document.originalFileName}"`);
    if (document.fileSize) headers.set("Content-Length", document.fileSize.toString());

    return new NextResponse(webStream as ReadableStream, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error("Secure Download API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
