import {
  getStatistikPendidikanDirect,
  type StatistikPendidikanDirect,
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
  title: "Statistik Pendidikan - Kecamatan Banjarmangu",
};

export default async function StatistikPendidikanPage() {
  const data = await getStatistikPendidikanDirect();

  const totalKK = data.pendidikan_kk.reduce((s, d) => s + d.jumlah, 0);
  const totalSedang = data.pendidikan_sedang.reduce((s, d) => s + d.jumlah, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Statistik
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          Statistik Pendidikan
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          Kecamatan Banjarmangu
        </p>
        <div className="mt-2">
          <DesaConnectivityBadge ok={data.desa_ok} total={data.desa_count} />
        </div>
      </header>

      <StatistikTabNav active="pendidikan" />

      {/* Ringkasan */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Data Pendidikan KK"
            value={totalKK}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            }
          />
          <StatCard
            label="Total Pendidikan Sedang Ditempuh"
            value={totalSedang}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
              </svg>
            }
            color="text-indigo-600"
          />
          <StatCard
            label="Jenis Pendidikan KK"
            value={data.pendidikan_kk.length}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-4" />
              </svg>
            }
            color="text-green-600"
          />
          <StatCard
            label="Jenis Pendidikan Sedang Ditempuh"
            value={data.pendidikan_sedang.length}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-4" />
              </svg>
            }
            color="text-amber-600"
          />
        </div>
      </section>

      {/* Charts */}
      <div className="space-y-8">
        {data.pendidikan_kk.length > 0 && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="font-serif text-lg font-bold mb-4">Pendidikan Dalam KK</h3>
            <BarChartHorizontal data={data.pendidikan_kk.map(d => ({ label: d.nama, value: d.jumlah, color: d.color }))} />
          </section>
        )}

        {data.pendidikan_sedang.length > 0 && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="font-serif text-lg font-bold mb-4">Pendidikan Sedang Ditempuh</h3>
            <BarChartHorizontal data={data.pendidikan_sedang.map(d => ({ label: d.nama, value: d.jumlah, color: d.color }))} />
          </section>
        )}

        {data.pendidikan_kk.length === 0 && data.pendidikan_sedang.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-12 text-center">
            <p className="text-[var(--color-muted-foreground)]">Data statistik pendidikan belum tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
