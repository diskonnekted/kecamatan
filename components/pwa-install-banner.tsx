"use client";

import { useEffect, useState } from "react";

// Event non-standar dari Chromium untuk prompt instalasi PWA
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Banner "Install Aplikasi" ala Android — muncul di mobile saat browser
 * menawarkan instalasi PWA. Pilihan tutup diingat via localStorage.
 */
export function PwaInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa_install_dismissed")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setShow(true);
    };
    const onInstalled = () => {
      deferredPrompt = null;
      setShow(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    deferredPrompt = null;
  };

  const dismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "1");
    setShow(false);
  };

  return (
    <div className="md:hidden fixed inset-x-3 bottom-20 z-50 animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-2xl">
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[var(--color-foreground)] truncate">
            Install SIDATEKA
          </div>
          <div className="text-[11px] text-[var(--color-muted-foreground)]">
            Akses lebih cepat dari layar utama
          </div>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white active:scale-95 transition-transform"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup"
          className="shrink-0 p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
