"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else if (res.status === 503) {
        setError("管理者アクセスは設定されていません。");
      } else {
        setError("パスワードが正しくありません。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-5 font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white px-8 py-10 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-2xl font-black text-[#1c1e21]">ほんね。</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#8d949e]">
            Admin Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-[#606770]"
            >
              管理者パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              className="w-full rounded-xl border border-[#dfe3e8] bg-[#f0f2f5] px-4 py-3 text-sm text-[#1c1e21] outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-[#1877f2] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166fe5] disabled:opacity-50"
          >
            {loading ? "認証中…" : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.65rem] text-[#8d949e]">
          このページは管理者専用です。
        </p>
      </div>
    </div>
  );
}
