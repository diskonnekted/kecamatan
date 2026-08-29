import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

type SearchParams = { error?: string; from?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");
  const sp = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-foreground)]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-serif text-xl font-bold">
              B
            </span>
            <div>
              <h1 className="font-serif text-xl font-bold">Login Admin</h1>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Portal Kecamatan Banjarmangu
              </p>
            </div>
          </div>

          {sp.error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] text-sm border border-[var(--color-destructive)]/20">
              {sp.error}
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-foreground)] text-white font-semibold transition-colors"
            >
              Masuk
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center">
            <Link
              href="/"
              className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
            >
              ← Kembali ke portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
