"use client";

import { useState } from "react";

export function SikemaTracker() {
  const [id, setId] = useState("");
  return (
    <form
      className="flex gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        // Placeholder: hook ke API tracking ketika tersedia
        if (id.trim()) {
          // eslint-disable-next-line no-alert
          alert(`Lacak keluhan: ${id} (fitur dalam pengembangan)`);
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
