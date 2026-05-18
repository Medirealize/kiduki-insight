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

export const AXIS_QUESTIONS: Record<0 | 1 | 2, AxisQuestion[]> = {
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
