import Link from "next/link";
import { getBeritaPaginated } from "@/lib/queries";
import { BeritaCard } from "@/components/berita-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  page?: string;
};

const PAGE_SIZE = 12;

export const metadata = {
  title: "Berita Kecamatan",
  description: "Berita, pengumuman, dan kegiatan resmi dari Kecamatan Banjarmangu",
};

export default async function BeritaIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { items, total } = getBeritaPaginated(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Berita Kecamatan
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
          Berita Kecamatan Banjarmangu
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {total.toLocaleString("id-ID")} berita · halaman {page} dari {totalPages}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-12 text-center">
          <p className="text-[var(--color-muted-foreground)]">
            Belum ada berita dari kecamatan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((b) => (
            <BeritaCard key={b.id} berita={b} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={{ pathname: "/berita", query: { page: String(page - 1) } }}
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
              href={{ pathname: "/berita", query: { page: String(page + 1) } }}
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
