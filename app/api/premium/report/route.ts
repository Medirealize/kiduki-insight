import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

type LogEntry = {
  createdAt: string;
  group: string;
  userInput: string;
  insight: string;
  doctorAdvice: string;
};

type ReportRequestBody = {
  userToken: string;
  logs: LogEntry[];
};

export type PremiumReport = {
  pattern: string;
  growth: string;
  communication: string;
  advice: string;
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json({ error: "Server not configured." }, { status: 500, headers: cors });
    }

    const body = (await req.json()) as ReportRequestBody;

    // プレミアムガード（本番では JWT/セッション検証に差し替え）
    if (body.userToken !== "PREMIUM") {
      return NextResponse.json(
        { error: "プレミアムプランが必要です。" },
        { status: 403, headers: cors }
      );
    }

    const logs: LogEntry[] = Array.isArray(body.logs) ? body.logs.slice(0, 10) : [];
    if (logs.length === 0) {
      return NextResponse.json({ error: "ログがありません。" }, { status: 400, headers: cors });
    }

    const logsText = logs
      .map((l, i) =>
        `【ログ${i + 1}｜${l.createdAt.slice(0, 10)}｜${l.group}タイプ】\n` +
        `相談：${l.userInput}\n` +
        `ほんね：${l.insight}\n` +
        `医師への一言：${l.doctorAdvice}`
      )
      .join("\n\n");

    const prompt = `
あなたは、患者の複数回の診察前ログを分析する専門カウンセラーです。医療診断は行いません。
以下の過去ログ（${logs.length}件）を分析し、日本語で400〜500文字のレポートを生成してください。

${logsText}

【出力フォーマット（必ずJSONのみ）】
{
  "pattern": "繰り返し現れている悩みのパターンや不安のテーマ（2〜3文）",
  "growth": "時系列で見た自己理解や表現の深まり（2〜3文）",
  "communication": "医師への伝え方の特徴と傾向（1〜2文）",
  "advice": "次の診察に向けた具体的なアドバイス（1〜2文）"
}`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI request failed." }, { status: 500, headers: cors });
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty AI response." }, { status: 500, headers: cors });
    }

    let parsed: PremiumReport;
    try {
      parsed = JSON.parse(content) as PremiumReport;
    } catch {
      parsed = { pattern: content, growth: "", communication: "", advice: "" };
    }

    return NextResponse.json(parsed, { headers: cors });
  } catch (error) {
    console.error("Premium report error:", error);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500, headers: cors });
  }
}
