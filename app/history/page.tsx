"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogStore } from "@/lib/store/useLogStore";
import { useUserStatus } from "@/lib/store/useUserStatus";
import { FREE_LOG_VISIBLE } from "@/lib/types/log";
import HistoryCard from "@/app/components/HistoryCard";
import type { PremiumReport } from "@/app/api/premium/report/route";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function HistoryPage() {
  const { logs, clearLogs, hydrated } = useLogStore();
  const { isPremium, upgradeToPremium, downgradeToFree, status } = useUserStatus();
  const [report, setReport] = useState<PremiumReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const generateReport = async () => {
    if (!isPremium || logs.length === 0) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch(`${API_BASE}/api/premium/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: "PREMIUM",
          logs: logs.slice(0, 10).map((l) => ({
            createdAt: l.createdAt,
            group: l.group,
            userInput: l.userInput,
            insight: l.insight,
            doctorAdvice: l.doctorAdvice,
          })),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as PremiumReport;
      setReport(data);
    } catch {
      setReportError("レポートの生成に失敗しました。時間をおいてお試しください。");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-[#1c1e21] antialiased">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-[#dfe3e8] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#606770] transition hover:text-[#1877f2]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ほんね。に戻る
          </Link>
          <span className="text-sm font-semibold text-[#1c1e21]">診断カルテ</span>
          {/* プレミアムバッジ or FREEバッジ */}
          <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
            isPremium ? "bg-[#ffd700]/20 text-[#b8860b]" : "bg-[#f0f2f5] text-[#8d949e]"
          }`}>
            {isPremium ? "✦ PREMIUM" : "FREE"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 py-8 space-y-6">

        {/* プレミアムバナー（FREE時のみ） */}
        {!isPremium && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-6 py-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50">PREMIUM PLAN</p>
            <p className="mt-1 text-lg font-bold">すべてのカルテを<br />いつでも振り返れる</p>
            <ul className="mt-3 space-y-1 text-sm text-white/70">
              <li>✓ 過去ログ 無制限閲覧</li>
              <li>✓ 診断回数 無制限</li>
              <li>✓ AI による総合ほんねレポート</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-[#1a1a2e] transition hover:bg-white/90"
            >
              プレミアムプランにアップグレード
            </button>
          </div>
        )}

        {/* プレミアムレポート（PREMIUM時のみ） */}
        {isPremium && logs.length >= 2 && (
          <div className="rounded-2xl border-2 border-[#ffd700]/40 bg-white px-5 py-5 shadow-[0_4px_16px_rgba(255,215,0,0.1)]">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-widest text-[#b8860b]">✦ ほんね。レポート</p>
            <p className="mb-4 text-sm text-[#606770]">
              蓄積されたカルテ（{logs.length}件）をAIが総合分析します。
            </p>
            {!report && (
              <button
                type="button"
                onClick={generateReport}
                disabled={reportLoading}
                className="w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#daa520] py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              >
                {reportLoading ? "AIが分析中…" : "まとめてAI分析する"}
              </button>
            )}
            {reportError && <p className="mt-2 text-center text-xs text-red-500">{reportError}</p>}
            {report && (
              <div className="space-y-4 mt-2">
                {[
                  { label: "悩みのパターン", value: report.pattern },
                  { label: "心理的な変化", value: report.growth },
                  { label: "コミュニケーション傾向", value: report.communication },
                  { label: "次の診察へのアドバイス", value: report.advice },
                ].filter(r => r.value).map((r) => (
                  <div key={r.label}>
                    <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-[#b8860b]">{r.label}</p>
                    <p className="text-sm leading-relaxed text-[#1c1e21]">{r.value}</p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setReport(null)}
                  className="w-full rounded-xl border border-[#dfe3e8] py-2 text-xs text-[#8d949e] transition hover:bg-[#f0f2f5]"
                >
                  レポートを閉じる
                </button>
              </div>
            )}
          </div>
        )}

        {/* カルテ一覧 */}
        {!hydrated ? (
          <p className="text-center text-sm text-[#8d949e]">読み込み中…</p>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-[#dfe3e8] bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-3xl">📋</p>
            <p className="mt-3 font-semibold text-[#1c1e21]">カルテがまだありません</p>
            <p className="mt-1 text-sm text-[#8d949e]">診断結果を保存するとここに表示されます。</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]"
            >
              診断をはじめる
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1c1e21]">
                カルテ <span className="text-[#1877f2]">{logs.length}</span> 件
              </p>
              {!isPremium && logs.length > FREE_LOG_VISIBLE && (
                <p className="text-xs text-[#8d949e]">
                  {logs.length - FREE_LOG_VISIBLE}件がロック中
                </p>
              )}
            </div>
            {logs.map((log, idx) => (
              <HistoryCard
                key={log.id}
                log={log}
                locked={!isPremium && idx >= FREE_LOG_VISIBLE}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            ))}
          </div>
        )}

        {/* プレミアム解除（デモ用） */}
        {isPremium && (
          <button
            type="button"
            onClick={downgradeToFree}
            className="w-full rounded-xl border border-[#dfe3e8] py-2.5 text-xs text-[#8d949e] transition hover:bg-[#f0f2f5]"
          >
            ※ デモ：FREEプランに戻す
          </button>
        )}

        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => { if (confirm("カルテをすべて削除しますか？")) clearLogs(); }}
            className="w-full rounded-xl border border-red-100 py-2.5 text-xs text-red-400 transition hover:bg-red-50"
          >
            カルテをすべて削除する
          </button>
        )}
      </div>

      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-1 h-1 w-10 rounded-full bg-[#dfe3e8] mx-auto sm:hidden" />
            <p className="mt-4 text-center text-xl font-bold text-[#1c1e21]">プレミアムプラン</p>
            <p className="mt-1 text-center text-[#65676b] text-sm">月額 ¥980（税込）</p>
            <ul className="mt-5 space-y-3 text-sm">
              {["過去カルテを無制限に閲覧", "1日の診断回数が無制限", "AI による総合ほんねレポート"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[#1c1e21]">
                  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[#1877f2]" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => { upgradeToPremium(); setShowUpgradeModal(false); }}
              className="mt-6 w-full rounded-xl bg-[#1877f2] py-3.5 font-bold text-white shadow-sm transition hover:bg-[#166fe5]"
            >
              アップグレードする（デモ）
            </button>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="mt-3 w-full rounded-xl py-2.5 text-sm text-[#8d949e]"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
