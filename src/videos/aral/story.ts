// «Арал: кемелер шөлде» — timeline, sea levels and cameras, timed to materials/aral-audio/voice/words.json
// (Kazakh narration, 64.8 s). Camera grammar from the template (motion.md): smootherstep glides 18-40 f, cuts on big
// reframes, every hold creeps in, 7-frame flip kicks on impacts.
export const FPS = 30;
export const TOTAL = 1959;
export const D0 = 0; // template compat (build.ts house() base height)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const T = (f: number) => f / FPS;

// ---------------- the land: one heightfield (metres) ----------------
// North (Small) Aral: ellipse centre (0, 250), radii 650 x 350; harbour (Aralsk) on its north shore at z = 600.
// South (Large) Aral: centre (0, -650), radii 800 x 480. A shallow sill (-6.5 m) joins them, with a deeper strait
// (-9.5 m) at x 200..340: lowering the water splits the sea in two; the dam (2005) closes that strait.
export const HARBOR: V3 = [0, 0, 600];
export const DAM_Z = -130;
export const DAM_X0 = 190, DAM_X1 = 350;
const ell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) => Math.hypot((x - cx) / rx, (z - cz) / rz);
const depthIn = (r: number, d: number, p: number) => (r >= 1 ? 0 : d * (1 - r) ** p);
/** river channel (Syr Darya) from the east into the north basin, and the irrigation canal north to the cotton */
export const RIVER: V3[] = [[1250, 0, 560], [1050, 0, 520], [900, 0, 470], [760, 0, 430], [640, 0, 400]];
export const CANAL: V3[] = [[900, 0, 470], [905, 0, 560], [915, 0, 660], [930, 0, 760]];
export const COTTON = { x0: 780, x1: 1120, z0: 700, z1: 1000 };
export const BATH: V3 = [-880, 0, 880]; // the analogy yard on the west steppe
const segDist = (x: number, z: number, pts: V3[]) => {
  let best = 1e9;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, , az] = pts[i], [bx, , bz] = pts[i + 1];
    const vx = bx - ax, vz = bz - az, t = clamp01(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz));
    best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return best;
};
export const terrainH = (x: number, z: number) => {
  const dN = depthIn(ell(x, z, 0, 250, 650, 350), 12, 1.7);
  const dS = depthIn(ell(x, z, 0, -650, 800, 480), 30, 1.2);
  const sill = depthIn(ell(x, z, 0, -130, 520, 95), 6.8, 0.6);
  const strait = depthIn(ell(x, z, 270, -130, 75, 140), 9.8, 0.5);
  const sea = Math.max(dN, dS, sill, strait);
  const land = 0.6 + 2.2 * smooth((Math.max(0, z - 600) + Math.max(0, Math.abs(x) - 700)) / 400) + 0.35 * Math.sin(x * 0.013) * Math.sin(z * 0.011);
  const shore = smooth(sea / 0.6); // blend the land swell out over the first 0.6 m of depth
  let h = land * (1 - shore) - sea;
  const rd = segDist(x, z, RIVER);
  if (rd < 26) h = Math.min(h, -1.8 + 1.8 * smooth(rd / 26)) ;
  const cd = segDist(x, z, CANAL);
  if (cd < 9) h = Math.min(h, -0.9 + 1.2 * smooth(cd / 9));
  return h;
};

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Era = "dry" | "1957" | "retreat" | "split" | "low" | "bath" | "dam" | "now";
export type ShotDef = { id: number; a: number; b: number; light: Light; era: Era; fogK?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 188, light: "day", era: "dry", fogK: 3 }, // hook: ships in the desert
  { id: 2, a: 188, b: 258, light: "golden", era: "1957", fogK: 2 }, // 1957 harbour
  { id: 3, a: 258, b: 345, light: "golden", era: "1957", fogK: 7 }, // "4th largest lake": aerial
  { id: 4, a: 345, b: 472, light: "golden", era: "1957", fogK: 1 }, // fishermen + crates
  { id: 5, a: 472, b: 553, light: "day", era: "1957", fogK: 2 }, // rivers turned to the cotton
  { id: 6, a: 553, b: 700, light: "day", era: "retreat", fogK: 2.5 }, // 1 km, 10, 100
  { id: 7, a: 700, b: 800, light: "day", era: "retreat", fogK: 2 }, // harbour dry, ships sit in the sand
  { id: 8, a: 800, b: 942, light: "day", era: "split", fogK: 14 }, // the sea splits (aerial)
  { id: 9, a: 942, b: 1072, light: "day", era: "low", fogK: 2 }, // luckily: a flounder
  { id: 10, a: 1072, b: 1152, light: "day", era: "low", fogK: 1.5 }, // unluckily: only flounder
  { id: 11, a: 1152, b: 1545, light: "golden", era: "bath", fogK: 2 }, // the bathtub
  { id: 12, a: 1545, b: 1690, light: "day", era: "dam", fogK: 10 }, // the dam (aerial)
  { id: 13, a: 1690, b: 1785, light: "day", era: "dam", fogK: 2 }, // water back at the harbour, fish return
  { id: 14, a: 1785, b: TOTAL, light: "golden", era: "now", fogK: 12 }, // twist: blue sea | endless sand
];
export const XFADE: Record<number, number> = { 5: 8, 6: 8, 9: 8, 11: 10, 12: 8, 14: 10 };
export const FLASH_AT = 188;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- sea levels (metres) per frame ----------------
const step = (f: number, f0: number, a: number, b: number, n = 10) => a + (b - a) * glide((f - f0) / n);
/** north and south water levels; the dam exists from shot 12 on */
export const levels = (id: number, f: number): { n: number; s: number; dam: number } => {
  switch (SHOTS[id - 1].era) {
    case "dry": return { n: -11.6, s: -24, dam: 0 };
    case "1957": return { n: -0.15, s: -0.15, dam: 0 };
    case "retreat": {
      // "Теңіз бір шақырым шегінді" (f 566) -1 m, "Сосын он" (f 624) -3 m, "Сосын жүз" (f 662) -8.5 m, then dry harbour
      let L = -0.15;
      L = step(f, 566, L, -1.1, 14); L = f >= 618 ? step(f, 618, -1.1, -3.2, 12) : L; L = f >= 656 ? step(f, 656, -3.2, -8.6, 14) : L;
      if (id === 7) L = -9.5;
      return { n: L, s: L, dam: 0 };
    }
    case "split": { const L = -5.2 - 4.9 * glide((f - 840) / 70); return { n: L, s: L - 0.3 * glide((f - 900) / 30), dam: 0 }; }
    case "low": return { n: -8.5, s: -16, dam: 0 };
    case "bath": return { n: -8.5, s: -16, dam: 0 };
    case "dam": {
      const n = id === 12 ? -9.4 + 3.6 * glide((f - 1640) / 50) : -5.8 + 4.8 * glide((f - 1700) / 50);
      return { n, s: -18, dam: id === 12 ? glide((f - 1556) / 90) : 1 };
    }
    case "now": return { n: -1.5, s: -22, dam: 1 };
  }
};

