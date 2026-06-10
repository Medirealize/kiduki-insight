"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useLogStore } from "@/lib/store/useLogStore";
import { useUserStatus } from "@/lib/store/useUserStatus";
import { useAuth } from "@/lib/auth/useAuth";
import { FREE_LOG_VISIBLE, FREE_DAILY_LIMIT } from "@/lib/types/log";
import HistoryCard from "@/app/components/HistoryCard";
import dynamic from "next/dynamic";
import type { PremiumReport } from "@/app/api/premium/report/route";

const UpgradeButton = dynamic(() => import("@/app/components/UpgradeButton"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function HistoryPage() {
  const t = useTranslations("history");
  const locale = useLocale();
  const { logs, clearLogs, hydrated } = useLogStore();
  const { dailyUsage } = useUserStatus();
  const auth = useAuth();
  const isPremium = auth.isPremium;

  const [report, setReport] = useState<PremiumReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const weeklyLogs = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs.filter((l) => new Date(l.createdAt) >= weekAgo).length;
  }, [logs]);

  const generateReport = async () => {
    if (!isPremium || logs.length === 0) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch(`${API_BASE}/api/premium/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: "PREMIUM",
          logs: logs.slice(0, 10).map((l) => ({ createdAt: l.createdAt, group: l.group, userInput: l.userInput, insight: l.insight, doctorAdvice: l.doctorAdvice })),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as PremiumReport;
      setReport(data);
    } catch {
      setReportError(t("report.error"));
    } finally {
      setReportLoading(false);
    }
  };

  const countUnit = locale === "en" ? "" : "件";
  const timeUnit = locale === "en" ? "" : "回";

  return (
    <div className="page-bg min-h-screen w-full overflow-x-hidden font-sans text-honne-text antialiased">
      <div className="sticky top-0 z-10 border-b border-honne-border-light bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
          <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm font-medium text-honne-secondary transition hover:text-honne-primary">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t("back")}
          </Link>
          <span className="text-sm font-semibold text-honne-text">{t("title")}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${isPremium ? "bg-honne-primary-tint text-honne-primary" : "bg-honne-bg text-honne-placeholder"}`}>
            {isPremium ? t("kpi.premium") : t("kpi.free")}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 py-8 space-y-6">
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: t("kpi.totalLogs"), value: `${logs.length}${countUnit}`, color: "text-honne-primary" },
            { label: t("kpi.weeklyLogs"), value: `${weeklyLogs}${countUnit}`, color: "text-honne-success-text" },
            { label: t("kpi.dailyUsage"), value: `${dailyUsage}/${isPremium ? "∞" : FREE_DAILY_LIMIT}${timeUnit}`, color: "text-violet-600" },
            { label: t("kpi.plan"), value: isPremium ? t("kpi.premium") : t("kpi.free"), color: isPremium ? "text-honne-primary" : "text-honne-placeholder" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-honne-border-light bg-white px-4 py-3.5 shadow-sm">
              <p className="text-[0.65rem] text-honne-placeholder">{kpi.label}</p>
              <p className={`mt-1 text-xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </section>

        {!isPremium && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-honne-primary-light via-honne-primary to-honne-primary-hover px-6 py-6 text-white shadow-honne-primary">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50">{t("premiumBanner.badge")}</p>
            <p className="mt-1 text-lg font-bold">
              {t("premiumBanner.title").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-white/70">
              {(t.raw("premiumBanner.features") as string[]).map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <div className="mt-4">
              {auth.user ? (
                <UpgradeButton label={t("premiumBanner.upgradeButton")} className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-honne-dark transition hover:bg-white/90" />
              ) : (
                <Link href={`/${locale}`} className="block w-full rounded-lg bg-white py-2.5 text-center text-sm font-bold text-honne-dark transition hover:bg-white/90">
                  {t("premiumBanner.loginButton")}
                </Link>
              )}
            </div>
          </div>
        )}

        {isPremium && logs.length >= 2 && (
          <div className="rounded-2xl border-2 border-honne-primary/30 bg-white px-5 py-5 shadow-honne-primary">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-widest text-honne-primary">{t("report.badge")}</p>
            <p className="mb-4 text-sm text-honne-secondary">{t("report.desc", { count: logs.length })}</p>
            {!report && (
              <button type="button" onClick={generateReport} disabled={reportLoading}
                className="honne-btn-primary w-full rounded-lg py-3 text-sm font-bold shadow-sm transition disabled:opacity-60">
                {reportLoading ? t("report.analyzing") : t("report.generateButton")}
              </button>
            )}
            {reportError && <p className="mt-2 text-center text-xs text-red-500">{reportError}</p>}
            {report && (
              <div className="space-y-4 mt-2">
                {([
                  { key: "pattern", value: report.pattern },
                  { key: "growth", value: report.growth },
                  { key: "communication", value: report.communication },
                  { key: "advice", value: report.advice },
                ] as const).filter((r) => r.value).map((r) => (
                  <div key={r.key}>
                    <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-widest text-honne-primary">{t(`report.sections.${r.key}`)}</p>
                    <p className="text-sm leading-relaxed text-honne-text">{r.value}</p>
                  </div>
                ))}
                <button type="button" onClick={() => setReport(null)}
                  className="w-full rounded-xl border border-honne-border-light py-2 text-xs text-honne-placeholder transition hover:bg-honne-bg">
                  {t("report.closeButton")}
                </button>
              </div>
            )}
          </div>
        )}

        {!hydrated ? (
          <p className="text-center text-sm text-honne-placeholder">…</p>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-honne-border-light bg-white px-6 py-12 text-center shadow-honne">
            <p className="text-3xl">{t("empty.icon")}</p>
            <p className="mt-3 font-semibold text-honne-text">{t("empty.title")}</p>
            <p className="mt-1 text-sm text-honne-placeholder">{t("empty.desc")}</p>
            <Link href={`/${locale}`} className="honne-btn-primary mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold">
              {t("empty.goButton")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-honne-text">{t("logCount", { count: logs.length })}</p>
              {!isPremium && logs.length > FREE_LOG_VISIBLE && (
                <p className="text-xs text-honne-placeholder">{t("locked", { count: logs.length - FREE_LOG_VISIBLE })}</p>
              )}
            </div>
            {logs.map((log, idx) => (
              <HistoryCard key={log.id} log={log} locked={!isPremium && idx >= FREE_LOG_VISIBLE} onUpgrade={() => {}} />
            ))}
          </div>
        )}

        {logs.length > 0 && (
          <button type="button"
            onClick={() => { if (confirm(t("deleteConfirm"))) clearLogs(); }}
            className="w-full rounded-xl border border-red-100 py-2.5 text-xs text-red-400 transition hover:bg-red-50">
            {t("deleteAll")}
          </button>
        )}

        {auth.user && (
          <button type="button" onClick={() => auth.signOut()}
            className="w-full rounded-xl border border-honne-border-light py-2.5 text-xs text-honne-placeholder transition hover:bg-honne-bg">
            {t("logout", { email: auth.user.email ?? "" })}
          </button>
        )}
      </div>
    </div>
  );
}
