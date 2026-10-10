import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { getAdminSession } from "@/lib/jwt";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const language = searchParams.get("language") || "";
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "latest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10));

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (language && language !== "All") {
      filter.language = language;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "popular") sortOptions = { readCount: -1, viewsCount: -1 };
    else if (sortBy === "title") sortOptions = { title: 1 };
    else if (sortBy === "oldest") sortOptions = { createdAt: 1 };

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      author,
      description,
      category,
      coverImage,
      pdfUrl,
      audioUrl,
      tags,
      language,
      pageCount,
      publishedYear,
      isbn,
      publisher,
      isFeatured,
      samplePreviewPages,
    } = body;

    if (!title || !author || !description || !category || !coverImage || !pdfUrl) {
      return NextResponse.json(
        { error: "Missing required fields (title, author, description, category, coverImage, pdfUrl)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Book.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newBook = await Book.create({
      title,
      slug,
      author,
      description,
      category,
      coverImage,
      pdfUrl,
      audioUrl: audioUrl || "",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()) : []),
      language: language || "en",
      pageCount: Number(pageCount) || 100,
      publishedYear: Number(publishedYear) || new Date().getFullYear(),
      isbn: isbn || "",
      publisher: publisher || "Digital Library Press",
      isFeatured: !!isFeatured,
      samplePreviewPages: Number(samplePreviewPages) || 5,
    });

    await ActivityLog.create({
      action: "create_book",
      adminEmail: session.email,
      bookId: newBook._id,
      bookTitle: newBook.title,
      details: "Created a book.",
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}
