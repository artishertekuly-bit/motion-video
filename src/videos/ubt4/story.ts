// «30 КҮН» 4-күн in the 3D toon world: shots (timed to the voice, timeline.ts), places, light, camera keys, kicks and lens blur.
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
  if (["sh03", "sh04", "sh05", "sh06"].includes(s.key)) light = "night";
  else if (["sh09", "sh10", "sh11", "sh12", "sh13", "sh14", "sh15", "sh16", "sh17", "sh18", "sh19", "sh20"].includes(s.key)) light = "golden";
  return { id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light };
});

export const FLASH_AT = -100;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places ----------------
export const TABLE_K: V3 = [0.5, 0.76, -0.6];
export const FRIDGE: V3 = [-2.35, 0, -2.85];
export const KCLOCK: V3 = [-0.05, 2.55, -3.19];
export const YK: V3 = [0.65, 0.3, -1.25];
export const YSTAND_K: V3 = [0.25, 0, 0.45];
export const MOM_K: V3 = [-0.25, 0, -1.4];

// Corridor
export const CORR_X = 38.5;

// Winter park / evening city
export const PARK_X = 72.0;
export const LAMP_POS: V3 = [71.8, 0, 1.8];
export const YPARK: V3 = [71.3, 0, 0];
export const APARK: V3 = [72.2, 0, 0];
export const SNOWDRIFT_POS: V3 = [72.0, 0, -0.2];
export const SLED_POS: V3 = [72.0, 0, 0];

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
const at = (f: number, pos: V3, look: V3, fov: number, rate = 0.0025, roll = 0): Key => ({ f, cut: true, s: hold(pos, look, fov, f, rate, roll) });

