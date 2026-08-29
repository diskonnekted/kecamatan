import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProfilKecamatan } from "@/lib/queries";
import { saveProfilKecamatanAction, scrapeProfilAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  message?: string;
  error?: string;
};

export default async function AdminProfilPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const sp = await searchParams;
  const profil = getProfilKecamatan();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
            · Admin Panel
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Profil Kecamatan
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Kelola informasi profil Kecamatan Banjarmangu
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-sm font-semibold transition-colors"
          >
            Kembali
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-destructive)] hover:text-[var(--color-destructive)] text-sm font-semibold transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Flash messages */}
      {sp.message && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm border border-[var(--color-accent)]/20">
          {sp.message}
        </div>
      )}
      {sp.error && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] text-sm border border-[var(--color-destructive)]/20">
          {sp.error}
        </div>
      )}

      {/* Scrape section */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold">Ambil Data dari Web Lama</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Scraping otomatis data profil dari website lama
            </p>
          </div>
          <form action={scrapeProfilAction} className="flex gap-2 items-end">
            <input
              type="url"
              name="website_sumber"
              defaultValue={profil?.website_sumber ?? "https://banjarmangu.banjarnegarakab.go.id/"}
              placeholder="URL website lama"
              className="px-3 py-1.5 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-xs font-mono w-64"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-warning)] hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              Scrape Data
            </button>
          </form>
        </div>
      </div>

      {/* Form profil */}
      <form action={saveProfilKecamatanAction} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <h2 className="font-serif text-lg font-bold">Informasi Dasar</h2>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Nama Kecamatan
                </label>
                <input
                  type="text"
                  name="nama_kecamatan"
                  defaultValue={profil?.nama_kecamatan ?? ""}
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Kabupaten
                </label>
                <input
                  type="text"
                  name="kabupaten"
                  defaultValue={profil?.kabupaten ?? ""}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="provinsi"
                  defaultValue={profil?.provinsi ?? ""}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Kode Wilayah
                </label>
                <input
                  type="text"
                  name="kode_wilayah"
                  defaultValue={profil?.kode_wilayah ?? ""}
                  placeholder="Kode BPS atau kode lainnya"
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Alamat Kantor
              </label>
              <input
                type="text"
                name="alamat_kantor"
                defaultValue={profil?.alamat_kantor ?? ""}
                placeholder="Alamat lengkap kantor kecamatan"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Telepon Kantor
                </label>
                <input
                  type="text"
                  name="telepon_kantor"
                  defaultValue={profil?.telepon_kantor ?? ""}
                  placeholder="Nomor telepon"
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                  Email Kantor
                </label>
                <input
                  type="email"
                  name="email_kantor"
                  defaultValue={profil?.email_kantor ?? ""}
                  placeholder="email@kecamatan.go.id"
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                URL Web Sumber
              </label>
              <input
                type="url"
                name="website_sumber"
                defaultValue={profil?.website_sumber ?? ""}
                placeholder="https://banjarmangu.banjarnegarakab.go.id/"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Visi Misi */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <h2 className="font-serif text-lg font-bold">Visi & Misi</h2>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Visi
              </label>
              <textarea
                name="visi"
                defaultValue={profil?.visi ?? ""}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Misi
              </label>
              <textarea
                name="misi"
                defaultValue={profil?.misi ?? ""}
                rows={6}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
              />
            </div>
          </div>
        </div>

        {/* Sejarah */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <h2 className="font-serif text-lg font-bold">Sejarah</h2>
          </div>
          <div className="p-5 sm:p-6">
            <textarea
              name="sejarah"
              defaultValue={profil?.sejarah ?? ""}
              rows={8}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
            />
          </div>
        </div>

        {/* Letak Geografis */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <h2 className="font-serif text-lg font-bold">Letak Geografis</h2>
          </div>
          <div className="p-5 sm:p-6">
            <textarea
              name="letak_geografis"
              defaultValue={profil?.letak_geografis ?? ""}
              rows={5}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
            />
          </div>
        </div>

        {/* Struktur Pemerintahan */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <h2 className="font-serif text-lg font-bold">Struktur Pemerintahan</h2>
          </div>
          <div className="p-5 sm:p-6">
            <textarea
              name="struktur_pemerintahan"
              defaultValue={profil?.struktur_pemerintahan ?? ""}
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-foreground)] text-white text-sm font-semibold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Simpan Profil
          </button>
        </div>
      </form>
    </div>
  );
}

async function logoutAction() {
  "use server";
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  const { destroySession, SESSION_COOKIE } = await import("@/lib/auth");
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  c.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
