import { getAllDesa } from "@/lib/queries";
import { db } from "@/lib/db";
import { DesaCard } from "@/components/desa-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DesaListPage() {
  const desa = getAllDesa(false);
  const counts = db
    .prepare("SELECT desa_id, COUNT(*) AS c FROM artikel GROUP BY desa_id")
    .all() as Array<{ desa_id: number; c: number }>;
  const countMap = new Map(counts.map((r) => [r.desa_id, r.c]));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-secondary)] font-bold mb-1">
          · 17 Desa
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
          Portal Desa di Banjarmangu
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-2xl">
          Daftar 17 desa di Kecamatan Banjarmangu. Klik kartu untuk membuka
          halaman desa dan melihat artikel yang telah diagregasi dari website
          resmi desa.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {desa.map((d) => (
          <DesaCard
            key={d.id}
            desa={d}
            articleCount={countMap.get(d.id) ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