const CAMS: Record<string, Key[]> = {
  // sh01: calendar «27» hook, corridor
  sh01: [
    { f: 0, s: hold([38.5, 1.6, 3.2], [38.5, 1.4, 0], 44, 0, 0.0016) },
    { f: W("n2", 2) - 6, dur: 26, s: hold([38.5, 1.5, 2.2], [38.5, 1.35, 0], 40, W("n2", 2) - 6, 0.002) },
  ],
  // sh02: Yerasyl running home, arriving in kitchen
  sh02: [
    { f: A("sh02"), s: hold([0.8, 1.5, 3.0], [0.3, 1.2, -0.6], 44, A("sh02"), 0.0025) },
    at(W("n3", 3) - 3, [0.35, 1.4, 2.0], [0.35, 1.25, 0.45], 38, 0.003),
  ],
  // sh03: Book tower, 5 cups of tea
  sh03: [
    { f: A("sh03"), s: hold([0.5, 1.35, 1.4], [0.5, 0.95, -0.6], 38, A("sh03"), 0.0025) },
    at(W("n4", 4) - 3, [0.65, 1.3, 0.8], [0.65, 1.05, -1.0], 36, 0.003),
  ],
  // sh04: Clock spinning fast (10 -> 12 -> 3)
  sh04: [
    { f: A("sh04"), s: hold([KCLOCK[0], 2.47, -1.8], [KCLOCK[0], 2.53, KCLOCK[2]], 34, A("sh04"), 0.002) },
    at(W("n5", 3) - 3, [0.65, 1.35, 0.8], [0.65, 1.15, -1.25], 36, 0.003),
  ],
  // sh05: Mom at door in dressing gown
  sh05: [
    { f: A("sh05"), s: hold([MOM_K[0], 1.55, 0.6], [MOM_K[0], 1.4, MOM_K[2]], 36, A("sh05"), 0.0025) },
  ],
  // sh06: Yerasyl determined: "Болмайды, мама! Жұмада бәс бар!"
  sh06: [
    { f: A("sh06"), s: hold([YK[0], 1.42, 0.6], [YK[0], 1.28, YK[2]], 34, A("sh06"), 0.003, 0.03) },
  ],
  // sh07: Dawn light, test solved, 56 балл!
  sh07: [
    { f: A("sh07"), s: hold([0.55, 1.38, 1.6], [0.55, 1.05, -0.8], 38, A("sh07"), 0.002) },
    at(W("n6", 5) - 3, [YK[0], 1.45, 0.7], [YK[0], 1.3, YK[2]], 36, 0.003),
  ],
  // sh08: Exhausted, eye twitch
  sh08: [
    { f: A("sh08"), s: hold([YK[0], 1.35, 0.45], [YK[0], 1.25, YK[2]], 32, A("sh08"), 0.003) },
  ],
  // sh09: Freezer vibrates, frozen phone lights up
  sh09: [
    { f: A("sh09"), s: hold([FRIDGE[0], 1.15, -1.5], [FRIDGE[0], 0.7, FRIDGE[2]], 36, A("sh09"), 0.002) },
  ],
  // sh10: Yerasyl shock/joy "Серуен?!"
  sh10: [
    { f: A("sh10"), s: hold([0.25, 1.45, 1.5], [0.25, 1.35, 0.45], 38, A("sh10"), 0.004, -0.03) },
  ],
  // sh11: City park: evening walk in falling snow
  sh11: [
    { f: A("sh11"), s: hold([PARK_X, 1.45, 3.2], [PARK_X, 1.15, 0], 42, A("sh11"), 0.0018) },
    { f: W("n9", 2), dur: 32, s: hold([PARK_X, 1.4, 2.6], [PARK_X, 1.15, 0], 40, W("n9", 2), 0.002) },
  ],
  // sh12: Aruzhan: "Қандай әдемі..."
  sh12: [
    { f: A("sh12"), s: hold([APARK[0] + 0.1, 1.4, 1.4], [APARK[0], 1.3, APARK[2]], 34, A("sh12"), 0.0025) },
  ],
  // sh13: Yerasyl: "Иә... өте әдемі" (hearts)
  sh13: [
    { f: A("sh13"), s: hold([YPARK[0] - 0.1, 1.4, 1.4], [YPARK[0], 1.3, YPARK[2]], 34, A("sh13"), 0.003, 0.03) },
  ],
  // sh14: Aruzhan giggles: "Мен қарды айтып тұрмын ғой"
  sh14: [
    { f: A("sh14"), s: hold([APARK[0] + 0.1, 1.4, 1.4], [APARK[0], 1.3, APARK[2]], 34, A("sh14"), 0.0025) },
  ],
  // sh15: Yerasyl flustered: "Мен де... қарды"
  sh15: [
    { f: A("sh15"), s: hold([YPARK[0] - 0.1, 1.4, 1.4], [YPARK[0], 1.3, YPARK[2]], 34, A("sh15"), 0.003) },
  ],
  // sh16: Under street lantern: confession
  sh16: [
    { f: A("sh16"), s: hold([PARK_X, 1.42, 2.4], [PARK_X, 1.15, 0], 38, A("sh16"), 0.0025) },
  ],
  // sh17: Falls into snowbank!
  sh17: [
    { f: A("sh17"), s: hold([PARK_X, 1.35, 2.4], [PARK_X, 1.1, 0], 40, A("sh17"), 0.003) },
    at(W("n10", 3), [SNOWDRIFT_POS[0], 1.25, 2.4], [SNOWDRIFT_POS[0], 0.6, 0], 42, 0.004, -0.05),
  ],
  // sh18: Aruzhan: "Ерасыл?!"
  sh18: [
    { f: A("sh18"), s: hold([SNOWDRIFT_POS[0], 1.25, 2.3], [SNOWDRIFT_POS[0], 0.65, 0], 36, A("sh18"), 0.003) },
  ],
  // sh19: Snowbank with kicking boots: "минус жеті де бар..."
  sh19: [
    { f: A("sh19"), s: hold([SNOWDRIFT_POS[0], 1.2, 2.2], [SNOWDRIFT_POS[0], 0.55, 0], 36, A("sh19"), 0.0025) },
  ],
  // sh20: Aruzhan pulling sled with Yerasyl
  sh20: [
    { f: A("sh20"), s: hold([72.4, 1.25, 2.8], [72.4, 0.75, 0], 42, A("sh20"), 0.002) },
  ],
};

const KICKS: [number, number][] = [
  [W("n1", 0) / FPS, 0.6],
  [W("n3", 5) / FPS, 0.5],
  [W("n6", 5) / FPS, 0.7],
  [W("e2", 0) / FPS, 0.8],
  [W("n10", 4) / FPS, 1.0], // falling into snow
  [W("a3", 0) / FPS, 0.6],
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
  const c = run(CAMS[SHOTS[id - 1].key], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens blur ----------------
export type Dof = { f: number; dur?: number; cInf: number };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },
  { f: A("sh02"), cInf: 4 },
  { f: A("sh03"), cInf: 7 },
  { f: A("sh04"), cInf: 12 },
  { f: A("sh05"), cInf: 8 },
  { f: A("sh06"), cInf: 10 },
  { f: A("sh07"), cInf: 7 },
  { f: A("sh08"), cInf: 13 },
  { f: A("sh09"), cInf: 11 },
  { f: A("sh10"), cInf: 8 },
  { f: A("sh11"), cInf: 4 },
  { f: A("sh12"), cInf: 12 },
  { f: A("sh13"), cInf: 12 },
  { f: A("sh14"), cInf: 12 },
  { f: A("sh15"), cInf: 12 },
  { f: A("sh16"), cInf: 7 },
  { f: A("sh17"), cInf: 8 },
  { f: A("sh18"), cInf: 11 },
  { f: A("sh19"), cInf: 10 },
  { f: A("sh20"), cInf: 5 },
];

export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: undefined };
};
