export function PelayananTabNav({ active }: { active: string }) {
  const tabs = [
    { href: "/pelayanan-publik", label: "Standar Pelayanan", key: "standar" },
    { href: "/pelayanan-publik/maklumat-pelayanan", label: "Maklumat Pelayanan", key: "maklumat" },
    { href: "/pelayanan-publik/sop", label: "SOP", key: "sop" },
    { href: "/pelayanan-publik/sk-standar-pelayanan", label: "SK Standar Pelayanan", key: "sk-standar" },
    { href: "/pelayanan-publik/sk-jam-pelayanan", label: "SK Jam Pelayanan", key: "sk-jam" },
    { href: "/pelayanan-publik/sk-maklumat-pelayanan", label: "SK Maklumat Pelayanan", key: "sk-maklumat" },
    { href: "/pelayanan-publik/hasil-survei", label: "Hasil Survei SKM", key: "survei" },
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

export function PelayananHeader({ namaKecamatan }: { namaKecamatan?: string }) {
  return (
    <header className="mb-10">
      <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
        · Pelayanan Publik
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
        Pelayanan Publik
      </h1>
      <p className="text-lg text-[var(--color-muted-foreground)]">
        Kecamatan {namaKecamatan ?? "Banjarmangu"}
      </p>
    </header>
  );
}
