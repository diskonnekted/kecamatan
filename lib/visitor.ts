import { db } from './db';

export type VisitorStats = {
  hariIni: number;
  kemarin: number;
  mingguIni: number;
  bulanIni: number;
  tahunIni: number;
  total: number;
};

// Semua penanggalan memakai zona Asia/Jakarta agar konsisten dengan waktu lokal
function dateStr(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
}

export function recordVisit(): void {
  const today = dateStr(new Date());
  db.prepare(
    `INSERT INTO visitor_daily (date, count) VALUES (?, 1)
     ON CONFLICT(date) DO UPDATE SET count = count + 1`,
  ).run(today);
}

export function getVisitorStats(): VisitorStats {
  const rows = db.prepare('SELECT date, count FROM visitor_daily').all() as Array<{
    date: string;
    count: number;
  }>;

  const now = new Date();
  const today = dateStr(now);
  const yesterday = dateStr(new Date(now.getTime() - 86400000));

  // Awal minggu = Senin (konvensi Indonesia)
  const day = now.getDay(); // 0=Minggu ... 6=Sabtu
  const monday = new Date(now.getTime() - ((day + 6) % 7) * 86400000);
  const weekStart = dateStr(monday);

  const monthPrefix = today.slice(0, 7); // YYYY-MM
  const yearPrefix = today.slice(0, 4); // YYYY

  const stats: VisitorStats = {
    hariIni: 0,
    kemarin: 0,
    mingguIni: 0,
    bulanIni: 0,
    tahunIni: 0,
    total: 0,
  };

  for (const { date, count } of rows) {
    stats.total += count;
    if (date === today) stats.hariIni += count;
    if (date === yesterday) stats.kemarin += count;
    if (date >= weekStart && date <= today) stats.mingguIni += count;
    if (date.startsWith(monthPrefix)) stats.bulanIni += count;
    if (date.startsWith(yearPrefix)) stats.tahunIni += count;
  }

  return stats;
}
