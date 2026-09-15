/**
 * Integrasi CKAN opendata.banjarnegarakab.go.id.
 *
 * Catatan cakupan: organisasi `kecamatan-banjarmangu` ada tapi belum mengunggah
 * dataset apa pun, jadi tidak ada data per-desa Banjarmangu. Yang bisa dipakai
 * adalah dataset level kabupaten dengan baris per-kecamatan, mis. dana desa.
 */

const CKAN_BASE = 'https://opendata.banjarnegarakab.go.id';
const PKG_DANA_DESA = 'banyaknya-dana-desa-menurut-kecamatan';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Cache in-memory sederhana (proses PM2 long-running); data tahunan, jarang berubah.
const TTL_MS = 6 * 60 * 60 * 1000;
let danaDesaCache: { at: number; data: DanaDesaResult } | null = null;

export type DanaDesaRow = { kecamatan: string; tahun: number; nilai: number };

export type DanaDesaResult = {
  rows: DanaDesaRow[];
  judulDataset: string;
  urlDataset: string;
};

/** Dashboard kependudukan kecamatan dari OpenDK (untuk konteks perbandingan desa vs kecamatan). */
export type KecamatanPenduduk = {
  totalPenduduk: number;
  laki: number;
  perempuan: number;
  totalKeluarga: number;
};

const OPENDK_BASE = 'https://kecamatan-banjarmangu.smartdesa.net/api/frontend/v1';
let pendudukKecCache: { at: number; data: KecamatanPenduduk } | null = null;

export async function getKecamatanPenduduk(): Promise<KecamatanPenduduk | null> {
  if (pendudukKecCache && Date.now() - pendudukKecCache.at < TTL_MS) return pendudukKecCache.data;
  try {
    const res = await fetch(`${OPENDK_BASE}/statistik-penduduk`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { attributes?: { dashboard?: Record<string, unknown> } }[];
    };
    const d = json?.data?.[0]?.attributes?.dashboard;
    if (!d) return null;
    const data: KecamatanPenduduk = {
      totalPenduduk: toNum(d.total_penduduk),
      laki: toNum(d.laki_laki),
      perempuan: toNum(d.perempuan),
      totalKeluarga: toNum(d.total_keluarga ?? d.keluarga),
    };
    pendudukKecCache = { at: Date.now(), data };
    return data;
  } catch {
    return null;
  }
}

async function ckanApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${CKAN_BASE}${path}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? '0').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/** Dana desa per kecamatan per tahun (dari dataset kabupaten). Di-cache 6 jam. */
export async function getDanaDesaPerKecamatan(): Promise<DanaDesaResult | null> {
  if (danaDesaCache && Date.now() - danaDesaCache.at < TTL_MS) return danaDesaCache.data;

  type Pkg = {
    result?: {
      title?: string;
      resources?: { id: string; format?: string; datastore_active?: boolean }[];
    };
  };
  const pkg = await ckanApi<Pkg>(`/api/3/action/package_show?id=${PKG_DANA_DESA}`);
  const resources = pkg?.result?.resources ?? [];
  const res = resources.find((r) => r.format === 'CSV' && r.datastore_active) ?? resources[0];
  if (!res) return null;

  type Ds = { result?: { records?: Record<string, unknown>[] } };
  const ds = await ckanApi<Ds>(
    `/api/3/action/datastore_search?resource_id=${res.id}&limit=500`,
  );
  const records = ds?.result?.records ?? [];

  const rows: DanaDesaRow[] = [];
  for (const rec of records) {
    const kecamatan = String(rec.Kecamatan ?? rec.kecamatan ?? '').trim();
    if (!kecamatan) continue;
    const tahun = toNum(rec.Tahun ?? rec.tahun);
    // kolom nilai: cari key pertama yang mengandung 'Dana Desa'
    let nilai = 0;
    for (const [k, v] of Object.entries(rec)) {
      if (/dana desa/i.test(k)) {
        nilai = toNum(v);
        break;
      }
    }
    rows.push({ kecamatan, tahun, nilai });
  }
  if (rows.length === 0) return null;

  const data: DanaDesaResult = {
    rows,
    judulDataset: pkg?.result?.title ?? 'Dana Desa per Kecamatan',
    urlDataset: `${CKAN_BASE}/dataset/${PKG_DANA_DESA}`,
  };
  danaDesaCache = { at: Date.now(), data };
  return data;
}
