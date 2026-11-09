// «Мұғалім» — the snow-leopard teacher from the user's sheet, redrawn in the cartoon-3d-short cast style (toon.ts):
// 600 x 1000 design card with the soles at y = 975, bean torso, thin single-stroke limbs (white shirt sleeves, black
// trousers), round paws, thick-thin plum outline weighted away from the light, a painted crescent instead of cel
// shading, no blush, no catchlights. Character marks kept from the sheet: light grey fur with dark grey spots, round
// ears with pink insides and dark tips, cheek tufts, huge black eyes under heavy flat brows, small pink nose, cat
// mouth, whiskers, black V-neck vest over a white shirt, navy tie, a little blue-gold school badge, black trousers,
// black sneakers with white soles, a long spotted tail.
// Views: leopardFront (front and 3/4 with `facing`), leopardSide (profile facing screen-right), leopardBack.
import { Pen, INK, mul, mix, shade, thickAngle, blobPts, Blob } from "./toon";

type P2 = [number, number];
type C3 = [number, number, number];

export const LEO = {
  fur: "#ebe8ea", spot: "#5a5360", spotDk: "#3d3742", earIn: "#efafad", earTip: "#3b3540", nose: "#d4868c",
  mouth: "#5a1e28", tongue: "#e86e78", vest: "#2a2930", shirt: "#f6f5f1", tie: "#27427e", pants: "#212128",
  shoe: "#19191e", sole: "#efece3", book: "#233a66", badgeGold: "#e8c45a", badgeBlue: "#2f5ca8", pointer: "#9a6236",
};
const FUR_SH: C3 = [0.83, 0.84, 0.93];
const CLOTH_SH: C3 = [0.66, 0.68, 0.78];
export const DEF_LIGHT = (-120 * Math.PI) / 180;

const A = 128, B = 116; // head half width / half height (bean h/w 0.9: a cat head is a little wider)
const HH = 2 * B, Wd = 2 * A, u = Wd / 100; // head height 216, u = 2.4 design units
const LEGS = 1.18, TORSO = 1.0, SOLE = 975;
/** seated (behind the desk): torso bottom on a 0.46 m seat; 1 m = 463 design units on the 2.16 m card */
export const SEAT_Y = SOLE - 0.46 * 463;
/** desk top (0.76 m) in design units: forearms rest just above it */
export const DESK_Y = SOLE - 0.76 * 463;

// ---------------- small geometry helpers (as in toon.ts) ----------------
const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const curve = (a: P2, k: P2, b: P2, n = 14): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};
const bez = (p0: P2, p1: P2, p2: P2, p3: P2, t: number): P2 => {
  const s = 1 - t;
  return [s * s * s * p0[0] + 3 * s * s * t * p1[0] + 3 * s * t * t * p2[0] + t * t * t * p3[0],
    s * s * s * p0[1] + 3 * s * s * t * p1[1] + 3 * s * t * t * p2[1] + t * t * t * p3[1]];
};
const ellPts = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 40): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 6): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};
const rotPts = (pts: P2[], a: number, c: P2): P2[] =>
  pts.map(([x, y]) => [c[0] + (x - c[0]) * Math.cos(a) - (y - c[1]) * Math.sin(a), c[1] + (x - c[0]) * Math.sin(a) + (y - c[1]) * Math.cos(a)]);
/** tapered stroke with round ends (brows) */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};
/** limb with a thin ink rim (sleeves, trousers) */
const limb = (p: Pen, pts: P2[], fill: string, w: number, rim = 1.9 * u) => {
  p.stroke(pts, w + 2 * rim, INK);
  p.stroke(pts, w, fill);
};
/** round paw with an ink rim; open = a flatter palm with a thumb bump */
const paw = (p: Pen, x: number, y: number, open = false, rot = 0) => {
  if (open) {
    p.poly(ellPts(x, y, 8.4 * u, 5.6 * u, rot), LEO.fur, 2.2 * u);
    p.poly(ellPts(x + 1.5 * u, y - 4.8 * u, 2.8 * u, 2.6 * u, rot), LEO.fur, 2 * u);
    p.ell(x, y, 8.4 * u, 5.6 * u, LEO.fur, 0, 0, 360, rot);
  } else p.ell(x, y, 6.6 * u, 6.6 * u, LEO.fur, 2.2 * u);
};

// ---------------- head ----------------
/** cat bean head: rounder crown, full jaw, a bulge toward the facing side, three fur tufts on each lower cheek.
 *  Points run clockwise on screen (inkRing contract). */
const headContour = (cx: number, cy: number, facing: number, tufts = 1, n = 240): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const e = 2 / (s < 0 ? 1.95 : 2.55);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + 0.05 * Y) * (1 + 0.07 * facing * Math.sign(X));
    let r = 1;
    if (Y > 0.02 && tufts) {
      const ang = (Math.atan2(Y, Math.abs(X)) * 180) / Math.PI; // 0 = side, 90 = chin
      const far = facing && Math.sign(X) !== facing ? 0.55 : 1;
      for (const [c0, k] of [[10, 0.8], [25, 1], [41, 0.8]] as const) {
        const d = (ang - c0) / 8.5;
        const tooth = d < 0 ? Math.max(0, 1 + d) : Math.max(0, 1 - d / 0.4);
        r += 0.08 * far * tufts * k * tooth;
      }
    }
    pts.push([cx + A * X * r, cy + B * Y * r]);
  }
  return pts;
};

