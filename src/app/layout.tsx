import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "MASTERBooks | Public Digital Library",
    template: "%s | MASTERBooks",
  },
  description:
    "Explore digital literature, textbooks, and audiobooks in a public digital library with instant search and free online reading.",
  keywords: ["Digital Library", "e-Reader", "Online Books", "Audiobooks", "PDF Reader"],
  authors: [{ name: "MASTERBooks" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MASTERBooks Digital Library",
    title: "MASTERBooks | Public Digital Library",
    description:
      "Explore and read digital literature, textbooks, and audiobooks in our public digital library.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MASTERBooks | Public Digital Library",
    description:
      "Explore and read digital literature, textbooks, and audiobooks in our public digital library.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased selection:bg-amber-400 selection:text-slate-950">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

