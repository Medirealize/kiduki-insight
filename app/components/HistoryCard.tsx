"use client";
import { useTranslations } from "next-intl";
import type { DiagnosisLog } from "@/lib/types/log";

type Props = {
  log: DiagnosisLog;
  locked: boolean;
  onUpgrade: () => void;
};

function dateLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HistoryCard({ log, locked, onUpgrade }: Props) {
  const t = useTranslations("historyCard");
  const tGroups = useTranslations("groupNames");

  const groupLabel = (() => {
    try { return tGroups(log.group as Parameters<typeof tGroups>[0]); }
    catch { return log.group; }
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-honne-border-light bg-white shadow-honne">
      <div className="flex items-center justify-between border-b border-honne-border-light px-5 py-3">
        <span className="text-xs text-honne-placeholder">{dateLabel(log.createdAt)}</span>
        <span className="rounded-full bg-honne-primary-tint px-2.5 py-0.5 text-[0.7rem] font-semibold text-honne-primary">
          {t("typeLabel", { group: groupLabel })}
        </span>
      </div>

      <div className={`px-5 py-4 space-y-4 ${locked ? "blur-sm select-none pointer-events-none" : ""}`}>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-honne-placeholder">{t("inputLabel")}</p>
          <p className="text-sm leading-relaxed text-honne-text">
            「{log.userInput.slice(0, 60)}{log.userInput.length > 60 ? "…" : ""}」
          </p>
        </div>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-honne-primary">{t("honneLabel")}</p>
          <p className="text-sm leading-relaxed text-honne-text line-clamp-3">{log.insight}</p>
        </div>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-honne-placeholder">{t("adviceLabel")}</p>
          <p className="text-sm leading-relaxed text-honne-secondary">{log.doctorAdvice}</p>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-honne-primary/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-honne-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-center text-sm font-semibold text-honne-text">
            {t("lockTitle").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="honne-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            {t("unlockButton")}
          </button>
        </div>
      )}
    </div>
  );
}
