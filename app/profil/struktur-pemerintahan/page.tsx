import { getProfilKecamatan } from "@/lib/queries";
import { ProfilHeader, ProfilTabNav, EmptyContent, renderText } from "@/components/profil-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Kecamatan — Struktur Pemerintahan",
};

export default function ProfilStrukturPage() {
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
      <ProfilTabNav active="struktur" />

      {profil.struktur_pemerintahan ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Struktur Pemerintahan
          </h2>
          <div className="text-base leading-relaxed text-[var(--color-foreground)]/90" dangerouslySetInnerHTML={{ __html: renderText(profil.struktur_pemerintahan) }} />
        </section>
      ) : (
        <EmptyContent label="Struktur Pemerintahan" />
      )}
    </div>
  );
}
