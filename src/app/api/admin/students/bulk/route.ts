import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import { writeAuditLog } from "@/lib/adminAudit";
import { getSafeRemainingBalance } from "@/lib/feeMath";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Ensure Payment model is loaded since we might create payments
    if (!Payment) console.log("Loading payment model");

    const { action, studentIds } = await request.json();

    if (!action || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid request payload" }, { status: 400 });
    }

    if (action === "block_admit_card") {
      // Mark as manually blocked
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { 
          $set: { 
            isManuallyBlocked: true, 
            feeStatus: "blocked",
            manualBlockReason: "Bulk Blocked from Admin Panel" 
          } 
        }
      );
      await writeAuditLog({
        request,
        action: "student_bulk_update",
        recordType: "Student",
        success: true,
        metadata: { action, studentIds },
      });
      return NextResponse.json({ success: true, message: "Students blocked successfully" });
    } 
    
    else if (action === "mark_clear") {
      // For each student, find remaining balance and create a payment
      const students = await Student.find({ _id: { $in: studentIds } });
      
      const paymentPromises = [];
      const studentUpdatePromises = [];

      for (const student of students) {
        const remainingBalance = getSafeRemainingBalance({
          finalPayableFee: student.finalPayableFee,
          totalProgramFee: student.totalProgramFee,
          discountAmount: student.discountAmount,
          totalPaid: student.totalPaid,
          remainingBalance: student.remainingBalance,
        });

        if (remainingBalance > 0) {
          // Create a payment for the remaining balance
          paymentPromises.push(
            Payment.create({
              studentId: student._id,
              amount: remainingBalance,
              paymentMethod: "other",
              note: "Bulk Mark Clear by Admin",
            })
          );
          
          // Also update the student directly (though payment middleware does this, 
          // doing it explicitly in bulk might be safer or we just let middleware handle it.
          // Since middleware runs on `Payment.create`, we just wait for paymentPromises!
        } else if (student.isManuallyBlocked) {
          // Unblock them if they are blocked
          student.isManuallyBlocked = false;
          student.manualBlockReason = "";
          studentUpdatePromises.push(student.save());
        }
      }

      await Promise.all([...paymentPromises, ...studentUpdatePromises]);

      await writeAuditLog({
        request,
        action: "fee_update",
        recordType: "Student",
        success: true,
        metadata: { action, studentIds },
      });
      
      return NextResponse.json({ success: true, message: "Fees marked as clear" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Bulk Action Error:", error);
    await writeAuditLog({
      request,
      action: "student_bulk_update",
      recordType: "Student",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
