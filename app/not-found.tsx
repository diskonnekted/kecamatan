import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="font-serif text-7xl font-bold text-[var(--color-primary)] mb-2">
        404
      </div>
      <h1 className="font-serif text-2xl font-bold mb-3">
        Halaman tidak ditemukan
      </h1>
      <p className="text-[var(--color-muted-foreground)] mb-6">
        Mungkin artikel telah dihapus, atau URL yang Anda masukkan salah.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-foreground)] transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
