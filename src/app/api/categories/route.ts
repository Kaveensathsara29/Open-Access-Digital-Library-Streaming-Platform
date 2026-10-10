import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          coverImage: { $first: "$coverImage" },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]);

    return NextResponse.json({
      categories: categories.map((category) => ({
        name: category._id,
        count: category.count,
        coverImage: category.coverImage,
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}
