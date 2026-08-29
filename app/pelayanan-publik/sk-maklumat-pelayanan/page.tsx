import { getProfilKecamatan } from "@/lib/queries";
import { PelayananTabNav, PelayananHeader } from "@/components/pelayanan-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pelayanan Publik - SK Maklumat Pelayanan - Kecamatan Banjarmangu",
};

export default function SkMaklumatPelayananPage() {
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <PelayananHeader namaKecamatan={profil?.nama_kecamatan} />
      <PelayananTabNav active="sk-maklumat" />

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
          </svg>
          SK Maklumat Pelayanan
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Surat Keputusan tentang Maklumat Pelayanan Kecamatan Banjarmangu.
        </p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-12 flex flex-col items-center justify-center gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-[var(--color-muted-foreground)] text-center">
            Dokumen belum tersedia. Silakan kunjungi halaman asal untuk informasi lebih lanjut.
          </p>
          <a
            href="https://banjarmangu.banjarnegarakab.go.id/sk-maklumat-pelayanan/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[var(--color-primary)] underline"
          >
            Buka halaman asal
          </a>
        </div>
      </section>
    </div>
  );
}
