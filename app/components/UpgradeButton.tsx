"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  label?: string;
  className?: string;
};

export default function UpgradeButton({ label, className }: Props) {
  const t = useTranslations("upgradeButton");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        setError(t("errorLogin"));
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? t("errorCheckout"));
        setLoading(false);
      }
    } catch {
      setError(t("errorNetwork"));
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={className ?? "honne-btn-primary w-full rounded-lg py-3 font-semibold disabled:opacity-60"}
      >
        {loading ? t("loading") : (label ?? t("defaultLabel"))}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
