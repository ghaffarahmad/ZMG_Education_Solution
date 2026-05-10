import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullContent: string;
  category: "admission" | "admit_card" | "enrollment" | "fee" | "board_update" | "aiou" | "general";
  priority: "normal" | "important" | "urgent";
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  status: "draft" | "published";
  startDate?: Date;
  expiryDate?: Date;
  pinToTop: boolean;
  showInTicker: boolean;
  showOnHomepage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    fullContent: { type: String, required: true },
    category: {
      type: String,
      enum: ["admission", "admit_card", "enrollment", "fee", "board_update", "aiou", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },
    imageUrl: { type: String },
    linkUrl: { type: String },
    linkLabel: { type: String },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    startDate: { type: Date },
    expiryDate: { type: Date },
    pinToTop: { type: Boolean, default: false },
    showInTicker: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
