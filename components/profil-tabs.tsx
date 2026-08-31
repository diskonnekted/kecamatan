import type { ProfilKecamatan } from "@/lib/queries";

export function renderText(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/\n/g, "<br/>")
    .replace(/\n\d[\.\)\]\s]/g, "<br/>$&")
    .trim();
}

export function ProfilTabNav({ active }: { active: string }) {
  const tabs = [
    { href: "/profil", label: "Sejarah", key: "sejarah" },
    { href: "/profil/letak-geografis", label: "Letak Geografis", key: "letak" },
    { href: "/profil/struktur-pemerintahan", label: "Struktur Pemerintahan", key: "struktur" },
    { href: "/profil/visi-misi", label: "Visi & Misi", key: "visi-misi" },
    { href: "/profil/tupoksi", label: "Tupoksi", key: "tupoksi" },
  ];
  return (
    <div className="flex flex-nowrap md:flex-wrap gap-2 mb-8 border-b border-[var(--color-border)] pb-1 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <a
          key={tab.key}
          href={tab.href}
          className={`shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            active === tab.key
              ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] -mb-px"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          }`}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
}

export function ProfilHeader({ profil }: { profil: ProfilKecamatan }) {
  return (
    <>
      {/* Header */}
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Profil
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          {profil.nama_kecamatan}
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          {profil.kabupaten}, {profil.provinsi}
        </p>
      </header>

      {/* Info Grid */}
      {(profil.alamat_kantor || profil.telepon_kantor || profil.email_kantor) && (
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {profil.alamat_kantor && (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">Alamat</h3>
              </div>
              <p className="text-sm text-[var(--color-foreground)]">{profil.alamat_kantor}</p>
            </div>
          )}
          {profil.telepon_kantor && (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">Telepon</h3>
              </div>
              <p className="text-sm text-[var(--color-foreground)]">{profil.telepon_kantor}</p>
            </div>
          )}
          {profil.email_kantor && (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">Email</h3>
              </div>
              <p className="text-sm text-[var(--color-foreground)]">{profil.email_kantor}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function EmptyContent({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-12 text-center">
      <p className="text-[var(--color-muted-foreground)]">Data {label} belum tersedia.</p>
    </div>
  );
}
