import { getProfilKecamatan } from "@/lib/queries";
import { PpidTabNav, PpidHeader } from "@/components/ppid-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PPID - Informasi Setiap Saat - Kecamatan Banjarmangu",
};

const BASE_URL = "https://banjarmangu.banjarnegarakab.go.id";

const infoSetiapSaat = [
  { no: 1, name: "Daftar Informasi Publik", url: `${BASE_URL}/daftar-informasi-publik/` },
  { no: 2, name: "Peraturan, Keputusan, Kebijakan Badan Publik", url: `${BASE_URL}/peraturan-keputusan-kebijakan/` },
  { no: 3, name: "Organisasi Kelembagaan Badan Publik", url: `${BASE_URL}/organisasi-kelembagaan/` },
  { no: 4, name: "Surat Menyurat Pimpinan", url: `${BASE_URL}/surat-menyurat-pimpinan/` },
  { no: 5, name: "Data Perbendaharaan atau Inventarisir", url: `${BASE_URL}/data-perbendaharaan/` },
  { no: 6, name: "Renstra dan Renja Badan Publik", url: `${BASE_URL}/renstra-renja/` },
  { no: 7, name: "Agenda Kerja Pimpinan Satuan Kerja", url: "https://docs.google.com/spreadsheets/d/1yBFSfkYhG9c8aDtWWkX5eL3nXi00DbBre4wVZhF2l58/edit?gid=0#gid=0" },
  { no: 8, name: "Kegiatan Pelayanan Informasi Publik", url: `${BASE_URL}/kegiatan-pelayanan/` },
  { no: 9, name: "Informasi Wajib Diumumkan Secara Berkala", url: `${BASE_URL}/informasi-berkala/` },
];

export default function PpidSetiapSaatPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PpidHeader namaKecamatan={profil?.nama_kecamatan} />
      <PpidTabNav active="setiap-saat" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Informasi Setiap Saat
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Informasi yang tersedia setiap saat bagi masyarakat yang membutuhkan.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {infoSetiapSaat.map((item) => (
            <a
              key={item.no}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-center text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                {item.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Buka
              </span>
            </a>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-4 text-center">
          Data bersumber dari{" "}
          <a href={`${BASE_URL}/informasi-setiap-saat/`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
            {BASE_URL}/informasi-setiap-saat/
          </a>
        </p>
      </section>
    </div>
  );
}
