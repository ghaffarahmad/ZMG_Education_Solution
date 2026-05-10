import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  phone: string;
  programInterest?: string;
  board?: string;
  message: string;
  status: "new" | "contacted" | "closed";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    programInterest: { type: String },
    board: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
