import fs from "fs";
import path from "path";

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

export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<{ url: string; storageType: "local" }> {
  const cleanFilename = `${Date.now()}-${path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, cleanFilename), buffer);

  return { url: `/uploads/${encodeURIComponent(cleanFilename)}`, storageType: "local" };
}

export async function getFileBuffer(storageUrl: string): Promise<Buffer | null> {
  if (storageUrl.startsWith("/uploads/")) {
    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const localPath = path.resolve(uploadDir, decodeURIComponent(storageUrl.slice("/uploads/".length)));
    if (!localPath.startsWith(`${uploadDir}${path.sep}`)) return null;

    try {
      return await fs.promises.readFile(localPath);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return null;
      }
      throw error;
    }
  }

  if (storageUrl.startsWith("http://") || storageUrl.startsWith("https://")) {
    const response = await fetch(storageUrl);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  return null;
}
