// «Барыс ағай» 3-сабақ: «Кім кімнен озады? (Абай. 18-қара сөз)» in the 3D toon classroom:
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
export const T_BOARD: V3 = [-1.2, 0, -3.5];
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

const [tdx, , tdz] = T_DESK, [ax, , az] = ALI, [sx, , sz] = SAN, [nx, , nz] = NUR_UP;
const COL_L: [V3, V3] = [[-1.0, 1.6, -2.75], [-1.75, 0.92, 2.2]];
const COL_R: [V3, V3] = [[1.0, 1.6, -2.75], [1.75, 0.92, 2.2]];
const BOARD_WIDE: [V3, V3] = [[-0.22, 1.4, 0.95], [-0.24, 1.45, -3.6]];

const CAMS: Record<string, Key[]> = {
  // sh01: Chalkboard «КІМ КІМНЕН ОЗАДЫ?», Barys turns around
  sh01: [
    { f: 0, s: hold([-0.38, 1.45, 0.5], [-0.42, 1.5, -3.6], 52, 0, 0.0016) },
    { f: W("n1", 5) - 6, dur: 38, s: hold([-0.95, 1.5, -1.6], [-1.1, 1.45, -3.5], 42, W("n1", 5) - 6, 0.002) },
  ],
  // sh02: Нұрлыбек with sneaker on desk: «Оригинал кроссовка, 100 мың!»
  sh02: [
    { f: A("sh02"), s: hold([nx - 0.22, 1.4, nz - 2.5], [nx - 0.08, 1.08, nz], 46, A("sh02"), 0.0025, 0.02) },
    at(W("u1", 4) - 3, [nx - 0.16, 1.36, nz - 2.2], [nx - 0.05, 1.12, nz], 44, 0.003, -0.01),
  ],
  // sh03: Classroom row view: Sanjar & Tomiris flexing
  sh03: [
    { f: A("sh03"), s: hold(COL_R[0], COL_R[1], 50, A("sh03"), 0.0025) },
    at(W("n2", 4) - 3, [sx - 0.15, 1.35, sz - 1.8], [sx, 1.05, sz], 40, 0.0025),
  ],
  // sh04: Barys at desk, straightens glasses, smiles: «Абай атамыз 130 жыл бұрын...»
  sh04: [
    { f: A("sh04"), s: hold([tdx + 0.3, 1.5, tdz + 2.6], [tdx, 1.42, tdz], 38, A("sh04"), 0.0022) },
    at(W("t1", 5) - 3, [tdx + 0.18, 1.46, tdz + 2.1], [tdx, 1.42, tdz], 36, 0.0028),
  ],
  // sh05: Нұрлыбек smirking: «Трендсеттер деді ме?»
  sh05: [
    { f: A("sh05"), s: hold([NUR[0] - 0.25, 1.45, NUR[2] - 1.85], [NUR[0], 1.1, NUR[2]], 40, A("sh05"), 0.0025, -0.02) },
  ],
  // sh06: Barys pointer tap-tap: ««Ақымақ» деп атаған!»
  sh06: [
    { f: A("sh06"), s: hold([-0.95, 1.48, -1.8], [-1.15, 1.45, -3.5], 40, A("sh06"), 0.0028, 0.02) },
  ],
  // sh07: Board: «АБАЙ · 18-ҚАРА СӨЗ»
  sh07: [
    { f: A("sh07"), s: hold([EQ_X, 1.55, 0.4], [EQ_X, 1.5, -3.97], 50, A("sh07"), 0.0018) },
  ],
  // sh08: Board closeup: 4 virtues appear in glowing boxes
  sh08: [
    { f: A("sh08"), s: hold([EQ_X, 1.52, 0.4], [EQ_X, 1.48, -3.97], 50, A("sh08"), 0.0015) },
  ],
  // sh09: Barys index finger raised: «Одан басқамен оздым деудің бәрі — ақымақтық!»
  sh09: [
    { f: A("sh09"), s: hold([-0.95, 1.5, -1.6], [-1.15, 1.45, -3.5], 38, A("sh09"), 0.0025) },
  ],
  // sh10: Teacher desk medium: shiny box + old book placed
  sh10: [
    { f: A("sh10"), s: hold([tdx + 0.15, 1.52, tdz + 2.1], [tdx + 0.1, 1.25, tdz + 0.4], 40, A("sh10"), 0.0022) },
  ],
  // sh11: Barys opens shiny box — empty!
  sh11: [
    { f: A("sh11"), s: hold([tdx + 0.1, 1.48, tdz + 1.8], [tdx + 0.1, 1.25, tdz + 0.35], 38, A("sh11"), 0.0028) },
  ],
  // sh12: Нұрлыбек lowers foot from desk, embarrassed
  sh12: [
    { f: A("sh12"), s: hold([NUR[0] - 0.2, 1.4, NUR[2] - 1.8], [NUR[0], 1.05, NUR[2]], 40, A("sh12"), 0.0025) },
  ],
  // sh13: Back desk: Әлихан focused on solving the hard problem
  sh13: [
    { f: A("sh13"), s: hold([ax + 0.25, 1.42, az - 1.8], [ax + 0.05, 1.1, az], 40, A("sh13"), 0.0025) },
  ],
  // sh14: Barys holds Әлихан's solved notebook to class
  sh14: [
    { f: A("sh14"), s: hold([-0.9, 1.5, -1.7], [-1.05, 1.42, -3.5], 40, A("sh14"), 0.0022) },
  ],
  // sh15: Close up on the journal: Red stamp «5»
  sh15: [
    { f: A("sh15"), s: hold([tdx - 0.12, 1.55, tdz + 1.35], [tdx - 0.08, 0.78, tdz + 0.42], 40, A("sh15"), 0.003) },
  ],
  // sh16: Barys asks class: «Ендеше, бүгін бұл сыныпта кім бәрінен озды?»
  sh16: [
    { f: A("sh16"), s: hold([tdx - 0.1, 1.45, tdz + 2.1], [tdx, 1.35, tdz], 38, A("sh16"), 0.0022) },
  ],
  // sh17: Classroom stunned silence, looking back at Әлихан
  sh17: [
    { f: A("sh17"), s: hold(COL_L[0], COL_L[1], 50, A("sh17"), 0.002) },
  ],
  // sh18: Нұрлыбек opens notebook, holds pen: «маған білім керек екен»
  sh18: [
    { f: A("sh18"), s: hold([NUR[0] - 0.18, 1.38, NUR[2] - 1.65], [NUR[0], 1.08, NUR[2]], 38, A("sh18"), 0.0025) },
  ],
  // sh19: Board close up: Motto written line by line
  sh19: [
    { f: A("sh19"), s: hold([EQ_X, 1.52, 0.4], [EQ_X, 1.5, -3.97], 50, A("sh19"), 0.0012) },
  ],
  // sh20: Two-shot at board: Barys & Әлихан smiling, applause
  sh20: [
    { f: A("sh20"), s: hold(BOARD_WIDE[0], BOARD_WIDE[1], 54, A("sh20"), 0.0025) },
  ],
};