// ---------------- ships ----------------
// four trawlers on the harbour shelf; they float while the water is deep enough and sit (rolled) in the sand when not
export const SHIPS: { x: number; z: number; yaw: number; roll: number; s: number }[] = [
  { x: -46, z: 452, yaw: 0.35, roll: 0.16, s: 1 },
  { x: 38, z: 432, yaw: -0.5, roll: -0.12, s: 0.95 },
  { x: 120, z: 458, yaw: 1.2, roll: 0.2, s: 0.9 },
  { x: -150, z: 440, yaw: -0.9, roll: -0.18, s: 0.85 },
];
export const DRAFT = 1.2; // keel below the waterline (m)
/** the ship that settles on "кемелер құмға отырды" (shot 7) */
export const SETTLE = { ship: 1, f: 752, dur: 26 };

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
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

const shipAt = (i: number): V3 => [SHIPS[i].x, terrainH(SHIPS[i].x, SHIPS[i].z), SHIPS[i].z];
const S0 = shipAt(0), S1 = shipAt(1);
export const PIER = { x: 8, z0: 604, z1: 470, y: 1.2, w: 4 };
export const PIER_END: V3 = [PIER.x, PIER.y, PIER.z1 + 6];
export const BATH_Y = terrainH(BATH[0], BATH[2]);
export const BATH_C: V3 = [BATH[0], BATH_Y + 0.6, BATH[2]];

