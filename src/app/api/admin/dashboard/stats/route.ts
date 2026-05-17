import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Document from "@/models/Document";
import DownloadLog from "@/models/DownloadLog";
import Inquiry from "@/models/Inquiry";
import { backfillStudentDocumentsToDocuments } from "@/lib/documentBackfill";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await backfillStudentDocumentsToDocuments();

    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: "active" });
    const pendingFees = await Student.countDocuments({ feeStatus: "pending" });
    
    // Exact locked admit cards
    const studentsWithPendingFees = await Student.find({ feeStatus: { $ne: "clear" } }).select("_id");
    const pendingFeeStudentIds = studentsWithPendingFees.map(s => s._id);
    const lockedAdmitCards = await Document.countDocuments({
      type: "admit_card",
      studentId: { $in: pendingFeeStudentIds }
    });

    const totalDocuments = await Document.countDocuments();
    const totalDownloads = await DownloadLog.countDocuments();
    
    const newInquiries = await Inquiry.countDocuments({ status: "new" });

    // Recent students
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select("studentName program createdAt feeStatus");
    
    // Recent downloads
    const recentDownloads = await DownloadLog.find().sort({ createdAt: -1 }).limit(5).populate("studentId", "studentName").populate("documentId", "title");

    return NextResponse.json({ 
      success: true, 
      data: {
        totalStudents,
        activeStudents,
        pendingFees,
        lockedAdmitCards,
        totalDocuments,
        totalDownloads,
        newInquiries,
        recentStudents,
        recentDownloads
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
