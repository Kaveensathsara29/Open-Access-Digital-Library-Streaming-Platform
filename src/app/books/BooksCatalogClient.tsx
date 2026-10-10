"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookCard, BookItem } from "@/components/BookCard";
import { AdvancedSearchFilter } from "@/components/AdvancedSearchFilter";
import { BookOpen, RotateCw } from "lucide-react";

interface BooksCatalogClientProps {
  initialBooks: BookItem[];
  categories: string[];
  totalCount: number;
}

interface BooksCatalogResponse {
  books: BookItem[];
  pagination: { total: number };
}

function isBookItem(value: unknown): value is BookItem {
  if (!value || typeof value !== "object") return false;

  const book = value as Record<string, unknown>;
  return (
    typeof book._id === "string" &&
    typeof book.title === "string" &&
    typeof book.slug === "string" &&
    typeof book.author === "string" &&
    typeof book.description === "string" &&
    typeof book.coverImage === "string" &&
    typeof book.category === "string" &&
    typeof book.pageCount === "number" &&
    typeof book.publishedYear === "number"
  );
}

function isBooksCatalogResponse(value: unknown): value is BooksCatalogResponse {
  if (!value || typeof value !== "object") return false;

  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.books) || !response.books.every(isBookItem)) {
    return false;
  }

  const pagination = response.pagination;
  return (
    !!pagination &&
    typeof pagination === "object" &&
    typeof (pagination as Record<string, unknown>).total === "number"
  );
}

export function BooksCatalogClient({
  initialBooks,
  categories,
  totalCount: initialTotal,
}: BooksCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Filter States initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "latest");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");
  const [page, setPage] = useState(1);

  const fetchFilteredBooks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedLanguage && selectedLanguage !== "All") params.set("language", selectedLanguage);
      if (sortBy) params.set("sortBy", sortBy);
      if (featuredOnly) params.set("featured", "true");
      params.set("page", page.toString());
      params.set("limit", "12");

      const cacheKey = `masterbooks:catalog:${params.toString()}`;
      try {
        const cachedCatalog = localStorage.getItem(cacheKey);
        if (cachedCatalog) {
          const cachedData: unknown = JSON.parse(cachedCatalog);
          if (isBooksCatalogResponse(cachedData)) {
            setBooks(cachedData.books);
            setTotalCount(cachedData.pagination.total);
          } else {
            localStorage.removeItem(cacheKey);
            console.warn("Ignoring invalid cached book catalog.");
          }
        }
      } catch (err) {
        console.error("Unable to read cached book catalog:", err);
      }

      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Book catalog request failed with status ${res.status}`);
      }

      const data: unknown = await res.json();
      if (!isBooksCatalogResponse(data)) {
        throw new Error("Book catalog response has an invalid format");
      }

      setBooks(data.books);
      setTotalCount(data.pagination.total);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        console.error("Unable to cache book catalog:", err);
      }
    } catch (err) {
      console.error("Filter fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLanguage, sortBy, featuredOnly, page]);

  useEffect(() => {
    // The request updates results only after asynchronous work has completed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFilteredBooks();
  }, [fetchFilteredBooks]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLanguage("All");
    setSortBy("latest");
    setFeaturedOnly(false);
    setPage(1);
    router.push("/books");
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <AdvancedSearchFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setLoading(true);
          setSelectedCategory(cat);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setLoading(true);
          setSearchQuery(q);
          setPage(1);
        }}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(lang) => {
          setLoading(true);
          setSelectedLanguage(lang);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setLoading(true);
          setSortBy(sort);
          setPage(1);
        }}
        featuredOnly={featuredOnly}
        onFeaturedChange={(feat) => {
          setLoading(true);
          setFeaturedOnly(feat);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{books.length}</strong> of{" "}
          <strong className="text-slate-900 dark:text-white">{totalCount}</strong> books
        </span>
        {loading && (
          <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            Updating results...
          </span>
        )}
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Books Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any books matching your specific search or filter criteria. Try clearing filters or searching another keyword.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 12 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-amber-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            Previous
          </button>
          <span className="text-xs font-semibold px-3 py-2 text-slate-500">
            Page {page} of {Math.ceil(totalCount / 12)}
          </span>
          <button
            onClick={() => setPage((p) => (p * 12 < totalCount ? p + 1 : p))}
            disabled={page * 12 >= totalCount}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-amber-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
