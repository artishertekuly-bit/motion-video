// «Барыс ағай» 5-сабақ: «100 миллион әлде 1 теңге? (Экспоненциалды өсу)»:
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

const [nx, , nz] = NUR_UP;
const [bx, , bz] = T_BOARD;

const CAMS: Record<string, Key[]> = {
  // sh01: Barys writes 100M vs 1₸ x 2 on chalkboard
  sh01: [
    { f: 0, s: hold([-0.38, 1.45, 0.5], [-0.42, 1.5, -3.6], 52, 0, 0.0016) },
    { f: W("t1", 5) - 6, dur: 32, s: hold([-0.95, 1.5, -1.6], [-1.1, 1.45, -3.5], 44, W("t1", 5) - 6, 0.002) },
  ],
  // sh02: Nurlybek in sunglasses: «Әрине 100 миллион! Мен қара геликпен келемін!»
  sh02: [
    { f: A("sh02"), s: hold([nx - 0.22, 1.4, nz - 2.5], [nx - 0.08, 1.08, nz], 46, A("sh02"), 0.0025, 0.02) },
    at(W("u1", 4) - 3, [nx - 0.16, 1.36, nz - 2.2], [nx - 0.05, 1.12, nz], 42, 0.003, -0.01),
  ],
  // sh03: Barys snap closeup: «1 МИЛЛИАРД теңгеден айырылдың!»
  sh03: [
    { f: A("sh03"), s: hold([bx + 0.15, 1.48, bz + 1.8], [bx, 1.38, bz], 38, A("sh03"), 0.004, -0.01) },
    at(W("t2", 4) - 3, [bx + 0.08, 1.46, bz + 1.4], [bx, 1.38, bz], 32, 0.005, 0),
  ],
  // sh04: Nurlybek shock: «Неге?! 1 теңге қалай көп болады?!»
  sh04: [
    { f: A("sh04"), s: hold([nx - 0.1, 1.35, nz - 2.0], [nx, 1.1, nz], 42, A("sh04"), 0.0035, -0.02) },
  ],
  // sh05: Board calculation: 1 to 10 days
  sh05: [
    { f: A("sh05"), s: hold([-0.4, 1.5, -1.2], [-0.4, 1.45, -3.8], 48, A("sh05"), 0.0018) },
    { f: W("t3", 10) - 6, dur: 28, s: hold([-0.2, 1.45, -1.6], [-0.2, 1.4, -3.8], 42, W("t3", 10) - 6, 0.002) },
  ],
  // sh06: Nurlybek smug laugh: «1 донер де жоқ қой!»
  sh06: [
    { f: A("sh06"), s: hold([nx - 0.15, 1.36, nz - 2.3], [nx - 0.05, 1.1, nz], 44, A("sh06"), 0.0028, 0.02) },
  ],
  // sh07: Board explosion: 20-30 days -> 1 073 741 823 ₸!
  sh07: [
    { f: A("sh07"), s: hold([-0.3, 1.5, -1.5], [-0.35, 1.45, -3.8], 46, A("sh07"), 0.002) },
    at(W("t4", 9) - 4, [-0.35, 1.45, -1.8], [-0.35, 1.42, -3.8], 40, 0.004),
  ],
  // sh08: Chessboard wheat legend & Shah of India
  sh08: [
    { f: A("sh08"), s: hold([bx + 0.35, 1.45, bz + 2.2], [bx + 0.1, 1.35, bz], 45, A("sh08"), 0.0022, 0.01) },
  ],
  // sh09: Nurlybek heart attack & fainting
  sh09: [
    { f: A("sh09"), s: hold([nx - 0.18, 1.38, nz - 2.1], [nx, 1.05, nz], 42, A("sh09"), 0.004, -0.03) },
    at(W("u4", 6) - 3, [nx - 0.12, 1.32, nz - 1.8], [nx, 1.02, nz], 36, 0.005, -0.02),
  ],
  // sh10: Barys homework 2x twist
  sh10: [
    { f: A("sh10"), s: hold([bx + 0.2, 1.46, bz + 2.0], [bx, 1.36, bz], 42, A("sh10"), 0.0025, 0.01) },
    at(W("t6", 9) - 3, [bx + 0.1, 1.44, bz + 1.6], [bx, 1.36, bz], 36, 0.004),
  ],
  // sh11: Nurlybek panic scream: «Жоқ, ағай!»
  sh11: [
    { f: A("sh11"), s: hold([nx - 0.1, 1.34, nz - 1.9], [nx, 1.05, nz], 40, A("sh11"), 0.006, 0.02) },
  ],
};

export const camAt = (f: number): Cam => {
  const sk = shotAt(f).key;
  const keys = CAMS[sk] ?? CAMS.sh01;
  return run(keys, f);
};

export const kicksAt = (f: number) => {
  return { x: 0, y: 0 };
};

const DOF: { f: number; cInf: number; dur?: number; focus?: (f: number) => V3 }[] = [
  { f: 0, cInf: 5, focus: () => [-0.4, 1.45, -3.6] },
  { f: A("sh02"), cInf: 9, focus: () => [nx, 1.3, nz] },
  { f: A("sh03"), cInf: 14, focus: () => [bx, 1.4, bz] },
  { f: A("sh04"), cInf: 10, focus: () => [nx, 1.1, nz] },
  { f: A("sh05"), cInf: 6, focus: () => [-0.4, 1.45, -3.8] },
  { f: A("sh06"), cInf: 10, focus: () => [nx, 1.1, nz] },
  { f: A("sh07"), cInf: 7, focus: () => [-0.35, 1.45, -3.8] },
  { f: A("sh08"), cInf: 9, focus: () => [bx, 1.35, bz] },
  { f: A("sh09"), cInf: 12, focus: () => [nx, 1.05, nz] },
  { f: A("sh10"), cInf: 10, focus: () => [bx, 1.36, bz] },
  { f: A("sh11"), cInf: 12, focus: () => [nx, 1.05, nz] },
];

export const dofAt = (f: number): { cInf: number; focus?: (f: number) => V3 } => {
  let i = 0;
  while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i],
    p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