/** rounded ear on the head rim at canvas angle `ang`; back = seen from behind (dark back, no pink) */
const ear = (p: Pen, cx: number, cy: number, ang: number, k: number, light: number, back = false) => {
  const a0 = rad(ang), d: P2 = [Math.cos(a0), Math.sin(a0)], n: P2 = [-d[1], d[0]];
  const base: P2 = [cx + A * 0.84 * d[0], cy + B * 0.84 * d[1]];
  const L = 64 * k, hb = 40 * k;
  const shape = (cAlong: number, la: number, hw: number, narrow = 0.3): P2[] => {
    const out: P2[] = [];
    for (let i = 0; i < 40; i++) {
      const ph = (i / 40) * Math.PI * 2, al = Math.cos(ph), ac = Math.sin(ph) * (1 - narrow * Math.max(0, al));
      out.push([base[0] + d[0] * (cAlong + al * la) + n[0] * ac * hw, base[1] + d[1] * (cAlong + al * la) + n[1] * ac * hw]);
    }
    return out;
  };
  const outer = shape(L * 0.38, L * 0.62, hb);
  if (back) {
    p.shadedFill(outer, mix(LEO.fur, LEO.earTip, 0.35), mul(mix(LEO.fur, LEO.earTip, 0.35), FUR_SH), light, hb);
    p.clip(outer, () => p.poly(shape(L * 0.86, L * 0.42, hb * 1.3, 0), LEO.earTip, 0));
  } else {
    p.shadedFill(outer, LEO.fur, mul(LEO.fur, FUR_SH), light, hb);
    p.clip(outer, () => p.poly(shape(L * 0.92, L * 0.36, hb * 1.25, 0), LEO.earTip, 0));
    p.poly(shape(L * 0.3, L * 0.42, hb * 0.56, 0.35), LEO.earIn, 0);
  }
  p.poly(outer, null, 4.2 * u);
};

export type LExpr = "smug" | "smile" | "proud" | "laugh" | "think" | "shock" | "meh" | "idea" | "talk" | "joy";
type LEye = "open" | "lid" | "slit" | "happy" | "squeeze" | "shock" | "dash";
type LMouth = "cat" | "smug" | "laugh" | "grin" | "talk" | "O" | "flat" | "hmm";
/** brow offsets in u (+ = down): [left inner, left outer, right inner, right outer] */
const LFACE: Record<LExpr, { eye: LEye; brow: [number, number, number, number]; mouth: LMouth; look?: number; lookY?: number }> = {
  smug: { eye: "lid", brow: [1.5, -0.5, 1.5, -0.5], mouth: "smug" },
  smile: { eye: "open", brow: [-1, -2, -1, -2], mouth: "cat" },
  proud: { eye: "lid", brow: [0, -2, 0, -2], mouth: "cat" },
  laugh: { eye: "happy", brow: [-4, -5, -4, -5], mouth: "laugh" },
  think: { eye: "lid", brow: [2.5, 1.5, -5, -7], mouth: "hmm", look: 0.75, lookY: -1 },
  shock: { eye: "shock", brow: [-8, -6, -8, -6], mouth: "O" },
  meh: { eye: "slit", brow: [2.5, 0.5, 2.5, 0.5], mouth: "flat", look: -0.6 },
  idea: { eye: "open", brow: [-3, -4.5, -3, -4.5], mouth: "grin", look: 0.3, lookY: -0.6 },
  talk: { eye: "open", brow: [-2, -3, -2, -3], mouth: "talk", look: 0.4 },
  joy: { eye: "squeeze", brow: [-5, -5, -5, -5], mouth: "laugh" },
};

const leoEye = (p: Pen, kind: LEye, x: number, ey: number, s: number, look: number, lookY: number, lid: number) => {
  let k = kind;
  if (lid >= 1 && k !== "happy" && k !== "squeeze") k = "dash";
  else if (lid > 0) k = k === "open" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "lid" : k;
  const lx = x + look * 2.6 * u, ly = ey + lookY * 1.6 * u;
  switch (k) {
    case "open": p.ell(lx, ly, 8.2 * u, 11.6 * u, INK, 0); break;
    case "lid": case "slit": {
      const y0 = k === "lid" ? ey - 3.2 * u : ey + 2 * u, tilt = 1.3 * u;
      const inner: P2 = [x - s * 11.5 * u, y0 - tilt], outer: P2 = [x + s * 11.5 * u, y0 + tilt];
      p.clip([inner, outer, [x + s * 15 * u, ey + 18 * u], [x - s * 15 * u, ey + 18 * u]], () => p.ell(lx, ly, 8.2 * u, 11.6 * u, INK, 0));
      p.stroke([inner, outer], 4.2 * u);
      break;
    }
    case "happy": p.arc(x, ey + 5 * u, 9.5 * u, 8.5 * u, 200, 340, 4.4 * u); break;
    case "squeeze": p.stroke([[x + 7.5 * u * s, ey - 6.5 * u], [x - 6.5 * u * s, ey], [x + 7.5 * u * s, ey + 6.5 * u]], 4.4 * u); break;
    case "shock": p.ell(x, ey, 13 * u, 14 * u, "#ffffff", 2.8 * u); p.ell(lx, ey + 1.5 * u, 6.4 * u, 7.6 * u, INK, 0); break;
    default: p.stroke([[x - 9.5 * u, ey + 2 * u], [x + 9.5 * u, ey + 2 * u]], 4.4 * u);
  }
};

/** open "D" mouth with fangs (+ tongue) under the cat lip line */
const openMouth = (p: Pen, mx: number, my: number, rx: number, ry: number, fangs: number, tongue: boolean) => {
  p.ell(mx, my, rx, ry, LEO.mouth, 0, 0, 180);
  if (tongue) p.clip(ellPts(mx, my, rx, ry), () => p.ell(mx + 1.5 * u, my + 0.78 * ry, 0.5 * rx, 0.36 * ry, LEO.tongue, 0));
  for (let i = 0; i < fangs; i++) {
    const s = i ? 1 : -1, fx = mx + s * 0.55 * rx;
    p.poly([[fx - 2.2 * u, my + 0.3 * u], [fx + 2.2 * u, my + 0.3 * u], [fx + s * 0.3 * u, my + 4.4 * u]], "#ffffff", 1.2 * u);
  }
  p.ell(mx, my, rx, ry, null, 2.8 * u, 0, 180);
  p.stroke([[mx - rx, my], [mx + rx, my]], 2.8 * u);
};

