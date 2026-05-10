import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDownloadLog extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  status: "success" | "failed";
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const DownloadLogSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    reason: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } // Only need createdAt for logs
  }
);

DownloadLogSchema.index({ studentId: 1, createdAt: -1 });
DownloadLogSchema.index({ documentId: 1, createdAt: -1 });

export default mongoose.models.DownloadLog || mongoose.model<IDownloadLog>("DownloadLog", DownloadLogSchema);
