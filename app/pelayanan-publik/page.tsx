import { getProfilKecamatan } from "@/lib/queries";
import { PelayananTabNav, PelayananHeader } from "@/components/pelayanan-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pelayanan Publik - Standar Pelayanan - Kecamatan Banjarmangu",
};

const IMG_URL = "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2025/11/standar-pelayanan-2025.jpg";
const SOURCE_URL = "https://banjarmangu.banjarnegarakab.go.id/layanan/standar-pelayanan/";

export default function StandarPelayananPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PelayananHeader namaKecamatan={profil?.nama_kecamatan} />
      <PelayananTabNav active="standar" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Standar Pelayanan
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          Standar pelayanan publik Kecamatan Banjarmangu sebagai acuan penyelenggaraan pelayanan kepada masyarakat.
        </p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMG_URL}
              alt="Standar Pelayanan Kecamatan Banjarmangu 2025"
              className="max-w-full h-auto rounded-xl shadow-sm"
            />
            <a
              href={IMG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh Gambar
            </a>
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted-foreground)] mt-3 text-center">
          Data bersumber dari{" "}
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
            {SOURCE_URL}
          </a>
        </p>
      </section>
    </div>
  );
}
