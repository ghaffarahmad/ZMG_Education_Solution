import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import { getTotalPaidLimitMessage, prepareStudentPayload, normalizeCnic, studentWriteSchema } from "@/lib/studentRules";
import { writeAuditLog } from "@/lib/adminAudit";
import { validationMessage } from "@/lib/apiValidation";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const board = searchParams.get("board");
    const program = searchParams.get("program");
    const gender = searchParams.get("gender");
    const feeStatus = searchParams.get("feeStatus");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (search) {
      const normalizedSearch = normalizeCnic(search);
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { cnicOrBform: { $regex: search, $options: "i" } },
        { cnicOrBform: { $regex: normalizedSearch, $options: "i" } },
      ];
    }
    if (board) query.board = board;
    if (program) query.program = program;
    if (gender) query.gender = gender;
    if (feeStatus) query.feeStatus = feeStatus;
    if (status) query.status = status;

    const students = await Student.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    console.error("GET Students Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const parsed = studentWriteSchema.safeParse(data);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "student_create",
        recordType: "Student",
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const payload = prepareStudentPayload(parsed.data);
    const totalPaidLimitMessage = getTotalPaidLimitMessage(parsed.data);
    if (totalPaidLimitMessage) {
      await writeAuditLog({
        request,
        action: "student_create",
        recordType: "Student",
        success: false,
        reason: totalPaidLimitMessage,
      });
      return NextResponse.json({ success: false, message: totalPaidLimitMessage }, { status: 400 });
    }

    const existingStudent = await Student.findOne({ cnicOrBform: payload.cnicOrBform });
    if (existingStudent) {
      await writeAuditLog({
        request,
        action: "student_create",
        recordType: "Student",
        success: false,
        reason: "Student with this CNIC/B-Form already exists",
        metadata: { cnicOrBform: payload.cnicOrBform },
      });
      return NextResponse.json({ success: false, message: "Student with this CNIC/B-Form already exists" }, { status: 400 });
    }

    const initialTotalPaid = payload.totalPaid || 0;
    const studentPayload = initialTotalPaid > 0 ? prepareStudentPayload({ ...parsed.data, totalPaid: 0 }) : payload;
    const student = await Student.create(studentPayload);

    // If initial payment was made during creation, log it as a Payment record
    if (initialTotalPaid > 0) {
      await Payment.create({
        studentId: student._id,
        amount: initialTotalPaid,
        paymentMethod: "cash",
        paymentDate: new Date(),
        note: "Initial Amount Paid at Admission"
      });
    }

    // Create initial active enrollment based on selected academic options
    if (student.board || student.program || student.group || student.session) {
      const { default: StudentEnrollment } = await import("@/models/StudentEnrollment");
      await StudentEnrollment.create({
        studentId: student._id,
        board: student.board,
        program: student.program,
        group: student.group,
        session: student.session,
        academicStatus: "active",
        startDate: student.admissionDate || new Date()
      });
    }

    await writeAuditLog({
      request,
      action: "student_create",
      recordType: "Student",
      recordId: student._id.toString(),
      success: true,
      metadata: { cnicOrBform: student.cnicOrBform },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    console.error("POST Student Error:", error);
    await writeAuditLog({
      request,
      action: "student_create",
      recordType: "Student",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
