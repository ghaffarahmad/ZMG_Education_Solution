import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  studentId: mongoose.Types.ObjectId;
  title: string;
  type: "admit_card" | "enrollment_card" | "marksheet" | "fee_voucher" | "other";
  
  // Storage Fields
  storageProvider?: "oracle" | "r2";
  fileKey?: string; // Replaces oracleObjectName for R2
  fileName?: string; // Standardized fileName
  
  oracleObjectName?: string; // Legacy field
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  
  // Security & Access Flags
  isPublished: boolean;
  requiresFeeClearance: boolean;
  downloadAllowed: boolean; // Manual Admin Override to force allow
  
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["admit_card", "enrollment_card", "marksheet", "fee_voucher", "other"],
      required: true 
    },
    
    // Storage Fields
    storageProvider: { type: String, enum: ["oracle", "r2"], default: "oracle" },
    fileKey: { type: String }, // R2 object key
    fileName: { type: String }, // R2 safe name
    
    oracleObjectName: { type: String }, // Legacy
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    
    isPublished: { type: Boolean, default: false },
    requiresFeeClearance: { type: Boolean, default: false },
    downloadAllowed: { type: Boolean, default: false },
    
    uploadedBy: { type: String },
  },
  { timestamps: true }
);

// Index for faster student lookups
DocumentSchema.index({ studentId: 1, type: 1 });

export default mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
