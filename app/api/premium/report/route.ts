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
        `【記録${i + 1}｜${l.createdAt.slice(0, 10)}｜${l.group}タイプ】\n` +
        `相談内容：${l.userInput}\n` +
        `本音の言語化：${l.insight}\n` +
        `先生への魔法のフレーズ：${l.doctorAdvice}`
      )
      .join("\n\n");

    const prompt = `
あなたは「プロの患者育成」を支援する思考整理の専門家です。診断・治療・医薬品に関する判断は一切行いません。
以下の過去ログ（${logs.length}件）を分析し、日本語で400〜500文字のレポートを生成してください。

【分析の視点】
- 医療相談ではなく、「診察室でのコミュニケーション」と「自己理解の深まり」に焦点を当てて分析してください。
- ユーザーが繰り返し感じているモヤモヤのパターンと、その奥にある価値観・優先順位を見つけてください。
- 医師に伝えるフレーズがどう変化・進化してきたかを観察してください。

${logsText}

【絶対禁止事項】
- 病名・診断・治療法・薬の評価に関する内容を含めないこと。
- 「受診すべき」「この治療がいい」などの医療行為に関する指示を含めないこと。

【出力フォーマット（必ずJSONのみ）】
{
  "pattern": "複数の記録を通じて繰り返し現れているモヤモヤのテーマや、その奥にある価値観のパターン（2〜3文）",
  "growth": "時系列で見た自己理解の深まりや、本音を言語化する力の変化（2〜3文）",
  "communication": "先生へのフレーズの特徴・傾向と、コミュニケーションスタイルの変化（1〜2文）",
  "advice": "次の診察に向けた、コミュニケーション面での具体的な一歩（1〜2文。医療判断は含めないこと）"
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
