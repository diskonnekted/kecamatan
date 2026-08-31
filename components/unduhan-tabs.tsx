import type { Unduhan } from "@/lib/db";

export function UnduhanTabNav({ active }: { active: string }) {
  const tabs = [
    { href: "/unduhan", label: "Semua", key: "all" },
    { href: "/unduhan/prosedur", label: "Prosedur", key: "prosedur" },
    { href: "/unduhan/regulasi", label: "Regulasi", key: "regulasi" },
    { href: "/unduhan/form-dokumen", label: "Dokumen", key: "form-dokumen" },
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

export function UnduhanHeader() {
  return (
    <header className="mb-10">
      <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
        · Unduhan
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
        Unduhan Dokumen
      </h1>
      <p className="text-lg text-[var(--color-muted-foreground)]">
        Kumpulan dokumen prosedur, regulasi, dan formulir yang dapat diunduh
      </p>
    </header>
  );
}

function getFileTypeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  return ext.toUpperCase();
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UnduhanCard({ item }: { item: Unduhan }) {
  const fileType = item.file_type ?? getFileTypeFromUrl(item.file_url);
  return (
    <a
      href={item.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-md transition-all"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[var(--color-destructive)]/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-destructive)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-destructive)] mb-1.5">
        {fileType}
      </span>
      <h3 className="text-xs sm:text-sm font-semibold text-center leading-snug line-clamp-3 min-h-[2.5rem]">
        {item.judul}
      </h3>
      {item.file_size ? (
        <span className="text-[10px] text-[var(--color-muted-foreground)] mt-1.5">
          {formatFileSize(item.file_size)}
        </span>
      ) : null}
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] group-hover:underline">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Unduh
      </span>
    </a>
  );
}

export function UnduhanEmpty({ kategori }: { kategori?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-muted)]/30 flex items-center justify-center mx-auto mb-3">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {kategori
          ? `Belum ada dokumen untuk kategori ${kategori}.`
          : "Belum ada dokumen yang tersedia."}
      </p>
    </div>
  );
}
