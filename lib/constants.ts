import type { PersonalityGroup } from "./personality";

export const TOTAL_STEPS = 7; // ①属性 ②悩み ③Q1 ④Q2 ⑤Q3 ⑥解析演出 ⑦結果

export const GROUP_TO_AXIS_INDEX: Record<PersonalityGroup, 0 | 1 | 2> = {
  "自分軸": 0,
  "相手軸": 1,
  "社会軸": 2,
};

type AxisQuestion = {
  text: string;
  A: string;
  B: string;
  focusA: string;
  focusB: string;
};

type LocaleQuestions = Record<0 | 1 | 2, AxisQuestion[]>;

export const AXIS_QUESTIONS: LocaleQuestions = {
  // 自分軸：論理・納得を重視するタイプ
  0: [
    {
      text: "誰かに気持ちを伝えるとき、まず自分の中で整理してから話したいですか？",
      A: "はい、頭の中で順序立ててから話したい",
      B: "いいえ、話しながら気持ちを整理する方が自然",
      focusA: "precision", focusB: "decision_support",
    },
    {
      text: "相手の言葉より、具体的な状況や事実の説明がある方が納得できますか？",
      A: "はい、根拠や理由がわかると安心できる",
      B: "いいえ、相手の気遣いや気持ちの方が大切",
      focusA: "rational_assurance", focusB: "support",
    },
    {
      text: "気持ちを伝えるとき、感情的にならず冷静に話したいと思う方ですか？",
      A: "はい、感情より内容を正確に伝えたい",
      B: "いいえ、感情もそのまま受け取ってほしい",
      focusA: "self_reliance", focusB: "relationship",
    },
  ],
  // 相手軸：共感・つながりを重視するタイプ
  1: [
    {
      text: "気持ちを打ち明けたとき「それは大変だったね」と共感してもらえると楽になりますか？",
      A: "はい、共感されるだけでだいぶ楽になる",
      B: "いいえ、それより「どうすればいいか」を一緒に考えてほしい",
      focusA: "support", focusB: "efficiency",
    },
    {
      text: "自分のことを話すとき、相手に負担や心配をかけてしまうことが気になりますか？",
      A: "はい、迷惑をかけていないかとても気になる",
      B: "いいえ、まず自分の気持ちを優先したい",
      focusA: "family_responsibility", focusB: "self_control",
    },
    {
      text: "一人で結論を出すより、誰かと一緒に考えながら決めたいですか？",
      A: "はい、一緒に考えてほしい、一人では心細い",
      B: "いいえ、最終的には自分で判断したい",
      focusA: "decision_support", focusB: "strategy",
    },
  ],
  // 社会軸：役割・影響を重視するタイプ
  2: [
    {
      text: "自分の気持ちより先に、周りの人や仕事への影響が気になってしまいますか？",
      A: "はい、周りへの影響がまず心配になる",
      B: "いいえ、まず自分の気持ちを優先したい",
      focusA: "social_role", focusB: "symptom_analysis",
    },
    {
      text: "相手に何かを伝えるとき、この先どうなるかの見通しがわかると動きやすいですか？",
      A: "はい、見通しがわかると計画が立てられる",
      B: "いいえ、今この瞬間どうするかを先に知りたい",
      focusA: "future_planning", focusB: "practical_question",
    },
    {
      text: "気持ちがつらくても、周りに心配をかけないよう自分で抱えようとしますか？",
      A: "はい、できることは自分でやってしまいたい",
      B: "いいえ、つらいときは人に頼ることも大切",
      focusA: "responsibility", focusB: "support",
    },
  ],
};

export const AXIS_QUESTIONS_EN: LocaleQuestions = {
  // Self-axis: values logic and conviction
  0: [
    {
      text: "When sharing your feelings with someone, do you prefer to organize your thoughts first before speaking?",
      A: "Yes, I like to structure things in my head before I talk",
      B: "No, I naturally sort out my feelings as I speak",
      focusA: "precision", focusB: "decision_support",
    },
    {
      text: "Does having concrete facts and explanations help you feel more at ease than just words of reassurance?",
      A: "Yes, knowing the reasoning makes me feel secure",
      B: "No, I value the other person's care and feelings more",
      focusA: "rational_assurance", focusB: "support",
    },
    {
      text: "When expressing your feelings, do you prefer to stay calm and composed rather than emotional?",
      A: "Yes, I'd rather communicate content clearly than show emotion",
      B: "No, I want the other person to receive my emotions as-is",
      focusA: "self_reliance", focusB: "relationship",
    },
  ],
  // Other-axis: values empathy and connection
  1: [
    {
      text: "When you open up, does hearing \"that must have been hard for you\" bring you relief?",
      A: "Yes, being understood alone makes a big difference",
      B: "No, I'd rather have someone think through what to do with me",
      focusA: "support", focusB: "efficiency",
    },
    {
      text: "When talking about yourself, do you worry about burdening or worrying the other person?",
      A: "Yes, I'm very concerned about being a bother",
      B: "No, I want to prioritize my own feelings first",
      focusA: "family_responsibility", focusB: "self_control",
    },
    {
      text: "Do you prefer working through decisions with someone rather than reaching conclusions alone?",
      A: "Yes, I want someone to think it through with me — it feels lonely alone",
      B: "No, ultimately I want to make my own judgment",
      focusA: "decision_support", focusB: "strategy",
    },
  ],
  // Social-axis: values role and impact
  2: [
    {
      text: "Do you find yourself worrying about the impact on others or your work before focusing on your own feelings?",
      A: "Yes, I'm concerned about the effect on those around me first",
      B: "No, I want to prioritize my own feelings first",
      focusA: "social_role", focusB: "symptom_analysis",
    },
    {
      text: "Does knowing what will happen next help you take action when communicating something to someone?",
      A: "Yes, having a clear outlook lets me make a plan",
      B: "No, I want to know what to do right now first",
      focusA: "future_planning", focusB: "practical_question",
    },
    {
      text: "Even when you're struggling emotionally, do you tend to carry it yourself rather than worry others?",
      A: "Yes, I prefer to handle what I can on my own",
      B: "No, I think it's okay to rely on others when things are hard",
      focusA: "responsibility", focusB: "support",
    },
  ],
};

export function getAxisQuestions(locale: string): LocaleQuestions {
  return locale === "en" ? AXIS_QUESTIONS_EN : AXIS_QUESTIONS;
}