// Impact kicks
const KICKS: [number, number][] = [
  [W("n1", 5) / FPS, 0.4],
  [W("u1", 3) / FPS, 0.7], // «жүз мың теңге!»
  [W("t1", 5) / FPS, 0.5],
  [(A("sh06") + 3) / FPS, 0.9], // «Ақымақ!» tap
  [W("t4", 7) / FPS, 0.6], // «Ақыл»
  [W("t5", 5) / FPS, 0.8], // «Ақымақтық!»
  [(A("sh11") + 5) / FPS, 0.6], // box opened (empty)
  [(A("sh15") + 8) / FPS, 1.0], // stamp «5»
  [W("u3", 6) / FPS, 0.5], // «білім керек екен»
  [(A("sh19") + 5) / FPS, 0.4], // motto tap
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
  { f: 0, cInf: 5, focus: () => [EQ_X - 0.4, 1.6, -3.6] },
  { f: A("sh02"), cInf: 9, focus: () => [nx, 1.3, nz] },
  { f: A("sh03"), cInf: 6, focus: () => [1.6, 1.0, 1.0] },
  { f: A("sh04"), cInf: 9, focus: () => [tdx, 1.45, tdz] },
  { f: A("sh05"), cInf: 10, focus: () => [NUR[0], 1.1, NUR[2]] },
  { f: A("sh06"), cInf: 10, focus: () => [-1.15, 1.45, -3.5] },
  { f: A("sh07"), cInf: 5, focus: () => [EQ_X, 1.5, -3.97] },
  { f: A("sh08"), cInf: 4, focus: () => [EQ_X, 1.5, -3.97] },
  { f: A("sh09"), cInf: 11, focus: () => [-1.15, 1.45, -3.5] },
  { f: A("sh10"), cInf: 10, focus: () => [tdx, 1.25, tdz + 0.4] },
  { f: A("sh11"), cInf: 10, focus: () => [tdx, 1.25, tdz + 0.35] },
  { f: A("sh12"), cInf: 9, focus: () => [NUR[0], 1.05, NUR[2]] },
  { f: A("sh13"), cInf: 11, focus: () => [ax, 1.1, az] },
  { f: A("sh14"), cInf: 9, focus: () => [-1.05, 1.42, -3.5] },
  { f: A("sh15"), cInf: 12, focus: () => [tdx - 0.05, 0.8, tdz + 0.38] },
  { f: A("sh16"), cInf: 10, focus: () => [tdx, 1.45, tdz] },
  { f: A("sh17"), cInf: 6, focus: () => [-1.6, 1.0, 1.0] },
  { f: A("sh18"), cInf: 9, focus: () => [NUR[0], 1.08, NUR[2]] },
  { f: A("sh19"), cInf: 3, focus: () => [EQ_X, 1.55, -3.97] },
  { f: A("sh20"), cInf: 4, focus: () => [EQ_X, 1.4, -3.5] },
];

export const dofAt = (f: number) => {
  let i = 0;
  while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i],
    p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
