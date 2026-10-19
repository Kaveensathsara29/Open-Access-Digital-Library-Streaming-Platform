"use client";

import { useEffect, useState } from "react";
import {
  BookCopy,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  RotateCw,
  X,
  Check,
  AlertCircle,
  Cloud,
} from "lucide-react";

interface AdminBookItem {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
  audioUrl?: string;
  category: string;
  tags: string[];
  language: string;
  pageCount: number;
  publishedYear: number;
  isbn?: string;
  publisher?: string;
  isFeatured: boolean;
  samplePreviewPages: number;
  viewsCount: number;
  readCount: number;
}

export function BookManagementClient() {
  const [books, setBooks] = useState<AdminBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<AdminBookItem | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("en");
  const [pageCount, setPageCount] = useState(100);
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("Digital Library Press");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [samplePreviewPages, setSamplePreviewPages] = useState(5);

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books?limit=100");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request updates loading only after asynchronous work has completed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchBooks();
  }, []);

  const openCreateModal = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setDescription("");
    setCategory("Technology");
    setTags("");
    setLanguage("en");
    setPageCount(250);
    setPublishedYear(new Date().getFullYear());
    setIsbn("");
    setPublisher("Digital Library Press");
    setCoverImage("");
    setPdfUrl("");
    setAudioUrl("");
    setIsFeatured(false);
    setSamplePreviewPages(5);
    setErrorMsg("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const openEditModal = (book: AdminBookItem) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description);
    setCategory(book.category);
    setTags(book.tags ? book.tags.join(", ") : "");
    setLanguage(book.language || "en");
    setPageCount(book.pageCount);
    setPublishedYear(book.publishedYear);
    setIsbn(book.isbn || "");
    setPublisher(book.publisher || "");
    setCoverImage(book.coverImage);
    setPdfUrl(book.pdfUrl);
    setAudioUrl(book.audioUrl || "");
    setIsFeatured(book.isFeatured);
    setSamplePreviewPages(book.samplePreviewPages || 5);
    setErrorMsg("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "cover" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "pdf") setUploadingPdf(true);
    else if (type === "cover") setUploadingCover(true);
    else setUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail ? `${data.error} — ${data.detail}` : (data.error || "File upload failed.");
        setErrorMsg(msg);
      } else {
        if (type === "pdf") {
          setPdfUrl(data.url);
          setSuccessMsg("PDF uploaded successfully to Google Drive.");
        } else if (type === "cover") {
          setCoverImage(data.url);
          setSuccessMsg("Cover image uploaded successfully to Google Drive.");
        } else {
          setAudioUrl(data.url);
          setSuccessMsg("Audiobook uploaded successfully to Google Drive.");
        }
      }
    } catch {
      setErrorMsg("Network error uploading file.");
    } finally {
      if (type === "pdf") setUploadingPdf(false);
      else if (type === "cover") setUploadingCover(false);
      else setUploadingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      title,
      author,
      description,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      language,
      pageCount: Number(pageCount),
      publishedYear: Number(publishedYear),
      isbn,
      publisher,
      coverImage,
      pdfUrl,
      audioUrl,
      isFeatured,
      samplePreviewPages: Number(samplePreviewPages),
    };

    try {
      const url = editingBook ? `/api/books/${editingBook._id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save book.");
      } else {
        setSuccessMsg(editingBook ? "Book updated!" : "Book created successfully!");
        fetchBooks();
        setTimeout(() => setModalOpen(false), 1200);
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${bookTitle}"?`)) return;

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b._id !== bookId));
      } else {
        alert("Failed to delete book.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(books.map((b) => b.category)));

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Book Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Add books, update metadata, and upload PDFs, covers, or audio for the public catalog.
          </p>
        </div>

        <button
          suppressHydrationWarning
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 `stroke-[3]`" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by title or author..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          suppressHydrationWarning
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-amber-500">
            <RotateCw className="w-6 h-6 animate-spin" />
            <span className="text-xs text-slate-500">Loading catalog...</span>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No books found matching search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pages</th>
                  <th className="py-3.5 px-4">Sample Limit</th>
                  <th className="py-3.5 px-4">Reads / Views</th>
                  <th className="py-3.5 px-4">Audio</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBooks.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-9 h-13 object-cover rounded-md shadow-xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {b.title}
                            </span>
                            {b.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-950 font-bold text-[9px] uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">by {b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {b.category}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{b.pageCount} pgs</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">
                      {b.samplePreviewPages || 5} pgs
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="font-bold">{b.readCount || 0}</span> reads /{" "}
                      <span>{b.viewsCount || 0}</span> views
                    </td>
                    <td className="py-3 px-4">
                      {b.audioUrl ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          title="Edit Book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.title)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookCopy className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {editingBook ? "Edit Book Metadata" : "Add New Book to Library"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Clean Code & Architecture"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Robert C. Martin"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description / Synopsis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed synopsis of the book contents..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Technology"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Pages *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Guest Sample Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={samplePreviewPages}
                    onChange={(e) => setSamplePreviewPages(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* PDF File Upload or URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-amber-500" />
                    <span>PDF URL / Google Drive *</span>
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingPdf ? "Uploading..." : "Upload PDF"}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "pdf")}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://... or upload a PDF"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>

              {/* Cover Image URL or Upload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cover Image URL *
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingCover ? "Uploading..." : "Upload Cover"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "cover")}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              {/* Optional Audiobook URL or Upload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Audiobook URL / Google Drive (Optional)
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingAudio ? "Uploading..." : "Upload Audio"}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, "audio")}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://... or upload an audio file"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              {/* Tags, Language & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Engineering, Design, React"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="en"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Year Published
                  </label>
                  <input
                    type="number"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(parseInt(e.target.value, 10) || 2024)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheckbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-amber-500"
                />
                <label
                  htmlFor="featuredCheckbox"
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Feature this volume on the Homepage
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingBook ? "Update Book" : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
