// «30 КҮН» 2-күн in the 3D toon world: shots (timed to the voice, timeline.ts), places, light, camera keys, kicks and
// lens blur. Camera grammar from the bridge short: hard cuts on big jumps, smootherstep glides, every hold creeps in,
// flip kicks on impacts. World units are metres, floor y = 0. Places: kitchen (x -3..3), library (x 24..36.2),
// corridor (x 36.2..41).
import { BOUNDS, CARD_AT, FPS, TOTAL as T_ALL, ws } from "./timeline";

export { FPS };
export const TOTAL = T_ALL;
export const D0 = 0; // build.ts (bridge helpers) reads this
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

export type Light = "day" | "golden";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => ({
  id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light: s.key === "sh16" ? "golden" : "day",
}));
export const FLASH_AT = -100; // no white flash (the «29» slam overlay does the hook)
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- places (shared with world.ts / cast.ts) ----------------
export const TABLE_K: V3 = [0.5, 0.76, -0.6]; // kitchen table top centre
export const FRIDGE: V3 = [-2.35, 0, -2.85]; // kitchen fridge (floor centre)
export const DESK: V3 = [34.2, 0.8, 2.0]; // library desk top centre
export const RTABLE: V3 = [29.5, 0.76, -1.8]; // library reading table top centre
export const SHELF_Z = -6.75; // library back-wall shelves front face
export const DOOR_X = 36.2; // library door wall (corridor on +x)
export const YSEAT: V3 = [29.2, 0.3, -2.75]; // Yerasyl seated behind the reading table
export const BOOK_AT: V3 = [29.2, 0.76, -2.1]; // the thick book standing on the table, cover toward +z

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

