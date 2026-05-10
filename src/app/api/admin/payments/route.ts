import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Student from "@/models/Student"; // Need this registered so Payment middleware works
import { paymentSchema, validationMessage } from "@/lib/apiValidation";
import { writeAuditLog } from "@/lib/adminAudit";
import { formatRupees, getSafeRemainingBalance, normalizeMoney } from "@/lib/feeMath";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const query: Record<string, string> = {};
    if (studentId) {
      query.studentId = studentId;
    }

    const payments = await Payment.find(query).sort({ paymentDate: -1, createdAt: -1 }).populate('studentId', 'studentName cnicOrBform');
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error("GET Payments Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    // Ensure Student model is loaded for the middleware
    if (!Student) console.log("Loading student model");
    
    const data = await request.json();
    const parsed = paymentSchema.safeParse(data);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "payment_add",
        recordType: "Payment",
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const student = await Student.findById(parsed.data.studentId).select(
      "finalPayableFee totalProgramFee discountAmount totalPaid remainingBalance"
    );
    if (!student) {
      await writeAuditLog({
        request,
        action: "payment_add",
        recordType: "Payment",
        success: false,
        reason: "Student not found",
        metadata: { studentId: parsed.data.studentId },
      });
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    const amount = normalizeMoney(parsed.data.amount);
    const remainingBalance = getSafeRemainingBalance({
      finalPayableFee: student.finalPayableFee,
      totalProgramFee: student.totalProgramFee,
      discountAmount: student.discountAmount,
      totalPaid: student.totalPaid,
      remainingBalance: student.remainingBalance,
    });

    if (remainingBalance <= 0) {
      await writeAuditLog({
        request,
        action: "payment_add",
        recordType: "Payment",
        success: false,
        reason: "This student has no remaining balance.",
        metadata: { studentId: parsed.data.studentId, amount },
      });
      return NextResponse.json({ success: false, message: "This student has no remaining balance." }, { status: 400 });
    }

    if (amount > remainingBalance) {
      const message = `Payment cannot exceed remaining balance of ${formatRupees(remainingBalance)}.`;
      await writeAuditLog({
        request,
        action: "payment_add",
        recordType: "Payment",
        success: false,
        reason: message,
        metadata: { studentId: parsed.data.studentId, amount, remainingBalance },
      });
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const payment = await Payment.create(parsed.data);

    await writeAuditLog({
      request,
      action: "payment_add",
      recordType: "Payment",
      recordId: payment._id.toString(),
      success: true,
      metadata: { studentId: parsed.data.studentId, amount: parsed.data.amount },
    });
    
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: any) {
    console.error("POST Payment Error:", error);
    await writeAuditLog({
      request,
      action: "payment_add",
      recordType: "Payment",
      success: false,
      reason: error.message || "Internal server error",
    });
    const knownValidationMessages = [
      "Payment amount must be greater than 0.",
      "This student has no remaining balance.",
      "Student not found",
    ];
    const isPaymentValidationError =
      knownValidationMessages.includes(error.message) ||
      String(error.message || "").startsWith("Payment cannot exceed remaining balance");

    return NextResponse.json(
      { success: false, message: isPaymentValidationError ? error.message : "Internal server error" },
      { status: isPaymentValidationError ? 400 : 500 }
    );
  }
}
