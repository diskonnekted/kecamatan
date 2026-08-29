import { getUnduhanByKategori } from "@/lib/queries";
import { UnduhanTabNav, UnduhanHeader, UnduhanCard, UnduhanEmpty } from "@/components/unduhan-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unduhan - Prosedur - Kecamatan Banjarmangu",
};

export default function ProsedurPage() {
  const items = getUnduhanByKategori("prosedur");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <UnduhanHeader />
      <UnduhanTabNav active="prosedur" />

      {items.length === 0 ? (
        <UnduhanEmpty kategori="prosedur" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <UnduhanCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
