import Link from "next/link";
import { getStatistikRingkasanSemuaDesa } from "@/lib/queries";
import { getDanaDesaPerKecamatan, getKecamatanPenduduk } from "@/lib/opendata";
import { BarList, fmtNum } from "@/components/analitik-charts";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Analitik Desa",
  description:
    "Analitik kependudukan dan keuangan desa-desa Kecamatan Banjarmangu, Kabupaten Banjarnegara — dari OpenSID desa, OpenDK kecamatan, dan Open Data Kabupaten Banjarnegara.",
};

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-foreground)]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{sub}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[var(--color-foreground)]">{title}</h2>
      {subtitle && <p className="mb-3 mt-0.5 text-xs text-[var(--color-muted-foreground)]">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </section>
  );
}

function formatRupiahSingkat(n: number): string {
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(2).replace(".", ",")} T`;
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2).replace(".", ",")} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1).replace(".", ",")} jt`;
  return `Rp ${fmtNum(n)}`;
}

export default async function AnalitikPage() {
  const [kec, danaDesa] = await Promise.all([getKecamatanPenduduk(), getDanaDesaPerKecamatan()]);
  const ringkasan = getStatistikRingkasanSemuaDesa();

  const perangkatCount = new Map<number, number>();
  for (const r of db
    .prepare("SELECT desa_id, COUNT(*) AS n FROM perangkat_desa GROUP BY desa_id")
    .all() as { desa_id: number; n: number }[]) {
    perangkatCount.set(r.desa_id, r.n);
  }
  const desaIdBySlug = new Map<string, number>();
  for (const r of db.prepare("SELECT id, slug FROM desa").all() as { id: number; slug: string }[]) {
    desaIdBySlug.set(r.slug, r.id);
  }

  // Dana desa: tren Banjarmangu + perbandingan kecamatan tahun terbaru
  const bjmRows = (danaDesa?.rows ?? [])
    .filter((r) => /^banjarmangu$/i.test(r.kecamatan.trim()))
    .sort((a, b) => a.tahun - b.tahun);
  const tahunTerbaru = danaDesa ? Math.max(...danaDesa.rows.map((r) => r.tahun)) : 0;
  const perKecTerbaru = (danaDesa?.rows ?? [])
    .filter((r) => r.tahun === tahunTerbaru)
    .sort((a, b) => b.nilai - a.nilai);
  const danaTerbaruBjm = bjmRows.length > 0 ? bjmRows[bjmRows.length - 1] : null;

  const desaDenganData = ringkasan.filter((r) => r.penduduk > 0).length;
  const totalPendudukTersalin = ringkasan.reduce((s, r) => s + r.penduduk, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Analitik Desa</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        Statistik kependudukan dan keuangan desa-desa Kecamatan Banjarmangu — disalin otomatis dari
        OpenSID tiap desa, OpenDK kecamatan, dan Open Data Kabupaten Banjarnegara.
      </p>

      {/* Ringkasan kecamatan */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card
          label="Penduduk Kecamatan"
          value={kec ? fmtNum(kec.totalPenduduk) : "—"}
          sub={kec ? `L ${fmtNum(kec.laki)} · P ${fmtNum(kec.perempuan)}` : "OpenDK tidak tersedia"}
        />
        <Card
          label="Dana Desa Banjarmangu"
          value={danaTerbaruBjm ? formatRupiahSingkat(danaTerbaruBjm.nilai) : "—"}
          sub={danaTerbaruBjm ? `tahun ${danaTerbaruBjm.tahun} (Open Data Kab.)` : undefined}
        />
        <Card label="Desa Aktif" value={String(ringkasan.length)} sub={`${desaDenganData} desa sudah punya data statistik`} />
        <Card
          label="Penduduk Tersalin"
          value={fmtNum(totalPendudukTersalin)}
          sub="dari situs desa (OpenSID)"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tren dana desa */}
        <Section
          title="Tren Dana Desa Kec. Banjarmangu"
          subtitle={
            danaDesa ? `${danaDesa.judulDataset} — ${danaDesa.urlDataset.replace(/^https?:\/\//, "")}` : undefined
          }
        >
          {bjmRows.length > 0 ? (
            <BarList
              rows={bjmRows.map((r) => ({ label: String(r.tahun), value: r.nilai }))}
              color="#16a34a"
            />
          ) : (
            <p className="text-sm italic text-[var(--color-muted-foreground)]">
              Data dana desa tidak dapat dimuat dari portal open data.
            </p>
          )}
          {bjmRows.length > 0 && (
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Angka dalam Rupiah. Bar menunjukkan proporsi terhadap tahun tertinggi; arahkan kursor ke
              label untuk nilai: {bjmRows.map((r) => `${r.tahun}: ${formatRupiahSingkat(r.nilai)}`).join(" · ")}
            </p>
          )}
        </Section>

        {/* Perbandingan kecamatan */}
        <Section
          title={`Dana Desa per Kecamatan (${tahunTerbaru || "—"})`}
          subtitle="Kabupaten Banjarnegara — posisi Banjarmangu dibanding kecamatan lain"
        >
          {perKecTerbaru.length > 0 ? (
            <BarList
              rows={perKecTerbaru.map((r) => ({
                label: /^banjarmangu$/i.test(r.kecamatan.trim()) ? `▶ ${r.kecamatan}` : r.kecamatan,
                value: r.nilai,
              }))}
              color="#2563eb"
            />
          ) : (
            <p className="text-sm italic text-[var(--color-muted-foreground)]">
              Data perbandingan tidak dapat dimuat.
            </p>
          )}
        </Section>
      </div>

      {/* Tabel perbandingan desa */}
      <div className="mt-4">
        <Section
          title="Perbandingan Antar-Desa"
          subtitle="Penduduk menurut statistik OpenSID masing-masing desa; klik Analitik untuk rincian per desa"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  <th className="py-2 pr-3">Desa</th>
                  <th className="py-2 pr-3 text-right">Penduduk</th>
                  <th className="py-2 pr-3 text-right">L / P</th>
                  <th className="py-2 pr-3 text-right">% Kec.</th>
                  <th className="py-2 pr-3 text-right">Perangkat</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {[...ringkasan]
                  .sort((a, b) => b.penduduk - a.penduduk)
                  .map((r) => (
                    <tr key={r.slug} className="border-b border-[var(--color-border)]/60 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-[var(--color-foreground)]">
                        <Link href={`/desa/${r.slug}`} className="hover:text-[var(--color-primary)] hover:underline">
                          {r.nama}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {r.penduduk > 0 ? fmtNum(r.penduduk) : <span className="text-[var(--color-muted-foreground)]">—</span>}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--color-muted-foreground)]">
                        {r.penduduk > 0 ? `${fmtNum(r.laki)} / ${fmtNum(r.perempuan)}` : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--color-muted-foreground)]">
                        {kec && kec.totalPenduduk > 0 && r.penduduk > 0
                          ? `${((r.penduduk / kec.totalPenduduk) * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {perangkatCount.get(desaIdBySlug.get(r.slug) ?? -1) ?? 0}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/desa/${r.slug}/analitik`}
                          className="inline-block rounded-lg bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                        >
                          Analitik →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
        Sumber: OpenSID situs resmi desa · OpenDK Kecamatan Banjarmangu ·{" "}
        <a
          href="https://opendata.banjarnegarakab.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open Data Kabupaten Banjarnegara
        </a>
        {" · "}Lihat juga:{" "}
        <Link href="/statistik/anggaran-dan-realisasi" className="underline">
          Statistik APBDes
        </Link>{" "}
        ·{" "}
        <Link href="/statistik/program-dan-bantuan" className="underline">
          Program &amp; Bantuan
        </Link>
      </p>
    </div>
  );
}
