// «Мұғалім» character portfolio: one frame per page. Frames 0-3 are 3D classroom shots (world.ts / stage.ts), frames
// 4-5 are flat model sheets (sheets.tsx). World units are metres, floor y = 0; the board wall is at z = -4 and the
// cameras look toward -z.
export const FPS = 30;
export const D0 = 0; // build.ts (bridge helpers) reads this
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };

export const PAGES = ["hero", "lesson", "desk", "joy", "faces", "turn"] as const;
export type Page = (typeof PAGES)[number];
export const TOTAL = PAGES.length;

export type Light = "day" | "golden" | "night";
export type ShotDef = { id: number; key: Page; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = (["hero", "lesson", "desk", "joy"] as const).map((key, i) => ({ id: i + 1, key, a: i, b: i + 1, light: "day" }));
export const is3D = (f: number) => f < SHOTS.length;

// ---------------- places ----------------
export const BOARD = { x0: -2.6, x1: 1.4, y0: 0.9, y1: 2.25, z: -3.97 }; // chalkboard on the front wall
export const TDESK = { x0: 1.75, x1: 3.15, z0: -3.15, z1: -2.45, h: 0.76 }; // teacher's desk
export const HERO: V3 = [-0.75, 0, -3.0]; // standing in front of the board
export const LESSON: V3 = [-2.0, 0, -3.25]; // at the left end of the board, pointer up to the right
export const SEATED: V3 = [2.4, 0, -3.2]; // behind the desk
export const JUMP: V3 = [0.05, 0.3, -1.75]; // mid-jump in front of the first row

// ---------------- cameras (one still per page; a 9:16 frame at fov f shows 0.56 x the vertical span) ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
const CAMS: Record<string, Cam> = {
  hero: { pos: [-0.35, 1.0, 0.75], look: [-0.72, 1.02, -3.0], fov: 38, roll: 0 },
  lesson: { pos: [-0.25, 1.28, 0.25], look: [-1.72, 1.3, -3.3], fov: 38, roll: 0.03 },
  desk: { pos: [1.95, 1.32, -0.85], look: [2.36, 1.2, -3.15], fov: 37, roll: 0 },
  joy: { pos: [0.3, 1.0, 1.5], look: [0.05, 1.45, -1.75], fov: 44, roll: -0.04 },
};
export const camAt = (id: number, _f: number): Cam => CAMS[SHOTS[id - 1].key];

// ---------------- lens blur (cInf px at 1080x1920; focus on the eyes) ----------------
export type Dof = { cInf: number; focus?: (f: number) => V3 };
const DOF: Record<string, Dof> = {
  hero: { cInf: 8, focus: () => [HERO[0], 1.5, HERO[2]] },
  lesson: { cInf: 6, focus: () => [LESSON[0], 1.5, LESSON[2]] },
  desk: { cInf: 11, focus: () => [SEATED[0], 1.15, SEATED[2]] },
  joy: { cInf: 6, focus: () => [JUMP[0], 1.75, JUMP[2]] },
};
export const dofAt = (f: number): Dof => (is3D(f) ? DOF[SHOTS[f].key] : { cInf: 0 });
export const layersAt = (f: number) => [{ id: Math.min(f, SHOTS.length - 1) + 1, alpha: 1 }];