const leoMouth = (p: Pen, kind: LMouth, nx: number, ny: number, sm: number) => {
  const mx = nx, my = ny + 6.5 * u, w = 2.7 * u;
  p.stroke([[nx, ny + 2.5 * u], [mx, my]], 2.3 * u); // philtrum
  switch (kind) {
    case "cat": p.arc(mx - 4.6 * u, my, 4.6 * u, 4 * u, 0, 180, w); p.arc(mx + 4.6 * u, my, 4.6 * u, 4 * u, 0, 180, w); break;
    case "smug":
      p.arc(mx - sm * 4 * u, my, 4 * u, 3.2 * u, 0, 180, w);
      p.arc(mx + sm * 5 * u, my - 0.6 * u, 5 * u, 4.4 * u, 0, 180, w);
      p.stroke([[mx + sm * 9.8 * u, my - 0.8 * u], [mx + sm * 11.6 * u, my - 3.4 * u]], w);
      break;
    case "laugh": openMouth(p, mx, my, 14 * u, 16 * u, 2, true); break;
    case "grin": openMouth(p, mx, my, 10.5 * u, 9.5 * u, 2, false); break;
    case "talk": openMouth(p, mx, my, 7.5 * u, 8.5 * u, 0, true); break;
    case "O": p.ell(mx, my + 3.5 * u, 5.6 * u, 7.2 * u, LEO.mouth, w); break;
    case "flat": p.arc(mx, my + 4.5 * u, 6.5 * u, 3 * u, 200, 340, w); break;
    case "hmm": p.stroke([[mx - 5 * u * sm, my + 1.6 * u], [mx + 0.5 * u * sm, my + 0.8 * u], [mx + 6 * u * sm, my - 1.4 * u]], w); break;
  }
};

/** forehead / temple / cheek spots in head units (x / A, y / B, r in u) */
const SPOTS: [number, number, number][] = [
  [-0.12, -0.74, 4.2], [0.13, -0.78, 3.6], [0.34, -0.66, 4.4], [-0.37, -0.64, 4], [0.0, -0.9, 3.4], [-0.25, -0.88, 3],
  [0.62, -0.46, 5.2], [-0.64, -0.44, 5], [0.8, -0.18, 4.2], [-0.8, -0.2, 4.4], [0.74, 0.2, 3.8], [-0.74, 0.2, 3.6],
  [0.6, 0.42, 3], [-0.6, 0.42, 3.2], [0.46, -0.84, 3], [-0.5, -0.8, 3.2],
];
const BACK_SPOTS: [number, number, number][] = [
  ...SPOTS, [-0.2, -0.4, 4.6], [0.22, -0.36, 4.2], [0.0, -0.1, 5], [-0.36, 0.05, 4], [0.38, 0.1, 4.4], [-0.12, 0.34, 4],
  [0.16, 0.42, 3.8], [0.0, 0.62, 3.4], [-0.4, 0.5, 3], [0.42, 0.56, 3.2],
];
const spot = (p: Pen, x: number, y: number, r: number, i: number) =>
  p.poly(ellPts(x, y, r * u * (1.1 + 0.25 * Math.sin(i * 2.3)), r * u * (0.85 + 0.2 * Math.cos(i * 1.7)), 35 * Math.sin(i * 3.1), 18), LEO.spot, 0);

export type HeadOpts = { expr: LExpr; facing: number; look?: number; lookY?: number; lid?: number; glasses?: boolean; light: number };
/** the head centred at (cx, cy) */
export const leoHead = (p: Pen, cx: number, cy: number, o: HeadOpts) => {
  const f = o.facing, thick = thickAngle(o.light), ow = 5 * u, F = LFACE[o.expr], lid = o.lid ?? 0;
  ear(p, cx, cy, -124 + 8 * f, f === 1 ? 0.9 : 1, o.light);
  ear(p, cx, cy, -56 + 8 * f, f === -1 ? 0.9 : 1, o.light);
  const hp = headContour(cx, cy, f);
  p.shadedFill(hp, LEO.fur, mul(LEO.fur, FUR_SH), o.light, A);
  const fx = cx + 9 * u * f;
  p.clip(hp, () => {
    SPOTS.forEach(([sx, sy, r], i) => {
      const far = f && Math.sign(sx) !== f ? 0.86 : 1;
      spot(p, cx + (sx * far + f * 0.09 * (1 - Math.abs(sx))) * A, cy + sy * B, r * (far < 1 ? 0.85 : 1), i);
    });
    p.ell(fx + 1 * u * f, cy + 21 * u, 21 * u, 12.5 * u, "rgba(255,255,255,0.5)", 0); // pale muzzle
  });
  p.inkRing(hp, ow, thick);
  // eyes + brows
  const look = (o.look ?? F.look ?? 0) + 0.25 * f, lookY = o.lookY ?? F.lookY ?? 0, ey = cy - 1 * u;
  for (const s of [-1, 1]) {
    const x = fx + s * (f ? (s === f ? 18.5 : 15.5) : 17) * u;
    leoEye(p, F.eye, x, ey, s, look, lookY, lid);
    const [dI, dO] = s < 0 ? [F.brow[0], F.brow[1]] : [F.brow[2], F.brow[3]], by = ey - 21 * u;
    if (F.eye === "shock") taper(p, [x - s * 8 * u, by - 6 * u + dI * u * 0.3], [x + s * 10 * u, by - 5 * u + dO * u * 0.3], 7 * u, 5.5 * u);
    else taper(p, [x - s * 8.5 * u, by + dI * u], [x + s * 11 * u, by + dO * u], 7.6 * u, 6.2 * u);
  }
  // nose, mouth, whiskers
  const nx = fx + 1.2 * u * f, ny = cy + 13 * u;
  const nose: P2[] = [];
  for (let i = 0; i < 24; i++) {
    const ph = (i / 24) * Math.PI * 2, sy = Math.sin(ph);
    nose.push([nx + 5.4 * u * Math.cos(ph) * (1 - 0.5 * Math.max(0, sy)), ny + 3.4 * u * sy * (sy > 0 ? 1.3 : 1)]);
  }
  p.poly(nose, LEO.nose, 2 * u);
  leoMouth(p, F.mouth, nx, ny, f || 1);
  for (const s of [-1, 1]) {
    const k = f && s !== f ? 0.72 : 1;
    for (const [y0, y1, l] of [[15.5, 11, 30], [19, 18.5, 33], [22.5, 26, 29]] as const)
      p.stroke(curve([fx + s * 19 * u, cy + y0 * u], [fx + s * (19 + l * 0.5 * k) * u, cy + ((y0 + y1) / 2 - 1) * u], [fx + s * (19 + l * k) * u, cy + y1 * u], 6), 1.25 * u);
  }
  if (o.glasses) {
    for (const s of [-1, 1]) {
      const x = fx + s * (f ? (s === f ? 18.5 : 15.5) : 17) * u;
      p.poly(rrect(x - 13 * u, ey - 10 * u, x + 13 * u, ey + 10 * u, 4.5 * u), "rgba(225,240,255,0.16)", 3.6 * u);
      p.stroke([[x + s * 13 * u, ey - 5 * u], [x + s * 22 * u, ey - 7 * u]], 3 * u);
    }
    p.stroke([[fx - 4.5 * u, ey - 4 * u], [fx + 4.5 * u, ey - 4 * u]], 3.2 * u);
  }
};

