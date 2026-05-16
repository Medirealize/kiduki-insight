"use client";
import { useState, useEffect } from "react";
import type { UserState, UserStatus } from "@/lib/types/log";
import { FREE_DAILY_LIMIT } from "@/lib/types/log";

const STORAGE_KEY = "honne-user-v1";
const todayStr = () => new Date().toISOString().slice(0, 10);

const defaults: UserState = {
  status: "FREE",
  dailyUsage: 0,
  dailyUsageDate: todayStr(),
};

export function useUserStatus() {
  const [state, setState] = useState<UserState>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserState;
        // 日付が変わっていたら回数リセット
        if (parsed.dailyUsageDate !== todayStr()) {
          parsed.dailyUsage = 0;
          parsed.dailyUsageDate = todayStr();
        }
        setState(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const persist = (s: UserState) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  };

  const isPremium = state.status === "PREMIUM";
  const canDiagnose = isPremium || state.dailyUsage < FREE_DAILY_LIMIT;
  const remainingToday = isPremium ? null : Math.max(0, FREE_DAILY_LIMIT - state.dailyUsage);

  const recordUsage = () => {
    setState((prev) => {
      const today = todayStr();
      const next: UserState = {
        ...prev,
        dailyUsage: prev.dailyUsageDate === today ? prev.dailyUsage + 1 : 1,
        dailyUsageDate: today,
      };
      persist(next);
      return next;
    });
  };

  const upgradeToPremium = () => {
    setState((prev) => {
      const next = { ...prev, status: "PREMIUM" as UserStatus };
      persist(next);
      return next;
    });
  };

  const downgradeToFree = () => {
    setState((prev) => {
      const next = { ...prev, status: "FREE" as UserStatus };
      persist(next);
      return next;
    });
  };

  return {
    ...state,
    isPremium,
    canDiagnose,
    remainingToday,
    recordUsage,
    upgradeToPremium,
    downgradeToFree,
    hydrated,
  };
}
