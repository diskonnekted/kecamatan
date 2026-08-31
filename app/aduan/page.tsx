import type { Metadata } from "next";
import Link from "next/link";
import { AduanForm } from "@/components/aduan-form";
import { getAllDesa, JENIS_ADUAN } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Aduan Masyarakat",
  description: "Sampaikan aduan terkait pelayanan publik di Kecamatan Banjarmangu dan pantau status penanganannya.",
};

export const dynamic = "force-dynamic";

export default function AduanPage() {
  const desa = getAllDesa(true);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Layanan
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Aduan Masyarakat</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-2xl">
          Sampaikan keluhan, kritik, atau laporan terkait pelayanan publik di Kecamatan Banjarmangu.
          Setiap aduan mendapatkan nomor tracking yang dapat dipantau statusnya.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AduanForm
            desaOptions={desa.map((d) => ({ id: d.id, nama: d.nama }))}
            jenisOptions={[...JENIS_ADUAN]}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-serif text-base font-bold mb-3">Sudah Punya Nomor Aduan?</h2>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
              Pantau status penanganan aduan Anda dengan nomor tracking.
            </p>
            <Link
              href="/aduan/lacak"
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-warning)] hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Lacak Aduan
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-serif text-base font-bold mb-3">Alur Penanganan</h2>
            <ol className="space-y-2.5 text-xs text-[var(--color-muted-foreground)]">
              {[
                ["1", "Kirim aduan melalui formulir"],
                ["2", "Catat nomor tracking yang muncul"],
                ["3", "Petugas memverifikasi & memproses"],
                ["4", "Pantau status lewat menu Lacak Aduan"],
              ].map(([n, t]) => (
                <li key={n} className="flex gap-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold">
                    {n}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
