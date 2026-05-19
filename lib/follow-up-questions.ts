/** 日常の場面で「言えずにいること」のバリエーション（日本語） */
export const FOLLOW_UP_VARIATIONS_JA: string[] = [
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

/** 気持ちの奥にある本音を探る深い問いかけ（日本語） */
export const FOLLOW_UP_DEEP_JA: string[] = [
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

/** Situational prompts for things left unsaid (English) */
export const FOLLOW_UP_VARIATIONS_EN: string[] = [
  "I want to tell my boss I'm overloaded, but I can't bring myself to say it",
  "I have frustrations with my partner but don't want to hurt them",
  "I'm grateful to my parents but feel embarrassed to say it directly",
  "Something feels off with a friend, but I can't find the words",
  "There was something I wanted to ask my doctor but froze in the appointment",
  "I keep holding back because I don't want to make them angry",
  "I end up prioritizing others over my own feelings",
  "I sometimes feel guilty about asking for help",
  "I've lost track of what it is that's bothering me",
  "The words are in my head but come out differently when I speak",
  "Things I've been putting up with are quietly piling up",
  "Fear of their reaction is holding me back",
  "I wonder if what I'm feeling is just selfish",
  "I want to apologize but don't know how to bring it up",
  "I regret not noticing sooner",
];

/** Deep reflection prompts for uncovering true feelings (English) */
export const FOLLOW_UP_DEEP_EN: string[] = [
  "If you didn't have to hold back, what would you want to say?",
  "Who do you most want to understand this feeling?",
  "Is there something left unsaid that you regret?",
  "What outcome do you actually hope for?",
  "What was the moment you felt most hurt?",
  "What do you think will happen if this continues?",
  "What would you want to change by telling them?",
  "If you gave this feeling a name, what would it be?",
  "Have you ever felt that it's okay to ask someone for help?",
  "Is there someone you want to know you're carrying this?",
  "Do you feel like you've been putting yourself last?",
  "Have you ever stayed quiet thinking \"they might dislike me for this\"?",
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
  ctx: { group: string; typeCode?: string; worryText?: string; locale?: string }
): string[] {
  const { worryText = "", locale = "ja" } = ctx;

  const variations = locale === "en" ? FOLLOW_UP_VARIATIONS_EN : FOLLOW_UP_VARIATIONS_JA;
  const deep = locale === "en" ? FOLLOW_UP_DEEP_EN : FOLLOW_UP_DEEP_JA;

  const ai = fromAi
    .map((s) => s.trim())
    .filter((q) => q.length > 0 && q.length <= 120)
    .filter((q) => bigramOverlap(q, worryText) < 0.5);

  const vars = shuffle([...variations]);
  const deepShuffled = shuffle([...deep]);

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

  while (out.length < maxOut && (aiI < ai.length || dI < deepShuffled.length || vI < vars.length)) {
    const r = round % 3;
    if (r === 0 && aiI < ai.length) pushUnique(ai[aiI++]);
    else if (r === 1 && dI < deepShuffled.length) pushUnique(deepShuffled[dI++]);
    else if (r === 2 && vI < vars.length) pushUnique(vars[vI++]);
    else {
      if (aiI < ai.length) pushUnique(ai[aiI++]);
      else if (dI < deepShuffled.length) pushUnique(deepShuffled[dI++]);
      else if (vI < vars.length) pushUnique(vars[vI++]);
    }
    round++;
    if (round > 48) break;
  }

  return out.slice(0, maxOut);
}

// 後方互換エイリアス
export const FOLLOW_UP_VARIATIONS = FOLLOW_UP_VARIATIONS_JA;
export const FOLLOW_UP_DEEP = FOLLOW_UP_DEEP_JA;
