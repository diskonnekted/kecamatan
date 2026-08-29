import { getProfilKecamatan } from "@/lib/queries";
import { PpidTabNav, PpidHeader } from "@/components/ppid-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PPID - Profil PPID - Kecamatan Banjarmangu",
};

const BASE_URL = "https://banjarmangu.banjarnegarakab.go.id";

const skPpidLinks = [
  { name: "SK PPID", url: "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2025/08/SK-PENUNJUKAN-PEJABAT-PENGELOLA-INFORMASI-DAN-DOKUMENTASI-PPID-.pdf" },
  { name: "Tarif PPID", url: `${BASE_URL}/wp-content/uploads/2025/08/` },
  { name: "Maklumat", url: "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2025/11/maklumat-pelayanan.pdf" },
  { name: "SK DIP", url: "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2025/08/SK-DAFTAR-INFORMASI-PUBLIK.pdf" },
  { name: "DIK", url: "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2025/08/DIK-Kec-banjarmangu.pdf" },
];

export default function PpidProfilPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PpidHeader namaKecamatan={profil?.nama_kecamatan} />
      <PpidTabNav active="profil" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profil PPID
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Berikut adalah dokumen-dokumen terkait PPID Kecamatan Banjarmangu. Klik kartu untuk membuka dokumen.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {skPpidLinks.map((item, i) => (
            <a
              key={i}
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                PDF
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
