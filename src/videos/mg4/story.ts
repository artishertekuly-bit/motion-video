// «Барыс ағай» Анонс: «ЖИ Видео Курсы (Телеграм)» in the 3D toon classroom:
// Shots, camera keys, kicks and lens blur.
import { BOUNDS, CARD_AT, FPS, TOTAL as T_ALL, shotStart, ws } from "./timeline";

export { FPS };
export const TOTAL = T_ALL;
export const D0 = 0;
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

export type Light = "day" | "golden" | "night";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => ({
  id: i + 1,
  key: s.key,
  a: s.a,
  b: Math.min(s.b, CARD_AT),
  light: "day",
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- Places ----------------
export const BOARD = { x0: -2.6, x1: 1.4, y0: 0.9, y1: 2.25, z: -3.97 };
export const TDESK = { x0: 1.75, x1: 3.15, z0: -3.15, z1: -2.45, h: 0.76 };
export const EQ_X = -0.2;
export const T_BOARD: V3 = [-1.0, 0, -3.45];
export const T_DESK: V3 = [2.45, 0, -3.25];
export const A_BOARD: V3 = [0.7, 0, -3.45];

export const SEAT_Y = 0.3;
export const ROWZ = [-0.13, 1.67, 3.47];
export const ALI: V3 = [-1.45, SEAT_Y, ROWZ[2]];
export const TOM: V3 = [-1.45, SEAT_Y, ROWZ[0]];
export const NUR: V3 = [1.45, SEAT_Y, ROWZ[0]];
export const SAN: V3 = [1.45, SEAT_Y, ROWZ[1]];
export const NUR_UP: V3 = [0.98, 0, 0.12];
export const ALI_UP: V3 = [-0.98, 0, 3.6];

// ---------------- Camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k,
  roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixC(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot => ({
  pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k],
  look,
  ...rest,
});
const hold = (pos: V3, look: V3, fov: number, f0: number, rate = 0.0022, roll = 0) => (f: number) =>
  dolly(pos, look, pushK(f, f0, rate), { fov, roll });

const W = (id: string, i: number) => ws(id, i);
const A = (k: string) => shotStart(k);
const at = (f: number, pos: V3, look: V3, fov: number, rate = 0.0025, roll = 0): Key => ({
  f,
  cut: true,
  s: hold(pos, look, fov, f, rate, roll),
});

const [nx, , nz] = NUR_UP;

const CAMS: Record<string, Key[]> = {
  // sh01: Nurlybek panicked at desk with laptop: «Ағай! 10 жыл оқып, миллиондық компьютер керек шығар?!»
  sh01: [
    { f: 0, s: hold([NUR[0] - 0.22, 1.45, NUR[2] - 1.8], [NUR[0], 1.1, NUR[2]], 46, 0, 0.0025, 0.02) },
    at(W("u1", 4) - 4, [NUR[0] - 0.15, 1.4, NUR[2] - 1.5], [NUR[0], 1.12, NUR[2]], 42, 0.003, -0.015),
  ],
  // sh02: Barys smirks: «Қой әрі, Нұрлыбек! Бүгінде мұның бәрін жасанды интеллект жасайды!»
  sh02: [
    { f: A("sh02"), s: hold([-0.85, 1.5, -1.5], [-1.05, 1.45, -3.45], 46, A("sh02"), 0.0022, -0.02) },
    at(W("t1", 5) - 3, [-0.75, 1.48, -1.2], [-0.95, 1.45, -3.45], 43, 0.0028, 0.01),
  ],
  // sh03: 3D feature cards float: «Сурет сала білудің де, монтаждың да керегі жоқ...»
  sh03: [
    { f: A("sh03"), s: hold([-0.5, 1.52, -0.8], [-0.75, 1.45, -3.45], 50, A("sh03"), 0.0018, 0.015) },
    at(W("t2", 8) - 3, [-0.4, 1.5, -0.5], [-0.7, 1.45, -3.45], 48, 0.002, -0.01),
  ],
  // sh04: Course announcement: «Мен осыны үйрететін авторлық КУРС дайындадым!...»
  sh04: [
    { f: A("sh04"), s: hold([-0.2, 1.55, 0.2], [-0.65, 1.48, -3.45], 52, A("sh04"), 0.002, 0.02) },
    at(W("t3", 6) - 3, [-0.3, 1.52, -0.2], [-0.7, 1.48, -3.45], 48, 0.0025, -0.015),
  ],
  // sh05: Telegram announcement: «Курстың ең басты құпиялары... Телеграм каналымда өтеді!»
  sh05: [
    { f: A("sh05"), s: hold([-0.65, 1.52, -1.3], [-0.85, 1.45, -3.45], 44, A("sh05"), 0.0022, -0.02) },
    at(W("t4", 5) - 3, [-0.55, 1.5, -1.0], [-0.8, 1.45, -3.45], 42, 0.0028, 0.015),
  ],
  // sh06: Nurlybek jumps up: «Ағай, сілтеме қайда?!»
  sh06: [
    { f: A("sh06"), s: hold([nx - 0.2, 1.4, nz - 2.1], [nx, 1.25, nz], 44, A("sh06"), 0.0035, 0.03) },
  ],
  // sh07: Barys warm CTA: «Сілтеме профильде! Дәл қазір жазылып үлгер!»
  sh07: [
    { f: A("sh07"), s: hold([-0.3, 1.55, -0.8], [-0.55, 1.48, -3.45], 48, A("sh07"), 0.0018, -0.01) },
    at(W("t5", 3) - 3, [-0.25, 1.52, -0.5], [-0.5, 1.48, -3.45], 45, 0.002, 0.005),
  ],
};

// Impact kicks
const KICKS: [number, number][] = [
  [W("u1", 0) / FPS, 0.5], // «Ағай!»
  [W("u1", 4) / FPS, 0.7], // «миллиондық компьютер»
  [W("t1", 0) / FPS, 0.4], // «Қой әрі!»
  [W("t1", 5) / FPS, 0.8], // «жасанды интеллект!»
  [W("t2", 0) / FPS, 0.5], // «Сурет сала білудің»
  [W("t2", 8) / FPS, 0.7], // «3D анимация»
  [W("t3", 4) / FPS, 0.9], // «КУРС»
  [W("t3", 10) / FPS, 0.8], // «миллион қаралым»
  [W("t4", 5) / FPS, 0.9], // «ТЕЛЕГРАМ»
  [A("sh06") / FPS, 0.9],  // Нұрлыбек секірді
  [W("t5", 1) / FPS, 0.6], // «профильде!»
];

export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};

export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[SHOTS[id - 1].key], f),
    a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d),
    h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return {
    ...c,
    look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m],
    roll: c.roll + a * 0.004,
  };
};

// ---------------- Lens Blur ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 8, focus: () => [NUR[0], 1.1, NUR[2]] },
  { f: A("sh02"), cInf: 6, focus: () => [-1.0, 1.45, -3.45] },
  { f: A("sh03"), cInf: 5, focus: () => [-0.8, 1.45, -3.45] },
  { f: A("sh04"), cInf: 6, focus: () => [-0.7, 1.48, -3.45] },
  { f: A("sh05"), cInf: 7, focus: () => [-0.85, 1.45, -3.45] },
  { f: A("sh06"), cInf: 9, focus: () => [nx, 1.25, nz] },
  { f: A("sh07"), cInf: 6, focus: () => [-0.55, 1.48, -3.45] },
];

export const dofAt = (f: number) => {
  let i = 0;
  while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i],
    p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
