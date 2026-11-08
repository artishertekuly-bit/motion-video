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

B.sc01 = 0; // вечер: Айбар бежит с рисунком, папа в телефоне — «Кейін, балам»
S.b1 = 0.25;
S.d1 = end("b1") + 0.2;
B.sc02 = end("d1") + 0.35; // крупно: свет телефона, мальчик уходит
S.n1 = B.sc02 + 0.3;
B.sc03 = end("n1") + 0.5; // утро, кухня: папа с телефоном у уха проходит мимо
S.b2 = B.sc03 + 0.6;
S.d2 = end("b2") + 0.15;
B.sc04 = end("d2") + 0.6; // ночь: папа за ноутбуком, Айбар в дверях
S.b3 = B.sc04 + 0.7;
S.d3 = end("b3") + 0.4;
B.sc05 = end("d3") + 0.6; // рисунок складывается и уходит в рюкзак
S.n2 = B.sc05 + 0.3;
B.sc06a = end("n2") + 0.9; // день: телефон вибрирует на столе в офисе
S.n3 = B.sc06a + 0.3;
B.sc06b = end("n3") + 0.25; // папа слушает апай, встаёт
S.t1 = B.sc06b + 0.35;
B.sc07a = end("t1") + 0.5; // бежит по школьному коридору
B.sc07b = B.sc07a + 1.5; // поднимает телефон к рисунку
B.sc07c = B.sc07b + 2.3; // сам рисунок: у папы вместо головы — телефон
B.sc07d = B.sc07c + 3.2; // телефон опускается, рядом Айбар
S.b4 = B.sc07d + 0.9;
B.sc09 = end("b4") + 0.5; // «Жоқ, балам. Қазір.» — прячет телефон, садится на корточки
S.d4 = B.sc09 + 0.4;
B.sc10a = end("d4") + 1.4; // вечер: телефон один на полке
S.n4 = B.sc10a + 0.4;
B.sc10b = end("n4") + 0.2; // папа и Айбар рисуют вместе
B.sc11 = B.sc10b + 2.2; // новый рисунок + афоризм
S.n5 = B.sc11 + 0.5;
const END = end("n5") + 3.0;

export const START = S;
export const BOUND = B;
export const DURATION = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const lineEnd = (id: string) => sec(end(id));

export type Shot = { id: string; from: number; to: number };
const ORDER = ["sc01", "sc02", "sc03", "sc04", "sc05", "sc06a", "sc06b", "sc07a", "sc07b", "sc07c", "sc07d", "sc09", "sc10a", "sc10b", "sc11"];
export const SHOTS: Shot[] = ORDER.map((id, i) => ({ id, from: sec(B[id]), to: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = SHOTS.map((s) => s.from).filter((f) => f > 0);
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];
export const shotStart = (id: string) => sec(B[id]);
// кадр слова относительно начала плана
export const wordIn = (id: string, i: number, shot: string) => ws(id, i) - sec(B[shot]);
export const startIn = (id: string, shot: string) => cs(id) - sec(B[shot]);
export const endIn = (id: string, shot: string) => lineEnd(id) - sec(B[shot]);

// большие слова: «КЕЙІН» растёт с каждым разом, «ҚАЗІР» — тёплое
export const BIG_WORDS: { text: string; from: number; to: number; size: number; warm?: boolean; y?: number }[] = [
  { text: "КЕЙІН", from: ws("d1", 0) - 2, to: sec(B.sc02) + 8, size: 150 },
  { text: "КЕЙІН ×2", from: ws("d2", 0) - 2, to: sec(B.sc04), size: 170 },
  { text: "КЕЙІН ×3", from: ws("d3", 1) - 2, to: sec(B.sc05) + 4, size: 196 },
  { text: "ҚАЗІР", from: ws("d4", 2) - 2, to: sec(B.sc10a), size: 210, warm: true },
];
export const WIPES = [sec(B.sc06a)];
