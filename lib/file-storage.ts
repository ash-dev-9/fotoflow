import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

export async function ensureUploadsDirectory() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function saveFile(
  file: File,
  subdirectory: string = "photos"
): Promise<{ path: string; size: number }> {
  await ensureUploadsDirectory();

  const uploadDir = join(UPLOADS_DIR, subdirectory);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
  const filePath = join(uploadDir, filename);
  const relativePath = `/uploads/${subdirectory}/${filename}`;

  await writeFile(filePath, buffer);

  return {
    path: relativePath,
    size: buffer.length,
  };
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = join(process.cwd(), "public", filePath);
  try {
    await unlink(fullPath);
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
  }
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || "";
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
