import { db, hashPassword } from './db';

// Daftar 17 desa di Kecamatan Banjarmangu, Kabupaten Banjarnegara
// Domain bersumber dari pantauan OpenSID / Clasnet
export const DESA_BANJARMANGU = [
  { slug: 'banjarkulon',     nama: 'Banjarkulon',  website: 'https://banjarkulon-banjarnegara.desa.id' },
  { slug: 'banjarmangu',     nama: 'Banjarmangu',  website: 'https://banjarmangu-banjarnegara.desa.id' },
  { slug: 'beji',            nama: 'Beji',         website: 'https://beji-banjarnegara.desa.id' },
  { slug: 'gripit',          nama: 'Gripit',       website: 'https://gripit-banjarnegara.desa.id' },
  { slug: 'jenggawur',       nama: 'Jenggawur',    website: 'https://jenggawur-banjarnegara.desa.id' },
  { slug: 'kalilunjar',      nama: 'Kalilunjar',   website: 'https://kalilunjar-banjarnegara.desa.id' },
  { slug: 'kendaga',         nama: 'Kendaga',      website: 'https://kendaga-banjarnegara.desa.id' },
  { slug: 'kesenet',         nama: 'Kesenet',      website: 'https://kesenet-banjarnegara.desa.id' },
  { slug: 'majatengah',      nama: 'Majatengah',   website: 'https://majatengah-banjarmangu.desa.id' },
  { slug: 'paseh',           nama: 'Paseh',        website: 'https://paseh-banjarnegara.desa.id' },
  { slug: 'pekandangan',     nama: 'Pekandangan',  website: 'https://pekandangan-banjarnegara.desa.id' },
  { slug: 'prendengan',      nama: 'Prendengan',   website: 'https://prendengan-banjarmangu.sistemdata.id' },
  { slug: 'rejasari',        nama: 'Rejasari',     website: 'https://rejasari-banjarnegara.desa.id' },
  { slug: 'sigeblog',        nama: 'Sigeblog',     website: 'https://sigeblog-banjarnegara.desa.id' },
  { slug: 'sijenggung',      nama: 'Sijenggung',   website: 'https://sijenggung-banjarnegara.desa.id' },
  { slug: 'sijeruk',         nama: 'Sijeruk',      website: 'https://sijeruk-banjarnegara.desa.id' },
  { slug: 'sipedang',        nama: 'Sipedang',     website: 'https://sipedang-banjarnegara.desa.id' },
];

export function seedDesa() {
  // Perbaikan: jika website berubah, feed_url lama mungkin sudah stale.
  // Kita update feed_url hanya jika feed_url saat ini masih mengandung domain
  // "sistemdata.id" (host lama yang tidak bisa serve RSS) atau tidak ada.
  const fixFeed = db.prepare(`
    UPDATE desa
    SET feed_url = @new_feed
    WHERE slug = @slug
      AND (feed_url IS NULL OR feed_url = '' OR feed_url LIKE '%sistemdata.id%')
  `);

  const stmt = db.prepare(`
    INSERT INTO desa (slug, nama, website, feed_url, scraper_enabled, is_active)
    VALUES (@slug, @nama, @website, @feed_url, 1, 1)
    ON CONFLICT(slug) DO UPDATE SET
      nama = excluded.nama,
      website = excluded.website
  `);

  const fixFeedMany = db.transaction((rows: typeof DESA_BANJARMANGU) => {
    for (const r of rows) {
      const newFeed = `${r.website}/feed`;
      fixFeed.run({ slug: r.slug, new_feed: newFeed });
    }
  });
  fixFeedMany(DESA_BANJARMANGU);

  const insertMany = db.transaction((rows: typeof DESA_BANJARMANGU) => {
    for (const r of rows) {
      stmt.run({
        slug: r.slug,
        nama: r.nama,
        website: r.website,
        feed_url: `${r.website}/feed`,
      });
    }
  });
  insertMany(DESA_BANJARMANGU);

  // Buat admin default (username: admin, password: admin123).
  // Pakai INSERT OR IGNORE supaya race antar worker build tidak error.
  db.prepare(
    'INSERT OR IGNORE INTO admin_user (username, password_hash) VALUES (?, ?)',
  ).run('admin', hashPassword('admin123'));
}

/** Seed tabel profil_kecamatan jika belum ada */
export function seedProfilKecamatan() {
  // Buat tabel jika belum ada
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

  // Seed data jika kosong
  const profilCount = db.prepare("SELECT COUNT(*) AS c FROM profil_kecamatan").get() as { c: number };
  if (profilCount.c === 0) {
    db.prepare(`
      INSERT INTO profil_kecamatan (nama_kecamatan, kabupaten, provinsi, website_sumber)
      VALUES ('Banjarmangu', 'Banjarnegara', 'Jawa Tengah', 'https://banjarmangu.banjarnegarakab.go.id/')
    `).run();
  }
}
