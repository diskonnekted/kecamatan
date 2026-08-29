import { getProfilKecamatan } from "@/lib/queries";
import { ProfilHeader, ProfilTabNav, renderText } from "@/components/profil-tabs";
import PetaBanjarmangu from "@/components/peta-banjarmangu-wrapper";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Kecamatan — Letak Geografis",
};

export default function ProfilLetakPage() {
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
      <ProfilTabNav active="letak" />

      <div className="space-y-8">
        {/* Peta */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" />
              <path d="M9 7l6-3 6 3v12l-6 3-6-3-6 3-6-3V7l6 3" />
              <path d="M9 7v13" />
              <path d="M15 4v13" />
            </svg>
            Peta Wilayah
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
            Peta Kecamatan Banjarmangu dan desa-desa di dalamnya
          </p>
          <PetaBanjarmangu />

          {/* Keterangan perbatasan */}
          <div className="mt-5 rounded-xl bg-[var(--color-muted)]/30 border border-[var(--color-border)] p-4 sm:p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
              Batas Wilayah
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-[var(--color-primary)] w-28 flex-shrink-0">Utara</span>
                <span className="text-[var(--color-foreground)]/90">Kec. Karangkobar</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[var(--color-primary)] w-28 flex-shrink-0">Timur</span>
                <span className="text-[var(--color-foreground)]/90">Kec. Madukara</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[var(--color-primary)] w-28 flex-shrink-0">Selatan</span>
                <span className="text-[var(--color-foreground)]/90">Kec. Banjarnegara, Kec. Bawang</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[var(--color-primary)] w-28 flex-shrink-0">Barat</span>
                <span className="text-[var(--color-foreground)]/90">Kec. Wanadadi, Kec. Punggelan</span>
              </div>
            </div>
          </div>
        </section>

        {/* Teks Letak Geografis */}
        {profil.letak_geografis && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              Letak Geografis
            </h2>
            <div className="text-base leading-relaxed text-[var(--color-foreground)]/90" dangerouslySetInnerHTML={{ __html: renderText(profil.letak_geografis) }} />
          </section>
        )}
      </div>
    </div>
  );
}
