import { NextRequest, NextResponse } from "next/server";
import { mergeFollowUpQuestions } from "@/lib/follow-up-questions";
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

    const body = (await req.json()) as ChatRequestBody;
    const { typeCode, group, worryText, baseInsight, baseAction } = body;
    const t0 = Date.now();

    const systemPrompt = `
あなたは日本語で回答する、『言葉にできない気持ちを言語化するコミュニケーションサポーター』です。

【役割の厳守】
- あなたの役割は、ユーザーが抱えている「気持ち」や「考え方のクセ」を、性格統計学（A/B/Cタイプ・3つの軸）に基づいて言語化することだけです。
- 医学的・法律的・心理療法的な専門的助言は一切行わないでください。
- 人間関係・職場・家族・恋愛など、あらゆる場面の「言えない気持ち」に対応してください。

【絶対禁止事項】
- 特定の病名・診断名の可能性に言及すること。
- 「受診すべき」「治療すべき」「薬を飲むべき」などの医療行為を勧めること。
- 「別れるべき」「転職すべき」など、人生の重大決断を直接的に指示すること。
- 特定の人物・組織を批判・非難する内容を生成すること。

【生成の指針】
- ユーザーの悩みがどんな内容であっても、「その悩みを持つ人の心理状態」と「性格特性（相手軸・自分軸・社会軸）」の分析に集中してください。
- 不安や感情を否定せず、「そう感じるのは自然なこと」と受け止める姿勢を大切にしてください。
- 「あなたは〜のタイプなので」といった占い的・説明的な書き方は禁止。性格統計学の知見は自然に文章に溶かし込んでください。
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

伝え言葉のベース例:
${baseAction}

【出力のルール（とても重要）】
- 全体の文字数は「400〜500文字程度」に収めてください（スマホ1.5画面ほどの密度）。
- 「あなたは〜のタイプなので」「〜タイプの人は」といった占いっぽい説明文は禁止です。
- 「〜をおすすめします」ではなく、「〜と伝えてみると、心が軽くなるかもしれません」といった、寄り添う表現にしてください。
- 占いではなく、臨床心理でよく見られる「心の動きへの洞察」を伝えるトーンで書いてください。

【構成（この構成を必ず守ること）】
あなたには、次の3つをすべて生成してほしいです。

1. insight（ラベルなし3文構成のメッセージ）
   - 1文目（共感）：ユーザーの言葉の背景にある「本当のしんどさ」に深く寄り添う一文。表面的な状況説明ではなく、その人が感じているであろう感情の核心を受け止めてください。
   - 2文目（核心）：性格統計学の知見（group の特性）を交え、「あなたが本当に恐れていること」や「無意識に自分に課している制限（〜すべき、〜でなければ、など）」をズバリと指摘する一文。タイプ名は出さず、「周囲を優先しやすい」「一人で抱え込みやすい」などの傾向として自然に溶かし込んでください。
   - 3文目（転換）：その本音を受け入れた上で、心が少し軽くなるような新しい視点を提供する一文。「〜してもいいかもしれません」「〜と気づくだけで、少し楽になれるかもしれません」といった柔らかな表現で。

2. doctor_advice（誰かに気持ちを伝えるための一言フレーズ）
   - 上司・先生・パートナー・親など、相手に実際に伝えるための日本語フレーズを1〜2文で書いてください（40文字以内を目安）。
   - 主語は必ず「私」にし、内容は「主観的な感情・気持ちの伝達」に限定してください。例：「私は〜という不安がある」「私は〜なので、正直に伝えたいと思っている」。
   - 相手への批判・非難・要求を含めず、自分の気持ちを伝える表現にしてください。

3. next_questions（気持ちをさらに深掘りする問いかけ ― サーバーでバリエーションと合成します）
   - ユーザーの悩みに関連した、次に考えてみたい問いを **3つ** 生成してください（それぞれ25文字以内）。
   - 悩みの場面（職場・家族・恋愛・健康など）に応じた、具体的で実践的な問いにしてください。
   - 例（職場）：「上司に伝えるタイミングはいつか」「誰かに相談できそうか」「何から整理すればいいか」
   - 例（医療）：「先生に何を一番聞きたいか」「次の診察で伝えたいことは何か」「誰かに付き添ってもらえるか」
   - 例（家族）：「どんな言葉なら伝わりそうか」「まず誰に話せそうか」「どんな反応を恐れているか」
   - 【絶対禁止】「〜すべきですか？」「〜してはいけないですか？」などの決断を迫る問いは禁止です。
   - これら3つは互いに観点を変え、番号や「質問1」などのラベルは付けないでください。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "insight": "INSIGHT欄に表示する3つの文章を、ラベルなしでこの1つの文字列の中に書いてください（文と文の間には改行を入れて構いません）。",
  "doctor_advice": "上記の条件を満たす、ユーザーが「私」を主語にして誰かに気持ちを伝えるための一言を日本語で書いてください。",
  "next_questions": ["問い1", "問い2", "問い3"]
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
          temperature: 0.8,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        console.error("[chat] OpenAI request timed out after", OPENAI_TIMEOUT_MS, "ms");
        return NextResponse.json({ error: "AI request timed out." }, { status: 504 });
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
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
          "私はうまく言葉にできていないけれど、この気持ちを正直に伝えたいと思っています。",
        next_questions:
          fallbackQuestions.length > 0
            ? fallbackQuestions
            : ["今いちばん怖いことは何か", "本当はどうしたいと思っているか", "誰のために頑張り続けているのか"],
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Invalid AI response shape." }, { status: 500, headers: cors });
    }

    const mergedNext = mergeFollowUpQuestions(parsed.next_questions ?? [], {
      group,
      typeCode,
      worryText,
    });
    parsed = { ...parsed, next_questions: mergedNext };

    const elapsedMs = Date.now() - t0;
    if (process.env.NODE_ENV !== "production") {
      console.log("[chat] ok", { typeCode, group, elapsedMs, followUps: mergedNext.length });
    }

    return NextResponse.json(parsed, { headers: cors });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while generating AI advice." },
      { status: 500, headers: cors }
    );
  }
}

