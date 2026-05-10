import mongoose, { Schema, Document } from "mongoose";
import { formatRupees, getFinalPayableFee, getSafeRemainingBalance, normalizeMoney } from "@/lib/feeMath";

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "easypaisa" | "jazzcash" | "cheque" | "other";
  receivedBy?: string; // Admin username or name
  receiptNo?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "easypaisa", "jazzcash", "cheque", "other"],
      required: true,
      default: "cash",
    },
    receivedBy: { type: String },
    receiptNo: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.pre<IPayment>("save", async function () {
  if (!this.isNew) return;

  const amount = normalizeMoney(this.amount);
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than 0.");
  }

  const Student = mongoose.model("Student");
  const student = await Student.findById(this.studentId).select("finalPayableFee totalProgramFee discountAmount totalPaid");
  if (!student) {
    throw new Error("Student not found");
  }

  const remainingBalance = getSafeRemainingBalance({
    finalPayableFee: student.finalPayableFee,
    totalProgramFee: student.totalProgramFee,
    discountAmount: student.discountAmount,
    totalPaid: student.totalPaid,
  });

  if (remainingBalance <= 0) {
    throw new Error("This student has no remaining balance.");
  }

  if (amount > remainingBalance) {
    throw new Error(`Payment cannot exceed remaining balance of ${formatRupees(remainingBalance)}.`);
  }

  this.amount = amount;
});

// Post-save middleware to update Student totalPaid
PaymentSchema.post<IPayment>("save", async function (doc) {
  try {
    const Student = mongoose.model("Student");
    const student = await Student.findById(doc.studentId);
    
    if (student) {
      // Recalculate total paid
      const payments = await mongoose.model("Payment").find({ studentId: doc.studentId });
      const newTotalPaid = payments.reduce((sum, p) => sum + normalizeMoney(p.amount), 0);
      const finalPayableFee = getFinalPayableFee(student);
      
      // Defensive guard for legacy/corrupt payment totals; API validation rejects overpayments before save.
      student.totalPaid = Math.min(newTotalPaid, finalPayableFee);
      student.lastPaymentDate = doc.paymentDate;
      
      // Note: pre-save middleware on Student will automatically recalculate remainingBalance and feeStatus
      await student.save();
    }
  } catch (error) {
    console.error("Error updating student totalPaid after payment:", error);
  }
});

// Also handle payment deletion
PaymentSchema.post("findOneAndDelete", async function (doc: IPayment | null) {
  if (!doc) return;
  try {
    const Student = mongoose.model("Student");
    const student = await Student.findById(doc.studentId);
    
    if (student) {
      const payments = await mongoose.model("Payment").find({ studentId: doc.studentId });
      const newTotalPaid = payments.reduce((sum, p) => sum + normalizeMoney(p.amount), 0);
      const finalPayableFee = getFinalPayableFee(student);
      
      student.totalPaid = Math.min(newTotalPaid, finalPayableFee);
      await student.save();
    }
  } catch (error) {
    console.error("Error updating student totalPaid after payment deletion:", error);
  }
});

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
