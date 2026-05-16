const API_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
    : "";

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
    if (navigator.sendBeacon(`${API_BASE}/api/analytics`, blob)) {
      return;
    }
  } catch {
    /* fall through */
  }

  void fetch(`${API_BASE}/api/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
