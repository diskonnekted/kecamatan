"use client";

import { useEffect } from "react";

/** Mendaftarkan service worker PWA (/sw.js) sekali per sesi browser. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // hindari cache dev
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
