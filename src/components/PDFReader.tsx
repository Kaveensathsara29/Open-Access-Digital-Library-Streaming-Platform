"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Maximize2,
  Minimize2,
  Moon,
  RotateCw,
  ShieldCheck,
  Sun,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface PDFReaderProps {
  bookId: string;
  bookTitle: string;
  author: string;
  totalBookPages: number;
  initialPage?: number;
}

export function PDFReader({
  bookId,
  bookTitle,
  author,
  totalBookPages,
  initialPage = 1,
}: PDFReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(totalBookPages || 1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pdfjsLib = (window as any).pdfjsLib;
              if (pdfjsLib) {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                resolve();
              } else {
                reject(new Error("PDF.js failed to initialize."));
              }
            };
            script.onerror = () => reject(new Error("Failed to load the PDF reader."));
            document.head.appendChild(script);
          });
        }

        const response = await fetch(`/api/books/${bookId}/stream`);
        if (!response.ok) throw new Error("Unable to load this book.");

        const pdfData = await response.arrayBuffer();
        if (isCancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf = await (window as any).pdfjsLib.getDocument({ data: pdfData }).promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (error: unknown) {
        if (!isCancelled) {
          console.error("PDF load error:", error);
          setErrorMsg(error instanceof Error ? error.message : "Error loading this book.");
          setLoading(false);
        }
      }
    };

    void loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [bookId]);

  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (error) {
      console.error("Page render error:", error);
    }
  }, [scale]);

  useEffect(() => {
    if (!loading && pdfDocRef.current) void renderPage(currentPage);
  }, [currentPage, loading, renderPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) setCurrentPage(page);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const themeClasses = {
    light: "bg-slate-100 text-slate-900",
    sepia: "bg-[#fbf0d9] text-[#433422]",
    dark: "bg-[#0b0f19] text-slate-100",
  }[readingTheme];

  return (
    <div
      ref={containerRef}
      onContextMenu={(event) => event.preventDefault()}
      className={`relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden no-copy transition-colors ${themeClasses} ${
        isFullscreen ? "h-screen rounded-none border-none" : "min-h-187.5"
      }`}
    >
      <div className="w-full px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Reader</span>
          </div>
          <div className="hidden sm:block">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 max-w-60">
              {bookTitle}
            </h3>
            <p className="text-[11px] text-slate-400">by {author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous Page" className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>
          <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(event) => goToPage(Number.parseInt(event.target.value, 10) || 1)}
              className="w-12 text-center py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
            <span className="text-slate-400">/ {numPages}</span>
          </label>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= numPages} aria-label="Next Page" className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setScale((value) => Math.max(0.7, value - 0.15))} aria-label="Zoom out" className="p-1 text-slate-600 dark:text-slate-300">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold px-1 text-slate-600 dark:text-slate-300">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((value) => Math.min(2.2, value + 0.15))} aria-label="Zoom in" className="p-1 text-slate-600 dark:text-slate-300">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setReadingTheme("light")} aria-label="Light reading theme" className={`p-1.5 rounded-lg ${readingTheme === "light" ? "bg-white text-amber-600 shadow-xs" : "text-slate-400"}`}><Sun className="w-3.5 h-3.5" /></button>
            <button onClick={() => setReadingTheme("sepia")} aria-label="Sepia reading theme" className={`p-1.5 rounded-lg ${readingTheme === "sepia" ? "bg-[#fbf0d9] text-[#785b30] shadow-xs" : "text-slate-400"}`}><Coffee className="w-3.5 h-3.5" /></button>
            <button onClick={() => setReadingTheme("dark")} aria-label="Dark reading theme" className={`p-1.5 rounded-lg ${readingTheme === "dark" ? "bg-slate-900 text-amber-400 shadow-xs" : "text-slate-400"}`}><Moon className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto reader-viewport">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-amber-500">
            <RotateCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading book...</p>
          </div>
        )}
        {errorMsg && (
          <div className="max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-center space-y-4 shadow-xl">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">Unable to open book</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">{errorMsg}</p>
          </div>
        )}
        <div className={`relative shadow-2xl rounded-sm ${loading || errorMsg ? "hidden" : "block"}`}>
          <canvas ref={canvasRef} className="block max-w-full h-auto bg-white rounded-sm select-none pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
