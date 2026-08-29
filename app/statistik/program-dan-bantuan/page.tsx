import {
  getProgramBantuanDirect,
  type DesaProgramBantuan,
} from "@/lib/statistik";
import {
  StatistikTabNav,
  StatCard,
  DesaConnectivityBadge,
} from "@/components/statistik-charts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Program dan Bantuan - Kecamatan Banjarmangu",
};

export default async function ProgramBantuanPage() {
  const data = await getProgramBantuanDirect();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
          · Statistik
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3">
          Program dan Bantuan
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          Kecamatan Banjarmangu
        </p>
        <div className="mt-2">
          <DesaConnectivityBadge ok={data.desa_ok} total={data.desa_count} />
        </div>
      </header>

      <StatistikTabNav active="program" />

      {/* Ringkasan */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Program"
            value={data.total_program}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9M14 17H5M17 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM7 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" />
              </svg>
            }
            color="text-blue-600"
          />
          <StatCard
            label="Desa dengan Program"
            value={data.desa_ok}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
            }
            color="text-green-600"
            sub={`dari ${data.desa_count} desa`}
          />
          <StatCard
            label="Desa Tanpa Program"
            value={data.desa_count - data.desa_ok}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            }
            color="text-amber-600"
          />
        </div>
      </section>

      {/* Tabel Program Tersebar */}
      {data.aggregated.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 mb-8">
          <h3 className="font-serif text-lg font-bold mb-4">Program Tersebar di Desa</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 px-3 font-semibold text-[var(--color-foreground)]">Nama Program</th>
                  <th className="text-center py-2 px-3 font-semibold text-[var(--color-foreground)]">Jumlah Desa</th>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--color-foreground)]">Desa Pelaksana</th>
                </tr>
              </thead>
              <tbody>
                {data.aggregated.map((prog, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-muted)]/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{prog.nama}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {prog.jumlah_desa}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-muted-foreground)] text-xs">
                      {prog.desa_list.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Program Per Desa */}
      <section>
        <h3 className="font-serif text-lg font-bold mb-4">Program Per Desa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.per_desa.map((desa) => (
            <DesaProgramCard key={desa.desa_slug} data={desa} />
          ))}
        </div>
      </section>

      {data.total_program === 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-12 text-center">
          <p className="text-[var(--color-muted-foreground)]">Data program dan bantuan belum tersedia.</p>
        </div>
      )}
    </div>
  );
}

function DesaProgramCard({ data }: { data: DesaProgramBantuan }) {
  const isError = data.status === "error";
  const isEmpty = data.status === "empty";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-primary)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-[var(--color-foreground)]">{data.desa_nama}</h4>
        <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline">
          Desa →
        </a>
      </div>
      {isError || isEmpty ? (
        <p className="text-xs text-[var(--color-muted-foreground)] py-3 text-center">
          {isError ? "Gagal mengambil data" : "Belum ada program terdata"}
        </p>
      ) : (
        <div className="space-y-1.5">
          {data.program.slice(0, 8).map((prog, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-foreground)] truncate" title={prog.nama}>{prog.nama}</span>
              <span className="text-[var(--color-muted-foreground)] ml-2 flex-shrink-0">{prog.nama_sasaran}</span>
            </div>
          ))}
          {data.program.length > 8 && (
            <p className="text-[10px] text-[var(--color-muted-foreground)] pt-1">
              +{data.program.length - 8} program lainnya
            </p>
          )}
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]/50 text-xs text-[var(--color-muted-foreground)]">
            Total: {data.program.length} program
          </div>
        </div>
      )}
    </div>
  );
}