// ---------------- tail ----------------
/** spotted tail along a cubic curve, tapering 13u -> 9u, dark tip; drawn behind (front/side) or over (back) the body */
const tail = (p: Pen, P0: P2, P1: P2, P2_: P2, P3: P2, light: number) => {
  const n = 44, L: P2[] = [], R: P2[] = [], C: P2[] = [];
  for (let i = 0; i <= n; i++) C.push(bez(P0, P1, P2_, P3, i / n));
  const wAt = (t: number) => lerp(12.5, 9, t) * u * 0.5;
  for (let i = 0; i <= n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = wAt(i / n);
    L.push([C[i][0] - (dy / l) * w, C[i][1] + (dx / l) * w]); R.push([C[i][0] + (dy / l) * w, C[i][1] - (dx / l) * w]);
  }
  const e = C[n], pe = C[n - 1], ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]), wt = wAt(1), cap: P2[] = [];
  for (let i = 1; i < 12; i++) { const a = ang + Math.PI / 2 - (i / 12) * Math.PI; cap.push([e[0] + wt * Math.cos(a), e[1] + wt * Math.sin(a)]); }
  const shape = [...L, ...cap, ...R.reverse()];
  p.gradFill(shape, LEO.fur, mul(LEO.fur, FUR_SH), light, 0.3);
  p.clip(shape, () => {
    [0.16, 0.3, 0.44, 0.57, 0.69].forEach((t, i) => {
      const c = bez(P0, P1, P2_, P3, t), w = wAt(t) * 2, side = i % 2 ? 1 : -1;
      const a = C[Math.round(t * n) + 1], b = C[Math.round(t * n) - 1], dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1;
      const ox = (-dy / l) * side * 0.22 * w, oy = (dx / l) * side * 0.22 * w;
      p.ell(c[0] + ox, c[1] + oy, 0.36 * w, 0.28 * w, null, 1.4 * u, 0, 360, (Math.atan2(dy, dx) * 180) / Math.PI);
      p.ell(c[0] - ox * 1.9, c[1] - oy * 1.9, 0.2 * w, 0.17 * w, LEO.spot, 0);
    });
    for (const t of [0.8, 0.88]) { const c = bez(P0, P1, P2_, P3, t); p.ell(c[0], c[1], wAt(t) * 2.4, wAt(t) * 0.75, LEO.spotDk, 0, 0, 360, (ang * 180) / Math.PI + 90); }
    p.ell(e[0], e[1], wt * 2.2, wt * 2.2, LEO.spotDk, 0);
  });
  p.poly(shape, null, 4.2 * u);
};

// ---------------- bodies ----------------
export type LArm = "hang" | "hip" | "present" | "book" | "cross" | "chin" | "chinUnder" | "point" | "up" | "glasses" | "wave" | "deskChin" | "deskRest";
export type LeoOpts = {
  expr?: LExpr; facing?: -1 | 0 | 1; look?: number; lookY?: number; blink?: number; arms?: [LArm, LArm];
  legs?: "stand" | "sit" | "jump"; glasses?: boolean; tilt?: number; headTilt?: number; light?: number;
  /** which side the tail curls out to (screen) */
  tail?: -1 | 1;
};

const shoe = (p: Pen, heel: P2, toe: P2) => {
  p.stroke([heel, toe], 12.5 * u, INK);
  p.stroke([heel, toe], 8.8 * u, LEO.shoe);
  const d = Math.hypot(toe[0] - heel[0], toe[1] - heel[1]) || 1, nx = -(toe[1] - heel[1]) / d, ny = (toe[0] - heel[0]) / d, k = ny < 0 ? -1 : 1;
  const off = 3.8 * u * k;
  p.stroke([[heel[0] + nx * off, heel[1] + ny * off], [toe[0] + nx * off, toe[1] + ny * off]], 2.4 * u, LEO.sole);
};

