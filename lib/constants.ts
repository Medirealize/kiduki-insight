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
    { text: "物事を決めるとき、まず自分で納得したい方ですか？", A: "はい、納得してから決めたい", B: "いいえ、周りの意見も大切", focusA: "precision", focusB: "decision_support" },
    { text: "説明や根拠がはっきりしていると、安心しますか？", A: "はい、はっきりしていると安心", B: "いいえ、気持ちが分かれば十分なことも", focusA: "rational_assurance", focusB: "support" },
    { text: "自分のペースで進めたい気持ちは強いですか？", A: "はい、自分のペースを大切に", B: "いいえ、合わせることも多い", focusA: "self_reliance", focusB: "relationship" },
  ],
  1: [
    { text: "気持ちを分かってもらえたら、楽になると感じますか？", A: "はい、分かってもらえると楽", B: "いいえ、解決策の方が大事", focusA: "support", focusB: "efficiency" },
    { text: "周りの人に心配をかけたくないと感じますか？", A: "はい、心配をかけたくない", B: "いいえ、まず自分のこと", focusA: "family_responsibility", focusB: "self_control" },
    { text: "先生と「一緒に」考える感じは好きですか？", A: "はい、一緒に考えてほしい", B: "いいえ、結論を教えてほしい", focusA: "decision_support", focusB: "strategy" },
  ],
  2: [
    { text: "仕事や役割への影響が、気になりますか？", A: "はい、仕事への影響が気になる", B: "いいえ、まず体のことが中心", focusA: "social_role", focusB: "symptom_analysis" },
    { text: "見通しや計画が立つと、落ち着きますか？", A: "はい、見通しが欲しい", B: "いいえ、今の対処が先", focusA: "future_planning", focusB: "practical_question" },
    { text: "周囲に迷惑をかけないよう、自分で何とかしたいと思いますか？", A: "はい、自分で対処したい", B: "いいえ、頼ることも大切", focusA: "responsibility", focusB: "support" },
  ],
};
