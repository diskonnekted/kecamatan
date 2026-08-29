import {
  getStatistikKesehatanDirect,
} from "@/lib/statistik";
import {
  StatistikTabNav,
  DonutChart,
  BarChartHorizontal,
  StatCard,
  DesaConnectivityBadge,
} from "@/components/statistik-charts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Statistik Kesehatan - Kecamatan Banjarmangu",
};

export default async function StatistikKesehatanPage() {
  const data = await getStatistikKesehatanDirect();

  const totalCacat = data.cacat.reduce((s, d) => s + d.jumlah, 0);
  const totalPenyakit = data.penyakit.reduce((s, d) => s + d.jumlah, 0);
  const totalGolDarah = data.gol_darah.reduce((s, d) => s + d.jumlah, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Statistik
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          Statistik Kesehatan
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          Kecamatan Banjarmangu
        </p>
        <div className="mt-2">
          <DesaConnectivityBadge ok={data.desa_ok} total={data.desa_count} />
        </div>
      </header>

      <StatistikTabNav active="kesehatan" />

      {/* Ringkasan */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Penyandang Cacat"
            value={totalCacat}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4" r="2" /><path d="M19 7v1a7 7 0 0 1-7 7v4" /><path d="M5 7v1a7 7 0 0 0 7 7" /><path d="M5 11h2" /><path d="M17 11h2" />
              </svg>
            }
            color="text-red-600"
          />
          <StatCard
            label="Total Penyakit Kronis"
            value={totalPenyakit}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            color="text-orange-600"
          />
          <StatCard
            label="Total Golongan Darah"
            value={totalGolDarah}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6v4a6 6 0 0 1-6 6V3z" /><path d="M9 9a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V9h-6" /><path d="M9 17a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4" />
              </svg>
            }
            color="text-rose-600"
          />
        </div>
      </section>

      {/* Charts */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.cacat.length > 0 && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <h3 className="font-serif text-lg font-bold mb-4">Penyandang Cacat</h3>
              <DonutChart data={data.cacat.map(d => ({ label: d.nama, value: d.jumlah, color: d.color }))} />
            </section>
          )}
          {data.gol_darah.length > 0 && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <h3 className="font-serif text-lg font-bold mb-4">Golongan Darah</h3>
              <DonutChart data={data.gol_darah.map(d => ({ label: d.nama, value: d.jumlah, color: d.color }))} />
            </section>
          )}
        </div>

        {data.penyakit.length > 0 && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="font-serif text-lg font-bold mb-4">Penyakit Kronis</h3>
            <BarChartHorizontal data={data.penyakit.map(d => ({ label: d.nama, value: d.jumlah, color: d.color }))} />
          </section>
        )}

        {data.cacat.length === 0 && data.penyakit.length === 0 && data.gol_darah.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-12 text-center">
            <p className="text-[var(--color-muted-foreground)]">Data statistik kesehatan belum tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
