// «Барыс ағай» 1-сабақ «2 + 2 = 5»: voice timing -> shot bounds (seconds and frames). Everything on screen is timed to
// these words (audio-data.json from scripts/prep-mg1.mjs).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;

B.sh01 = 0; // chalk writes «2 + 2 = 5», Barys turns round and points at the «5»
S.t1 = 0.75;
B.sh02 = end("t1") + 0.1; // the class (left column): «Ооо!»
B.sh03 = B.sh02 + 1.25; // back desk: Әлихан, diary with three «2»
S.n1 = B.sh03 + 0.1;
S.t2 = end("n1") + 0.3;
B.sh04 = S.t2 - 0.1; // Barys at his desk; the timer appears
S.n2 = end("t2") + 0.3;
B.sh05 = S.n2 - 0.1; // Томирис writes a page of formulas
S.o1 = end("n2") + 0.25; // «мүмкін емес қой!»
B.sh06 = end("o1") + 0.2; // insert: Әлихан lays out two pencils + two pencils (no words)
S.n3 = B.sh06 + 1.5;
B.sh07 = S.n3 - 0.1; // Санжар, phone under the desk
S.s1 = end("n3") + 0.25; // «интернетте жазылған!»
S.t3 = end("s1") + 0.3;
B.sh08 = S.t3 - 0.1; // Barys, flat-earth bubble
B.sh09 = end("t3") + 0.15; // right column laughs; Нұрлыбек gets up
S.n4 = B.sh09 + 1.0;
S.u1 = end("n4") + 0.2; // «Сіз — барыссыз!»
B.sh10 = end("u1") + 1.0; // (laugh) -> Barys straightens his glasses
S.n5 = B.sh10 + 0.1;
B.sh11 = S.n5 + AUDIO.n5.words[5].start - 0.12; // «Ал Әлихан...» — pencils counted
S.n6 = end("n5") + 0.35;
B.sh12 = S.n6 - 0.1; // timer 05:00, the left column; a hand goes up at the back
S.a1 = end("n6") + 0.3;
B.sh13 = S.a1 - 0.1; // Әлихан stands: «бұл қате... төрт»
S.n7 = end("a1") + 0.3;
B.sh14 = S.n7 - 0.1; // the class laughs, Әлихан hangs his head
B.sh15 = end("n7") + 0.25; // the journal: a red «5» stamped
S.t4 = B.sh15 + 1.05;
B.sh16 = S.t4 - 0.1; // Barys: «Ол дәлелдеді — бұл қате.»
S.n8 = end("t4") + 0.3;
B.sh17 = S.n8 - 0.1; // Әлихан beams, stars
B.sh18 = end("n8") + 0.3; // at the board: tap-tap, chalk handed over
B.sh19 = B.sh18 + 1.3; // board close-up: «5» struck out, «4» written, the motto
S.t5 = B.sh19 + 1.6;
B.sh20 = end("t5") + 0.35; // two-shot at the board
B.sh21 = B.sh20 + 1.6; // end card (DOM only): the question
S.n9 = B.sh21 + 0.35;
const END = end("n9") + 2.2;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].start);
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);
export const ce = (id: string) => sec(end(id));

export const ORDER = Array.from({ length: 21 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({ key: k, a: sec(B[k]), b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the end card is DOM only (no WebGL frames) */
export const CARD_AT = sec(B.sh21);

/** is someone speaking line `id` at frame f (mouth open on the voiced part of each word, ~7 Hz flap) */
export const talking = (id: string, f: number) => {
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  return false;
};
