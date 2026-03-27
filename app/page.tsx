"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import insightsData from "../insights.json";

type PersonalityGroup = "自分軸" | "相手軸" | "社会軸";

export type AnalyzePersonalityResult = {
  typeCode: string;
  group: PersonalityGroup;
  cycleNumber: number;
} | null;

/**
 * 生年月日から性格タイプ(12パターン)とグループ(3軸)を判定する
 * @param birthday - '1990-01-01' 形式
 * @returns { typeCode: 'A1', group: '自分軸', cycleNumber: 1-60 } または null
 */
export function analyzePersonality(birthday: string): AnalyzePersonalityResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) return null;

  const baseDate = new Date("1900-01-01");
  const diffTime = Math.abs(date.getTime() - baseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const cycleNumber = (diffDays % 60) + 1;
  const typeIndex = Math.floor((cycleNumber - 1) / 5) + 1;

  let group: PersonalityGroup;
  let typeCode: string;

  if (typeIndex <= 4) {
    group = "自分軸";
    typeCode = `A${typeIndex}`;
  } else if (typeIndex <= 8) {
    group = "相手軸";
    typeCode = `B${typeIndex - 4}`;
  } else {
    group = "社会軸";
    typeCode = `C${typeIndex - 8}`;
  }

  return { typeCode, group, cycleNumber };
}

/** group を AXIS_QUESTIONS のインデックスに変換 */
const GROUP_TO_AXIS_INDEX: Record<PersonalityGroup, 0 | 1 | 2> = {
  "自分軸": 0,
  "相手軸": 1,
  "社会軸": 2,
};

type InsightRecord = {
  type_code: string;
  gender: string;
  variation_id: number;
  focus: string;
  insight: string;
  action: string;
};

const insights = insightsData as InsightRecord[];

/** 軸別・深掘り質問（各3問、二択）。UIには表示せず、選択肢A/Bに紐づくfocusのみで利用する */
const AXIS_QUESTIONS: Record<0 | 1 | 2, { text: string; A: string; B: string; focusA: string; focusB: string }[]> = {
  0: [
    { text: "物事を決めるとき、まず自分で納得したい方ですか？", A: "はい、納得してから決めたい", B: "いいえ、周りの意見も大切", focusA: "precision", focusB: "decision_support" },
    { text: "説明や根拠がはっきりしていると、安心しますか？", A: "はい、はっきりしていると安心", B: "いいえ、気持ちが分かれば十分なことも", focusA: "rational_assurance", focusB: "support" },
    { text: "自分のペースで進めたい気持ちは強いですか？", A: "はい、自分のペースを大切に", B: "いいえ、合わせることも多い", focusA: "self_reliance", focusB: "relationship" },
  ],
  1: [
    { text: "気持ちを分かってもらえたら、楽になると感じますか？", A: "はい、分かってもらえると楽", B: "いいえ、解決策の方が大事", focusA: "support", focusB: "efficiency" },
    { text: "周りの人に心配をかけたくないと感じますか？", A: "はい、心配をかけたくない", B: "いいえ、まず自分のこと", focusA: "family_responsibility", focusB: "self_control" },
    { text: "先生と「一緒に」考える感じは好きですか？", A: "はい、一緒に考えてほしい", B: "いいえ、結論を教えてほしい", focusA: "decision_support", focusB: "strategy" },
  ],
  2: [
    { text: "仕事や役割への影響が、気になりますか？", A: "はい、仕事への影響が気になる", B: "いいえ、まず体のことが中心", focusA: "social_role", focusB: "symptom_analysis" },
    { text: "見通しや計画が立つと、落ち着きますか？", A: "はい、見通しが欲しい", B: "いいえ、今の対処が先", focusA: "future_planning", focusB: "practical_question" },
    { text: "周囲に迷惑をかけないよう、自分で何とかしたいと思いますか？", A: "はい、自分で対処したい", B: "いいえ、頼ることも大切", focusA: "responsibility", focusB: "support" },
  ],
};

/** 悩みテキストから focus ヒントを取得 */
function getFocusHintsFromText(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const hints: string[] = [];
  if (/\b(仕事|働|役割|復帰|パフォーマンス)\b/.test(t)) hints.push("social_role", "performance");
  if (/\b(家族|周り|心配|迷惑)\b/.test(t)) hints.push("family_responsibility", "family");
  if (/\b(説明|理由|根拠|納得|理解)\b/.test(t)) hints.push("precision", "rational_assurance");
  if (/\b(不安|辛い|分かって)\b/.test(t)) hints.push("support", "reassurance");
  if (/\b(選択|決め|見通し)\b/.test(t)) hints.push("decision_making", "future_planning");
  if (/\b(症状|体調|受診)\b/.test(t)) hints.push("symptom_analysis", "self_control");
  return [...new Set(hints)];
}

/** 選択に最も近い insight を1件返す（type, gender, 悩みテキスト, Q1〜Q3で選んだ focus） */
function pickClosestInsight(
  typeCode: string,
  gender: string,
  worryText: string,
  selectedFocuses: string[]
): InsightRecord | null {
  const pool = insights.filter((r) => r.type_code === typeCode && r.gender === gender);
  if (pool.length === 0) return null;
  const hints = [...getFocusHintsFromText(worryText), ...selectedFocuses];
  if (hints.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  const scored = pool.map((r) => ({
    record: r,
    score: hints.filter((h) => r.focus === h || r.focus.includes(h)).length,
  }));
  const best = Math.max(...scored.map((s) => s.score));
  const candidates = scored.filter((s) => s.score === best).map((s) => s.record);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

const TOTAL_STEPS = 7; // ①属性 ②悩み ③Q1 ④Q2 ⑤Q3 ⑥解析演出 ⑦結果

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
            診察の予習。
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
