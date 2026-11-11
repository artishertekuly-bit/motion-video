// «30 КҮН» 5-күн in the 3D toon world: shots (timed to the voice, timeline.ts), places, light, camera keys, kicks and lens blur.
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
  if (["sh02", "sh03", "sh04", "sh05"].includes(s.key)) light = "day";
  else if (["sh06"].includes(s.key)) light = "day";
  else if (["sh07", "sh08", "sh09", "sh10"].includes(s.key)) light = "day";
  else if (["sh11", "sh12", "sh13", "sh14", "sh15", "sh16", "sh17", "sh18", "sh19"].includes(s.key)) light = "day";
  else if (["sh20"].includes(s.key)) light = "golden";
  return { id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light };
});

export const FLASH_AT = -100;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places ----------------
// Set 1: Bedroom
export const BED_POS: V3 = [0, 0, -1.0];
export const BCLOCK: V3 = [0, 2.5, -2.89];

// Set 2: Morning street running
export const RUN_X = 18.0;

// Set 3: School classroom / exam
export const CLASS_POS: V3 = [38.5, 0, 0];
export const CCLOCK: V3 = [38.5, 2.6, -3.19];

// Set 4: School corridor & results board
export const CORR_POS: V3 = [56.0, 0, 0];
export const BOARD_POS: V3 = [56.0, 1.8, -2.4];

// Set 5: Snowy road to library
export const WALK_POS: V3 = [75.0, 0, 0];

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
// const at = (f: number, pos: V3, look: V3, fov: number, rate = 0.0025, roll = 0): Key => ({ f, cut: true, s: hold(pos, look, fov, f, rate, roll) });

