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

B.sh01 = 0; // «30» падает штампом, Ерасыл лежит с телефоном
S.n1 = 0.25;
S.n2 = end("n1") + 0.25;
B.sh02 = S.n2 - 0.1; // наклейка «ЕРТЕҢ БАСТАЙМЫН»
S.n3 = end("n2") + 0.25;
B.sh03a = S.n3 - 0.1; // экранное время 9 сағ
B.sh03b = w0("n3", 4) - 0.08; // книги в целлофане
B.sh03c = w0("n3", 7) - 0.08; // пробный ҰБТ — 47
S.n4 = end("n3") + 0.35;
B.sh04a = S.n4 - 0.1; // уведомление от Аружан
B.sh04b = w0("n4", 5) - 0.08; // 5-сынып: та самая Аружан
S.a1 = end("n4") + 0.45;
B.sh05 = S.a1 - 0.4; // чат: её сообщение
S.n5 = end("a1") + 0.35;
B.sh06 = S.n5 - 0.1; // встаёт — «АДАМ БОЛУҒА»
S.n6 = end("n5") + 0.3;
B.sh07 = S.n6 - 0.1; // осмотр стола
S.n7 = end("n6") + 0.3;
B.sh08 = S.n7 - 0.1; // шкаф и пыль «Сіз кімсіз?»
S.n8 = end("n7") + 0.3;
B.sh09 = S.n8 - 0.1; // учебник скрипит
S.m1 = end("n8") + 0.35;
B.sh10a = S.m1 - 0.15; // мама из кухни
S.e1 = end("m1") + 0.2;
B.sh10b = S.e1 - 0.1; // «Иә!»
S.n9 = end("e1") + 0.2;
B.sh10c = S.n9 - 0.05; // на экране — игра
S.n10 = end("n9") + 0.35;
B.sh11 = S.n10 - 0.1; // двор, апалар
S.n11 = end("n10") + 0.3;
B.sh12 = S.n11 - 0.1; // пишет — удаляет — «Мен де»
S.n12 = end("n11") + 0.4;
B.sh13 = S.n12 - 0.1; // ночь, «ӨТІРІК №1»
S.n13 = end("n12") + 0.4;
B.sh14 = S.n13 - 0.15; // голосование
const END = end("n13") + 1.6;

export const START = S;
export const BOUND = B;
export const DURATION = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));

export type Shot = { id: string; from: number; to: number };
const ORDER = ["sh01", "sh02", "sh03a", "sh03b", "sh03c", "sh04a", "sh04b", "sh05", "sh06", "sh07", "sh08", "sh09", "sh10a", "sh10b", "sh10c", "sh11", "sh12", "sh13", "sh14"];
export const SHOTS: Shot[] = ORDER.map((id, i) => ({ id, from: sec(B[id]), to: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END) }));
export const CUTS = SHOTS.map((s) => s.from).filter((f) => f > 0);
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];
export const shotStart = (id: string) => sec(B[id]);
export const wordIn = (id: string, i: number, shot: string) => ws(id, i) - sec(B[shot]);

export const BIG_WORDS: { text: string; from: number; to: number; y?: number }[] = [{ text: "АДАМ БОЛУҒА", from: ws("n5", 2) - 2, to: ws("n5", 4) + 2, y: 640 }];
