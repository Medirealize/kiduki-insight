import Link from "next/link";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-[#f0f2f5] py-4 text-sm last:border-0">
      <dt className="font-semibold text-[#1c1e21]">{label}</dt>
      <dd className="leading-relaxed text-[#606770]">{children}</dd>
    </div>
  );
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";

  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] font-sans text-[#1c1e21] antialiased">
      <div className="border-b border-[#dfe3e8] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm font-medium text-[#606770] hover:text-[#1877f2]">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {isEn ? "Back to honne." : "ほんね。に戻る"}
          </Link>
          <span className="text-sm font-bold text-[#1c1e21]">
            {isEn ? "Legal Notice" : "特定商取引法に基づく表記"}
          </span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-2xl border border-[#dfe3e8] bg-white px-8 py-10 shadow-sm">
          {isEn ? (
            <>
              <h1 className="text-xl font-bold text-[#1c1e21]">Legal Notice (Act on Specified Commercial Transactions)</h1>
              <dl className="mt-6">
                <Row label="Seller">Medirealize</Row>
                <Row label="Representative">Shinsuke Nomura</Row>
                <Row label="Address / Phone">
                  Address and phone number will be provided promptly upon request via email.
                </Row>
                <Row label="Email">
                  <a href="mailto:info@medirealize.jp" className="text-[#1877f2] underline">
                    info@medirealize.jp
                  </a>
                </Row>
                <Row label="Product">
                  honne. Premium Plan (digital service) usage license
                </Row>
                <Row label="Price">¥500 / month (tax included)</Row>
                <Row label="Additional costs">
                  Internet connection fees and other telecommunication charges
                </Row>
                <Row label="Payment timing">
                  First payment at checkout. Subsequent payments on the same day each month.
                </Row>
                <Row label="Payment method">Credit card (Stripe)</Row>
                <Row label="Service availability">
                  Available immediately upon payment completion.
                </Row>
                <Row label="Returns / Cancellation">
                  Due to the digital nature of the service, refunds are not available. You may cancel your subscription at any time through your account settings. Service continues until the end of the current billing period. No pro-rated refunds are provided.
                </Row>
              </dl>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#1c1e21]">特定商取引法に基づく表記</h1>
              <dl className="mt-6">
                <Row label="販売業者">メディリアライズ</Row>
                <Row label="運営責任者">野村 信介</Row>
                <Row label="所在地・電話番号">
                  所在地・電話番号については、請求をいただいた場合、遅滞なく電子メール等にて提供いたします。
                </Row>
                <Row label="メールアドレス">
                  <a href="mailto:info@medirealize.jp" className="text-[#1877f2] underline">
                    info@medirealize.jp
                  </a>
                </Row>
                <Row label="販売商品">
                  ほんね。プレミアムプラン（デジタルサービス）の利用ライセンス
                </Row>
                <Row label="販売価格">月額 ¥500（税込）</Row>
                <Row label="商品代金以外の費用">
                  インターネット接続料金その他の電気通信回線の通信に関する費用
                </Row>
                <Row label="代金の支払い時期">
                  初回は決済時。次月以降は毎月同日に決済。
                </Row>
                <Row label="代金の支払い方法">クレジットカード（Stripe）</Row>
                <Row label="提供時期">
                  決済完了後、直ちにご利用いただけます。
                </Row>
                <Row label="返品・キャンセル">
                  デジタルコンテンツの特性上、返品・返金はできません。サブスクリプションの解約は、アカウント設定内の案内に従いいつでも可能です。解約後も当該請求期間終了まではご利用いただけます。日割り計算による返金は行いません。
                </Row>
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
