import { Metadata } from "next";
import { BookManagementClient } from "./BookManagementClient";

export const metadata: Metadata = {
  title: "Book Catalog Management | MASTERBooks Admin",
  description: "Create, update, and manage books and audiobooks in the public library.",
};

export default function AdminBooksPage() {
  return <BookManagementClient />;
}
