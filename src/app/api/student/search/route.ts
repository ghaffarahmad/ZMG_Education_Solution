import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Document from "@/models/Document";
import { backfillStudentDocumentsToDocuments } from "@/lib/documentBackfill";
import { getSafeRemainingBalance } from "@/lib/feeMath";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    
    if (!data.cnicOrBform || !data.dob) {
      return NextResponse.json({ success: false, message: "CNIC/B-Form and Date of Birth are required" }, { status: 400 });
    }

    // Search for both exact match (with dashes) and normalized match (without dashes)
    const normalizedCnic = data.cnicOrBform.replace(/[\s-]/g, "");
    const formattedCnic = data.cnicOrBform;

    const student = await Student.findOne({ 
      $or: [
        { cnicOrBform: formattedCnic },
        { cnicOrBform: normalizedCnic }
      ],
      dob: data.dob
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "No record found with the provided details. Please check your CNIC and Date of Birth." }, { status: 404 });
    }

    if (student.status !== "active") {
      return NextResponse.json({ success: false, message: "Your account is currently inactive. Please contact administration." }, { status: 403 });
    }

    await backfillStudentDocumentsToDocuments({ studentId: student._id });

    // Fetch ONLY published documents for this student
    const documents = await Document.find({
      studentId: student._id,
      isPublished: true
    }).select("title type createdAt downloadAllowed requiresFeeClearance fileSize mimeType").sort({ createdAt: -1 });

    // Exclude sensitive data from student object
    const publicStudentInfo = {
      _id: student._id,
      studentName: student.studentName,
      fatherName: student.fatherName,
      gender: student.gender,
      program: student.program,
      board: student.board,
      session: student.session,
      feeStatus: student.feeStatus,
      totalProgramFee: student.totalProgramFee,
      discountAmount: student.discountAmount,
      finalPayableFee: student.finalPayableFee,
      totalPaid: student.totalPaid,
      remainingBalance: getSafeRemainingBalance({
        finalPayableFee: student.finalPayableFee,
        totalProgramFee: student.totalProgramFee,
        discountAmount: student.discountAmount,
        totalPaid: student.totalPaid,
        remainingBalance: student.remainingBalance,
      }),
      isManuallyBlocked: student.isManuallyBlocked
    };

    // Create student session token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const token = await new SignJWT({ studentId: student._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("student_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        student: publicStudentInfo,
        documents
      } 
    });

  } catch (error: any) {
    console.error("Student search error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
