import insightsData from "../insights.json";

export type InsightRecord = {
  type_code: string;
  gender: string;
  variation_id: number;
  focus: string;
  insight: string;
  action: string;
};

const insights = insightsData as InsightRecord[];

function getFocusHintsFromText(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const hints: string[] = [];

  // 日本語キーワード
  if (/\b(仕事|働|役割|復帰|パフォーマンス)\b/.test(t)) hints.push("social_role", "performance");
  if (/\b(家族|周り|心配|迷惑)\b/.test(t)) hints.push("family_responsibility", "family");
  if (/\b(説明|理由|根拠|納得|理解)\b/.test(t)) hints.push("precision", "rational_assurance");
  if (/\b(不安|辛い|分かって)\b/.test(t)) hints.push("support", "reassurance");
  if (/\b(選択|決め|見通し)\b/.test(t)) hints.push("decision_making", "future_planning");
  if (/\b(症状|体調|受診)\b/.test(t)) hints.push("symptom_analysis", "self_control");

  // 英語キーワード
  const tl = t.toLowerCase();
  if (/\b(work|job|boss|colleague|role|performance|office|workplace)\b/.test(tl)) hints.push("social_role", "performance");
  if (/\b(family|parent|mom|dad|mother|father|sibling|relative|worry about)\b/.test(tl)) hints.push("family_responsibility", "family");
  if (/\b(explain|reason|understand|logic|proof|convince|justify)\b/.test(tl)) hints.push("precision", "rational_assurance");
  if (/\b(anxious|anxiety|lonely|scared|overwhelm|support|listen|understand me)\b/.test(tl)) hints.push("support", "reassurance");
  if (/\b(decide|choice|plan|future|outcome|direction|next step)\b/.test(tl)) hints.push("decision_making", "future_planning");
  if (/\b(symptom|health|doctor|appointment|pain|diagnosis|medical)\b/.test(tl)) hints.push("symptom_analysis", "self_control");
  if (/\b(partner|relationship|friend|colleague|hurt|trust|feeling)\b/.test(tl)) hints.push("relationship", "support");

  return [...new Set(hints)];
}

export function pickClosestInsight(
  typeCode: string,
  worryText: string,
  selectedFocuses: string[]
): InsightRecord | null {
  let pool = insights.filter((r) => r.type_code === typeCode);
  if (pool.length === 0) {
    const prefix = typeCode[0];
    pool = insights.filter((r) => r.type_code.startsWith(prefix ?? "A"));
  }
  if (pool.length === 0) return null;
  const hints = [...getFocusHintsFromText(worryText), ...selectedFocuses];
  if (hints.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  const scored = pool.map((r) => ({
    record: r,
    score: hints.filter((h) => r.focus === h || r.focus.includes(h)).length,
  }));
  const best = Math.max(...scored.map((s) => s.score));
  const candidates = scored.filter((s) => s.score === best).map((s) => s.record);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
