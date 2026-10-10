"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface BookSuggestion {
  title: string;
  slug: string;
  author: string;
  category: string;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      setSuggestionsError(false);

      try {
        const params = new URLSearchParams({ search: query, limit: "6" });
        const response = await fetch(`/api/books?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Book suggestions request failed (${response.status})`);
        }

        const data: { books?: BookSuggestion[] } = await response.json();
        setSuggestions(Array.isArray(data.books) ? data.books : []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Book suggestions error:", error);
        setSuggestions([]);
        setSuggestionsError(true);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setSuggestions([]);
    setSuggestionsError(false);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setSearchFocused(false);
    }
  };

  const renderSuggestions = (listId: string) => {
    if (!searchFocused || searchQuery.trim().length < 2) return null;

    return (
      <div
        id={listId}
        role="list"
        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        {suggestionsLoading ? (
          <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Searching books...</p>
        ) : suggestionsError ? (
          <p className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
            Could not load book suggestions. Try submitting your search.
          </p>
        ) : suggestions.length > 0 ? (
          <>
            {suggestions.map((book) => (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSearchFocused(false)}
                className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-slate-800"
                role="listitem"
              >
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {book.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {book.author} · {book.category}
                </span>
              </Link>
            ))}
            <Link
              href={`/books?search=${encodeURIComponent(searchQuery.trim())}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setSearchFocused(false);
                setMobileMenuOpen(false);
              }}
              className="block bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:bg-slate-950 dark:text-amber-400 dark:hover:bg-slate-800"
            >
              View all search results
            </Link>
          </>
        ) : (
          <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
            No matching books found.
          </p>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                MASTER<span className="text-amber-500">Books</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-600 dark:text-amber-400">
                Digital Library
              </span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              suppressHydrationWarning
              type="text"
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search books"
              aria-autocomplete="list"
              aria-controls="navbar-book-suggestions-desktop"
              placeholder="Search books, authors, or topics..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:text-slate-100 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {renderSuggestions("navbar-book-suggestions-desktop")}
          </form>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/books" className="text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 transition-colors">
              Catalog
            </Link>
            <Link href="/categories" className="text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 transition-colors">
              Categories
            </Link>
            <Link
              href="/admin/login"
              className="px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-sm transition-colors"
            >
              Admin Login
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                suppressHydrationWarning
                type="text"
                value={searchQuery}
                onChange={(event) => updateSearchQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search books"
                aria-autocomplete="list"
                aria-controls="navbar-book-suggestions-mobile"
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {renderSuggestions("navbar-book-suggestions-mobile")}
            </form>
            <nav className="flex flex-col space-y-2 pt-2">
              <Link href="/books" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                Browse Books
              </Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                Categories
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-950"
              >
                Admin Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
