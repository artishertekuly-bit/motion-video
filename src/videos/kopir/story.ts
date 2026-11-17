// Shots, places, lighting and documentary handheld camera for «Көпір».
import { BOUNDS, CARD_AT, FPS, TOTAL as T_ALL } from "./timeline";

export { FPS };
export const TOTAL = T_ALL;
export const D0 = 0;
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export type Light = "day" | "golden";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light };

export const SHOTS: ShotDef[] = BOUNDS.filter((s) => s.a < CARD_AT).map((s, i) => {
  const light: Light = i >= 20 ? "golden" : "day";
  return { id: i + 1, key: s.key, a: s.a, b: Math.min(s.b, CARD_AT), light };
});

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- Places ----------------
export const CLASS_POS: V3 = [0, 0, 0];

// ---------------- Camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };

// Base shots definition
type ShotPreset = { pos: V3; look: V3; fov: number; roll?: number };

const PRESETS: Record<string, ShotPreset> = {
  // Act 1: Сабаққа дейін
  sh01: { pos: [0.0, 1.35, 3.2], look: [0.0, 1.1, 0.0], fov: 42 },   // Teacher at blackboard
  sh02: { pos: [1.8, 1.3, 2.8], look: [0.6, 1.05, 0.2], fov: 38 },   // Aruzhan at door
  sh03: { pos: [0.0, 1.32, 2.7], look: [0.0, 1.05, 0.0], fov: 36 },  // Teacher offering card
  sh04: { pos: [-1.4, 1.25, 2.4], look: [-1.0, 1.02, 0.0], fov: 36 }, // Aruzhan at window desk

  // Act 2: Тапсырма
  sh05: { pos: [0.0, 1.4, 3.4], look: [0.0, 1.05, 0.2], fov: 42 },   // Teacher placing kits
  sh06: { pos: [0.2, 1.35, 2.8], look: [0.2, 1.05, 0.0], fov: 36 },  // Teacher explaining quest
  sh07: { pos: [0.8, 1.25, 2.2], look: [0.5, 1.0, 0.1], fov: 34 },   // Dina watching lips
  sh08: { pos: [-0.6, 1.25, 2.2], look: [-0.3, 1.0, 0.1], fov: 34 }, // Nursultan large print

  // Act 3: Жұмыс басталады
  sh09: { pos: [0.0, 1.28, 2.4], look: [0.0, 1.02, 0.0], fov: 36 },  // Ermek fidgeting
  sh10: { pos: [0.0, 1.28, 2.2], look: [0.0, 1.02, 0.0], fov: 34 },  // Ermek speaks: «Мен отыра алмаймын»
  sh11: { pos: [0.1, 1.32, 2.6], look: [0.1, 1.05, 0.0], fov: 36 },  // Teacher gives tester role
  sh12: { pos: [0.8, 1.32, 2.8], look: [0.3, 1.05, 0.1], fov: 38 },  // Ermek fetching weights
  sh13: { pos: [-0.8, 1.22, 2.2], look: [-0.4, 0.98, 0.1], fov: 34 }, // Miras 3D model on tablet
  sh14: { pos: [0.5, 1.22, 2.2], look: [0.3, 0.98, 0.1], fov: 34 },  // Nursultan tactile test
  sh15: { pos: [0.0, 1.32, 2.6], look: [0.0, 1.05, 0.0], fov: 38 },  // Prompt card on table

  // Act 4: Тест
  sh16: { pos: [0.0, 1.25, 2.4], look: [0.0, 0.98, 0.0], fov: 36 },  // Testing 200g - 500g
  sh17: { pos: [0.0, 1.22, 2.2], look: [0.0, 0.96, 0.0], fov: 34 },  // 800g bridge cracks!
  sh18: { pos: [0.4, 1.25, 2.3], look: [0.2, 1.02, 0.1], fov: 35 },  // Dina sign language
  sh19: { pos: [0.0, 1.32, 2.8], look: [0.0, 1.05, 0.0], fov: 38 },  // Group agrees, star awarded

  // Act 5: Аяқталуы
  sh20: { pos: [0.0, 1.32, 2.6], look: [0.0, 1.05, 0.0], fov: 36 },  // Aruzhan presenting bridge
  sh21: { pos: [0.0, 1.36, 3.2], look: [0.0, 1.1, 0.0], fov: 42 },   // Class empties, wiping board
  sh22: { pos: [0.0, 1.38, 3.6], look: [0.0, 1.12, 0.0], fov: 44 },  // Final slow zoom out
};

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1];
  const p = (s && PRESETS[s.key]) ? PRESETS[s.key] : PRESETS.sh01;

  // Organic documentary handheld camera drift
  const driftX = Math.sin(f * 0.07) * 0.025 + Math.cos(f * 0.031) * 0.015;
  const driftY = Math.cos(f * 0.06) * 0.018 + Math.sin(f * 0.027) * 0.012;
  const driftRoll = Math.sin(f * 0.045) * 0.35;

  // Subtle documentary creep / push-in
  const lf = f - (s ? s.a : 0);
  const push = Math.min(0.08, lf * 0.0004);

  const pos: V3 = [p.pos[0] + driftX, p.pos[1] + driftY, p.pos[2] - push];
  const look: V3 = [p.look[0] + driftX * 0.5, p.look[1] + driftY * 0.5, p.look[2]];

  // Kicks on impact (bridge crack in sh17)
  let kickY = 0;
  if (s && s.key === "sh17") {
    if (lf >= 60 && lf < 74) {
      kickY = Math.sin((lf - 60) * 3.8) * Math.exp(-(lf - 60) * 0.35) * 0.06;
    }
  }

  return {
    pos: [pos[0], pos[1] + kickY, pos[2]],
    look: [look[0], look[1] + kickY, look[2]],
    fov: p.fov,
    roll: (p.roll ?? 0) + driftRoll,
  };
};

export const dofAt = (_id: number, _f: number) => ({ cInf: 0 });
