import { NextRequest } from 'next/server';
import { ensureInitialized } from '@/lib/init';
import { syncAllDesa, syncDesa } from '@/lib/sync';
import { db, type Desa } from '@/lib/db';

// Mencegah caching - hasil selalu dinamis
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 menit

export async function POST(req: NextRequest) {
  await ensureInitialized();
  const body = await req.json().catch(() => ({}));
  const slug = typeof body?.slug === 'string' ? body.slug : null;
  const token = req.headers.get('x-sync-token');
  const expected = process.env.SYNC_TOKEN;

  // Token hanya wajib bila diset di env; di dev kosong = tidak dicek
  if (expected && token !== expected) {
    return Response.json({ ok: false, error: 'token tidak valid' }, { status: 401 });
  }

  if (slug) {
    const desa = db.prepare('SELECT * FROM desa WHERE slug = ?').get(slug) as Desa | undefined;
    if (!desa) return Response.json({ ok: false, error: 'desa tidak ditemukan' }, { status: 404 });
    const result = await syncDesa(desa);
    // Catat ke sync_log dan update desa.last_sync_* (paritas dengan syncAllDesa)
    db.prepare(
      'INSERT INTO sync_log (desa_id, source, status, message, new_count, updated_count, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(desa.id, result.source, result.status, result.message, result.newCount, result.updatedCount, result.durationMs);
    db.prepare(
      "UPDATE desa SET last_sync_at = datetime('now'), last_sync_status = ?, last_sync_message = ? WHERE id = ?",
    ).run(result.status, result.message, desa.id);
    return Response.json({ ok: true, result });
  }

  const results = await syncAllDesa();
  const summary = {
    total: results.length,
    success: results.filter((r) => r.result.status === 'ok').length,
    failed: results.filter((r) => r.result.status === 'failed').length,
    newArticles: results.reduce((s, r) => s + r.result.newCount, 0),
    updatedArticles: results.reduce((s, r) => s + r.result.updatedCount, 0),
  };
  return Response.json({ ok: true, summary, results });
}

export async function GET() {
  await ensureInitialized();
  return Response.json({
    ok: true,
    info: 'POST /api/sync untuk menjalankan sinkronisasi. Body: { slug?: string }',
  });
}
