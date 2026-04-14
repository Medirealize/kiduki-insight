import { NextRequest, NextResponse } from "next/server";

type OpenAIChatCompletion = {
  choices: Array<{ message: { content: string } }>;
};

type ChatRequestBody = {
  typeCode: string;
  group: string;
  worryText: string;
  baseInsight: string;
  baseAction: string;
};

type ChatResponseBody = {
  insight: string;
  doctor_advice: string;
  next_questions: string[];
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
あなたは日本語で回答する、『患者の心の声を言語化するカウンセラー』です。診断や医療判断を行う医師の役割は一切担いません。

【役割の厳守】
- あなたの役割は、患者さんが抱えている「気持ち」や「考え方のクセ」を、性格統計学（A/B/Cタイプ・3つの軸）に基づいて言語化することだけです。
- 医学的な診断・治療の助言、病名の推定、検査・手術・投薬の勧めは一切行わないでください。

【絶対禁止事項】
- 特定の病名（がん、癌、糖尿病、心臓病など）の可能性に言及すること。
- 具体的な医療行為（検査を受けるべき、手術を検討すべき、薬の中止・変更など）を直接勧めること。
- 「〜の病気かもしれません」「〜を検査した方がよい」といった医学的助言を書くこと。

【生成の指針】
- ユーザーの問いが医学的な内容（症状・検査・治療など）であっても、あなたの回答は「その問いを発しているユーザーの心理状態」および「性格特性（相手軸・自分軸・社会軸など）」の分析に集中してください。
- 不安を否定せず、「そう感じるのは自然なこと」と受け止める姿勢を大切にしてください。
- 「あなたは〜のタイプなので」といった占い的・説明的な書き方は禁止。性格統計学の知見は、心の動きへの洞察として自然に文章に溶かし込んでください。
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
あなたには、次の3つをすべて生成してほしいです。

1. insight（ラベルなし3文構成のメッセージ）
   - 1文目（共感）：今の状況や感情を、短く具体的に受け止める一文。
   - 2文目（心理の核心）：今感じている迷いや不安の正体を、臨床心理的な視点で鋭く言語化する一文。
   - 3文目（転換・解決のヒント）：性格統計学の特性（タイプ名は出さず、「周囲を優先しやすい」「一人で抱え込みやすい」などの傾向）を踏まえたうえで、その特性を活かしながら長期的に楽になるための考え方・行動のヒントを示す一文。

2. doctor_advice（患者が医師に伝えるためのフレーズ）
   - 診察室で患者さんが医師に対して実際に口にする、日本語のフレーズを1〜2文で書いてください（40文字以内を目安）。
   - 主語は必ず「私」にし、内容は「主観的な感情・不安の伝達」に限定してください。例：「私は〜という不安がある」「私は〜という性格なので、先生に相談したい」。
   - 病名・検査・治療の勧めを含めず、医師から患者への質問文（「〜についてどう思いますか？」など）も禁止です。

3. next_questions（内省を促す3つの短い問い）
   - ユーザーの悩みと性格傾向を踏まえ、「自分の本音や優先順位に気づきやすくなる」内省的な問いを3つ作ってください。
   - 各質問は20文字以内の短い日本語の文にし、患者さん自身が自分に投げかける問いとして自然なものにしてください。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "insight": "INSIGHT欄に表示する3つの文章を、ラベルなしでこの1つの文字列の中に書いてください（文と文の間には改行を入れて構いません）。",
  "doctor_advice": "上記の条件を満たす、患者さんが「私」を主語にして医師に伝えるための一言を日本語で書いてください。",
  "next_questions": ["質問1", "質問2", "質問3"]
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

    const data = (await response.json()) as OpenAIChatCompletion;
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
      const doctorMatch = content.match(/"doctor_advice"\s*:\s*"([^"]+)"/);
      const questionsMatch = content.match(/"next_questions"\s*:\s*\[([^\]]*)\]/);
      const fallbackQuestions =
        questionsMatch?.[1]
          ?.split(",")
          .map((s: string) => s.replace(/(^\s*")|("\s*$)/g, ""))
          .filter((s: string) => s.length > 0) ?? [];
      parsed = {
        insight: insightMatch?.[1] ?? content,
        doctor_advice:
          doctorMatch?.[1] ??
          "私は今の状態を自分でうまく説明できていないので、先生の目から見てどう整理できるか教えていただけますか？",
        next_questions:
          fallbackQuestions.length > 0
            ? fallbackQuestions
            : ["今いちばん怖いことは何か", "本当はどうしたいと思っているか", "誰のために頑張り続けているのか"],
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

