import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

// Upload disimpan di .data/uploads (BUKAN public/) karena folder app
// dibersihkan saat deploy produksi — hanya .env* dan .data* yang dipertahankan.
const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

// Simpan File (dari FormData) ke .data/uploads, kembalikan URL publik /foto/<nama>
export async function saveUploadedImage(
  file: File,
  subdir = "berita",
): Promise<UploadResult> {
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return { ok: false, error: "Format gambar harus JPG, PNG, WebP, atau GIF" };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Ukuran gambar maksimal 5 MB" };
  }

  const dir = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), buf);

  return { ok: true, url: `/foto/${subdir}/${name}` };
}

// Hapus file upload berdasarkan URL publiknya (/foto/<subdir>/<nama>)
export function deleteUploadedImage(url: string) {
  const m = /^\/foto\/([a-z0-9-]+)\/([a-z0-9.-]+)$/i.exec(url);
  if (!m) return;
  const filePath = path.join(UPLOAD_DIR, m[1], m[2]);
  // Pastikan masih di dalam UPLOAD_DIR (guard path traversal)
  if (!filePath.startsWith(UPLOAD_DIR)) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // abaikan — file mungkin sudah terhapus
  }
}
