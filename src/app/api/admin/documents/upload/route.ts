import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentDocument from "@/models/StudentDocument";
import { uploadPdfToR2, buildPdfKey, deletePdfFromR2 } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const formData = await request.formData();
    const studentId = formData.get("studentId") as string;
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!studentId || !type || !title || !file) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Cloudflare R2
    const fileKey = buildPdfKey(studentId, file.name);
    await uploadPdfToR2(buffer, fileKey, file.type);

    try {
      const document = await StudentDocument.create({
        studentId,
        type,
        title,
        fileName: file.name,
        fileKey,
        storageProvider: "r2",
        mimeType: file.type,
        size: file.size,
        isPublished: true, 
        downloadAllowed: false, 
      });

      return NextResponse.json({ success: true, data: document });
    } catch (dbError) {
      // If DB save fails, clean up the R2 object
      console.error("DB Save failed, cleaning up R2:", dbError);
      await deletePdfFromR2(fileKey).catch(err => console.error("R2 Cleanup failed:", err));
      throw dbError; // Bubble up to outer catch
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
