// «30 КҮН» 2-күн: voice timing -> shot bounds (seconds and frames). Everything on screen is timed to these words.
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;
const w0 = (id: string, i: number) => S[id] + AUDIO[id].words[i].start;

S.n1 = 0.3;
B.sh01 = 0; // ас үй: анасы телефонды алып тұр, «29» штампы
S.n2 = end("n1") + 0.25;
B.sh02 = w0("n2", 6) - 0.1; // мұздатқыш: телефон еттің арасында
S.n3 = end("n2") + 0.3;
B.sh03 = S.n3 - 0.1; // үстел: бармағы нанды «айналдырады»
S.n4 = end("n3") + 0.25;
B.sh04 = S.n4 - 0.1; // ой-бұлт: Аружан, грант; «Дәлел керек» — түрегеледі
S.n5 = end("n4") + 0.3;
B.sh05 = S.n5 - 0.1; // дәліз: КІТАПХАНА есігі
S.n6 = end("n5") + 0.3;
B.sh06 = S.n6 - 0.1; // кітапханашы апай: көзілдірігін сүртеді
S.n7 = end("n6") + 0.25;
B.sh07 = S.n7 - 0.1; // сөре: ең қалың кітап
S.n8 = end("n7") + 0.3;
B.sh08 = S.n8 - 0.1; // есік ашылады — Аружан
S.a1 = end("n8") + 0.35;
B.sh09 = S.a1 - 0.15; // Аружан сұрайды
S.e1 = end("a1") + 0.3;
B.sh10 = S.e1 - 0.1; // Ерасыл: «мұнда күнде келемін»
S.l1 = end("e1") + 0.35;
B.sh11 = S.l1 - 0.15; // апай: «бірінші рет көріп тұрмын»
S.n9 = end("l1") + 0.3;
B.sh12 = S.n9 - 0.1; // ӨТІРІК №2
S.a2 = end("n9") + 0.3;
B.sh13 = S.a2 - 0.1; // кітап төңкеріліп тұр
S.n10 = end("a2") + 0.3;
B.sh14 = S.n10 - 0.1; // Аружан күледі, қасына отырады
S.a3 = end("n10") + 0.25;
B.sh15 = S.a3 - 0.1; // «ертең жетіде»
S.e2 = end("a3") + 0.25;
S.n11 = end("e2") + 0.45;
B.sh16 = S.n11 - 0.15; // кешкі кітапхана: «таңғы жеті...»
S.n12 = end("n11") + 0.5;
B.sh17 = S.n12 - 0.2; // дауыс беру карточкасы (3D жоқ)
const END = end("n12") + 1.5;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);

export const ORDER = ["sh01", "sh02", "sh03", "sh04", "sh05", "sh06", "sh07", "sh08", "sh09", "sh10", "sh11", "sh12", "sh13", "sh14", "sh15", "sh16", "sh17"];
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({ key: k, a: sec(B[k]), b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the vote card is DOM only (no WebGL frames) */
export const CARD_AT = sec(B.sh17);

/** is someone speaking line `id` at frame f (mouth open on the voiced part of each word, ~7 Hz flap) */
export const talking = (id: string, f: number) => {
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  return false;
};
