import { Metadata } from "next";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { BookOpen, Layers, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Categories & Topics | MASTER Books",
  description: "Explore all book categories, genres, and subjects available in our digital library.",
};

export default async function CategoriesPage() {
  await connectToDatabase();

  const categoriesData = await Book.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, cover: { $first: "$coverImage" } } },
    { $sort: { count: -1 } },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Layers className="w-3.5 h-3.5" />
          <span>Taxonomy & Fields</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Explore by Category
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
          From advanced technology and artificial intelligence to design systems, classical philosophy, and astrophysics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoriesData.map((cat) => (
          <Link
            key={cat._id}
            href={`/books?category=${encodeURIComponent(cat._id)}`}
            className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 group-hover:bg-amber-400 text-amber-600 dark:text-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {cat._id}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {cat.count} {cat.count === 1 ? "Book Available" : "Books Available"}
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Browse Topic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
