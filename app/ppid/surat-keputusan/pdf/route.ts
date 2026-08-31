import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PDF_URL = 'https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2026/08/SK-PENUNJUKAN-PEJABAT-PENGELOLA-INFORMASI-DAN-DOKUMENTASI-PPID-.pdf';

// Proxy PDF sumber: server asal mengirim `X-Frame-Options: SAMEORIGIN`
// sehingga tidak bisa di-iframe lintas domain. Dengan me-stream ulang lewat
// domain sendiri, viewer PDF bawaan browser bisa menampilkannya.
export async function GET() {
  try {
    const upstream = await fetch(PDF_URL, { cache: 'no-store' });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Gagal mengambil dokumen (HTTP ${upstream.status})` },
        { status: 502 },
      );
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="SK-PPID.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Gagal mengambil dokumen: ${msg}` }, { status: 502 });
  }
}
