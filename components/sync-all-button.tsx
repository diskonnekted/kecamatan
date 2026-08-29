"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  // Optional endpoint; default /api/sync/run
  endpoint?: string;
  // Pesan default saat tombol diklik
  label?: string;
  // Teks saat proses
  pendingLabel?: string;
};

export default function SyncAllButton({
  endpoint = "/api/sync/run",
  label = "Sync Semua Desa",
  pendingLabel = "Memulai…",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const onClick = async () => {
    setStatus("Memulai sinkronisasi di background…");
    setRunning(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fireAndForget: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(`Gagal: ${data?.error ?? res.statusText}`);
      } else {
        setStatus(
          data?.accepted
            ? "Sinkronisasi berjalan di background. Halaman akan refresh otomatis dalam 15 detik."
            : `Selesai: ${JSON.stringify(data?.summary ?? data)}`,
        );
        // Auto-reload setelah 15 detik supaya hasil sync tampil
        setTimeout(() => {
          startTransition(() => router.refresh());
        }, 15000);
      }
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={running || isPending}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-foreground)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={running ? "animate-spin" : ""}
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        {running ? pendingLabel : label}
      </button>
      {status ? (
        <span className="text-xs text-[var(--color-muted-foreground)] max-w-md">{status}</span>
      ) : null}
    </div>
  );
}
