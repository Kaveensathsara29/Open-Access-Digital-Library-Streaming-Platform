import Link from "next/link";
import { BookOpen, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                MASTER<span className="text-amber-500">Books</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A public digital library for discovering and reading books online, with audiobook streaming and a simple in-browser reader.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Public browser-based reading</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/books" className="hover:text-amber-500 transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-amber-500 transition-colors">
                  Topic Categories
                </Link>
              </li>
              <li>
                <Link href="/books?featured=true" className="hover:text-amber-500 transition-colors">
                  Featured Volumes
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Popular Topics
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/books?category=Technology" className="hover:text-amber-500 transition-colors">
                  Computer Science & Tech
                </Link>
              </li>
              <li>
                <Link href="/books?category=Design" className="hover:text-amber-500 transition-colors">
                  Design & UX Architecture
                </Link>
              </li>
              <li>
                <Link href="/books?category=Science" className="hover:text-amber-500 transition-colors">
                  Physics & Cosmology
                </Link>
              </li>
              <li>
                <Link href="/books?category=Philosophy" className="hover:text-amber-500 transition-colors">
                  Philosophy & Mindset
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} MASTERaBooks Digital Library System. All rights reserved.</p><br />
          
        </div>
        <p className="text-xs flex justify-center text-amber-500">Developed By KAVEEN SATHSARA</p>
      </div>
    </footer>
  );
}
