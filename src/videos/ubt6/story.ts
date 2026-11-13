// «30 КҮН» 6-күн in the 3D toon world: shots (timed to the voice, timeline.ts), places, light, camera keys.
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
  if (["sh01", "sh02", "sh03"].includes(s.key)) light = "day";
  else if (["sh04", "sh05"].includes(s.key)) light = "day";
  else if (["sh06", "sh07"].includes(s.key)) light = "day";
  else if (["sh08", "sh09", "sh10", "sh11", "sh12", "sh13", "sh14", "sh15"].includes(s.key)) light = "day";
  else if (["sh16", "sh17", "sh18", "sh19", "sh20"].includes(s.key)) light = "golden";
  return { id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light };
});

export const FLASH_AT = -100;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places ----------------
// Set 1: Bedroom (Mirror & prep)
export const BED_POS: V3 = [0, 0, 0];

// Set 2: Flower Boutique
export const SHOP_POS: V3 = [18.0, 0, 0];

// Set 3: Formula Writing Desk
export const DESK_POS: V3 = [36.0, 0, 0];

// Set 4: Library Outside (Snow & Meeting)
export const LIB_OUT: V3 = [56.0, 0, 0];

// Set 5: Library Inside Reading Hall
export const LIB_IN: V3 = [78.0, 0, 0];

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
  // sh01: calendar «25» hook
  sh01: [
    { f: 0, s: hold([LIB_OUT[0], 1.5, 4.2], [LIB_OUT[0], 1.15, 0], 42, 0, 0.0016) },
    { f: W("n1", 4) - 6, dur: 24, s: hold([LIB_OUT[0], 1.45, 3.2], [LIB_OUT[0], 1.25, 0], 38, W("n1", 4) - 6, 0.002) },
  ],
  // sh02: bedroom mirror, Erasyl nervous
  sh02: [
    { f: A("sh02"), s: hold([BED_POS[0], 1.4, 2.6], [BED_POS[0], 1.18, 0], 38, A("sh02"), 0.0025) },
  ],
  // sh03: bedroom, checking pocket
  sh03: [
    { f: A("sh03"), s: hold([BED_POS[0], 1.35, 2.3], [BED_POS[0], 1.05, 0], 36, A("sh03"), 0.0025) },
  ],
  // sh04: flower shop, 25 000 tg bouquet shock
  sh04: [
    { f: A("sh04"), s: hold([SHOP_POS[0], 1.45, 3.2], [SHOP_POS[0], 1.15, 0], 40, A("sh04"), 0.002) },
  ],
  // sh05: flower shop, single rose counter
  sh05: [
    { f: A("sh05"), s: hold([SHOP_POS[0] - 0.2, 1.4, 2.4], [SHOP_POS[0] - 0.2, 1.15, 0], 36, A("sh05"), 0.0025) },
  ],
  // sh06: desk, writing formulas on wrapping
  sh06: [
    { f: A("sh06"), s: hold([DESK_POS[0], 1.4, 2.2], [DESK_POS[0], 1.1, 0], 36, A("sh06"), 0.0025) },
  ],
  // sh07: formula bouquet close-up
  sh07: [
    { f: A("sh07"), s: hold([DESK_POS[0], 1.35, 2.3], [DESK_POS[0], 1.15, 0], 36, A("sh07"), 0.002) },
  ],
  // sh08: library entrance wide, peaceful snowy morning
  sh08: [
    { f: A("sh08"), s: hold([LIB_OUT[0], 1.5, 4.5], [LIB_OUT[0], 1.15, 0], 44, A("sh08"), 0.0018) },
  ],
  // sh09: Aruzhan waiting with test book
  sh09: [
    { f: A("sh09"), s: hold([LIB_OUT[0] + 0.6, 1.45, 2.8], [LIB_OUT[0] + 0.6, 1.25, 0], 38, A("sh09"), 0.0025) },
  ],
  // sh10: Erasyl approaching hiding rose
  sh10: [
    { f: A("sh10"), s: hold([LIB_OUT[0], 1.45, 3.4], [LIB_OUT[0], 1.18, 0], 40, A("sh10"), 0.0022) },
  ],
  // sh11: Erasyl gifting the rose!
  sh11: [
    { f: A("sh11"), s: hold([LIB_OUT[0] - 0.3, 1.4, 2.7], [LIB_OUT[0] - 0.3, 1.15, 0], 36, A("sh11"), 0.0025) },
  ],
  // sh12: Aruzhan touched and happy
  sh12: [
    { f: A("sh12"), s: hold([LIB_OUT[0] + 0.5, 1.45, 2.5], [LIB_OUT[0] + 0.5, 1.25, 0], 36, A("sh12"), 0.0025) },
  ],
  // sh13: Aruzhan spots formulas on wrapper
  sh13: [
    { f: A("sh13"), s: hold([LIB_OUT[0] + 0.4, 1.38, 2.7], [LIB_OUT[0] + 0.4, 1.1, 0], 36, A("sh13"), 0.0025) },
  ],
  // sh14: Erasyl proud romantic: "Гүл солады, ал тригонометрия өлмейді!"
  sh14: [
    { f: A("sh14"), s: hold([LIB_OUT[0] - 0.4, 1.45, 2.6], [LIB_OUT[0] - 0.4, 1.2, 0], 36, A("sh14"), 0.0025) },
  ],
  // sh15: Aruzhan laughing warmly
  sh15: [
    { f: A("sh15"), s: hold([LIB_OUT[0], 1.45, 3.2], [LIB_OUT[0], 1.2, 0], 40, A("sh15"), 0.002) },
  ],
  // sh16: inside library, rose in vase on table
  sh16: [
    { f: A("sh16"), s: hold([LIB_IN[0], 1.45, 3.8], [LIB_IN[0], 1.15, 0], 42, A("sh16"), 0.002) },
  ],
  // sh17: Aruzhan opens math problem
  sh17: [
    { f: A("sh17"), s: hold([LIB_IN[0] + 0.6, 1.4, 2.6], [LIB_IN[0] + 0.6, 1.15, 0], 36, A("sh17"), 0.0025) },
  ],
  // sh18: Erasyl solving the math problem
  sh18: [
    { f: A("sh18"), s: hold([LIB_IN[0] - 0.5, 1.4, 2.4], [LIB_IN[0] - 0.5, 1.15, 0], 35, A("sh18"), 0.0025) },
  ],
  // sh19: Aruzhan impressed, "+4" marked!
  sh19: [
    { f: A("sh19"), s: hold([LIB_IN[0], 1.4, 2.8], [LIB_IN[0], 1.15, 0], 38, A("sh19"), 0.0025) },
  ],
  // sh20: Erasyl celebration, score reaches 82!
  sh20: [
    { f: A("sh20"), s: hold([LIB_IN[0] - 0.3, 1.45, 3.0], [LIB_IN[0] - 0.3, 1.15, 0], 38, A("sh20"), 0.002) },
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
