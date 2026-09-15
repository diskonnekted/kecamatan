import { db, type Desa } from './db';

/**
 * Analitik desa — statistik kependudukan dari OpenSID.
 *
 * Sumber: endpoint JSON publik `{website}/internal_api/statistik/{kategoriId}`.
 * Endpoint ini aktif di situs OpenSID desa (terverifikasi gripit/beji/banjarmangu).
 *
 * PERHATIAN: respons datang dalam 2 bentuk berbeda (tergantung versi/build situs):
 *   A. flat:   {"data": [{"id":1, "attributes":{"nama":"X","jumlah":228,...}}]}
 *   B. nested: {"data": [{"attributes":{"label":"Pendidikan","data":[{"attributes":{"nama":"X","jumlah":"424",...}}]}}]}
 * `normalizeStatistik` menangani keduanya (angka bisa number atau string).
 *
 * PERHATIAN 2: ID statistik bawaan TIDAK konsisten antar versi OpenSID.
 *   Versi lama:  8=cacat, 9=penyakit_menahun, 10=umur_rentang, 11=pendidikan_sedang, 12=umur_kategori
 *   Versi baru (terpasang di desa-desa Banjarmangu):
 *                9=cacat, 10=penyakit_menahun, 13=umur_rentang, 14=pendidikan_sedang, 15=umur_kategori
 * Karena itu kategori dideteksi dari SIGNATURE LABEL baris (classifyStatistik),
 * bukan dari ID endpoint — kebal perbedaan versi OpenSID antar desa.
 */

export type StatistikRow = {
  nama: string;
  jumlah: number;
  laki: number;
  perempuan: number;
  persen: string | null;
};

/**
 * Daftar kategori statistik yang didukung. Kolom `id` = ID endpoint pada
 * OpenSID versi baru (referensi saja) — pengambilan data memakai deteksi
 * signature label (classifyStatistik), BUKAN pemetaan ID ini.
 */
export const STATISTIK_KATEGORI = [
  { id: 13, slug: 'umur_rentang', label: 'Umur (Rentang)' },
  { id: 4, slug: 'jenis_kelamin', label: 'Jenis Kelamin' },
  { id: 3, slug: 'agama', label: 'Agama' },
  { id: 0, slug: 'pendidikan_kk', label: 'Pendidikan dalam KK' },
  { id: 1, slug: 'pekerjaan', label: 'Pekerjaan' },
  { id: 2, slug: 'status_kawin', label: 'Status Perkawinan' },
  { id: 6, slug: 'status_penduduk', label: 'Status Penduduk' },
  { id: 7, slug: 'golongan_darah', label: 'Golongan Darah' },
  { id: 9, slug: 'cacat', label: 'Penyandang Cacat' },
  { id: 10, slug: 'penyakit_menahun', label: 'Penyakit Menahun' },
  { id: 14, slug: 'pendidikan_sedang', label: 'Pendidikan Sedang Ditempuh' },
  { id: 15, slug: 'umur_kategori', label: 'Umur (Kategori)' },
  { id: 5, slug: 'warga_negara', label: 'Kewarganegaraan' },
] as const;

export type StatistikKategoriSlug = (typeof STATISTIK_KATEGORI)[number]['slug'];

const STATISTIK_LABEL: Record<string, string> = Object.fromEntries(
  STATISTIK_KATEGORI.map((k) => [k.slug, k.label]),
);

export function statistikLabel(slug: string): string {
  return STATISTIK_LABEL[slug] ?? slug;
}

/** Statistik berubah lambat — cukup refresh 1×/20 jam meski sync jalan tiap 2 jam. */
const STATISTIK_MIN_INTERVAL_MS = 20 * 60 * 60 * 1000;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseInt(String(v ?? '0').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

/** Normalisasi respons internal_api/statistik (kedua bentuk) menjadi baris seragam. */
export function normalizeStatistik(json: unknown): StatistikRow[] {
  const raw: Record<string, unknown>[] = [];
  const pushAttr = (attr: unknown) => {
    if (attr && typeof attr === 'object') raw.push(attr as Record<string, unknown>);
  };
  const data = (json as { data?: unknown } | null)?.data;
  if (Array.isArray(data)) {
    for (const item of data) {
      const attr = (item as { attributes?: unknown })?.attributes ?? item;
      const a = attr as Record<string, unknown> | null;
      if (!a) continue;
      if (a.nama != null && a.jumlah != null) {
        // bentuk flat
        pushAttr(a);
        continue;
      }
      // bentuk nested: attributes.data = array of {attributes:{nama,jumlah,...}}
      const inner = a.data;
      if (Array.isArray(inner)) {
        for (const it of inner) {
          const a2 = (it as { attributes?: unknown })?.attributes ?? it;
          pushAttr(a2);
        }
      }
    }
  }
  const skip = new Set(['TOTAL', 'JUMLAH', 'TOTAL KESELURUHAN']);
  return raw
    .map((r) => ({
      nama: String(r.nama ?? '').replace(/\s+/g, ' ').trim(),
      jumlah: toNum(r.jumlah),
      laki: toNum(r.laki),
      perempuan: toNum(r.perempuan),
      persen: r.persen != null ? String(r.persen) : null,
    }))
    .filter((r) => r.nama.length > 0 && !skip.has(r.nama.toUpperCase()));
}

function replaceStatistik(desaId: number, kategori: string, rows: StatistikRow[]): void {
  const trx = db.transaction(() => {
    db.prepare('DELETE FROM statistik_desa WHERE desa_id = ? AND kategori = ?').run(desaId, kategori);
    const ins = db.prepare(
      'INSERT INTO statistik_desa (desa_id, kategori, urutan, nama, jumlah, laki, perempuan, persen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    rows.forEach((r, i) => {
      ins.run(desaId, kategori, i, r.nama.slice(0, 200), r.jumlah, r.laki, r.perempuan, r.persen);
    });
  });
  trx();
}

