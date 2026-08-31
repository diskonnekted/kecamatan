"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Mencatat kunjungan ke POST /api/visitor maksimal 1x per sesi browser
 * (dijaga sessionStorage). Halaman admin tidak dihitung.
 */
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (sessionStorage.getItem("pv_tracked")) return;
    sessionStorage.setItem("pv_tracked", "1");
    fetch("/api/visitor", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
