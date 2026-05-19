"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
const AuthModal = dynamic(() => import("@/app/components/AuthModal"), { ssr: false });
const UpgradeButton = dynamic(() => import("@/app/components/UpgradeButton"), { ssr: false });
const OnboardingModal = dynamic(() => import("@/app/components/OnboardingModal"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/app/components/InstallPrompt"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
import { pickClosestInsight } from "@/lib/insights";
import { GROUP_TO_AXIS_INDEX, TOTAL_STEPS, getAxisQuestions } from "@/lib/constants";
import { mergeFollowUpQuestions } from "@/lib/follow-up-questions";
import { track } from "@/lib/analytics";
import type { PersonalityGroup } from "@/lib/personality";
import { useLogStore } from "@/lib/store/useLogStore";
import { useUserStatus } from "@/lib/store/useUserStatus";
import { FREE_LOG_VISIBLE, FREE_DAILY_LIMIT } from "@/lib/types/log";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

const PROFILE_STORAGE_KEY = "kiduki-insight-profile-v2";
const PREFS_STORAGE_KEY = "kiduki-insight-prefs-v1";

type GroupKey = "自分軸" | "相手軸" | "社会軸";

const FollowUpListLazy = dynamic(
  () => import("@/app/components/FollowUpList"),
  { loading: () => <p className="text-center text-xs text-[#8d949e]">…</p> }
);

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const auth = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("payment=success")) {
      setPaymentSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const [direction, setDirection] = useState<"in" | "out">("in");
  const [selectedGroup, setSelectedGroup] = useState<PersonalityGroup | null>(null);
  const [useAiEnhancement, setUseAiEnhancement] = useState(true);
  const [savedThisSession, setSavedThisSession] = useState(false);

  const { logs, addLog } = useLogStore();
  const { canDiagnose: localCanDiagnose, remainingToday, recordUsage } = useUserStatus();
  const isPremium = auth.isPremium;
  const canDiagnose = isPremium || localCanDiagnose;
  const [worryText, setWorryText] = useState("");
  const [qAnswers, setQAnswers] = useState<("A" | "B")[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);

  const profileHydratedRef = useRef(false);
  const prefsHydratedRef = useRef(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef(step);
  const useAiEnhancementRef = useRef(useAiEnhancement);
  const navEpochRef = useRef(0);
  stepRef.current = step;
  useAiEnhancementRef.current = useAiEnhancement;

  const group: PersonalityGroup = selectedGroup ?? "自分軸";
  const questions = getAxisQuestions(locale);
  const typeCode = (() => {
    if (group === "自分軸") return "A2";
    if (group === "相手軸") return "B2";
    return "C2";
  })();
  const primaryAxis = GROUP_TO_AXIS_INDEX[group];
  const axisQuestions = questions[primaryAxis];

  const GROUP_OPTIONS: { group: GroupKey; typeCode: string; title: string; description: string }[] = [
    { group: "自分軸", typeCode: "A2", title: t("step1.groups.自分軸.title"), description: t("step1.groups.自分軸.description") },
    { group: "相手軸", typeCode: "B2", title: t("step1.groups.相手軸.title"), description: t("step1.groups.相手軸.description") },
    { group: "社会軸", typeCode: "C2", title: t("step1.groups.社会軸.title"), description: t("step1.groups.社会軸.description") },
  ];

  const selectedFocuses = useMemo(() => {
    return qAnswers.map((ans, i) =>
      ans === "A" ? axisQuestions[i].focusA : axisQuestions[i].focusB
    );
  }, [qAnswers, axisQuestions]);

  const result = useMemo(() => {
    return pickClosestInsight(typeCode, worryText, selectedFocuses);
  }, [typeCode, worryText, selectedFocuses]);

  const resultAnalysisDescription = useMemo(() => {
    if (!useAiEnhancement) return t("step7.analysisDesc.noAi");
    if (aiInsight || aiAction) return t("step7.analysisDesc.aiDone");
    if (aiError?.includes(locale === "en" ? "limit" : "利用回数")) return t("step7.analysisDesc.limitReached");
    if (aiError) return t("step7.analysisDesc.aiFailed");
    return t("step7.analysisDesc.base");
  }, [useAiEnhancement, aiInsight, aiAction, aiError, locale, t]);

  const displayFollowUps = useMemo(() => {
    if (useAiEnhancement && nextQuestions.length > 0) return nextQuestions;
    return mergeFollowUpQuestions(useAiEnhancement ? nextQuestions : [], { group, typeCode, worryText, locale });
  }, [useAiEnhancement, nextQuestions, group, typeCode, worryText, locale]);

  useEffect(() => { track("step_view", { step }); }, [step]);
  useEffect(() => { queueMicrotask(() => { stepHeadingRef.current?.focus(); }); }, [step]);

  const onPickFollowUp = useCallback((q: string) => {
    navEpochRef.current += 1;
    setWorryText(q);
    setQAnswers([]);
    setAiInsight(null);
    setAiAction(null);
    setAiError(null);
    setNextQuestions([]);
    setStep(2);
  }, []);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    navEpochRef.current += 1;
    setDirection("out");
    setTimeout(() => {
      if (step === 6) { setIsLoading(false); setStep(5); }
      else if (step === 7) { setAiInsight(null); setAiAction(null); setAiError(null); setNextQuestions([]); setStep(5); }
      else if (step === 2) { setStep(1); }
      else if (step >= 3 && step <= 5) { setQAnswers((a) => a.slice(0, Math.max(0, step - 3))); setStep((s) => s - 1); }
      setDirection("in");
    }, 200);
  }, [step]);

  const retryAiGeneration = useCallback(() => {
    if (!useAiEnhancement || !result) return;
    navEpochRef.current += 1;
    setAiError(null); setAiInsight(null); setAiAction(null); setNextQuestions([]);
    setStep(6); setIsLoading(true);
  }, [useAiEnhancement, result]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) return;
        const p = JSON.parse(raw) as { group?: string };
        if (p.group === "自分軸" || p.group === "相手軸" || p.group === "社会軸") {
          setSelectedGroup(p.group as PersonalityGroup);
        }
      } catch { /* ignore */ } finally { profileHydratedRef.current = true; }
    });
  }, []);

  useEffect(() => {
    if (!profileHydratedRef.current || !selectedGroup) return;
    try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ group: selectedGroup })); } catch { /* ignore */ }
  }, [selectedGroup]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(PREFS_STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as { useAiEnhancement?: boolean };
          if (typeof p.useAiEnhancement === "boolean") setUseAiEnhancement(p.useAiEnhancement);
        }
      } catch { /* ignore */ } finally { prefsHydratedRef.current = true; }
    });
  }, []);

  useEffect(() => {
    if (!prefsHydratedRef.current) return;
    try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ useAiEnhancement })); } catch { /* ignore */ }
  }, [useAiEnhancement]);

  const goNext = useCallback((epochSnapshot?: number) => {
    const useStaleGuard = typeof epochSnapshot === "number";
    const staleGuard = useStaleGuard ? epochSnapshot : null;
    setDirection("out");
    setTimeout(() => {
      if (staleGuard !== null && navEpochRef.current !== staleGuard) { setDirection("in"); return; }
      const s = stepRef.current;
      const useAi = useAiEnhancementRef.current;
      if (s === 5) {
        if (useAi) { setStep(6); setIsLoading(true); }
        else { setAiError(null); setAiInsight(null); setAiAction(null); setNextQuestions([]); setStep(7); }
      } else if (s < 5) { setStep((prev) => Math.min(prev + 1, TOTAL_STEPS)); }
      setDirection("in");
    }, 200);
  }, []);

  useEffect(() => {
    if (step !== 6 || !isLoading || !result) return;
    if (!canDiagnose) {
      setAiError(t("step7.limitError", { limit: FREE_DAILY_LIMIT }));
      setIsLoading(false); setStep(7); return;
    }
    recordUsage();
    let cancelled = false;

    const run = async () => {
      try {
        setAiError(null); setAiInsight(null); setAiAction(null); setNextQuestions([]);
        const startedAt = Date.now();
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeCode, group, worryText, baseInsight: result.insight, baseAction: result.action, locale }),
        });

        let insight: string | null = null;
        let action: string | null = null;
        let followups: string[] = [];

        if (res.ok) {
          const data = (await res.json()) as { insight?: string; doctor_advice?: string; next_questions?: string[]; error?: string };
          insight = data.insight ?? null;
          action = data.doctor_advice ?? null;
          followups = Array.isArray(data.next_questions)
            ? data.next_questions.filter((q) => typeof q === "string" && q.trim().length > 0)
            : [];
          if (!insight || !action) setAiError(t("step7.aiIncompleteError"));
        } else {
          setAiError(t("step7.aiError"));
        }

        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          if (cancelled) return;
          setDirection("out");
          setTimeout(() => {
            if (!cancelled) {
              if (insight) setAiInsight(insight);
              if (action) setAiAction(action);
              if (followups.length > 0) setNextQuestions(followups);
              setStep(7); setIsLoading(false); setDirection("in");
            }
          }, 200);
        }, remaining);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setAiError(t("step7.aiError"));
          setDirection("out");
          setTimeout(() => { if (!cancelled) { setStep(7); setIsLoading(false); setDirection("in"); } }, 200);
        }
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [step, isLoading, result, typeCode, group, worryText, locale, canDiagnose, t]);

  const showNextButton =
    (step === 1 && selectedGroup !== null) ||
    (step === 2 && worryText.trim()) ||
    (step === 3 && qAnswers.length >= 1) ||
    (step === 4 && qAnswers.length >= 2) ||
    (step === 5 && qAnswers.length >= 3);

  const currentQIndex = step - 3;

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-[#1c1e21] antialiased">
      {/* プログレスバー */}
      <div className="sticky top-0 z-10 h-1.5 w-full bg-[#dfe3e8]">
        <div className="h-full bg-[#1877f2] transition-all duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="mx-auto max-w-md px-6 pt-10 pb-8 sm:pt-14 sm:pb-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1877F2] to-[#166FE5] px-6 py-10 text-center shadow-[0_6px_24px_rgba(24,119,242,0.28)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="pointer-events-none absolute left-5 top-5 flex gap-1.5 opacity-30">
              {[2, 2.5, 2, 1.5].map((s, i) => (
                <div key={i} style={{ width: `${s * 4}px`, height: `${s * 4}px` }} className="rounded-full bg-white" />
              ))}
            </div>
            <svg viewBox="0 0 110 90" aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 w-[90px] opacity-[0.22]" fill="white">
              <rect x="0" y="28" width="65" height="44" rx="12" />
              <path d="M14 72 L5 86 L26 72 Z" />
              <rect x="32" y="0" width="78" height="44" rx="12" />
              <path d="M98 44 L108 57 L87 44 Z" />
            </svg>
            <h1 className="relative text-[2.2rem] font-bold tracking-[0.08em] text-white drop-shadow-sm">
              {t("app.title")}
            </h1>
            <p className="relative mt-2 text-[0.8rem] font-medium tracking-[0.22em] text-white/70">
              {t("app.tagline")}
            </p>
            <div className="relative mt-4 flex justify-center gap-2 flex-wrap">
              <Link href={`/${locale}/history`} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/25">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H3zm1 2h8v8H4V4zm1 1v2h6V5H5zm0 3v1h6V8H5zm0 2v1h4v-1H5z"/>
                </svg>
                {t("nav.history")}
                {logs.length > 0 && (
                  <span className="rounded-full bg-white/30 px-1.5 text-[0.65rem] font-bold">{logs.length}</span>
                )}
              </Link>
              {!auth.loading && (
                auth.user ? (
                  <button type="button" onClick={() => auth.signOut()} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/25">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[0.6rem] font-bold">
                      {(auth.user.email?.[0] ?? "U").toUpperCase()}
                    </span>
                    {auth.isPremium ? t("nav.premium") : t("nav.logout")}
                  </button>
                ) : (
                  <button type="button" onClick={() => setShowAuthModal(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/25">
                    {t("nav.login")}
                  </button>
                )
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {paymentSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
            <p className="font-semibold text-emerald-700">{t("payment.success")}</p>
            <p className="mt-1 text-sm text-emerald-600">{t("payment.successDetail")}</p>
          </div>
        )}

        <p className="sr-only" aria-live="polite" aria-atomic="true">{t(`steps.${step}` as Parameters<typeof t>[0])}</p>
        <h2 ref={stepHeadingRef} tabIndex={-1} className="sr-only outline-none">{t(`steps.${step}` as Parameters<typeof t>[0])}</h2>

        {step > 1 && (
          <div className="mb-4">
            <button type="button" onClick={goBack} className="min-h-[48px] rounded-xl border border-[#ccd0d5] bg-white px-4 py-2.5 text-sm font-medium text-[#606770] transition hover:bg-[#f0f2f5]">
              ← {locale === "en" ? "Back" : "戻る"}
            </button>
          </div>
        )}

        <div className={`transition-all duration-300 ease-out ${direction === "out" ? "opacity-0 translate-y-3 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"}`}>

          {/* ① タイプ選択 */}
          {step === 1 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-5 text-base leading-relaxed text-[#606770]">{t("step1.prompt")}</p>
              <div className="space-y-3">
                {GROUP_OPTIONS.map((opt, idx) => {
                  const icons = [
                    <svg key="a" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 21h6M12 3a6 6 0 014.5 10.1c-.7.9-1.5 1.7-1.5 2.9H9c0-1.2-.8-2-1.5-2.9A6 6 0 0112 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                    <svg key="b" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden="true"><path d="M12 21.593c-.58-.418-10-7.25-10-12.593a6 6 0 0110-4.472A6 6 0 0122 9c0 5.343-9.42 12.175-10 12.593z"/></svg>,
                    <svg key="c" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" strokeLinecap="round"/></svg>,
                  ];
                  const selected = selectedGroup === opt.group;
                  return (
                    <button key={opt.group} type="button" onClick={() => setSelectedGroup(opt.group)}
                      className={`flex w-full items-start gap-4 rounded-xl border-2 px-4 py-4 text-left transition active:scale-[0.99] ${selected ? "border-[#1877f2] bg-[#e7f0fd]" : "border-[#dfe3e8] bg-white hover:border-[#1877f2]/40 hover:bg-[#f5f8ff]"}`}
                      aria-pressed={selected}>
                      <span className={selected ? "text-[#1877f2]" : "text-[#8d949e]"}>{icons[idx]}</span>
                      <span>
                        <span className="block font-semibold text-[#1c1e21]">{opt.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-[#606770]">{opt.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5">
                <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-xl border border-[#e4e6eb] bg-[#f8f9fb] px-4 py-3">
                  <input id="use-ai-toggle" type="checkbox" checked={useAiEnhancement}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setUseAiEnhancement(v);
                      try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ useAiEnhancement: v })); prefsHydratedRef.current = true; } catch { /* ignore */ }
                    }}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#1877f2]" />
                  <span className="text-[0.8125rem] leading-relaxed text-[#606770]">
                    <span className="font-medium text-[#1c1e21]">{t("step1.aiToggleLabel")}</span>
                    {" "}{t("step1.aiToggleDesc")}
                  </span>
                </label>
              </div>
              {showNextButton && (
                <button type="button" onClick={() => goNext()} className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]">
                  {t("step1.next")}
                </button>
              )}
            </section>
          )}

          {/* ② 悩み入力 */}
          {step === 2 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-4 flex items-start gap-2 text-base leading-relaxed text-[#606770]">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-[#1877f2]" fill="currentColor" aria-hidden="true">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {t("step2.prompt")}
              </p>
              {!useAiEnhancement && (
                <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                  {t("step2.offlineNotice")}
                </p>
              )}
              <textarea value={worryText} onChange={(e) => setWorryText(e.target.value)}
                placeholder={t("step2.placeholder")} rows={5}
                className="w-full resize-none rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-base leading-relaxed text-[#1c1e21] placeholder-[#8d949e] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20" />
              {showNextButton && (
                <button type="button" onClick={() => goNext()} className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]">
                  {t("step2.next")}
                </button>
              )}
            </section>
          )}

          {/* ③④⑤ 深掘り質問 */}
          {step >= 3 && step <= 5 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7f0fd] px-3 py-1 text-[0.75rem] font-semibold text-[#1877f2]">
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" />
                  <path d="M6 4v3M6 8.5v.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {t("step3to5.typeLabel", { group: GROUP_OPTIONS.find(o => o.group === group)?.title ?? group })}
              </span>
              {axisQuestions[currentQIndex] ? (
                <>
                  <p className="mb-6 text-base leading-relaxed text-[#1c1e21]">{axisQuestions[currentQIndex].text}</p>
                  <div className="space-y-3">
                    {(["A", "B"] as const).map((ans) => (
                      <button key={ans} type="button"
                        onClick={() => {
                          setQAnswers((a) => [...a.slice(0, currentQIndex), ans]);
                          const epoch = navEpochRef.current;
                          setTimeout(() => goNext(epoch), 120);
                        }}
                        className="min-h-[52px] w-full rounded-xl border border-[#ccd0d5] bg-white py-3.5 text-left px-4 font-medium text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]">
                        {axisQuestions[currentQIndex][ans]}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-xs text-[#8d949e]">{t("step3to5.loading")}</p>
              )}
              <div className="mt-5 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`block rounded-full transition-all duration-300 ${i < currentQIndex ? "h-2 w-2 bg-[#1877f2]" : i === currentQIndex ? "h-2 w-6 bg-[#1877f2]" : "h-2 w-2 bg-[#dfe3e8]"}`} />
                ))}
              </div>
            </section>
          )}

          {/* ⑥ 解析演出 */}
          {step === 6 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-center">
              {worryText.trim() && (
                <p className="mb-4 text-left text-base leading-relaxed text-[#606770]">
                  {t("step6.inputLabel")}<span className="font-medium text-[#1c1e21]">「{worryText.trim().slice(0, 60)}{worryText.trim().length > 60 ? "…" : ""}」</span>
                </p>
              )}
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[#dfe3e8] border-t-[#1877f2]" />
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#1c1e21]">{t("step6.analyzing")}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#65676b]">{t("step6.slowNotice")}</p>
            </section>
          )}

          {/* ⑦ 最終結果 */}
          {step === 7 && result && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/90 px-5 py-4 text-[13px] leading-relaxed text-amber-950 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                <p className="font-semibold text-amber-900">{t("step7.disclaimer.title")}</p>
                <p className="mt-1.5">{t("step7.disclaimer.body")}</p>
              </div>

              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">{t("step7.inputSectionTitle")}</p>
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">「{worryText.trim() || t("step7.inputEmpty")}」</p>
                <p className="mt-3 text-sm leading-relaxed text-[#606770]">{resultAnalysisDescription}</p>
              </div>

              <div className="rounded-2xl border-2 border-[#1877f2]/40 bg-white px-5 py-7 shadow-[0_4px_16px_rgba(24,119,242,0.12)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">{t("step7.honneSectionTitle")}</p>
                <p className="mb-3 text-xs leading-relaxed text-[#8d949e]">※ {t("step7.honneDisclaimer")}</p>
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">{aiInsight ?? result.insight}</p>
              </div>

              {aiError && (
                <div className="space-y-3">
                  <p className="text-center text-xs text-[#fa3e3e]">{aiError}</p>
                  {aiError.includes(locale === "en" ? "limit" : "利用回数") && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <p className="mb-2 text-xs font-semibold text-amber-900">{t("step7.premium.limitTitle")}</p>
                      {auth.user ? (
                        <UpgradeButton label={t("step7.premium.upgradeLabel")} className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-amber-600" />
                      ) : (
                        <button type="button" onClick={() => setShowAuthModal(true)} className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">
                          {t("step7.premium.loginToUpgrade")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {useAiEnhancement && !aiError?.includes(locale === "en" ? "limit" : "利用回数") && (aiError || (!aiInsight && !aiAction)) && (
                <button type="button" onClick={retryAiGeneration} className="min-h-[48px] w-full rounded-xl border-2 border-[#1877f2] bg-white py-3.5 text-sm font-medium text-[#1877f2] transition hover:bg-[#e7f3ff]">
                  {t("step7.retryAi")}
                </button>
              )}

              <p className="text-center text-sm leading-relaxed text-[#65676b]">{t("step7.feelingOff")}</p>
              <p className="mx-auto max-w-md text-center text-[12px] leading-relaxed text-[#8d949e]">{t("step7.legalNote")}</p>

              {!savedThisSession ? (
                <div className="rounded-2xl border border-[#dfe3e8] bg-[#f8f9fb] px-5 py-4 space-y-3">
                  <div>
                    <p className="mb-1 text-[0.75rem] font-semibold text-[#1c1e21]">{t("step7.saveSection.title")}</p>
                    <p className="mb-3 text-xs leading-relaxed text-[#8d949e]">
                      {isPremium
                        ? t("step7.saveSection.descPremium")
                        : logs.length >= FREE_LOG_VISIBLE
                          ? t("step7.saveSection.descFreeLocked", { limit: FREE_LOG_VISIBLE })
                          : t("step7.saveSection.descFree", { limit: FREE_LOG_VISIBLE })}
                    </p>
                    <button type="button"
                      onClick={() => { addLog({ group, userInput: worryText.trim(), insight: aiInsight ?? result.insight, doctorAdvice: aiAction ?? result.action, selectedQuestions: [] }); setSavedThisSession(true); }}
                      className="w-full rounded-xl bg-[#1877f2] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]">
                      {t("step7.saveSection.saveButton")}
                    </button>
                  </div>
                  {!isPremium && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="mb-0.5 text-[0.75rem] font-semibold text-amber-900">{t("step7.premium.title")}</p>
                      <p className="mb-2 text-xs text-amber-800">{t("step7.premium.desc")}</p>
                      {auth.user ? (
                        <UpgradeButton label={t("step7.premium.upgradeButton")} className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600" />
                      ) : (
                        <button type="button" onClick={() => setShowAuthModal(true)} className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600">
                          {t("step7.premium.loginToUpgrade")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
                  <p className="text-sm font-semibold text-emerald-700">{t("step7.saveSection.savedMessage")}</p>
                  <Link href={`/${locale}/history`} className="mt-1.5 block text-xs text-emerald-600 underline">
                    {t("step7.saveSection.viewHistory")}
                  </Link>
                </div>
              )}

              <button type="button"
                onClick={() => { setStep(1); setWorryText(""); setQAnswers([]); setAiInsight(null); setAiAction(null); setAiError(null); setNextQuestions([]); setSavedThisSession(false); }}
                className="w-full min-h-[48px] rounded-xl border border-[#ccd0d5] py-3 px-4 font-medium text-[#606770] transition hover:bg-[#f0f2f5]">
                {t("step7.restart")}
              </button>

              <FollowUpListLazy questions={displayFollowUps} onPick={onPickFollowUp} />
            </section>
          )}

          {step === 7 && !result && (
            <p className="rounded-2xl border border-[#dfe3e8] bg-white p-6 text-center text-[#65676b] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              {t("step7.notFound")}
            </p>
          )}
        </div>

        <footer className="mt-12 border-t border-[#dfe3e8] pt-6 text-center text-xs text-[#8d949e]">
          <p>{t("app.footer")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/privacy`} className="hover:underline">{t("app.privacy")}</Link>
            <Link href={`/${locale}/terms`} className="hover:underline">{t("app.terms")}</Link>
            <Link href={`/${locale}/legal`} className="hover:underline">{t("app.legal")}</Link>
          </div>
        </footer>
      </div>

      {showAuthModal && <AuthModal auth={auth} onClose={() => setShowAuthModal(false)} />}
      <OnboardingModal />
      <InstallPrompt />
    </div>
  );
}
