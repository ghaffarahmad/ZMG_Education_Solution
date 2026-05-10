import mongoose, { Schema, Document } from "mongoose";

export interface IAcademicOption extends Document {
  type: "board" | "program" | "group";
  name: string;
  slug: string;
  boardId?: mongoose.Types.ObjectId | string | null;
  programId?: mongoose.Types.ObjectId | string | null;
  level?: string;
  year?: string;
  isCombined?: boolean;
  isActive: boolean;
  sortOrder: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicOptionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["board", "program", "group"],
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    boardId: { type: Schema.Types.ObjectId, ref: "AcademicOption", default: null },
    programId: { type: Schema.Types.ObjectId, ref: "AcademicOption", default: null },
    level: { type: String },
    year: { type: String },
    isCombined: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for fast querying
AcademicOptionSchema.index({ type: 1, isActive: 1, sortOrder: 1 });
AcademicOptionSchema.index({ slug: 1, type: 1 });

// Delete the existing model to prevent Next.js HMR caching issues
if (mongoose.models.AcademicOption) {
  delete mongoose.models.AcademicOption;
}

export default mongoose.model<IAcademicOption>("AcademicOption", AcademicOptionSchema);
