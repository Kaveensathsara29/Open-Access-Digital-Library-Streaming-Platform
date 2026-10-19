import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/jwt";
import { uploadFile, isSupportedStorageContentType } from "@/lib/storage";

// Next.js must NOT parse the body — we do it ourselves via formData()
export const dynamic = "force-dynamic";

/** Maximum accepted file size: 100 MB */
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required." },
      { status: 403 }
    );
  }

  // ── Parse multipart form data ──────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Include a 'file' field in the form data." },
      { status: 400 }
    );
  }

  // ── File size check ────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "File too large.",
        detail: `Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
      },
      { status: 413 }
    );
  }

  // ── MIME type validation ───────────────────────────────────────────────────
  const mimeType = file.type || "application/octet-stream";
  if (!isSupportedStorageContentType(mimeType)) {
    return NextResponse.json(
      {
        error: "Unsupported file type.",
        detail: `Received: "${mimeType}". Allowed types: PDF, common images, and audio formats.`,
      },
      { status: 415 }
    );
  }

  // ── Upload to Google Drive (or local fallback) ─────────────────────────────
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { url, storageType } = await uploadFile(buffer, file.name, mimeType);

    return NextResponse.json(
      { url, storageType, filename: file.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Upload API] Upload failed:", error);
    return NextResponse.json(
      {
        error: "File upload failed.",
        detail:
          error instanceof Error ? error.message : "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}