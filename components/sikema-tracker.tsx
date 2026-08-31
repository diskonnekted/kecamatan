"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SikemaTracker() {
  const [id, setId] = useState("");
  const router = useRouter();
  return (
    <form
      className="flex gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (id.trim()) {
          router.push(`/aduan/lacak?nomor=${encodeURIComponent(id.trim().toUpperCase())}`);
        }
      }}
    >
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Tracking ID Keluhan"
        className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-[var(--color-border)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-md bg-[var(--color-warning)] hover:bg-amber-600 text-white text-xs font-bold transition-colors"
      >
        Lacak
      </button>
    </form>
  );
}
