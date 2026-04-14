import { NextRequest, NextResponse } from "next/server";

type DeepQuestionsRequestBody = {
  typeCode: string;
  group: string;
  worryText: string;
};

type DeepQuestionsResponseBody = {
  questions: string[];
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as DeepQuestionsRequestBody;
    const { typeCode, group, worryText } = body;

    const systemPrompt = `
あなたは日本語で回答する、『患者の心の声を言語化するカウンセラー』です。診断や医療判断は行いません。

患者さんの性格タイプ（A/B/Cタイプと3つの軸）と悩みの内容を踏まえ、
その人が「自分の本音」や「本当の優先順位」に気づけるような、深い問いかけを作ってください。

【禁止事項】病名・検査・治療に関する言及や勧めは一切含めないでください。あくまで心理・性格・価値観に焦点を当てた問いだけにしてください。

ここで作る問いは、診察前のステップ3〜5で1つずつ表示される「二択質問」の土台となる問いです。
`.trim();

    const userPrompt = `
【性格タイプ情報】
- typeCode: ${typeCode}
- group: ${group}

【ユーザーが最初に入力した悩み】
「${worryText || "（未入力）"}」

【質問の役割】
- これから3つのステップで、患者さんに順番に問いかけます。
- それぞれの問いは、「はい/いいえ」や「どちらかと言えばA/B」と答えやすいような内容にしてください。
- ただし文面としては、「〜と感じることが多いですか？」「〜の方を優先しがちですか？」など、
  心のクセや優先順位に気づきやすくなるような聞き方にしてください。

【性格統計学をどう活かすか】
- group（${group}）に応じて、
  - 自分軸なら：「自分の納得」「自分のペース」「損得・合理性」などに関する問い
  - 相手軸なら：「周囲の期待」「家族や職場への気遣い」「迷惑をかけたくない気持ち」などに関する問い
  - 社会軸なら：「役割や責任」「仕事への影響」「長期的なキャリアや生活」などに関する問い
  を中心に据えてください。

【出力のルール（とても重要）】
- 質問は必ず3つ作ってください。
- 各質問は、スマホ表示で最大2行に収まる自然な日本語にしてください（目安: 36文字以内）。
- 3つの質問は必ず観点を変えてください（例: ①感情・不安 ②優先順位・価値観 ③周囲との関係や配慮）。
- 似た意味の言い換えを3つ並べるのは禁止です。各質問で焦点を明確に変えてください。
- 「Q1:」「1.」などのラベルや番号は付けず、テキストだけを書いてください。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "questions": ["質問1", "質問2", "質問3"]
}
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI deep-questions API error:", errorText);
      return NextResponse.json(
        { error: "AI API request failed." },
        { status: 500 }
      );
    }

    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response." },
        { status: 500 }
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
                "今いちばん怖いことは？",
                "誰のために無理をしていますか？",
                "本当はどうしたいですか？",
              ],
      };
    }

    // 念のため3つに調整
    const unique = Array.from(new Set(parsed.questions.map((q) => q.trim()))).filter(
      (q) => q.length > 0
    );
    const normalized =
      unique.length >= 3
        ? unique.slice(0, 3)
        : [...unique, ..."".repeat(3 - unique.length).split("")].slice(0, 3).map((q, idx) =>
            q && q.length > 0
              ? q
              : ["今いちばん気になっているのは？", "本当はどうしたいと思っていますか？", "一番大事にしたいことは？"][idx]
          );

    // 一時デバッグ: 生成された質問のばらつきを確認するためにサーバーログへ出力
    console.log("[deep-questions]", {
      typeCode,
      group,
      worryPreview: (worryText || "").slice(0, 40),
      questions: normalized,
    });

    return NextResponse.json({ questions: normalized });
  } catch (error) {
    console.error("Deep-questions route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating deep questions." },
      { status: 500 }
    );
  }
}

