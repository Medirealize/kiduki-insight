"use client";
import { useState, useEffect, useCallback } from "react";
import type { DiagnosisLog } from "@/lib/types/log";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "honne-logs-v1";
const SESSION_KEY = "honne-session-id";

// 端末ごとの匿名セッションID（認証導入まで user_id として使用）
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function pushToSupabase(log: DiagnosisLog) {
  const { error } = await supabase.from("honne_logs").insert({
    id:                 log.id,
    user_id:            getSessionId(),
    created_at:         log.createdAt,
    user_input:         log.userInput,
    insight:            log.insight,
    doctor_advice:      log.doctorAdvice,
    selected_questions: log.selectedQuestions,
    group_name:         log.group,
  });
  if (error) console.warn("[honne_logs] Supabase insert error:", error.message);
}

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
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLogs((prev) => {
        const next = [entry, ...prev];
        persist(next);
        return next;
      });
      // Supabase に非同期で書き込み（失敗してもローカルには保存済み）
      void pushToSupabase(entry);
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
