import { getProfilKecamatan } from "@/lib/queries";
import { PpidTabNav, PpidHeader } from "@/components/ppid-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PPID - Surat Keputusan - Kecamatan Banjarmangu",
};

const PDF_URL = "https://banjarmangu.banjarnegarakab.go.id/wp-content/uploads/2026/08/SK-PENUNJUKAN-PEJABAT-PENGELOLA-INFORMASI-DAN-DOKUMENTASI-PPID-.pdf";
// Embed via proxy lokal (server asal mengirim X-Frame-Options: SAMEORIGIN)
const EMBED_URL = "/ppid/surat-keputusan/pdf";

export default function PpidSkPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PpidHeader namaKecamatan={profil?.nama_kecamatan} />
      <PpidTabNav active="sk" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
          </svg>
          Surat Keputusan
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Surat Keputusan terkait PPID dan pengelolaan informasi publik.
        </p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                SK Penunjukan Pejabat Pengelola Informasi dan Dokumentasi PPID
              </span>
            </div>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Buka Dokumen
            </a>
          </div>
          <iframe
            title="SK PPID"
            src={EMBED_URL}
            className="w-full"
            style={{ height: "75vh", minHeight: "600px", border: 0 }}
          />
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-3 text-center">
          Data bersumber dari{" "}
          <a href="https://banjarmangu.banjarnegarakab.go.id/sk/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
            banjarmangu.banjarnegarakab.go.id/sk/
          </a>
        </p>
      </section>
    </div>
  );
}
