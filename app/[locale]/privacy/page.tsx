import Link from "next/link";

const CONTACT_EMAIL = "info@medirealize.jp";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-base font-bold text-honne-text">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-honne-secondary [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";

  return (
    <div className="min-h-screen w-full bg-honne-bg font-sans text-honne-text antialiased">
      <div className="border-b border-honne-border-light bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm font-medium text-honne-secondary hover:text-honne-primary">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {isEn ? "Back to honne." : "ほんね。に戻る"}
          </Link>
          <span className="text-sm font-bold text-honne-text">
            {isEn ? "Privacy Policy" : "プライバシーポリシー"}
          </span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-2xl border border-honne-border-light bg-white px-8 py-10 shadow-sm">

          {isEn ? (
            <>
              <h1 className="text-2xl font-bold text-honne-text">Privacy Policy</h1>
              <p className="mt-2 text-sm text-honne-placeholder">Effective date: May 17, 2026</p>
              <p className="mt-6 text-sm leading-relaxed text-honne-secondary">
                medirealize ("we" or "us") has established this Privacy Policy ("Policy") regarding the handling of personal information of users of honne. ("the App").
              </p>

              <Section title="Article 1 — Information We Collect">
                <p>The App stores the following information only on your device (localStorage). We do not transmit or collect personal information on our servers.</p>
                <p className="mt-2 font-medium">When not logged in:</p>
                <ul>
                  <li>Worries or concerns you enter (stored on-device only)</li>
                  <li>AI-generated honne and insight records (on-device only)</li>
                  <li>Usage status (usage count, plan type) (on-device only)</li>
                </ul>
                <p className="mt-3 font-medium">When logged in:</p>
                <ul>
                  <li>Email address (for authentication)</li>
                  <li>Entered concerns, AI insights, and saved records (stored in the cloud)</li>
                  <li>Premium plan status (is_premium flag)</li>
                </ul>
                <p className="mt-3">Data from non-logged-in sessions is stored only on your device and cannot be accessed by us. Data from logged-in sessions is stored on Supabase, Inc. servers.</p>
              </Section>

              <Section title="Article 2 — Third-Party Services">
                <p>The App uses the following third-party services:</p>
                <ul className="space-y-3">
                  <li>
                    <strong>OpenAI, L.L.C. (USA)</strong><br />
                    Purpose: Natural language processing for generating insights and questions (AI mode only)<br />
                    Data sent: Input text and type info (no name or contact info)<br />
                    Privacy Policy: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">openai.com/policies/privacy-policy</a>
                  </li>
                  <li>
                    <strong>Supabase, Inc. (USA)</strong><br />
                    Purpose: Login authentication and cloud storage of records<br />
                    Data sent: Email address and record content (when logged in only)<br />
                    Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">supabase.com/privacy</a>
                  </li>
                  <li>
                    <strong>Stripe, Inc. (USA)</strong><br />
                    Purpose: Payment processing for the Premium plan<br />
                    Data sent: Email address and payment information (Premium registration only)<br />
                    Privacy Policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">stripe.com/privacy</a>
                  </li>
                </ul>
              </Section>

              <Section title="Article 3 — Purpose of Use">
                <p>Information processed through third-party services is used solely for the following purposes:</p>
                <ul>
                  <li>Generating honne, insights, and follow-up questions via AI</li>
                  <li>Login, authentication, and record sync</li>
                  <li>Payment processing for the Premium plan</li>
                  <li>Improving service quality</li>
                </ul>
              </Section>

              <Section title="Article 4 — Disclosure to Third Parties">
                <p>We will not provide user information to third parties except in the following cases:</p>
                <ul>
                  <li>When required by law</li>
                  <li>With the user's consent</li>
                </ul>
              </Section>

              <Section title="Article 5 — Analytics">
                <p>The App may use analytics tools to improve the service. Data collected is anonymized statistical information and does not identify individuals.</p>
              </Section>

              <Section title="Article 6 — Minors">
                <p>The App is designed to support communication and has no specific age restriction. However, minors should use the App with parental consent.</p>
              </Section>

              <Section title="Article 7 — Disclaimer">
                <p>The content provided by this App is reference information for communication support purposes and does not substitute for medical diagnosis, treatment, or prescription. Please consult a healthcare professional for any health concerns.</p>
              </Section>

              <Section title="Article 8 — Policy Updates">
                <p>We may revise this Policy as necessary. Updated policies take effect upon publication on this page.</p>
              </Section>

              <Section title="Article 9 — Contact">
                <p>For questions or comments regarding this Policy, please contact us:</p>
                <p className="mt-2">
                  <strong>medirealize</strong><br />
                  Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-honne-primary underline">{CONTACT_EMAIL}</a>
                </p>
              </Section>

              <p className="mt-10 text-right text-xs text-honne-placeholder">— End —</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-honne-text">プライバシーポリシー</h1>
              <p className="mt-2 text-sm text-honne-placeholder">制定日：2026年5月17日</p>
              <p className="mt-6 text-sm leading-relaxed text-honne-secondary">
                medirealize（以下「当社」）は、ほんね。（以下「本アプリ」）における利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
              </p>

              <Section title="第1条（収集する情報）">
                <p>本アプリは、以下の情報をご利用の端末内（ローカルストレージ）にのみ保存します。サーバーへの個人情報の送信・収集は行っておりません。</p>
                <p className="mt-2 font-medium">【ログインしない場合】</p>
                <ul>
                  <li>入力された悩みや相談内容（端末内のみ保存）</li>
                  <li>AI によって生成されたほんね・洞察の記録（端末内のみ）</li>
                  <li>ご利用状況（利用回数・会員プラン種別）（端末内のみ）</li>
                </ul>
                <p className="mt-3 font-medium">【ログインした場合】</p>
                <ul>
                  <li>メールアドレス（認証目的）</li>
                  <li>入力された悩み・AIによる洞察・記録内容（クラウドに保存）</li>
                  <li>プレミアムプラン情報（is_premium フラグ）</li>
                </ul>
                <p className="mt-3">ログインしない場合のデータは端末内にのみ保存され、当社が閲覧することはできません。ログイン後のデータはSupabase社のサーバーに保存されます。</p>
              </Section>

              <Section title="第2条（外部サービスへの送信・利用）">
                <p>本アプリは以下の外部サービスを利用します。</p>
                <ul className="space-y-3">
                  <li>
                    <strong>OpenAI, L.L.C.（米国）</strong><br />
                    用途：自然言語処理による洞察・質問文の生成（AIオンモード時のみ）<br />
                    送信情報：入力テキスト・タイプ情報（氏名・連絡先は含まない）<br />
                    PP：<a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">openai.com/policies/privacy-policy</a>
                  </li>
                  <li>
                    <strong>Supabase, Inc.（米国）</strong><br />
                    用途：ログイン認証・記録データのクラウド保存<br />
                    送信情報：メールアドレス・記録内容（ログイン時のみ）<br />
                    PP：<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">supabase.com/privacy</a>
                  </li>
                  <li>
                    <strong>Stripe, Inc.（米国）</strong><br />
                    用途：プレミアムプランの決済処理<br />
                    送信情報：メールアドレス・決済情報（プレミアム登録時のみ）<br />
                    PP：<a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-honne-primary underline">stripe.com/jp/privacy</a>
                  </li>
                </ul>
              </Section>

              <Section title="第3条（情報の利用目的）">
                <p>当社が外部サービスを通じて処理する情報は、以下の目的のみに使用します。</p>
                <ul>
                  <li>AI によるほんね・洞察・深掘り質問の生成</li>
                  <li>ログイン・認証・記録の同期</li>
                  <li>プレミアムプランの決済処理</li>
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
                <p>本アプリは特定の年齢制限は設けていません。ただし、未成年の方は保護者の同意のもとでご利用ください。</p>
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
                  <strong>medirealize</strong><br />
                  メール：<a href={`mailto:${CONTACT_EMAIL}`} className="text-honne-primary underline">{CONTACT_EMAIL}</a>
                </p>
              </Section>

              <p className="mt-10 text-right text-xs text-honne-placeholder">以上</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
