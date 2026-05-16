/** 次の診察で聞きたいこと・伝えたいこと：短めのバリエーション */
export const FOLLOW_UP_VARIATIONS: string[] = [
  "先生に「もっと詳しく教えてください」と言えていますか？",
  "薬の副作用や飲み続ける期間を、正直に聞けていますか？",
  "次の診察で、一番聞きたいことは何ですか？",
  "「この治療、本当に必要ですか？」と聞いてみたいですか？",
  "先生に遠慮して、言えていないことがありますか？",
  "診察時間が短くて、全部話せないと感じますか？",
  "家族に病気のことをどこまで話すか、迷っていますか？",
  "体の変化を、具体的に言葉で伝えられていますか？",
  "治療の見通しや期間を、もっとはっきり聞きたいですか？",
  "「様子を見ましょう」と言われたとき、どう感じましたか？",
  "検査の結果を、正確に理解できていますか？",
  "先生に「不安です」と正直に伝えられていますか？",
  "症状以外に、日常生活で困っていることはありますか？",
  "セカンドオピニオンを考えたことはありますか？",
  "次の診察前に、メモしておきたいことはありますか？",
];

/** 少し時間をかけて向き合う、診察・治療に関わる深い問い */
export const FOLLOW_UP_DEEP: string[] = [
  "今の治療について、本当に納得していますか？それとも流されていますか？",
  "診察室で話せなかったことを、帰ってから後悔した経験はありますか？",
  "自分の体のことを、一番わかってほしい人は誰ですか？先生ですか、家族ですか？",
  "「完全に治る」ことと「うまく付き合っていく」こと、どちらを望んでいますか？",
  "病気や不調のことで、誰にも言えずにいることはありますか？",
  "次に先生に会うとき、どんな言葉をかけてもらえたら安心できますか？",
  "体の不調が続くなか、自分なりに工夫していることはありますか？",
  "先生との信頼関係に、満足していますか？",
  "「もっと早く受診すればよかった」と思ったことはありますか？",
  "体のケアより、気持ちのケアの方が今は必要だと感じますか？",
  "治療を続けるモチベーションになっているものは何ですか？",
  "家族や職場に、体のことをどう説明するか決まっていますか？",
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
