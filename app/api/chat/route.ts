import { NextRequest, NextResponse } from "next/server";

type ChatRequestBody = {
  typeCode: string;
  group: string;
  worryText: string;
  baseInsight: string;
  baseAction: string;
};

type ChatResponseBody = {
  insight: string;
  action: string;
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

    const body = (await req.json()) as ChatRequestBody;
    const { typeCode, group, worryText, baseInsight, baseAction } = body;

    const systemPrompt = `
あなたは日本語で回答する、『性格統計学を熟知した経験豊富な医師』です。
患者さんの性格タイプ（A/B/Cタイプと3つの軸）と、既に用意された性格統計学ベースの知見をふまえて、
診察室で患者さんにかけるような、あたたかく、しかし統計学的な裏付けのある言葉を返してください。

【重要な前提】
- ここで行うのは「診断」ではなく、「医師への相談を助けるための言語化」です。
- 医療的な断定（〜です、〜が正しいです）は避け、「〜と考えられるかもしれません」「〜と相談してみるのも一つの方法です」といった表現を用いてください。
- 不安そのものを否定せず、「そう感じるのは自然なこと」と受け止める姿勢を大切にしてください。
- 自己責任を強調したり、患者さんを責めるような表現は絶対に避けてください。
- 「あなたは〜のタイプなので」「〜タイプの人は」といった占い的・説明的な書き方は禁止です。性格統計学の知見は、医師としての洞察として自然に文章の中に溶かし込んでください。
`.trim();

    const userPrompt = `
【性格タイプ情報】
- typeCode: ${typeCode}
- group: ${group}

【ユーザーが最初に入力した悩み】
「${worryText || "（未入力）"}」

【性格統計学に基づく、そのタイプ向けのベースInsight】
Insight（ベース）:
${baseInsight}

診察室での最初の一言（ベース例）:
${baseAction}

【出力のルール（とても重要）】
- 全体の文字数は「400〜500文字程度」に収めてください（スマホ1.5画面ほどの密度）。
- 「あなたは〜のタイプなので」「〜タイプの人は」といった占いっぽい説明文は禁止です。
- 「〜をおすすめします」ではなく、「〜と伝えてみると、心が軽くなるかもしれません」といった、寄り添う表現にしてください。
- 占いではなく、臨床心理でよく見られる「心の動きへの洞察」を伝えるトーンで書いてください。

【構成（この構成を必ず守ること）】
INSIGHT欄に入れるテキストは、ラベルなしで「3つの文章」だけで構成してください。
- 1文目（共感）：今の状況や感情を、短く具体的に受け止める一文。
- 2文目（心理の核心）：今感じている迷いや不安の正体を、臨床心理的な視点で鋭く言語化する一文。
- 3文目（解決のヒント）：性格統計学の特性（タイプ名は出さず、「周囲を優先しやすい」「一人で抱え込みやすい」などの傾向）を踏まえたうえで、その特性を活かしながら長期的に楽になるための考え方・行動のヒントを示す一文。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "insight": "INSIGHT欄に表示する3つの文章を、ラベルなしでこの1つの文字列の中に書いてください（文と文の間には改行を入れて構いません）。",
  "action": "診察室で患者さんが医師に対して実際に口にする、日本語のフレーズを1〜2文で書いてください（40文字以内）。主語は必ず「私」にし、「〜についてどう思いますか？」「〜と心配されていますか？」といった医師から患者への質問文は禁止です。「私は本来〜な傾向があるので、〜が難しいです」といった形で性格統計学の知見を自分の言葉として含め、医師がすぐに方針を判断できるような、具体的な相談ベースの一言にしてください。"
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
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response." },
        { status: 500 }
      );
    }

    let parsed: ChatResponseBody | null = null;

    try {
      parsed = JSON.parse(content) as ChatResponseBody;
    } catch {
      // JSON以外の形式で返ってきた場合のフォールバック（非常時用）
      const insightMatch = content.match(/"insight"\s*:\s*"([^"]+)"/);
      const actionMatch = content.match(/"action"\s*:\s*"([^"]+)"/);
      parsed = {
        insight: insightMatch?.[1] ?? content,
        action: actionMatch?.[1] ?? "今日感じていることを、そのまま言葉にしていただいて大丈夫ですよ。",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating AI advice." },
      { status: 500 }
    );
  }
}