const CAMS: Record<string, Key[]> = {
  // sh01: calendar «26» hook
  sh01: [
    { f: 0, s: hold([CORR_POS[0], 1.45, 3.8], [CORR_POS[0], 1.15, 0], 42, 0, 0.0016) },
    { f: W("n1", 4) - 6, dur: 24, s: hold([CORR_POS[0], 1.4, 2.6], [CORR_POS[0], 1.25, 0], 38, W("n1", 4) - 6, 0.002) },
  ],
  // sh02: bedroom, Yerasyl sleeping in bed
  sh02: [
    { f: A("sh02"), s: hold([0, 1.4, 2.9], [0, 0.75, -1.0], 42, A("sh02"), 0.0025) },
  ],
  // sh03: clock 10:00 zoom
  sh03: [
    { f: A("sh03"), s: hold([BCLOCK[0], 2.45, -1.4], [BCLOCK[0], 2.5, BCLOCK[2]], 30, A("sh03"), 0.002) },
  ],
  // sh04: Yerasyl shocked in bed
  sh04: [
    { f: A("sh04"), s: hold([-0.2, 1.35, 1.4], [-0.2, 0.95, -0.7], 36, A("sh04"), 0.003) },
  ],
  // sh05: packing rush, flying clothes
  sh05: [
    { f: A("sh05"), s: hold([0.3, 1.4, 2.5], [0.3, 1.05, -0.4], 40, A("sh05"), 0.0025) },
  ],
  // sh06: morning street running
  sh06: [
    { f: A("sh06"), s: (f) => {
      const rx = RUN_X + ((f - A("sh06")) * 0.04) % 6;
      return full(hold([rx, 1.45, 4.0], [rx, 1.15, 0], 42, A("sh06"), 0.0015)(f));
    }},
  ],
  // sh07: classroom door entrance
  sh07: [
    { f: A("sh07"), s: hold([CLASS_POS[0] - 1.2, 1.4, 3.2], [CLASS_POS[0] - 1.0, 1.15, 0], 38, A("sh07"), 0.0025) },
  ],
  // sh08: exam hall wide
  sh08: [
    { f: A("sh08"), s: hold([CLASS_POS[0], 1.5, 4.0], [CLASS_POS[0], 1.15, 0], 44, A("sh08"), 0.002) },
  ],
  // sh09: desk CU writing furiously
  sh09: [
    { f: A("sh09"), s: hold([CLASS_POS[0] - 0.4, 1.4, 1.8], [CLASS_POS[0] - 0.4, 1.15, -0.8], 34, A("sh09"), 0.003) },
  ],
  // sh10: exam finished, bell
  sh10: [
    { f: A("sh10"), s: hold([CLASS_POS[0] - 0.4, 1.45, 2.4], [CLASS_POS[0] - 0.4, 1.15, -0.8], 38, A("sh10"), 0.002) },
  ],
  // sh11: corridor results board, Aruzhan
  sh11: [
    { f: A("sh11"), s: hold([CORR_POS[0] + 0.7, 1.5, 2.8], [CORR_POS[0] + 0.7, 1.25, 0], 38, A("sh11"), 0.0025) },
  ],
  // sh12: corridor results board, Yerasyl 78
  sh12: [
    { f: A("sh12"), s: hold([CORR_POS[0] - 0.7, 1.5, 2.8], [CORR_POS[0] - 0.7, 1.25, 0], 38, A("sh12"), 0.0025) },
  ],
  // sh13: Yerasyl cheering
  sh13: [
    { f: A("sh13"), s: hold([CORR_POS[0] - 0.6, 1.45, 3.2], [CORR_POS[0] - 0.6, 1.15, 0], 40, A("sh13"), 0.0025) },
  ],
  // sh14: Aruzhan pouting
  sh14: [
    { f: A("sh14"), s: hold([CORR_POS[0], 1.45, 3.6], [CORR_POS[0], 1.15, 0], 42, A("sh14"), 0.002) },
  ],
  // sh15: Yerasyl confused
  sh15: [
    { f: A("sh15"), s: hold([CORR_POS[0] - 0.6, 1.45, 2.6], [CORR_POS[0] - 0.6, 1.2, 0], 36, A("sh15"), 0.0025) },
  ],
  // sh16: Aruzhan complaining
  sh16: [
    { f: A("sh16"), s: hold([CORR_POS[0] + 0.6, 1.45, 2.6], [CORR_POS[0] + 0.6, 1.2, 0], 36, A("sh16"), 0.0025) },
  ],
  // sh17: confession two-shot
  sh17: [
    { f: A("sh17"), s: hold([CORR_POS[0], 1.4, 3.0], [CORR_POS[0], 1.18, 0], 38, A("sh17"), 0.002) },
  ],
  // sh18: "Ой не деп қойдым?!" CU
  sh18: [
    { f: A("sh18"), s: hold([CORR_POS[0] - 0.45, 1.45, 2.1], [CORR_POS[0] - 0.45, 1.25, 0], 32, A("sh18"), 0.003) },
  ],
  // sh19: Aruzhan blush / cool recovery
  sh19: [
    { f: A("sh19"), s: hold([CORR_POS[0] + 0.5, 1.45, 2.4], [CORR_POS[0] + 0.5, 1.25, 0], 35, A("sh19"), 0.0025) },
  ],
  // sh20: walking together to library
  sh20: [
    { f: A("sh20"), s: hold([WALK_POS[0], 1.45, 4.2], [WALK_POS[0], 1.15, 0], 42, A("sh20"), 0.002) },
  ],
};

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1];
  if (!s) return { pos: [0, 1.5, 3.5], look: [0, 1.15, 0], fov: 40, roll: 0 };
  const keys = CAMS[s.key];
  if (!keys || keys.length === 0) return { pos: [0, 1.5, 3.5], look: [0, 1.15, 0], fov: 40, roll: 0 };
  return run(keys, f);
};

export const kickAt = (_id: number, _f: number) => ({ dx: 0, dy: 0, roll: 0 });
export const dofAt = (_id: number, _f: number) => ({ cInf: 0 });
