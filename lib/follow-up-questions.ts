/** 診察後〜日常の内省用：短めのバリエーション */
export const FOLLOW_UP_VARIATIONS: string[] = [
  "いま一番しんどいのは、体ですか？気持ちですか？",
  "「これだけは譲れない」と感じている線はどこですか？",
  "誰かに誤解されたくない相手はいますか？",
  "本当は誰に一番、正直になりたいですか？",
  "休むことに、罪悪感はありますか？",
  "早く楽になりたい気持ちと、慎重になりたい気持ち、どちらが強いですか？",
  "説明を聞いても不安が残る理由は何だと思いますか？",
  "家族や職場に、どう見られたいと思っていますか？",
  "「まだ早い」と自分に言い聞かせていることはありますか？",
  "いちばん怖い未来のイメージは何ですか？",
  "先生にどんな言葉をかけてほしいですか？",
  "症状以外で、生活で困っていることはありますか？",
  "納得できるまで説明してほしい、と言えそうですか？",
  "誰かに代わりに伝えてほしいことがありますか？",
  "今日の目標を一つだけ決めるとしたら？",
];

/** 少し時間をかけて向き合う「本当に次に考えてみたい問い」 */
export const FOLLOW_UP_DEEP: string[] = [
  "もし周りの期待がすべて消えたとしたら、いちばん守りたいものは何ですか？",
  "その不安の奥に、どんな「大切にしている価値観」が隠れていると思いますか？",
  "幼いころの自分に、いま身についているクセは言えそうですか？",
  "「弱い自分」を認めたとき、何が一番怖いですか？",
  "誰にも見せていない本音を、一文だけ書くとしたら？",
  "いまの選択は、将来の自分へのどんなメッセージだと思いますか？",
  "もし対面で話せる相手が一人だけいいとしたら、誰に何を聞きたいですか？",
  "「申し訳なさ」の正体は、誰に向かっている気がしますか？",
  "治ることより、まず手放したい感覚はありますか？",
  "落ち着いたあと、どんな日常に戻りたいですか？",
  "人生の優先順位を三つだけ並べると、いまはどうなっていますか？",
  "自分への期待と、他人からの期待、どちらが重いですか？",
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * AIの問い・バリエーション・深い問いを重複なく混ぜる。
 * 並び: AI → 深い → 短い を交互に近い形で取り込む。
 */
export function mergeFollowUpQuestions(
  fromAi: string[],
  _ctx: { group: string; typeCode?: string }
): string[] {
  void _ctx;
  const ai = fromAi
    .map((s) => s.trim())
    .filter((q) => q.length > 0 && q.length <= 120);

  const vars = shuffle([...FOLLOW_UP_VARIATIONS]);
  const deep = shuffle([...FOLLOW_UP_DEEP]);

  const out: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (q: string | undefined) => {
    if (!q) return;
    const key = q.replace(/\s+/g, "");
    if (seen.has(key)) return;
    seen.add(key);
    out.push(q);
  };

  const maxOut = 6;
  let aiI = 0;
  let dI = 0;
  let vI = 0;
  let round = 0;

  while (out.length < maxOut && (aiI < ai.length || dI < deep.length || vI < vars.length)) {
    const r = round % 3;
    if (r === 0 && aiI < ai.length) {
      pushUnique(ai[aiI++]);
    } else if (r === 1 && dI < deep.length) {
      pushUnique(deep[dI++]);
    } else if (r === 2 && vI < vars.length) {
      pushUnique(vars[vI++]);
    } else {
      if (aiI < ai.length) pushUnique(ai[aiI++]);
      else if (dI < deep.length) pushUnique(deep[dI++]);
      else if (vI < vars.length) pushUnique(vars[vI++]);
    }
    round++;
    if (round > 48) break;
  }

  return out.slice(0, maxOut);
}
