// Shots, places, lighting and camera keys for Day 8.
import { BOUNDS, CARD_AT, FPS, TOTAL as T_ALL, shotStart, ws } from "./timeline";

export { FPS };
export const TOTAL = T_ALL;
export const D0 = 0;
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

export type Light = "day" | "golden" | "night";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light };

export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => {
  let light: Light = "day";
  if (["sh01", "sh02", "sh03", "sh04", "sh05", "sh06", "sh07", "sh08", "sh09"].includes(s.key)) light = "day";
  else if (["sh10", "sh11", "sh12"].includes(s.key)) light = "day";
  else if (["sh13", "sh14", "sh15", "sh16", "sh17", "sh18"].includes(s.key)) light = "golden";
  return { id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light };
});

export const FLASH_AT = -100;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places ----------------
// Set 1: Classroom (Gulnar apai's strict trial)
export const CLASS_POS: V3 = [0, 0, 0];

// Set 2: Corridor / Study Hall (Aruzhan's breakthrough strategy)
export const CORRIDOR_POS: V3 = [36.0, 0, 0];

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
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
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const hold = (pos: V3, look: V3, fov: number, f0: number, rate = 0.0022, roll = 0) => (f: number) => dolly(pos, look, pushK(f, f0, rate), { fov, roll });
const W = (id: string, i: number) => ws(id, i);
const A = (k: string) => shotStart(k);

