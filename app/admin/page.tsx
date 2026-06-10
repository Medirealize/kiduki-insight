import { cookies, headers } from "next/headers";
import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

type StatsResponse = {
  totalUsers: number;
  totalLogs: number;
  avgLogsPerUser: number;
  conversionClickRate: number;
  chart: { date: string; count: number }[];
  isMock: boolean;
};

async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value ?? "";
    const host = (await headers()).get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/admin/stats`, {
      headers: { Cookie: `admin_token=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<StatsResponse>;
  } catch {
    return null;
  }
}

// ── Page ────────────────────────────────────────────────────────────
// Auth is handled by middleware.ts — this page renders only for authed admins.
export default async function AdminPage() {
  const stats = await fetchStats();

  const totalUsers          = stats?.totalUsers          ?? 0;
  const totalLogs           = stats?.totalLogs           ?? 0;
  const avgLogsPerUser      = stats?.avgLogsPerUser      ?? 0;
  const conversionClickRate = stats?.conversionClickRate ?? 0;
  const chart               = stats?.chart               ?? [];
  const isMock              = stats?.isMock              ?? true;
  const chartMax            = Math.max(...chart.map((d) => d.count), 1);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-honne-bg font-sans text-honne-text antialiased">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-honne-border-light bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-honne-primary px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest text-white">
              ADMIN
            </span>
            <span className="text-sm font-bold text-honne-text">ほんね。管理者ダッシュボード</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-honne-secondary hover:text-honne-primary">
              サイトへ →
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-5 py-8">

        {/* データソース表示 */}
        {isMock ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            ⚠️ Supabase に未接続のため統計は表示できません。環境変数を確認してください。
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            ✓ Supabase（symptomsum-app / honne_logs）よりリアルタイムデータを表示しています。
          </div>
        )}

        {/* KPI グリッド */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-honne-placeholder">
            全ユーザー KPI
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "総登録ユーザー数",   value: totalUsers.toLocaleString(),          unit: "人",    color: "text-honne-primary",   icon: "👥" },
              { label: "総蓄積ログ件数",     value: totalLogs.toLocaleString(),            unit: "件",    color: "text-emerald-600", icon: "📝" },
              { label: "平均ログ記録数",     value: avgLogsPerUser.toFixed(1),             unit: "件/人", color: "text-violet-600",  icon: "📊" },
              { label: "課金導線クリック率", value: conversionClickRate.toFixed(1),        unit: "%",     color: "text-[#b8860b]",   icon: "💳" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-honne-border-light bg-white px-4 py-4 shadow-sm">
                <p className="text-lg">{kpi.icon}</p>
                <p className="mt-1 text-[0.65rem] leading-tight text-honne-placeholder">{kpi.label}</p>
                <p className={`mt-2 text-2xl font-black ${kpi.color}`}>
                  {kpi.value}
                  <span className="ml-0.5 text-xs font-normal text-honne-placeholder">{kpi.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 直近2週間の日別ログ数チャート */}
        <section className="rounded-2xl border border-honne-border-light bg-white px-5 py-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-honne-placeholder">
              直近2週間の新規ログ記録数（全ユーザー合計）
            </p>
            {isMock && (
              <span className="rounded-full bg-honne-bg px-2 py-0.5 text-[0.6rem] text-honne-placeholder">
                未接続
              </span>
            )}
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
                    className="w-full rounded-t-md bg-honne-primary transition-all duration-500 group-hover:bg-honne-primary-hover"
                    style={{ height: `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%`, minHeight: d.count > 0 ? "4px" : "2px", opacity: d.count > 0 ? 1 : 0.15 }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-1.5">
            {chart.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {(i === 0 || i === 6 || i === 13) && (
                  <span className="text-[0.55rem] text-honne-placeholder">{d.date}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 開発者セクション ── */}
        <section className="space-y-6">
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-honne-placeholder">開発者メモ</p>

          {/* App Store レディネス */}
          <div className="rounded-2xl border border-honne-border-light bg-white px-5 py-5 shadow-sm">
            <p className="mb-4 text-sm font-bold text-honne-text">📱 App Store 進出レディネス</p>
            <div className="space-y-2 text-sm">
              {[
                { done: true,  label: "プライバシーポリシー公開（/privacy）" },
                { done: true,  label: "Supabase Auth 実装（Google OAuth + Magic Link）" },
                { done: true,  label: "Stripe 課金フロー実装" },
                { done: true,  label: "honne_logs Supabase 接続" },
                { done: false, label: "App Store Connect アカウント登録" },
                { done: false, label: "Capacitor iOS ビルド・動作確認" },
                { done: false, label: "スクリーンショット5枚作成（6.5インチ）" },
                { done: false, label: "App 審査提出（4+ レーティング想定）" },
                { done: false, label: "利用規約ページ追加" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[0.65rem] font-bold ${
                    item.done ? "bg-emerald-100 text-emerald-700" : "bg-honne-bg text-honne-placeholder"
                  }`}>
                    {item.done ? "✓" : "○"}
                  </span>
                  <span className={item.done ? "text-honne-secondary" : "text-honne-text"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 進出タイミング考察 */}
          <div className="rounded-2xl border border-honne-border-light bg-white px-5 py-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-honne-text">⏱ 進出タイミング考察</p>
            <div className="space-y-3 text-sm text-honne-secondary leading-relaxed">
              <p><span className="font-semibold text-honne-text">医療機器リスク：</span>本アプリは「コミュニケーション支援ツール」であり診断を行わないため、薬機法上の医療機器に該当しない設計。ただし表現・機能追加時は都度確認が必要。</p>
              <p><span className="font-semibold text-honne-text">推奨タイミング：</span>月間アクティブユーザー50人・有料転換3件を確認してからApp Store申請。それ以前はWeb版でPMF（プロダクトマーケットフィット）を検証する。</p>
              <p><span className="font-semibold text-honne-text">B2B展開：</span>クリニック1院あたり月額¥5,000〜¥30,000の導入プランを検討。患者教育コストを削減する訴求が有効。</p>
            </div>
          </div>

          {/* 推奨ロードマップ */}
          <div className="rounded-2xl border border-honne-border-light bg-white px-5 py-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-honne-text">🗺 推奨ロードマップ</p>
            <ol className="space-y-2 text-sm text-honne-secondary">
              {[
                "SNS（X / Instagram）で認知拡大 → Web版でユーザー獲得",
                "有料転換10件達成 → 価格・機能の仮説検証",
                "App Store申請 → iOS版リリース",
                "クリニック数院への B2B 営業開始",
                "利用規約 / 特商法ページ追加 → 法務整備完了",
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-honne-primary/10 text-[0.65rem] font-bold text-honne-primary">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <p className="pb-4 text-center text-[0.65rem] text-honne-placeholder">
          管理者専用ページ — 外部公開禁止
        </p>
      </div>
    </div>
  );
}
