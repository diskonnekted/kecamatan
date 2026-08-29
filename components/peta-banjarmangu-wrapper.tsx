"use client";

import dynamic from "next/dynamic";

const PetaBanjarmangu = dynamic(() => import("./peta-banjarmangu"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 flex items-center justify-center"
      style={{ height: "500px" }}
    >
      <p className="text-sm text-[var(--color-muted-foreground)]">Memuat peta...</p>
    </div>
  ),
});

export default PetaBanjarmangu;