/**
 * Deteksi slug kategori dari daftar label baris statistik.
 * Kebal perbedaan pemetaan ID antar versi OpenSID (lihat komentar header).
 * Urutan pemeriksaan penting — yang paling spesifik didahulukan.
 */
export function classifyStatistik(names: string[]): StatistikKategoriSlug | null {
  const lower = names.map((n) => n.toLowerCase().trim());
  const exact = new Set(lower);
  const has = (frag: string) => lower.some((n) => n.includes(frag));
  const umurRentangCount = names.filter((n) =>
    /^\s*(umur\s+)?\d+\s*(s\/d|s\.d\.|-)\s*\d+/i.test(n),
  ).length;

  if (has('laki-laki') && has('perempuan')) return 'jenis_kelamin';
  if (has('islam') && (has('kristen') || has('katholik') || has('hindu') || has('budha'))) return 'agama';
  if (has('belum tamat sd') || has('tidak/belum sekolah')) return 'pendidikan_kk';
  if (has('mengurus rumah tangga') || has('belum/tidak bekerja')) return 'pekerjaan';
  if (has('belum kawin')) return 'status_kawin';
  if (exact.has('tetap') && exact.has('tidak tetap')) return 'status_penduduk';
  if (exact.has('wni')) return 'warga_negara';
  if (exact.has('a') && exact.has('ab') && exact.has('o')) return 'golongan_darah';
  if (has('cacat fisik') || has('cacat netra')) return 'cacat';
  if (has('jantung') || has('asthma') || has('tidak ada/tidak sakit')) return 'penyakit_menahun';
  if (has('balita')) return 'umur_kategori';
  if (umurRentangCount >= 2) return 'umur_rentang';
  if (has('kelompok bermain') || has('sedang sd')) return 'pendidikan_sedang';
  return null;
}

/** Rentang ID yang di-probe (mencakup pemetaan versi lama & baru OpenSID). */
const PROBE_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/**
 * Ambil statistik dari situs desa dan simpan ke DB.
 * Mem-probe ID 0–15, mengklasifikasi isi respons berdasarkan signature label,
 * lalu menyimpan per kategori. Di-throttle 20 jam (kecuali force).
 * Kegagalan per endpoint di-skip (data lama dipertahankan).
 * Mengembalikan ringkasan pesan, atau string kosong bila di-skip throttle.
 */
export async function fetchStatistikDesa(
  desa: Desa,
  opts?: { force?: boolean },
): Promise<string> {
  if (!opts?.force && desa.statistik_at) {
    const t = new Date(desa.statistik_at.replace(' ', 'T')).getTime();
    if (Number.isFinite(t) && Date.now() - t < STATISTIK_MIN_INTERVAL_MS) return '';
  }

  const base = desa.website.replace(/\/+$/, '');
  const claimed = new Set<StatistikKategoriSlug>();
  let totalRows = 0;
  for (const id of PROBE_IDS) {
    let rows: StatistikRow[];
    try {
      const res = await fetch(`${base}/internal_api/statistik/${id}`, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      rows = normalizeStatistik(json);
    } catch {
      continue;
    }
    if (rows.length === 0) continue;
    const slug = classifyStatistik(rows.map((r) => r.nama));
    if (!slug || claimed.has(slug)) continue; // kategori sudah terisi dari ID lain
    claimed.add(slug);
    replaceStatistik(desa.id, slug, rows);
    totalRows += rows.length;
  }
  db.prepare('UPDATE desa SET statistik_at = ? WHERE id = ?').run(
    new Date().toISOString().slice(0, 19).replace('T', ' '),
    desa.id,
  );
  return `statistik: ${claimed.size}/${STATISTIK_KATEGORI.length} kategori (${totalRows} baris)`;
}
