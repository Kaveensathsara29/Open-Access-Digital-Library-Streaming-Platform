import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { PDFReader } from "@/components/PDFReader";
import { ArrowLeft, BookOpen } from "lucide-react";

interface ReaderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { id } = await params;
  await connectToDatabase();

  let book;
  if (mongoose.Types.ObjectId.isValid(id)) {
    book = await Book.findById(id).lean();
  }
  if (!book) {
    book = await Book.findOne({ slug: id }).lean();
  }

  if (!book) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookData: any = book;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between px-2">
        <Link
          href={`/books/${bookData.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Book Details</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline">Public In-Browser Reader</span>
        </div>
      </div>

      {/* PDF Reader Component */}
      <PDFReader
        bookId={bookData._id.toString()}
        bookTitle={bookData.title}
        author={bookData.author}
        totalBookPages={bookData.pageCount}
      />
    </div>
  );
}
