"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookOpen, RotateCw, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to sign in.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      console.error("Admin login request failed:", submitError);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Administrator access</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to manage the public library.</p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs dark:border-amber-800/60 dark:bg-amber-950/30">
            <p className="font-bold text-amber-900 dark:text-amber-300">Demo credentials</p>
            <dl className="mt-2 space-y-1.5 text-amber-900 dark:text-amber-200">
              <div className="flex flex-wrap gap-1">
                <dt className="font-semibold">Email:</dt>
                <dd className="select-all">admin@digitallibrary.com</dd>
              </div>
              <div className="flex flex-wrap gap-1">
                <dt className="font-semibold">Password:</dt>
                <dd className="select-all">Admin@12345</dd>
              </div>
            </dl>
          </div>
          {error && (
            <div role="alert" className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Admin email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </label>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading && <RotateCw className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>
        </div>
        <div className="text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Administrator session is stored in a secure HTTP-only cookie.</span>
        </div>
      </div>
    </div>
  );
}
