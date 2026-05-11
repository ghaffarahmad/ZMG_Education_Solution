import { NextResponse } from "next/server";
import { Readable } from "stream";
import connectToDatabase from "@/lib/mongodb";
import Document from "@/models/Document";
import { getFileStreamFromOracle } from "@/lib/oracleStorage";
import { getSignedPdfDownloadUrl } from "@/lib/r2";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id: documentId } = await context.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    if (document.storageProvider === "r2" && document.fileKey) {
      try {
        const signedUrl = await getSignedPdfDownloadUrl(document.fileKey, document.originalFileName);
        
        if (request.headers.get("accept")?.includes("application/json")) {
          return NextResponse.json({ success: true, url: signedUrl });
        }
        
        return NextResponse.redirect(signedUrl);
      } catch (r2Err) {
        console.error("Admin R2 fetch error:", r2Err);
        return NextResponse.json({ success: false, message: "File not found in secure storage." }, { status: 404 });
      }
    }

    // Fallback to Oracle for legacy documents
    if (!process.env.OCI_PRIVATE_KEY) {
      return NextResponse.json({ success: false, message: "Oracle Legacy Config Missing." }, { status: 503 });
    }

    let fileStream;
    try {
      fileStream = await getFileStreamFromOracle(document.oracleObjectName);
    } catch (oracleErr) {
      console.error("Admin Oracle fetch error:", oracleErr);
      return NextResponse.json({ success: false, message: "File not found in legacy secure storage." }, { status: 404 });
    }

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
    console.error("Admin Secure Download API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
