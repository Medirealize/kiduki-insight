import Link from "next/link";

const EFFECTIVE_DATE = "2026年5月17日";
const CONTACT_EMAIL = "info@medirealize.jp";
const APP_NAME = "ほんね。";
const OPERATOR = "medirealize";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] font-sans text-[#1c1e21] antialiased">
      {/* ヘッダー */}
      <div className="border-b border-[#dfe3e8] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#606770] hover:text-[#1877f2]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ほんね。に戻る
          </Link>
          <span className="text-sm font-bold text-[#1c1e21]">プライバシーポリシー</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-2xl border border-[#dfe3e8] bg-white px-8 py-10 shadow-sm">

          <h1 className="text-2xl font-bold text-[#1c1e21]">プライバシーポリシー</h1>
          <p className="mt-2 text-sm text-[#8d949e]">制定日：{EFFECTIVE_DATE}</p>

          <p className="mt-6 text-sm leading-relaxed text-[#606770]">
            {OPERATOR}（以下「当社」）は、{APP_NAME}（以下「本アプリ」）における利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
          </p>

          <Section title="第1条（収集する情報）">
            <p>本アプリは、以下の情報をご利用の端末内（ローカルストレージ）にのみ保存します。サーバーへの個人情報の送信・収集は行っておりません。</p>
            <ul>
              <li>入力された悩みや相談内容</li>
              <li>AI によって生成されたほんね・洞察の記録</li>
              <li>ご利用状況（利用回数・会員プラン種別）</li>
              <li>選択されたタイプ・グループ情報</li>
            </ul>
            <p className="mt-3">上記のデータはすべて利用者ご自身の端末内に保存されるものであり、当社が取得・閲覧することはできません。</p>
          </Section>

          <Section title="第2条（外部サービスへの送信）">
            <p>本アプリは、AI によるほんねの生成および深掘り質問の作成のために、入力内容（悩みのテキスト・タイプ情報）を以下の外部サービスへ送信します。</p>
            <ul>
              <li>
                <strong>OpenAI, L.L.C.（米国）</strong><br />
                用途：自然言語処理による洞察・質問文の生成<br />
                プライバシーポリシー：<a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#1877f2] underline">https://openai.com/policies/privacy-policy</a>
              </li>
            </ul>
            <p className="mt-3">送信される情報には氏名・連絡先などの直接的な個人を特定する情報は含まれません。なお、AIオフモードをご利用の場合は外部への送信は行われません。</p>
          </Section>

          <Section title="第3条（情報の利用目的）">
            <p>当社が外部サービスを通じて処理する情報は、以下の目的のみに使用します。</p>
            <ul>
              <li>AI によるほんね・洞察・深掘り質問の生成</li>
              <li>本アプリのサービス品質の向上</li>
            </ul>
          </Section>

          <Section title="第4条（第三者提供）">
            <p>当社は、以下の場合を除き、利用者の情報を第三者に提供しません。</p>
            <ul>
              <li>法令に基づく場合</li>
              <li>利用者の同意がある場合</li>
            </ul>
          </Section>

          <Section title="第5条（アクセス解析）">
            <p>本アプリは、サービス改善のためにアクセス解析ツールを使用する場合があります。収集されるデータは匿名の統計情報であり、個人を特定するものではありません。</p>
          </Section>

          <Section title="第6条（未成年者の利用）">
            <p>本アプリは医療機関での診察を助けることを目的としており、特定の年齢制限は設けていません。ただし、未成年の方は保護者の同意のもとでご利用ください。</p>
          </Section>

          <Section title="第7条（免責事項）">
            <p>本アプリが提供する内容は、コミュニケーション支援を目的とした参考情報であり、医学的な診断・治療・処方の代替となるものではありません。健康上の問題については、必ず医療専門家にご相談ください。</p>
          </Section>

          <Section title="第8条（プライバシーポリシーの変更）">
            <p>当社は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは本ページに掲載した時点で効力を生じるものとします。</p>
          </Section>

          <Section title="第9条（お問い合わせ）">
            <p>本ポリシーに関するご質問・ご意見は、以下の窓口までお問い合わせください。</p>
            <p className="mt-2">
              <strong>{OPERATOR}</strong><br />
              メール：<a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1877f2] underline">{CONTACT_EMAIL}</a>
            </p>
          </Section>

          <p className="mt-10 text-right text-xs text-[#8d949e]">以上</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-base font-bold text-[#1c1e21]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#606770] [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
