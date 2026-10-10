"use client";

import { useEffect, useState } from "react";
import { Activity, BookOpen, RotateCw, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CategoryStat {
  category: string;
  count: number;
}

interface TopBook {
  _id: string;
  title: string;
  author: string;
  readCount: number;
  viewsCount: number;
  slug: string;
  coverImage: string;
}

interface ActivityItem {
  _id: string;
  adminEmail: string;
  action: string;
  bookTitle?: string;
  details?: string;
  createdAt: string;
}

interface AnalyticsData {
  totalBooks: number;
  totalReads: number;
  totalViews: number;
  categoryDistribution: CategoryStat[];
  topBooks: TopBook[];
  recentActivity: ActivityItem[];
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (response.ok) {
          const json = await response.json();
          setData(json.analytics);
        } else {
          console.error("Failed to load analytics:", response.status);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-amber-500">
        <RotateCw className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading library analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500">Unable to load analytics data.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Total Books", value: data.totalBooks, icon: BookOpen },
    { label: "Total Views", value: data.totalViews, icon: Activity },
    { label: "Total Reads", value: data.totalReads, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Library Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Catalog performance, public readership, and administrator activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Books by Category</h2>
            <span className="text-xs text-slate-400">{data.categoryDistribution.length} Categories</span>
          </div>
          <div className="space-y-4">
            {data.categoryDistribution.map((item) => {
              const maxCount = Math.max(...data.categoryDistribution.map((category) => category.count), 1);
              const percent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{item.category}</span>
                    <span className="text-amber-600 dark:text-amber-400">{item.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Top Books</h2>
          <div className="space-y-3">
            {data.topBooks.map((book, index) => (
              <div key={book._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0">{index + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.coverImage} alt="" className="w-8 h-12 object-cover rounded-md shrink-0" />
                  <div className="min-w-0">
                    <Link href={`/books/${book.slug}`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-amber-600 line-clamp-1">{book.title}</Link>
                    <p className="text-[11px] text-slate-400">by {book.author}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">{book.readCount || 0} reads</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Administrator Activity Log</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.recentActivity.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No activity recorded yet.</p>
          ) : data.recentActivity.map((activity) => (
            <div key={activity._id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{activity.adminEmail}</span>{" "}
                <span className="text-slate-500 dark:text-slate-400">{activity.action.replaceAll("_", " ")}</span>
                {activity.bookTitle && <span className="font-semibold text-amber-600 dark:text-amber-400 ml-1">&ldquo;{activity.bookTitle}&rdquo;</span>}
                {activity.details && <p className="text-[11px] text-slate-400 mt-1">{activity.details}</p>}
              </div>
              <time className="text-[10px] text-slate-400 shrink-0">{new Date(activity.createdAt).toLocaleString()}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
