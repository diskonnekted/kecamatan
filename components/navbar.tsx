"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/navigation";

interface NavbarProps {
  desa: Array<{ id: number; slug: string; nama: string }>;
}

/** Recursively render nav items (desktop dropdown) */
function NavItems({ items, depth = 0 }: { items: typeof NAV_LINKS; depth?: number }) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        return (
          <li key={item.href + item.label} className="relative group list-none" style={{ listStyle: 'none' }}>
            {hasChildren ? (
              <>
                <button
                  className="px-3 py-2 text-sm font-medium text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)] rounded-md hover:bg-[var(--color-muted)] transition-colors cursor-pointer flex items-center gap-1 text-sm no-underline"
                  style={{ listStyle: 'none', textDecoration: 'none' }}
                >
                  {item.label}
                  <svg className="w-3 h-3 -mr-0.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <ul className="hidden group-hover:block absolute top-full left-0 min-w-[200px] z-50 bg-white border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden">
                  {/* invisible connector to bridge gap between button and dropdown */}
                  <div className="absolute -top-3 left-0 right-0 h-4" />
                  <NavItems items={item.children!} depth={depth + 1} />
                </ul>
              </>
            ) : (
              <Link
                href={item.href}
                target={item.target}
                className="px-3 py-2 text-sm font-medium text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)] rounded-md hover:bg-[var(--color-muted)] transition-colors cursor-pointer block no-underline"
                style={{ listStyle: 'none', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </>
  );
}

export function Navbar({ desa }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Logo Kecamatan"
              className="h-9 w-9 rounded-lg shadow-sm group-hover:scale-105 transition-transform object-contain"
            />
            <div className="hidden sm:block leading-tight">
              <div className="font-serif text-base font-semibold text-[var(--color-foreground)]">
                SIDATEKA BANJARMANGU
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
                Sistim Informasi Desa Terintegrasi Kecamatan
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" style={{ listStyle: 'none' }}>
            <NavItems items={NAV_LINKS} />
            <Link
              href="/admin"
              className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] bg-[var(--color-primary)] hover:bg-[var(--color-foreground)] rounded-md transition-colors cursor-pointer"
            >
              Admin
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile desa links (compact list) */}
            <details className="relative group">
              <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-[var(--color-muted)] transition-colors text-xs font-medium" style={{ listStyle: 'none' }}>
                Desa
                <svg className="inline-block ml-1 w-3 h-3 -mt-0.5 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-40 bg-white border border-[var(--color-border)] rounded-lg shadow-xl p-2 z-50 max-h-60 overflow-y-auto">
                {desa.map((d) => (
                  <Link
                    key={d.id}
                    href={`/desa/${d.slug}`}
                    className="block px-3 py-1.5 text-xs text-[var(--color-foreground)]/80 hover:bg-[var(--color-muted)] rounded-md"
                  >
                    {d.nama}
                  </Link>
                ))}
              </div>
            </details>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 space-y-1" style={{ listStyle: 'none' }}>
            <NavItems items={NAV_LINKS} />
            <div className="my-2 h-px bg-[var(--color-border)]" />
            <div className="px-3 pb-1 pt-1 text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
              Desa
            </div>
            {desa.map((d) => (
              <Link
                key={d.id}
                href={`/desa/${d.slug}`}
                className="block px-3 py-1.5 text-sm text-[var(--color-foreground)]/80 hover:bg-[var(--color-muted)] rounded-md"
              >
                {d.nama}
              </Link>
            ))}
            <div className="my-2 h-px bg-[var(--color-border)]" />
            <Link
              href="/admin"
              className="block px-3 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md text-center"
            >
              Login Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
