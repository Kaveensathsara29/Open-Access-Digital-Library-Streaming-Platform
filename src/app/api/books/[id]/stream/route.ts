import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { getFileBuffer } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await connectToDatabase();

    let book;
    if (mongoose.Types.ObjectId.isValid(id)) {
      book = await Book.findById(id);
    }
    if (!book) {
      book = await Book.findOne({ slug: id });
    }

    if (!book || !book.pdfUrl) {
      return NextResponse.json(
        { error: "Book or PDF URL not found." },
        { status: 404 }
      );
    }

    // Attempt to fetch the file buffer from storage
    const buffer = await getFileBuffer(book.pdfUrl);

    // If file buffer cannot be fetched from local/cloud storage
    if (!buffer) {
      return NextResponse.json(
        { error: "PDF file could not be retrieved from storage." },
        { status: 404 }
      );
    }

    // Increment read count asynchronously
    await Book.findByIdAndUpdate(book._id, { $inc: { readCount: 1 } }).exec();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="public-reader-stream-${Date.now()}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Access-Type": "public",
        "X-Watermark-User": "Public Reader",
      },
    });
  } catch (error) {
    console.error("PDF Streaming error:", error);
    return NextResponse.json(
      { error: "Failed to stream book." },
      { status: 500 }
    );
  }
}