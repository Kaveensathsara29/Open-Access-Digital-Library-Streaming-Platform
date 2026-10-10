"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";

interface FilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  featuredOnly: boolean;
  onFeaturedChange: (featured: boolean) => void;
  onReset: () => void;
}

export function AdvancedSearchFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
  featuredOnly,
  onFeaturedChange,
  onReset,
}: FilterProps) {
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== "All") ||
    (selectedLanguage && selectedLanguage !== "All") ||
    featuredOnly ||
    sortBy !== "latest";

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 transition-colors">
      {/* Top Search Input & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            suppressHydrationWarning
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by book title, author, keyword, or ISBN..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm dark:text-white transition-all placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              suppressHydrationWarning
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <select
            suppressHydrationWarning
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="popular">Most Popular</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <button
            suppressHydrationWarning
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Pills (Desktop & Expandable Mobile) */}
      <div className={`space-y-4 ${showFiltersMobile ? "block" : "hidden sm:block"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Category:
          </span>
          {["All", ...categories].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                suppressHydrationWarning
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Language & Featured */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Language filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Language:</span>
              <select
                suppressHydrationWarning
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="All">All Languages</option>
                <option value="en">English (EN)</option>
                <option value="en">SINHALA (SL)</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
              </select>
            </div>

            {/* Featured Only Toggle */}
            <button
              suppressHydrationWarning
              onClick={() => onFeaturedChange(!featuredOnly)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                featuredOnly
                  ? "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold"
                  : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Featured Only</span>
            </button>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              suppressHydrationWarning
              onClick={onReset}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
