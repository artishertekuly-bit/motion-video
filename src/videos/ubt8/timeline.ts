// «30 КҮН» 8-күн: voice timing -> shot bounds (seconds and frames).
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
B.sh01 = 0; // «23» күнтізбе хук, ҰБТ-ға 23 күн

S.g1 = end("n1") + 0.25;
B.sh02 = S.g1 - 0.1; // Сынып: Гүлнар апай сұрайды

S.e1 = end("g1") + 0.2;
B.sh03 = S.e1 - 0.1; // Ерасыл мақтанады: «Балым 82-ден асқан!»

S.g2 = end("e1") + 0.2;
B.sh04 = S.g2 - 0.1; // Гүлнар апай ауыр С деңгейлі тестті қояды

S.n2 = end("g2") + 0.25;
B.sh05 = S.n2 - 0.1; // Қатал сынақ басталды

S.e2 = end("n2") + 0.2;
B.sh06 = S.e2 - 0.1; // Ерасыл терлеп, формулалардан шошып отыр

S.n3 = end("e2") + 0.25;
B.sh07 = S.n3 - 0.1; // Сағат тықылдап, қызыл қаламмен кресттер қойылады

S.g3 = end("n3") + 0.2;
B.sh08 = S.g3 - 0.1; // Гүлнар апай: «Нәтижең — 58 балл! Өзіңді алдағансың!»

S.n4 = end("g3") + 0.25;
B.sh09 = S.n4 - 0.1; // Балл құлдырайды: 82 -> 58 балл (-24 балл!)

S.e3 = end("n4") + 0.25;
B.sh10 = S.e3 - 0.1; // Дәліз: Ерасыл түңіліп, уақытты құртқанын түсінеді

S.a1 = end("e3") + 0.25;
B.sh11 = S.a1 - 0.1; // Аружан келіп: «Босқа салың суға кетпесін!»

S.e4 = end("a1") + 0.2;
B.sh12 = S.e4 - 0.1; // Ерасыл: «Мен бәрін құрттым...»

S.a2 = end("e4") + 0.2;
B.sh13 = S.a2 - 0.1; // Аружан: «Мен саған арнайы жүйе құрастырдым!»

S.n5 = end("a2") + 0.25;
B.sh14 = S.n5 - 0.1; // Құпия стратегия сызбасы ашылады

S.a3 = end("n5") + 0.2;
B.sh15 = S.a3 - 0.1; // Аружан С деңгейін бұзу жоспарын түсіндіреді

S.e5 = end("a3") + 0.25;
B.sh16 = S.e5 - 0.1; // Ерасыл шабыттанып, жұдырығын түйеді

S.a4 = end("e5") + 0.2;
B.sh17 = S.a4 - 0.1; // Аружан: «Біз бұл шыңды бағындырамыз!»

S.n6 = end("a4") + 0.25;
B.sh18 = S.n6 - 0.1; // Нағыз дайындыққа көшу
S.n7 = end("n6") + 0.2;

B.sh19 = end("n7") + 0.1; // Нәтиже экраны (VsScreen): ГҮЛНАР АПАЙ 58 БАЛЛ vs АРУЖАННЫҢ АМАЛЫ 🎯

S.n8 = B.sh19 + 5.0; // Сауалнама басында дауыс беріледі
B.sh20 = S.n8 - 0.15; // Дауыс беру карточкасы (VoteCard): «9-КҮН: СЕЙСЕНБІДЕ НЕ ІСТЕЙДІ?»
const END = end("n8") + 2.0;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(S[id] + (AUDIO[id]?.words[i]?.end ?? 0));

export const ORDER = Array.from({ length: 20 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the results screen and the comment card are DOM only */
export const CARD_AT = sec(B.sh19);

/** is someone speaking line `id` at frame f */
export const talking = (id: string, f: number) => {
  if (!AUDIO[id]) return false;
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) {
    if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  }
  return false;
};
