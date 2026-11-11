// «30 КҮН» 5-күн: voice timing -> shot bounds (seconds and frames).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;
const w0 = (id: string, i: number) => S[id] + (AUDIO[id].words[i]?.start ?? 0);

S.n1 = 0.3;
B.sh01 = 0; // «26» күнтізбе хук, Аружанға сезім білдіру тілегі
S.n2 = end("n1") + 0.25;
B.sh02 = S.n2 - 0.1; // Төсекте ұйықтап жатқан Ерасыл
S.n3 = end("n2") + 0.25;
B.sh03 = S.n3 - 0.1; // Қабырға сағаты: 10:00!
S.e1 = end("n3") + 0.15;
B.sh04 = S.e1 - 0.08; // «Сағат он?! Сынақ тестке жарты-ақ сағат қалды!»
S.n4 = end("e1") + 0.25;
B.sh05 = S.n4 - 0.1; // Шұлықтар ұшып, жиналу
S.e2 = end("n4") + 0.2;
B.sh06 = S.e2 - 0.1; // Көшеде жүгіріп келе жатыр: «Бүгін Аружанмен бәс бар!»
S.n5 = end("e2") + 0.25;
B.sh07 = S.n5 - 0.1; // Мектеп кабинетіне сырғып кіру
S.n6 = end("n5") + 0.25;
B.sh08 = S.n6 - 0.1; // Сынақ тест залы, қатаң бақылау
S.e3 = end("n6") + 0.2;
B.sh09 = S.e3 - 0.1; // Қаламнан түтін, формулалар
S.n7 = end("e3") + 0.25;
B.sh10 = S.n7 - 0.1; // Сағат 12:00, қоңырау: «Уақыт бітті!»
S.n8 = end("n7") + 0.25;
B.sh11 = S.n8 - 0.1; // Нәтиже тақтасы: Аружан — 124!
S.n9 = end("n8") + 0.25;
B.sh12 = S.n9 - 0.1; // Ерасыл — 78! (+22 балл)
S.e4 = end("n9") + 0.18;
B.sh13 = S.e4 - 0.08; // «Жиырма екі балл қосқанмын!»
S.a1 = end("e4") + 0.25;
B.sh14 = S.a1 - 0.1; // Аружан қол қусырып: «Өкпем қара қазандай!»
S.e5 = end("a1") + 0.15;
B.sh15 = S.e5 - 0.08; // «Неге, Аружан?»
S.a2 = end("e5") + 0.2;
B.sh16 = S.a2 - 0.1; // «Кеше шанада қатып қалдың, бүгін әрең жеттің!»
S.e6 = end("a2") + 0.25;
B.sh17 = S.e6 - 0.1; // «Өйткені сен маған... қатты ұнайсың!»
S.e7 = end("e6") + 0.2;
B.sh18 = S.e7 - 0.08; // «Ой... не деп қойдым?!» жүректер
S.a3 = end("e7") + 0.25;
B.sh19 = S.a3 - 0.1; // Аружан қызарып: «78 жинағаның үшін кешірдім... кітапханаға жүр!»
S.n10 = end("a3") + 0.3;
B.sh20 = S.n10 - 0.1; // Кітапханаға қатар жүріп бара жатыр
S.n11 = end("n10") + 0.35;
B.sh21 = S.n11 - 0.15; // VS нәтиже экраны: АРУЖАН 124 vs ЕРАСЫЛ 78
S.n12 = end("n11") + 0.4;
B.sh22 = S.n12 - 0.15; // «6-КҮН: ДЕМАЛЫСТА ЕРАСЫЛ НЕ ІСТЕЙДІ?»
const END = end("n12") + 2.0;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(S[id] + (AUDIO[id]?.words[i]?.end ?? 0));

export const ORDER = Array.from({ length: 22 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the VS screen and the comment card are DOM only */
export const CARD_AT = sec(B.sh21);

/** is someone speaking line `id` at frame f */
export const talking = (id: string, f: number) => {
  if (!AUDIO[id]) return false;
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) {
    if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  }
  return false;
};
