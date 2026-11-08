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
const w1 = (id: string, i: number) => S[id] + AUDIO[id].words[i].end;

B.sc01 = 0; // крючок: ночь, лампа, «ЕРТЕҢ — ЕМТИХАН»
S.n1 = 3.1;
B.sc02 = w0("n1", 4) - 0.1; // руки пишут крошечные буквы на ленте
S.n2 = end("n1") + 0.4;
B.sc03a = S.n2 - 0.15; // ручка
B.sc03b = w0("n2", 2) - 0.1; // бутылка
B.sc03c = w0("n2", 4) - 0.1; // часы
B.sc03d = w0("n2", 6) - 0.1; // подошва
B.sc04a = end("n2") + 0.5; // утро: звонок, в дверях Гүлнар апай
S.n3 = B.sc04a + 0.7;
B.sc04b = w0("n3", 6) - 0.1; // «бүркіт көз» — лучи-прожекторы
B.sc05a = end("n3") + 0.4; // телефоны на парты
S.t1 = B.sc05a + 0.2;
B.sc05b = w0("t1", 3) - 0.1; // «Уақыт басталды» — часы
B.sc06a = end("t1") + 0.5; // ручка — апай смотрит
S.n4 = B.sc06a + 0.3;
B.sc06b = w0("n4", 7) - 0.1; // бутылка — снова смотрит
B.sc06c = w0("n4", 11) - 0.1; // подошва — апай рядом
B.sc07 = end("n4") + 0.3; // «Біттім...»
S.b1 = B.sc07 + 0.5;
B.sc08a = end("b1") + 0.6; // вопрос на листе
S.n5 = B.sc08a + 0.2;
B.sc08b = end("n5") + 0.15; // озарение: шпаргалки летят в голову — БІЛЕМІН!
S.b2 = B.sc08b + 0.3;
B.sc09a = end("b2") + 0.35; // пишет быстро
S.n6 = B.sc09a + 0.2;
B.sc09b = w0("n6", 6) - 0.1; // «үш рет көшірген… басында» — ×3
B.sc10a = end("n6") + 0.35; // сдаёт работу
S.t2 = B.sc10a + 0.5;
B.sc10b = w0("t2", 2) - 0.15; // шёпот: «табаныңдағыны…» — шок
B.sc10c = end("t2") + 0.15; // ластик стирает подошву
B.sc11a = B.sc10c + 1.5; // вечер: апай открывает ящик
S.n7 = B.sc11a + 0.4;
B.sc11b = w0("n7", 6) - 0.1; // старая шпаргалка + школьница 90-х
B.sc12 = end("n7") + 0.6; // финал: «ЖАЗҒАН — ҰМЫТПАЙДЫ»
const END = B.sc12 + 3.9;

export const START = S;
export const BOUND = B;
export const DURATION = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(w1(id, i));

export type Shot = { id: string; from: number; to: number };
const ORDER = ["sc01", "sc02", "sc03a", "sc03b", "sc03c", "sc03d", "sc04a", "sc04b", "sc05a", "sc05b", "sc06a", "sc06b", "sc06c", "sc07", "sc08a", "sc08b", "sc09a", "sc09b", "sc10a", "sc10b", "sc10c", "sc11a", "sc11b", "sc12"];
export const SHOTS: Shot[] = ORDER.map((id, i) => ({ id, from: sec(B[id]), to: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = SHOTS.map((s) => s.from).filter((f) => f > 0);
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];
export const shotStart = (id: string) => sec(B[id]);
// кадр слова относительно начала плана
export const wordIn = (id: string, i: number, shot: string) => ws(id, i) - sec(B[shot]);

export const BIG_WORDS: { text: string; from: number; to: number; y?: number }[] = [
  { text: "ШПАРГАЛКА", from: ws("n1", 7) - 2, to: sec(B.sc03a) + 4 },
  { text: "БҮРКІТ КӨЗ", from: ws("n3", 7) - 2, to: sec(B.sc05a) },
  { text: "БІЛЕМІН!", from: ws("b2", 2) - 2, to: sec(B.sc09a) },
];
export const WIPES = [sec(B.sc04a), sec(B.sc11a)];
