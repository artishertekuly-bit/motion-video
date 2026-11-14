import type { EaglePose, LeopardPose, V } from "./art";

// Leopard origin = ground point under the body centre; faces +x.
const base: LeopardPose = {
  hip: [-100, -118], chest: [96, -120], R: 62, back: 4, belly: 4,
  head: [182, -178], headRot: 0, ears: 1, eyeOpen: 1, look: [0.3, 0], mouth: 0,
  fpN: [120, 0], fpF: [100, 0], hpN: [-110, 0], hpF: [-130, 0], hfN: -100, hfF: -100,
  tail: [[-90, 40], [-200, 120], [-300, 60]], pawCurl: 0,
};

export const LEO_POSES: Record<string, LeopardPose> = {
  stand: base,
  lie: {
    ...base, hip: [-112, -64], chest: [88, -62], R: 60, back: 2, belly: -6,
    head: [176, -118], headRot: -4, ears: 0.55, eyeOpen: 0.45, look: [0.2, 0.1],
    fpN: [214, -2], fpF: [196, -6], hpN: [-24, -2], hpF: [-44, -4], hfN: -178, hfF: -176,
    tail: [[-90, 46], [-200, 66], [-300, 44]],
  },
  alert: {
    ...base, hip: [-112, -66], chest: [90, -72], R: 60, back: 2, belly: -6,
    head: [168, -150], headRot: -28, ears: 1, eyeOpen: 1.15, look: [0.5, -0.9],
    fpN: [210, -2], fpF: [192, -6], hpN: [-24, -2], hpF: [-44, -4], hfN: -178, hfF: -176,
    tail: [[-80, 40], [-150, 50], [-150, -10]],
  },
  crouch: {
    ...base, hip: [-96, -98], chest: [92, -56], R: 60, back: -6, belly: -10,
    head: [178, -96], headRot: -16, ears: 1, eyeOpen: 1.1, look: [0.6, -0.6],
    fpN: [176, 0], fpF: [158, -2], hpN: [-56, 0], hpF: [-74, -2], hfN: -170, hfF: -168,
    tail: [[-90, 10], [-200, 30], [-280, -10]],
  },
  push: {
    ...base, hip: [-70, -120], chest: [120, -200], R: 60, back: 10, belly: 0,
    head: [196, -268], headRot: -24, ears: 0.8, eyeOpen: 1.1, look: [0.6, -0.5],
    fpN: [250, -226], fpF: [236, -246], hpN: [-170, 0], hpF: [-186, -4], hfN: -60, hfF: -64,
    tail: [[-80, 40], [-180, 90], [-290, 100]], pawCurl: 1,
  },
  fly: {
    ...base, hip: [-112, -150], chest: [104, -158], R: 60, back: 14, belly: 0,
    head: [194, -206], headRot: -10, ears: 0.9, eyeOpen: 1.15, look: [0.7, -0.2],
    fpN: [278, -146], fpF: [262, -130], hpN: [-280, -128], hpF: [-268, -108], hfN: 10, hfF: 14,
    tail: [[-100, -10], [-200, -40], [-300, -10]], pawCurl: 1,
  },
  reach: {
    ...base, hip: [-104, -176], chest: [100, -118], R: 60, back: 8, belly: 0,
    head: [188, -158], headRot: 6, ears: 0.9, eyeOpen: 1.1, look: [0.6, 0.4],
    fpN: [200, -8], fpF: [184, -20], hpN: [-40, -116], hpF: [-60, -104], hfN: -150, hfF: -146,
    tail: [[-90, -50], [-190, -90], [-280, -60]], pawCurl: 0.3,
  },
  land: {
    ...base, hip: [-100, -112], chest: [90, -66], R: 60, back: -2, belly: -8,
    head: [178, -110], headRot: 4, ears: 0.8, eyeOpen: 0.9, look: [0.5, 0.2],
    fpN: [170, 0], fpF: [152, -2], hpN: [-40, 0], hpF: [-60, -2], hfN: -168, hfF: -166,
    tail: [[-90, -40], [-190, -50], [-270, 10]],
  },
  sit: {
    ...base, hip: [-58, -72], chest: [52, -168], R: 58, back: 4, belly: -4,
    head: [118, -236], headRot: -12, ears: 1, eyeOpen: 1, look: [0.7, -0.4],
    fpN: [90, 0], fpF: [72, -2], hpN: [-8, 0], hpF: [-26, -2], hfN: -178, hfF: -176,
    tail: [[-60, 60], [40, 90], [150, 64]],
  },
};

export const EAGLE_POSES: Record<string, EaglePose> = {
  up: { tilt: 4, raiseN: -100, raiseF: -114, spread: 1, fold: 0, legs: 0, perch: 0, tailSpread: 0.3, headRot: 0 },
  mid: { tilt: 2, raiseN: -150, raiseF: -160, spread: 0.9, fold: 0, legs: 0, perch: 0, tailSpread: 0.3, headRot: 0 },
  down: { tilt: 0, raiseN: 80, raiseF: 66, spread: 0.85, fold: 0, legs: 0, perch: 0, tailSpread: 0.2, headRot: 0 },
  glide: { tilt: 0, raiseN: -162, raiseF: -170, spread: 1, fold: 0, legs: 0, perch: 0, tailSpread: 0.4, headRot: 0 },
  brake: { tilt: 34, raiseN: -96, raiseF: -110, spread: 1, fold: 0, legs: 1, perch: 0, tailSpread: 1, headRot: -26 },
  perch: { tilt: 42, raiseN: 150, raiseF: 160, spread: 0.3, fold: 1, legs: 0, perch: 1, tailSpread: 0, headRot: -36 },
};

export const lerpPose = <T extends Record<string, unknown>>(a: T, b: T, t: number): T => {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(a)) {
    const x = a[k] as unknown, y = b[k] as unknown;
    if (typeof x === "number") out[k] = x + ((y as number) - x) * t;
    else if (Array.isArray(x) && typeof x[0] === "number") out[k] = (x as number[]).map((v, i) => v + ((y as number[])[i] - v) * t);
    else if (Array.isArray(x)) out[k] = (x as V[]).map((v, i) => v.map((w, j) => w + ((y as V[])[i][j] - w) * t));
    else out[k] = x;
  }
  return out as T;
};
