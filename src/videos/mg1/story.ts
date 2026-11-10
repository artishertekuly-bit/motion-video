// «Барыс ағай» 1-сабақ in the 3D toon classroom: shots (timed to the voice, timeline.ts), places, light, camera keys,
// kicks and lens blur. Camera grammar from the bridge short: hard cuts, smootherstep glides, every hold creeps in.
// World units are metres, floor y = 0; the board wall is at z = -4, pupils sit facing -z (toward the board), so every
// camera that shows pupils looks at them from the board side (the toon kids only have front and side drawings).
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
export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => ({ id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light: "day" }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places (shared with world.ts / stage.ts) ----------------
export const BOARD = { x0: -2.6, x1: 1.4, y0: 0.9, y1: 2.25, z: -3.97 }; // chalkboard on the front wall
export const TDESK = { x0: 1.75, x1: 3.15, z0: -3.15, z1: -2.45, h: 0.76 }; // teacher's desk
export const EQ_X = -0.2; // centre of «2 + 2 = 5» on the board (world x)
export const T_BOARD: V3 = [-1.2, 0, -3.5]; // Barys left of the equation, pointer to the right
export const T_DESK: V3 = [2.45, 0, -3.25]; // Barys behind his desk (the top hides his legs)
export const A_BOARD: V3 = [0.7, 0, -3.45]; // Әлихан right of the equation at the end
/** pupils' seats: [x, z] (chairs face the board; y = 0.3 for the sitting card) */
export const SEAT_Y = 0.3;
export const ROWZ = [-0.13, 1.67, 3.47];
export const ALI: V3 = [-1.45, SEAT_Y, ROWZ[2]]; // Әлихан — back row, left column, aisle seat
export const TOM: V3 = [-1.45, SEAT_Y, ROWZ[0]]; // Томирис — front row left, aisle
export const NUR: V3 = [1.45, SEAT_Y, ROWZ[0]]; // Нұрлыбек — front row right, aisle
export const SAN: V3 = [1.45, SEAT_Y, ROWZ[1]]; // Санжар — middle row right, aisle
export const NUR_UP: V3 = [0.98, 0, 0.12]; // Нұрлыбек standing in the aisle beside his desk
export const ALI_UP: V3 = [-0.98, 0, 3.6]; // Әлихан standing in the aisle beside his desk

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
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** framing that creeps in from frame f0 */
const hold = (pos: V3, look: V3, fov: number, f0: number, rate = 0.0022, roll = 0) => (f: number) => dolly(pos, look, pushK(f, f0, rate), { fov, roll });
const W = (id: string, i: number) => ws(id, i);
const A = (k: string) => shotStart(k);
const at = (f: number, pos: V3, look: V3, fov: number, rate = 0.0025, roll = 0): Key => ({ f, cut: true, s: hold(pos, look, fov, f, rate, roll) });

const [tdx, , tdz] = T_DESK, [ax, , az] = ALI, [tx, , tz] = TOM, [sx, , sz] = SAN, [nx, , nz] = NUR_UP, [aux, , auz] = ALI_UP;
// the pupils' columns seen from the board side
const COL_L: [V3, V3] = [[-1.0, 1.6, -2.75], [-1.75, 0.92, 2.2]];
const COL_R: [V3, V3] = [[1.0, 1.6, -2.75], [1.75, 0.92, 2.2]];
const BOARD_WIDE: [V3, V3] = [[-0.22, 1.4, 0.95], [-0.24, 1.45, -3.6]];
const CAMS: Record<string, Key[]> = {
  // chalk «2 + 2 = 5»; Barys turns and points; push in on «Кім дәлелдесе»
  sh01: [
    { f: 0, s: hold([-0.38, 1.45, 0.5], [-0.42, 1.5, -3.6], 52, 0, 0.0016) },
    { f: W("t1", 6) - 6, dur: 40, s: hold([-0.95, 1.5, -1.6], [-1.1, 1.45, -3.5], 42, W("t1", 6) - 6, 0.002) },
  ],
  // «Ооо!» — the left column from high up by the board
  sh02: [{ f: A("sh02"), s: hold([-1.1, 2.45, -3.3], [-1.75, 0.75, 1.6], 50, A("sh02"), 0.003) }],
  // back desk: Әлихан; the diary; his face
  sh03: [
    { f: A("sh03"), s: hold([ax + 0.35, 1.6, az - 2.6], [ax, 0.95, az], 40, A("sh03"), 0.002) },
    at(W("n1", 4) - 3, [ax + 0.15, 1.35, az - 1.75], [ax + 0.1, 0.95, az], 38, 0.0025),
    at(W("n1", 8) - 3, [ax + 0.05, 1.25, az - 1.45], [ax, 1.05, az], 36, 0.003),
  ],
  // Barys behind his desk: «он бес минут»
  sh04: [{ f: A("sh04"), s: hold([tdx + 0.3, 1.5, tdz + 2.6], [tdx, 1.42, tdz], 38, A("sh04"), 0.0025) }],
  // Томирис writes; «мүмкін емес қой!»
  sh05: [
    { f: A("sh05"), s: hold([tx + 0.3, 1.45, tz - 1.9], [tx + 0.05, 0.95, tz], 38, A("sh05"), 0.0022) },
    at(W("o1", 0) - 3, [tx + 0.05, 1.25, tz - 1.45], [tx, 1.05, tz], 36, 0.003, 0.03),
  ],
  // insert: pencils on Әлихан's desk
  sh06: [{ f: A("sh06"), s: hold([ax + 0.1, 1.25, az - 1.6], [ax + 0.08, 0.92, az - 0.3], 34, A("sh06"), 0.003) }],
  // Санжар and the phone; he lifts it (camera between the front-row pupils and his desk)
  sh07: [
    { f: A("sh07"), s: hold([sx - 0.3, 1.45, 0.12], [sx, 0.98, sz], 40, A("sh07"), 0.002) },
    at(W("s1", 0) - 3, [sx - 0.15, 1.3, 0.3], [sx - 0.05, 1.05, sz], 36, 0.0025, -0.03),
  ],
  // Barys: «жер жалпақ деп те жазылған» (bubble above his head)
  sh08: [{ f: A("sh08"), s: hold([tdx + 0.2, 1.5, tdz + 2.3], [tdx + 0.12, 1.45, tdz], 40, A("sh08"), 0.0025) }],
  // the right column laughs; Нұрлыбек gets up and makes his case
  sh09: [
    { f: A("sh09"), s: hold(COL_R[0], COL_R[1], 50, A("sh09"), 0.0025) },
    at(W("u1", 0) - 3, [nx - 0.2, 1.35, nz - 2.3], [nx, 1.0, nz], 40, 0.0025, 0.03),
  ],
  // Barys straightens his glasses
  sh10: [{ f: A("sh10"), s: hold([tdx + 0.2, 1.45, tdz + 1.9], [tdx + 0.1, 1.35, tdz], 36, A("sh10"), 0.003) }],
  // Әлихан counts his pencils
  sh11: [{ f: A("sh11"), s: hold([ax + 0.15, 1.25, az - 1.6], [ax + 0.05, 0.98, az - 0.2], 36, A("sh11"), 0.0025) }],
  // «Бес минут қалды» — the left column; a hand at the back
  sh12: [
    { f: A("sh12"), s: hold([-1.1, 2.45, -3.3], [-1.75, 0.75, 1.6], 48, A("sh12"), 0.0015) },
    { f: W("n6", 4) - 4, dur: 34, s: hold([-1.15, 1.5, 0.9], [ax, 1.15, az], 42, W("n6", 4) - 4, 0.002) },
  ],
  // Әлихан on his feet: «бұл қате»
  sh13: [
    { f: A("sh13"), s: hold([aux - 0.2, 1.3, auz - 2.3], [aux, 0.95, auz], 40, A("sh13"), 0.002) },
    at(W("a1", 6) - 3, [aux - 0.08, 1.2, auz - 1.75], [aux, 1.02, auz], 38, 0.003),
  ],
  // the class laughs — wide left column, Әлихан standing at the back
  sh14: [{ f: A("sh14"), s: hold(COL_L[0], [-1.6, 1.0, 2.4], 50, A("sh14"), 0.002, -0.02) }],
  // the journal on Barys's desk: red «5»
  sh15: [{ f: A("sh15"), s: hold([tdx - 0.12, 1.55, tdz + 1.35], [tdx - 0.08, 0.78, tdz + 0.42], 40, A("sh15"), 0.003) }],
  // Barys: «Ол дәлелдеді — бұл қате.»
  sh16: [{ f: A("sh16"), s: hold([tdx - 0.1, 1.45, tdz + 2.1], [tdx, 1.32, tdz], 38, A("sh16"), 0.0025) }],
  // Әлихан beams
  sh17: [{ f: A("sh17"), s: hold([aux - 0.15, 1.3, auz - 2.1], [aux, 0.95, auz], 40, A("sh17"), 0.0025, 0.03) }],
  // at the board: tap-tap, the chalk
  sh18: [{ f: A("sh18"), s: hold(BOARD_WIDE[0], BOARD_WIDE[1], 54, A("sh18"), 0.002) }],
  // board close-up: strike, «4», the motto
  sh19: [{ f: A("sh19"), s: hold([EQ_X + 0.05, 1.5, -0.3], [EQ_X + 0.05, 1.55, -3.97], 46, A("sh19"), 0.0012) }],
  // the two of them at the board
  sh20: [{ f: A("sh20"), s: hold(BOARD_WIDE[0], BOARD_WIDE[1], 54, A("sh20"), 0.0025) }],
};

// impact kicks: the image offset flips sign every frame and decays over 7 f
const KICKS: [number, number][] = [
  [W("t1", 4) / FPS, 0.5], // «Дәлелдеңдер!»
  [(A("sh02") + 2) / FPS, 0.7], // «Ооо!»
  [W("s1", 0) / FPS, 0.5], // phone up
  [(W("u1", 3) + 1) / FPS, 0.7], // «барыссыз!»
  [W("a1", 2) / FPS, 0.5], // «қате»
  [(A("sh15") + 10) / FPS, 1.0], // the stamp
  [W("n8", 4) / FPS, 0.6], // «бес алды»
  [(A("sh18") + 6) / FPS, 0.4], // tap
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
  { f: 0, cInf: 5, focus: () => [EQ_X - 0.4, 1.6, -3.6] },
  { f: A("sh02"), cInf: 6, focus: () => [-1.6, 1.0, 1.0] },
  { f: A("sh03"), cInf: 9, focus: () => [ax, 1.05, az] },
  { f: A("sh04"), cInf: 9, focus: () => [tdx, 1.45, tdz] },
  { f: A("sh05"), cInf: 10, focus: () => [tx, 1.0, tz] },
  { f: A("sh06"), cInf: 13, focus: () => [ax, 0.85, az - 0.35] },
  { f: A("sh07"), cInf: 10, focus: () => [sx, 1.0, sz] },
  { f: A("sh08"), cInf: 10, focus: () => [tdx, 1.55, tdz] },
  { f: A("sh09"), cInf: 6, focus: () => [1.6, 1.0, 1.0] },
  { f: W("u1", 0) - 3, cInf: 9, focus: () => [nx, 1.3, nz] },
  { f: A("sh10"), cInf: 12, focus: () => [tdx, 1.6, tdz] },
  { f: A("sh11"), cInf: 12, focus: () => [ax, 1.0, az] },
  { f: A("sh12"), cInf: 5, focus: () => [-1.6, 1.0, 1.0] },
  { f: W("n6", 4) - 4, dur: 34, cInf: 8, focus: () => [ax, 1.2, az] },
  { f: A("sh13"), cInf: 9, focus: () => [aux, 1.35, auz] },
  { f: A("sh14"), cInf: 5, focus: () => [-1.6, 1.0, 1.5] },
  { f: A("sh15"), cInf: 12, focus: () => [tdx - 0.05, 0.8, tdz + 0.38] },
  { f: A("sh16"), cInf: 10, focus: () => [tdx, 1.5, tdz] },
  { f: A("sh17"), cInf: 11, focus: () => [aux, 1.4, auz] },
  { f: A("sh18"), cInf: 4, focus: () => [EQ_X, 1.4, -3.5] },
  { f: A("sh19"), cInf: 3, focus: () => [EQ_X, 1.6, -3.97] },
  { f: A("sh20"), cInf: 4, focus: () => [EQ_X, 1.4, -3.5] },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
