"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const DISMISSED_KEY = "honne-install-dismissed";
type Platform = "android" | "ios" | null;

export default function InstallPrompt() {
  const t = useTranslations("installPrompt");
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
      if (isSafari) { setPlatform("ios"); setShow(true); }
    } else if (isAndroid) {
      setPlatform("android");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void });
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setShow(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[#dfe3e8] bg-white px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877f2] text-lg font-black text-white">
          {t("icon")}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1c1e21]">{t("title")}</p>
          {platform === "ios" ? (
            <p className="mt-0.5 text-xs leading-relaxed text-[#606770]">
              {t.rich("iosInstruction", {
                icon: () => (
                  <svg viewBox="0 0 20 20" className="mx-0.5 inline h-4 w-4 shrink-0 text-[#1877f2]" fill="currentColor">
                    <path d="M10 2l3 3-1.4 1.4L11 5.8V13H9V5.8L7.4 6.4 6 5l4-3zM4 16h12v-5h2v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6h2v5z" />
                  </svg>
                ),
              })}
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-[#606770]">
              {t("androidInstruction")}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 text-[#8d949e] transition hover:bg-[#f0f2f5]"
          aria-label={t("closeLabel")}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {platform === "android" && deferredPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-3 w-full rounded-xl bg-[#1877f2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#166fe5]"
        >
          {t("installButton")}
        </button>
      )}
    </div>
  );
}
