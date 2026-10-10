import { NextResponse } from "next/server";
import { getFileBuffer } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

const contentTypes: Record<string, string> = {
  ".aac": "audio/aac",
  ".avif": "image/avif",
  ".flac": "audio/flac",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".m4a": "audio/x-m4a",
  ".mp3": "audio/mpeg",
  ".mp4": "audio/mp4",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".webp": "image/webp",
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteParams) {
  const { filename } = await params;
  const file = await getFileBuffer(`/uploads/${encodeURIComponent(filename)}`);

  if (!file) {
    return NextResponse.json({ error: "Uploaded file not found" }, { status: 404 });
  }

  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const contentType = contentTypes[extension];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported uploaded file type" }, { status: 415 });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