const [tx] = TABLE_K, [rx] = RTABLE, [dx, , dz] = DESK;
const CAMS: Record<string, Key[]> = {
  // ас үй: анасы (сол жақта, тоңазытқыш жанында) телефонды алып тұр, Ерасыл үстел басында
  sh01: [
    { f: 0, s: hold([0.9, 1.55, 2.6], [0.0, 1.1, -1.4], 44, 0, 0.0016) },
    { f: W("n2", 3) - 12, dur: 30, s: hold([0.25, 1.5, 1.0], [-0.6, 1.25, -1.55], 40, W("n2", 3) - 12, 0.002) },
  ],
  // мұздатқыш ішіне қарап: телефон еттің арасына түседі
  sh02: [{ f: 221, s: hold([FRIDGE[0] + 0.05, 1.75, -1.55], [FRIDGE[0], 0.15, -2.25], 40, 221, 0.003) }],
  // үстел: Ерасыл, нан; «Нанды» — қолға жақын
  sh03: [
    { f: 319, s: hold([tx + 0.15, 1.3, 1.25], [tx, 1.0, -1.15], 40, 319, 0.0022) },
    { f: W("n3", 8) - 2, cut: true, s: hold([tx + 0.05, 1.42, 0.5], [tx, 0.82, -0.4], 36, W("n3", 8) - 2, 0.003, 0.05) },
  ],
  // ой-бұлт: Аружан, грант; «Дәлел керек» — төменнен, түрегеліп тұр
  sh04: [
    { f: 453, s: hold([tx + 0.25, 1.6, 1.9], [tx, 1.55, -1.2], 42, 453, 0.002) },
    { f: W("n4", 8) - 2, cut: true, s: hold([tx + 0.55, 0.85, 0.75], [tx, 1.45, -1.25], 44, W("n4", 8) - 2, 0.003, -0.05) },
  ],
  // дәліз: есікке қарай жүреді, «Кітапханаға» — есік ашылады
  sh05: [
    { f: 585, s: hold([40.4, 1.4, 0.6], [36.4, 1.55, 0.4], 44, 585, 0.0016) },
    { f: W("n5", 7) - 14, dur: 26, s: hold([38.9, 0.85, 0.9], [36.6, 1.55, -0.25], 46, W("n5", 7) - 14, 0.003, 0.04) },
  ],
  // кітапханашы апай үстел артында
  sh06: [{ f: 740, s: hold([dx, 1.5, -0.7], [dx, 1.4, dz + 0.8], 38, 740, 0.0022) }],
  // сөре: ең қалың кітап
  sh07: [
    { f: 864, s: hold([30.6, 1.3, -3.7], [30.5, 1.15, -6.6], 40, 864, 0.002) },
    { f: W("n7", 4) - 12, dur: 24, s: hold([30.6, 1.15, -4.4], [30.5, 1.2, -6.6], 38, W("n7", 4) - 12, 0.003) },
  ],
  // есік ашылады — Аружан; сосын Ерасыл кітаптың артында
  sh08: [
    { f: 975, s: hold([32.0, 1.5, -1.6], [36.4, 1.3, 0.0], 42, 975, 0.0018) },
    { f: W("n8", 4) - 6, dur: 18, s: hold([33.6, 1.45, -1.0], [36.5, 1.35, 0.0], 38, W("n8", 4) - 6, 0.003) },
    { f: 1054, cut: true, s: hold([YSEAT[0], 1.32, -0.35], [YSEAT[0], 1.25, -2.6], 36, 1054, 0.003) },
  ],
  // Аружан стол жанында сұрайды
  sh09: [{ f: 1069, s: hold([rx + 0.25, 1.45, 1.6], [rx + 0.15, 1.15, -2.0], 42, 1069, 0.002) }],
  // Ерасыл: «мұнда күнде келемін»
  sh10: [{ f: 1168, s: hold([YSEAT[0], 1.38, -0.5], [YSEAT[0], 1.3, -2.7], 36, 1168, 0.003, 0.04) }],
  // апай: «бірінші рет көріп тұрмын»
  sh11: [{ f: 1249, s: hold([dx - 1.2, 1.5, 0.15], [dx + 0.1, 1.4, dz + 0.8], 38, 1249, 0.0025) }],
  // ӨТІРІК №2
  sh12: [{ f: 1349, s: hold([YSEAT[0] + 0.1, 1.38, -0.6], [YSEAT[0], 1.3, -2.7], 34, 1349, 0.003, -0.06) }],
  // кітап төңкеріліп тұр
  sh13: [
    { f: 1443, s: hold([rx + 0.25, 1.45, 1.6], [rx + 0.15, 1.15, -2.0], 42, 1443, 0.002) },
    { f: W("a2", 1) - 3, cut: true, s: hold([BOOK_AT[0], 1.05, -1.0], [BOOK_AT[0], 1.03, -2.1], 34, W("a2", 1) - 3, 0.003) },
  ],
  // Аружан күледі, қасына отырады
  sh14: [{ f: 1538, s: hold([rx + 0.25, 1.45, 1.5], [rx + 0.2, 1.1, -2.0], 42, 1538, 0.0022) }],
  // «ертең жетіде» -> «Келемін!»
  sh15: [
    { f: 1623, s: hold([rx + 0.25, 1.45, 1.5], [rx + 0.2, 1.1, -2.0], 42, 1623, 0.0018) },
    { f: W("e2", 0) - 3, cut: true, s: hold([YSEAT[0] + 0.3, 1.0, -0.2], [YSEAT[0], 1.35, -2.7], 46, W("e2", 0) - 3, 0.004, 0.05) },
  ],
  // кешкі (алтын) жарық: жалғыз; «бесінші сыныпта» — жақын
  sh16: [
    { f: 1770, s: hold([26.8, 1.85, 1.6], [29.3, 1.0, -2.3], 44, 1770, 0.0016) },
    { f: W("n11", 4) - 2, cut: true, s: hold([YSEAT[0] + 0.1, 1.38, -0.55], [YSEAT[0], 1.3, -2.7], 34, W("n11", 4) - 2, 0.0025, 0.05) },
  ],
};

// impact kicks: the image offset flips sign every frame and decays over 7 f
const KICKS: [number, number][] = [
  [W("n2", 9) / FPS, 0.5], // телефон мұздатқышқа түседі
  [W("n4", 8) / FPS, 0.6], // «Дәлел керек»
  [W("n7", 7) / FPS, 1.0], // кітап «гүрс»
  [W("n9", 2) / FPS, 1.2], // ӨТІРІК №2 штампы
  [W("e2", 0) / FPS, 0.6], // «Келемін!»
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
  { f: 221, cInf: 12 }, // мұздатқыш CU
  { f: 319, cInf: 8 }, // үстел MS
  { f: W("n3", 8) - 2, cInf: 13 }, // нан CU
  { f: 453, cInf: 8 },
  { f: W("n4", 8) - 2, cInf: 6 },
  { f: 585, cInf: 0 }, // дәліз
  { f: 740, cInf: 10 }, // апай MS
  { f: 864, cInf: 8 },
  { f: 975, cInf: 0 }, // есік
  { f: 1054, cInf: 12 }, // Ерасыл CU
  { f: 1069, cInf: 7 },
  { f: 1168, cInf: 13 },
  { f: 1249, cInf: 10 },
  { f: 1349, cInf: 14 },
  { f: 1443, cInf: 7 },
  { f: W("a2", 1) - 3, cInf: 14 },
  { f: 1538, cInf: 7 },
  { f: W("e2", 0) - 3, cInf: 8 },
  { f: 1770, cInf: 0 },
  { f: W("n11", 4) - 2, cInf: 13 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
