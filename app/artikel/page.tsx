import Link from "next/link";
import { getAllDesa, getRecentArtikel } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  desa?: string;
  page?: string;
};

const PAGE_SIZE = 12;

export default async function ArtikelIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const desaSlug = sp.desa;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const desaList = getAllDesa(true);
  const selectedDesa = desaSlug
    ? desaList.find((d) => d.slug === desaSlug) ?? null
    : null;

  // Query with LIMIT/OFFSET
  const offset = (page - 1) * PAGE_SIZE;
  const rows = selectedDesa
    ? (db
        .prepare(
          `SELECT a.id FROM artikel a JOIN desa d ON d.id = a.desa_id
           WHERE d.slug = ?
           ORDER BY COALESCE(a.published_at, a.fetched_at) DESC
           LIMIT ? OFFSET ?`,
        )
        .all(selectedDesa.slug, PAGE_SIZE, offset) as { id: number }[])
    : (db
        .prepare(
          `SELECT id FROM artikel
           ORDER BY COALESCE(published_at, fetched_at) DESC
           LIMIT ? OFFSET ?`,
        )
        .all(PAGE_SIZE, offset) as { id: number[] }[]);

  // For simplicity fetch full articles via getRecentArtikel (limit max)
  const all = getRecentArtikel(page * PAGE_SIZE, desaSlug);
  const artikel = all.slice(offset, offset + PAGE_SIZE);

  const totalRow = selectedDesa
    ? (db
        .prepare(
          `SELECT COUNT(*) AS c FROM artikel a JOIN desa d ON d.id = a.desa_id WHERE d.slug = ?`,
        )
        .get(selectedDesa.slug) as { c: number })
    : (db.prepare(`SELECT COUNT(*) AS c FROM artikel`).get() as { c: number });

  const totalPages = Math.max(1, Math.ceil(totalRow.c / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Arsip Artikel
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
          {selectedDesa
            ? `Artikel Desa ${selectedDesa.nama}`
            : "Semua Artikel"}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {totalRow.c.toLocaleString("id-ID")} artikel · halaman {page} dari {totalPages}
        </p>
      </header>

      {/* Filter desa */}
      <div className="mb-8 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-2 min-w-min pb-2">
          <Link
            href="/artikel"
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !selectedDesa
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-white text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            Semua
          </Link>
          {desaList.map((d) => (
            <Link
              key={d.id}
              href={`/artikel?desa=${d.slug}`}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedDesa?.id === d.id
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-white text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
            >
              {d.nama}
            </Link>
          ))}
        </div>
      </div>

      {artikel.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-12 text-center">
          <p className="text-[var(--color-muted-foreground)]">
            Belum ada artikel{selectedDesa ? ` dari Desa ${selectedDesa.nama}` : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artikel.map((a) => (
            <ArticleCard key={a.id} artikel={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={{
                pathname: "/artikel",
                query: { ...(desaSlug ? { desa: desaSlug } : {}), page: String(page - 1) },
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] text-sm font-semibold"
            >
              ← Sebelumnya
            </Link>
          )}
          <span className="px-3 py-2 text-sm font-semibold">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={{
                pathname: "/artikel",
                query: { ...(desaSlug ? { desa: desaSlug } : {}), page: String(page + 1) },
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] text-sm font-semibold"
            >
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
