"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLogStore } from "@/lib/store/useLogStore";
import { useUserStatus } from "@/lib/store/useUserStatus";
import { FREE_DAILY_LIMIT } from "@/lib/types/log";

export default function MyPage() {
  const { logs, hydrated } = useLogStore();
  const { isPremium, dailyUsage } = useUserStatus();

  const groupDist = useMemo(() => {
    const counts: Record<string, number> = { 自分軸: 0, 相手軸: 0, 社会軸: 0 };
    logs.forEach((l) => { counts[l.group] = (counts[l.group] ?? 0) + 1; });
    const total = logs.length || 1;
    return Object.entries(counts).map(([g, c]) => ({
      group: g,
      count: c,
      pct: Math.round((c / total) * 100),
    }));
  }, [logs]);

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekLogs = logs.filter((l) => l.createdAt >= weekAgo);

  const summaryCards = [
    {
      label: "総記録件数",
      value: hydrated ? logs.length : "—",
      unit: "件",
      color: "text-[#1877f2]",
    },
    {
      label: "今週の記録",
      value: hydrated ? weekLogs.length : "—",
      unit: "件",
      color: "text-[#1877f2]",
    },
    {
      label: "本日の利用回数",
      value: hydrated ? dailyUsage : "—",
      unit: `/ ${isPremium ? "∞" : FREE_DAILY_LIMIT}回`,
      color: !isPremium && dailyUsage >= FREE_DAILY_LIMIT ? "text-red-500" : "text-[#1877f2]",
    },
    {
      label: "会員プラン",
      value: isPremium ? "PREMIUM" : "FREE",
      unit: "",
      color: isPremium ? "text-[#b8860b]" : "text-[#8d949e]",
    },
  ];

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-[#1c1e21] antialiased">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-[#dfe3e8] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#606770] hover:text-[#1877f2]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            戻る
          </Link>
          <span className="text-sm font-bold text-[#1c1e21]">マイページ</span>
          <Link href="/history" className="text-xs text-[#1877f2] hover:underline">
            記録 →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-5 py-8">

        {/* 利用サマリー */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
            利用サマリー
          </p>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#dfe3e8] bg-white px-4 py-4 shadow-sm"
              >
                <p className="text-xs text-[#8d949e]">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>
                  {s.value}
                  <span className="ml-1 text-sm font-normal text-[#8d949e]">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* タイプ分布（記録がある場合のみ） */}
        {logs.length > 0 && (
          <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
            <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
              タイプ分布（記録ベース）
            </p>
            <div className="space-y-3">
              {groupDist.map((g) => (
                <div key={g.group}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-[#1c1e21]">{g.group}</span>
                    <span className="text-[#8d949e]">
                      {g.count}件 ({g.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2f5]">
                    <div
                      className="h-full rounded-full bg-[#1877f2] transition-all duration-700"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 記録へのCTA */}
        <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#1c1e21]">ほんねの記録を振り返る</p>
          <p className="mt-1 text-xs text-[#8d949e]">
            保存した記録を確認し、自分のパターンを知ろう
          </p>
          <Link
            href="/history"
            className="mt-4 inline-block rounded-xl bg-[#1877f2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]"
          >
            記録一覧を見る →
          </Link>
        </section>

      </div>
    </div>
  );
}
