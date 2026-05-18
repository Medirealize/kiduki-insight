"use client";

type Props = {
  questions: string[];
  onPick: (text: string) => void;
};

export default function FollowUpList({ questions, onPick }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <p className="mb-1 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
        あなたの本音を、もっと深く
      </p>
      <p className="mb-4 text-xs leading-relaxed text-[#8d949e]">
        気持ちの奥にある言葉を探る問いかけです。気になったものをタップすると、その問いからもう一度考え直せます。
      </p>
      <div className="flex flex-col gap-2">
        {questions.map((q, idx) => (
          <button
            key={`${idx}-${q.slice(0, 24)}`}
            type="button"
            onClick={() => onPick(q)}
            className="min-h-[48px] w-full rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-left text-[14px] leading-relaxed text-[#1c1e21] transition hover:border-[#1877f2] hover:bg-[#f0f2f5] active:scale-[0.99]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
