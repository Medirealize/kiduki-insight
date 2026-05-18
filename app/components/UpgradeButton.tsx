"use client";
import { useState } from "react";

type Props = {
  label?: string;
  className?: string;
};

export default function UpgradeButton({ label = "プレミアムにアップグレード", className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        setError("ログインが必要です。一度ログアウトして再度ログインしてからお試しください。");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "決済ページへの移動に失敗しました。時間をおいて再度お試しください。");
        setLoading(false);
      }
    } catch {
      setError("ネットワークエラーが発生しました。通信環境を確認してください。");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={className ?? "w-full rounded-xl bg-amber-500 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60"}
      >
        {loading ? "Stripeへ移動中…" : label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
