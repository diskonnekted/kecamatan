import { getAllUnduhanByKategoriGrouped } from "@/lib/queries";
import { UnduhanTabNav, UnduhanHeader, UnduhanCard, UnduhanEmpty } from "@/components/unduhan-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unduhan - Kecamatan Banjarmangu",
};

const KATEGORI_LABELS: Record<string, string> = {
  prosedur: "Prosedur",
  regulasi: "Regulasi",
  "form-dokumen": "Dokumen",
};

export default function UnduhanPage() {
  const grouped = getAllUnduhanByKategoriGrouped();
  const allItems = Object.values(grouped).flat();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <UnduhanHeader />
      <UnduhanTabNav active="all" />

      {allItems.length === 0 ? (
        <UnduhanEmpty />
      ) : (
        <>
          {(["prosedur", "regulasi", "form-dokumen"] as const).map((kat) => {
            const items = grouped[kat] ?? [];
            if (items.length === 0) return null;
            return (
              <section key={kat} className="mb-10">
                <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-[var(--color-primary)]">·</span> {KATEGORI_LABELS[kat]}
                  <span className="text-sm font-normal text-[var(--color-muted-foreground)] ml-2">
                    ({items.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {items.map((item) => (
                    <UnduhanCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
