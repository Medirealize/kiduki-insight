import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

const OPENAI_TIMEOUT_MS = 45_000;

type OpenAIChatCompletion = {
  choices: Array<{ message: { content: string } }>;
};

type DeepQuestionsRequestBody = {
  typeCode: string;
  group: string;
  worryText: string;
};

type DeepQuestionsResponseBody = {
  questions: string[];
};

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500, headers: cors }
      );
    }

    const body = (await req.json()) as DeepQuestionsRequestBody;
    const { typeCode, group, worryText } = body;
    const t0 = Date.now();

    const systemPrompt = `
あなたは日本語で回答する「思考整理トレーナー」です。診断・治療・医薬品に関する判断は一切行いません。

あなたの仕事は、ユーザーが診察室で抱えている「表面的な心配」の奥にある「本当の本音・一番聞きたいこと」に自分で気づけるよう、問いを通じてサポートすることです。

【絶対禁止事項】
- 病名・診断・治療法・薬の良し悪しへの言及や示唆
- 「受診すべき」「この薬にすべき」などの医療行為に関する指示
- 医療的な数値・検査結果の解釈

【問いの設計原則】
- 医師への気遣い・薬への不安・ネット情報との乖離・「様子見」への疑問など、診察室でよく起きるモヤモヤの根っこを掘り下げる問いを作ってください。
- 答えやすい問いにしてください（「はい/いいえ」や「どちらかというとA/B」と答えられる程度）。
- 心のクセ・優先順位・価値観・本音に気づかせる問いに絞ってください。
`.trim();

    const userPrompt = `
【性格タイプ情報】
- typeCode: ${typeCode}
- group: ${group}

【ユーザーが最初に入力した悩み】
「${worryText || "（未入力）"}」

【質問の設計】
これから3つのステップで、ユーザーに順番に問いかけます。
各ステップで1つの問いを表示し、その答えを通じて「本当に診察室で聞きたいこと」を引き出します。

【group（${group}）に応じた焦点】
- 自分軸なら：「自分の納得感」「自分のペースで理解したい気持ち」「損得・合理性への意識」に関する問い
- 相手軸なら：「主治医への気遣い」「家族や周囲の目」「迷惑をかけたくない気持ち」に関する問い
- 社会軸なら：「仕事・生活への影響」「責任感や役割意識」「長期的な見通しへの不安」に関する問い

【3つの観点（各ステップで必ず観点を変えること）】
① 感情・不安の核心（何が一番怖い？何がいちばん気になっている？）
② 優先順位・価値観（診察で本当に知りたいことは何？どうなれば納得できる？）
③ 伝えにくさの原因（なぜ言いにくいと感じているのか？誰への配慮が邪魔をしているか？）

【出力のルール（とても重要）】
- 質問は必ず3つ作ってください。
- 各質問は、スマホ表示で最大2行に収まる自然な日本語にしてください（目安: 36文字以内）。
- 3つの質問は必ず観点を変えてください（①感情・不安 ②優先順位・価値観 ③伝えにくさの原因）。
- 似た意味の言い換えを3つ並べるのは禁止です。
- 「Q1:」「1.」などのラベルや番号は付けず、テキストだけを書いてください。
- 病名・治療・薬の推奨は含めないこと。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "questions": ["質問1", "質問2", "質問3"]
}
`.trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.9,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        console.error(
          "[deep-questions] OpenAI request timed out after",
          OPENAI_TIMEOUT_MS,
          "ms"
        );
        return NextResponse.json({ error: "AI request timed out." }, { status: 504 });
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI deep-questions API error:", errorText);
      return NextResponse.json(
        { error: "AI API request failed." },
        { status: 500, headers: cors }
      );
    }

    const data = (await response.json()) as OpenAIChatCompletion;
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response." },
        { status: 500, headers: cors }
      );
    }

    let parsed: DeepQuestionsResponseBody | null = null;

    try {
      parsed = JSON.parse(content) as DeepQuestionsResponseBody;
    } catch {
      const questionsMatch = content.match(/"questions"\s*:\s*\[([^\]]*)\]/);
      const fallbackQuestions =
        questionsMatch?.[1]
          ?.split(",")
          .map((s: string) => s.replace(/(^\s*")|("\s*$)/g, ""))
          .filter((s: string) => s.length > 0) ?? [];
      parsed = {
        questions:
          fallbackQuestions.length > 0
            ? fallbackQuestions
            : [
                "今の診察で一番怖いと感じていることは？",
                "先生に本当は何を聞きたいですか？",
                "なぜそれを言い出せていないのでしょう？",
              ],
      };
    }

    const fallbackQuestions = [
      "今いちばん気になっていることは？",
      "診察で本当に知りたいことは何ですか？",
      "言いにくくて言えていないことはありますか？",
    ];
    const unique = Array.from(new Set(parsed.questions.map((q) => q.trim()))).filter(
      (q) => q.length > 0
    );
    const normalized =
      unique.length >= 3
        ? unique.slice(0, 3)
        : [...unique, ...fallbackQuestions.slice(unique.length)];

    if (process.env.NODE_ENV !== "production") {
      console.log("[deep-questions] ok", { typeCode, group, elapsedMs: Date.now() - t0 });
    }

    return NextResponse.json({ questions: normalized }, { headers: cors });
  } catch (error) {
    console.error("Deep-questions route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating deep questions." },
      { status: 500, headers: cors }
    );
  }
}
