// «Көршінің баласы» — timeline and cameras, timed to materials/korshi-audio/voice/words.json (Kazakh, 71.4 s,
// narrator + two fathers + two boys). Camera grammar from the template: smootherstep glides 18-40 f, cuts on big
// reframes, every hold creeps in, 7-frame flip kicks on impacts.
export const FPS = 30;
export const TOTAL = 2160;
export const D0 = 0; // template compat (build.ts)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const T = (f: number) => f / FPS;

// ---------------- the aul ----------------
// Two yards split by one plank fence (дуал) along x = 0. Asqar's house (green roof) on the left (x < 0), Berik's (red
// roof) on the right; houses face +z (toward the camera side), the steppe pasture lies beyond z = 24, mountains far -z.
export const FENCE = { x: 0, z0: -26, z1: 16.8, h: 1.1 }; // ends 2.8 m past where the boys sit, so lenses on its line stay outside it
export const HOUSE_A: V3 = [-15, 0, -14];
export const HOUSE_B: V3 = [15, 0, -14];
export const TAPSHAN: V3 = [-9, 0, 2]; // the wooden summer bed where Erlan sleeps / plays at night
export const HAY_A: V3 = [-24, 0, -1];
export const HAY_B: V3 = [27, 0, -2];
export const GARDEN_A = { x0: -26, x1: -12, z0: 9, z1: 19 };
export const GARDEN_B = { x0: 12, x1: 26, z0: 9, z1: 19 };
export const HORSE: V3 = [-17, 0, 3];
export const SIT_Z = 14; // where the boys sit against the fence at sunset
export const terrainH = (x: number, z: number) => {
  const r = Math.hypot(x, z - 10);
  const hills = 2.5 * Math.sin(x * 0.012 + 0.6) * Math.sin(z * 0.009 + 1.1) + 1.2 * Math.sin(x * 0.031) * Math.cos(z * 0.027);
  return hills * smooth((r - 70) / 120);
};

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
export type ShotDef = { id: number; a: number; b: number; light: Light; fogK?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 125, light: "day", fogK: 3 }, // hook: the aul from above
  { id: 2, a: 125, b: 277, light: "day", fogK: 2 }, // one fence, two boys
  { id: 3, a: 277, b: 431, light: "day", fogK: 2 }, // Asqar wakes Erlan
  { id: 4, a: 431, b: 603, light: "golden", fogK: 2 }, // dawn: the sheep scatter
  { id: 5, a: 603, b: 687, light: "day", fogK: 2 }, // "three küys on the dombra"
  { id: 6, a: 687, b: 831, light: "night", fogK: 2 }, // dombra all night, dogs howl
  { id: 7, a: 831, b: 910, light: "day", fogK: 2 }, // "first at the bäige"
  { id: 8, a: 910, b: 1040, light: "day", fogK: 2 }, // the horse decides otherwise
  { id: 9, a: 1040, b: 1149, light: "golden", fogK: 2 }, // Erlan at the fence
  { id: 10, a: 1149, b: 1336, light: "golden", fogK: 2 }, // Berik scolds Dauren
  { id: 11, a: 1336, b: 1443, light: "golden", fogK: 2 }, // back to back
  { id: 12, a: 1443, b: 1632, light: "golden", fogK: 2 }, // they hear each other; so do the fathers
  { id: 13, a: 1632, b: 1848, light: "golden", fogK: 2 }, // the neighbour's garden is always green
  { id: 14, a: 1848, b: 2023, light: "golden", fogK: 2 }, // the deal over the fence
  { id: 15, a: 2023, b: TOTAL, light: "golden", fogK: 4 }, // crane up
];
export const XFADE: Record<number, number> = { 4: 8, 5: 8, 6: 10, 7: 10, 9: 10, 13: 8 };
export const FLASH_AT = 125;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- story beats (frames) ----------------
export const BEAT = {
  scatter: 546, // "Бәрі әр жаққа": the sheep run off
  howl: 764, // "Иттер де": dogs howl
  mount: 928, // "атқа": Erlan climbs on
  buck: 966, // "Ат басқа": the horse rears
  land: 1000, // into the haystack
  peek: 1477, // the boys stand and look over the fence
  fathers: 1540, // "Өкінішке орай": the fathers heard it too
  garden: 1672, // "көршінің бақшасы"
  weeds: 1750, // "Өйткені алыстан арамшөп..."
  deal: 1880, // the handshake over the fence
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number; near?: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k, near: b.near ?? a.near,
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
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

const S = SIT_Z;
const C1a = (f: number) => dolly([70, 80, 140], [0, 1, 0], pushK(f, 0, 0.0035), { fov: 44, near: 0.5 });
const C1b = (f: number) => dolly([18, 16, 46], [0, 1.2, 4], pushK(f, 60, 0.003), { fov: 42, near: 0.4 });
const C2a = (f: number) => dolly([0.4, 2.4, 30], [0, 1.1, 8], pushK(f, 125, 0.0022), { fov: 42, near: 0.3 });
const C2b = (f: number) => dolly([-1.6, 1.7, 19.5], [-2.6, 0.9, 11], pushK(f, 205, 0.003), { fov: 38, roll: 0.03, near: 0.3 });
const C2c = (f: number) => dolly([1.6, 1.7, 20.0], [2.6, 0.9, 11.6], pushK(f, 236, 0.003), { fov: 38, roll: -0.03, near: 0.3 });
const C3a = (f: number) => dolly([-15.5, 2.3, 9.5], [-6.5, 0.9, -0.5], pushK(f, 277, 0.0022), { fov: 42, near: 0.3 });
const C3b = (f: number) => dolly([-12.4, 1.7, 6.4], [-8.6, 0.85, 1.6], pushK(f, 370, 0.003, 0.006, 30), { fov: 40, roll: 0.035, near: 0.2 });
const C4a = (f: number) => dolly([-6, 3.0, 54], [-6, 0.8, 39], pushK(f, 431, 0.0022), { fov: 42, near: 0.3 });
const C4b = (f: number) => dolly([-6, 9.0, 58], [-6, 0.0, 39], pushK(f, 540, 0.002), { fov: 46, roll: -0.03, near: 0.4 });
const C5a = (f: number) => dolly([-4.6, 2.5, 13.2], [1.6, 1.25, 4.4], pushK(f, 603, 0.003), { fov: 42, near: 0.2 });
const C6a = (f: number) => dolly([-3.2, 2.2, 9.2], [-9, 1.1, 1.6], pushK(f, 687, 0.0022), { fov: 42, near: 0.2 });
const C6b = (f: number) => dolly([-6.8, 1.2, 13.5], [-11.4, 1.6, 5.6], pushK(f, 760, 0.003), { fov: 44, roll: 0.04, near: 0.2 });
const C7a = (f: number) => dolly([-4.4, 2.4, 12.6], [2.6, 1.35, 3.8], pushK(f, 831, 0.003, 0.006, 30), { fov: 42, roll: -0.03, near: 0.2 });
const C8a = (f: number) => dolly([-12.2, 2.5, 15.5], [-20.2, 1.5, 1.4], pushK(f, 910, 0.0022), { fov: 44, near: 0.3 });
const C9a = (f: number) => dolly([-3.0, 1.05, S + 3.6], [-0.6, 0.75, S], pushK(f, 1040, 0.0025), { fov: 40, near: 0.2 });
const C10a = (f: number) => dolly([3.6, 1.5, S + 5.6], [1.3, 1.0, S - 0.3], pushK(f, 1149, 0.0022), { fov: 44, near: 0.2 });
const C10b = (f: number) => dolly([0, 4.6, S + 3.4], [0, 0.4, S - 0.2], pushK(f, 1288, 0.002), { fov: 46, near: 0.2 });
const C11a = (f: number) => dolly([0, 1.35, S + 6.8], [0, 0.8, S], pushK(f, 1336, 0.0025), { fov: 40, near: 0.2 });
const C12a = (f: number) => dolly([0, 1.75, S + 4.6], [0, 1.2, S], pushK(f, 1443, 0.0025), { fov: 40, near: 0.2 });
const C12b = (f: number) => dolly([0, 2.4, S + 10.5], [0, 1.3, S - 1.0], pushK(f, BEAT.fathers, 0.002, 0.006, 30), { fov: 44, near: 0.2 });
const C13a = (f: number) => dolly([-3.4, 2.5, 12.5], [19, 0.4, 14], pushK(f, 1632, 0.002), { fov: 40, near: 0.2 });
const C13b = (f: number) => dolly([17.2, 0.75, 21.2], [18.2, 0.32, 18.5], pushK(f, BEAT.weeds, 0.003), { fov: 42, near: 0.1 }); // from the garden's front edge into the first rows
const C14a = (f: number) => dolly([0, 1.85, S + 6.0], [0, 1.45, S - 2.0], pushK(f, 1848, 0.0025), { fov: 40, near: 0.2 });
const C15a = (f: number): Shot => {
  const u = glide((f - 2023) / 130);
  return { pos: [8 * u, 3 + 52 * u, S + 10 + 50 * u], look: [0, 1.2 - 1.2 * u, S - 6 - 6 * u], fov: 42 + 6 * u, roll: 0, near: 0.3 };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: C1a }, { f: 60, dur: 40, s: C1b }],
  2: [{ f: 125, s: C2a }, { f: 205, dur: 20, s: C2b }, { f: 236, dur: 18, s: C2c }],
  3: [{ f: 277, s: C3a }, { f: 370, dur: 22, s: C3b }],
  4: [{ f: 431, s: C4a }, { f: 540, dur: 20, s: C4b }],
  5: [{ f: 603, s: C5a }],
  6: [{ f: 687, s: C6a }, { f: 760, dur: 22, s: C6b }],
  7: [{ f: 831, s: C7a }],
  8: [{ f: 910, s: C8a }],
  9: [{ f: 1040, s: C9a }],
  10: [{ f: 1149, s: C10a }, { f: 1288, dur: 30, s: C10b }],
  11: [{ f: 1336, s: C11a }],
  12: [{ f: 1443, s: C12a }, { f: BEAT.fathers, cut: true, s: C12b }],
  13: [{ f: 1632, s: C13a }, { f: BEAT.weeds, cut: true, s: C13b }],
  14: [{ f: 1848, s: C14a }],
  15: [{ f: 2023, s: C15a }],
};

const KICKS: [number, number][] = [[T(BEAT.scatter), 0.6], [T(BEAT.buck), 0.5], [T(BEAT.land), 1.3], [T(BEAT.fathers), 0.4]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

/** lens blur per beat: cInf px at 1080x1920 (0 = sharp) */
type DofKey = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const DOF: DofKey[] = [
  { f: 0, cInf: 0 }, { f: 125, cInf: 8 }, { f: 205, dur: 20, cInf: 11 }, { f: 277, cInf: 10 }, { f: 370, dur: 22, cInf: 13 },
  { f: 431, cInf: 8 }, { f: 540, cInf: 4 }, { f: 603, cInf: 9 }, { f: 687, cInf: 10 }, { f: 760, cInf: 12 }, { f: 831, cInf: 10 },
  { f: 910, cInf: 7 }, { f: 1040, cInf: 13 }, { f: 1149, cInf: 11 }, { f: 1288, dur: 30, cInf: 7 }, { f: 1336, cInf: 10 },
  { f: 1443, cInf: 12 }, { f: 1540, cInf: 8 }, { f: 1632, cInf: 6 }, { f: 1750, cInf: 14 }, { f: 1848, cInf: 10 }, { f: 2023, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
