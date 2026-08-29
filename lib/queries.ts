import { db, type Desa, type Artikel, type DesaApiKey, type PushInboxEntry, type Unduhan } from './db';

export type ArtikelWithDesa = Artikel & { desa: Pick<Desa, 'slug' | 'nama'> };

export function getAllDesa(activeOnly = true): Desa[] {
  if (activeOnly) {
    return db.prepare('SELECT * FROM desa WHERE is_active = 1 ORDER BY nama ASC').all() as Desa[];
  }
  return db.prepare('SELECT * FROM desa ORDER BY nama ASC').all() as Desa[];
}

export function getDesaBySlug(slug: string): Desa | null {
  const row = db.prepare('SELECT * FROM desa WHERE slug = ?').get(slug) as Desa | undefined;
  return row ?? null;
}

export function getArtikelById(id: number): ArtikelWithDesa | null {
  const row = db
    .prepare(
      `SELECT a.*, d.slug AS d_slug, d.nama AS d_nama
       FROM artikel a
       JOIN desa d ON d.id = a.desa_id
       WHERE a.id = ?`,
    )
    .get(id) as (Artikel & { d_slug: string; d_nama: string }) | undefined;
  if (!row) return null;
  const { d_slug, d_nama, ...artikel } = row;
  return { ...artikel, desa: { slug: d_slug, nama: d_nama } };
}

export function getArtikelByDesaAndSlug(desaSlug: string, slug: string): ArtikelWithDesa | null {
  const row = db
    .prepare(
      `SELECT a.*, d.slug AS d_slug, d.nama AS d_nama
       FROM artikel a
       JOIN desa d ON d.id = a.desa_id
       WHERE d.slug = ? AND a.slug = ?`,
    )
    .get(desaSlug, slug) as (Artikel & { d_slug: string; d_nama: string }) | undefined;
  if (!row) return null;
  const { d_slug, d_nama, ...artikel } = row;
  return { ...artikel, desa: { slug: d_slug, nama: d_nama } };
}

export function getRecentArtikel(limit = 12, desaSlug?: string): ArtikelWithDesa[] {
  const where = desaSlug ? 'WHERE d.slug = ?' : '';
  const rows = db
    .prepare(
      `SELECT a.*, d.slug AS d_slug, d.nama AS d_nama
       FROM artikel a
       JOIN desa d ON d.id = a.desa_id
       ${where}
       ORDER BY COALESCE(a.published_at, a.fetched_at) DESC
       LIMIT ?`,
    )
    .all(...(desaSlug ? [desaSlug, limit] : [limit])) as (Artikel & { d_slug: string; d_nama: string })[];
  return rows.map(({ d_slug, d_nama, ...a }) => ({ ...a, desa: { slug: d_slug, nama: d_nama } }));
}

export function getPopularArtikel(limit = 8): ArtikelWithDesa[] {
  const rows = db
    .prepare(
      `SELECT a.*, d.slug AS d_slug, d.nama AS d_nama
       FROM artikel a
       JOIN desa d ON d.id = a.desa_id
       ORDER BY a.view_count DESC, COALESCE(a.published_at, a.fetched_at) DESC
       LIMIT ?`,
    )
    .all(limit) as (Artikel & { d_slug: string; d_nama: string })[];
  return rows.map(({ d_slug, d_nama, ...a }) => ({ ...a, desa: { slug: d_slug, nama: d_nama } }));
}

export function getArtikelStats(): {
  totalArtikel: number;
  totalDesa: number;
  totalDesaAktif: number;
  lastSync: string | null;
} {
  const totalArtikel = (db.prepare('SELECT COUNT(*) AS c FROM artikel').get() as { c: number }).c;
  const totalDesa = (db.prepare('SELECT COUNT(*) AS c FROM desa').get() as { c: number }).c;
  const totalDesaAktif = (db.prepare('SELECT COUNT(*) AS c FROM desa WHERE is_active = 1').get() as { c: number }).c;
  const last = db.prepare("SELECT last_sync_at FROM desa WHERE last_sync_at IS NOT NULL ORDER BY last_sync_at DESC LIMIT 1").get() as { last_sync_at: string } | undefined;
  return {
    totalArtikel,
    totalDesa,
    totalDesaAktif,
    lastSync: last?.last_sync_at ?? null,
  };
}

export function getRecentSyncLogs(limit = 20) {
  return db
    .prepare(
      `SELECT s.*, d.nama AS desa_nama
       FROM sync_log s
       LEFT JOIN desa d ON d.id = s.desa_id
       ORDER BY s.created_at DESC
       LIMIT ?`,
    )
    .all(limit) as Array<{
    id: number;
    desa_id: number | null;
    desa_nama: string | null;
    source: string;
    status: string;
    message: string | null;
    new_count: number;
    updated_count: number;
    duration_ms: number | null;
    created_at: string;
  }>;
}

// === API Key management untuk push dari desa ===

export function getApiKeyByDesaId(desaId: number): DesaApiKey | null {
  const row = db.prepare('SELECT * FROM desa_api_key WHERE desa_id = ?').get(desaId) as
    | DesaApiKey
    | undefined;
  return row ?? null;
}

