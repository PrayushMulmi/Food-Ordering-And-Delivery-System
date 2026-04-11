import path from "path";

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

export function ensureUploadsDir(subdir = '') {
  const target = path.join(uploadsRoot, subdir);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export function saveBase64Image(dataUrl, folder = 'general', prefix = 'img') {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
  const ext = extMap[mime] || 'png';
  const buffer = Buffer.from(match[3], 'base64');
  const dir = ensureUploadsDir(folder);
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}
