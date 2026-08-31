import { NextRequest } from 'next/server';
import { ensureInitialized } from '@/lib/init';
import { db, type Desa } from '@/lib/db';
import { syncDesa } from '@/lib/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// GET /api/sync/test?slug=<slug>  — sinkron 1 desa dan kembalikan error lengkap
export async function GET(req: NextRequest) {
  await ensureInitialized();
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return Response.json({ ok: false, error: 'parameter ?slug=<slug> wajib' }, { status: 400 });
  }
  const desa = db.prepare('SELECT * FROM desa WHERE slug = ?').get(slug) as Desa | undefined;
  if (!desa) {
    return Response.json({ ok: false, error: 'desa tidak ditemukan' }, { status: 404 });
  }

  // Diagnostik tambahan: uji feed_url, opensid_api_url, dan website secara terpisah
  const probes: Record<string, unknown> = {};
  const probe = async (label: string, url: string | null) => {
    if (!url) { probes[label] = { skipped: 'url kosong' }; return; }
    const start = Date.now();
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 30000);
      // Pakai GET, bukan HEAD — beberapa server desa.id membalas 404 untuk HEAD
      // padahal GET berhasil. Body langsung dibatalkan agar tidak download penuh.
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PortalKecamatanBot/1.0)',
          Accept: '*/*',
        },
      });
      clearTimeout(t);
      res.body?.cancel().catch(() => {});
      probes[label] = {
        url,
        status: res.status,
        contentType: res.headers.get('content-type'),
        durationMs: Date.now() - start,
      };
    } catch (e) {
      probes[label] = { url, error: (e as Error).message, durationMs: Date.now() - start };
    }
  };
  await probe('feed_url', desa.feed_url);
  await probe('opensid_api_url', desa.opensid_api_url);
  await probe('website', desa.website);

  const start = Date.now();
  let result;
  try {
    result = await syncDesa(desa);
  } catch (e) {
    return Response.json({
      ok: false,
      error: 'syncDesa threw exception',
      message: (e as Error).message,
      stack: (e as Error).stack,
      probes,
    }, { status: 500 });
  }

  return Response.json({
    ok: result.status === 'ok',
    desa: { nama: desa.nama, slug: desa.slug, website: desa.website, feed_url: desa.feed_url, opensid_api_url: desa.opensid_api_url, scraper_enabled: !!desa.scraper_enabled, is_active: !!desa.is_active },
    result,
    totalMs: Date.now() - start,
    probes,
  });
}
