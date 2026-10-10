import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
  audioUrl?: string;
  category: string;
  tags: string[];
  language: string;
  pageCount: number;
  publishedYear: number;
  isbn?: string;
  publisher?: string;
  isFeatured: boolean;
  viewsCount: number;
  readCount: number;
  samplePreviewPages: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    audioUrl: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    language: { type: String, default: "en" },
    pageCount: { type: Number, required: true, default: 1 },
    publishedYear: { type: Number, default: new Date().getFullYear() },
    isbn: { type: String, default: "" },
    publisher: { type: String, default: "Digital Library Press" },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    samplePreviewPages: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
