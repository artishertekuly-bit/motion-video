// «30 КҮН» 3-күн in the 3D toon world: shots (timed to the voice, timeline.ts), places, light, camera keys, kicks and
// lens blur. Camera grammar from the bridge short: hard cuts on big jumps, smootherstep glides, every hold creeps in,
// flip kicks on impacts. World units are metres, floor y = 0. Places: kitchen (x -3..3), library (x 24..36.2),
// corridor (x 36.2..41).
import { BOUNDS, CARD_AT, FPS, TOTAL as T_ALL, shotStart, ws } from "./timeline";

export { FPS };
export const TOTAL = T_ALL;
export const D0 = 0; // build.ts (bridge helpers) reads this
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

export type Light = "day" | "golden" | "night";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => ({
  id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light: s.key === "sh01" || s.key === "sh02" ? "night" : "day",
}));
export const FLASH_AT = -100; // no white flash (the «28» slam overlay does the hook)
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places (shared with world.ts / stage.ts) ----------------
export const TABLE_K: V3 = [0.5, 0.76, -0.6]; // kitchen table top centre
export const FRIDGE: V3 = [-2.35, 0, -2.85]; // kitchen fridge (floor centre)
export const KCLOCK: V3 = [-0.05, 2.55, -3.19]; // kitchen wall clock (4:00)
export const YK: V3 = [0.65, 0.3, -1.25]; // Yerasyl seated at the kitchen table
export const YSTAND_K: V3 = [0.25, 0, 0.45]; // Yerasyl standing in front of the kitchen table
export const MOM_K: V3 = [-0.25, 0, -1.4]; // mom by the table corner (lights on)
export const MOM_K2: V3 = [-0.6, 0, 0.1]; // mom beside him in the perfume cloud
export const DESK: V3 = [34.2, 0.8, 2.0]; // library desk top centre
export const FLOWER: V3 = [34.6, 0.8, 1.85]; // librarian's flower pot on the desk
export const RTABLE: V3 = [29.5, 0.76, -1.8]; // library reading table top centre
export const SHELF_Z = -6.75; // library back-wall shelves front face
export const DOOR_X = 36.2; // library door wall (corridor on +x)
export const LCLOCK: V3 = [30.1, 3.62, -6.62]; // library clock above the shelves (7:00)
export const YSEAT: V3 = [29.3, 0.3, -2.75]; // Yerasyl seated behind the reading table
export const ASEAT: V3 = [29.95, 0.3, -2.75]; // Aruzhan seated next to him
export const YIN: V3 = [31.15, 0, -1.6]; // Yerasyl standing at the right end of the table, just in
export const NOTE_AT: V3 = [29.62, 0.763, -1.85]; // the notebook «x² = 49»
export const BOOK_AT: V3 = [28.75, 0.76, -1.75]; // Day 2's thick book, lying flat now

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
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
/** dolly push toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** framing that creeps in from frame f0 */
const hold = (pos: V3, look: V3, fov: number, f0: number, rate = 0.0022, roll = 0) => (f: number) => dolly(pos, look, pushK(f, f0, rate), { fov, roll });
const W = (id: string, i: number) => ws(id, i);
const A = (k: string) => shotStart(k); // shot start frame
/** a key that cuts at frame f to a creeping hold */
const at = (f: number, pos: V3, look: V3, fov: number, rate = 0.0025, roll = 0): Key => ({ f, cut: true, s: hold(pos, look, fov, f, rate, roll) });