const CAMS: Record<string, Key[]> = {
  // sh01: calendar «23» hook, classroom establishing
  sh01: [
    { f: 0, s: hold([CLASS_POS[0], 1.45, 4.2], [CLASS_POS[0], 1.05, 0], 42, 0, 0.0016) },
    { f: W("n1", 4) - 6, dur: 24, s: hold([CLASS_POS[0], 1.38, 3.2], [CLASS_POS[0], 1.05, 0], 38, W("n1", 4) - 6, 0.002) },
  ],
  // sh02: Gulnar apai confronts Erasyl
  sh02: [
    { f: A("sh02"), s: hold([CLASS_POS[0] + 0.1, 1.35, 2.9], [CLASS_POS[0] + 0.1, 1.05, 0], 38, A("sh02"), 0.0022) },
  ],
  // sh03: Erasyl boasts 82 points
  sh03: [
    { f: A("sh03"), s: hold([CLASS_POS[0] - 0.1, 1.35, 2.7], [CLASS_POS[0] - 0.1, 1.05, 0], 36, A("sh03"), 0.0025) },
  ],
  // sh04: Gulnar apai slams test booklet
  sh04: [
    { f: A("sh04"), s: hold([CLASS_POS[0] + 0.05, 1.3, 2.8], [CLASS_POS[0] + 0.05, 0.95, 0], 38, A("sh04"), 0.003, -0.03) },
  ],
  // sh05: Test begins
  sh05: [
    { f: A("sh05"), s: hold([CLASS_POS[0], 1.38, 3.2], [CLASS_POS[0], 1.05, 0], 40, A("sh05"), 0.002) },
  ],
  // sh06: Erasyl sweating over quantum formulas
  sh06: [
    { f: A("sh06"), s: hold([CLASS_POS[0] - 0.1, 1.35, 2.6], [CLASS_POS[0] - 0.1, 1.05, 0], 36, A("sh06"), 0.0026) },
  ],
  // sh07: Time up, red crosses
  sh07: [
    { f: A("sh07"), s: hold([CLASS_POS[0], 1.25, 2.4], [CLASS_POS[0], 0.9, 0], 34, A("sh07"), 0.002) },
  ],
  // sh08: Gulnar apai announces 58 points
  sh08: [
    { f: A("sh08"), s: hold([CLASS_POS[0] + 0.1, 1.35, 2.8], [CLASS_POS[0] + 0.1, 1.05, 0], 38, A("sh08"), 0.0024) },
  ],
  // sh09: Score drop 82 -> 58
  sh09: [
    { f: A("sh09"), s: hold([CLASS_POS[0] - 0.05, 1.32, 2.8], [CLASS_POS[0] - 0.05, 1.02, 0], 38, A("sh09"), 0.003, 0.03) },
  ],
  // sh10: Corridor: Erasyl slumped in despair
  sh10: [
    { f: A("sh10"), s: hold([CORRIDOR_POS[0] - 0.15, 1.32, 2.7], [CORRIDOR_POS[0] - 0.15, 0.98, 0], 38, A("sh10"), 0.0022) },
  ],
  // sh11: Aruzhan arrives to comfort him
  sh11: [
    { f: A("sh11"), s: hold([CORRIDOR_POS[0] + 0.05, 1.35, 2.8], [CORRIDOR_POS[0] + 0.05, 1.02, 0], 38, A("sh11"), 0.0022) },
  ],
  // sh12: Erasyl feeling hopeless
  sh12: [
    { f: A("sh12"), s: hold([CORRIDOR_POS[0], 1.35, 2.7], [CORRIDOR_POS[0], 1.02, 0], 36, A("sh12"), 0.0024) },
  ],
  // sh13: Aruzhan reveals strategy
  sh13: [
    { f: A("sh13"), s: hold([CORRIDOR_POS[0] + 0.05, 1.32, 2.7], [CORRIDOR_POS[0] + 0.05, 1.02, 0], 38, A("sh13"), 0.0024) },
  ],
  // sh14: Strategy blueprint overview
  sh14: [
    { f: A("sh14"), s: hold([CORRIDOR_POS[0], 1.32, 2.9], [CORRIDOR_POS[0], 1.02, 0], 40, A("sh14"), 0.002) },
  ],
  // sh15: Aruzhan explains C-tier formula breakdown
  sh15: [
    { f: A("sh15"), s: hold([CORRIDOR_POS[0] + 0.05, 1.32, 2.7], [CORRIDOR_POS[0] + 0.05, 1.02, 0], 38, A("sh15"), 0.0024) },
  ],
  // sh16: Erasyl inspired with new fire
  sh16: [
    { f: A("sh16"), s: hold([CORRIDOR_POS[0] - 0.05, 1.35, 2.6], [CORRIDOR_POS[0] - 0.05, 1.05, 0], 36, A("sh16"), 0.0026) },
  ],
  // sh17: Rallying together
  sh17: [
    { f: A("sh17"), s: hold([CORRIDOR_POS[0], 1.35, 2.8], [CORRIDOR_POS[0], 1.05, 0], 38, A("sh17"), 0.0022) },
  ],
  // sh18: Final march to battle
  sh18: [
    { f: A("sh18"), s: hold([CORRIDOR_POS[0], 1.38, 3.0], [CORRIDOR_POS[0], 1.05, 0], 40, A("sh18"), 0.002) },
  ],
};

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1];
  if (!s) return { pos: [0, 1.5, 3.5], look: [0, 1.15, 0], fov: 40, roll: 0 };
  const keys = CAMS[s.key];
  if (!keys || keys.length === 0) return { pos: [0, 1.5, 3.5], look: [0, 1.15, 0], fov: 40, roll: 0 };
  const c = run(keys, f);

  // Subtle kick on impact shots
  if (s.key === "sh04") {
    const lf = f - s.a;
    if (lf >= 8 && lf < 15) {
      const kx = Math.sin((lf - 8) * 3.5) * Math.exp(-(lf - 8) * 0.4) * 0.04;
      c.pos[1] += kx;
      c.look[1] += kx;
    }
  } else if (s.key === "sh09") {
    const lf = f - s.a;
    if (lf >= 4 && lf < 12) {
      const kx = Math.sin((lf - 4) * 4) * Math.exp(-(lf - 4) * 0.35) * 0.05;
      c.pos[0] += kx;
      c.look[0] += kx;
    }
  }

  return c;
};

export const dofAt = (_id: number, _f: number) => ({ cInf: 0 });

