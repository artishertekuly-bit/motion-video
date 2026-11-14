// «Барыс ағай» 6-сабақ: «Троя аты: 10 жылдық қамалды 1 сыйлық қалай құлатты?»
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

// sh01: Barys at board: «ТРОЯ: 10 ЖЫЛ vs 1 АҒАШ АТ 🎁»
B.sh01 = 0;
S.t1 = 0.5;

// sh02: Nurlybek: drones & cannons!
B.sh02 = end("t1") + 0.12;
S.u1 = B.sh02 + 0.1;

// sh03: Barys: 3200 years ago no drones, giant wooden horse left as "gift"
B.sh03 = end("u1") + 0.15;
S.t2 = B.sh03 + 0.1;

// sh04: Nurlybek: free giant toy, wants to take selfie
B.sh04 = end("t2") + 0.12;
S.u2 = B.sh04 + 0.08;

// sh05: Barys: Trojans partied and fell asleep
B.sh05 = end("u2") + 0.15;
S.t3 = B.sh05 + 0.1;

// sh06: Nurlybek: Did they bring another gift the next day?
B.sh06 = end("t3") + 0.12;
S.u3 = B.sh06 + 0.08;

// sh07: Barys: Greek soldiers crept out at midnight, opened gates, destroyed city!
B.sh07 = end("u3") + 0.15;
S.t4 = B.sh07 + 0.1;

// sh08: Nurlybek shock: Trojan virus named after this?!
B.sh08 = end("t4") + 0.15;
S.u4 = B.sh08 + 0.1;

// sh09: Barys lesson: Beware of Greeks bearing gifts! Don't click iPhone links!
B.sh09 = end("u4") + 0.15;
S.t5 = B.sh09 + 0.1;

// sh10: Nurlybek: Yesterday I got SMS saying I won 1 million... that's Greeks?!
B.sh10 = end("t5") + 0.15;
S.u5 = B.sh10 + 0.1;

// sh11: End card: «Ал сен бейтаныс сыйлықтарға сенесің бе?»
B.sh11 = end("u5") + 0.25;
S.n1 = B.sh11 + 0.15;

const END = end("n1") + 1.4;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].start);
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);
export const ce = (id: string) => sec(end(id));

export const ORDER = Array.from({ length: 11 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
export const CARD_AT = sec(B.sh11);

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
