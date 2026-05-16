/** 患者が先生に直接聞きたいこと：短めのバリエーション */
export const FOLLOW_UP_VARIATIONS: string[] = [
  "この薬はいつまで飲み続ければいいですか？",
  "血液検査が必要な理由を教えてください",
  "この症状はいつ頃よくなりますか？",
  "副作用が出たときはどうすればいいですか？",
  "仕事にはいつから戻れますか？",
  "自宅でできる対処法を教えてください",
  "食事や生活で気をつけることはありますか？",
  "この検査は何を調べているのですか？",
  "市販の薬を飲んでも大丈夫ですか？",
  "次の診察はいつ来ればいいですか？",
  "もっとわかりやすく説明してもらえますか？",
  "家族にはどう説明すればいいですか？",
  "今の状態はどのくらい深刻ですか？",
  "痛みを和らげる方法はありますか？",
  "運動や入浴は続けても大丈夫ですか？",
];

/** 患者が先生に聞きにくいけれど、本当は聞きたいこと */
export const FOLLOW_UP_DEEP: string[] = [
  "他の治療法や選択肢はありますか？",
  "手術は本当に必要ですか？",
  "セカンドオピニオンを受けてもいいですか？",
  "治療しなかった場合、どうなりますか？",
  "この治療で本当によくなりますか？",
  "完治できますか？それとも長く付き合うことになりますか？",
  "入院が必要になる可能性はありますか？",
  "費用の負担が少ない治療法はありますか？",
  "専門の病院に紹介してもらえますか？",
  "子どもや家族への影響はありますか？",
  "精神的なつらさも、先生に相談していいですか？",
  "同じような症状の方は、どうなることが多いですか？",
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
  const INTROSPECTIVE_PATTERNS = [
    /誰に伝え/, /抵抗はあり/, /口に出す/, /なぜ言え/, /気持ちはどう/,
    /誰に相談/, /自分の不調を誰/, /誰をがっかり/, /ごめんね/, /1人きり/,
    /申し訳/, /弱い自分/, /本音を/, /価値観/, /人生の優先/,
  ];

  const ai = fromAi
    .map((s) => s.trim())
    .filter((q) => q.length > 0 && q.length <= 120)
    .filter((q) => !INTROSPECTIVE_PATTERNS.some((p) => p.test(q)));

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
