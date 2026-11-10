// «30 КҮН» 4-күн: voice timing -> shot bounds (seconds and frames).
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
B.sh01 = 0; // «27» күнтізбе хук, ҰБТ-ға жиырма жеті күн қалды
S.n2 = end("n1") + 0.25; // «Ең көп лайк жинаған идея: түні бойы оқу»
S.n3 = end("n2") + 0.3;
B.sh02 = S.n3 - 0.1; // Кітапханадан үйге ұшып жетті
S.n4 = end("n3") + 0.25;
B.sh03 = S.n4 - 0.1; // Кітап үйіндісі, 5 кесе шай
S.n5 = end("n4") + 0.25;
B.sh04 = S.n5 - 0.1; // Сағат он, он екі, түнгі үш
S.m1 = end("n5") + 0.25;
B.sh05 = S.m1 - 0.12; // Анасы: «ұйықтасаңшы»
S.e1 = end("m1") + 0.2;
B.sh06 = S.e1 - 0.1; // «Болмайды, мама! Жұмада бәс бар!»
S.n6 = end("e1") + 0.3;
B.sh07 = S.n6 - 0.1; // Таң атады, сынақ тест, 56 балл! (+8)
S.n7 = end("n6") + 0.25;
B.sh08 = S.n7 - 0.1; // Ұйықтауға уақыт жоқ, көзі тартады
S.n8 = end("n7") + 0.3;
B.sh09 = S.n8 - 0.1; // Мұздатқыш дірілдеді, ішінде телефон
S.e2 = end("n8") + 0.15;
B.sh10 = S.e2 - 0.08; // «Серуен?!»
S.n9 = end("e2") + 0.25;
B.sh11 = S.n9 - 0.1; // Кешкі қала, қар жауып тұр
S.a1 = end("n9") + 0.25;
B.sh12 = S.a1 - 0.1; // Аружан: «Қандай әдемі...»
S.e3 = end("a1") + 0.2;
B.sh13 = S.e3 - 0.1; // Ерасыл: «Иә... өте әдемі» (Аружанға қарап)
S.a2 = end("e3") + 0.25;
B.sh14 = S.a2 - 0.1; // «Мен қарды айтып тұрмын ғой»
S.e4 = end("a2") + 0.2;
B.sh15 = S.e4 - 0.08; // «Мен де... қарды»
S.e5 = end("e4") + 0.25;
B.sh16 = S.e5 - 0.1; // «Аружан... бір маңызды нәрсе айтқым келеді...»
S.n10 = end("e5") + 0.3;
B.sh17 = S.n10 - 0.1; // Ұйықтамаған еді... көзі жұмылып, қарға құлайды!
S.a3 = end("n10") + 0.2;
B.sh18 = S.a3 - 0.08; // Аружан: «Ерасыл?!»
S.e6 = end("a3") + 0.25;
B.sh19 = S.e6 - 0.1; // Қардан тек етік шығып: «минус жеті де бар...»
S.n11 = end("e6") + 0.3;
B.sh20 = S.n11 - 0.1; // Аружан шанамен сүйреп бара жатыр
S.n12 = end("n11") + 0.35;
B.sh21 = S.n12 - 0.15; // VS экраны: ЕРАСЫЛ 56 / АРУЖАН 120, «ЖҰМАҒА 1 КҮН» (DOM)
S.n13 = end("n12") + 0.4;
B.sh22 = S.n13 - 0.15; // «ЕРАСЫЛ ЖЕҢСЕ — ҚАНДАЙ ТІЛЕК?» карточкасы (DOM)
const END = end("n13") + 2.0;

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
/** 3D stops here: the VS screen and the comment card are DOM only (no WebGL frames) */
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