const [ykx] = YK, [ys] = YSEAT, [ax] = ASEAT, [dx, , dz] = DESK, [nx, , nz] = NOTE_AT;
const TWO: V3 = [(ys + ax) / 2, 1.45, 0.25], TWO_L: V3 = [(ys + ax) / 2, 1.15, -2.75]; // the study two-shot
const CAMS: Record<string, Key[]> = {
  // night kitchen: Yerasyl sits in the dark; «таңғы жетіде» — thought cloud
  sh01: [
    { f: 0, s: hold([0.9, 1.55, 2.6], [0.25, 1.25, -1.4], 44, 0, 0.0016) },
    { f: W("n2", 2) - 8, dur: 30, s: hold([0.8, 1.55, 1.25], [0.62, 1.45, -1.3], 42, W("n2", 2) - 8, 0.0022) },
  ],
  // clock 3:59 -> 4:00; sleepless eyes; sitting ready
  sh02: [
    { f: A("sh02"), s: hold([KCLOCK[0], 2.47, -1.8], [KCLOCK[0], 2.53, KCLOCK[2]], 36, A("sh02"), 0.002) },
    at(W("n3", 2) - 3, [ykx, 1.36, 0.5], [ykx, 1.32, -1.25], 32, 0.003),
    at(W("n3", 7) - 3, [0.55, 1.35, 2.35], [0.55, 1.0, -1.3], 42, 0.0022),
  ],
  // the light goes on: mom
  sh03: [
    { f: A("sh03"), s: hold([0.3, 1.5, 2.25], [0.2, 1.25, -1.3], 42, A("sh03"), 0.002) },
    at(W("m1", 2) - 3, [MOM_K[0] + 0.05, 1.55, 0.55], [MOM_K[0], 1.45, MOM_K[2]], 36, 0.003),
  ],
  // the suit (tilt up), the perfume, «half a bottle» — wide
  sh04: [
    { f: A("sh04"), s: hold([YSTAND_K[0], 1.0, 2.45], [YSTAND_K[0], 0.75, YSTAND_K[2]], 40, A("sh04"), 0.0015) },
    { f: W("n4", 1) - 4, dur: 30, s: hold([YSTAND_K[0], 1.42, 2.3], [YSTAND_K[0], 1.35, YSTAND_K[2]], 40, W("n4", 1) - 4, 0.0022) },
    at(W("n4", 4) - 3, [0.75, 1.5, 1.9], [YSTAND_K[0], 1.42, YSTAND_K[2]], 36, 0.003),
    at(W("n4", 7) - 3, [0.25, 1.55, 3.05], [-0.15, 1.2, 0.3], 44, 0.0025, 0.04),
  ],
  // library 7:00: from the clock down to Aruzhan
  sh05: [
    { f: A("sh05"), s: hold([LCLOCK[0], 3.38, -4.6], [LCLOCK[0], 3.6, LCLOCK[2]], 36, A("sh05"), 0.002) },
    { f: W("n5", 2) - 10, dur: 32, s: hold([28.7, 1.55, 0.9], [29.75, 1.15, -2.7], 42, W("n5", 2) - 10, 0.0018) },
  ],
  // the door: first the smell, then Yerasyl
  sh06: [{ f: A("sh06"), s: hold([32.6, 1.5, -1.5], [36.4, 1.3, 0.0], 40, A("sh06"), 0.0018) }],
  // the librarian's flower wilts
  sh07: [{ f: A("sh07"), s: hold([34.18, 1.36, 0.3], [34.42, 1.17, 2.25], 36, A("sh07"), 0.0025) }],
  // Aruzhan sneezes
  sh08: [{ f: A("sh08"), s: hold([ax + 0.05, 1.38, -0.55], [ax, 1.25, -2.75], 36, A("sh08"), 0.0025) }],
  // «the smell of knowledge»
  sh09: [{ f: A("sh09"), s: hold([YIN[0] - 0.4, 1.5, 0.6], [YIN[0], 1.45, YIN[2]], 36, A("sh09"), 0.003, 0.04) }],
  // the librarian
  sh10: [{ f: A("sh10"), s: hold([dx - 1.2, 1.5, 0.15], [dx + 0.15, 1.4, dz + 0.8], 38, A("sh10"), 0.0025) }],
  // the windows open; «minus fifteen» — both shiver at the table
  sh11: [
    { f: A("sh11"), s: hold([27.4, 1.75, 0.6], [24.05, 1.95, -1.5], 42, A("sh11"), 0.002) },
    at(W("n8", 4) - 3, TWO, TWO_L, 40, 0.0025),
  ],
  // the first problem: the notebook
  sh12: [
    { f: A("sh12"), s: hold(TWO, TWO_L, 40, A("sh12"), 0.002) },
    at(W("a2", 2) - 3, [nx, 1.58, nz + 0.75], [nx, NOTE_AT[1], nz], 40, 0.003),
    at(W("a2", 7) - 3, TWO, TWO_L, 40, 0.003),
  ],
  // his brain is loading
  sh13: [{ f: A("sh13"), s: hold([ys, 1.36, -0.55], [ys, 1.32, -2.75], 34, A("sh13"), 0.003) }],
  // «Жеті!» — jumps up
  sh14: [{ f: A("sh14"), s: hold([ys + 0.2, 0.95, -0.4], [ys, 1.4, -2.75], 46, A("sh14"), 0.004, 0.05) }],
  // «Дұрыс!»; «with his own head»
  sh15: [
    { f: A("sh15"), s: hold([TWO[0], 1.55, 0.35], [TWO[0], 1.3, -2.75], 40, A("sh15"), 0.002) },
    at(W("n10", 1) - 3, [ys, 1.62, -0.6], [ys, 1.52, -2.75], 36, 0.003),
  ],
  // «Well done! But minus seven too»
  sh16: [
    { f: A("sh16"), s: hold([ax + 0.05, 1.38, -0.6], [ax, 1.25, -2.75], 36, A("sh16"), 0.0025) },
    at(W("a3", 1) - 3, [ys, 1.62, -0.6], [ys, 1.52, -2.75], 36, 0.003),
  ],
  // the bet; «Келістік!»
  sh17: [
    { f: A("sh17"), s: hold(TWO, TWO_L, 40, A("sh17"), 0.0018) },
    at(W("e3", 0) - 3, [TWO[0], 1.28, -0.55], [TWO[0], 1.05, -2.5], 40, 0.004, -0.04),
  ],
};

