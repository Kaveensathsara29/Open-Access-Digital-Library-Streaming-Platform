"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative p-2 rounded-xl text-slate-700 dark:text-amber-400 bg-amber-50/80 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-amber-200/80 dark:border-slate-700 transition-all duration-200 shadow-sm"
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
    </button>
  );
}
