import { getProfilKecamatan } from "@/lib/queries";
import { PpidTabNav, PpidHeader } from "@/components/ppid-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PPID - Informasi Berkala - Kecamatan Banjarmangu",
};

const B = "https://banjarmangu.banjarnegarakab.go.id";

type DocRow = {
  no: number;
  name: string;
  years: Record<number, string | null>;
};

const docs: DocRow[] = [
  { no: 1, name: "RENSTRA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RENSTRA-2023-2026-KECAMATAN-BANJARMANGU.pdf`, 2024: `${B}/wp-content/uploads/2026/06/RENSTRA-2023-2026-KECAMATAN-BANJARMANGU-2.pdf`, 2025: `${B}/wp-content/uploads/2025/06/RENSTRA-2023-2026-KECAMATAN-BANJARMANGU.pdf`, 2026: `${B}/wp-content/uploads/2026/06/RENSTRA-KECAMATAN-BANJARMANGU-TAHUN-2025-2029.pdf` } },
  { no: 2, name: "RKT", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RKT-KEC-Banjarmangu-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/RKT-KEC-Banjarmangu-2024-1.pdf`, 2025: `${B}/wp-content/uploads/2025/06/RKT-KEC-Banjarmangu-2025-1.pdf`, 2026: `${B}/wp-content/uploads/2026/04/RKT-KEC-BANJARMANGU-2026.pdf` } },
  { no: 3, name: "RENJA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RENJA-23-BANJARMANGU.pdf`, 2024: `${B}/wp-content/uploads/2025/03/Renja-Banjarmangu-Penyelarasan-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/Renja-2025-Kec.-Banjarmangu.pdf`, 2026: `${B}/wp-content/uploads/2026/04/RKT-KEC-BANJARMANGU-2026.pdf` } },
  { no: 4, name: "LRA", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 5, name: "DPA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/DPA-2023-Kec.-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/03/DPA-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/DPA-2025.pdf`, 2026: `${B}/wp-content/uploads/2026/05/DPA-Banjarmangu-2026.pdf` } },
  { no: 6, name: "DPPA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/DPPA-SKPD-KEC.-BMG-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/DPA-Perubahan-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/DPA-Perubahan-2025.pdf`, 2026: null } },
  { no: 7, name: "RKA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RKA-2023-Kec.-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/03/RKA-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/RKA-2025.pdf`, 2026: `${B}/wp-content/uploads/2026/04/DPA-Banjarmangu-2026.pdf` } },
  { no: 8, name: "RKA Perubahan", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RKAP-SKPD-KEC.-BMG-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/RKA-Perubahan-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/RKA-Perubahan-2025.pdf`, 2026: null } },
  { no: 9, name: "KAK", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 10, name: "RKO", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 11, name: "LAPORAN POK", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 12, name: "LKJIP", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/LKJIP-2023-BANJARMANGU.pdf`, 2024: `${B}/wp-content/uploads/2025/03/LKJIP-2024-Kec-Banjarmangu-revisi-1.pdf`, 2025: `${B}/wp-content/uploads/2026/04/LKJIP-Tahun-2025-Kec-Banjarmangu.pdf`, 2026: null } },
  { no: 13, name: "IKU", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/IKU-Banjarmangu.pdf`, 2025: `${B}/wp-content/uploads/2025/06/IKU-Banjarmangu.pdf`, 2026: `${B}/wp-content/uploads/2026/04/IKU-BANJARMANGU-2023-2026_0001.pdf` } },
  { no: 14, name: "NERACA", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 15, name: "DAFTAR ASET & INVENTARISASI", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 16, name: "PROFIL PIMPINAN", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 17, name: "LHKPN PIMPINAN", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 18, name: "INFORMASI MEKANISME PERMOHONAN", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 19, name: "RUP", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 20, name: "AKUNTABILITAS KIN", years: { 2022: null, 2023: null, 2024: null, 2025: null, 2026: null } },
  { no: 21, name: "PK PIMPINAN", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Perjanjian-Kinerja-Camat-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/03/PK-Camat-penyelarasan.pdf`, 2025: `${B}/wp-content/uploads/2026/04/PK-Camat.pdf`, 2026: `${B}/wp-content/uploads/2026/06/PK-CAMAT-BANJARMANGU-2026.pdf` } },
  { no: 22, name: "PK PERUBAHAN PIMPINAN", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Perjanjian-Kinerja-Camat-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/03/PK-Perubahan-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/PK-Camat-Banjarmangu-Perubahan-2025.pdf`, 2026: null } },
  { no: 23, name: "PK PEGAWAI", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Perjanjian-Kinerja-Camat-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/06/PK-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/PK-Kecamatan-Banjarmangu-2025.pdf`, 2026: `${B}/wp-content/uploads/2026/06/PK-CAMAT-BANJARMANGU-2026.pdf` } },
  { no: 24, name: "PK PERUBAHAN PEGAWAI", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Perjanjian-Kinerja-Camat-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/03/PK-Perubahan-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/PK-PERUBAHAN-KECAMATAN-BANJARMANGU-2025.pdf`, 2026: null } },
  { no: 25, name: "RENCANA AKSI", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/RENCANA-AKSI-PENCAPAIAN-KINERJA-TAHUN-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/Rencana-Aksi-Banjarmangu-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/Rencana-Aksi-2025.pdf`, 2026: `${B}/wp-content/uploads/2026/06/Rencana-Aksi-2026.pdf` } },
  { no: 26, name: "CASCADING", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Cascading-2023-2026-Banjarmangu.pdf`, 2024: `${B}/wp-content/uploads/2025/06/Cascading-Banjarmangu-Penyelarasan.pdf`, 2025: `${B}/wp-content/uploads/2025/06/Cascading-Banjarmangu-Penyelarasan.pdf`, 2026: `${B}/wp-content/uploads/2026/06/CASCADING-IKU-DAN-POKIN-BANJARMANGU-2026-2030.pdf` } },
  { no: 27, name: "LHE SAKIP", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/TL-LHE-SAKIP-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/LHE_2023-Inspektorat.pdf`, 2025: `${B}/wp-content/uploads/2026/04/LHE-2025.pdf`, 2026: null } },
  { no: 28, name: "PENGUKURAN KINERJA", years: { 2022: null, 2023: `${B}/wp-content/uploads/2024/05/Pengukuran-Kinerja-Tahun-2023.pdf`, 2024: `${B}/wp-content/uploads/2025/03/Pengukuran-Kinerja-Banjarmangu-2024.pdf`, 2025: null, 2026: null } },
  { no: 29, name: "REALISASI CAPAIAN KINERJA DAN KEUANGAN", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/03/Laporan-evaluasi-pengukuran-kinerja-2023.pdf`, 2025: null, 2026: null } },
  { no: 30, name: "EVALUASI PENGUKURAN KINERJA TRI WULAN I", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/EVALUASI-PENGUKURAN-KINERJA-2024-Banjarmangu-TW-I.pdf`, 2025: `${B}/wp-content/uploads/2025/06/EVALUASI-PENGUKURAN-KINERJA-2025-Banjarmangu-TW-I.pdf`, 2026: `${B}/wp-content/uploads/2026/06/Laporan-Capaian-Kinerja-Tri-wulan-I-Tahun-2026.pdf` } },
  { no: 31, name: "EVALUASI PENGUKURAN KINERJA TRI WULAN II", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/EVALUASI-PENGUKURAN-KINERJA-2024-Banjarmangu-TW-II.pdf`, 2025: `${B}/wp-content/uploads/2026/04/LAPORAN-CAPAIAN-KINERJA-TW-II-TAHUN-2025.pdf`, 2026: null } },
  { no: 32, name: "EVALUASI PENGUKURAN KINERJA TRI WULAN III", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/EVALUASI-PENGUKURAN-KINERJA-2024-Banjarmangu-TW-III.pdf`, 2025: `${B}/wp-content/uploads/2026/04/LAPORAN-CAPAIAN-KINERJA-TW-III-TAHUN-2025.pdf`, 2026: null } },
  { no: 33, name: "EVALUASI PENGUKURAN KINERJA TRI WULAN IV", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/EVALUASI-PENGUKURAN-KINERJA-2024-Banjarmangu-TW-IV.pdf`, 2025: `${B}/wp-content/uploads/2026/04/LAPORAN-CAPAIAN-KINERJA-TW-IV-TAHUN-2025.pdf`, 2026: null } },
  { no: 34, name: "PENGUKURAN KINERJA TRI WULAN I", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/Pengukuran-Kinerja-Banjarmangu-TW-I-2024.pdf`, 2025: `${B}/wp-content/uploads/2025/06/Pengukuran-Kinerja-TW-I-Tahun-2025.pdf`, 2026: `${B}/wp-content/uploads/2026/06/Pengukuran-Kinerja-TW-I-Tahun-2026.pdf` } },
  { no: 35, name: "PENGUKURAN KINERJA TRI WULAN II", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/Pengukuran-Kinerja-Banjarmangu-TW-II-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/Pengukuran-Kinerja-TW-II-Tahun-2025.pdf`, 2026: null } },
  { no: 36, name: "PENGUKURAN KINERJA TRI WULAN III", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/Pengukuran-Kinerja-Banjarmangu-TW-III-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/Pengukuran-Kinerja-TW-III-Tahun-2025.pdf`, 2026: null } },
  { no: 37, name: "PENGUKURAN KINERJA TRI WULAN IV", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/Pengukuran-Kinerja-Banjarmangu-TW-IV-2024.pdf`, 2025: `${B}/wp-content/uploads/2026/04/Pengukuran-Kinerja-TW-IV-Tahun-2025.pdf`, 2026: null } },
  { no: 38, name: "SOP EVALUASI KINERJA INTERNAL", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/SOP-Evaluasi-kinerja-internal-Banjarmangu.pdf`, 2025: `${B}/wp-content/uploads/2025/06/SOP-Evaluasi-kinerja-internal-Banjarmangu.pdf`, 2026: `${B}/wp-content/uploads/2025/06/SOP-Evaluasi-kinerja-internal-Banjarmangu.pdf` } },
  { no: 39, name: "SOP MEKANISME PENGUMPULAN DATA KINERJA", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Data-Kinerja-BJM.pdf`, 2025: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Data-Kinerja-BJM.pdf`, 2026: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Data-Kinerja-BJM.pdf` } },
  { no: 40, name: "SOP MEKANISME PENGUKURAN KINERJA", years: { 2022: null, 2023: null, 2024: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Pengukuran-Kinerja-BJM.pdf`, 2025: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Pengukuran-Kinerja-BJM.pdf`, 2026: `${B}/wp-content/uploads/2025/06/SOP-Mekanisme-Pengumpulan-Pengukuran-Kinerja-BJM.pdf` } },
  { no: 41, name: "MAKLUMAT PELAYANAN", years: { 2022: null, 2023: null, 2024: null, 2025: `${B}/wp-content/uploads/2025/11/maklumat-pelayanan.pdf`, 2026: null } },
  { no: 42, name: "STANDAR PELAYANAN", years: { 2022: null, 2023: null, 2024: null, 2025: `${B}/wp-content/uploads/2025/08/standar-pelayanan-aplud.docx`, 2026: null } },
];

const YEARS = [2022, 2023, 2024, 2025, 2026];

function DownloadLink({ url }: { url: string | null }) {
  if (!url) {
    return <span className="text-[var(--color-muted-foreground)]/40 text-xs">—</span>;
  }
  const isPdf = url.endsWith(".pdf");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isPdf ? "#dc2626" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isPdf ? (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </>
        ) : (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </>
        )}
      </svg>
      Unduh
    </a>
  );
}

export default function PpidBerkalaPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PpidHeader namaKecamatan={profil?.nama_kecamatan} />
      <PpidTabNav active="berkala" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          Informasi Berkala
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Informasi berkala yang harus diumumkan secara rutin oleh Kecamatan Banjarmangu.
        </p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-primary)]/5 border-b border-[var(--color-border)]">
                  <th className="px-3 py-3 text-left font-bold text-[var(--color-foreground)] w-10">No</th>
                  <th className="px-3 py-3 text-left font-bold text-[var(--color-foreground)] min-w-[200px]">Nama Dokumen</th>
                  {YEARS.map((y) => (
                    <th key={y} className="px-3 py-3 text-center font-bold text-[var(--color-foreground)] whitespace-nowrap">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr key={doc.no} className={`border-b border-[var(--color-border)]/50 ${i % 2 === 0 ? "" : "bg-[var(--color-primary)]/[.02]"}`}>
                    <td className="px-3 py-2.5 text-[var(--color-muted-foreground)] tabular-nums">{doc.no}</td>
                    <td className="px-3 py-2.5 font-medium text-[var(--color-foreground)]">{doc.name}</td>
                    {YEARS.map((y) => (
                      <td key={y} className="px-3 py-2.5 text-center whitespace-nowrap">
                        <DownloadLink url={doc.years[y] ?? null} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted-foreground)] mt-3 text-center">
          Data bersumber dari{" "}
          <a href={`${B}/informasi-berkala/`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
            {B}/informasi-berkala/
          </a>
        </p>
      </section>
    </div>
  );
}
