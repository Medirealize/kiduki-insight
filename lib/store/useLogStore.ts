"use client";
import { useState, useEffect, useCallback } from "react";
import type { DiagnosisLog } from "@/lib/types/log";

// ストレージキー。将来 Supabase/Prisma に移行するときはここだけ差し替え。
const STORAGE_KEY = "honne-logs-v1";

export function useLogStore() {
  const [logs, setLogs] = useState<DiagnosisLog[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLogs(JSON.parse(raw) as DiagnosisLog[]);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: DiagnosisLog[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const addLog = useCallback(
    (log: Omit<DiagnosisLog, "id" | "createdAt">): DiagnosisLog => {
      const entry: DiagnosisLog = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setLogs((prev) => {
        const next = [entry, ...prev];
        persist(next);
        return next;
      });
      return entry;
    },
    [persist]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { logs, addLog, clearLogs, hydrated };
}
