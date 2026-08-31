import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAllUnduhanAdmin } from "@/lib/queries";
import {
  logoutAction,
  createUnduhanAction,
  updateUnduhanAction,
  deleteUnduhanAction,
  togglePublishUnduhanAction,
} from "../actions";
import { ConfirmSubmitButton } from "../confirm-button";
import type { Unduhan } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = {
  message?: string;
  error?: string;
  edit?: string;
};

const KATEGORI_OPTIONS = [
  { value: "prosedur", label: "Prosedur" },
  { value: "regulasi", label: "Regulasi" },
  { value: "form-dokumen", label: "Dokumen" },
];

const KATEGORI_LABELS: Record<string, string> = {
  prosedur: "Prosedur",
  regulasi: "Regulasi",
  "form-dokumen": "Dokumen",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileTypeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  return ext.toUpperCase();
}

export default async function AdminUnduhanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const sp = await searchParams;
  const all = getAllUnduhanAdmin();
  const editId = sp.edit ? parseInt(sp.edit, 10) : null;
  const editItem = editId ? all.find((u) => u.id === editId) ?? null : null;

  // Group by kategori
  const grouped: Record<string, Unduhan[]> = { prosedur: [], regulasi: [], "form-dokumen": [] };
  for (const u of all) {
    if (!grouped[u.kategori]) grouped[u.kategori] = [];
    grouped[u.kategori].push(u);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">
            · Admin Panel
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Unduhan</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Kelola dokumen yang dapat diunduh publik (Prosedur, Regulasi, Dokumen)
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

      {/* Form tambah/edit */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold">
            {editItem ? `Edit: ${editItem.judul}` : "Tambah Dokumen"}
          </h2>
          {editItem && (
            <Link
              href="/admin/unduhan"
              className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              ← Batal edit
            </Link>
          )}
        </div>

        <form
          action={editItem ? updateUnduhanAction : createUnduhanAction}
          className="space-y-4"
        >
          {editItem && <input type="hidden" name="id" value={editItem.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Kategori <span className="text-[var(--color-destructive)]">*</span>
              </label>
              <select
                name="kategori"
                required
                defaultValue={editItem?.kategori ?? "prosedur"}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm bg-white"
              >
                {KATEGORI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Tipe File
              </label>
              <input
                type="text"
                name="file_type"
                defaultValue={editItem?.file_type ?? ""}
                placeholder="PDF, DOCX, XLSX, dll."
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
              Judul <span className="text-[var(--color-destructive)]">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              defaultValue={editItem?.judul ?? ""}
              placeholder="Nama dokumen yang ditampilkan"
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              defaultValue={editItem?.deskripsi ?? ""}
              rows={2}
              placeholder="Deskripsi singkat (opsional)"
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
              URL File <span className="text-[var(--color-destructive)]">*</span>
            </label>
            <input
              type="url"
              name="file_url"
              required
              defaultValue={editItem?.file_url ?? ""}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm font-mono"
            />
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              URL langsung ke file (PDF, DOCX, dll.). Tipe file akan terdeteksi otomatis dari ekstensi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
                Ukuran File (bytes)
              </label>
              <input
                type="number"
                name="file_size"
                defaultValue={editItem?.file_size ?? ""}
                placeholder="Opsional"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={editItem ? editItem.is_published === 1 : true}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm font-medium">Publikasikan</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-foreground)] text-white text-sm font-semibold transition-colors"
            >
              {editItem ? "Simpan Perubahan" : "Tambah Dokumen"}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar dokumen per kategori */}
      {KATEGORI_OPTIONS.map((kat) => {
        const items = grouped[kat.value] ?? [];
        return (
          <div key={kat.value} className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden mb-4">
            <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold">{kat.label}</h2>
              <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
                {items.length} dokumen
              </span>
            </div>
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-muted-foreground)]">
                Belum ada dokumen untuk kategori ini.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {items.map((u) => (
                  <div
                    key={u.id}
                    className="px-5 sm:px-6 py-4 flex flex-wrap items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]">
                          {u.file_type ?? getFileTypeFromUrl(u.file_url)}
                        </span>
                        {u.is_published === 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                            Draft
                          </span>
                        )}
                        {u.file_size && (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {formatFileSize(u.file_size)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm truncate">{u.judul}</h3>
                      {u.deskripsi && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1">
                          {u.deskripsi}
                        </p>
                      )}
                      <a
                        href={u.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--color-primary)] font-mono mt-1 inline-block truncate max-w-full hover:underline"
                      >
                        {u.file_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/unduhan?edit=${u.id}`}
                        className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-xs font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={togglePublishUnduhanAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-xs font-semibold transition-colors"
                        >
                          {u.is_published === 1 ? "Sembunyikan" : "Publish"}
                        </button>
                      </form>
                      <form action={deleteUnduhanAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmitButton
                          confirmMessage={`Hapus dokumen "${u.judul}"?`}
                          className="px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-destructive)] hover:text-[var(--color-destructive)] text-xs font-semibold transition-colors"
                        >
                          Hapus
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
