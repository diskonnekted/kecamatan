export function PpidTabNav({ active }: { active: string }) {
  const tabs = [
    { href: "/ppid", label: "Profil PPID", key: "profil" },
    { href: "/ppid/informasi-berkala", label: "Informasi Berkala", key: "berkala" },
    { href: "/ppid/informasi-setiap-saat", label: "Informasi Setiap Saat", key: "setiap-saat" },
    { href: "/ppid/surat-keputusan", label: "Surat Keputusan", key: "sk" },
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

export function PpidHeader({ namaKecamatan }: { namaKecamatan?: string }) {
  return (
    <header className="mb-10">
      <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
        · PPID
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
        Pejabat Pengelola Informasi dan Dokumentasi
      </h1>
      <p className="text-lg text-[var(--color-muted-foreground)]">
        Kecamatan {namaKecamatan ?? "Banjarmangu"}
      </p>
    </header>
  );
}
