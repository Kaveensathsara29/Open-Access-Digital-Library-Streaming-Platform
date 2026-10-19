"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, BookCopy, HardDrive, LogOut, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return children;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </div>
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white">Library Console</h2>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link href="/admin" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Analytics & Activity</span>
            </Link>
            <Link href="/admin/books" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800">
              <BookCopy className="w-4 h-4 text-amber-500" />
              <span>Book Management</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Files are stored in Cloud</span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Library</span>
          </Link>
          <button suppressHydrationWarning onClick={logout} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
