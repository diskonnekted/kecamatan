import type { PerangkatDesa, ProfilDesa } from '@/lib/db';
import { PROFIL_JENIS_LABEL } from '@/lib/queries';

const JENIS_ORDER = ['pemerintah', 'profil', 'sejarah', 'visi_misi', 'lembaga'];

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function AparaturGrid({ perangkat }: { perangkat: PerangkatDesa[] }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
        </span>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">Aparatur Desa</h2>
          <p className="text-sm text-[var(--color-muted)]">{perangkat.length} perangkat desa</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {perangkat.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
          >
            {p.foto_url ? (
              <img
                src={p.foto_url}
                alt={p.nama}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover object-top"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center bg-[var(--color-primary)]/5 text-[var(--color-muted)]">
                <UserIcon className="h-16 w-16" />
              </div>
            )}
            <div className="p-3 text-center">
              <p className="text-sm font-semibold leading-snug text-[var(--color-foreground)]">{p.nama}</p>
              {p.jabatan && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{p.jabatan}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesaProfilSection({
  items,
  perangkat = [],
}: {
  items: ProfilDesa[];
  perangkat?: PerangkatDesa[];
}) {
  // Bila data perangkat terstruktur tersedia, entri 'pemerintah' hasil scrape mentah
  // disembunyikan — digantikan grid aparatur yang rapi di atas.
  const visibleItems =
    perangkat.length > 0 ? items.filter((it) => it.jenis !== 'pemerintah') : items;

  if (visibleItems.length === 0 && perangkat.length === 0) return null;

  const groups = new Map<string, ProfilDesa[]>();
  for (const it of visibleItems) {
    const list = groups.get(it.jenis) || [];
    list.push(it);
    groups.set(it.jenis, list);
  }
  const sortedJenis = [...groups.keys()].sort(
    (a, b) => JENIS_ORDER.indexOf(a) - JENIS_ORDER.indexOf(b),
  );

  return (
    <section className="mb-10">
      {perangkat.length > 0 && <AparaturGrid perangkat={perangkat} />}

      {visibleItems.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332c0-.265-.108-.52-.3-.707M4.5 21V10.332c0-.265.108-.52.3-.707M3 21h18"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-foreground)]">Profil &amp; Pemerintahan Desa</h2>
              <p className="text-sm text-[var(--color-muted)]">
                Disalin otomatis dari situs resmi desa
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sortedJenis.map((jenis, gi) => {
              const list = groups.get(jenis)!;
              return (
                <details
                  key={jenis}
                  className="group rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
                  open={gi === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                        {PROFIL_JENIS_LABEL[jenis] ?? jenis}
                      </span>
                      <span className="text-sm text-[var(--color-muted)]">
                        {list.length} halaman
                      </span>
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="space-y-4 border-t border-[var(--color-border)] px-5 py-4">
                    {list.map((p) => (
                      <article key={p.id} className="rounded-xl bg-[var(--color-background)]/60 p-4">
                        <h3 className="mb-2 text-base font-semibold text-[var(--color-foreground)]">
                          {p.judul}
                        </h3>
                        {p.gambar && (
                          <img
                            src={p.gambar}
                            alt={p.judul}
                            loading="lazy"
                            className="mb-3 max-h-64 w-full rounded-lg object-cover"
                          />
                        )}
                        {p.konten_html ? (
                          <div
                            className="prose-article text-sm"
                            dangerouslySetInnerHTML={{ __html: p.konten_html }}
                          />
                        ) : (
                          <p className="text-sm text-[var(--color-muted)]">
                            Konten tidak tersedia.{' '}
                            <a
                              href={p.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--color-primary)] underline"
                            >
                              Lihat di situs desa
                            </a>
                          </p>
                        )}
                        <p className="mt-3 text-xs text-[var(--color-muted)]">
                          Sumber:{' '}
                          <a
                            href={p.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[var(--color-primary)]"
                          >
                            situs desa
                          </a>
                        </p>
                      </article>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
export { DesaProfilSection };
export default DesaProfilSection;
