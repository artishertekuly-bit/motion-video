// «Барыс ағай» 5-сабақ: «100 миллион әлде 1 теңге? (Экспоненциалды өсу)»:
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

// sh01: Barys at board: «100 000 000 ₸ vs 1 ₸ × 2»
B.sh01 = 0;
S.t1 = 0.5;

// sh02: Nurlybek in sunglasses flexes about black Gelik & doner
B.sh02 = end("t1") + 0.12;
S.u1 = B.sh02 + 0.1;

// sh03: Barys closeup with glasses gleam: «1 МИЛЛИАРД теңгеден айырылдың!»
B.sh03 = end("u1") + 0.15;
S.t2 = B.sh03 + 0.1;

// sh04: Nurlybek drops glasses: «Неге?! 1 теңге қалай көп болады?!»
B.sh04 = end("t2") + 0.12;
S.u2 = B.sh04 + 0.08;

// sh05: Board calculation: 1-to-10 days table (1₸ -> 512₸)
B.sh05 = end("u2") + 0.15;
S.t3 = B.sh05 + 0.1;

// sh06: Nurlybek laughing smugly: «1 донер де шықпайды ғой!»
B.sh06 = end("t3") + 0.12;
S.u3 = B.sh06 + 0.08;

// sh07: Board explosion: 20-30 days -> 1 073 741 823 ₸ !
B.sh07 = end("u3") + 0.15;
S.t4 = B.sh07 + 0.1;

// sh08: Chessboard & Indian King wheat legend
B.sh08 = end("t4") + 0.15;
S.t5 = B.sh08 + 0.1;

// sh09: Nurlybek heart attack / fainting / ambulance siren
B.sh09 = end("t5") + 0.15;
S.u4 = B.sh09 + 0.1;

// sh10: Barys homework × 2 twist
B.sh10 = end("u4") + 0.15;
S.t6 = B.sh10 + 0.1;

// sh11: Nurlybek panic scream: «Жоқ, ағай!»
B.sh11 = end("t6") + 0.12;
S.u5 = B.sh11 + 0.08;

// sh12: End card: «Ал сен қайсысын таңдар едің?»
B.sh12 = end("u5") + 0.3;
S.n1 = B.sh12 + 0.15;

const END = end("n1") + 1.6;

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
