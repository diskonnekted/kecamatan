import { getProfilKecamatan } from "@/lib/queries";
import { ProfilHeader, ProfilTabNav } from "@/components/profil-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Kecamatan — Tupoksi",
};

const PDF_URL = "http://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2024/03/Peraturan-Bupati-Banjarnegara-no-36-tahun-2022.pdf";
const TUPOKSI_EMBED_URL = `https://docs.google.com/viewer?url=${encodeURIComponent(PDF_URL)}&embedded=true`;

export default function ProfilTupoksiPage() {
  const profil = getProfilKecamatan();

  if (!profil) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white p-12 text-center">
          <p className="text-[var(--color-muted-foreground)]">Data profil kecamatan belum tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <ProfilHeader profil={profil} />
      <ProfilTabNav active="tupoksi" />

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>
          Tupoksi
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Peraturan Bupati Banjarnegara No. 36 Tahun 2022
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <iframe
            src={TUPOKSI_EMBED_URL}
            className="w-full"
            style={{ height: "75vh", minHeight: "600px" }}
            title="Tupoksi — Peraturan Bupati Banjarnegara No. 36 Tahun 2022"
          />
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Jika dokumen tidak tampil, gunakan tombol di samping untuk membuka langsung.
          </p>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Buka Dokumen
          </a>
        </div>
      </section>
    </div>
  );
}
