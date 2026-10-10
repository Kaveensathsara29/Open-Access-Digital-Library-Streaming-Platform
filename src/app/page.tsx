import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { BookCard, BookItem } from "@/components/BookCard";
import {
  BookOpen,
  Headphones,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    await connectToDatabase();
    const [featuredBooks, recentBooks, categories] = await Promise.all([
      Book.find({ isFeatured: true }).limit(4).lean(),
      Book.find().sort({ createdAt: -1 }).limit(8).lean(),
      Book.distinct("category"),
    ]);

    const serialize = (items: unknown[]): BookItem[] =>
      JSON.parse(JSON.stringify(items)) as BookItem[];

    return {
      featuredBooks: serialize(featuredBooks),
      recentBooks: serialize(recentBooks),
      categories,
    };
  } catch (err) {
    console.error("Home data fetch error:", err);
    return { featuredBooks: [], recentBooks: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featuredBooks, recentBooks, categories } = await getHomeData();

  return (
    <div className="flex flex-col space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-linear-to-b from-amber-500/10 via-amber-400/5 to-transparent border-b border-amber-200/50 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Digital Library</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15]">
              Read, Listen & Learn with{" "}
              <span className="relative inline-block text-amber-500">
                MASTERBooks
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-amber-400/50 -z-10"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path d="M0,8 Q50,0 100,8" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Browse a public digital library and read books online. Discover books, explore topics, and listen to available audiobooks.
            </p>

            {/* Quick Hero Search */}
            <div className="pt-2 max-w-xl mx-auto">
              <form action="/books" method="GET" className="relative flex items-center">
                <input
                  suppressHydrationWarning
                  type="text"
                  name="search"
                  placeholder="Search thousands of books, authors, or subjects..."
                  className="w-full pl-12 pr-32 py-4 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-300/80 dark:border-amber-500/30 text-sm shadow-xl shadow-amber-500/10 focus:outline-none focus:border-amber-400 text-slate-800 dark:text-slate-100"
                />
                <Search className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  suppressHydrationWarning
                  type="submit"
                  className="absolute right-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Search
                </button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/books"
                className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Hand-Picked Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
                Featured Volumes
              </h2>
            </div>
            <Link
              href="/books?featured=true"
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View all featured
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Core Architectural Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Built For Enterprise Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Reader & Content Management Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every detail is engineered for high performance, intuitive UX, and uncompromising asset protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Public In-Browser Reader
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Read available books directly in your browser without an account or registration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Free Public Reading
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Open books in the browser immediately. No registration, profile, or personal data is required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                <Headphones className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Audiobook Narration Player
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Integrated audio playback with custom speeds (0.75x–2.0x), timeline scrubber, quick 15-second skipping, and background listening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                Explore by Field
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Curated collections across diverse domains
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/books?category=${encodeURIComponent(cat)}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-md text-center space-y-2 transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 block line-clamp-1">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
              <span>Catalog Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
              Latest Additions
            </h2>
          </div>
          <Link
            href="/books"
            className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Explore all {recentBooks.length} books
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recentBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-yellow-400 p-8 sm:p-12 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Expand Your Reading World?
            </h3>
            <p className="text-sm font-medium text-slate-900/80 leading-relaxed">
              Browse and read the public library instantly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/books"
              className="px-6 py-3 rounded-full bg-white/30 hover:bg-white/40 text-slate-950 font-bold text-sm backdrop-blur-xs transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
