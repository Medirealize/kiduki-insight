"use client";
import type { DiagnosisLog } from "@/lib/types/log";

type Props = {
  log: DiagnosisLog;
  locked: boolean;
  onUpgrade: () => void;
};

function dateLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryCard({ log, locked, onUpgrade }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-[#f0f2f5] px-5 py-3">
        <span className="text-xs text-[#8d949e]">{dateLabel(log.createdAt)}</span>
        <span className="rounded-full bg-[#e7f0fd] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#1877f2]">
          {log.group}タイプ
        </span>
      </div>

      {/* 本文（ロック時はブラー） */}
      <div className={`px-5 py-4 space-y-4 ${locked ? "blur-sm select-none pointer-events-none" : ""}`}>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-[#8d949e]">相談内容</p>
          <p className="text-sm leading-relaxed text-[#1c1e21]">
            「{log.userInput.slice(0, 60)}{log.userInput.length > 60 ? "…" : ""}」
          </p>
        </div>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-[#1877f2]">あなたのほんね</p>
          <p className="text-sm leading-relaxed text-[#1c1e21] line-clamp-3">{log.insight}</p>
        </div>
        <div>
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-[#8d949e]">医師への一言（案）</p>
          <p className="text-sm leading-relaxed text-[#606770]">{log.doctorAdvice}</p>
        </div>
      </div>

      {/* ロックオーバーレイ */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877f2]/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1877f2]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-center text-sm font-semibold text-[#1c1e21]">
            プレミアムプランで<br />過去ログを全件確認
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]"
          >
            ロックを解除する
          </button>
        </div>
      )}
    </div>
  );
}
