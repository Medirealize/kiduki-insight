"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const ONBOARDED_KEY = "honne-onboarded-v1";

export default function OnboardingModal() {
  const t = useTranslations("onboarding");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDED_KEY)) setShow(true);
    } catch { /* ignore */ }
  }, []);

  const handleStart = () => {
    try { localStorage.setItem(ONBOARDED_KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  const steps = t.raw("steps") as { icon: string; title: string; desc: string }[];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-white px-6 pt-8 pb-10 shadow-2xl sm:rounded-3xl">

        <div className="mb-6 text-center">
          <p className="text-4xl font-black tracking-[0.08em] text-[#1877f2]">{t("title")}</p>
          <p className="mt-1 text-xs tracking-[0.2em] text-[#8d949e]">{t("tagline")}</p>
        </div>

        <p className="mb-6 text-center text-sm leading-relaxed text-[#606770]">
          {t("description").split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </p>

        <div className="mb-8 space-y-4">
          {steps.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877f2]/10 text-xl">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1c1e21]">{item.title}</p>
                <p className="text-xs leading-relaxed text-[#8d949e]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mb-4 text-center text-[0.68rem] leading-relaxed text-[#8d949e]">
          {t("disclaimer").split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </p>

        <button type="button" onClick={handleStart}
          className="w-full rounded-xl bg-[#1877f2] py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]">
          {t("startButton")}
        </button>
      </div>
    </div>
  );
}
