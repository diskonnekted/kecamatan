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
 */

export type StatistikRow = {
  nama: string;
  jumlah: number;
  laki: number;
  perempuan: number;
  persen: string | null;
};

export const STATISTIK_KATEGORI = [
  { id: 10, slug: 'umur_rentang', label: 'Umur (Rentang)' },
  { id: 4, slug: 'jenis_kelamin', label: 'Jenis Kelamin' },
  { id: 3, slug: 'agama', label: 'Agama' },
  { id: 0, slug: 'pendidikan_kk', label: 'Pendidikan dalam KK' },
  { id: 1, slug: 'pekerjaan', label: 'Pekerjaan' },
  { id: 2, slug: 'status_kawin', label: 'Status Perkawinan' },
  { id: 6, slug: 'status_penduduk', label: 'Status Penduduk' },
  { id: 7, slug: 'golongan_darah', label: 'Golongan Darah' },
  { id: 8, slug: 'cacat', label: 'Penyandang Cacat' },
  { id: 9, slug: 'penyakit_menahun', label: 'Penyakit Menahun' },
  { id: 11, slug: 'pendidikan_sedang', label: 'Pendidikan Sedang Ditempuh' },
  { id: 12, slug: 'umur_kategori', label: 'Umur (Kategori)' },
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
 * Ambil 13 kategori statistik dari situs desa dan simpan ke DB.
 * Di-throttle 20 jam (kecuali force). Kegagalan per kategori di-skip (data lama dipertahankan).
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
  let kategoriOk = 0;
  let totalRows = 0;
  for (const kat of STATISTIK_KATEGORI) {
    try {
      const res = await fetch(`${base}/internal_api/statistik/${kat.id}`, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      const rows = normalizeStatistik(json);
      replaceStatistik(desa.id, kat.slug, rows);
      if (rows.length > 0) kategoriOk++;
      totalRows += rows.length;
    } catch {
      continue;
    }
  }
  db.prepare('UPDATE desa SET statistik_at = ? WHERE id = ?').run(
    new Date().toISOString().slice(0, 19).replace('T', ' '),
    desa.id,
  );
  return `statistik: ${kategoriOk}/${STATISTIK_KATEGORI.length} kategori (${totalRows} baris)`;
}
