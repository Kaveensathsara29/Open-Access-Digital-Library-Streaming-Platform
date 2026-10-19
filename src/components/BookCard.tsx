import Link from "next/link";
import { BookOpen, Headphones } from "lucide-react";

export interface BookItem {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  tags?: string[];
  language?: string;
  pageCount: number;
  publishedYear: number;
  audioUrl?: string;
  isFeatured?: boolean;
  samplePreviewPages?: number;
}

interface BookCardProps {
  book: BookItem;
  /** When true, renders a compact 3-column-friendly card (small image, minimal metadata) */
  compact?: boolean;
}

export function BookCard({ book, compact = false }: BookCardProps) {
  if (compact) {
    /* Explicit compact mode */
    return (
      <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all duration-300">
        <Link
          href={`/books/${book.slug}`}
          className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {book.isFeatured && (
            <div className="absolute top-1 left-1 bg-amber-400 text-slate-950 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm uppercase">
              ★
            </div>
          )}
          {book.audioUrl && (
            <div className="absolute top-1 right-1 bg-slate-950/80 text-amber-400 text-[8px] p-1 rounded-full shadow-sm">
              <Headphones className="w-2.5 h-2.5" />
            </div>
          )}
        </Link>
        <div className="p-1.5 sm:p-2 flex flex-col gap-0.5 flex-1 justify-between">
          <div>
            <Link href={`/books/${book.slug}`}>
              <h3 className="font-bold text-[10px] sm:text-[11px] leading-tight text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {book.author}
            </p>
          </div>
          <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-0.5">
              <BookOpen className="w-2.5 h-2.5 text-amber-500" />
              {book.pageCount}p
            </span>
            <Link
              href={`/books/${book.slug}`}
              className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-400 text-amber-700 hover:text-slate-950 dark:bg-amber-950/40 dark:hover:bg-amber-400 dark:text-amber-300 dark:hover:text-slate-950 transition-all"
            >
              Read
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Default Responsive Card (ultra-compact on mobile 3-col grids, full rich card on sm+ desktop) */
  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all duration-300">
      {/* Cover Image Container */}
      <Link href={`/books/${book.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {book.isFeatured && (
          <div className="absolute top-1 sm:top-3 left-1 sm:left-3 bg-amber-400 text-slate-950 text-[8px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider">
            <span className="sm:hidden">★</span>
            <span className="hidden sm:inline">Featured</span>
          </div>
        )}

        {/* Audiobook Tag */}
        {book.audioUrl && (
          <div className="absolute top-1 sm:top-3 right-1 sm:right-3 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[8px] sm:text-[11px] font-semibold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-0.5 sm:gap-1 border border-amber-400/30">
            <Headphones className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Audio</span>
          </div>
        )}

        {/* Category Pill (hidden on small screens to keep image clean) */}
        <div className="hidden sm:block absolute bottom-3 left-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm border border-white/20">
          {book.category}
        </div>
      </Link>

      {/* Book Metadata Content */}
      <div className="p-2 sm:p-5 flex-1 flex flex-col justify-between space-y-1 sm:space-y-4">
        <div>
          <div className="hidden sm:flex items-center justify-end gap-2 mb-1.5">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              {book.language?.toUpperCase() || "EN"}
            </span>
          </div>

          <Link href={`/books/${book.slug}`}>
            <h3 className="font-bold text-[11px] sm:text-base leading-tight sm:leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
            by {book.author}
          </p>
        </div>

        {/* Description (desktop only) */}
        <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {book.description}
        </p>

        {/* Card Footer */}
        <div className="pt-1.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] sm:text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5 sm:gap-1">
            <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-500" />
            <span>{book.pageCount}</span>
            <span className="hidden sm:inline">pages</span>
            <span className="sm:hidden">p</span>
          </span>

          <Link
            href={`/books/${book.slug}`}
            className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-amber-50 hover:bg-amber-400 text-amber-700 hover:text-slate-950 dark:bg-amber-950/40 dark:hover:bg-amber-400 dark:text-amber-300 dark:hover:text-slate-950 font-semibold transition-all duration-200"
          >
            <span className="hidden sm:inline">Details &amp; Read</span>
            <span className="sm:hidden">Read</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
