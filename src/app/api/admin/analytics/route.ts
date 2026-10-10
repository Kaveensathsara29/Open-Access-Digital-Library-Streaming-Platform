import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { ActivityLog } from "@/models/ActivityLog";
import { getAdminSession } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1. Admin Verification
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 2. Optimized Parallel Queries
    const [
      totalBooks,
      categoryDistribution,
      statsAggregation,
      topBooks,
      recentActivity,
    ] = await Promise.all([
      // A. Total Books Count
      Book.countDocuments(),

      // B. Category Distribution
      Book.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // C. Total Views & Reads Aggregation (Memory Efficient)
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalReads: { $sum: "$readCount" },
            totalViews: { $sum: "$viewsCount" },
          },
        },
      ]),

      // D. Top 5 Most Popular Books
      Book.find()
        .select("title author coverImage readCount viewsCount category")
        .sort({ readCount: -1, viewsCount: -1 })
        .limit(5)
        .lean(),

      // E. Latest 10 Admin/System Activity Logs
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Extract total reads and views safely
    const totalReads = statsAggregation[0]?.totalReads || 0;
    const totalViews = statsAggregation[0]?.totalViews || 0;

    // 3. Format Response
    return NextResponse.json({
      analytics: {
        totalBooks,
        totalReads,
        totalViews,
        categoryDistribution: categoryDistribution.map((c) => ({
          category: c._id || "Uncategorized",
          count: c.count,
        })),
        topBooks,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}