// impact kicks: the image offset flips sign every frame and decays over 7 f
const KICKS: [number, number][] = [
  [W("m1", 0) / FPS, 0.6], // «Ойбай!»
  [W("n4", 8) / FPS, 0.8], // «бөтелке» — the cloud
  [W("n6", 6) / FPS, 0.5], // Yerasyl comes in
  [(W("a1", 0) + 2) / FPS, 1.1], // «Апчхи!»
  [W("n8", 3) / FPS, 0.6], // the window opens
  [W("e2", 0) / FPS, 0.8], // «Жеті!»
  [W("n10", 0) / FPS, 0.5], // «Дұрыс!»
  [W("a3", 2) / FPS, 0.6], // «минус жеті»
  [W("e3", 0) / FPS, 0.7], // «Келістік!»
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

// ---------------- lens blur (cInf px at 1080x1920; 0 = sharp) ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },
  { f: W("n2", 2) - 8, dur: 30, cInf: 7 },
  { f: A("sh02"), cInf: 12 }, // clock CU
  { f: W("n3", 2) - 3, cInf: 13 }, // eyes CU
  { f: W("n3", 7) - 3, cInf: 5 },
  { f: A("sh03"), cInf: 6 },
  { f: W("m1", 2) - 3, cInf: 11 },
  { f: A("sh04"), cInf: 9 },
  { f: W("n4", 4) - 3, cInf: 12 },
  { f: W("n4", 7) - 3, cInf: 4 },
  { f: A("sh05"), cInf: 11 }, // clock CU
  { f: W("n5", 2) - 10, dur: 32, cInf: 4 },
  { f: A("sh06"), cInf: 0 },
  { f: A("sh07"), cInf: 11 },
  { f: A("sh08"), cInf: 12 },
  { f: A("sh09"), cInf: 12 },
  { f: A("sh10"), cInf: 10 },
  { f: A("sh11"), cInf: 6 },
  { f: W("n8", 4) - 3, cInf: 7 },
  { f: A("sh12"), cInf: 7 },
  { f: W("a2", 2) - 3, cInf: 13 },
  { f: W("a2", 7) - 3, cInf: 7 },
  { f: A("sh13"), cInf: 13 },
  { f: A("sh14"), cInf: 8 },
  { f: A("sh15"), cInf: 7 },
  { f: W("n10", 1) - 3, cInf: 12 },
  { f: A("sh16"), cInf: 12 },
  { f: A("sh17"), cInf: 7 },
  { f: W("e3", 0) - 3, cInf: 9 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
