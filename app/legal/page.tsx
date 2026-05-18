import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  robots: { index: false },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-[#f0f2f5] py-4 text-sm last:border-0">
      <dt className="font-semibold text-[#1c1e21]">{label}</dt>
      <dd className="leading-relaxed text-[#606770]">{children}</dd>
    </div>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] font-sans text-[#1c1e21] antialiased">
      <div className="border-b border-[#dfe3e8] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-[#606770] hover:text-[#1877f2]">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ほんね。に戻る
          </Link>
          <span className="text-sm font-bold text-[#1c1e21]">特定商取引法に基づく表記</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-2xl border border-[#dfe3e8] bg-white px-8 py-10 shadow-sm">
          <h1 className="text-xl font-bold text-[#1c1e21]">特定商取引法に基づく表記</h1>

          <dl className="mt-6">
            <Row label="販売業者">medirealize（メディリアライズ）</Row>
            <Row label="運営責任者">野村 信介</Row>
            <Row label="所在地">
              〒889-2151 宮崎県宮崎市熊野7465<br />
              ※お問い合わせはメールにてお願いいたします。
            </Row>
            <Row label="メールアドレス">
              <a href="mailto:info@medirealize.jp" className="text-[#1877f2] underline">
                info@medirealize.jp
              </a>
            </Row>
            <Row label="販売価格">
              ほんね。プレミアムプラン：月額 ¥500（税込）
            </Row>
            <Row label="販売価格以外の費用">
              インターネット接続・通信料金はお客様のご負担となります。
            </Row>
            <Row label="支払方法">
              クレジットカード（Visa・Mastercard・American Express・JCB 等）<br />
              ※Stripe, Inc. の決済システムを利用します。
            </Row>
            <Row label="支払時期">
              お申し込み時および以降毎月の自動更新日に課金されます。
            </Row>
            <Row label="サービス提供時期">
              決済完了後、即時にプレミアム機能をご利用いただけます。
            </Row>
            <Row label="解約・キャンセルについて">
              次回更新日の前日までにアカウント設定より解約手続きを行ってください。<br />
              解約後は次回更新日まで引き続きご利用いただけます。<br />
              デジタルコンテンツの性質上、原則として既にお支払いいただいた料金の返金はお受けできません。
            </Row>
            <Row label="動作環境">
              最新バージョンのGoogle Chrome・Safari・Firefox・Edge に対応しています。
            </Row>
            <Row label="サービス内容">
              性格統計学とAIを活用した気持ちの言語化支援サービス「ほんね。」のプレミアムプランの提供。<br />
              本サービスは医療診断・心理療法・法律相談を行うものではありません。
            </Row>
          </dl>
        </div>
      </div>
    </div>
  );
}
