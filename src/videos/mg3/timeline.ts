// «Барыс ағай» 3-сабақ: «Кім кімнен озады? (Абай. 18-қара сөз)»: voice timing -> shot bounds.
// Everything on screen is timed to these words (audio-data.json from scripts/prep-mg3.mjs).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;

B.sh01 = 0; // chalk writes «КІМ КІМНЕН ОЗАДЫ?», Barys turns around
S.n1 = 0.5;

B.sh02 = end("n1") + 0.1; // Нұрлыбек puts sneaker on desk: «Оригинал кроссовка, 100 мың!»
S.u1 = B.sh02 + 0.08;

B.sh03 = end("u1") + 0.1; // class laughs; Sanjar with iPhone, Tomiris with followers
S.n2 = B.sh03 + 0.1;

B.sh04 = end("n2") + 0.12; // Barys at desk, straightens glasses, smiles: «Абай атамыз 130 жыл бұрын...»
S.t1 = B.sh04 + 0.1;

B.sh05 = end("t1") + 0.12; // Нұрлыбек smirking: «Трендсеттер деді ме?»
S.u2 = B.sh05 + 0.08;

B.sh06 = end("u2") + 0.12; // Barys pointer tap-tap: ««Ақымақ» деп атаған!»
S.t2 = B.sh06 + 0.08;

B.sh07 = end("t2") + 0.25; // chalk writes «18-ҚАРА СӨЗ»: Barys speaks
S.t3 = B.sh07 + 0.1;

B.sh08 = end("t3") + 0.15; // Board closeup: 4 pillars appear: «АҚЫЛ · ҒЫЛЫМ · АР · МІНЕЗ»
S.t4 = B.sh08 + 0.1;

B.sh09 = end("t4") + 0.15; // Barys raises index finger: «Одан басқамен оздым деудің бәрі — ақымақтық!»
S.t5 = B.sh09 + 0.1;

B.sh10 = end("t5") + 0.18; // Desk medium shot: gold shiny box & old textbook placed on desk
S.n3 = B.sh10 + 0.1;

B.sh11 = end("n3") + 0.15; // Barys opens gold box (empty!): «сырты жылтыр, бірақ іші бос қорап...»
S.t6 = B.sh11 + 0.1;

B.sh12 = end("t6") + 0.15; // Нұрлыбек lowers foot from desk, embarrassed
S.n4 = B.sh12 + 0.1;

B.sh13 = end("n4") + 0.15; // Back desk: Әлихан in simple clothes, focused on hard problem
S.n5 = B.sh13 + 0.1;

B.sh14 = end("n5") + 0.15; // Barys raises Әлихан's solved notebook to class: «ең қиын есепті жалғыз сол...»
S.t7 = B.sh14 + 0.1;

B.sh15 = end("t7") + 0.15; // Journal: red stamp «5» lands firmly
// Journal duration ~ 1.25s
B.sh16 = B.sh15 + 1.25; // Barys asks class: «Ендеше, бүгін бұл сыныпта кім бәрінен озды?»
S.t8 = B.sh16 + 0.1;

B.sh17 = end("t8") + 0.15; // Class in awe, looking back at Әлихан; phones lowered
S.n6 = B.sh17 + 0.1;

B.sh18 = end("n6") + 0.15; // Нұрлыбек opens notebook, holds pen: «маған кроссовка емес, білім керек екен»
S.u3 = B.sh18 + 0.1;

B.sh19 = end("u3") + 0.2; // Chalkboard motto written: «Киім бойды, ақыл ойды жылытады!»
S.t9 = B.sh19 + 0.15;

B.sh20 = end("t9") + 0.2; // Two-shot at board: Barys & Әлихан smiling, applause
B.sh21 = B.sh20 + 1.5; // End card (DOM only): the question
S.n7 = B.sh21 + 0.2;
const END = end("n7") + 2.0;

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
