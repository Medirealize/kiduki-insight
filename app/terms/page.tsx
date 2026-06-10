import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  robots: { index: false },
};

const EFFECTIVE_DATE = "2026年5月19日";
const APP_NAME = "ほんね。";
const CONTACT_EMAIL = "info@medirealize.jp";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-base font-bold text-honne-text">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-honne-secondary">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-honne-bg font-sans text-honne-text antialiased">
      <div className="border-b border-honne-border-light bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-honne-secondary hover:text-honne-primary">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ほんね。に戻る
          </Link>
          <span className="text-sm font-bold text-honne-text">利用規約</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-2xl border border-honne-border-light bg-white px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-bold text-honne-text">利用規約</h1>
          <p className="mt-2 text-sm text-honne-placeholder">制定日：{EFFECTIVE_DATE}</p>
          <p className="mt-6 text-sm leading-relaxed text-honne-secondary">
            本規約は、medirealize（以下「当社」）が提供する{APP_NAME}（以下「本アプリ」）の利用条件を定めるものです。本アプリをご利用いただく前に、必ずお読みください。
          </p>

          <Section title="第1条（サービスの目的）">
            <p>本アプリは、ユーザーが抱える「言葉にできない気持ち」を言語化することを支援するコミュニケーションサポートツールです。</p>
            <p>本アプリは以下のものでは<strong>ありません</strong>。</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>医療診断・医学的助言を提供するサービス</li>
              <li>心理療法・カウンセリングサービス</li>
              <li>法律相談サービス</li>
            </ul>
            <p>体調・精神面に深刻な不安がある場合は、必ず専門の医療機関・相談窓口をご利用ください。</p>
          </Section>

          <Section title="第2条（禁止事項）">
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>当社または第三者の権利を侵害する行為</li>
              <li>本アプリへの不正アクセス・過剰な負荷をかける行為</li>
              <li>他者を誹謗中傷・差別する内容の入力</li>
              <li>商業目的での無断利用・転載</li>
            </ul>
          </Section>

          <Section title="第3条（AIの性質と免責）">
            <p>本アプリが生成する内容はAIと性格統計学に基づく<strong>参考情報</strong>であり、以下の点をご理解のうえご利用ください。</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>生成内容は必ずしも正確・完全ではなく、個人差があります</li>
              <li>医学的・法的・心理療法的な判断の根拠としないでください</li>
              <li>AIの回答に違和感を感じた場合は、ご自身の判断を優先してください</li>
            </ul>
          </Section>

          <Section title="第4条（プレミアムプランと返金）">
            <p>プレミアムプランは月額制のサブスクリプションです。</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>お支払いはStripe社を通じて処理されます</li>
              <li>解約は次回更新日の前日までにアカウント設定からお手続きください</li>
              <li>デジタルサービスの性質上、原則として返金はお受けできません</li>
              <li>法令により返金が必要な場合はこの限りではありません</li>
            </ul>
          </Section>

          <Section title="第5条（サービスの変更・終了）">
            <p>当社は事前の通知なく、本アプリの内容を変更・一時停止・終了することがあります。これによりユーザーに生じた損害について、当社は責任を負いません。</p>
          </Section>

          <Section title="第6条（準拠法・管轄）">
            <p>本規約は日本法を準拠法とし、紛争が生じた場合は宮崎地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </Section>

          <Section title="お問い合わせ">
            <p>本規約に関するお問い合わせは以下までご連絡ください。</p>
            <p>メール：<a href={`mailto:${CONTACT_EMAIL}`} className="text-honne-primary underline">{CONTACT_EMAIL}</a></p>
          </Section>
        </div>
      </div>
    </div>
  );
}
