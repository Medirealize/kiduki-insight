type AnalyticsPayload = {
  event: string;
  step?: number;
  [key: string]: unknown;
};

export function track(event: string, payload?: Omit<AnalyticsPayload, "event">): void {
  if (typeof window === "undefined") return;

  const body: AnalyticsPayload = { event, ts: Date.now(), ...payload };

  try {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) {
      return;
    }
  } catch {
    /* fall through */
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
