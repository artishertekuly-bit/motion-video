// «30 КҮН» 3-күн: voice timing -> shot bounds (seconds and frames). Everything on screen is timed to these words.
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
B.sh01 = 0; // түнгі ас үй: Ерасыл қараңғыда отыр; «28» штампы; ой-бұлт «07:00»
S.n2 = end("n1") + 0.25; // «Сендер таңдадыңдар: таңғы жетіде Аружанмен бірге оқу»
S.n3 = end("n2") + 0.3;
B.sh02 = S.n3 - 0.1; // сағат 3:59 -> 4:00; ұйықтамаған көздер; дайын отыр
S.m1 = end("n3") + 0.3;
B.sh03 = S.m1 - 0.15; // шам жанады: анасы «Ойбай!»
S.n4 = end("m1") + 0.3;
B.sh04 = S.n4 - 0.1; // костюм, әтір — жарты бөтелке
S.n5 = end("n4") + 0.35;
B.sh05 = S.n5 - 0.1; // кітапхана 7:00, Аружан күтіп отыр
S.n6 = end("n5") + 0.25;
B.sh06 = S.n6 - 0.1; // есік: алдымен иіс, сосын Ерасыл
S.n7 = end("n6") + 0.25;
B.sh07 = S.n7 - 0.1; // апайдың гүлі солады
S.a1 = end("n7") + 0.3;
B.sh08 = S.a1 - 0.1; // Аружан түшкіреді
S.e1 = end("a1") + 0.25;
B.sh09 = S.e1 - 0.1; // «білімнің иісі»
S.l1 = end("e1") + 0.3;
B.sh10 = S.l1 - 0.1; // апай
S.n8 = end("l1") + 0.3;
B.sh11 = S.n8 - 0.1; // терезелер ашылады, қар; «минус он бес» — қалтырап отыр
S.a2 = end("n8") + 0.3;
B.sh12 = S.a2 - 0.1; // бірінші есеп: дәптер «x² = 49»
S.n9 = end("a2") + 0.3;
B.sh13 = S.n9 - 0.1; // миы жүктеледі
S.e2 = end("n9") + 0.2;
B.sh14 = S.e2 - 0.08; // «Жеті!»
S.n10 = end("e2") + 0.25;
B.sh15 = S.n10 - 0.1; // «Дұрыс!» БАЛЛ 47 -> 48
S.a3 = end("n10") + 0.25;
B.sh16 = S.a3 - 0.1; // «минус жеті де бар»
S.a4 = end("a3") + 0.3;
B.sh17 = S.a4 - 0.1; // бәс: жұмада сынақ тест; «Келістік!»
S.e3 = end("a4") + 0.2;
S.n11 = end("e3") + 0.35;
B.sh18 = S.n11 - 0.2; // VS экраны (3D жоқ)
S.n12 = end("n11") + 0.4;
B.sh19 = S.n12 - 0.15; // «4-күнді қалай өткіземіз?» карточкасы (3D жоқ)
const END = end("n12") + 2.0;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);

export const ORDER = Array.from({ length: 19 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({ key: k, a: sec(B[k]), b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the VS screen and the comment card are DOM only (no WebGL frames) */
export const CARD_AT = sec(B.sh18);

/** is someone speaking line `id` at frame f (mouth open on the voiced part of each word, ~7 Hz flap) */
export const talking = (id: string, f: number) => {
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  return false;
};
