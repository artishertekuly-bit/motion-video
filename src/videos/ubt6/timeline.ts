// «30 КҮН» 6-күн: voice timing -> shot bounds (seconds and frames).
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
B.sh01 = 0; // «25» күнтізбе хук, Аружанға гүл сыйлау
S.e1 = end("n1") + 0.25;
B.sh02 = S.e1 - 0.1; // Айна алдындағы Ерасыл
S.n2 = end("e1") + 0.2;
B.sh03 = S.n2 - 0.1; // Қалтада тек тиын мен қалам
S.e2 = end("n2") + 0.2;
B.sh04 = S.e2 - 0.1; // Гүл дүкені: 25 000 тг букет
S.n3 = end("e2") + 0.25;
B.sh05 = S.n3 - 0.1; // Бір тал қызыл раушан
S.e3 = end("n3") + 0.2;
B.sh06 = S.e3 - 0.1; // Орамына формула жазу
S.n4 = end("e3") + 0.25;
B.sh07 = S.n4 - 0.1; // Шпаргалка-букет пайда болды
S.n5 = end("n4") + 0.3;
B.sh08 = S.n5 - 0.1; // Сенбілік тыныш таң, кітапхана алды
S.a1 = end("n5") + 0.2;
B.sh09 = S.a1 - 0.1; // Аружан күтіп тұр: «Бүгін ең қиын тақырып»
S.e4 = end("a1") + 0.2;
B.sh10 = S.e4 - 0.1; // Ерасыл жақындайды: «Аружан, бүгін ерекше күн»
S.e5 = end("e4") + 0.15;
B.sh11 = S.e5 - 0.08; // Гүлді ұсынады: «Мынау саған!»
S.a2 = end("e5") + 0.25;
B.sh12 = S.a2 - 0.1; // Аружан риза: «Қандай әдемі!»
S.a3 = end("a2") + 0.25;
B.sh13 = S.a3 - 0.1; // Орамдағы синус-косинус: «Мынау не?!»
S.e6 = end("a3") + 0.25;
B.sh14 = S.e6 - 0.1; // «Гүл солады, ал тригонометрия өлмейді!»
S.a4 = end("e6") + 0.25;
B.sh15 = S.a4 - 0.1; // Аружан сыңғырлап күледі: «Ахаха!»
S.n6 = end("a4") + 0.3;
B.sh16 = S.n6 - 0.1; // Кітапхана төрінде жалғасты
S.a5 = end("n6") + 0.25;
B.sh17 = S.a5 - 0.1; // «Орамдағы формуламен есепті шығар!»
S.e7 = end("a5") + 0.2;
B.sh18 = S.e7 - 0.1; // Ерасыл: «Жауабы екіге тең!»
S.a6 = end("e7") + 0.2;
B.sh19 = S.a6 - 0.1; // «Грант сенікі!»
S.n7 = end("a6") + 0.3;
B.sh20 = S.n7 - 0.1; // БАЛЛ 78 -> 82 (+4)
S.n8 = end("n7") + 0.35;
B.sh21 = S.n8 - 0.15; // Нәтиже экраны: АРУЖАН 💖 10/10 vs ЕРАСЫЛ 82 БАЛЛ
S.n9 = end("n8") + 0.4;
B.sh22 = S.n9 - 0.15; // «7-КҮН: ЖЕКСЕНБІДЕ ЕРАСЫЛ НЕ ІСТЕЙДІ?»
const END = end("n9") + 2.0;

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
/** 3D stops here: the results screen and the comment card are DOM only */
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
