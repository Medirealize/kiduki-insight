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
INSIGHT欄に入れるテキストとして、次の3ブロックをこの順番・ラベルで生成してください。

【共感】（40文字以内）
ユーザーの状況や感情を、短く具体的に受け止める一文。

【気づき】
ここは必ず「3つの文章」で構成してください。
- 1文目：今の状況に対する心理的な鋭い指摘（今の迷いや不安の正体を言語化する）。
- 2文目：性格統計学の特性から来る、無理の根本原因（タイプ名は出さず、「周囲を優先しやすい傾向」「一人で抱え込みやすい傾向」などとして表現する）。
- 3文目：その特性を活かした、納得感のある解決のヒント（長期的に自分らしく過ごすための考え方の切り替え方を提案する）。

【医師への一言】
診察室で実際に使える、短い日本語フレーズを2つだけ箇条書きで提案してください。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "insight": "【共感】...\n\n【気づき】...\n\n【医師への一言】\n・...\n・...",
  "action": "『最初の一言』として診察室で医師が口にする日本語のフレーズを1〜2文で書いてください（40文字以内）。単なる質問ではなく、患者さん自身の心の葛藤を素直に開示できるよう背中を押しつつ、医師にとって診断の重要なヒントになるような、深く刺さるひと言にしてください。"
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

