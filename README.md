# ほんね。/ honne.

> 言いたいのに、言えない。— Say what you can't.

性格統計学 × AI で「言葉にできない気持ち」を言語化するコミュニケーション支援 Web アプリです。
A communication support tool that helps you put unspoken feelings into words, powered by personality statistics and AI.

**Production:** https://insight.medirealize.jp

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| i18n | next-intl v4 (`/ja`, `/en`) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Database | Supabase (PostgreSQL + RLS) |
| AI | OpenAI API (gpt-4.1-mini) |
| Payments | Stripe (subscription) |
| Hosting | Vercel |
| Analytics | Google Analytics 4 + Vercel Analytics |

---

## Environment Variables

`.env.local` を作成して以下を設定してください。

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # サーバーサイドのみ・フロントエンド非公開

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Admin
ADMIN_PASSWORD=your_secure_password
```

> `SUPABASE_SERVICE_ROLE_KEY` は `NEXT_PUBLIC_` プレフィックスを付けないこと。フロントエンドに露出しません。

---

## Local Development

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# 型チェック
npx tsc --noEmit

# ビルド
npm run build
```

日本語版: http://localhost:3000/ja  
英語版:   http://localhost:3000/en

---

## Project Structure

```
app/
  [locale]/           # 多言語対応ページ（/ja・/en）
    layout.tsx        # ロケール別レイアウト・SEOメタデータ・hreflang
    page.tsx          # メイン診断フロー（7ステップ）
    history/          # ほんねの記録
    privacy/          # プライバシーポリシー（日英）
    terms/            # 利用規約（日英）
    legal/            # 特定商取引法表記（日英）
  admin/              # 管理者ダッシュボード（日本語専用）
  api/
    chat/             # OpenAI 呼び出し・locale 対応
    admin/stats/      # 管理者統計
    stripe/           # 決済・Webhook
    user/premium/     # プレミアム判定
  components/         # 共有コンポーネント（useTranslations 対応済み）

i18n/
  routing.ts          # ロケール設定（locales: ["ja","en"]）
  request.ts          # next-intl サーバー設定

messages/
  ja.json             # 日本語翻訳
  en.json             # 英語翻訳

lib/
  insights.ts         # insights.json から最適 insight を選択
  constants.ts        # AXIS_QUESTIONS（日英両対応）
  follow-up-questions.ts  # フォローアップ質問（日英両対応）
  supabase.ts         # Supabase クライアント（anon / service_role）
  store/              # Zustand-like ローカルストア

proxy.ts              # Next.js 16 ミドルウェア（admin 認証・locale ルーティング）
```

---

## Internationalization (i18n)

- URL ベース: `/ja/...`（日本語）・ `/en/...`（英語）
- `/` → `/ja` へリダイレクト
- `next-intl` v4 + `localePrefix: "always"`
- AI 出力（insight / doctor_advice / next_questions）もロケール別プロンプトで英語生成

---

## Database (Supabase)

### テーブル: `honne_logs`

| カラム | 型 | 説明 |
|-------|----|------|
| id | uuid | PK |
| user_id | text | Supabase Auth UID または匿名セッションID |
| created_at | timestamptz | 作成日時 |
| user_input | text | ユーザーが入力した悩み |
| insight | text | AI が生成したほんね |
| doctor_advice | text | 伝え言葉（案） |
| selected_questions | text[] | 選択されたフォローアップ質問 |
| group_name | text | 性格グループ（自分軸/相手軸/社会軸） |

**RLS ポリシー:** 認証済みユーザーが自分の行のみ操作可能（`auth.uid() = user_id`）。  
管理者 API は `service_role` キーで RLS をバイパス。

---

## Security

- `/admin/*` への一般ユーザーアクセスは `/` へリダイレクト（`proxy.ts`）
- 管理者認証: Supabase メール認証（admin email）または `ADMIN_PASSWORD` クッキー
- `SUPABASE_SERVICE_ROLE_KEY` は API ルートのみで使用、フロントエンド非公開
- `honne_logs` RLS: INSERT/SELECT/UPDATE/DELETE 全て `auth.uid() = user_id` で制限

---

## Deployment

Vercel に GitHub 連携でデプロイしています。`main` ブランチへの push で自動デプロイされます。

```bash
git push origin main   # → Vercel が自動ビルド・デプロイ
```

Vercel 環境変数は Vercel Dashboard → Settings → Environment Variables で設定。

---

## 開発者メモ

- Next.js 16 では `middleware.ts` が `proxy.ts` に変更（`export function proxy()`）
- `insights.json`: 360エントリ（12タイプ × 2性別 × 15バリエーション）全て日本語。AI がロケール別に翻訳・生成するため英語訳は不要
- `getFocusHintsFromText` は日英両対応（英語キーワードでも focus を検出）

---

## License

Private — All rights reserved. © 2026 Medirealize
