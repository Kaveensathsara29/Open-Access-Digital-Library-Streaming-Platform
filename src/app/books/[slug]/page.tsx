import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { SocialShare } from "@/components/SocialShare";
import { AudioPlayer } from "@/components/AudioPlayer";
import {
  BookOpen,
  Calendar,
  Layers,
  Globe,
  Tag,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBookDetails(slug: string) {
  await connectToDatabase();
  const book = await Book.findOne({ slug }).lean();
  if (!book) return null;

  return JSON.parse(JSON.stringify(book));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBookDetails(slug);
  if (!data) {
    return { title: "Book Not Found | MASTERBooks" };
  }

  const book = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/books/${book.slug}`;

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description.substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-US": `${canonicalUrl}?lang=en`,
        "es-ES": `${canonicalUrl}?lang=es`,
        "fr-FR": `${canonicalUrl}?lang=fr`,
      },
    },
    openGraph: {
      title: `${book.title}`,
      description: book.description.substring(0, 160),
      url: canonicalUrl,
      type: "book",
      images: [
        {
          url: book.coverImage,
          width: 800,
          height: 1200,
          alt: book.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title}`,
      description: book.description.substring(0, 160),
      images: [book.coverImage],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBookDetails(slug);

  if (!data) {
    notFound();
  }

  const book = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pageUrl = `${baseUrl}/books/${book.slug}`;

  // Structured Data (Schema.org/Book)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: {
      "@type": "Person",
      name: book.author,
    },
    image: book.coverImage,
    description: book.description,
    inLanguage: book.language || "en",
    numberOfPages: book.pageCount,
    datePublished: book.publishedYear?.toString(),
    isbn: book.isbn || undefined,
    publisher: {
      "@type": "Organization",
      name: book.publisher || "Digital Library Press",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
      {/* Schema.org/Book JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Book Overview Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Book Cover & Quick Action Buttons */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-4 sm:space-y-5">
          <div className="relative w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group mx-auto lg:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {book.isFeatured && (
              <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                Featured Edition
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Read Online</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] space-y-3 mx-auto lg:mx-0">
            <Link
              href={`/reader/${book._id}`}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Read in Online Reader</span>
            </Link>
          </div>

          {/* Social Media Sharing */}
          <div className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] pt-1 mx-auto lg:mx-0">
            <SocialShare title={book.title} url={pageUrl} />
          </div>
        </div>

        {/* Right Column: Metadata, Description & Reader Features */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                {book.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Published {book.publishedYear} • {book.publisher}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              {book.title}
            </h1>

            <p className="text-sm sm:text-lg font-medium text-slate-600 dark:text-slate-300">
              by <span className="text-amber-600 dark:text-amber-400 font-bold">{book.author}</span>
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {book.viewsCount || 0} catalog views
              </span>
            </div>
          </div>

          {/* Quick Specifications Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-3 sm:py-4 border-y border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Layers className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Pages</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{book.pageCount} Pages</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Language</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase truncate">
                  {book.language || "English"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Year</span>
                <span className="font-bold text-slate-900 dark:text-white">{book.publishedYear}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Format</span>
                <span className="font-bold text-slate-900 dark:text-white">PDF Reader</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Overview & Synopsis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
              <Tag className="w-3.5 h-3.5 text-amber-500 mr-1 shrink-0" />
              {book.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/books?search=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-amber-100 hover:text-amber-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Audiobook Player Section */}
          {book.audioUrl && (
            <div className="pt-3 sm:pt-4 space-y-2">
              <AudioPlayer
                audioUrl={book.audioUrl}
                bookTitle={book.title}
                author={book.author}
                coverImage={book.coverImage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Public reader information */}
      <div className="p-5 sm:p-8 rounded-3xl bg-amber-50/60 dark:bg-slate-900/60 border border-amber-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Interactive e-Reader Ready</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Read Online Without an Account
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Open the book in your browser and start reading immediately. No sign-in or account is required.
          </p>
        </div>
        <Link
          href={`/reader/${book._id}`}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 whitespace-nowrap flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <span>Open e-Reader</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
