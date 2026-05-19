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
  locale?: string;
};

type ChatResponseBody = {
  insight: string;
  doctor_advice: string;
  next_questions: string[];
};

function buildSystemPrompt(locale: string): string {
  if (locale === "en") {
    return `
You are a communication support tool that helps people put unspoken feelings into words, responding in English.

【Role — strictly follow】
- Your only role is to put into words the "feelings" and "habitual thought patterns" the user is holding, based on personality statistics (A/B/C type · 3 axes).
- Do NOT provide medical, legal, or therapeutic professional advice.
- Handle any situation — workplace, relationships, family, romance — where the user has "feelings they can't say."

【Absolute prohibitions】
- Do NOT mention specific diagnoses or suggest a particular condition.
- Do NOT recommend seeking treatment, taking medication, or any medical action.
- Do NOT directly instruct life-altering decisions like "you should leave" or "you should quit."
- Do NOT generate content that criticizes or blames specific individuals or organizations.

【Generation guidelines】
- Focus on analyzing "the psychological state of the person with this worry" and "personality traits (other-axis / self-axis / social-axis)."
- Receive the user's anxiety and emotions with the attitude that "it's natural to feel this way."
- Do NOT use fortune-telling or explanatory phrasing like "because you are X type." Weave insights from personality statistics naturally into the text.
`.trim();
  }

  return `
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
}

function buildUserPrompt(
  locale: string,
  typeCode: string,
  group: string,
  worryText: string,
  baseInsight: string,
  baseAction: string
): string {
  if (locale === "en") {
    return `
【Personality type info】
- typeCode: ${typeCode}
- group: ${group}

【What the user originally wrote】
"${worryText || "(not entered)"}"

【Base insight for this type based on personality statistics】
Insight (base):
${baseInsight}

Sample phrase base:
${baseAction}

【Output rules (very important)】
- Keep the total length to approximately 400–500 characters / 80–120 words (about 1.5 phone screens).
- Do NOT use phrases like "because you are X type" or "people of X type." No fortune-telling tone.
- Instead of "I recommend you…" use "you might find it easier if…" or "it may help to…" — warm, supportive phrasing.
- Write in the tone of clinical psychological insight into emotional patterns, not fortune-telling.

【Structure (follow strictly)】
Generate all three of the following:

1. insight (3-sentence message, no label)
   - Sentence 1 (empathy): Deeply acknowledge the "real struggle" behind the user's words — not a surface description of the situation, but the core emotion they're likely feeling.
   - Sentence 2 (core): Weave in personality statistics insight (group traits) to name "what you're truly afraid of" or "an unconscious constraint you've placed on yourself (should, must, etc.)." Don't use the type name — express it naturally as tendencies like "tends to prioritize others" or "tends to carry things alone."
   - Sentence 3 (shift): After accepting that true feeling, offer a new perspective that brings a little relief. Use soft phrasing like "it might be okay to…" or "just noticing that might make things a little lighter."

2. doctor_advice (a one-line phrase to communicate feelings to someone)
   - Write 1–2 English sentences the user could actually say to a boss, doctor, partner, or parent (aim for under 40 words).
   - The subject must always be "I" and the content must be limited to "communicating subjective feelings." Example: "I feel anxious about…" or "I'd like to be honest about how I'm feeling…"
   - Do NOT include criticism, blame, or demands toward the other person.

3. next_questions (follow-up prompts to explore feelings further — the server will blend in variations)
   - Generate **3** prompts the user might want to reflect on next (each under 25 words).
   - Make them specific and practical, suited to the situation (workplace, family, romance, health, etc.).
   - Examples (workplace): "What's the right moment to tell your boss?", "Is there someone you could talk to?", "What would you tackle first?"
   - Examples (medical): "What's the one thing you most want to ask the doctor?", "What do you want to bring up at your next appointment?"
   - 【Absolute prohibition】No "should you…?" or "shouldn't you…?" questions that push toward a decision.
   - Vary the angle of each question; don't label them "Question 1" etc.

【Final output format (JSON only!)】
Return only the following JSON. Do not write any text before or after it.
{
  "insight": "Write all 3 sentences here, label-free, within this single string (line breaks between sentences are fine).",
  "doctor_advice": "A 1–2 sentence phrase for communicating the user's feelings to someone, in English, with 'I' as the subject.",
  "next_questions": ["prompt 1", "prompt 2", "prompt 3"]
}
`.trim();
  }

  return `
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
   - 1文目（共感）：ユーザーの言葉の背景にある「本当のしんどさ」に深く寄り添う一文。
   - 2文目（核心）：性格統計学の知見（group の特性）を交え、「あなたが本当に恐れていること」や「無意識に自分に課している制限」をズバリと指摘する一文。
   - 3文目（転換）：心が少し軽くなるような新しい視点を提供する一文。

2. doctor_advice（誰かに気持ちを伝えるための一言フレーズ）
   - 上司・先生・パートナー・親など、相手に実際に伝えるための日本語フレーズを1〜2文で書いてください（40文字以内を目安）。
   - 主語は必ず「私」にし、内容は「主観的な感情・気持ちの伝達」に限定してください。

3. next_questions（気持ちをさらに深掘りする問いかけ）
   - ユーザーの悩みに関連した、次に考えてみたい問いを **3つ** 生成してください（それぞれ25文字以内）。
   - 【絶対禁止】「〜すべきですか？」などの決断を迫る問いは禁止です。

【最終的な出力フォーマット（必ずJSON形式で！）】
次のJSONのみを返してください。前後に説明文や余分なテキストは一切書かないでください。
{
  "insight": "INSIGHT欄に表示する3つの文章を、ラベルなしでこの1つの文字列の中に書いてください（文と文の間には改行を入れて構いません）。",
  "doctor_advice": "上記の条件を満たす、ユーザーが「私」を主語にして誰かに気持ちを伝えるための一言を日本語で書いてください。",
  "next_questions": ["問い1", "問い2", "問い3"]
}
`.trim();
}

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
    const { typeCode, group, worryText, baseInsight, baseAction, locale = "ja" } = body;
    const t0 = Date.now();

    const systemPrompt = buildSystemPrompt(locale);
    const userPrompt = buildUserPrompt(locale, typeCode, group, worryText, baseInsight, baseAction);

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
      const insightMatch = content.match(/"insight"\s*:\s*"([^"]+)"/);
      const doctorMatch = content.match(/"doctor_advice"\s*:\s*"([^"]+)"/);
      const questionsMatch = content.match(/"next_questions"\s*:\s*\[([^\]]*)\]/);
      const fallbackQuestions =
        questionsMatch?.[1]
          ?.split(",")
          .map((s: string) => s.replace(/(^\s*")|("\s*$)/g, ""))
          .filter((s: string) => s.length > 0) ?? [];

      const fallbackInsight = locale === "en"
        ? "It sounds like you're carrying something that's hard to put into words."
        : "言葉にしにくい何かを、あなたは一人で抱えてきたのかもしれません。";
      const fallbackAdvice = locale === "en"
        ? "I'm struggling to express this clearly, but I want to be honest about how I'm feeling."
        : "私はうまく言葉にできていないけれど、この気持ちを正直に伝えたいと思っています。";
      const fallbackNextQ = locale === "en"
        ? ["What are you most afraid of?", "What do you truly want?", "Who are you carrying this for?"]
        : ["今いちばん怖いことは何か", "本当はどうしたいと思っているか", "誰のために頑張り続けているのか"];

      parsed = {
        insight: insightMatch?.[1] ?? fallbackInsight,
        doctor_advice: doctorMatch?.[1] ?? fallbackAdvice,
        next_questions: fallbackQuestions.length > 0 ? fallbackQuestions : fallbackNextQ,
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Invalid AI response shape." }, { status: 500, headers: cors });
    }

    const mergedNext = mergeFollowUpQuestions(parsed.next_questions ?? [], {
      group,
      typeCode,
      worryText,
      locale,
    });
    parsed = { ...parsed, next_questions: mergedNext };

    const elapsedMs = Date.now() - t0;
    if (process.env.NODE_ENV !== "production") {
      console.log("[chat] ok", { typeCode, group, locale, elapsedMs, followUps: mergedNext.length });
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
