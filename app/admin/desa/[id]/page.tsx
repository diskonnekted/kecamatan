import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, type Desa } from "@/lib/db";
import { getApiKeyByDesaId, getArtikelByDesaAdmin } from "@/lib/queries";
import { generateApiKeyAction, revokeApiKeyAction, reactivateApiKeyAction, deleteApiKeyAction, updateDesaAction, triggerSyncAction, deleteArtikelDesaAction } from "../../actions";
import { ConfirmSubmitButton } from "../../confirm-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PUSH_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL
    ? `${process.env.NEXT_PUBLIC_PORTAL_URL.replace(/\/$/, "")}/api/push/artikel`
    : "https://kecamatan-banjarmangu.example.com/api/push/artikel";

type Search = Promise<{ message?: string; error?: string; newkey?: string; q?: string; page?: string }>;

export default async function AdminDesaDetailPage(props: { params: Promise<{ id: string }>; searchParams: Search }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const desaId = parseInt(id, 10);
  if (!desaId) notFound();

  const desa = db.prepare("SELECT * FROM desa WHERE id = ?").get(desaId) as Desa | undefined;
  if (!desa) notFound();

  const apiKey = getApiKeyByDesaId(desaId);
  // Tampilkan key baru hanya sekali (lewat query param), supaya admin bisa copy
  const justCreatedKey = searchParams.newkey || null;

  // Data untuk bagian Kelola Artikel (hasil sinkron)
  const q = (searchParams.q ?? "").trim();
  const artikelPage = getArtikelByDesaAdmin(desaId, {
    q,
    page: Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1),
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-700/70">Admin · Detail Desa</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{desa.nama}</h1>
            <p className="mt-1 text-sm text-slate-500">
              <a href={desa.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {desa.website}
              </a>
            </p>
          </div>
          <a href="/admin" className="text-sm text-blue-600 hover:underline">← Kembali ke dashboard</a>
        </header>

        {searchParams.message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {searchParams.message}
          </div>
        )}
        {searchParams.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {searchParams.error}
          </div>
        )}

        {/* === API KEY UNTUK PUSH DARI DESA === */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">🔑 API Key (Push dari Desa)</h2>
          <p className="mt-1 text-sm text-slate-600">
            API key ini dipakai oleh desa untuk mengirim (push) data artikel ke portal kecamatan
            tanpa harus di-scrape. Cara ini mengatasi masalah Cloudflare & situs desa yang tidak
            punya RSS feed. Salin key dan berikan ke operator desa.
          </p>

          {!apiKey && (
            <form action={generateApiKeyAction} className="mt-4">
              <input type="hidden" name="desa_id" value={desa.id} />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Buat API Key untuk desa ini
              </button>
            </form>
          )}

          {apiKey && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
                    <p className={`mt-1 text-sm font-semibold ${apiKey.is_active ? "text-emerald-700" : "text-rose-700"}`}>
                      {apiKey.is_active ? "✓ Aktif" : "✕ Dicabut"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Push terakhir</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {apiKey.last_push_at || "—"}
                    </p>
                  </div>
                  {apiKey.last_push_message && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Pesan</p>
                      <p className="mt-1 text-sm text-slate-700">{apiKey.last_push_message}</p>
                    </div>
                  )}
                </div>
              </div>

              {justCreatedKey ? (
                <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    ✓ API Key baru dibuat. Salin sekarang — tidak akan ditampilkan lagi!
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded bg-slate-900 px-3 py-2 text-xs text-emerald-300">
{justCreatedKey}
                  </pre>
                  <p className="mt-2 text-xs text-emerald-800">
                    Kirim key ini ke operator desa {desa.nama} via kanal aman (WA terenkripsi / email).
                    Mereka harus menyimpannya di modul OpenSID desa (lihat panduan di bawah).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  ℹ️ API key hanya ditampilkan sekali saat dibuat/generate ulang.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <form action={generateApiKeyAction}>
                  <input type="hidden" name="desa_id" value={desa.id} />
                  <input type="hidden" name="newkey" value="" />
                  <button
                    type="submit"
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    ↻ Generate Ulang
                  </button>
                </form>
                {apiKey.is_active ? (
                  <form action={revokeApiKeyAction}>
                    <input type="hidden" name="desa_id" value={desa.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                    >
                      ⏸ Cabut (sementara)
                    </button>
                  </form>
                ) : (
                  <form action={reactivateApiKeyAction}>
                    <input type="hidden" name="desa_id" value={desa.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      ▶ Aktifkan Kembali
                    </button>
                  </form>
                )}
                <form action={deleteApiKeyAction}>
                  <input type="hidden" name="desa_id" value={desa.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    🗑 Hapus Permanen
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* === PANDUAN SETUP DI DESA === */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📖 Panduan Setup di Desa</h2>
          <p className="mt-1 text-sm text-slate-600">
            Setelah API key dibuat, berikan instruksi ini ke operator desa {desa.nama}:
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
              <span>Buka dashboard admin OpenSID desa, masuk ke menu <strong>API → OpenDK/Push</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
              <span>
                Tambahkan konfigurasi push:
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 px-3 py-2 text-xs text-slate-100">
{`Endpoint URL : ${PUSH_URL}
API Key      : <salin dari halaman ini>
Interval     : setiap 6 jam (atau sesuai kebutuhan)`}
                </pre>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
              <span>Simpan & test. Cek halaman ini untuk status push terakhir.</span>
            </li>
          </ol>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
            <strong>Format JSON yang dikirim desa ke endpoint:</strong>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 px-3 py-2 text-xs text-slate-100">
{`{
  "items": [
    {
      "judul": "Judul Artikel",
      "slug": "judul-artikel",
      "url": "https://desa.id/artikel/2026/01/05/judul-artikel",
      "ringkasan": "Ringkasan 200-300 karakter...",
      "gambar": "https://desa.id/desa/upload/artikel/xxx.jpg",
      "penulis": "Admin Desa",
      "kategori": "Berita",
      "published_at": "2026-01-05T10:00:00+07:00"
    }
  ]
}`}
            </pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <strong>ℹ️ Contoh perintah manual (uji coba dari server desa):</strong>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 px-3 py-2 text-xs text-slate-100">
{`curl -X POST ${PUSH_URL} \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: dsk_xxxxxxxx" \\
  -d '{"items":[{"judul":"Test","url":"https://contoh.com/a"}]}'`}
            </pre>
          </div>
        </section>

        {/* === PENGATURAN SUMBER LAIN === */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">⚙️ Sumber Data Alternatif (Scrape / RSS)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Jika desa tidak bisa push (mis. situs down atau tidak ada operator),
            sistem bisa scrape beranda desa atau mengambil RSS feed.
          </p>
          <form action={updateDesaAction} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={desa.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700">URL Feed (opsional)</label>
              <input
                type="url"
                name="feed_url"
                defaultValue={desa.feed_url ?? ""}
                placeholder="https://desa.id/feed"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scraper"
                name="scraper_enabled"
                defaultChecked={desa.scraper_enabled === 1}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="scraper" className="text-sm text-slate-700">
                Aktifkan HTML scraper (fallback jika push gagal)
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Simpan Pengaturan
            </button>
          </form>

          <form action={triggerSyncAction} className="mt-4">
            <input type="hidden" name="slug" value={desa.slug} />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              🔄 Sinkron Manual Sekarang
            </button>
          </form>
        </section>

        {/* === KELOLA ARTIKEL HASIL SINKRON === */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">📰 Kelola Artikel Hasil Sinkron</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                {artikelPage.total} artikel tersimpan dari desa ini. Menghapus artikel di sini hanya
                menghapusnya dari portal kecamatan — artikel tidak akan muncul kembali selama sudah
                dihapus juga di situs desa sumber.
              </p>
            </div>
            <form method="get" className="flex items-center gap-2">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari judul artikel…"
                className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Cari
              </button>
              {q && (
                <a
                  href={`/admin/desa/${desa.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Reset
                </a>
              )}
            </form>
          </div>

          {artikelPage.items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              {q ? `Tidak ada artikel yang cocok dengan "${q}".` : "Belum ada artikel tersinkron untuk desa ini."}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Judul</th>
                    <th className="whitespace-nowrap px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Sumber</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {artikelPage.items.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="max-w-md px-4 py-2.5">
                        <a
                          href={`/artikel/${desa.slug}/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 font-medium text-slate-900 hover:text-blue-700"
                        >
                          {a.judul}
                        </a>
                        {a.url && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-0.5 block text-xs text-slate-400 hover:underline"
                          >
                            sumber asli ↗
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                        {formatTanggal(a.published_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {a.source}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <form action={deleteArtikelDesaAction}>
                          <input type="hidden" name="artikel_id" value={a.id} />
                          <input type="hidden" name="desa_id" value={desa.id} />
                          <input type="hidden" name="q" value={q} />
                          <input type="hidden" name="page" value={artikelPage.page} />
                          <ConfirmSubmitButton
                            confirmMessage={`Hapus artikel "${a.judul}" dari portal kecamatan?\n\nArtikel tidak akan muncul kembali selama sudah dihapus juga di situs desa.`}
                            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Hapus
                          </ConfirmSubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {artikelPage.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate-500">
                Halaman {artikelPage.page} dari {artikelPage.totalPages}
              </p>
              <div className="flex gap-2">
                {artikelPage.page > 1 && (
                  <a
                    href={`/admin/desa/${desa.id}${artikelQuery(q, artikelPage.page - 1)}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    ← Sebelumnya
                  </a>
                )}
                {artikelPage.page < artikelPage.totalPages && (
                  <a
                    href={`/admin/desa/${desa.id}${artikelQuery(q, artikelPage.page + 1)}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    Berikutnya →
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function artikelQuery(q: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

function formatTanggal(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
