import Link from "next/link";
import type { Desa } from "@/lib/db";

export function DesaCard({ desa, articleCount }: { desa: Desa; articleCount?: number }) {
  const hasArticles = typeof articleCount === "number" && articleCount > 0;
  // Gagal sinkron hanya ditampilkan sebagai error merah bila desa BELUM punya
  // artikel tersimpan. Kalau artikel sudah ada, kegagalan fetch terakhir hanya
  // berarti data mungkin tidak terbaru — artikel lama tetap valid ditampilkan.
  const syncFailed = !!desa.last_sync_at && desa.last_sync_status !== "ok" && desa.last_sync_status !== "success";
  const neverSynced = !desa.last_sync_at;

  return (
    <Link
      href={`/desa/${desa.slug}`}
      className="group relative flex flex-col h-full p-5 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm p-1">
          <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
        </div>
        {syncFailed && !hasArticles ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-red-50 text-red-700 border-red-200">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            Gagal Sinkronisasi
          </span>
        ) : syncFailed && hasArticles ? (
          <span
            title="Sinkronisasi terakhir gagal — menampilkan data tersimpan"
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-700 border-amber-200"
          >
            {articleCount!.toLocaleString("id-ID")} artikel
          </span>
        ) : neverSynced && !hasArticles ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-700 border-amber-200">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Belum Sinkronisasi
          </span>
        ) : (
          typeof articleCount === "number" && articleCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20">
              {articleCount.toLocaleString("id-ID")} artikel
            </span>
          )
        )}
      </div>

      <h3 className="font-serif text-lg font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] leading-tight mb-1 transition-colors">
        Desa {desa.nama}
      </h3>
      <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 mb-4">
        {new URL(desa.website).hostname}
      </p>

      <div className="mt-auto flex items-center text-[11px] text-[var(--color-muted-foreground)] border-t border-dashed border-[var(--color-border)] pt-3">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        Lihat halaman desa
      </div>

      {/* Hover arrow */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
