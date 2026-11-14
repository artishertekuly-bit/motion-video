// «Барыс ағай» 6-сабақ: «Троя аты: 10 жылдық қамалды 1 сыйлық қалай құлатты?»
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
  // sh01: Barys writes Trojan horse puzzle on board
  sh01: [
    { f: 0, s: hold([-0.38, 1.45, 0.5], [-0.42, 1.5, -3.6], 52, 0, 0.0016) },
    { f: W("t1", 5) - 6, dur: 30, s: hold([-0.95, 1.5, -1.6], [-1.1, 1.45, -3.5], 44, W("t1", 5) - 6, 0.002) },
  ],
  // sh02: Nurlybek: drones & cannons!
  sh02: [
    { f: A("sh02"), s: hold([nx - 0.22, 1.4, nz - 2.5], [nx - 0.08, 1.08, nz], 46, A("sh02"), 0.0025, 0.02) },
    at(W("u1", 4) - 3, [nx - 0.16, 1.36, nz - 2.2], [nx - 0.05, 1.12, nz], 42, 0.003, -0.01),
  ],
  // sh03: Barys explains wooden horse
  sh03: [
    { f: A("sh03"), s: hold([bx + 0.18, 1.48, bz + 2.0], [bx, 1.38, bz], 44, A("sh03"), 0.0022, -0.01) },
    at(W("t2", 11) - 4, [bx + 0.08, 1.46, bz + 1.5], [bx, 1.38, bz], 36, 0.0035, 0),
  ],
  // sh04: Nurlybek selfie & free toy
  sh04: [
    { f: A("sh04"), s: hold([nx - 0.14, 1.38, nz - 2.3], [nx - 0.05, 1.1, nz], 44, A("sh04"), 0.003, 0.02) },
  ],
  // sh05: Trojans party & sleep
  sh05: [
    { f: A("sh05"), s: hold([bx + 0.25, 1.45, bz + 2.1], [bx + 0.05, 1.36, bz], 45, A("sh05"), 0.0022) },
  ],
  // sh06: Nurlybek asks: more gifts?
  sh06: [
    { f: A("sh06"), s: hold([nx - 0.12, 1.35, nz - 2.1], [nx, 1.08, nz], 42, A("sh06"), 0.0028, -0.01) },
  ],
  // sh07: Midnight ambush: Greek soldiers jump out!
  sh07: [
    { f: A("sh07"), s: hold([bx + 0.1, 1.5, bz + 1.8], [bx, 1.38, bz], 40, A("sh07"), 0.003, -0.01) },
    at(W("t4", 6) - 3, [bx + 0.05, 1.46, bz + 1.4], [bx, 1.38, bz], 34, 0.005, 0),
  ],
  // sh08: Nurlybek shock: Trojan virus?!
  sh08: [
    { f: A("sh08"), s: hold([nx - 0.15, 1.36, nz - 2.0], [nx, 1.05, nz], 40, A("sh08"), 0.004, -0.02) },
  ],
  // sh09: Barys lesson: Beware Greeks bearing gifts! Don't click iPhone links!
  sh09: [
    { f: A("sh09"), s: hold([bx + 0.2, 1.46, bz + 2.2], [bx, 1.36, bz], 44, A("sh09"), 0.0022, 0.01) },
    at(W("t5", 14) - 4, [bx + 0.1, 1.44, bz + 1.6], [bx, 1.36, bz], 36, 0.0035),
  ],
  // sh10: Nurlybek SMS 1 million win
  sh10: [
    { f: A("sh10"), s: hold([nx - 0.12, 1.34, nz - 1.9], [nx, 1.05, nz], 40, A("sh10"), 0.004, 0.02) },
  ],
  // sh11: End card & outro
  sh11: [
    { f: A("sh11"), s: hold([-0.1, 1.42, -0.8], [-0.1, 1.32, -3.6], 46, A("sh11"), 0.0015) },
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
  { f: A("sh03"), cInf: 10, focus: () => [bx, 1.4, bz] },
  { f: A("sh04"), cInf: 10, focus: () => [nx, 1.1, nz] },
  { f: A("sh05"), cInf: 8, focus: () => [bx, 1.36, bz] },
  { f: A("sh06"), cInf: 10, focus: () => [nx, 1.1, nz] },
  { f: A("sh07"), cInf: 14, focus: () => [bx, 1.38, bz] },
  { f: A("sh08"), cInf: 12, focus: () => [nx, 1.05, nz] },
  { f: A("sh09"), cInf: 10, focus: () => [bx, 1.36, bz] },
  { f: A("sh10"), cInf: 12, focus: () => [nx, 1.05, nz] },
  { f: A("sh11"), cInf: 6, focus: () => [-0.1, 1.32, -3.6] },
];

export const dofAt = (f: number): { cInf: number; focus?: (f: number) => V3 } => {
  let i = 0;
  while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i],
    nxt = DOF[i + 1];
  if (!nxt || !d.dur || f >= d.f + d.dur) return { cInf: d.cInf, focus: d.focus };
  const u = glide((f - d.f) / d.dur);
  return { cInf: d.cInf + (nxt.cInf - d.cInf) * u, focus: d.focus };
};
