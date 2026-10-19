import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { google } from "googleapis";

// ─────────────────────────────────────────────────────────────────────────────
// Supported MIME types for upload / serving
// ─────────────────────────────────────────────────────────────────────────────
const supportedContentTypes = new Set([
  "application/pdf",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
  "audio/x-wav",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
]);

export function isSupportedStorageContentType(contentType: string): boolean {
  return supportedContentTypes.has(contentType.toLowerCase().split(";")[0].trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuth2 Drive client (uses personal Google account via Refresh Token)
// Required env vars:
//   GOOGLE_CLIENT_ID       – from Google Cloud Console → OAuth 2.0 Client IDs
//   GOOGLE_CLIENT_SECRET   – same OAuth client
//   GOOGLE_REFRESH_TOKEN   – generated via OAuth 2.0 Playground
//   GOOGLE_DRIVE_FOLDER_ID – target folder in your personal Drive
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when all OAuth2 Drive env vars are present and non-placeholder. */
function isGoogleDriveConfigured(): boolean {
  const clientId     = process.env.GOOGLE_CLIENT_ID     ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN ?? "";
  const folderId     = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";

  return (
    clientId.length > 0     && !clientId.startsWith("your-")     &&
    clientSecret.length > 0 && !clientSecret.startsWith("your-") &&
    refreshToken.length > 0 && !refreshToken.startsWith("your-") &&
    folderId.length > 0     && !folderId.startsWith("your-")
  );
}

/**
 * Returns an authenticated Google Drive v3 client using OAuth2
 * (personal account via Refresh Token). This avoids the Service Account
 * "storage quota does not apply" limitation on personal Google Drive.
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

  // Create OAuth2 client with your app's credentials
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://oauth2.googleapis.com/token" // token endpoint (not a redirect URI here)
  );

  // Supply the refresh token — googleapis will auto-refresh the access token
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a file buffer to Google Drive (preferred) or falls back to local
 * public/uploads when OAuth2 credentials are absent.
 *
 * Returns `{ url, storageType }` where `url` is either:
 *  - `/api/drive/<fileId>`  for Google Drive files
 *  - `/uploads/<filename>`  for local files (legacy fallback)
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<{ url: string; storageType: "gdrive" | "local" }> {
  const cleanFilename = `${Date.now()}-${path
    .basename(filename)
    .replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // ── Google Drive upload via OAuth2 ────────────────────────────────────────
  if (isGoogleDriveConfigured()) {
    const drive = getDriveClient();
    const folderId    = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const fileMimeType = mimeType || "application/octet-stream";

    console.log(
      `[Storage] Uploading "${cleanFilename}" (${fileMimeType}) ` +
      `to Google Drive folder ${folderId} via OAuth2 user auth`
    );

    // googleapis requires a Node.js Readable stream for media.body
    const bodyStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    const uploadResponse = await drive.files.create({
      requestBody: {
        name: cleanFilename,
        parents: [folderId],
      },
      media: {
        mimeType: fileMimeType,
        body: bodyStream,
      },
      fields: "id,name",
    });

    const fileId = uploadResponse.data.id;
    if (!fileId) {
      throw new Error(
        "Google Drive file.create succeeded but returned no file ID. " +
        JSON.stringify(uploadResponse.data)
      );
    }

    console.log(`[Storage] Drive upload OK — fileId=${fileId}`);

    // Make the file publicly readable so the /api/drive proxy can serve it
    // without requiring the user to be signed in to Google.
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    console.log(`[Storage] Public read permission granted for fileId=${fileId}`);

    return { url: `/api/drive/${fileId}`, storageType: "gdrive" };
  }

  // ── Local filesystem fallback ─────────────────────────────────────────────
  console.warn("[Storage] Google Drive OAuth2 not configured — falling back to local storage.");
  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, cleanFilename), buffer);

  return { url: `/uploads/${encodeURIComponent(cleanFilename)}`, storageType: "local" };
}

/**
 * Downloads and returns the raw Buffer for a stored file URL.
 *
 * Handles three URL schemes:
 *  1. `/api/drive/<fileId>`  → Google Drive download via OAuth2
 *  2. `/uploads/<filename>`  → Legacy local file (backward-compatible)
 *  3. `http://` / `https://` → External URL fetch
 */
export async function getFileBuffer(storageUrl: string): Promise<Buffer | null> {
  // ── Google Drive ──────────────────────────────────────────────────────────
  if (storageUrl.startsWith("/api/drive/")) {
    const fileId = storageUrl.slice("/api/drive/".length);
    try {
      const drive = getDriveClient();
      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error(`[Storage] Google Drive download error for fileId=${fileId}:`, error);
      return null;
    }
  }

  // ── Legacy local storage ──────────────────────────────────────────────────
  if (storageUrl.startsWith("/uploads/")) {
    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const localPath = path.resolve(
      uploadDir,
      decodeURIComponent(storageUrl.slice("/uploads/".length))
    );
    // Path traversal guard
    if (!localPath.startsWith(`${uploadDir}${path.sep}`)) return null;

    try {
      return await fs.promises.readFile(localPath);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return null;
      }
      throw error;
    }
  }

  // ── External URL ──────────────────────────────────────────────────────────
  if (storageUrl.startsWith("http://") || storageUrl.startsWith("https://")) {
    const response = await fetch(storageUrl);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  return null;
}
