// «Барыс ағай» 7-сабақ: «Ата-ананың сенімі: Қанат па, әлде ауыр жүк пе?»
// Shot bounds synced to audio words from audio-data.json
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;

// sh01: Barys at board: «АТА-АНАНЫҢ СЕНІМІ: ҚАНАТ ПА, ӘЛДЕ ЖҮК ПЕ? 🕊️ vs ⚖️»
B.sh01 = 0;
S.t1 = 0.35;

// sh02: Nurlybek: Wi-Fi, iPhone & angry mom!
B.sh02 = end("t1") + 0.08;
S.u1 = B.sh02 + 0.08;

// sh03: Barys: Parents' pure spotless trust, greatest driving force
B.sh03 = end("u1") + 0.10;
S.t2 = B.sh03 + 0.08;

// sh04: Nurlybek: Parents demand so much, nag about studying
B.sh04 = end("t2") + 0.08;
S.u2 = B.sh04 + 0.08;

// sh05: Barys: Pygmalion effect, move mountains vs broken wings
B.sh05 = end("u2") + 0.10;
S.t3 = B.sh05 + 0.08;

// sh06: Nurlybek: Touching story of F in math, dad said "I believe in you"
B.sh06 = end("t3") + 0.10;
S.u3 = B.sh06 + 0.08;

// sh07: Barys: Trust weighs 10x more than scolding, precious capital
B.sh07 = end("u3") + 0.10;
S.t4 = B.sh07 + 0.08;

// sh08: Nurlybek: What if we make a mistake and crack that trust?
B.sh08 = end("t4") + 0.08;
S.u4 = B.sh08 + 0.08;

// sh09: Barys: Trust is like a mirror / Kintsugi, honesty and persistent effort
B.sh09 = end("u4") + 0.10;
S.t5 = B.sh09 + 0.08;

// sh10: Nurlybek: I want to run home and thank my parents!
B.sh10 = end("t5") + 0.08;
S.u5 = B.sh10 + 0.08;

// sh11: Barys: Wings on your back, soar high and be their pride!
B.sh11 = end("u5") + 0.10;
S.t6 = B.sh11 + 0.08;

// sh12: End card: «Ал сен ата-анаңның сенімін сезінесің бе? Пікірге жаз!»
B.sh12 = end("t6") + 0.15;
S.n1 = B.sh12 + 0.10;

const END = end("n1") + 0.8;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].start);
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);
export const ce = (id: string) => sec(end(id));

export const ORDER = Array.from({ length: 12 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
export const CARD_AT = sec(B.sh12);

/** mouth animation */
export const talking = (id: string, f: number) => {
  const t = f / FPS - S[id];
  const cue = AUDIO[id];
  if (!cue || !cue.words) return false;
  for (const w of cue.words) {
    if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  }
  return false;
};
