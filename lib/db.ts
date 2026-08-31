import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_PATH
  ? process.env.DATABASE_PATH
  : path.join(DB_DIR, 'portal.db');

function openDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  // Tunggu sampai 30 detik kalau DB sedang dipakai proses lain
  // (berguna saat build paralel / PM2 restart)
  db.pragma('busy_timeout = 30000');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  return db;
}

// Jalankan schema setup SEKALI per file database, guarded by file lock
// (idempotent — CREATE TABLE IF NOT EXISTS, ALTER guarded by PRAGMA table_info).
function ensureSchemaSync(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS desa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      website TEXT NOT NULL,
      feed_url TEXT,
      scraper_enabled INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_sync_at TEXT,
      last_sync_status TEXT,
      last_sync_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const desaCols = db.prepare("PRAGMA table_info(desa)").all() as Array<{ name: string }>;
  const hasCol = (name: string) => desaCols.some((c) => c.name === name);
  if (!hasCol("opensid_api_url")) {
    db.exec("ALTER TABLE desa ADD COLUMN opensid_api_url TEXT");
  }
  if (!hasCol("opensid_api_token")) {
    db.exec("ALTER TABLE desa ADD COLUMN opensid_api_token TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS artikel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desa_id INTEGER NOT NULL,
      external_id TEXT,
      judul TEXT NOT NULL,
      slug TEXT NOT NULL,
      url TEXT NOT NULL,
      ringkasan TEXT,
      konten TEXT,
      gambar TEXT,
      penulis TEXT,
      kategori TEXT,
      published_at TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'rss',
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (desa_id, slug),
      FOREIGN KEY (desa_id) REFERENCES desa(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_artikel_desa ON artikel(desa_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_artikel_published ON artikel(published_at DESC);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desa_id INTEGER,
      source TEXT,
      status TEXT NOT NULL,
      message TEXT,
      new_count INTEGER NOT NULL DEFAULT 0,
      updated_count INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES admin_user(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_session_token ON admin_session(token);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS desa_api_key (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desa_id INTEGER NOT NULL UNIQUE,
      api_key TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_push_at TEXT,
      last_push_status TEXT,
      last_push_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (desa_id) REFERENCES desa(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_api_key ON desa_api_key(api_key);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS push_inbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desa_id INTEGER NOT NULL,
      endpoint TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      items_received INTEGER NOT NULL DEFAULT 0,
      items_inserted INTEGER NOT NULL DEFAULT 0,
      items_updated INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      message TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (desa_id) REFERENCES desa(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_push_inbox_desa ON push_inbox(desa_id, created_at DESC);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_daily (
      date TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS profil_kecamatan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kecamatan TEXT NOT NULL DEFAULT 'Banjarmangu',
      kabupaten TEXT NOT NULL DEFAULT 'Banjarnegara',
      provinsi TEXT NOT NULL DEFAULT 'Jawa Tengah',
      kode_wilayah TEXT,
      visi TEXT,
      misi TEXT,
      sejarah TEXT,
      letak_geografis TEXT,
      struktur_pemerintahan TEXT,
      alamat_kantor TEXT,
      telepon_kantor TEXT,
      email_kantor TEXT,
      website_sumber TEXT NOT NULL DEFAULT 'https://banjarmangu.banjarnegarakab.go.id/',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const profilCount = db.prepare("SELECT COUNT(*) AS c FROM profil_kecamatan").get() as { c: number };
  if (profilCount.c === 0) {
    db.prepare(`
      INSERT INTO profil_kecamatan (nama_kecamatan, kabupaten, provinsi, website_sumber)
      VALUES ('Banjarmangu', 'Banjarnegara', 'Jawa Tengah', 'https://banjarmangu.banjarnegarakab.go.id/')
    `).run();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS statistik_penduduk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desa_id INTEGER NOT NULL,
      desa_slug TEXT NOT NULL,
      desa_nama TEXT NOT NULL,
      tahun INTEGER NOT NULL,
      penduduk INTEGER DEFAULT 0,
      laki_laki INTEGER DEFAULT 0,
      perempuan INTEGER DEFAULT 0,
      disabilitas INTEGER DEFAULT 0,
      jumlah_kk INTEGER DEFAULT 0,
      scraped_at TEXT,
      UNIQUE (desa_id, tahun),
      FOREIGN KEY (desa_id) REFERENCES desa(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_statistik_desa ON statistik_penduduk(desa_id, tahun);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS unduhan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kategori TEXT NOT NULL,
      judul TEXT NOT NULL,
      deskripsi TEXT,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_unduhan_kategori ON unduhan(kategori, is_published);`);

  // === Aduan masyarakat ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS aduan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor TEXT NOT NULL UNIQUE,
      desa_id INTEGER REFERENCES desa(id) ON DELETE SET NULL,
      jenis TEXT NOT NULL,
      isi TEXT NOT NULL,
      nama TEXT NOT NULL,
      nik TEXT,
      telepon TEXT NOT NULL,
      email TEXT,
      alamat TEXT,
      status TEXT NOT NULL DEFAULT 'baru',
      tanggapan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_aduan_nomor ON aduan(nomor);
    CREATE INDEX IF NOT EXISTS idx_aduan_status ON aduan(status);
  `);
}

// Buka koneksi SQLite (singleton via globalThis).
// Schema otomatis dibuat di sini (idempotent) supaya tidak ada race antar worker build.
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __db_ready: boolean | undefined;
}

export const db = (() => {
  if (globalThis.__db) return globalThis.__db;
  const _db = openDatabase();
  try {
    // Schema setup idempotent — aman dipanggil setiap kali koneksi dibuat
    // (kalau ada banyak worker build paralel, setiap worker hanya bikin koneksi
    //  baru kalau globalThis.__db belum ada, jadi hanya worker pertama yang setup).
    ensureSchemaSync(_db);
  } catch (e) {
    // Ignore "duplicate column" kalau worker lain sudah setup duluan
    if (!(e as Error).message.includes("duplicate column")) {
      throw e;
    }
  }
  globalThis.__db = _db;
  globalThis.__db_ready = true;
  return _db;
})();

// Utilitas auth bersama (sumber tunggal — dipakai seed.ts & auth.ts)
export function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

export type Desa = {
  id: number;
  slug: string;
  nama: string;
  website: string;
  feed_url: string | null;
  scraper_enabled: number;
  is_active: number;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_message: string | null;
  created_at: string;
  opensid_api_url: string | null;
  opensid_api_token: string | null;
};

export type Artikel = {
  id: number;
  desa_id: number;
  external_id: string | null;
  judul: string;
  slug: string;
  url: string;
  ringkasan: string | null;
  konten: string | null;
  gambar: string | null;
  penulis: string | null;
  kategori: string | null;
  published_at: string | null;
  view_count: number;
  source: string;
  fetched_at: string;
};

export type DesaApiKey = {
  id: number;
  desa_id: number;
  api_key: string;
  is_active: number;
  last_push_at: string | null;
  last_push_status: string | null;
  last_push_message: string | null;
  created_at: string;
};

export type PushInboxEntry = {
  id: number;
  desa_id: number;
  endpoint: string;
  payload_hash: string;
  items_received: number;
  items_inserted: number;
  items_updated: number;
  status: string;
  message: string | null;
  ip_address: string | null;
  created_at: string;
};

// Generator API key untuk push dari desa
export function generateApiKey(): string {
  return "dsk_" + crypto.randomBytes(24).toString("hex");
}

export type Unduhan = {
  id: number;
  kategori: string;
  judul: string;
  deskripsi: string | null;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  is_published: number;
  created_at: string;
  updated_at: string;
};

export type Aduan = {
  id: number;
  nomor: string;
  desa_id: number | null;
  jenis: string;
  isi: string;
  nama: string;
  nik: string | null;
  telepon: string;
  email: string | null;
  alamat: string | null;
  status: string;
  tanggapan: string | null;
  created_at: string;
  updated_at: string;
};

// Dipakai oleh lib/init.ts untuk ensureSchema idempotent
export { ensureSchemaSync };
