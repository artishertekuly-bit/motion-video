// «Барыс ағай» Анонс: «ЖИ Видео Курсы (Телеграм)»: voice timing -> shot bounds.
// Everything on screen is timed to these words (audio-data.json from scripts/prep-mg4.mjs).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;

// 1. Nurlybek panicking at desk: «Ағай! Мынадай 3D мультик жасау үшін миллиондық компьютер керек шығар?!»
B.sh01 = 0;
S.u1 = 0.15;

// 2. Barys agai smirks: «Қой әрі, Нұрлыбек! Бүгінде мұның бәрін жасанды интеллект жасайды!»
B.sh02 = end("u1") + 0.06;
S.t1 = B.sh02 + 0.06;

// 3. 3D feature cards: «Сурет сала білудің де, монтаждың да керегі жоқ. Сценарий, 3D анимация, дауыс — бірнеше минутта дайын болады!»
B.sh03 = end("t1") + 0.06;
S.t2 = B.sh03 + 0.06;

// 4. Course announcement: «Мен осыны үйрететін авторлық КУРС дайындадым! Нөлден бастап тренд видео жасап, миллион қаралым жинайсыңдар!»
B.sh04 = end("t2") + 0.06;
S.t3 = B.sh04 + 0.06;

// 5. Telegram announcement: «Курстың барлық құпиялары, промпттары мен сабақтары Телеграм каналымда өтеді!»
B.sh05 = end("t3") + 0.06;
S.t4 = B.sh05 + 0.06;

// 6. Nurlybek jumps up: «Ағай, сілтеме қайда?!»
B.sh06 = end("t4") + 0.06;
S.u2 = B.sh06 + 0.06;

// 7. Barys CTA & End screen: «Сілтеме профильде! Дәл қазір жазылып үлгер, қалып қойма!»
B.sh07 = end("u2") + 0.06;
S.t5 = B.sh07 + 0.06;

const END = end("t5") + 0.3; // 29.39s strictly within 25-30s

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].start);
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);
export const ce = (id: string) => sec(end(id));

export const ORDER = ["sh01", "sh02", "sh03", "sh04", "sh05", "sh06", "sh07"];
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** Card transition trigger */
export const CARD_AT = sec(B.sh07) + 20;

/** is someone speaking line `id` at frame f */
export const talking = (id: string, f: number) => {
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  return false;
};
