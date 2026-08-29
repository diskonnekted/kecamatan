import { getProfilKecamatan } from "@/lib/queries";
import { ProfilHeader, ProfilTabNav, EmptyContent, renderText } from "@/components/profil-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Kecamatan — Sejarah",
};

export default function ProfilSejarahPage() {
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
      <ProfilTabNav active="sejarah" />

      {profil.sejarah ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Sejarah
          </h2>
          <div className="text-base leading-relaxed text-[var(--color-foreground)]/90" dangerouslySetInnerHTML={{ __html: renderText(profil.sejarah) }} />
        </section>
      ) : (
        <EmptyContent label="Sejarah" />
      )}
    </div>
  );
}
