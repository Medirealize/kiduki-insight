import { NextRequest, NextResponse } from "next/server";

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

    const body = await req.json();
    const {
      typeCode,
      group,
      worryText,
      insight,
      action,
      focuses,
    }: {
      typeCode: string;
      group: string;
      worryText: string;
      insight: string;
      action: string;
      focuses: string[];
    } = body;

    const focusSummary = focuses && focuses.length > 0 ? focuses.join(", ") : "未指定";

    const systemPrompt = `
あなたは日本語で回答する、医療現場をよく理解したカウンセラー兼通訳者です。
性格統計学（A/B/Cタイプと3つの軸）と、既に用意されたInsightを土台にしながら、
患者さんが医師に本当に伝えたかった思いを、あたたかく・具体的に言語化してください。

【前提条件】
- あなたは診断や治療方針を決める立場ではありません。
- あくまで「医師にどう伝えるとよいか」を一緒に考える立場です。
- 不安を否定せず、「その感覚は自然なもの」と受け止める姿勢を大切にしてください。
- 医療的な断定（〜です、〜が正しいです）は避け、「〜と伝えてみるのはどうでしょう」「〜と相談してみても良いかもしれません」といった表現を使ってください。
- センシティブな内容には配慮し、決して責めたり、自己責任にしないでください。
`.trim();

    const userPrompt = `
【性格タイプ】
- typeCode: ${typeCode}
- group: ${group}
- focusの傾向: ${focusSummary}

【ユーザーが最初に入力した悩みの概要】
「${worryText || "（未入力）"}」

【既存のInsight（性格統計学に基づくもの）】
Insight:
${insight}

診察室での最初の一言の例:
${action}

【あなたにお願いしたいこと】
1. まず、ユーザーが感じている不安や迷いをやさしく受け止めてください（2〜3文）。
2. 性格タイプ（${typeCode}, ${group}）や focus の傾向を踏まえて、「どういう考え方・パターンが働きやすいか」をやわらかく言語化してください（ラベリングしすぎないように）。
3. そのうえで、
   - 医師に何をどう伝えると良さそうか
   - どのような聞き方をすると安心しやすそうか
   を、具体的な日本語例文（2〜4個）を挙げて提案してください。
4. 全体を通して、「これはあくまで一つの見方で、違和感があればその感覚を大切にして良い」というメッセージも添えてください。

一人称は「わたし」ではなく、自然な三人称・丁寧語で書いてください。
箇条書きを使っても構いませんが、機械的になりすぎないように、人間味のある柔らかい文章にしてください。
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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "AI API request failed." },
        { status: 500 }
      );
    }

    const data = (await response.json()) as any;
    const message =
      data?.choices?.[0]?.message?.content?.trim() ??
      "AIからのメッセージを生成できませんでした。時間をおいてもう一度お試しください。";

    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating AI message." },
      { status: 500 }
    );
  }
}

