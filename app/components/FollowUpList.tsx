"use client";
import { useTranslations } from "next-intl";

type Props = {
  questions: string[];
  onPick: (text: string) => void;
};

export default function FollowUpList({ questions, onPick }: Props) {
  const t = useTranslations("followUp");
  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-honne-border-light bg-white px-5 py-6 shadow-honne">
      <p className="mb-1 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-honne-primary">
        {t("title")}
      </p>
      <p className="mb-4 text-xs leading-relaxed text-honne-placeholder">
        {t("desc")}
      </p>
      <div className="flex flex-col gap-2">
        {questions.map((q, idx) => (
          <button
            key={`${idx}-${q.slice(0, 24)}`}
            type="button"
            onClick={() => onPick(q)}
            className="min-h-[48px] w-full rounded-xl border border-honne-border-input bg-white px-4 py-3 text-left text-[14px] leading-relaxed text-honne-text transition hover:border-honne-primary hover:bg-honne-bg active:scale-[0.99]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
