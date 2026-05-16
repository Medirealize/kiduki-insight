"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
import dynamic from "next/dynamic";
import { analyzePersonality } from "@/lib/personality";
import { pickClosestInsight } from "@/lib/insights";
import { GROUP_TO_AXIS_INDEX, AXIS_QUESTIONS, TOTAL_STEPS } from "@/lib/constants";
import { mergeFollowUpQuestions } from "@/lib/follow-up-questions";
import { track } from "@/lib/analytics";

const PROFILE_STORAGE_KEY = "kiduki-insight-profile-v1";
const PREFS_STORAGE_KEY = "kiduki-insight-prefs-v1";

const STEP_LABELS: Record<number, string> = {
  1: "ステップ1、属性の入力",
  2: "ステップ2、悩みや聞きたいことの入力",
  3: "ステップ3、深掘りの質問 1問目",
  4: "ステップ4、深掘りの質問 2問目",
  5: "ステップ5、深掘りの質問 3問目",
  6: "結果の準備中",
  7: "結果の表示",
};

const FollowUpListLazy = dynamic(
  () => import("@/app/components/FollowUpList"),
  { loading: () => <p className="text-center text-xs text-[#8d949e]">読み込み中…</p> }
);

export default function Home() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"in" | "out">("in");
  // デフォルトの年を 1985 年に固定
  const [birthDate, setBirthDate] = useState("1985-01-01");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [useAiEnhancement, setUseAiEnhancement] = useState(true);
  const [worryText, setWorryText] = useState("");
  const [qAnswers, setQAnswers] = useState<("A" | "B")[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);
  const [deepQuestions, setDeepQuestions] = useState<string[]>([]);

  const profileHydratedRef = useRef(false);
  const prefsHydratedRef = useRef(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef(step);
  const useAiEnhancementRef = useRef(useAiEnhancement);
  /** 戻る等でナビが差し替わった後に、遅延 goNext が古いステップを進めないようにする */
  const navEpochRef = useRef(0);
  stepRef.current = step;
  useAiEnhancementRef.current = useAiEnhancement;

  const personality = useMemo(() => analyzePersonality(birthDate), [birthDate]);
  const typeCode = personality?.typeCode ?? "A1";
  const group = personality?.group ?? "自分軸";
  const primaryAxis = GROUP_TO_AXIS_INDEX[group];
  const questions = AXIS_QUESTIONS[primaryAxis];

  const selectedFocuses = useMemo(() => {
    return qAnswers.map((ans, i) =>
      ans === "A" ? questions[i].focusA : questions[i].focusB
    );
  }, [qAnswers, questions]);

  /** AI未返答時は軸の固定質問文をそのまま表示（待ち＋ブロックを避ける） */
  const effectiveQuestionTexts = useMemo(() => {
    const staticTexts = questions.map((q) => q.text);
    if (deepQuestions.length === 0) return staticTexts;
    return [0, 1, 2].map(
      (i) => deepQuestions[i] ?? staticTexts[i] ?? ""
    );
  }, [deepQuestions, questions]);

  // 画面には表示しないが、APIプロンプト用のベースInsight/Actionとしてのみ使用
  const result = useMemo(() => {
    return pickClosestInsight(typeCode, gender, worryText, selectedFocuses);
  }, [typeCode, gender, worryText, selectedFocuses]);

  const resultAnalysisDescription = useMemo(() => {
    if (!useAiEnhancement) {
      return "上記について、性格統計学に基づき表示しています（通信なし）。";
    }
    if (aiInsight || aiAction) {
      return "上記について、性格統計学とAIの視点で深く分析しました。";
    }
    if (aiError) {
      return "AIの生成に失敗したため、性格統計学ベースの文例を表示しています。";
    }
    return "上記について、性格統計学に基づき表示しています。";
  }, [useAiEnhancement, aiInsight, aiAction, aiError]);

  const displayFollowUps = useMemo(() => {
    if (useAiEnhancement && nextQuestions.length > 0) {
      return nextQuestions;
    }
    return mergeFollowUpQuestions(useAiEnhancement ? nextQuestions : [], {
      group,
      typeCode,
      worryText,
    });
  }, [useAiEnhancement, nextQuestions, group, typeCode, worryText]);

  useEffect(() => {
    track("step_view", { step });
  }, [step]);

  useEffect(() => {
    queueMicrotask(() => {
      stepHeadingRef.current?.focus();
    });
  }, [step]);

  const onPickFollowUp = useCallback((q: string) => {
    navEpochRef.current += 1;
    setWorryText(q);
    setQAnswers([]);
    setAiInsight(null);
    setAiAction(null);
    setAiError(null);
    setNextQuestions([]);
    setDeepQuestions([]);
    setStep(2);
  }, []);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    navEpochRef.current += 1;
    setDirection("out");
    setTimeout(() => {
      if (step === 6) {
        setIsLoading(false);
        setStep(5);
      } else if (step === 7) {
        setAiInsight(null);
        setAiAction(null);
        setAiError(null);
        setNextQuestions([]);
        setStep(5);
      } else if (step === 2) {
        setStep(1);
      } else if (step >= 3 && step <= 5) {
        setQAnswers((a) => a.slice(0, Math.max(0, step - 3)));
        if (step === 3) {
          setDeepQuestions([]);
        }
        setStep((s) => s - 1);
      }
      setDirection("in");
    }, 200);
  }, [step]);

  const retryAiGeneration = useCallback(() => {
    if (!useAiEnhancement || !result) return;
    navEpochRef.current += 1;
    setAiError(null);
    setAiInsight(null);
    setAiAction(null);
    setNextQuestions([]);
    setStep(6);
    setIsLoading(true);
  }, [useAiEnhancement, result]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) return;
        const p = JSON.parse(raw) as { birthDate?: string; gender?: string };
        if (p.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) {
          setBirthDate(p.birthDate);
        }
        if (p.gender === "male" || p.gender === "female") {
          setGender(p.gender);
        }
      } catch {
        /* ignore */
      } finally {
        profileHydratedRef.current = true;
      }
    });
  }, []);

  useEffect(() => {
    if (!profileHydratedRef.current) return;
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ birthDate, gender })
      );
    } catch {
      /* ignore */
    }
  }, [birthDate, gender]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(PREFS_STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as { useAiEnhancement?: boolean };
          if (typeof p.useAiEnhancement === "boolean") {
            setUseAiEnhancement(p.useAiEnhancement);
          }
        }
      } catch {
        /* ignore */
      } finally {
        prefsHydratedRef.current = true;
      }
    });
  }, []);

  useEffect(() => {
    if (!prefsHydratedRef.current) return;
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ useAiEnhancement })
      );
    } catch {
      /* ignore */
    }
  }, [useAiEnhancement]);

  const goNext = useCallback((epochSnapshot?: number) => {
    const useStaleGuard = typeof epochSnapshot === "number";
    const staleGuard = useStaleGuard ? epochSnapshot : null;
    setDirection("out");
    setTimeout(() => {
      if (
        staleGuard !== null &&
        navEpochRef.current !== staleGuard
      ) {
        setDirection("in");
        return;
      }
      const s = stepRef.current;
      const useAi = useAiEnhancementRef.current;
      if (s === 5) {
        if (useAi) {
          setStep(6);
          setIsLoading(true);
        } else {
          setAiError(null);
          setAiInsight(null);
          setAiAction(null);
          setNextQuestions([]);
          setStep(7);
        }
      } else if (s < 5) {
        if (s === 2) {
          setDeepQuestions([]);
        }
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      }
      setDirection("in");
    }, 200);
  }, []);

  useEffect(() => {
    if (step !== 6 || !isLoading || !result) return;

    let cancelled = false;

    const run = async () => {
      try {
        setAiError(null);
        setAiInsight(null);
        setAiAction(null);
        setNextQuestions([]);
        const startedAt = Date.now();

        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typeCode,
            group,
            worryText,
            baseInsight: result.insight,
            baseAction: result.action,
          }),
        });

        let insight: string | null = null;
        let action: string | null = null;
        let followups: string[] = [];

        if (res.ok) {
          const data = (await res.json()) as {
            insight?: string;
            doctor_advice?: string;
            next_questions?: string[];
            error?: string;
          };
          insight = data.insight ?? null;
          action = data.doctor_advice ?? null;
          followups = Array.isArray(data.next_questions)
            ? data.next_questions.filter((q) => typeof q === "string" && q.trim().length > 0)
            : [];
          if (!insight || !action) {
            setAiError(
              "AIからのメッセージを完全には取得できませんでした。時間をおいてもう一度お試しください。"
            );
          }
        } else {
          setAiError("AIからのメッセージ取得に失敗しました。時間をおいて再度お試しください。");
        }

        const elapsed = Date.now() - startedAt;
        /* 最小演出時間のみ（長い待ちを避ける） */
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          if (cancelled) return;
          setDirection("out");
          setTimeout(() => {
            if (!cancelled) {
              if (insight) setAiInsight(insight);
              if (action) setAiAction(action);
              if (followups.length > 0) setNextQuestions(followups);
              setStep(7);
              setIsLoading(false);
              setDirection("in");
            }
          }, 200);
        }, remaining);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setAiError("AIとの通信中にエラーが発生しました。時間をおいて再度お試しください。");
          setDirection("out");
          setTimeout(() => {
            if (!cancelled) {
              setStep(7);
              setIsLoading(false);
              setDirection("in");
            }
          }, 200);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [step, isLoading, result, typeCode, group, worryText, selectedFocuses, useAiEnhancement]);

  const showNextButton =
    (step === 1 && birthDate.trim()) ||
    (step === 2 && worryText.trim()) ||
    (step === 3 && qAnswers.length >= 1) ||
    (step === 4 && qAnswers.length >= 2) ||
    (step === 5 && qAnswers.length >= 3);

  const currentQIndex = step - 3;
  const currentQuestionText = effectiveQuestionTexts[currentQIndex];

  // ステップ3: AIから深掘り文を取得できれば差し替え（未取得時は effectiveQuestionTexts で静的文言を使用）
  useEffect(() => {
    if (!useAiEnhancement) return;
    if (step !== 3) return;
    if (!birthDate || !worryText.trim()) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/deep-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typeCode,
            group,
            worryText,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { questions?: string[] };
        if (!data.questions || !Array.isArray(data.questions)) return;
        const qs = data.questions
          .map((q) => (typeof q === "string" ? q.trim() : ""))
          .filter((q) => q.length > 0);
        if (!cancelled && qs.length >= 1) {
          setDeepQuestions(qs.slice(0, 3));
        }
      } catch (e) {
        console.error("deep-questions fetch error", e);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [step, typeCode, group, worryText, birthDate, questions, useAiEnhancement]);

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-[#1c1e21] antialiased">
      {/* プログレスバー */}
      <div className="sticky top-0 z-10 h-1.5 w-full bg-[#dfe3e8]">
        <div
          className="h-full bg-[#1877f2] transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-md px-6 pt-10 pb-8 sm:pt-14 sm:pb-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1877F2] to-[#166FE5] px-6 py-10 text-center shadow-[0_6px_24px_rgba(24,119,242,0.28)]">
            {/* 背景ぼかし */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            {/* 装飾ドット列 */}
            <div className="pointer-events-none absolute left-5 top-5 flex gap-1.5 opacity-30">
              {[2, 2.5, 2, 1.5].map((s, i) => (
                <div key={i} style={{ width: `${s * 4}px`, height: `${s * 4}px` }} className="rounded-full bg-white" />
              ))}
            </div>
            {/* 吹き出しイラスト（患者↔先生のコミュニケーション） */}
            <svg
              viewBox="0 0 110 90"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 right-3 w-[90px] opacity-[0.22]"
              fill="white"
            >
              <rect x="0" y="28" width="65" height="44" rx="12" />
              <path d="M14 72 L5 86 L26 72 Z" />
              <rect x="32" y="0" width="78" height="44" rx="12" />
              <path d="M98 44 L108 57 L87 44 Z" />
              <rect x="8" y="40" width="34" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
              <rect x="8" y="48" width="24" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
              <rect x="8" y="56" width="30" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
              <rect x="42" y="12" width="48" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
              <rect x="42" y="20" width="36" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
              <rect x="42" y="28" width="44" height="3" rx="1.5" fill="rgba(24,119,242,0.45)" />
            </svg>
            <h1 className="relative text-[2.2rem] font-bold tracking-[0.08em] text-white drop-shadow-sm">
              ほんね。
            </h1>
            <p className="relative mt-2 text-[0.8rem] font-medium tracking-[0.22em] text-white/70">
              気づいて！私のきもち
            </p>
          </div>
        </header>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {STEP_LABELS[step] ?? ""}
        </p>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="sr-only outline-none"
        >
          {STEP_LABELS[step] ?? ""}
        </h2>

        {step > 1 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={goBack}
              className="min-h-[48px] rounded-xl border border-[#ccd0d5] bg-white px-4 py-2.5 text-sm font-medium text-[#606770] transition hover:bg-[#f0f2f5]"
            >
              ← 戻る
            </button>
          </div>
        )}

        <div
          className={`transition-all duration-300 ease-out ${
            direction === "out"
              ? "opacity-0 translate-y-3 scale-[0.98]"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {/* ① 属性入力 */}
          {step === 1 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-4 text-base leading-relaxed text-[#606770]">
                生年月日と性別を教えてください。性格統計学に基づいて、あなたに合った問いかけをします。
              </p>
              <div className="space-y-4">
                <div className="min-w-0 overflow-hidden">
                  <label htmlFor="birth" className="mb-1 flex items-center gap-1.5 text-[0.8125rem] font-semibold tracking-wide text-[#65676b] uppercase">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#1877f2]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="1" y="2.5" width="14" height="12" rx="2" />
                      <path d="M1 6.5h14" strokeLinecap="round" />
                      <path d="M5 1v3M11 1v3" strokeLinecap="round" />
                    </svg>
                    生年月日
                  </label>
                  <input
                    id="birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full max-w-full min-w-0 rounded-xl border border-[#ccd0d5] bg-white px-3 py-3 text-base text-[#1c1e21] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
                  />
                </div>
                <div>
                  <span className="mb-2 flex items-center gap-1.5 text-[0.8125rem] font-semibold tracking-wide text-[#65676b] uppercase">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#1877f2]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="8" cy="5.5" r="3" />
                      <path d="M2 15c0-3 2.686-5 6-5s6 2 6 5" strokeLinecap="round" />
                    </svg>
                    性別
                  </span>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex min-h-[48px] min-w-[6rem] cursor-pointer items-center gap-3 rounded-xl border border-transparent px-2 py-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1877f2]/30">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        className="h-5 w-5 accent-teal-600"
                      />
                      <span className="text-[#1c1e21]">男性</span>
                    </label>
                    <label className="flex min-h-[48px] min-w-[6rem] cursor-pointer items-center gap-3 rounded-xl border border-transparent px-2 py-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1877f2]/30">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        className="h-5 w-5 accent-teal-600"
                      />
                      <span className="text-[#1c1e21]">女性</span>
                    </label>
                  </div>
                </div>
                <label className="flex min-h-[52px] cursor-pointer items-start gap-3 rounded-xl border border-[#e4e6eb] bg-[#f8f9fb] px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1877f2]/30">
                  <input
                    id="use-ai-toggle"
                    type="checkbox"
                    checked={useAiEnhancement}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setUseAiEnhancement(v);
                      try {
                        localStorage.setItem(
                          PREFS_STORAGE_KEY,
                          JSON.stringify({ useAiEnhancement: v })
                        );
                        prefsHydratedRef.current = true;
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#1877f2]"
                    aria-label="AIで表現を整える（最後のステップで通信する）"
                  />
                  <span className="text-[0.8125rem] leading-relaxed text-[#606770]">
                    <span className="font-medium text-[#1c1e21]">AIで表現を整える</span>
                    （オンで最後に通信します。オフなら端末内の結果だけでその場で表示します）
                  </span>
                </label>
              </div>
              {showNextButton && (
                <button
                  type="button"
                  onClick={() => goNext()}
                  className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
                >
                  次へ
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
                先生に聞きたいこと、気になっていること、不安に思っていることを書いてください。うまく言葉にできなくても大丈夫です。
              </p>
              {!useAiEnhancement && (
                <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                  いまの設定は<strong>通信なし</strong>です。入力内容はサーバーに送られず、この端末だけで結果まで進みます。
                </p>
              )}
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="例：血液検査が必要な理由を聞きたい、病気のことを家族にどう説明すればいいかわからない、薬をいつまで飲み続けるのか不安…"
                rows={5}
                className="w-full resize-none rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-base leading-relaxed text-[#1c1e21] placeholder-[#8d949e] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
              />
              {showNextButton && (
                <button
                  type="button"
                  onClick={() => goNext()}
                  className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
                >
                  次へ
                </button>
              )}
            </section>
          )}

          {/* ③④⑤ 深掘り質問（1画面1問） */}
          {step >= 3 && step <= 5 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7f0fd] px-3 py-1 text-[0.75rem] font-semibold text-[#1877f2]">
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" />
                  <path d="M6 4v3M6 8.5v.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {group}タイプの質問
              </span>
              {currentQuestionText ? (
                <>
                  <p className="mb-6 text-base leading-relaxed text-[#1c1e21]">
                    {currentQuestionText}
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQAnswers((a) => [...a.slice(0, currentQIndex), "A"]);
                        const epoch = navEpochRef.current;
                        setTimeout(() => goNext(epoch), 120);
                      }}
                      className="min-h-[52px] w-full rounded-xl border border-[#ccd0d5] bg-white py-3.5 text-left px-4 font-medium text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
                    >
                      {questions[currentQIndex]?.A ?? "はい、そう感じることが多い"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQAnswers((a) => [...a.slice(0, currentQIndex), "B"]);
                        const epoch = navEpochRef.current;
                        setTimeout(() => goNext(epoch), 120);
                      }}
                      className="min-h-[52px] w-full rounded-xl border border-[#ccd0d5] bg-white py-3.5 text-left px-4 font-medium text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
                    >
                      {questions[currentQIndex]?.B ?? "いいえ、あまり当てはまらない"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-xs text-[#8d949e]">
                  質問を準備しています…
                </p>
              )}
              <div className="mt-5 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all duration-300 ${
                      i < currentQIndex
                        ? "h-2 w-2 bg-[#1877f2]"
                        : i === currentQIndex
                        ? "h-2 w-6 bg-[#1877f2]"
                        : "h-2 w-2 bg-[#dfe3e8]"
                    }`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ⑥ 思考の解析演出（3秒） */}
          {step === 6 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-center">
              {worryText.trim() && (
                <p className="mb-4 text-left text-base leading-relaxed text-[#606770]">
                  あなたが入力したこと：<span className="font-medium text-[#1c1e21]">「{worryText.trim().slice(0, 60)}{worryText.trim().length > 60 ? "…" : ""}」</span>
                </p>
              )}
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[#dfe3e8] border-t-[#1877f2]" />
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#1c1e21]">
                思考を解析しています…
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#65676b]">
                AIを含む処理のため、環境によっては1分ほどかかることがあります。
              </p>
            </section>
          )}

          {/* ⑦ 最終結果 */}
          {step === 7 && result && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/90 px-5 py-4 text-[13px] leading-relaxed text-amber-950 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                <p className="font-semibold text-amber-900">ご利用前に（重要）</p>
                <p className="mt-1.5">
                  表示されるのは<strong>気づきの仮説</strong>であり、<strong>医学的診断や治療の提案ではありません</strong>。
                  症状や体調の判断は、必ず医療機関で受けてください。
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                  あなたが入力したこと
                </p>
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">
                  「{worryText.trim() || "（未入力）"}」
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#606770]">
                  {resultAnalysisDescription}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-[#1877f2]/40 bg-white px-5 py-7 shadow-[0_4px_16px_rgba(24,119,242,0.12)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                  あなたのほんね
                </p>
                <p className="mb-3 text-xs leading-relaxed text-[#8d949e]">
                  ※
                  次の文章は「そうかもしれない」という<strong>仮説</strong>です。当てはまらなければ、その感覚を優先してください。
                </p>
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">
                  {aiInsight ?? result.insight}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                  医師への一言（案）
                </p>
                <p className="mt-2 text-[18px] leading-[1.8] text-[#1c1e21]">
                  {aiAction ?? result.action}
                </p>
              </div>

              <FollowUpListLazy
                questions={displayFollowUps}
                onPick={onPickFollowUp}
              />

              {aiError && (
                <p className="text-center text-xs text-[#fa3e3e]">
                  {aiError}
                </p>
              )}

              {useAiEnhancement && (aiError || (!aiInsight && !aiAction)) && (
                <button
                  type="button"
                  onClick={retryAiGeneration}
                  className="min-h-[48px] w-full rounded-xl border-2 border-[#1877f2] bg-white py-3.5 text-sm font-medium text-[#1877f2] transition hover:bg-[#e7f3ff]"
                >
                  AIでもう一度整える
                </button>
              )}

              <p className="text-center text-sm leading-relaxed text-[#65676b]">
                結果に違和感があるなら、それは「自分はそうではない」と自覚できた証拠です。その感覚も立派な気づきです。
              </p>

              <p className="mx-auto max-w-md text-center text-[12px] leading-relaxed text-[#8d949e]">
                本アプリは性格統計学に基づくコミュニケーション支援ツールであり、医学的な診断や治療の助言を行うものではありません。体調に不安がある場合は、必ず専門の医療機関を受診してください。
              </p>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setWorryText("");
                    setQAnswers([]);
                    setAiInsight(null);
                    setAiAction(null);
                    setAiError(null);
                    setNextQuestions([]);
                    setDeepQuestions([]);
                  }}
                  className="min-h-[48px] rounded-xl border border-[#ccd0d5] py-3 px-4 font-medium text-[#606770] transition hover:bg-[#f0f2f5] sm:min-w-[7rem]"
                >
                  最初から
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const actionText = aiAction ?? result.action;
                    void navigator.clipboard.writeText(actionText);
                  }}
                  className="min-h-[48px] flex-1 rounded-xl border border-[#ccd0d5] bg-white py-3 px-4 text-sm font-medium text-[#1c1e21] transition hover:bg-[#f0f2f5] sm:min-w-[10rem]"
                >
                  医師への一言だけコピー
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const insightText = aiInsight ?? result.insight;
                    const actionText = aiAction ?? result.action;
                    const text = `あなたが入力したこと：\n「${worryText.trim()}」\n\n${resultAnalysisDescription}\n\n【Insight】\n${insightText}\n\n【診察室での最初の一言】\n${actionText}`;
                    void navigator.clipboard.writeText(text);
                  }}
                  className="min-h-[48px] flex-1 rounded-xl bg-[#1877f2] py-3 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#166fe5] sm:min-w-[10rem]"
                >
                  すべてコピー
                </button>
              </div>
            </section>
          )}

          {step === 7 && !result && (
            <p className="rounded-2xl border border-[#dfe3e8] bg-white p-6 text-center text-[#65676b] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              該当する結果が見つかりませんでした。最初からお試しください。
            </p>
          )}
        </div>

        <footer className="mt-12 border-t border-[#dfe3e8] pt-6 text-center text-xs text-[#8d949e]">
          本アプリは診断を行うものではありません。医師への相談を助けるツールです。
        </footer>
      </div>

    </div>
  );
}