/** front / 3-4 view in the 600 x 1000 design card (soles at 975) */
export const leopardFront = (p: Pen, o: LeoOpts = {}) => {
  const { expr = "smug", facing = 0, blink = 0, arms = ["hang", "hang"], legs = "stand", glasses = false, tilt = 0, headTilt = 0,
    light = DEF_LIGHT, tail: tailSide = 1 } = o;
  const f = facing, cx = 300, thick = thickAngle(light), ow = 5 * u;
  const torsoBot = legs === "sit" ? SEAT_Y : legs === "jump" ? SOLE - LEGS * HH - 0.1 * HH : SOLE - LEGS * HH;
  const chin = torsoBot - TORSO * HH, hc = chin - B + 8, hipY = torsoBot - 0.12 * HH;
  const T: Blob = { a: 0.38 * Wd, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.7, nBot: 2.7, egg: -0.03, asym: 0.04 * f, rot: 0, noise: 0.005, seed: 17 };
  const tcx = cx + 3 * u * f, tcy = torsoBot - T.b;
  p.rot = null;
  // ---- tail (behind everything) ----
  const ts = tailSide;
  if (legs === "sit") tail(p, [cx + ts * 26 * u, hipY + 8 * u], [cx + ts * 70 * u, hipY + 30 * u], [cx + ts * 92 * u, hipY - 10 * u], [cx + ts * 84 * u, hipY - 62 * u], light);
  else if (legs === "jump") tail(p, [cx + ts * 16 * u, hipY + 10 * u], [cx + ts * 50 * u, hipY + 70 * u], [cx + ts * 96 * u, hipY + 60 * u], [cx + ts * 112 * u, hipY + 6 * u], light);
  else tail(p, [cx + ts * 16 * u, hipY + 10 * u], [cx + ts * 56 * u, hipY + 72 * u], [cx + ts * 98 * u, hipY + 34 * u], [cx + ts * 90 * u, hipY - 36 * u], light);
  // ---- legs ----
  const legW = 11.5 * u;
  if (legs === "stand") {
    for (const s of [-1, 1]) {
      const h: P2 = [cx + s * 20 * u, hipY], ft: P2 = [cx + s * 24 * u + 2 * u * f, SOLE - 6 * u];
      limb(p, curve(h, [(h[0] + ft[0]) / 2 + s * 2 * u, (h[1] + ft[1]) / 2], ft), LEO.pants, legW);
      const dir = f || s;
      shoe(p, [ft[0] - dir * 4 * u, ft[1]], [ft[0] + dir * 15 * u, ft[1] + 0.6 * u]);
    }
  } else if (legs === "jump") {
    const L1: [P2, P2, P2] = [[cx - 20 * u, hipY], [cx - 52 * u, hipY + 0.42 * HH], [cx - 30 * u, hipY + 0.82 * HH]];
    const L2: [P2, P2, P2] = [[cx + 20 * u, hipY], [cx + 44 * u, hipY + 0.5 * HH], [cx + 72 * u, hipY + 0.7 * HH]];
    limb(p, curve(...L2), LEO.pants, legW); shoe(p, [L2[2][0] - 4 * u, L2[2][1] + 2 * u], [L2[2][0] + 12 * u, L2[2][1] - 4 * u]);
    limb(p, curve(...L1), LEO.pants, legW); shoe(p, [L1[2][0] + 3 * u, L1[2][1]], [L1[2][0] - 13 * u, L1[2][1] + 3 * u]);
  } else {
    for (const s of [-1, 1]) {
      const h: P2 = [cx + s * 18 * u, hipY], k: P2 = [cx + s * 38 * u, hipY + 0.22 * HH], ft: P2 = [cx + s * 42 * u, SOLE - 8 * u];
      limb(p, [h, k, ft], LEO.pants, legW);
      shoe(p, [ft[0] - s * 3 * u, ft[1]], [ft[0] + s * 13 * u, ft[1] + u]);
    }
  }
  // ---- upper body rotates about the hips ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const sh = (s: number): P2 => [tcx + s * 0.8 * T.a, chin + 0.1 * HH];
  type Arm = { pts: [P2, P2, P2]; layer: 0 | 1 | 2; open?: boolean; prop?: "pointer" };
  const arm = (kind: LArm, s: number): Arm => {
    const S = sh(s), X = (k: number, du = 0) => tcx + s * (k * T.a + du * u);
    switch (kind) {
      case "hip": return { pts: [S, [X(1.55, 6), S[1] + 0.4 * HH], [X(0.98), S[1] + 0.8 * HH]], layer: 1 };
      case "present": return { pts: [S, [X(1.35, 8), S[1] + 0.4 * HH], [X(1.9, 16), S[1] + 0.3 * HH]], layer: 1, open: true };
      case "book": return { pts: [S, [X(1.15, 6), S[1] + 0.42 * HH], [X(0.72), S[1] + 0.74 * HH]], layer: 1 };
      case "cross": return s < 0
        ? { pts: [S, [X(1.06), S[1] + 0.42 * HH], [tcx + 0.52 * T.a, S[1] + 0.34 * HH]], layer: 1 }
        : { pts: [S, [X(1.06), S[1] + 0.45 * HH], [tcx - 0.55 * T.a, S[1] + 0.33 * HH]], layer: 1 };
      case "chin": return { pts: [S, [X(0.78), S[1] + 0.56 * HH], [cx + 9 * u * f + s * 15 * u, chin - 5 * u]], layer: 2 };
      case "chinUnder": return { pts: [S, [X(1.0), S[1] + 0.46 * HH], [tcx - s * 0.62 * T.a, S[1] + 0.6 * HH]], layer: 1 };
      case "point": return { pts: [S, [X(1.25, 6), S[1] - 0.02 * HH], [X(1.5, 10), S[1] - 0.4 * HH]], layer: 1, prop: "pointer" };
      case "up": return { pts: [S, [X(1.42, 10), S[1] - 0.26 * HH], [X(1.6, 12), S[1] - 0.64 * HH]], layer: 1 };
      case "glasses": return { pts: [S, [X(1.35, 8), S[1] + 0.02 * HH], [cx + 9 * u * f + s * 31 * u, hc - 4 * u]], layer: 2 };
      case "wave": return { pts: [S, [X(1.3, 10), S[1] - 0.16 * HH], [X(1.5, 22), S[1] - 0.56 * HH]], layer: 1, open: true };
      case "deskChin": return { pts: [S, [X(0.95, 2), DESK_Y - 8 * u], [cx + 9 * u * f + s * 14 * u, chin - 3 * u]], layer: 2 };
      case "deskRest": return { pts: [S, [X(1.12, 4), DESK_Y - 7 * u], [tcx - s * 0.15 * T.a, DESK_Y - 6 * u]], layer: 1 };
      default: return { pts: [S, [X(1.08, 6), S[1] + 0.46 * HH], [X(1.12, 6), S[1] + 0.92 * HH]], layer: 0 };
    }
  };
  const A2 = [arm(arms[0], -1), arm(arms[1], 1)];
  const drawArm = (a: Arm) => {
    if (a.prop === "pointer") {
      const [hx, hy] = a.pts[2], dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      p.band([[hx - ux * 10 * u, hy - uy * 10 * u], [hx + ux * 74 * u, hy + uy * 74 * u]], LEO.pointer, 3.6 * u, 1.3 * u, "round");
      p.band([[hx + ux * 67 * u, hy + uy * 67 * u], [hx + ux * 74 * u, hy + uy * 74 * u]], "#2a1c14", 3.6 * u, 1.3 * u, "round");
    }
    limb(p, curve(a.pts[0], a.pts[1], a.pts[2]), LEO.shirt, 8.6 * u);
    paw(p, a.pts[2][0], a.pts[2][1], a.open);
  };
  for (const a of A2) if (a.layer === 0) drawArm(a);
  // ---- torso: vest over the shirt ----
  const tp = blobPts(tcx, tcy, T);
  p.gradFill(tp, LEO.vest, mul(LEO.vest, CLOTH_SH), light);
  p.clip(tp, () => {
    const vb: P2 = [tcx + 3 * u * f, chin + 0.47 * HH];
    p.poly([[tcx - 0.37 * T.a, chin - 0.1 * HH], [tcx + 0.37 * T.a, chin - 0.1 * HH], vb], LEO.shirt, 1.6 * u);
    p.poly([[tcx - 4.5 * u, chin - 0.05 * HH], [tcx + 4.5 * u, chin - 0.05 * HH], [tcx + 3.2 * u, chin + 0.06 * HH], [tcx - 3.2 * u, chin + 0.06 * HH]], LEO.tie, 1.5 * u);
    p.poly([[tcx - 3.2 * u, chin + 0.06 * HH], [tcx + 3.2 * u, chin + 0.06 * HH], [tcx + 7.5 * u, chin + 0.42 * HH], [tcx, chin + 0.52 * HH], [tcx - 7.5 * u, chin + 0.42 * HH]], LEO.tie, 1.5 * u);
    for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, chin + 0.01 * HH], [tcx + s * 0.4 * T.a, chin - 0.07 * HH], [tcx + s * 0.24 * T.a, chin + 0.15 * HH]], LEO.shirt, 1.5 * u);
    const rib = mix(LEO.vest, "#ffffff", 0.16);
    p.stroke([[tcx - 0.37 * T.a - 2.5 * u, chin - 0.1 * HH], [vb[0], vb[1] + 3 * u], [tcx + 0.37 * T.a + 2.5 * u, chin - 0.1 * HH]], 4.2 * u, rib);
    p.poly([[tcx - 1.4 * T.a, torsoBot - 0.13 * HH], [tcx + 1.4 * T.a, torsoBot - 0.13 * HH], [tcx + 1.4 * T.a, torsoBot + 10], [tcx - 1.4 * T.a, torsoBot + 10]], rib, 1.2 * u);
    for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 7 * u, torsoBot - 0.11 * HH], [tcx + i * 7 * u, torsoBot]], 0.8 * u, shade(LEO.vest, 0.8));
    // the school badge on the wearer's left chest (screen right)
    const bx = tcx + 0.5 * T.a + 3 * u * f, by = chin + 0.3 * HH;
    p.poly(rrect(bx - 6.5 * u, by - 5.5 * u, bx + 6.5 * u, by + 5.5 * u, 1.8 * u), LEO.badgeBlue, 1.6 * u);
    p.poly([[bx - 4.6 * u, by - 1.6 * u], [bx, by - 0.4 * u], [bx, by + 3.6 * u], [bx - 4.6 * u, by + 2.4 * u]], "#ffffff", 0.8 * u);
    p.poly([[bx + 4.6 * u, by - 1.6 * u], [bx, by - 0.4 * u], [bx, by + 3.6 * u], [bx + 4.6 * u, by + 2.4 * u]], "#ffffff", 0.8 * u);
    p.dot(bx, by - 3.6 * u, 1.3 * u, LEO.badgeGold);
  });
  p.inkRing(tp, ow, thick);
  // ---- book held at the hip (behind the hand) ----
  for (const [i, k] of arms.entries()) if (k === "book") {
    const s = i ? 1 : -1, c: P2 = [tcx + s * 0.92 * T.a, chin + 0.78 * HH], w = 0.26 * HH, h = 0.34 * HH, a = rad(-7 * s);
    p.poly(rotPts(rrect(c[0] - w + s * 5 * u, c[1] - h + 3 * u, c[0] + w + s * 5 * u, c[1] + h + 3 * u, 2 * u), a, c), "#f1ece0", 1.8 * u);
    p.poly(rotPts(rrect(c[0] - w, c[1] - h, c[0] + w, c[1] + h, 2.2 * u), a, c), LEO.book, 2.4 * u);
    p.poly(rotPts([[c[0] - w + 5 * u, c[1] - h + 6 * u], [c[0] + w - 5 * u, c[1] - h + 6 * u], [c[0] + w - 5 * u, c[1] - h + 12 * u], [c[0] - w + 5 * u, c[1] - h + 12 * u]], a, c), LEO.badgeGold, 0);
  }
  // crossed arms: the screen-left forearm goes under, the screen-right one over it
  for (const a of A2) if (a.layer === 1) drawArm(a);
  // ---- head ----
  const Ah = tilt + headTilt, [cpx, cpy] = rotPts([[cx, chin]], rad(tilt), [cx, hipY])[0];
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  leoHead(p, cx, hc, { expr, facing: f, look: o.look, lookY: o.lookY, lid: blink, glasses, light });
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  for (const a of A2) if (a.layer === 2) drawArm(a);
  p.rot = null;
};

