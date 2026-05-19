"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: "ja" | "en") => {
    if (next === locale) return;
    startTransition(() => {
      // /ja/foo → /en/foo, /en/foo → /ja/foo
      const newPath = pathname.replace(/^\/(ja|en)/, `/${next}`);
      router.push(newPath || `/${next}`);
    });
  };

  return (
    <div className="inline-flex items-center rounded-full bg-white/15 text-xs font-medium text-white/90">
      <button
        type="button"
        onClick={() => switchLocale("ja")}
        disabled={isPending}
        className={`rounded-full px-3 py-1.5 transition ${locale === "ja" ? "bg-white/30 font-bold" : "hover:bg-white/20"}`}
        aria-label="日本語に切り替え"
      >
        JA
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`rounded-full px-3 py-1.5 transition ${locale === "en" ? "bg-white/30 font-bold" : "hover:bg-white/20"}`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
