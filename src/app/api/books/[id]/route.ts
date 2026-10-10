import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { getAdminSession } from "@/lib/jwt";
import { ActivityLog } from "@/models/ActivityLog";

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

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    await Book.findByIdAndUpdate(book._id, { $inc: { viewsCount: 1 } }).exec();

    return NextResponse.json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        ...body,
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : undefined),
      },
      { new: true }
    );

    if (!updatedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await ActivityLog.create({
      action: "update_book",
      adminEmail: session.email,
      bookId: updatedBook._id,
      bookTitle: updatedBook.title,
      details: "Updated a book.",
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    revalidatePath("/", "page");
    revalidatePath("/books", "page");
    revalidatePath("/categories", "page");

    await ActivityLog.create({
      action: "delete_book",
      adminEmail: session.email,
      bookId: deletedBook._id,
      bookTitle: deletedBook.title,
      details: "Deleted a book.",
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