// 1: hook — aerial over the dry shelf, down to a rusted hull, then low past it toward the empty horizon
const C1a = (f: number) => dolly([S0[0] + 70, S0[1] + 44, S0[2] + 95], [S0[0] - 4, S0[1] + 1, S0[2] - 10], pushK(f, 0, 0.004), { fov: 42, near: 0.8 });
const C1b = (f: number) => dolly([S0[0] + 16, S0[1] + 1.7, S0[2] + 24], [S0[0] - 2, S0[1] + 2.4, S0[2] - 4], pushK(f, 70, 0.003), { fov: 40, roll: 0.03, near: 0.4 });
const C1c = (f: number) => dolly([S0[0] + 19, S0[1] + 2.2, S0[2] + 3], [S0[0] - 25, S0[1] + 0.5, S0[2] - 210], pushK(f, 140, 0.0015), { fov: 46, roll: -0.04, near: 0.4 });
// 2: 1957 harbour from the shore, golden
const C2a = (f: number) => dolly([15, 4.2, 606], [3, 1.4, 520], pushK(f, 188, 0.0025), { fov: 44, near: 0.4 });
// 3: aerial: the sea to the horizon
const C3a = (f: number) => dolly([60, 300, 900], [0, -10, 120], pushK(f, 258, 0.0022), { fov: 50, near: 3 });
// 4: fishermen and crates on the pier
const C4a = (f: number) => dolly([PIER_END[0] + 6.5, 3.2, PIER_END[2] + 13], [PIER_END[0] - 0.5, 2.0, PIER_END[2] + 3], pushK(f, 345, 0.0025), { fov: 40, near: 0.3 });
const C4b = (f: number) => dolly([PIER_END[0] + 4.2, 2.6, PIER_END[2] + 9.5], [PIER_END[0] - 0.8, 2.2, PIER_END[2] + 3], pushK(f, 395, 0.002, 0.006, 30), { fov: 38, roll: 0.035, near: 0.3 });
// 5: the river gate: water swings into the canal toward the cotton
const C5a = (f: number) => dolly([862, 30, 400], [915, 0, 640], pushK(f, 472, 0.003), { fov: 46, roll: -0.03, near: 0.5 });
// 6: harbour, the water runs away in three jumps (look follows it south)
const C6 = (f: number): Shot => {
  const k = glide((f - 566) / 14) * 0.25 + glide((f - 618) / 12) * 0.3 + glide((f - 656) / 14) * 0.45;
  return dolly([26, 6.5, 628], [2, -1 - 5 * k, 520 - 180 * k], pushK(f, 553, 0.0018), { fov: 46, near: 0.5 });
};
// 7: the dry pier, then the ship that sits down
const C7a = (f: number) => dolly([PIER_END[0] + 9, 4.2, PIER_END[2] + 8], [PIER_END[0] - 2, -2.0, PIER_END[2] - 14], pushK(f, 700, 0.0025), { fov: 42, near: 0.3 });
const C7b = (f: number) => dolly([S1[0] + 22, S1[1] + 3.2, S1[2] + 26], [S1[0], S1[1] + 1.8, S1[2]], pushK(f, 740, 0.0025, 0.006, 30), { fov: 42, roll: -0.04, near: 0.4 });
// 8: aerial: the split
const C8a = (f: number) => dolly([-320, 560, 560], [40, -12, -160], pushK(f, 800, 0.0016), { fov: 50, near: 4 });
// 9-10: the low sea: a fisherman with a flounder, then a crate of only flounders
export const BOAT: V3 = [0, 0, 250]; // the boat floats at the north level (era "low": -8.5 m)
const LOW = -8.5;
const C9a = (f: number) => dolly([BOAT[0] + 6.5, LOW + 2.6, BOAT[2] + 8.5], [BOAT[0], LOW + 0.8, BOAT[2]], pushK(f, 942, 0.002), { fov: 42, near: 0.3 });
const C9b = (f: number) => dolly([BOAT[0] + 3.6, LOW + 2.0, BOAT[2] + 4.6], [BOAT[0] - 0.1, LOW + 1.3, BOAT[2] + 0.3], pushK(f, 1028, 0.002, 0.006, 30), { fov: 40, roll: 0.035, near: 0.2 });
const C10a = (f: number) => dolly([BOAT[0] + 1.6, LOW + 2.9, BOAT[2] + 3.0], [BOAT[0] - 0.4, LOW + 0.6, BOAT[2] - 0.4], pushK(f, 1072, 0.0025), { fov: 40, near: 0.2 });
// 11: the bathtub yard
const B = BATH_C;
const C11a = (f: number) => dolly([B[0] + 6.5, B[1] + 2.6, B[2] + 8.0], [B[0], B[1] + 0.2, B[2]], pushK(f, 1152, 0.002), { fov: 42, near: 0.2 });
const C11b = (f: number) => dolly([B[0] + 3.6, B[1] + 1.5, B[2] + 3.8], [B[0] - 0.6, B[1] + 0.25, B[2]], pushK(f, 1235, 0.0025), { fov: 40, near: 0.2 });
const C11c = (f: number) => zoom([B[0] + 4.0, B[1] + 0.8, B[2] + 5.0], [B[0] + 1.0, B[1] + 8.4, B[2] - 14], 44, pushK(f, 1285, 0.002), { near: 0.2 }); // tilt up to the drinking sun
const C11d = (f: number) => dolly([B[0] + 2.8, B[1] + 2.0, B[2] + 3.2], [B[0], B[1], B[2]], pushK(f, 1355, 0.0025, 0.006, 30), { fov: 40, roll: -0.03, near: 0.2 });
const C11e = (f: number) => dolly([B[0] - 3.4, B[1] + 1.8, B[2] + 3.4], [B[0] - 0.4, B[1], B[2]], pushK(f, 1426, 0.0022), { fov: 40, roll: 0.03, near: 0.2 });
// 12: the dam (aerial, along it)
const C12a = (f: number) => dolly([DAM_X0 - 70, 52, DAM_Z + 130], [275, -7, DAM_Z - 10], pushK(f, 1545, 0.002), { fov: 46, near: 1 });
// 13: the harbour again: water comes back, fish jump
const C13a = (f: number) => dolly([PIER_END[0] + 6.5, 3.0, PIER_END[2] + 10], [PIER_END[0] - 1.5, 1.2, PIER_END[2] - 4], pushK(f, 1690, 0.0025), { fov: 44, near: 0.3 });
// 14: twist: rise over the dam: blue small sea on the left, endless sand on the right
const C14a = (f: number) => dolly([470, 110, -112], [262, -8, -132], pushK(f, 1785, 0.0012), { fov: 48, near: 1.5 });
const C14b = (f: number) => dolly([700, 330, -95], [180, -12, -150], pushK(f, 1860, 0.001), { fov: 54, near: 2.5 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: C1a }, { f: 70, dur: 40, s: C1b }, { f: 140, dur: 30, s: C1c }],
  2: [{ f: 188, s: C2a }],
  3: [{ f: 258, s: C3a }],
  4: [{ f: 345, s: C4a }, { f: 395, dur: 24, s: C4b }],
  5: [{ f: 472, s: C5a }],
  6: [{ f: 553, s: C6 }],
  7: [{ f: 700, s: C7a }, { f: 740, cut: true, s: C7b }],
  8: [{ f: 800, s: C8a }],
  9: [{ f: 942, s: C9a }, { f: 1028, dur: 24, s: C9b }],
  10: [{ f: 1072, s: C10a }],
  11: [{ f: 1152, s: C11a }, { f: 1205, dur: 30, s: C11b }, { f: 1282, dur: 26, s: C11c }, { f: 1352, dur: 24, s: C11d }, { f: 1426, cut: true, s: C11e }],
  12: [{ f: 1545, s: C12a }],
  13: [{ f: 1690, s: C13a }],
  14: [{ f: 1785, s: C14a }, { f: 1860, dur: 40, s: C14b }],
};

