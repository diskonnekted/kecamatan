/**
 * Visitor counter ala OpenDK `desa-visitor-container`:
 * - List dengan badge berwarna di kanan:
 *   Hari Ini = bg-red
 *   Kemarin  = bg-purple
 *   Minggu    = bg-green
 *   Bulan     = bg-yellow
 *   Tahun     = bg-gray
 *   Total     = bg-blue
 */
export type VisitorStats = {
  hariIni: number;
  kemarin: number;
  mingguIni: number;
  bulanIni: number;
  tahunIni: number;
  total: number;
};

const EMPTY: VisitorStats = {
  hariIni: 0,
  kemarin: 0,
  mingguIni: 0,
  bulanIni: 0,
  tahunIni: 0,
  total: 0,
};

const BADGE: Record<keyof VisitorStats, string> = {
  hariIni: "bg-[var(--color-destructive)]",
  kemarin: "bg-purple-500",
  mingguIni: "bg-[var(--color-success)]",
  bulanIni: "bg-[var(--color-warning)]",
  tahunIni: "bg-slate-500",
  total: "bg-[var(--color-primary)]",
};

const LABEL: Record<keyof VisitorStats, string> = {
  hariIni: "Hari Ini",
  kemarin: "Kemarin",
  mingguIni: "Minggu Ini",
  bulanIni: "Bulan Ini",
  tahunIni: "Tahun Ini",
  total: "Total",
};

function fmt(n: number) {
  return n.toLocaleString("id-ID") + " Kunjungan";
}

export function VisitorCounter({ stats = EMPTY }: { stats?: Partial<VisitorStats> }) {
  const merged: VisitorStats = { ...EMPTY, ...stats };
  const keys = Object.keys(LABEL) as Array<keyof VisitorStats>;
  return (
    <ul className="divide-y divide-[var(--color-border)] -my-1">
      {keys.map((k) => (
        <li
          key={k}
          className="flex items-center justify-between py-2 text-sm font-semibold text-[var(--color-foreground)]"
        >
          <span>{LABEL[k]}</span>
          <span
            className={`${BADGE[k]} text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full`}
          >
            {fmt(merged[k])}
          </span>
        </li>
      ))}
    </ul>
  );
}
