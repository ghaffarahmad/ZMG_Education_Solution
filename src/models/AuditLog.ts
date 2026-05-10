import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  adminUser: string;
  action: string;
  recordType?: string;
  recordId?: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    adminUser: { type: String, required: true, default: "Unknown Admin" },
    action: { type: String, required: true },
    recordType: { type: String },
    recordId: { type: String },
    success: { type: Boolean, required: true },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ recordType: 1, recordId: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
