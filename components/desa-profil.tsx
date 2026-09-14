import type { ProfilDesa } from "@/lib/db";
import { PROFIL_JENIS_LABEL } from "@/lib/queries";

const JENIS_ORDER = ["pemerintah", "profil", "sejarah", "visi_misi", "lembaga"];

export function DesaProfilSection({ items }: { items: ProfilDesa[] }) {
  if (items.length === 0) return null;

  const groups = new Map<string, ProfilDesa[]>();
  for (const it of items) {
    const arr = groups.get(it.jenis) ?? [];
    arr.push(it);
    groups.set(it.jenis, arr);
  }
  const orderedJenis = [...groups.keys()].sort((a, b) => {
    const ia = JENIS_ORDER.indexOf(a);
    const ib = JENIS_ORDER.indexOf(b);
    return (ia === -1 ? 9 : ia) - (ib === -1 ? 9 : ib);
  });

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-foreground)]">
          Profil &amp; Pemerintahan Desa
        </h2>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="space-y-3">
        {orderedJenis.map((jenis, gi) => {
          const list = groups.get(jenis)!;
          return (
            <details
              key={jenis}
              open={gi === 0}
              className="group rounded-2xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/50 [&::-webkit-details-marker]:hidden">
                <span>
                  {PROFIL_JENIS_LABEL[jenis] ?? jenis}
                  <span className="ml-2 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                    {list.length}
                  </span>
                </span>
                <span className="text-[var(--color-muted-foreground)] transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="space-y-8 border-t border-[var(--color-border)] px-5 py-5">
                {list.map((p) => (
                  <article key={p.id}>
                    {list.length > 1 && (
                      <h3 className="mb-3 text-lg font-bold text-[var(--color-foreground)]">
                        {p.judul}
                      </h3>
                    )}
                    {p.gambar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.gambar}
                        alt={p.judul}
                        loading="lazy"
                        className="mb-4 max-h-64 w-full rounded-xl object-cover"
                      />
                    )}
                    {p.konten_html && (
                      <div
                        className="prose-article"
                        dangerouslySetInnerHTML={{ __html: p.konten_html }}
                      />
                    )}
                    <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
                      Sumber:{" "}
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--color-primary)] hover:underline"
                      >
                        {p.source_url}
                      </a>{" "}
                      · diperbarui {p.fetched_at}
                    </p>
                  </article>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
