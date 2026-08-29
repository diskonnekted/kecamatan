import { getProfilKecamatan } from "@/lib/queries";
import { ProfilHeader, ProfilTabNav, EmptyContent, renderText } from "@/components/profil-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Kecamatan — Visi & Misi",
};

export default function ProfilVisiMisiPage() {
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

  const hasContent = profil.visi || profil.misi;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <ProfilHeader profil={profil} />
      <ProfilTabNav active="visi-misi" />

      {hasContent ? (
        <div className="space-y-8">
          {profil.visi && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                Visi
              </h2>
              <div className="text-base leading-relaxed text-[var(--color-foreground)]/90 bg-[var(--color-muted)]/30 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: renderText(profil.visi) }} />
            </section>
          )}

          {profil.misi && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M8 12h8" />
                  <path d="M8 16h8" />
                </svg>
                Misi
              </h2>
              <div className="text-base leading-relaxed text-[var(--color-foreground)]/90 bg-[var(--color-muted)]/30 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: renderText(profil.misi) }} />
            </section>
          )}
        </div>
      ) : (
        <EmptyContent label="Visi & Misi" />
      )}
    </div>
  );
}
