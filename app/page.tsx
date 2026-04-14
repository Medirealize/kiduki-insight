"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { analyzePersonality } from "@/lib/personality";
import { pickClosestInsight } from "@/lib/insights";
import { GROUP_TO_AXIS_INDEX, AXIS_QUESTIONS, TOTAL_STEPS } from "@/lib/constants";

export default function Home() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"in" | "out">("in");
  // デフォルトの年を 1985 年に固定
  const [birthDate, setBirthDate] = useState("1985-01-01");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [worryText, setWorryText] = useState("");
  const [qAnswers, setQAnswers] = useState<("A" | "B")[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);
  const [deepQuestions, setDeepQuestions] = useState<string[]>([]);

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

  // 画面には表示しないが、APIプロンプト用のベースInsight/Actionとしてのみ使用
  const result = useMemo(() => {
    return pickClosestInsight(typeCode, gender, worryText, selectedFocuses);
  }, [typeCode, gender, worryText, selectedFocuses]);

  const goNext = useCallback(() => {
    setDirection("out");
    setTimeout(() => {
      if (step === 5) {
        setStep(6);
        setIsLoading(true);
      } else if (step < 5) {
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      }
      setDirection("in");
    }, 200);
  }, [step]);

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

        const res = await fetch("/api/chat", {
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
        const remaining = Math.max(0, 3000 - elapsed);

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
  }, [step, isLoading, result, typeCode, group, worryText, selectedFocuses]);

  const showNextButton =
    (step === 1 && birthDate.trim()) ||
    (step === 2 && worryText.trim()) ||
    // ステップ3〜5は、AI質問が取得できてから回答可能にする
    (step === 3 && deepQuestions.length >= 1 && qAnswers.length >= 1) ||
    (step === 4 && deepQuestions.length >= 2 && qAnswers.length >= 2) ||
    (step === 5 && deepQuestions.length >= 3 && qAnswers.length >= 3);

  const currentQIndex = step - 3;

  // ステップ3開始時に、AIから深掘り質問文を取得（失敗時は既存の文言を使用）
  useEffect(() => {
    if (step !== 3) return;
    if (!birthDate || !worryText.trim()) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/deep-questions", {
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
  }, [step, typeCode, group, worryText]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1c1e21] antialiased">
      {/* プログレスバー */}
      <div className="sticky top-0 z-10 h-1.5 w-full bg-[#dfe3e8]">
        <div
          className="h-full bg-[#1877f2] transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-[1.333rem] font-semibold tracking-tight text-[#1c1e21]">
            先生、本当はね。
          </h1>
          <p className="mt-1 text-xs text-[#65676b]">
            〜「伝えたいこと」の奥にある、本当の想い〜
          </p>
        </header>

        <div
          className={`transition-all duration-300 ease-out ${
            direction === "out"
              ? "opacity-0 translate-y-3 scale-[0.98]"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {/* ① 属性入力 */}
          {step === 1 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-4 text-base leading-relaxed text-[#606770]">
                生年月日と性別を教えてください。性格統計学に基づいて、あなたに合った問いかけをします。
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="birth" className="mb-1 block text-[0.8125rem] font-semibold tracking-wide text-[#65676b] uppercase">
                    生年月日
                  </label>
                  <input
                    id="birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-[#1c1e21] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[0.8125rem] font-semibold tracking-wide text-[#65676b] uppercase">
                    性別
                  </span>
                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="text-[#1c1e21]">男性</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="text-[#1c1e21]">女性</span>
                    </label>
                  </div>
                </div>
              </div>
              {showNextButton && (
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
                >
                  次へ
                </button>
              )}
            </section>
          )}

          {/* ② 悩み入力 */}
          {step === 2 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-4 text-base leading-relaxed text-[#606770]">
                今、先生に聞きたいことや、不安に思っていることを自由に書いてください。
              </p>
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="例：症状がいつまで続くか、仕事を休むべきか、家族にどう伝えればいいか…"
                rows={5}
                className="w-full resize-none rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-base leading-relaxed text-[#1c1e21] placeholder-[#8d949e] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
              />
              {showNextButton && (
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
                >
                  次へ
                </button>
              )}
            </section>
          )}

          {/* ③④⑤ 深掘り質問（1画面1問） */}
          {step >= 3 && step <= 5 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
              <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                {group}に基づく質問
              </p>
              {deepQuestions.length >= step - 2 ? (
                <>
                  <p className="mb-6 text-base leading-relaxed text-[#1c1e21]">
                    {deepQuestions[currentQIndex]}
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQAnswers((a) => [...a.slice(0, currentQIndex), "A"]);
                        setTimeout(goNext, 120);
                      }}
                      className="w-full rounded-xl border border-[#ccd0d5] bg-white py-3.5 text-left px-4 font-medium text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
                    >
                      そう感じることが多い
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQAnswers((a) => [...a.slice(0, currentQIndex), "B"]);
                        setTimeout(goNext, 120);
                      }}
                      className="w-full rounded-xl border border-[#ccd0d5] bg-white py-3.5 text-left px-4 font-medium text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
                    >
                      あまり当てはまらない
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-xs text-[#8d949e]">
                  質問を準備しています…
                </p>
              )}
              <p className="mt-4 text-center text-xs text-[#8d949e]">
                {step} / {TOTAL_STEPS}
              </p>
            </section>
          )}

          {/* ⑥ 思考の解析演出（3秒） */}
          {step === 6 && (
            <section className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-center">
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
                性格統計学の視点で、あなたの入力を深く分析しています
              </p>
            </section>
          )}

          {/* ⑦ 最終結果 */}
          {step === 7 && result && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                  あなたが入力したこと
                </p>
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">
                  「{worryText.trim() || "（未入力）"}」
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#606770]">
                  上記について、性格統計学の視点で深く分析しました。
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="text-[18px] leading-[1.8] text-[#1c1e21]">
                  {aiInsight ?? result.insight}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <p className="mb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                  医師への一言
                </p>
                <p className="mt-2 text-[18px] leading-[1.8] text-[#1c1e21]">
                  {aiAction ?? result.action}
                </p>
              </div>

              {nextQuestions.length > 0 && (
                <div className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <p className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
                    次に考えてみる問い
                  </p>
                  <div className="flex flex-col gap-2">
                    {nextQuestions.map((q, idx) => (
                      <button
                        key={`${q}-${idx}`}
                        type="button"
                        onClick={() => {
                          setWorryText(q);
                          setQAnswers([]);
                          setAiInsight(null);
                          setAiAction(null);
                          setAiError(null);
                          setNextQuestions([]);
                          setDeepQuestions([]);
                          setStep(2);
                        }}
                        className="w-full rounded-xl border border-[#ccd0d5] bg-white px-4 py-2.5 text-left text-[14px] leading-relaxed text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiError && (
                <p className="text-center text-xs text-[#fa3e3e]">
                  {aiError}
                </p>
              )}

              <p className="text-center text-sm leading-relaxed text-[#65676b]">
                この結果に違和感があるなら、それは「自分はそうではない」と自覚できた証拠。その感覚を大切に。
              </p>

              <p className="mx-auto max-w-md text-center text-[12px] leading-relaxed text-[#8d949e]">
                本アプリは性格統計学に基づくコミュニケーション支援ツールであり、医学的な診断や治療の助言を行うものではありません。体調に不安がある場合は、必ず専門の医療機関を受診してください。
              </p>

              <div className="flex gap-3 pt-2">
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
                  className="rounded-xl border border-[#ccd0d5] py-3 px-4 font-medium text-[#606770] transition hover:bg-[#f0f2f5]"
                >
                  最初から
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const insightText = aiInsight ?? result.insight;
                    const actionText = aiAction ?? result.action;
                    const text = `あなたが入力したこと：\n「${worryText.trim()}」\n\n上記について、性格統計学とAIの視点で深く分析しました。\n\n【Insight】\n${insightText}\n\n【診察室での最初の一言】\n${actionText}`;
                    void navigator.clipboard.writeText(text);
                  }}
                  className="flex-1 rounded-xl bg-[#1877f2] py-3 font-medium text-white shadow-sm transition hover:bg-[#166fe5]"
                >
                  コピー
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
