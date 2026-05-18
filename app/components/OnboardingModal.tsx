"use client";
import { useEffect, useState } from "react";

const ONBOARDED_KEY = "honne-onboarded-v1";

export default function OnboardingModal() {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-white px-6 pt-8 pb-10 shadow-2xl sm:rounded-3xl">

        {/* ロゴ */}
        <div className="mb-6 text-center">
          <p className="text-4xl font-black tracking-[0.08em] text-[#1877f2]">ほんね。</p>
          <p className="mt-1 text-xs tracking-[0.2em] text-[#8d949e]">言いたいのに、言えない。</p>
        </div>

        {/* 説明 */}
        <p className="mb-6 text-center text-sm leading-relaxed text-[#606770]">
          上司・先生・パートナー・家族…<br />
          誰かに言えない気持ちを、言葉にするお手伝いをします。
        </p>

        {/* 3ステップ */}
        <div className="mb-8 space-y-4">
          {[
            { step: "1", icon: "🪞", title: "今の自分を選ぶ", desc: "3つのタイプから今の自分に近いものを選びます" },
            { step: "2", icon: "💬", title: "気持ちを書く", desc: "言葉にできなくても大丈夫。思ったままで OK です" },
            { step: "3", icon: "✨", title: "本音が言葉になる", desc: "3つの問いに答えると、あなたの本音が見えてきます" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
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

        {/* 注意書き */}
        <p className="mb-4 text-center text-[0.68rem] leading-relaxed text-[#8d949e]">
          本アプリは気持ちの言語化を助けるツールです。<br />
          医療診断・専門的なカウンセリングは行いません。
        </p>

        {/* ボタン */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-[#1877f2] py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
