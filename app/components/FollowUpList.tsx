"use client";

type Props = {
  questions: string[];
  onPick: (text: string) => void;
};

export default function FollowUpList({ questions, onPick }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#dfe3e8] bg-white px-7 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <p className="mb-1 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#1877f2]">
        次に考えてみる問い
      </p>
      <p className="mb-4 text-xs leading-relaxed text-[#8d949e]">
        短い問いと、少し時間をかけたい問いが混ざっています。気になったものだけをタップしてください。
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
