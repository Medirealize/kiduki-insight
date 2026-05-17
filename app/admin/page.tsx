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

// ── App Store readiness (moved from user dashboard) ─────────────────
const READINESS_ITEMS = [
  { id: "vercel",      label: "Vercel 本番デプロイ済み",                      done: true,  weight: 8,  category: "web" },
  { id: "pwa",         label: "PWA（ホーム画面追加）対応済み",                  done: true,  weight: 5,  category: "web" },
  { id: "capacitor",   label: "Capacitor iOS セットアップ済み",                 done: true,  weight: 10, category: "ios" },
  { id: "cors",        label: "CORS・API セキュリティ設定済み",                  done: true,  weight: 5,  category: "tech" },
  { id: "privacy",     label: "プライバシーポリシー公開",                       done: false, weight: 12, category: "legal" },
  { id: "apple_dev",   label: "Apple Developer Program 登録（$99/年）",         done: false, weight: 15, category: "ios" },
  { id: "appstore_con",label: "App Store Connect 設定・バンドルID登録",          done: false, weight: 10, category: "ios" },
  { id: "screenshots", label: "スクリーンショット作成（6.5 / 5.5 inch）",        done: false, weight: 8,  category: "content" },
  { id: "store_desc",  label: "App Store 説明文・キーワード設定",               done: false, weight: 8,  category: "content" },
  { id: "og_image",    label: "OG 画像作成（1200×630px）",                     done: false, weight: 4,  category: "web" },
  { id: "feedback",    label: "β ユーザー10人からフィードバック収集",            done: false, weight: 10, category: "growth" },
  { id: "conversion",  label: "FREE→PREMIUM 転換率 5% 以上を確認",             done: false, weight: 5,  category: "growth" },
] as const;

