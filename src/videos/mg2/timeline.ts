// «Барыс ағай» 2-сабақ «10 ҚАТЕ = 5»: voice timing -> shot bounds (seconds and frames). Everything on screen is timed to
// these words (audio-data.json from scripts/prep-mg2.mjs).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;

B.sh01 = 0; // chalk writes «10 ҚАТЕ = 5», Barys turns round and points at the «5»
S.t1 = 0.7;
B.sh02 = end("t1") + 0.08; // Нұрлыбек jumps up: «Алақай! Мен бұл күнге бірінші сыныптан бері дайындалдым!»
S.u1 = B.sh02 + 0.08;
B.sh03 = end("u1") + 0.1; // class laughs; back desk: Әлихан, diary
S.n1 = B.sh03 + 0.7;
S.t2 = end("n1") + 0.2;
B.sh04 = S.t2 - 0.08; // Barys at his desk; timer «10:00» appears
S.n2 = end("t2") + 0.2;
B.sh05 = S.n2 - 0.08; // Нұрлыбек marks answers blindly: «Су неше градуста қайнайды? Жүз деп жаза салайын!»
S.u2 = end("n2") + 0.15;
B.sh06 = end("u2") + 0.1; // Нұрлыбек accidentally gets «100°C ✔ ДҰРЫС! → 2»
S.n3 = B.sh06 + 0.25;
S.n4 = end("n3") + 0.2;
B.sh07 = S.n4 - 0.08; // Томирис writes, her hand keeps writing right answers
S.o1 = end("n4") + 0.18;
B.sh08 = S.o1 - 0.08; // Томирис: «қолым өзі дұрыс жаза береді!»
S.n5 = end("o1") + 0.7; // (laugh) -> Санжар searches on phone
B.sh09 = S.n5 - 0.08; // Санжар with phone & book
S.s1 = end("n5") + 0.18; // «Дұрысын білмесем, қалай қате жазамын?!»
B.sh10 = end("s1") + 0.15; // Barys straightens his glasses & smirks
S.n6 = B.sh10 + 0.08;
B.sh11 = S.n6 + AUDIO.n6.words[5].start - 0.1; // «Ал Әлихан...» — reading the textbook carefully
S.n7 = end("n6") + 0.22;
B.sh12 = S.n7 - 0.08; // timer «01:00», ticking; Әлихан raises his hand at the back
S.a1 = end("n7") + 0.2;
B.sh13 = S.a1 - 0.08; // Әлихан stands up with «10 / 10 ҚАТЕ!»
S.s2 = end("a1") + 0.18;
B.sh14 = S.s2 - 0.08; // class amazed, Санжар asks: «оқымай-ақ бес алды ма?!»
B.sh15 = end("s2") + 0.18; // the journal: a red «5» stamped
S.t3 = B.sh15 + 0.95;
B.sh16 = S.t3 - 0.08; // Barys explains the loophole: «он дұрыс жауапты да білу керек»
S.n8 = end("t3") + 0.2;
B.sh17 = S.n8 - 0.08; // Әлихан beams, sunburst & stars
B.sh18 = end("n8") + 0.25; // at the board: tap-tap, chalk handed over
B.sh19 = B.sh18 + 1.15; // board close-up: «ҚАТЕ» struck out, «БІЛІМ» written, motto
S.t4 = B.sh19 + 1.35;
B.sh20 = end("t4") + 0.3; // two-shot at the board
B.sh21 = B.sh20 + 1.3; // end card (DOM only): the question
S.n9 = B.sh21 + 0.3;
const END = end("n9") + 2.0;

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
