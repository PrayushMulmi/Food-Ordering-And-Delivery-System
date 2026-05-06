import fs from "fs";
import path from "path";
import ApiError from "./ApiError.js";

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const ALLOWED_IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function ensureUploadsDir(subdir = '') {
  const target = path.join(uploadsRoot, subdir);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export function parseBase64Image(dataUrl, { required = false, maxBytes = MAX_IMAGE_BYTES } = {}) {
  if (!dataUrl) {
    if (required) throw new ApiError(400, 'Image file is required');
    return null;
  }

  if (typeof dataUrl !== 'string') {
    throw new ApiError(400, 'Image upload must be a base64 data URL');
  }

  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new ApiError(400, 'Only PNG, JPG/JPEG, and WEBP images are supported');
  }

  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  if (!ALLOWED_IMAGE_MIMES.has(mime)) {
    throw new ApiError(400, 'Unsupported image type');
  }

  const buffer = Buffer.from(match[3], 'base64');
  if (!buffer.length) throw new ApiError(400, 'Uploaded image is empty');
  if (buffer.length > maxBytes) {
    throw new ApiError(400, `Image size must be ${Math.round(maxBytes / 1024 / 1024)}MB or smaller`);
  }

  return { buffer, mime, size: buffer.length };
}

// Kept for backwards compatibility with older code paths, but new restaurant/admin uploads use MySQL BLOB columns.
export function saveBase64Image(dataUrl, folder = 'general', prefix = 'img') {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;
  const parsed = parseBase64Image(dataUrl);
  if (!parsed) return null;
  const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
  const ext = extMap[parsed.mime] || 'png';
  const dir = ensureUploadsDir(folder);
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(dir, fileName), parsed.buffer);
  return `/uploads/${folder}/${fileName}`;
}