// ---------------- profile (facing screen-right) ----------------
const profileContour = (cx: number, cy: number, n = 240): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const e = 2 / (s < 0 ? 1.95 : 2.4);
    const X = Math.sign(c) * Math.abs(c) ** e, Y = Math.sign(s) * Math.abs(s) ** e;
    const ang = (Math.atan2(s, c) * 180) / Math.PI; // 0 = front, 90 = chin, 180 = back
    let r = 1 + 0.34 * Math.exp(-(((ang - 20) / 19) ** 2)) - 0.05 * Math.exp(-(((ang + 30) / 16) ** 2)) - 0.06 * Math.exp(-(((ang - 62) / 14) ** 2));
    for (const [c0, k] of [[118, 0.8], [134, 1], [150, 0.8]] as const) {
      const d = (c0 - ang) / 8.5; // tufts point back-down
      r += 0.08 * k * (d < 0 ? Math.max(0, 1 + d) : Math.max(0, 1 - d / 0.4));
    }
    pts.push([cx + 0.9 * A * X * r, cy + B * Y * r]);
  }
  return pts;
};

export const leopardSide = (p: Pen, o: { expr?: LExpr; blink?: number; light?: number } = {}) => {
  const { expr = "smug", blink = 0, light = DEF_LIGHT } = o;
  const cx = 300, thick = thickAngle(light), ow = 5 * u, F = LFACE[expr];
  const torsoBot = SOLE - LEGS * HH, chin = torsoBot - TORSO * HH, hc = chin - B + 8, hipY = torsoBot - 0.12 * HH;
  const T: Blob = { a: 0.31 * Wd, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: 0.08, asym: 0.07, rot: 0, noise: 0.005, seed: 21 };
  const tcx = cx + 2 * u, tcy = torsoBot - T.b;
  p.rot = null;
  tail(p, [tcx - 0.7 * T.a, hipY + 6 * u], [tcx - 0.7 * T.a - 46 * u, hipY + 62 * u], [tcx - 0.7 * T.a - 90 * u, hipY + 20 * u], [tcx - 0.7 * T.a - 80 * u, hipY - 46 * u], light);
  for (const [dx, near] of [[-9, false], [5, true]] as const) {
    const h: P2 = [cx + dx * 0.6 * u, hipY], ft: P2 = [cx + dx * u, SOLE - 6 * u];
    limb(p, [h, ft], near ? LEO.pants : shade(LEO.pants, 0.75), 10 * u);
    shoe(p, [ft[0] - 4 * u, ft[1]], [ft[0] + 16 * u, ft[1] + 0.6 * u]);
  }
  const tp = blobPts(tcx, tcy, T);
  p.gradFill(tp, LEO.vest, mul(LEO.vest, CLOTH_SH), light);
  p.clip(tp, () => {
    p.poly([[tcx + 0.45 * T.a, chin - 0.1 * HH], [tcx + 1.3 * T.a, chin - 0.1 * HH], [tcx + 1.3 * T.a, chin + 0.44 * HH]], LEO.shirt, 1.6 * u);
    p.poly([[tcx + 0.86 * T.a, chin + 0.02 * HH], [tcx + 1.02 * T.a, chin + 0.02 * HH], [tcx + 1.06 * T.a, chin + 0.46 * HH], [tcx + 0.92 * T.a, chin + 0.42 * HH]], LEO.tie, 1.4 * u);
    const rib = mix(LEO.vest, "#ffffff", 0.16);
    p.stroke([[tcx + 0.42 * T.a, chin - 0.1 * HH], [tcx + 1.3 * T.a, chin + 0.47 * HH]], 4.2 * u, rib);
    p.poly([[tcx - 1.4 * T.a, torsoBot - 0.13 * HH], [tcx + 1.4 * T.a, torsoBot - 0.13 * HH], [tcx + 1.4 * T.a, torsoBot + 10], [tcx - 1.4 * T.a, torsoBot + 10]], rib, 1.2 * u);
  });
  p.inkRing(tp, ow, thick);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.13 * HH];
  limb(p, curve(S, [S[0] - 7 * u, S[1] + 0.46 * HH], [S[0] + 5 * u, S[1] + 0.9 * HH]), LEO.shirt, 8.6 * u);
  paw(p, S[0] + 5 * u, S[1] + 0.9 * HH);
  // head
  const hx = cx + 6 * u;
  ear(p, hx, hc, -74, 0.84, light);
  ear(p, hx, hc, -104, 1, light);
  const hp = profileContour(hx, hc);
  p.shadedFill(hp, LEO.fur, mul(LEO.fur, FUR_SH), light, A);
  p.clip(hp, () => {
    for (const [sx, sy, r] of [[-0.55, -0.55, 5], [-0.2, -0.78, 4.4], [0.15, -0.8, 3.6], [-0.78, -0.2, 5], [-0.6, 0.18, 4.2], [-0.35, -0.2, 3.6], [0.05, 0.35, 3.4], [-0.32, 0.42, 3.4], [0.35, -0.62, 3.4]] as const)
      spot(p, hx + sx * A, hc + sy * B, r, Math.round(sx * 40 + sy * 13));
    p.ell(hx + 0.98 * A, hc + 0.32 * B, 17 * u, 12 * u, "rgba(255,255,255,0.5)", 0);
  });
  p.inkRing(hp, ow, thick);
  const ex = hx + 0.56 * A, ey = hc - 4 * u;
  const eye = F.eye;
  if (eye === "open" || eye === "lid" || eye === "slit") {
    const lidY = eye === "lid" || blink ? ey - 3.2 * u : eye === "slit" ? ey + 2 * u : -1e9;
    p.clip([[ex - 12 * u, Math.max(lidY, ey - 20 * u)], [ex + 12 * u, Math.max(lidY, ey - 20 * u) + 1.5 * u], [ex + 12 * u, ey + 20 * u], [ex - 12 * u, ey + 20 * u]],
      () => p.ell(ex + 1.5 * u, ey, 6.4 * u, 11.2 * u, INK, 0));
    if (lidY > -1e8) p.stroke([[ex - 8 * u, lidY - 1 * u], [ex + 8.5 * u, lidY + 1.2 * u]], 4.2 * u);
  } else leoEye(p, eye, ex, ey, 1, 0.5, 0, blink);
  taper(p, [ex + 9 * u, ey - 21 * u + F.brow[2] * u], [ex - 9 * u, ey - 22 * u + F.brow[3] * u], 7.6 * u, 6.2 * u);
  const nx = hx + 1.2 * A, ny = hc + 0.16 * B;
  p.poly([[nx - 6 * u, ny - 3 * u], [nx + 1.2 * u, ny - 3.4 * u], [nx + 1.6 * u, ny + 0.4 * u], [nx - 3 * u, ny + 3.4 * u]], LEO.nose, 2 * u);
  p.stroke(curve([nx - 2 * u, ny + 3 * u], [nx - 1.5 * u, ny + 7 * u], [nx - 9 * u, ny + 9 * u], 8), 2.6 * u);
  if (F.mouth === "laugh" || F.mouth === "grin" || F.mouth === "talk") p.poly([[nx - 4 * u, ny + 8 * u], [nx - 14 * u, ny + 9 * u], [nx - 9 * u, ny + 18 * u]], LEO.mouth, 2.4 * u);
  for (const [y0, y1, l] of [[5, 0, 30], [8, 9, 33], [11, 17, 28]] as const)
    p.stroke(curve([nx - 12 * u, ny + y0 * u], [nx - 12 * u + l * 0.5 * u, ny + ((y0 + y1) / 2 - 1) * u], [nx - 12 * u + l * u, ny + y1 * u], 6), 1.25 * u);
  p.rot = null;
};

