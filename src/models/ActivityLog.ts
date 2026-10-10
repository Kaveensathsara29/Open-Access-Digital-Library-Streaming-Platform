import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: string;
  adminEmail: string;
  bookId?: mongoose.Types.ObjectId;
  bookTitle?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    adminEmail: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book" },
    bookTitle: { type: String, default: "" },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);