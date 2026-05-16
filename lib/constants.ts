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
  0: [
    {
      text: "体のことや治療について、まず自分でしっかり理解・納得してから決めたいですか？",
      A: "はい、理由や根拠がわかってから決めたい",
      B: "いいえ、先生や家族に相談しながら決めたい",
      focusA: "precision", focusB: "decision_support",
    },
    {
      text: "先生から説明を受けるとき、具体的な数値やデータがあると安心しますか？",
      A: "はい、数値や根拠があると落ち着く",
      B: "いいえ、気持ちに寄り添う言葉の方が大事",
      focusA: "rational_assurance", focusB: "support",
    },
    {
      text: "体調のことは、できるだけ自分のペースで整理して、自分なりに納得してから動きたいですか？",
      A: "はい、自分で理解してから動きたい",
      B: "いいえ、信頼できる人に任せる方が楽なことも",
      focusA: "self_reliance", focusB: "relationship",
    },
  ],
  1: [
    {
      text: "先生や家族に「大変だったね」と気持ちをわかってもらえると、ほっとしますか？",
      A: "はい、気持ちをわかってもらえるだけで楽になる",
      B: "いいえ、それより「どうすればいいか」を教えてほしい",
      focusA: "support", focusB: "efficiency",
    },
    {
      text: "自分が体調を崩したとき、家族や周りの人に心配をかけてしまうことが、つらいですか？",
      A: "はい、迷惑をかけてしまうことがとても気になる",
      B: "いいえ、まずは自分の回復を優先したい",
      focusA: "family_responsibility", focusB: "self_control",
    },
    {
      text: "先生に「どうしたいですか？」と一緒に考えてもらいながら、治療を進めたいですか？",
      A: "はい、一緒に考えてほしい、一人では決めたくない",
      B: "いいえ、先生に判断を任せて結論だけ教えてほしい",
      focusA: "decision_support", focusB: "strategy",
    },
  ],
  2: [
    {
      text: "体の不調そのものより、仕事や日常の役割への影響の方が気になりますか？",
      A: "はい、仕事や役割への影響がまず心配",
      B: "いいえ、まずは体のこと自体をどうにかしたい",
      focusA: "social_role", focusB: "symptom_analysis",
    },
    {
      text: "治療の見通し（いつ頃よくなるか・どのくらいかかるか）が早めにわかると、動きやすいですか？",
      A: "はい、見通しがわかると計画が立てられる",
      B: "いいえ、今この瞬間の対処法を先に知りたい",
      focusA: "future_planning", focusB: "practical_question",
    },
    {
      text: "体調が悪くても、周りに迷惑をかけないよう、できることは自分でやってしまいたいですか？",
      A: "はい、なるべく自分で何とかしたい",
      B: "いいえ、必要なら人に頼ることも大事だと思う",
      focusA: "responsibility", focusB: "support",
    },
  ],
};