// ---------------- back view ----------------
export const leopardBack = (p: Pen, o: { light?: number } = {}) => {
  const { light = DEF_LIGHT } = o;
  const cx = 300, thick = thickAngle(light), ow = 5 * u;
  const torsoBot = SOLE - LEGS * HH, chin = torsoBot - TORSO * HH, hc = chin - B + 8, hipY = torsoBot - 0.12 * HH;
  const T: Blob = { a: 0.38 * Wd, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.7, nBot: 2.7, egg: -0.03, asym: 0, rot: 0, noise: 0.005, seed: 17 };
  const tcy = torsoBot - T.b;
  p.rot = null;
  for (const s of [-1, 1]) {
    const h: P2 = [cx + s * 20 * u, hipY], ft: P2 = [cx + s * 24 * u, SOLE - 6 * u];
    limb(p, [h, ft], LEO.pants, 10 * u);
    shoe(p, [ft[0] - s * 4 * u, ft[1] - 1 * u], [ft[0] + s * 7 * u, ft[1]]);
  }
  for (const s of [-1, 1]) {
    const S: P2 = [cx + s * 0.8 * T.a, chin + 0.1 * HH];
    limb(p, curve(S, [cx + s * (1.08 * T.a + 6 * u), S[1] + 0.46 * HH], [cx + s * (1.12 * T.a + 6 * u), S[1] + 0.92 * HH]), LEO.shirt, 8.6 * u);
    paw(p, cx + s * (1.12 * T.a + 6 * u), S[1] + 0.92 * HH);
  }
  const tp = blobPts(cx, tcy, T);
  p.gradFill(tp, LEO.vest, mul(LEO.vest, CLOTH_SH), light);
  p.clip(tp, () => {
    p.poly([[cx - 0.42 * T.a, chin - 0.12 * HH], [cx + 0.42 * T.a, chin - 0.12 * HH], [cx + 0.36 * T.a, chin + 0.07 * HH], [cx - 0.36 * T.a, chin + 0.07 * HH]], LEO.shirt, 1.6 * u);
    const rib = mix(LEO.vest, "#ffffff", 0.16);
    p.poly([[cx - 1.4 * T.a, torsoBot - 0.13 * HH], [cx + 1.4 * T.a, torsoBot - 0.13 * HH], [cx + 1.4 * T.a, torsoBot + 10], [cx - 1.4 * T.a, torsoBot + 10]], rib, 1.2 * u);
    p.stroke([[cx, chin + 0.12 * HH], [cx, torsoBot - 0.14 * HH]], 0.9 * u, shade(LEO.vest, 0.75));
  });
  p.inkRing(tp, ow, thick);
  tail(p, [cx, hipY + 8 * u], [cx + 10 * u, hipY + 72 * u], [cx + 72 * u, hipY + 58 * u], [cx + 88 * u, hipY - 12 * u], light);
  // back of the head: ears with dark backs, more spots, no face
  ear(p, cx, hc, -124, 1, light, true);
  ear(p, cx, hc, -56, 1, light, true);
  const hp = headContour(cx, hc, 0);
  p.shadedFill(hp, LEO.fur, mul(LEO.fur, FUR_SH), light, A);
  p.clip(hp, () => BACK_SPOTS.forEach(([sx, sy, r], i) => spot(p, cx + sx * A, hc + sy * B, r, i)));
  p.inkRing(hp, ow, thick);
};

/** metrics for sheet layout (design units) */
export const LEO_METRICS = { headTop: SOLE - LEGS * HH - TORSO * HH - 2 * B + 8 - 45, hc: SOLE - LEGS * HH - TORSO * HH - B + 8, sole: SOLE, u };
