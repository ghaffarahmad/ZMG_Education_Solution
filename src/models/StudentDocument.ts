import mongoose, { Schema, Document } from "mongoose";

export interface IStudentDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  type: "enrollment_card" | "admit_card" | "other";
  title: string;
  fileName: string;
  fileKey: string; // Path or key in Oracle Object Storage or R2
  storageProvider?: "oracle" | "r2";
  mimeType: string;
  size: number;
  isPublished: boolean;
  downloadAllowed: boolean;
  lockReason?: string;
  uploadedAt: Date;
}

const StudentDocumentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    type: {
      type: String,
      enum: ["enrollment_card", "admit_card", "other"],
      required: true,
    },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true },
    storageProvider: { type: String, enum: ["oracle", "r2"], default: "oracle" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    downloadAllowed: { type: Boolean, default: false },
    lockReason: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.StudentDocument ||
  mongoose.model<IStudentDocument>("StudentDocument", StudentDocumentSchema);
