import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-0 `z-[100]` flex min-h-screen items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-slate-950/95"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500 dark:border-slate-800 dark:border-t-amber-400" />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/25">
            <BookOpen className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
            MASTER<span className="text-amber-500">Books</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Preparing your library...</p>
          <div className="flex justify-center gap-1.5 pt-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}




