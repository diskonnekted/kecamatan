"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const TABS: Tab[] = [
  {
    href: "/artikel",
    label: "Berita",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6z" />
      </svg>
    ),
  },
  {
    href: "/statistik",
    label: "Statistik",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/aduan",
    label: "Aduan",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/tentang",
    label: "Tentang",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    href: "/ppid",
    label: "Info",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
];

/**
 * Bottom navigation ala aplikasi Android native — hanya tampil di mobile
 * (md ke bawah) dan disembunyikan di area admin. Termasuk spacer agar
 * konten tidak tertutup nav, dengan dukungan safe-area (notch).
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Spacer setinggi nav agar konten tidak tertutup */}
      <div
        aria-hidden
        className="md:hidden"
        style={{ height: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      />
      <nav
        aria-label="Navigasi utama mobile"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid h-16 grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-[var(--color-muted)] ${
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-muted-foreground)]"
                }`}
              >
                {/* Indikator aktif ala Android */}
                <span
                  className={`absolute top-0 h-0.5 w-10 rounded-full bg-[var(--color-primary)] transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                {tab.icon(active)}
                <span
                  className={`text-[10px] leading-none ${
                    active ? "font-bold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