type CategoryKey = "web" | "ios" | "tech" | "legal" | "content" | "growth";
const CATEGORY_LABEL: Record<CategoryKey, string> = {
  web:     "🌐 Web 基盤",
  ios:     "📱 iOS 対応",
  tech:    "🔧 技術・セキュリティ",
  legal:   "⚖️ 法務",
  content: "✏️ コンテンツ",
  growth:  "📈 グロース",
};

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

  // Readiness score
  const totalWeight = READINESS_ITEMS.reduce((s, i) => s + i.weight, 0);
  const doneWeight  = READINESS_ITEMS.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  const readinessScore = Math.round((doneWeight / totalWeight) * 100);
  const categories = [...new Set(READINESS_ITEMS.map((i) => i.category))] as CategoryKey[];

  const appStorePhase =
    readinessScore >= 90 ? { label: "提出 OK",  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" } :
    readinessScore >= 60 ? { label: "あと少し",  color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" } :
                           { label: "準備中",    color: "text-[#1877f2]",  bg: "bg-[#e7f0fd] border-[#1877f2]/30" };

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
            <Link
              href="/"
              className="text-xs text-[#606770] hover:text-[#1877f2]"
            >
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
              {
                label: "総登録ユーザー数",
                value: totalUsers.toLocaleString(),
                unit: "人",
                color: "text-[#1877f2]",
                icon: "👥",
              },
              {
                label: "総蓄積ログ件数",
                value: totalLogs.toLocaleString(),
                unit: "件",
                color: "text-emerald-600",
                icon: "📝",
              },
              {
                label: "平均ログ記録数",
                value: avgLogsPerUser.toFixed(1),
                unit: "件/人",
                color: "text-violet-600",
                icon: "📊",
              },
              {
                label: "課金導線クリック率",
                value: conversionClickRate.toFixed(1),
                unit: "%",
                color: "text-[#b8860b]",
                icon: "💳",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-[#dfe3e8] bg-white px-4 py-4 shadow-sm"
              >
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

          {/* Bar chart */}
          <div className="flex items-end gap-1.5" style={{ height: "140px" }}>
            {chart.map((d) => {
              const heightPct = Math.round((d.count / chartMax) * 100);
              return (
                <div
                  key={d.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  {/* Tooltip */}
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

          {/* X-axis labels */}
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

        {/* ── App Store 進出レディネス ── */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
            App Store 進出レディネス
          </p>

          {/* スコアカード */}
          <div className={`mb-4 flex items-center justify-between rounded-2xl border px-5 py-4 ${appStorePhase.bg}`}>
            <div>
              <p className={`text-3xl font-black ${appStorePhase.color}`}>
                {readinessScore}<span className="text-lg font-semibold">%</span>
              </p>
              <p className={`text-sm font-semibold ${appStorePhase.color}`}>{appStorePhase.label}</p>
            </div>
            <div className="text-right text-xs text-[#8d949e]">
              <p>{READINESS_ITEMS.filter((i) => i.done).length} / {READINESS_ITEMS.length} 項目完了</p>
              <p className="mt-1">残り {READINESS_ITEMS.filter((i) => !i.done).length} 項目</p>
            </div>
          </div>

          {/* カテゴリ別チェックリスト */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const items = READINESS_ITEMS.filter((i) => i.category === cat);
              const catDone = items.filter((i) => i.done).length;
              return (
                <div key={cat} className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1c1e21]">{CATEGORY_LABEL[cat]}</p>
                    <span className="text-xs text-[#8d949e]">{catDone}/{items.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.done ? "bg-[#1877f2] text-white" : "border border-[#dfe3e8] text-transparent"}`}>
                          ✓
                        </span>
                        <span className={`text-sm leading-relaxed ${item.done ? "text-[#1c1e21]" : "text-[#8d949e]"}`}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 進出タイミング考察 ── */}
        <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
            進出タイミング考察
          </p>
          <div className="space-y-4 text-sm leading-relaxed text-[#606770]">
            <div className="border-l-4 border-[#1877f2] pl-4">
              <p className="font-semibold text-[#1c1e21]">① まず「プライバシーポリシー」を公開する</p>
              <p className="mt-1">
                App Store 審査で最初に確認される項目です。medirealize.jp/privacy に公開し、アプリ内にリンクを追加してください。
                未対応だと審査リジェクトの最大要因になります。
              </p>
            </div>
            <div className="border-l-4 border-[#1877f2] pl-4">
              <p className="font-semibold text-[#1c1e21]">② Web で 50〜100 MAU を達成してから申請</p>
              <p className="mt-1">
                App Store 審査官は「実際に使われているか」を確認します。Web 版でユーザーが存在することが
                スクリーンショットや説明文の説得力を高めます。
              </p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <p className="font-semibold text-[#1c1e21]">③ プレミアム転換率 5% を確認してから課金連携</p>
              <p className="mt-1">
                RevenueCat の導入は App Store 申請後でも可能です。まず無料版で審査を通過し、
                その後サブスクリプション機能を追加する 2ステップ戦略が安全です。
              </p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="font-semibold text-[#1c1e21]">④ 医療アプリ審査の特記事項</p>
              <p className="mt-1">
                本アプリは医療機器ではなく「コミュニケーション支援ツール」として申請します。
                App Store カテゴリは「Health &amp; Fitness」ではなく「Productivity」または「Lifestyle」が通過しやすいです。
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#f0f2f5] px-4 py-3 text-xs text-[#65676b]">
            <p className="font-semibold text-[#1c1e21]">推奨ロードマップ</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>プライバシーポリシー公開（今すぐ）</li>
              <li>Apple Developer 登録（来週〜）</li>
              <li>Web で 50 MAU 達成（〜1ヶ月）</li>
              <li>スクリーンショット・説明文作成（申請2週間前）</li>
              <li>TestFlight β テスト（1〜2週間）</li>
              <li>App Store 申請・審査（1〜7日）</li>
            </ol>
          </div>
        </section>

        {/* ── SEO ステータス ── */}
        <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">
            SEO ステータス
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { done: true,  label: "title / description / keywords 設定済み" },
              { done: true,  label: "Open Graph（SNS シェア）設定済み" },
              { done: true,  label: "Twitter Card 設定済み" },
              { done: true,  label: "JSON-LD 構造化データ（WebApplication）" },
              { done: true,  label: "sitemap.xml 生成済み" },
              { done: true,  label: "robots.txt 設定済み" },
              { done: true,  label: "PWA manifest / apple-touch-icon" },
              { done: true,  label: "lang='ja' / canonical URL 設定済み" },
              { done: false, label: "OG 画像（/public/og-image.png）作成 → 要対応" },
              { done: false, label: "Google Search Console 登録 → 要対応" },
            ].map((s) => (
              <li key={s.label} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? "bg-emerald-500 text-white" : "border border-[#dfe3e8] text-transparent"}`}>
                  ✓
                </span>
                <span className={s.done ? "text-[#1c1e21]" : "text-[#8d949e]"}>{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* フッター */}
        <p className="pb-4 text-center text-[0.65rem] text-[#8d949e]">
          管理者専用ページ — 外部公開禁止
        </p>
      </div>
    </div>
  );
}
