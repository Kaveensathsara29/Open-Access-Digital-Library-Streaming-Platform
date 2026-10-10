import { Metadata } from "next";
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { BookItem } from "@/components/BookCard";
import { BooksCatalogClient } from "./BooksCatalogClient";
import { Sparkles, RotateCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Book Catalog | MASTERBooks",
  description:
    "Search and filter our public catalog of technology, science, literature, and philosophy books, then read online without an account.",
  alternates: {
    canonical: "/books",
  },
};

interface BooksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const catalogKey = JSON.stringify(await searchParams);
  await connectToDatabase();

  const [initialBooks, categories, totalCount] = await Promise.all([
    Book.find().sort({ createdAt: -1 }).limit(12).lean(),
    Book.distinct("category"),
    Book.countDocuments(),
  ]);

  const serializedBooks: BookItem[] = JSON.parse(JSON.stringify(initialBooks));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Digital Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Browse Book Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Discover textbooks, technical guides, classical works, and audiobooks. Filter by topic, search keywords, or sort by popularity.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center gap-2 text-amber-500">
            <RotateCw className="w-8 h-8 animate-spin" />
            <span className="text-xs text-slate-500">Loading catalog...</span>
          </div>
        }
      >
        <BooksCatalogClient
          key={catalogKey}
          initialBooks={serializedBooks}
          categories={categories}
          totalCount={totalCount}
        />
      </Suspense>
    </div>
  );
}
