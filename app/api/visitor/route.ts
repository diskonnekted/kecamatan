import { NextResponse } from 'next/server';
import { recordVisit } from '@/lib/visitor';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    recordVisit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
