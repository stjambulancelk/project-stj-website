import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { STORAGE } from "./constants";

// ============================================================
// File storage — Railway persistent volume (/data/uploads)
// Static public assets stay in /public (baked into build)
// CMS-uploaded files go to volume (survives deploys)
// ============================================================

export async function ensureUploadDir(subDir = ""): Promise<string> {
  const dir = path.join(STORAGE.uploadDir, subDir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  subDir = "cms"
): Promise<{ path: string; url: string; filename: string }> {
  const ext = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${hash}${ext}`;
  const dir = await ensureUploadDir(subDir);
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, buffer);

  // Served via /api/uploads/[...path] route
  const url = `/api/uploads/${subDir}/${filename}`;
  return { path: filePath, url, filename };
}

export async function deleteUploadedFile(filePath: string): Promise<void> {
  // Only allow deleting files within the upload dir (security check)
  const resolved = path.resolve(filePath);
  const uploadBase = path.resolve(STORAGE.uploadDir);
  if (!resolved.startsWith(uploadBase)) {
    throw new Error("Path traversal attempt blocked");
  }
  await fs.unlink(resolved).catch(() => void 0);
}

export function isAllowedImageType(mimeType: string): boolean {
  return STORAGE.allowedImageTypes.includes(mimeType as never);
}

export function checkFileSize(sizeBytes: number): boolean {
  return sizeBytes <= STORAGE.maxFileSizeBytes;
}
