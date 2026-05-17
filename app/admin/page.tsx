import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

// ── Mock chart data (replace with Supabase query) ──────────────────
function buildChartData(): { date: string; count: number }[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const count = ((d.getDate() * 7 + 11) % 18) + 4;
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, count };
  });
}

// ── Page ────────────────────────────────────────────────────────────
// Auth is handled by middleware.ts — this page renders only for authed admins.
export default function AdminPage() {
  // KPI data (mock — replace with real DB aggregation)
  const totalUsers = 127;
  const totalLogs = 384;
  const avgLogsPerUser = Math.round((totalLogs / totalUsers) * 10) / 10;
  const conversionClickRate = 4.7;

  const chart = buildChartData();
  const chartMax = Math.max(...chart.map((d) => d.count), 1);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f0f2f5] font-sans text-[#1c1e21] antialiased">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-[#dfe3e8] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#1877f2] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest text-white">
              ADMIN
            </span>
            <span className="text-sm font-bold text-[#1c1e21]">ほんね。管理者ダッシュボード</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#606770] hover:text-[#1877f2]">
              サイトへ →
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-5 py-8">

        {/* デモデータ注記 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          ⚠️ 現在のKPIはデモデータです。Supabaseの実テーブルに接続することで実データが表示されます。
        </div>

        {/* KPI グリッド */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
            全ユーザー KPI
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "総登録ユーザー数",     value: totalUsers.toLocaleString(), unit: "人",   color: "text-[#1877f2]",  icon: "👥" },
              { label: "総蓄積ログ件数",       value: totalLogs.toLocaleString(),  unit: "件",   color: "text-emerald-600", icon: "📝" },
              { label: "平均ログ記録数",       value: avgLogsPerUser.toFixed(1),   unit: "件/人", color: "text-violet-600",  icon: "📊" },
              { label: "課金導線クリック率",   value: conversionClickRate.toFixed(1), unit: "%", color: "text-[#b8860b]",  icon: "💳" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-[#dfe3e8] bg-white px-4 py-4 shadow-sm">
                <p className="text-lg">{kpi.icon}</p>
                <p className="mt-1 text-[0.65rem] leading-tight text-[#8d949e]">{kpi.label}</p>
                <p className={`mt-2 text-2xl font-black ${kpi.color}`}>
                  {kpi.value}
                  <span className="ml-0.5 text-xs font-normal text-[#8d949e]">{kpi.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 直近2週間の日別ログ数チャート */}
        <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
              直近2週間の新規ログ記録数（全ユーザー合計）
            </p>
            <span className="rounded-full bg-[#f0f2f5] px-2 py-0.5 text-[0.6rem] text-[#8d949e]">
              デモデータ
            </span>
          </div>

          <div className="flex items-end gap-1.5" style={{ height: "140px" }}>
            {chart.map((d) => {
              const heightPct = Math.round((d.count / chartMax) * 100);
              return (
                <div
                  key={d.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1c1e21] px-2 py-1 text-[0.6rem] text-white opacity-0 shadow transition group-hover:opacity-100">
                    {d.count}件
                  </div>
                  <div
                    className="w-full rounded-t-md bg-[#1877f2] transition-all duration-500 group-hover:bg-[#166fe5]"
                    style={{ height: `${heightPct}%`, minHeight: "4px" }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-1.5">
            {chart.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {(i === 0 || i === 6 || i === 13) && (
                  <span className="text-[0.55rem] text-[#8d949e]">{d.date}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="pb-4 text-center text-[0.65rem] text-[#8d949e]">
          管理者専用ページ — 外部公開禁止
        </p>
      </div>
    </div>
  );
}
