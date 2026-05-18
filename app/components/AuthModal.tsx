"use client";
import { useState } from "react";
import type { AuthState } from "@/lib/auth/useAuth";

type Props = {
  auth: AuthState;
  onClose: () => void;
};

export default function AuthModal({ auth, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    const { error: err } = await auth.signInWithEmail(email);
    setEmailLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white px-6 py-8 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-[#1c1e21]">ほんね。にログイン</p>
          <p className="mt-1 text-sm text-[#606770]">
            ログインすると記録がクラウドに保存され、どの端末からでも確認できます
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={auth.signInWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#dfe3e8] bg-white py-3.5 font-medium text-[#1c1e21] shadow-sm transition hover:bg-[#f0f2f5]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#dfe3e8]" />
          <span className="text-xs text-[#8d949e]">または</span>
          <div className="h-px flex-1 bg-[#dfe3e8]" />
        </div>

        {/* Email magic link */}
        {sent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
            <p className="font-semibold text-emerald-700">メールを送信しました</p>
            <p className="mt-1 text-sm text-emerald-600">
              {email} に届いたリンクをタップしてログインしてください
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full rounded-xl border border-[#ccd0d5] bg-white px-4 py-3 text-base text-[#1c1e21] placeholder-[#8d949e] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full rounded-xl bg-[#1877f2] py-3.5 font-medium text-white shadow-sm transition hover:bg-[#166fe5] disabled:opacity-60"
            >
              {emailLoading ? "送信中…" : "メールでログイン"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs leading-relaxed text-[#8d949e]">
          ログインすることで
          <a href="/privacy" className="underline">プライバシーポリシー</a>
          に同意したことになります
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-[#8d949e] transition hover:text-[#606770]"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
