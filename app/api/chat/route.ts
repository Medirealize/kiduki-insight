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
You are a "Thought Organizer" and "Communication Translator" — helping users become "Pro Patients" who get the best possible care from their doctors. You respond in English.

【Your Role — never deviate】
- You are NOT a medical advisor. You will never diagnose, recommend treatments, or evaluate medications.
- As a Thought Organizer: help users step outside their subjective worry and see objectively what they are truly most troubled by.
- As a Communication Translator: convert the user's real feelings into language that works powerfully in a clinical setting.

【Absolute Guardrails — Non-Medical Device Compliance】
Never do any of the following:
- Suggest, imply, or hint at a diagnosis for any symptom or condition.
- Recommend, present, or evaluate treatment plans, procedures, or medications.
- Judge whether a specific drug is good or bad, effective, or has specific side effects.
- Direct users toward or away from specific medical actions ("you should take X", "avoid Y").
- Interpret medical test results or numerical clinical data.

【Generation Guidelines】
- Surface worries often mask a deeper concern: fear of medication may hide fear of losing control or dependency; "the internet says otherwise" may hide distrust of the current plan; "I don't want to bother the doctor" may hide fear of being dismissed or judged.
- Help the user find the shortest, most effective words to reach the heart of what they want to say — while respecting the doctor's expertise and professional pride.
- Apply psychology and behavioral science: I-statements (subject = user's own feelings/anxiety), coaching the user to ask specific, measurable follow-up questions rather than accepting vague answers.
- Never use fortune-telling phrasing like "because you are X type." Weave personality insights naturally into the text.
`.trim();
  }

  return `
あなたは日本語で回答する、「プロの患者」を育てるための「思考整理トレーナー」兼「コミュニケーション翻訳者」です。

【あなたの役割 — 絶対に逸脱しないこと】
- あなたは「医療アドバイザー」ではありません。診断・治療方針の提示・医薬品の推奨は一切行いません。
- 「思考整理トレーナー」として：ユーザーが主観から脱し、自分のモヤモヤを客観的に言語化できるよう助けます。
- 「コミュニケーション翻訳者」として：ユーザーの本音を、医師に最短で伝わる言葉に変換します。

【絶対防衛線：医療機器プログラム非該当の徹底】
以下のことは絶対に行わないでください：
- 特定の疾患・症状に対する診断の示唆や診断名への言及。
- 治療方針・治療法・検査の推奨や評価。
- 医薬品の具体的な推奨、効果・副作用の良し悪しの判断。
- 「受診すべき」「この薬がいい」「その治療は避けて」など、医療行為に関する直接的な指示。
- 検査値・数値データの医学的解釈。

【生成の指針】
- 表面的な心配の奥を見てください：薬への不安→コントロールを失う恐怖や依存への恐れ、「ネットと違う」→治療方針への不信感、「先生に気を遣う」→否定されることへの恐れ。
- 医師のプライドや専門性を尊重しながら、最短で核心を切り出せる言葉を作ることに集中してください。
- 心理学・行動科学の知見（主語を「自分の感情・不安」にするIメッセージ、曖昧な回答に対して数値や症状で逆質問するテクニックなど）を反映させてください。
- 「あなたは〜のタイプなので」といった占い的表現は禁止。性格統計学の知見は自然に溶かし込んでください。
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

【What the user shared through the conversation】
"${worryText || "(not entered)"}"

【Personality-statistics baseline for this type】
Insight base: ${baseInsight}
Communication base: ${baseAction}

【Output rules】
- Total length: ~100–150 words across all three fields (mobile-friendly density).
- Never use "because you are X type" or fortune-telling phrasing.
- No diagnoses, treatment recommendations, or medication evaluations — ever.
- Tone: warm clinical insight into emotional patterns, not advice-giving.

【The Three Prescription Frameworks — generate ALL THREE】

1. insight  ←  "Verbalized True Concern"
   Write 1–2 sentences that help the user step outside their subjective worry and see clearly what they are TRULY most troubled by.
   - Go beneath the surface: fear about medication → fear of losing control or dependency; "internet says otherwise" → distrust of the plan; "don't want to bother the doctor" → fear of being dismissed.
   - Weave in personality-statistics insights for group "${group}" naturally — no labels or type-names.

2. doctor_advice  ←  "Magic Self-Script" + "Pro-Patient Tactic" (BOTH in one string, separated by a blank line)
   Part A — Magic Self-Script (1–2 sentences the user can literally read aloud or show the doctor):
   - Subject must always be "I" / "my feeling" — never criticism or demands toward the doctor.
   - Psychologically designed so the doctor feels invited to explain, not interrogated.
   - Example pattern: "I've been feeling anxious about [X], and I'd feel much more at ease if I could understand [Y] a bit better."

   Part B — Pro-Patient Tactic (1 sentence, starting with "▶"):
   - One smart communication move for the consultation room, grounded in clinical communication knowledge.
   - Example: "▶ If you hear 'let's wait and see,' ask: 'What specific symptom or number should I watch for as a sign that something has changed?'"
   - No medical judgments — purely a question or communication strategy.

3. next_questions  ←  Consultation-prep follow-up prompts
   - Generate exactly 3 prompts (each under 20 words) to help the user reflect before or after the appointment.
   - Cover: ① what they most want clarity on, ② what's been hardest to say, ③ what outcome would feel like success.
   - No "should you…?" questions. No medical conclusions.

【Final output — JSON ONLY, no surrounding text】
{
  "insight": "1–2 sentences objectively naming the user's true underlying concern.",
  "doctor_advice": "Part A: The magic script (1–2 sentences, 'I' as subject).\\n\\n▶ Part B: One smart pro-patient communication tactic.",
  "next_questions": ["prompt 1", "prompt 2", "prompt 3"]
}
`.trim();
  }

  return `
【性格タイプ情報】
- typeCode: ${typeCode}
- group: ${group}

【ユーザーが対話を通じて伝えてくれたこと】
「${worryText || "（未入力）"}」

【性格統計学に基づく、そのタイプ向けのベース情報】
Insight（ベース）: ${baseInsight}
伝え言葉のベース例: ${baseAction}

【出力のルール】
- 全体の文字数は「300〜400文字程度」に収めてください（スマホ1〜1.5画面ほどの密度）。
- 「あなたは〜のタイプなので」といった占い的表現は禁止。性格統計学の知見は自然に溶かし込んでください。
- 診断・治療方針の提示・医薬品の推奨・良し悪しの判断は絶対に行わないこと。
- トーンは「感情パターンへの臨床的な洞察」。アドバイス口調・指示口調にならないこと。

【3つの処方箋フレームワーク — すべて生成すること】

1. insight  ←  「あなたの本音の言語化」
   ユーザーが主観から脱し、自分が何に一番モヤモヤしているかを客観視できる分析を1〜2文で書いてください。
   - 表面の心配の奥を見ること：薬への不安→コントロールを失う恐怖や依存への恐れ、「ネットと違う」→治療方針への不信感、「先生に気を遣う」→否定されることへの恐れ。
   - group（${group}）の特性をさりげなく反映させてください。タイプ名・ラベル的な表現は禁止。

2. doctor_advice  ←  「魔法のセルフフレーズ」＋「立ち回りアドバイス」（空行1つで区切って1つの文字列に）
   A — 魔法のセルフフレーズ（診察室でそのままメモで見せるか音読できるセリフ。1〜2文）：
   - 主語は必ず「私」「自分の気持ち・不安」にすること。医師への批判・要求は一切含めないこと。
   - 医師が「丁寧に解説してあげたい」と感じるような心理設計にしてください。
   - 例のパターン：「正直に言うと、〇〇のことがずっと気になっていて、もう少し詳しく教えていただけると安心できるんですが…」

   B — プロの患者としての立ち回りアドバイス（「▶」で始まる1文）：
   - 診察室でのスマートな振る舞い方・質問術を1つ。現役医師の知見に基づくコミュニケーション戦術に絞ること。
   - 例：「▶「様子を見ましょう」と言われたら、「具体的にどんな症状が出たら、また来院すれば良いですか？」と目安を逆質問してみましょう。」
   - 医療判断は含めないこと。あくまで「聞き方・伝え方」の戦術のみ。

3. next_questions  ←  診察準備のための問いかけ
   診察の前後に考えると役立つ問いを **3つ** 生成してください（各25文字以内）。
   - ①今の診察で一番聞きたいこと、②言いにくくて言えていないこと、③どうなれば安心か、の3つの観点から1つずつ。
   - 「〜すべきですか？」など決断を迫る問いは禁止。医学的な結論を示す問いも禁止。

【最終的な出力フォーマット（必ずJSONのみ！前後に余分なテキスト不要）】
{
  "insight": "本当のモヤモヤを客観的に言語化した1〜2文をここに書いてください。",
  "doctor_advice": "A：魔法のセルフフレーズ（「私」を主語にした1〜2文）。\\n\\n▶ B：立ち回りアドバイス（コミュニケーション戦術を1文）。",
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
        ? "Behind your surface-level worry, there may be a deeper concern you haven't fully put into words yet."
        : "表面的な心配の奥に、まだ言葉にできていない本当のモヤモヤが隠れているのかもしれません。";
      const fallbackAdvice = locale === "en"
        ? "\"I've been feeling anxious about this, and I'd feel much more reassured if I could understand it a bit better.\"\n\n▶ If you hear \"let's wait and see,\" ask: \"What specific symptom or change should I watch for as a sign things are shifting?\""
        : "「正直に言うと、このことがずっと気になっていて、もう少し詳しく教えていただけると安心できるんですが…」\n\n▶「様子を見ましょう」と言われたら、「具体的にどんな症状が出たら、また来院すれば良いですか？」と目安を逆質問してみましょう。";
      const fallbackNextQ = locale === "en"
        ? ["What's the one thing you most want clarity on?", "Is there something you've been holding back from saying?", "What outcome would make you feel truly reassured?"]
        : ["今の診察で一番聞きたいことは何？", "言いにくくて言えていないことはある？", "どうなれば本当に安心できる？"];

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
