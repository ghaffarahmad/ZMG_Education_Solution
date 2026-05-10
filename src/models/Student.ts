import mongoose, { Schema, Document } from "mongoose";
import { calculateStudentFees, normalizeCnic } from "@/lib/studentRules";

export interface IStudent extends Document {
  studentName: string;
  fatherName: string;
  gender?: "male" | "female";
  cnicOrBform: string;
  dob: string;
  phone?: string;
  board?: string;
  program?: string;
  group?: string;
  session?: string;
  admissionDate?: Date;
  
  // Financial Fields
  totalProgramFee: number;
  admissionFee: number;
  monthlyFee: number;
  discountAmount: number;
  finalPayableFee: number;
  totalPaid: number;
  remainingBalance: number;
  
  feeStatus: "clear" | "pending" | "partial" | "overdue" | "blocked";
  paymentStatusNote?: string;
  lastPaymentDate?: Date;
  nextDueDate?: Date;
  isManuallyBlocked: boolean;
  manualBlockReason?: string;
  
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    studentName: { type: String, required: true },
    fatherName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"] },
    cnicOrBform: { type: String, required: true, unique: true },
    dob: { type: String, required: true },
    phone: { type: String },
    board: { type: String },
    program: { type: String },
    group: { type: String },
    session: { type: String },
    admissionDate: { type: Date },
    
    // Financial Fields
    totalProgramFee: { type: Number, default: 0, min: 0 },
    admissionFee: { type: Number, default: 0, min: 0 },
    monthlyFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalPayableFee: { type: Number, default: 0, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    remainingBalance: { type: Number, default: 0 },
    
    feeStatus: {
      type: String,
      enum: ["clear", "pending", "partial", "overdue", "blocked"],
      default: "pending",
    },
    paymentStatusNote: { type: String },
    lastPaymentDate: { type: Date },
    nextDueDate: { type: Date },
    isManuallyBlocked: { type: Boolean, default: false },
    manualBlockReason: { type: String },
    
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-calculate fields
StudentSchema.pre<IStudent>("save", async function () {
  this.cnicOrBform = normalizeCnic(this.cnicOrBform);

  const calculated = calculateStudentFees({
    totalProgramFee: this.totalProgramFee,
    discountAmount: this.discountAmount,
    totalPaid: this.totalPaid,
    nextDueDate: this.nextDueDate,
    isManuallyBlocked: this.isManuallyBlocked,
  });

  this.finalPayableFee = calculated.finalPayableFee;
  this.remainingBalance = calculated.remainingBalance;
  this.feeStatus = calculated.feeStatus;
});

// Index for fast search
StudentSchema.index({ cnicOrBform: 1, dob: 1 });

// Delete the existing model to prevent Next.js HMR caching issues
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

export default mongoose.model<IStudent>("Student", StudentSchema);
