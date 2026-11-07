import raw from "./audio-data.json";

export const FPS = 30;

export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;

export const sec = (s: number) => Math.round(s * FPS);

// ---------- монтаж (секунды): S — начало реплик, B — начало планов ----------
const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;
const w0 = (id: string, i: number) => S[id] + AUDIO[id].words[i].start;
const w1 = (id: string, i: number) => S[id] + AUDIO[id].words[i].end;

const HOOK = 2.6;
B.sh01 = 0; // крючок: полоса-кадр, «ҚАҒАЗ ПА, ОҚУШЫ МА?»
B.sh02 = HOOK; // коридор, все бегут на урок
B.sh03 = 5.0; // звонок
B.sh04 = 6.3; // молодой учитель спешит
B.sh05 = 8.6; // столкновение
export const COLLIDE = B.sh05 + 0.85; // в видео V2 стопка взлетает на 0,85 с
B.sh06 = 10.8; // оба на полу, листы падают
B.sh07 = 12.8; // мальчик вскакивает
S.s1 = 13.0;
B.sh08 = Math.max(15.2, end("s1") + 0.25); // рюкзак исчезает за дверью
B.sh09 = B.sh08 + 1.4; // коричневые туфли
B.sh10 = B.sh09 + 1.8; // мастер берёт лист
S.m1 = B.sh10 + 0.2;
B.sh11 = end("m1") + 0.35; // молодой не понимает
S.j1 = B.sh11 + 0.1;
B.sh11b = w0("j1", 4) - 0.1; // «…жоспарлар, есептер… Бәрі керек қой» — стопка крупно
B.sh12 = end("j1") + 0.25; // поднимаются
B.sh13 = B.sh12 + 2.3; // идут по коридору
S.m2 = B.sh13 + 0.1;
B.sh14a = end("m2") + 0.3; // «Ол бала сабағына асықты» — рюкзак у двери
S.m3 = B.sh14a + 0.15;
B.sh14 = w0("m3", 4) - 0.1; // «Сені де сыныпта балалар күтіп отыр» — класс ждёт
B.sh15 = end("m3") + 0.3; // идут к свету — ШЕБЕРЛІК
S.m4 = B.sh15 + 0.2;
B.sh16 = w0("m4", 5) - 0.12; // руки: стопка vs блокнот
B.sh16b = w0("m4", 10) - 0.1; // «балаға қараған көзқарасыңда» — мастер смотрит на молодого
B.sh17 = end("m4") + 0.3; // класс встаёт — АБЫРОЙ
S.m5 = B.sh17 + 0.2;
B.sh18 = w0("m5", 3) - 0.12; // «Оны балалар өздері береді» — дети стоят, крупно
B.sh18b = w0("m5", 8) - 0.1; // «күн сайын, аздап-аздап» — мастер крупно
B.sh19a = end("m5") + 0.3; // повтор столкновения
S.m6 = B.sh19a + 0.2;
B.sh19b = w0("m6", 7) - 0.1; // «ол қағаздай шашылады» — взрыв листов
B.sh20 = end("m6") + 0.5; // у двери
S.j2 = B.sh20 + 0.2;
B.sh21 = end("j2") + 0.25; // мастер в профиль
S.m7 = B.sh21 + 0.15;
B.sh22 = end("m7") + 0.25; // яма из бумаг — ШҰҢҚЫР
S.m8 = B.sh22 + 0.15;
B.sh23 = end("m8") + 0.6; // поклон
S.j3 = B.sh23 + 0.25;
B.sh24 = end("j3") + 0.35; // уходит в класс
B.sh25 = B.sh24 + 2.8; // пустой коридор, 4 листа
const END = B.sh25 + 5.5;

export const START = S;
export const BOUND = B;
export const TOTAL_SEC = END;
export const DURATION = sec(END);

export const cs = (id: string) => sec(S[id]);
export const ce = (id: string) => sec(end(id));
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(w1(id, i));

// ---------- планы ----------
// Камера: s — масштаб [от, до]; x, y — сдвиг в % кадра [от, до] (автоматически ограничивается, чтобы не было краёв)
export type Cam = { s: [number, number]; x?: [number, number]; y?: [number, number]; ease?: "inout" | "out" | "linear"; shake?: number };
// video — ролик Flow (720p, 4 с); vStart — с какой секунды ролика начинать; rate — скорость
export type Shot = { id: string; img: string; from: number; to: number; cam: Cam; video?: string; vStart?: number; rate?: number; grade?: "replay" };

