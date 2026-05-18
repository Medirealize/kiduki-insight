"use client";
import { useState, useEffect, useCallback } from "react";
import type { DiagnosisLog } from "@/lib/types/log";
import { getSupabaseClient } from "@/lib/supabase";
import { createSupabaseBrowserClient } from "@/lib/auth/browser";

const STORAGE_KEY = "honne-logs-v1";
const SESSION_KEY = "honne-session-id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function resolveUserId(): Promise<string> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch { /* ignore */ }
  return getSessionId();
}

async function pushToSupabase(log: DiagnosisLog) {
  const userId = await resolveUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getSupabaseClient() as any).from("honne_logs").insert({
    id:                 log.id,
    user_id:            userId,
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
