import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import { getTotalPaidLimitMessage, normalizeCnic, prepareStudentPayload, studentWriteSchema } from "@/lib/studentRules";
import { writeAuditLog } from "@/lib/adminAudit";
import { validationMessage } from "@/lib/apiValidation";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const data = await request.json();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    const merged = {
      ...student.toObject(),
      ...data,
      cnicOrBform: data.cnicOrBform ? normalizeCnic(data.cnicOrBform) : student.cnicOrBform,
      dob: data.dob ?? student.dob,
      totalProgramFee: data.totalProgramFee ?? student.totalProgramFee,
      discountAmount: data.discountAmount ?? student.discountAmount,
      totalPaid: data.totalPaid ?? student.totalPaid,
      isManuallyBlocked: data.isManuallyBlocked ?? student.isManuallyBlocked,
    };
    const feeFieldsTouched = ["totalPaid", "totalProgramFee", "discountAmount"].some((field) =>
      Object.prototype.hasOwnProperty.call(data, field)
    );
    const totalPaidLimitMessage = feeFieldsTouched ? getTotalPaidLimitMessage(merged) : null;
    if (totalPaidLimitMessage) {
      await writeAuditLog({
        request,
        action: "student_update",
        recordType: "Student",
        recordId: id,
        success: false,
        reason: totalPaidLimitMessage,
      });
      return NextResponse.json({ success: false, message: totalPaidLimitMessage }, { status: 400 });
    }

    const allowLegacyMissingGender = !("gender" in data) && !student.gender;
    const parsed = studentWriteSchema.safeParse(allowLegacyMissingGender ? { ...merged, gender: "male" } : merged);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "student_update",
        recordType: "Student",
        recordId: id,
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const payload = prepareStudentPayload(parsed.data);
    if (allowLegacyMissingGender) {
      delete (payload as Record<string, unknown>).gender;
    }
    const duplicate = await Student.findOne({ cnicOrBform: payload.cnicOrBform, _id: { $ne: id } });
    if (duplicate) {
      await writeAuditLog({
        request,
        action: "student_update",
        recordType: "Student",
        recordId: id,
        success: false,
        reason: "Student with this CNIC/B-Form already exists",
      });
      return NextResponse.json({ success: false, message: "Student with this CNIC/B-Form already exists" }, { status: 400 });
    }

    Object.assign(student, payload);
    await student.save();

    await writeAuditLog({
      request,
      action: "student_update",
      recordType: "Student",
      recordId: student._id.toString(),
      success: true,
      metadata: { cnicOrBform: student.cnicOrBform },
    });

    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    await writeAuditLog({
      request,
      action: "student_update",
      recordType: "Student",
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
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
