import mongoose, { Schema, Document } from "mongoose";

export interface IStudentEnrollment extends Document {
  studentId: mongoose.Types.ObjectId | string;
  board?: string;
  program?: string;
  group?: string;
  session?: string;
  academicStatus: "active" | "completed" | "promoted" | "closed";
  startDate?: Date;
  endDate?: Date;
  promotedToEnrollmentId?: mongoose.Types.ObjectId | string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentEnrollmentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    board: { type: String },
    program: { type: String },
    group: { type: String },
    session: { type: String },
    academicStatus: {
      type: String,
      enum: ["active", "completed", "promoted", "closed"],
      default: "active",
      required: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    promotedToEnrollmentId: { type: Schema.Types.ObjectId, ref: "StudentEnrollment", default: null },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes
StudentEnrollmentSchema.index({ studentId: 1, academicStatus: 1 });
StudentEnrollmentSchema.index({ studentId: 1, createdAt: -1 });

if (mongoose.models.StudentEnrollment) {
  delete mongoose.models.StudentEnrollment;
}

export default mongoose.model<IStudentEnrollment>("StudentEnrollment", StudentEnrollmentSchema);
