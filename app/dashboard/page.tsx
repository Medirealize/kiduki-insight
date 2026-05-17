"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLogStore } from "@/lib/store/useLogStore";
import { useUserStatus } from "@/lib/store/useUserStatus";
import { FREE_LOG_VISIBLE, FREE_DAILY_LIMIT } from "@/lib/types/log";

// ─── App Store レディネス項目 ─────────────────────────────────────
const READINESS_ITEMS = [
  { id: "vercel",      label: "Vercel 本番デプロイ済み",              done: true,  weight: 8,  category: "web" },
  { id: "pwa",         label: "PWA（ホーム画面追加）対応済み",         done: true,  weight: 5,  category: "web" },
  { id: "capacitor",   label: "Capacitor iOS セットアップ済み",        done: true,  weight: 10, category: "ios" },
  { id: "cors",        label: "CORS・API セキュリティ設定済み",         done: true,  weight: 5,  category: "tech" },
  { id: "privacy",     label: "プライバシーポリシー公開",              done: false, weight: 12, category: "legal" },
  { id: "apple_dev",   label: "Apple Developer Program 登録（$99/年）", done: false, weight: 15, category: "ios" },
  { id: "appstore_con","label": "App Store Connect 設定・バンドルID登録", done: false, weight: 10, category: "ios" },
  { id: "screenshots", label: "スクリーンショット作成（6.5 / 5.5 inch）",done: false, weight: 8,  category: "content" },
  { id: "store_desc",  label: "App Store 説明文・キーワード設定",      done: false, weight: 8,  category: "content" },
  { id: "og_image",    label: "OG 画像作成（1200×630px）",            done: false, weight: 4,  category: "web" },
  { id: "feedback",    label: "β ユーザー10人からフィードバック収集",  done: false, weight: 10, category: "growth" },
  { id: "conversion",  label: "FREE→PREMIUM 転換率 5% 以上を確認",    done: false, weight: 5,  category: "growth" },
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

// ─── ユーティリティ ──────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function dateLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function DashboardPage() {
  const { logs, hydrated } = useLogStore();
  const { isPremium, dailyUsage, status } = useUserStatus();

  // グループ分布
  const groupDist = useMemo(() => {
    const counts: Record<string, number> = { 自分軸: 0, 相手軸: 0, 社会軸: 0 };
    logs.forEach((l) => { counts[l.group] = (counts[l.group] ?? 0) + 1; });
    const total = logs.length || 1;
    return Object.entries(counts).map(([g, c]) => ({ group: g, count: c, pct: Math.round((c / total) * 100) }));
  }, [logs]);

  // 今週の記録数
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekLogs = logs.filter((l) => l.createdAt >= weekAgo);

  // レディネススコア
  const totalWeight = READINESS_ITEMS.reduce((s, i) => s + i.weight, 0);
  const doneWeight  = READINESS_ITEMS.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  const readinessScore = Math.round((doneWeight / totalWeight) * 100);

  const appStorePhase =
    readinessScore >= 90 ? { label: "提出 OK", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" } :
    readinessScore >= 60 ? { label: "あと少し", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" } :
                           { label: "準備中",   color: "text-[#1877f2]",  bg: "bg-[#e7f0fd] border-[#1877f2]/30" };

  // カテゴリごとに整理
  const categories = [...new Set(READINESS_ITEMS.map((i) => i.category))] as CategoryKey[];

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-[#1c1e21] antialiased">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-[#dfe3e8] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-[#606770] hover:text-[#1877f2]">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            戻る
          </Link>
          <span className="text-sm font-bold text-[#1c1e21]">ダッシュボード</span>
          <Link href="/history" className="text-xs text-[#1877f2] hover:underline">記録 →</Link>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-5 py-8">

        {/* ── 利用サマリー ── */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">利用サマリー</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "総記録件数", value: hydrated ? logs.length : "—", unit: "件", color: "text-[#1877f2]" },
              { label: "今週の記録", value: hydrated ? weekLogs.length : "—", unit: "件", color: "text-[#1877f2]" },
              { label: "本日の利用", value: hydrated ? dailyUsage : "—", unit: `/ ${isPremium ? "∞" : FREE_DAILY_LIMIT}回`, color: dailyUsage >= FREE_DAILY_LIMIT && !isPremium ? "text-red-500" : "text-[#1877f2]" },
              { label: "プラン",     value: isPremium ? "PREMIUM" : "FREE", unit: "", color: isPremium ? "text-[#b8860b]" : "text-[#8d949e]" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#dfe3e8] bg-white px-4 py-4 shadow-sm">
                <p className="text-xs text-[#8d949e]">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}<span className="ml-1 text-sm font-normal text-[#8d949e]">{s.unit}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* ── グループ分布 ── */}
        {logs.length > 0 && (
          <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
            <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">タイプ分布（記録ベース）</p>
            <div className="space-y-3">
              {groupDist.map((g) => (
                <div key={g.group}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-[#1c1e21]">{g.group}</span>
                    <span className="text-[#8d949e]">{g.count}件 ({g.pct}%)</span>
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

        {/* ── App Store レディネス ── */}
        <section>
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">App Store 進出レディネス</p>

          {/* スコアカード */}
          <div className={`mb-4 flex items-center justify-between rounded-2xl border px-5 py-4 ${appStorePhase.bg}`}>
            <div>
              <p className={`text-3xl font-black ${appStorePhase.color}`}>{readinessScore}<span className="text-lg font-semibold">%</span></p>
              <p className={`text-sm font-semibold ${appStorePhase.color}`}>{appStorePhase.label}</p>
            </div>
            <div className="text-right text-xs text-[#8d949e]">
              <p>{READINESS_ITEMS.filter(i => i.done).length} / {READINESS_ITEMS.length} 項目完了</p>
              <p className="mt-1">残り {READINESS_ITEMS.filter(i => !i.done).length} 項目</p>
            </div>
          </div>

          {/* カテゴリ別チェックリスト */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const items = READINESS_ITEMS.filter(i => i.category === cat);
              const catDone = items.filter(i => i.done).length;
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

        {/* ── App Store 進出タイミング考察 ── */}
        <section className="rounded-2xl border border-[#dfe3e8] bg-white px-5 py-5 shadow-sm">
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">進出タイミング考察</p>
          <div className="space-y-4 text-sm leading-relaxed text-[#606770]">
            <div className="border-l-4 border-[#1877f2] pl-4">
              <p className="font-semibold text-[#1c1e21]">① まず「プライバシーポリシー」を公開する</p>
              <p className="mt-1">App Store 審査で最初に確認される項目です。`medirealize.jp/privacy` に公開し、アプリ内にリンクを追加してください。これが未対応だと審査リジェクトの最大要因になります。</p>
            </div>
            <div className="border-l-4 border-[#1877f2] pl-4">
              <p className="font-semibold text-[#1c1e21]">② Web で 50〜100 MAU を達成してから申請</p>
              <p className="mt-1">App Store 審査官は「実際に使われているか」を確認します。Web 版でユーザーが存在することがスクリーンショットや説明文の説得力を高めます。現在の記録件数（{logs.length}件）が積み上がるまで Web で先行しましょう。</p>
            </div>
            <div className="border-l-4 border-amber-400 pl-4">
              <p className="font-semibold text-[#1c1e21]">③ プレミアム転換率 5% を確認してから課金連携</p>
              <p className="mt-1">RevenueCat の導入は App Store 申請後でも可能です。まず無料版で審査を通過し、その後サブスクリプション機能を追加する 2ステップ戦略が安全です。</p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="font-semibold text-[#1c1e21]">④ 医療アプリ審査の特記事項</p>
              <p className="mt-1">本アプリは医療機器ではなく「コミュニケーション支援ツール」として申請します。App Store カテゴリは「Health & Fitness」ではなく「Productivity」または「Lifestyle」が通過しやすいです。現在の免責文言は適切です。</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#f0f2f5] px-4 py-3 text-xs text-[#65676b]">
            <p className="font-semibold text-[#1c1e21]">推奨ロードマップ</p>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
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
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#8d949e]">SEO ステータス</p>
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
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? "bg-emerald-500 text-white" : "border border-[#dfe3e8] text-transparent"}`}>✓</span>
                <span className={s.done ? "text-[#1c1e21]" : "text-[#8d949e]"}>{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
