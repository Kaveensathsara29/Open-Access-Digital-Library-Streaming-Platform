import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

interface RouteParams {
  params: Promise<{ fileId: string }>;
}

/** Allowed MIME types the drive proxy will serve. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
]);

/**
 * Returns an authenticated Google Drive v3 client using OAuth2
 * (personal account via Refresh Token — no Service Account needed).
 */
function getDriveClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive OAuth2 credentials not configured. " +
      "Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and " +
      "GOOGLE_REFRESH_TOKEN are set in .env.local."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://oauth2.googleapis.com/token"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { fileId } = await params;

  // Basic fileId validation — Drive IDs are alphanumeric + underscores/hyphens.
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Invalid file ID." }, { status: 400 });
  }

  try {
    const drive = getDriveClient();

    // Fetch metadata to verify MIME type before streaming.
    const meta = await drive.files.get({
      fileId,
      fields: "id,mimeType,name,size",
    });

    const mimeType = meta.data.mimeType ?? "application/octet-stream";

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "File type is not permitted to be served." },
        { status: 415 }
      );
    }

    // Download the file as an ArrayBuffer and stream it to the client.
    const fileResponse = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(fileResponse.data as ArrayBuffer);

    const isPdf = mimeType === "application/pdf";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": isPdf
          ? `inline; filename="${meta.data.name ?? fileId}.pdf"`
          : "inline",
        "Cache-Control": isPdf
          ? "private, no-cache, no-store, must-revalidate"
          : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const errObj = error as { code?: number; message?: string };

    if (errObj?.code === 404) {
      return NextResponse.json(
        { error: "File not found on Google Drive." },
        { status: 404 }
      );
    }

    console.error(`Google Drive proxy error [fileId=${fileId}]:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve file from Google Drive." },
      { status: 500 }
    );
  }
}