export function getAllDesaWithApiKey(): Array<Desa & { api_key: string | null; last_push_at: string | null; last_push_status: string | null; last_push_message: string | null }> {
  return db
    .prepare(
      `SELECT d.*, k.api_key, k.last_push_at, k.last_push_status, k.last_push_message
       FROM desa d
       LEFT JOIN desa_api_key k ON k.desa_id = d.id
       ORDER BY d.nama ASC`,
    )
    .all() as Array<Desa & { api_key: string | null; last_push_at: string | null; last_push_status: string | null; last_push_message: string | null }>;
}

export function getDesaByApiKey(apiKey: string): { desa: Desa; apiKeyRow: DesaApiKey } | null {
  const row = db
    .prepare(
      `SELECT d.*, k.id AS k_id, k.api_key AS k_api_key, k.is_active AS k_is_active,
              k.last_push_at, k.last_push_status, k.last_push_message, k.created_at AS k_created_at
       FROM desa_api_key k
       JOIN desa d ON d.id = k.desa_id
       WHERE k.api_key = ? AND k.is_active = 1 AND d.is_active = 1`,
    )
    .get(apiKey) as any;
  if (!row) return null;
  const desa: Desa = {
    id: row.id, slug: row.slug, nama: row.nama, website: row.website,
    feed_url: row.feed_url, scraper_enabled: row.scraper_enabled, is_active: row.is_active,
    last_sync_at: row.last_sync_at, last_sync_status: row.last_sync_status,
    last_sync_message: row.last_sync_message, created_at: row.created_at,
    opensid_api_url: row.opensid_api_url, opensid_api_token: row.opensid_api_token,
  };
  const apiKeyRow: DesaApiKey = {
    id: row.k_id, desa_id: row.id, api_key: row.k_api_key, is_active: row.k_is_active,
    last_push_at: row.last_push_at, last_push_status: row.last_push_status,
    last_push_message: row.last_push_message, created_at: row.k_created_at,
  };
  return { desa, apiKeyRow };
}

export function recordPushAttempt(desaId: number, status: 'success' | 'failed', message: string): void {
  db.prepare(
    `UPDATE desa_api_key SET last_push_at = datetime('now'), last_push_status = ?, last_push_message = ? WHERE desa_id = ?`,
  ).run(status, message, desaId);
}

export function getRecentPushInbox(limit = 30): Array<PushInboxEntry & { desa_nama: string }> {
  return db
    .prepare(
      `SELECT p.*, d.nama AS desa_nama
       FROM push_inbox p
       JOIN desa d ON d.id = p.desa_id
       ORDER BY p.created_at DESC
       LIMIT ?`,
    )
    .all(limit) as Array<PushInboxEntry & { desa_nama: string }>;
}

// === Profil Kecamatan ===

export type ProfilKecamatan = {
  id: number;
  nama_kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_wilayah: string | null;
  visi: string | null;
  misi: string | null;
  sejarah: string | null;
  letak_geografis: string | null;
  struktur_pemerintahan: string | null;
  alamat_kantor: string | null;
  telepon_kantor: string | null;
  email_kantor: string | null;
  website_sumber: string | null;
  created_at: string;
  updated_at: string;
};

export function getProfilKecamatan(): ProfilKecamatan | null {
  const row = db.prepare("SELECT * FROM profil_kecamatan LIMIT 1").get() as ProfilKecamatan | undefined;
  return row ?? null;
}

// === Unduhan (Downloads) ===

let unduhanTableEnsured = false;
function ensureUnduhanTable() {
  if (unduhanTableEnsured) return;
  try {
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
    unduhanTableEnsured = true;
  } catch {
    // abaikan — fallback ke fallback lain
  }
}

export function getUnduhanByKategori(kategori: string, publishedOnly = true): Unduhan[] {
  ensureUnduhanTable();
  const where = publishedOnly ? "WHERE kategori = ? AND is_published = 1" : "WHERE kategori = ?";
  return db
    .prepare(`SELECT * FROM unduhan ${where} ORDER BY updated_at DESC`)
    .all(kategori) as Unduhan[];
}

export function getAllUnduhanByKategoriGrouped(): Record<string, Unduhan[]> {
  ensureUnduhanTable();
  const rows = db
    .prepare("SELECT * FROM unduhan WHERE is_published = 1 ORDER BY kategori ASC, updated_at DESC")
    .all() as Unduhan[];
  const grouped: Record<string, Unduhan[]> = {};
  for (const r of rows) {
    if (!grouped[r.kategori]) grouped[r.kategori] = [];
    grouped[r.kategori].push(r);
  }
  return grouped;
}

export function getAllUnduhanAdmin(): Unduhan[] {
  ensureUnduhanTable();
  return db
    .prepare("SELECT * FROM unduhan ORDER BY kategori ASC, updated_at DESC")
    .all() as Unduhan[];
}

export function getUnduhanById(id: number): Unduhan | null {
  ensureUnduhanTable();
  const row = db.prepare("SELECT * FROM unduhan WHERE id = ?").get(id) as Unduhan | undefined;
  return row ?? null;
}
