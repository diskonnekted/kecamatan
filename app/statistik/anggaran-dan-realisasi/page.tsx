import { StatistikTabNav, DesaConnectivityBadge } from "@/components/statistik-charts";
import { DESA_BANJARMANGU } from "@/lib/seed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anggaran dan Realisasi - Kecamatan Banjarmangu",
};

export default function AnggaranRealisasiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Statistik
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          Anggaran dan Realisasi
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          Kecamatan Banjarmangu
        </p>
        <div className="mt-2">
          <DesaConnectivityBadge ok={DESA_BANJARMANGU.length} total={DESA_BANJARMANGU.length} />
        </div>
      </header>

      <StatistikTabNav active="anggaran" />

      {/* Info Section */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold mb-2">Data APBDes Belum Tersedia via API</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              Data anggaran dan realisasi APBDes (Anggaran Pendapatan dan Belanja Desa)
              saat ini belum tersedia melalui API OpenSID maupun OpenDK. Data APBDes
              setiap desa dapat diakses langsung melalui website masing-masing desa pada
              halaman transparansi anggaran.
            </p>
          </div>
        </div>
      </section>

      {/* Link ke setiap desa */}
      <section>
        <h3 className="font-serif text-lg font-bold mb-4">Akses APBDes Per Desa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESA_BANJARMANGU.map((desa) => (
            <a
              key={desa.slug}
              href={`${desa.website}/first/apbdes`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                  {desa.nama}
                </h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                  <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Lihat APBDes {desa.nama}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
