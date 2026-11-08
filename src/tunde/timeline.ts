import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

// S — начало реплик, B — начало планов (секунды)
const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;
const w0 = (id: string, i: number) => S[id] + AUDIO[id].words[i].start;

B.sc01a = 0; // запись с телефона (ночное видение): коридор
S.h1 = 1.05; // «Естідің бе?.. Қоңырау соғылып тұр. Түн ортасында.» — шёпот под звонок
B.sc01b = 1.25; // крупно: звонок на стене трясётся
B.sc02 = end("h1") + 0.35; // школа снаружи, ночь, одно окно горит
S.n1 = B.sc02 + 0.3;
B.sc03 = w0("n1", 5) - 0.15; // актовый зал: «50 жыл»
S.n2 = end("n1") + 0.35;
B.sc04 = S.n2 - 0.2; // главная дверь: запирают снаружи
S.m1 = end("n2") + 0.75;
B.sc05 = S.m1 - 0.35; // телефон: «Желі жоқ»
S.n3 = end("m1") + 0.5;
B.sc06 = S.n3 - 0.2; // 1 — мел пишет сам
S.n4 = end("n3") + 1.3;
B.sc07a = S.n4 - 0.2; // 2 — лестница, дети смотрят вверх
B.sc07b = w0("n4", 4) - 0.1; // потолок: пыль на каждом шаге
B.sc07c = w0("n4", 6) - 0.1; // пустой пролёт наверху
S.n5 = end("n4") + 0.7;
B.sc08a = S.n5 - 0.2; // 3 — звонок молчит…
B.sc08b = w0("n5", 4) - 0.1; // …и звонит. Снова запись: свет мигает, девочка ближе с каждым миганием
S.d1 = end("n5") + 3.4; // «Қаш!»
B.sc09 = S.d1 - 0.1; // бег (запись, тряска)
B.sc10a = S.d1 + 1.7; // прячутся под партами
B.sc10b = B.sc10a + 1.25; // ручка двери поворачивается
B.sc10c = B.sc10b + 1.9; // дверь открывается, луч фонаря
B.sc11 = B.sc10c + 1.5; // старик-сторож в дверях
S.a1 = B.sc11 + 0.45;
S.n6 = end("a1") + 0.5;
B.sc12a = S.n6 - 0.25; // задняя дверь, дети выходят
B.sc12b = w0("n6", 6) - 0.1; // крупно: фонарь из руки в руку
S.a2 = end("n6") + 0.45;
B.sc13 = S.a2 - 0.3; // «Түнде мектеп — басқалардікі.» дверь закрывается
B.sc14 = end("a2") + 1.4; // утро: светлый коридор
S.n7 = B.sc14 + 0.6;
S.t1 = end("n7") + 0.45;
B.sc15 = S.t1 - 0.2; // учительская: «Қандай күзетші?»
B.sc16 = w0("t1", 2) - 0.1; // фото с чёрной лентой
B.sc17 = end("t1") + 0.7; // фонарь в руке — щёлк, включился сам
S.n8 = B.sc17 + 2.3;
B.sc18 = S.n8 - 0.35; // школа ночью: фонарь ходит от окна к окну
export const END_CARD_S = end("n8") + 0.7;
const END = END_CARD_S + 3.4;

export const START = S;
export const BOUND = B;
export const DURATION = sec(END);
export const END_CARD = sec(END_CARD_S);
export const cs = (id: string) => sec(S[id]);
export const ce = (id: string) => sec(end(id));
export const ws = (id: string, i: number) => sec(w0(id, i));

export type Shot = { id: string; from: number; to: number };
const ORDER = [
  "sc01a", "sc01b", "sc02", "sc03", "sc04", "sc05", "sc06", "sc07a", "sc07b", "sc07c", "sc08a", "sc08b",
  "sc09", "sc10a", "sc10b", "sc10c", "sc11", "sc12a", "sc12b", "sc13", "sc14", "sc15", "sc16", "sc17", "sc18",
];
export const SHOTS: Shot[] = ORDER.map((id, i) => ({ id, from: sec(B[id]), to: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];
export const shotStart = (id: string) => sec(B[id]);
// кадр слова/реплики относительно начала плана
export const wordIn = (id: string, i: number, shot: string) => ws(id, i) - sec(B[shot]);
export const startIn = (id: string, shot: string) => cs(id) - sec(B[shot]);
export const endIn = (id: string, shot: string) => ce(id) - sec(B[shot]);
// записи с телефона (ночное видение)
export const FOOTAGE = new Set(["sc01a", "sc01b", "sc08b", "sc09"]);
// удары шагов в t-steps (с), см. scripts/prep-tunde.mjs
export const STEP_HITS = [0.25, 0.95, 1.5, 2.15, 2.75, 3.35, 3.95];
export const STEPS_AT = () => w0("n4", 2) - 0.35;