const KICKS: [number, number][] = [[T(566), 0.5], [T(624), 0.6], [T(662), 0.9], [T(775), 1.2], [T(905), 1.4], [T(1043), 0.5], [T(1401), 0.6]];
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

/** lens blur per beat: cInf px at 1080x1920 (0 = sharp); wides and aerials stay sharp */
type DofKey = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const DOF: DofKey[] = [
  { f: 0, cInf: 0 }, { f: 70, dur: 40, cInf: 10 }, { f: 140, dur: 30, cInf: 6 },
  { f: 188, cInf: 6 }, { f: 258, cInf: 0 }, { f: 345, cInf: 12 },
  { f: 472, cInf: 7 }, { f: 553, cInf: 0 }, { f: 700, cInf: 8 }, { f: 740, cInf: 10 },
  { f: 800, cInf: 0 }, { f: 942, cInf: 10 }, { f: 1028, dur: 24, cInf: 13 }, { f: 1072, cInf: 12 },
  { f: 1152, cInf: 7 }, { f: 1205, dur: 30, cInf: 11 }, { f: 1282, dur: 26, cInf: 4 }, { f: 1352, dur: 24, cInf: 11 },
  { f: 1545, cInf: 0 }, { f: 1690, cInf: 9 }, { f: 1785, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};

// ---------------- the bathtub analogy (shot 11) ----------------
/** tub state: water levels as a fraction of the inner depth, faucet flow/yaw, divider, straw */
export const bathState = (f: number) => {
  const g = (a: number, b: number) => glide((f - a) / (b - a));
  const flow = f >= 1245 && f < 1363 ? 1 : f >= 1476 ? 1 : 0;
  const away = g(1363, 1378) * (1 - g(1462, 1474)); // faucet turned toward the cotton pot
  const straw = f >= 1282 && f < 1420 ? 1 : 0;
  let main = 0.82 - 0.06 * g(1289, 1338) - 0.68 * g(1372, 1412);
  const divider = g(1430, 1448);
  const small = f < 1448 ? main : main + (0.84 - main) * g(1478, 1528);
  if (f >= 1448) main = 0.08;
  return { flow, away, straw, main, small, divider };
};
