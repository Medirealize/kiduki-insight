/** 日常の場面で「言えずにいること」のバリエーション */
export const FOLLOW_UP_VARIATIONS: string[] = [
  "上司に仕事量が多すぎると伝えたいのに、言い出せない",
  "パートナーへの不満があるけど、傷つけたくて言えない",
  "親に感謝しているけど、素直に伝えるのが恥ずかしい",
  "友人に違和感を感じているけど、うまく言葉にできない",
  "先生に聞きたいことがあるのに、診察室では言えなかった",
  "相手を怒らせたくないから、ずっと我慢してしまう",
  "自分の気持ちより相手のことを優先してしまう",
  "誰かに頼ることに、罪悪感を感じることがある",
  "自分でも何が嫌なのか、わからなくなってきた",
  "言いたいことが頭にあるのに、口に出すと違う言葉になる",
  "我慢していることが、じわじわ積み重なっている気がする",
  "相手の反応が怖くて、踏み出せないでいる",
  "この気持ちは、わがままなのだろうかと思う",
  "謝りたいのに、どう切り出せばいいかわからない",
  "もっと早く気づけばよかったと後悔している",
];

/** 気持ちの奥にある本音を探る深い問いかけ */
export const FOLLOW_UP_DEEP: string[] = [
  "もし遠慮しなくていいとしたら、何を伝えたいですか？",
  "この気持ちを一番わかってほしい人は、誰ですか？",
  "言えなかったことで、後悔していることはありますか？",
  "本当はどうなってほしいと思っていますか？",
  "あなたが一番傷ついたのは、どの瞬間でしたか？",
  "この状況が続いたら、どうなると思いますか？",
  "相手に伝えることで、何が変わってほしいですか？",
  "自分の気持ちに名前をつけるとしたら、何ですか？",
  "誰かに助けを求めていいと感じたことはありますか？",
  "この気持ちを抱えていることを、誰かに知ってほしいですか？",
  "自分のことを後回しにしてきた、と感じることがありますか？",
  "「こう言ったら嫌われるかも」と思って黙ったことはありますか？",
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function bigramOverlap(a: string, b: string): number {
  const clean = (s: string) => s.replace(/[。、？！\s　]/g, "");
  const ca = clean(a);
  const cb = clean(b);
  if (ca.length < 3 || cb.length < 3) return 0;
  const getBigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const aBg = getBigrams(ca);
  const bBg = getBigrams(cb);
  let common = 0;
  for (const bg of aBg) { if (bBg.has(bg)) common++; }
  return aBg.size > 0 ? common / aBg.size : 0;
}

export function mergeFollowUpQuestions(
  fromAi: string[],
  ctx: { group: string; typeCode?: string; worryText?: string }
): string[] {
  const { worryText = "" } = ctx;

  const ai = fromAi
    .map((s) => s.trim())
    .filter((q) => q.length > 0 && q.length <= 120)
    .filter((q) => bigramOverlap(q, worryText) < 0.5);

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
  let aiI = 0, dI = 0, vI = 0, round = 0;

  while (out.length < maxOut && (aiI < ai.length || dI < deep.length || vI < vars.length)) {
    const r = round % 3;
    if (r === 0 && aiI < ai.length) pushUnique(ai[aiI++]);
    else if (r === 1 && dI < deep.length) pushUnique(deep[dI++]);
    else if (r === 2 && vI < vars.length) pushUnique(vars[vI++]);
    else {
      if (aiI < ai.length) pushUnique(ai[aiI++]);
      else if (dI < deep.length) pushUnique(deep[dI++]);
      else if (vI < vars.length) pushUnique(vars[vI++]);
    }
    round++;
    if (round > 48) break;
  }

  return out.slice(0, maxOut);
}
