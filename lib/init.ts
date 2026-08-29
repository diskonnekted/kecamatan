import { db, ensureSchemaSync } from './db';
import { seedDesa } from './seed';

// Lazy initialization: schema + seed hanya dijalankan sekali,
// dan worker paralel (mis. Next.js build 47 workers) akan share promise yang sama.
//
// CATATAN: schema sudah otomatis dibuat saat db pertama kali dibuka
// (lihat lib/db.ts). Fungsi ini terutama untuk seed (admin default + 17 desa).
// Saat build paralel, banyak worker boleh aman panggil seedDesa bersamaan
// karena seedDesa pakai ON CONFLICT(slug) DO UPDATE.

export async function ensureInitialized(): Promise<void> {
  // Selalu ensureSchemaSync sekali per process (idempotent, aman paralel)
  try {
    ensureSchemaSync(db);
  } catch (e) {
    if (!(e as Error).message.includes("duplicate column")) {
      // Bukan "duplicate column" → lempar
      throw e;
    }
  }

  // Seed admin default + 17 desa kalau DB masih kosong
  // seedDesa() sudah idempotent: cek admin_user dulu sebelum INSERT, dan
  // INSERT desa pakai ON CONFLICT(slug) DO UPDATE.
  const row = db.prepare('SELECT COUNT(*) AS c FROM desa').get() as { c: number };
  if (row.c === 0) {
    seedDesa();
  } else {
    // Tetap panggil seedDesa() agar admin default dicek (idempotent)
    seedDesa();
  }
}