const V = (n: number, vStart = 0, rate = 1): Partial<Shot> => ({ video: `qagaz/vid/V${n}.mp4`, vStart, rate });

const ORDER: [string, string, Cam, Partial<Shot>?][] = [
  ["sh01", "01", { s: [1.05, 1.12], y: [0, -1] }],
  ["sh02", "02", { s: [1.0, 1.05] }, V(1, 0.2)],
  ["sh03", "03", { s: [1.08, 1.16], shake: 1 }],
  ["sh04", "04", { s: [1.02, 1.14], y: [2, -1] }],
  ["sh05", "05", { s: [1.0, 1.04] }, V(2, 0)],
  ["sh06", "06", { s: [1.18, 1.04], y: [-3, 0], ease: "out" }],
  ["sh07", "07", { s: [1.0, 1.04] }, V(3, 0)],
  ["sh08", "08", { s: [1.02, 1.1], x: [-2, 0] }],
  ["sh09", "09", { s: [1.04, 1.12], y: [2, 0] }],
  ["sh10", "10", { s: [1.04, 1.14], x: [1, 3], y: [0, -2] }],
  ["sh11", "11", { s: [1.02, 1.12], y: [2, -2] }],
  ["sh11b", "11", { s: [1.5, 1.58], x: [2, 0], y: [-14, -17] }],
  ["sh12", "12", { s: [1.03, 1.0] }, V(4, 0.9)],
  ["sh13", "13", { s: [1.0, 1.04] }, V(5, 0.3)],
  ["sh14a", "08", { s: [1.3, 1.4], x: [10, 13], y: [-8, -11] }],
  ["sh14", "14", { s: [1.0, 1.16], x: [1, -2] }],
  ["sh15", "15", { s: [1.0, 1.08], y: [0, -1] }],
  ["sh16", "16", { s: [1.06, 1.12], x: [-3, 2] }],
  ["sh16b", "18", { s: [1.04, 1.1], x: [2, 0] }],
  ["sh17", "17", { s: [1.02, 1.14], y: [-1, -3] }],
  ["sh18", "17", { s: [1.45, 1.52], x: [18, 21], y: [-5, -7] }],
  ["sh18b", "18", { s: [1.45, 1.55], x: [-13, -16], y: [15, 18] }],
  ["sh19a", "05", { s: [1.08, 1.16] }, { ...V(2, 0.25, 0.5), grade: "replay" }],
  ["sh19b", "06b", { s: [1.22, 1.02], ease: "out" }, { grade: "replay" }],
  ["sh20", "20", { s: [1.02, 1.1] }],
  ["sh21", "21", { s: [1.04, 1.14], x: [2, 0] }],
  ["sh22", "22", { s: [1.7, 1.0], y: [-22, 0], ease: "inout" }],
  ["sh23", "23", { s: [1.03, 1.1], y: [1, -1] }],
  ["sh24", "24", { s: [1.0, 1.04] }, V(6, 0.5)],
  ["sh25", "25", { s: [1.0, 1.14], y: [0, -6] }],
];

export const SHOTS: Shot[] = ORDER.map(([id, img, cam, extra], i) => ({
  id,
  img,
  cam,
  from: sec(B[id]),
  to: i + 1 < ORDER.length ? sec(B[ORDER[i + 1][0]]) : sec(END),
  ...extra,
}));

export const CUTS = SHOTS.map((s) => s.from).filter((f) => f > 0);
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.from && f < s.to) ?? SHOTS[SHOTS.length - 1];
export const shotStart = (id: string) => sec(B[id]);

// ---------- большие слова ----------
export const BIG_WORDS: { text: string; from: number; to: number }[] = [
  { text: "ШЕБЕРЛІК", from: ws("m4", 1) - 2, to: we("m4", 4) + 12 },
  { text: "АБЫРОЙ", from: ws("m5", 0) - 2, to: sec(B.sh18) },
  { text: "ШҰҢҚЫР", from: ws("m8", 2) - 2, to: sec(B.sh23) },
];

// ---------- бумажные эффекты ----------
export const WIPES = [sec(B.sh06), sec(B.sh19a)];
export const FLASHES = [sec(COLLIDE), sec(B.sh19b)];
