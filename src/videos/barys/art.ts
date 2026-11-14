// «Қанат» — characters drawn in code as SVG markup strings (2D cel look: union outline, flat fill + one shade).
// Pure functions of a pose, so the same art renders in Remotion and in a static preview page.

export type V = [number, number];

// ------------------------------------------------------------------ colour helpers
const hex = (c: string): V3 => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
type V3 = [number, number, number];
const toHex = (v: V3) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
export const mixc = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
};

// ------------------------------------------------------------------ geometry helpers
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const len = (a: V) => Math.hypot(a[0], a[1]);
const lerpV = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const rot = (a: V, deg: number): V => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
};
const f = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (p: V) => `${f(p[0])},${f(p[1])}`;

/** Smooth closed path through points (Catmull-Rom -> cubic Bezier). */
export const closedPath = (pts: V[], k = 1) => {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = add(p1, mul(sub(p2, p0), k / 6));
    const c2 = sub(p2, mul(sub(p3, p1), k / 6));
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + "Z";
};
/** Smooth open path through points. */
export const openPath = (pts: V[], k = 1) => {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = add(p1, mul(sub(p2, p0), k / 6));
    const c2 = sub(p2, mul(sub(p3, p1), k / 6));
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
};
const bez = (p0: V, p1: V, p2: V, p3: V, t: number): V => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
/** Two-bone IK: joint position for root->target with lengths a, b; bend = +1/-1 picks the side. */
const ik = (root: V, target: V, a: number, b: number, bend: number): { joint: V; end: V } => {
  const d0 = sub(target, root);
  let d = len(d0);
  const dd = Math.max(Math.abs(a - b) + 1, Math.min(a + b - 0.5, d));
  const dir = mul(d0, 1 / (d || 1));
  const end = add(root, mul(dir, dd));
  d = dd;
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const ang = Math.acos(Math.max(-1, Math.min(1, cosA))) * bend;
  const j = add(root, mul(rot(dir, (ang * 180) / Math.PI), a));
  return { joint: j, end };
};

// ------------------------------------------------------------------ palette & light
export const OUT = "#3b2b29";
export type Light = { back: number; sil: string };
const tone = (c: string, L: Light) => (L.back > 0 ? mixc(c, L.sil, L.back) : c);

// ------------------------------------------------------------------ SNOW LEOPARD
export type LeopardPose = {
  hip: V; chest: V; R: number; back: number; belly: number;
  head: V; headRot: number; ears: number; eyeOpen: number; look: V; mouth: number;
  fpN: V; fpF: V; // front paws near / far
  hpN: V; hpF: V; // hind paws
  hfN: number; hfF: number; // hind foot (metatarsus) angle, degrees from +x
  tail: [V, V, V]; // control points relative to tail root: c1, c2, end
  pawCurl: number; // 0 flat on the ground, 1 curled (in flight)
};

const LEO = {
  fur: "#e6dfd4", shade: "#b9b0aa", belly: "#f7f2ea", spot: "#4b4340", spotIn: "#cdc2b6",
  nose: "#b98a86", iris: "#b5cc9c", pupil: "#262021", ear: "#9f948e", muzzle: "#f4efe7",
};

export const leopard = (p: LeopardPose, id: string, L: Light = { back: 0, sil: "#5d4a4a" }, ow = 3.2) => {
  const C = Object.fromEntries(Object.entries(LEO).map(([k, v]) => [k, tone(v, L)])) as typeof LEO;
  const shadeFar = tone(mixc(LEO.fur, LEO.shade, 0.75), L);
  // body frame: u from hip to chest, n = up normal
  const axis = sub(p.chest, p.hip);
  const Lb = len(axis);
  const u = mul(axis, 1 / Lb);
  const n: V = [u[1], -u[0]];
  const B = (s: number, t: number): V => add(add(p.hip, mul(u, s * Lb)), mul(n, t * p.R));
  const torso: V[] = [
    B(-0.2, 0.15), B(-0.12, 0.62), B(0.12, 0.8), B(0.45, 0.78 + p.back / p.R), B(0.78, 0.85), B(0.98, 0.95),
    B(1.14, 0.45), B(1.12, -0.3), B(0.95, -0.7), B(0.55, -0.72 - p.belly / p.R), B(0.2, -0.75), B(-0.08, -0.55),
  ];
  const torsoD = closedPath(torso);
  // legs
  const shoulderN = B(0.84, -0.05), shoulderF = B(0.9, 0.05);
  const hipN = B(0.12, 0.05), hipF = B(0.06, 0.15);
  const front = (sh: V, paw: V) => {
    const { joint, end } = ik(sh, paw, 74, 66, 1);
    return [sh, joint, end] as V[];
  };
  const hind = (hp: V, paw: V, ang: number) => {
    const hock = add(paw, rot([-44, 0], ang));
    const { joint, end } = ik(hp, hock, 72, 68, -1);
    return [hp, joint, end, paw] as V[];
  };
  const fN = front(shoulderN, p.fpN), fF = front(shoulderF, p.fpF);
  const hN = hind(hipN, p.hpN, p.hfN), hF = hind(hipF, p.hpF, p.hfF);
  // tail (cubic from rump)
  const t0 = B(-0.16, 0.35);
  const tc = [t0, add(t0, p.tail[0]), add(t0, p.tail[1]), add(t0, p.tail[2])] as [V, V, V, V];
  const tailD = `M${P(tc[0])}C${P(tc[1])} ${P(tc[2])} ${P(tc[3])}`;
  const TW = 0.62 * p.R;
  // head frame
  const H = (x: number, y: number): V => add(p.head, rot([x, y], p.headRot));
  const hs = p.R / 62; // head scale follows body size
  const Hs = (x: number, y: number) => H(x * hs, y * hs);
  const skull: V[] = [Hs(-52, 4), Hs(-48, -30), Hs(-26, -52), Hs(6, -56), Hs(36, -44), Hs(52, -22), Hs(60, 2),
    Hs(54, 26), Hs(30, 42), Hs(0, 46), Hs(-30, 40), Hs(-50, 26)];
  const skullD = closedPath(skull);
  const ear = (cx: number, cy: number, s: number, tilt: number) => {
    const t = tilt + (1 - p.ears) * -28;
    const pts: V[] = [[-20, 6], [-16, -18], [-4, -30], [10, -22], [18, 4]].map((q) => Hs(cx + rot(q as V, t)[0] * s, cy + rot(q as V, t)[1] * s));
    const inner: V[] = [[-10, 2], [-8, -14], [-2, -21], [7, -15], [10, 2]].map((q) => Hs(cx + rot(q as V, t)[0] * s, cy + rot(q as V, t)[1] * s));
    return { d: closedPath(pts), inner: closedPath(inner) };
  };
  const earF = ear(28, -46, 0.9, 18), earN = ear(-22, -44, 1.0, -12);
  const neckA = B(1.02, 0.35), neckB = p.head;
  const muzzle: V[] = [Hs(22, 4), Hs(42, -4), Hs(64, 2), Hs(70, 16), Hs(60, 30), Hs(38, 34), Hs(22, 26)];

  const o = (w: number) => w + 2 * ow;
  const stroke = (d: string, col: string, w: number, extra = "") =>
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const fill = (d: string, col: string, extra = "") => `<path d="${d}" fill="${col}" ${extra}/>`;
  const outlineFill = (d: string) => `<path d="${d}" fill="${OUT}" stroke="${OUT}" stroke-width="${f(2 * ow)}" stroke-linejoin="round"/>`;
  const limb = (pts: V[], ws: number[], col: string, outline: boolean) => {
    let s = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const d = `M${P(pts[i])}L${P(pts[i + 1])}`;
      s += stroke(d, outline ? OUT : col, outline ? o(ws[i]) : ws[i]);
    }
    return s;
  };
  const paw = (pt: V, dir: number, col: string, outline: boolean, sc = 1) => {
    const curl = p.pawCurl;
    const rx = 23 * sc * (1 - 0.25 * curl), ry = 13 * sc * (1 + 0.2 * curl);
    const e = `<ellipse cx="${f(pt[0] + Math.cos((dir * Math.PI) / 180) * 9)}" cy="${f(pt[1] - 6 + Math.sin((dir * Math.PI) / 180) * 9)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(dir)} ${P(pt)})"`;
    return outline ? `${e} fill="${OUT}" stroke="${OUT}" stroke-width="${f(2 * ow)}"/>` : `${e} fill="${col}"/>`;
  };
  const pawDir = (chain: V[]) => {
    const a = chain[chain.length - 2], b = chain[chain.length - 1];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    // paws lie forward along the ground when standing; in flight follow the leg
    return p.pawCurl > 0.5 ? ang - 60 : 0;
  };
  const W = p.R / 62;
  const fw = [44 * W, 32 * W], hw = [58 * W, 34 * W, 27 * W];

  // ---- outline pass
  let s = "";
  s += limb(fF, fw, "", true) + limb(hF, hw, "", true) + paw(fF[2], pawDir(fF), "", true, W) + paw(hF[3], pawDir(hF), "", true, W);
  s += stroke(tailD, OUT, o(TW));
  s += outlineFill(torsoD);
  s += stroke(`M${P(neckA)}L${P(neckB)}`, OUT, o(p.R * 1.25));
  s += outlineFill(earF.d) + outlineFill(earN.d) + outlineFill(skullD) + outlineFill(closedPath(muzzle));
  s += limb(hN, hw, "", true) + limb(fN, fw, "", true) + paw(fN[2], pawDir(fN), "", true, W) + paw(hN[3], pawDir(hN), "", true, W);

  // ---- fill pass
  s += limb(fF, fw, shadeFar, false) + limb(hF, hw, shadeFar, false) + paw(fF[2], pawDir(fF), shadeFar, false, W) + paw(hF[3], pawDir(hF), shadeFar, false, W);
  s += stroke(tailD, C.fur, TW);
  // tail rings + dark tip
  for (let i = 1; i <= 7; i++) {
    const t = 0.2 + i * 0.105;
    const a = bez(tc[0], tc[1], tc[2], tc[3], Math.min(1, t));
    const b2 = bez(tc[0], tc[1], tc[2], tc[3], Math.min(1, t + 0.04));
    const ang = (Math.atan2(b2[1] - a[1], b2[0] - a[0]) * 180) / Math.PI;
    s += `<ellipse cx="${f(a[0])}" cy="${f(a[1])}" rx="${f(TW * 0.32)}" ry="${f(TW * 0.5)}" transform="rotate(${f(ang)} ${P(a)})" fill="none" stroke="${C.spot}" stroke-width="${f(TW * 0.16)}"/>`;
  }
  const tip = tc[3];
  s += `<circle cx="${f(tip[0])}" cy="${f(tip[1])}" r="${f(TW * 0.5)}" fill="${C.spot}"/>`;
  s += fill(torsoD, C.fur);
  // belly light + cel shade under the body (clipped to the torso)
  s += `<clipPath id="${id}t"><path d="${torsoD}"/></clipPath>`;
  s += `<g clip-path="url(#${id}t)">`;
  s += fill(closedPath([B(-0.3, -0.5), B(0.5, -0.56 - p.belly / p.R), B(1.2, -0.42), B(1.2, -1.5), B(-0.3, -1.5)]), C.shade, `opacity="0.75"`);
  // rosettes
  const ros: [number, number, number, number][] = [
    [0.08, 0.35, 1.0, 20], [0.22, 0.55, 0.9, 80], [0.36, 0.3, 1.1, 140], [0.5, 0.58, 0.95, 30], [0.62, 0.25, 1.0, 200],
    [0.75, 0.55, 0.85, 100], [0.3, 0.05, 0.9, 260], [0.55, -0.02, 0.85, 320], [0.84, 0.25, 0.8, 10], [0.15, -0.1, 0.8, 180],
    [0.42, 0.72, 0.7, 60], [0.68, 0.74, 0.65, 240],
  ];
  for (const [ss, tt, sc, a] of ros) {
    const c = B(ss, tt);
    const r = 10.5 * sc * W;
    const a0 = (a * Math.PI) / 180, a1 = a0 + 4.6;
    const pa: V = [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r], pb: V = [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r];
    s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.8)}" fill="${C.spotIn}"/>`;
    s += `<path d="M${P(pa)}A${f(r)} ${f(r)} 0 1 1 ${P(pb)}" fill="none" stroke="${C.spot}" stroke-width="${f(4.2 * W)}" stroke-linecap="round"/>`;
  }
  s += `</g>`;
  s += stroke(`M${P(neckA)}L${P(neckB)}`, C.fur, p.R * 1.25);
  // ears
  s += fill(earF.d, tone(mixc(LEO.fur, LEO.shade, 0.5), L)) + fill(earF.inner, C.ear);
  s += fill(earN.d, C.fur) + fill(earN.inner, C.ear);
  s += fill(skullD, C.fur);
  // cheek ruff shade + chin
  s += `<clipPath id="${id}h"><path d="${skullD}"/></clipPath><g clip-path="url(#${id}h)">`;
  s += fill(closedPath([Hs(-60, 20), Hs(-10, 30), Hs(40, 36), Hs(40, 70), Hs(-60, 70)]), C.shade, `opacity="0.55"`);
  s += `</g>`;
  s += fill(closedPath(muzzle), C.muzzle);
  // head spots
  for (const [x, y, r] of [[-30, -30, 5], [-14, -40, 4.5], [2, -46, 4], [-38, -10, 4], [-40, 8, 3.5], [16, -40, 3.5], [-24, -48, 3.5], [-44, -22, 3.5]] as V3[]) {
    const c = Hs(x, y);
    s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * hs)}" fill="${C.spot}"/>`;
  }
  // eyes (near bigger, far narrower)
  const eye = (cx: number, cy: number, rx: number, ry: number, tilt: number) => {
    const op = Math.max(0.05, p.eyeOpen);
    const c = Hs(cx, cy);
    const ang = p.headRot + tilt;
    const ryo = ry * op;
    const al = `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx * hs)}" ry="${f(ryo * hs)}" transform="rotate(${f(ang)} ${P(c)})"`;
    let e = `${al} fill="${OUT}" stroke="${OUT}" stroke-width="${f(3 * hs)}"/>`;
    e += `<clipPath id="${id}e${cx}"><ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx * hs)}" ry="${f(ryo * hs)}" transform="rotate(${f(ang)} ${P(c)})"/></clipPath>`;
    const ic = add(c, rot([p.look[0] * rx * 0.35 * hs, p.look[1] * ry * 0.4 * hs], p.headRot));
    e += `<g clip-path="url(#${id}e${cx})"><rect x="${f(c[0] - 40)}" y="${f(c[1] - 40)}" width="80" height="80" fill="#f4f1e6"/>`;
    e += `<circle cx="${f(ic[0])}" cy="${f(ic[1])}" r="${f(ry * 0.92 * hs)}" fill="${C.iris}"/>`;
    e += `<circle cx="${f(ic[0])}" cy="${f(ic[1])}" r="${f(ry * 0.5 * hs)}" fill="${C.pupil}"/>`;
    e += `<circle cx="${f(ic[0] + 3 * hs)}" cy="${f(ic[1] - 3.5 * hs)}" r="${f(2.6 * hs)}" fill="#ffffff"/>`;
    // upper lid shadow
    e += `<ellipse cx="${f(c[0])}" cy="${f(c[1] - ryo * hs * 1.25)}" rx="${f(rx * hs * 1.2)}" ry="${f(ryo * hs * 0.65)}" transform="rotate(${f(ang)} ${P(c)})" fill="${OUT}" opacity="0.35"/></g>`;
    e += `<path d="M${P(add(c, rot([-rx * hs * 1.05, 0], ang)))}Q${P(add(c, rot([0, -ryo * hs * 1.5], ang)))} ${P(add(c, rot([rx * hs * 1.1, -ry * 0.2 * hs], ang)))}" fill="none" stroke="${OUT}" stroke-width="${f(3.4 * hs)}" stroke-linecap="round"/>`;
    return e;
  };
  s += eye(6, -14, 14, 11, -8) + eye(42, -18, 9.5, 9.5, -14);
  // brow tufts
  s += stroke(`M${P(Hs(-6, -32))}Q${P(Hs(6, -36))} ${P(Hs(16, -31))}`, C.spot, 3 * hs);
  // nose & mouth
  s += fill(closedPath([Hs(56, 2), Hs(70, 0), Hs(66, 10)]), C.nose);
  s += stroke(`M${P(Hs(65, 10))}L${P(Hs(64, 18))}`, OUT, 2.4 * hs);
  const m = p.mouth;
  s += stroke(`M${P(Hs(50, 20 + m * 4))}Q${P(Hs(57, 26 + m * 10))} ${P(Hs(64, 18))}Q${P(Hs(68, 24 + m * 6))} ${P(Hs(72, 20))}`, OUT, 2.4 * hs);
  if (m > 0.15) s += fill(closedPath([Hs(52, 22), Hs(64, 20), Hs(70, 24), Hs(60, 22 + m * 16)]), "#7a4148");
  // whisker dots + whiskers
  for (const [x, y] of [[48, 14], [54, 16], [46, 20]] as V[]) {
    const c = Hs(x, y);
    s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(1.6 * hs)}" fill="${C.spot}"/>`;
  }
  s += stroke(`M${P(Hs(58, 18))}Q${P(Hs(84, 12))} ${P(Hs(100, 16))}M${P(Hs(58, 21))}Q${P(Hs(84, 22))} ${P(Hs(98, 30))}`, tone("#fbf8f2", L), 1.3 * hs, `opacity="0.9"`);
  // near limbs on top
  s += limb(hN, hw, C.fur, false) + limb(fN, fw, C.fur, false) + paw(fN[2], pawDir(fN), C.fur, false, W) + paw(hN[3], pawDir(hN), C.fur, false, W);
  // thigh contour + leg spots
  const th0 = B(0.32, -0.25), th1 = B(0.05, 0.42), th2 = B(-0.1, 0.0);
  s += stroke(openPath([th0, th1, th2]), OUT, 2.6 * W, `opacity="0.85"`);
  s += stroke(`M${P(lerpV(fN[0], fN[1], 0.45))}L${P(lerpV(fN[1], fN[2], 0.7))}`, C.shade, 6 * W, `opacity="0.7"`);
  for (const ch of [fN, hN]) {
    for (let i = 0; i < 3; i++) {
      const c = lerpV(ch[1], ch[2], 0.25 + i * 0.25);
      s += `<circle cx="${f(c[0] + 5 * W)}" cy="${f(c[1])}" r="${f(3.2 * W)}" fill="${C.spot}" opacity="0.85"/>`;
    }
  }
  return s;
};

// ------------------------------------------------------------------ FEATHER (juvenile golden eagle tail feather)
export const feather = (id: string, Lt: Light = { back: 0, sil: "#5d4a4a" }, len0 = 240) => {
  const k = len0 / 240;
  const S = (x: number, y: number): V => [x * k, y * k];
  const vane: V[] = [S(0, 0), S(-14, -30), S(-24, -90), S(-24, -160), S(-16, -215), S(-4, -240), S(10, -236), S(20, -200), S(24, -140), S(20, -70), S(12, -24)];
  const vd = closedPath(vane);
  const dark = tone("#3f2c21", Lt), white = tone("#f6f2ea", Lt), mid = tone("#8a6a52", Lt);
  let s = `<path d="${vd}" fill="${OUT}" stroke="${OUT}" stroke-width="${f(5 * k)}" stroke-linejoin="round"/>`;
  s += `<clipPath id="${id}v"><path d="${vd}"/></clipPath><g clip-path="url(#${id}v)">`;
  s += `<rect x="${f(-40 * k)}" y="${f(-260 * k)}" width="${f(80 * k)}" height="${f(270 * k)}" fill="${white}"/>`;
  s += `<path d="${closedPath([S(-40, -120), S(0, -132), S(40, -112), S(40, -260), S(-40, -260)])}" fill="${dark}"/>`;
  s += `<path d="${closedPath([S(-40, -108), S(0, -122), S(40, -100), S(40, -116), S(0, -136), S(-40, -126)])}" fill="${mid}"/>`;
  // barb lines + notches
  for (let i = 0; i < 16; i++) {
    const y = -30 - i * 13;
    s += `<path d="M0,${f(y * k)}l${f(-26 * k)},${f(-10 * k)}M0,${f(y * k)}l${f(26 * k)},${f(-12 * k)}" stroke="${OUT}" stroke-width="${f(0.8 * k)}" opacity="0.22"/>`;
  }
  s += `</g>`;
  s += `<path d="M${f(-24 * k)},${f(-150 * k)}l${f(9 * k)},${f(6 * k)}M${f(22 * k)},${f(-90 * k)}l${f(-8 * k)},${f(5 * k)}" stroke="${OUT}" stroke-width="${f(2 * k)}" stroke-linecap="round"/>`;
  // down at the base
  s += `<path d="M0,0q${f(-16 * k)},${f(-6 * k)} ${f(-18 * k)},${f(-20 * k)}M0,0q${f(14 * k)},${f(-6 * k)} ${f(16 * k)},${f(-18 * k)}" stroke="${white}" stroke-width="${f(5 * k)}" stroke-linecap="round" fill="none"/>`;
  // rachis
  s += `<path d="M0,${f(14 * k)}Q${f(2 * k)},${f(-120 * k)} ${f(2 * k)},${f(-236 * k)}" stroke="${tone("#efe8dc", Lt)}" stroke-width="${f(3.2 * k)}" fill="none" stroke-linecap="round"/>`;
  return s;
};

// ------------------------------------------------------------------ GOLDEN EAGLE
const EAG = {
  body: "#5b3f2d", shade: "#432f22", far: "#3c2a1f", nape: "#cf9d55", beak: "#3e3a3c", cere: "#eabd3f",
  feet: "#eabd3f", white: "#f3efe8", band: "#36261c", iris: "#c98330", pants: "#6a4b35",
};

/** Eagle seen from below, soaring (for the tiny sky silhouette and the shadow). Centre at origin, span ~ 2*w. */
export const eagleSoar = (flex: number, col: string, w = 100) => {
  const k = w / 100;
  const S = (x: number, y: number): V => [x * k, y * k];
  const wing = (sg: number) => {
    const pts: V[] = [S(0, -6), S(30 * sg, -14 - flex * 6), S(62 * sg, -16 - flex * 10), S(86 * sg, -12 - flex * 12),
      S(98 * sg, -4 - flex * 10), S(100 * sg, 2 - flex * 6), S(92 * sg, 6), S(96 * sg, 10), S(84 * sg, 12), S(88 * sg, 16),
      S(74 * sg, 16), S(60 * sg, 18), S(34 * sg, 16), S(0, 8)];
    return closedPath(pts, 0.6);
  };
  const body = closedPath([S(0, -26), S(7, -14), S(8, 10), S(5, 22), S(14, 34), S(0, 38), S(-14, 34), S(-5, 22), S(-8, 10), S(-7, -14)], 0.8);
  return `<path d="${wing(1)}" fill="${col}"/><path d="${wing(-1)}" fill="${col}"/><path d="${body}" fill="${col}"/>`;
};

export type EaglePose = {
  tilt: number; // body pitch, deg (positive = nose up)
  raiseN: number; raiseF: number; // wing span screen angle, deg: -90 up, -150 back-up, 90 down
  spread: number; // open wing: 0.3 half-folded .. 1 fully open
  fold: number; // 0 open wings .. 1 folded along the body (perched)
  legs: number; // 0 tucked .. 1 extended (landing)
  perch: number; // 0..1 legs straight down, gripping
  tailSpread: number;
  headRot: number;
};

/** Side view, facing right. Origin = body centre. ~260 px beak-to-tail at scale 1. */
export const eagleSide = (p: EaglePose, id: string, L: Light = { back: 0, sil: "#2e2220" }, ow = 3.0) => {
  const C = Object.fromEntries(Object.entries(EAG).map(([k, v]) => [k, tone(v, L)])) as typeof EAG;
  const R = (q: V): V => rot(q, -p.tilt);
  const fillO = (d: string) => `<path d="${d}" fill="${OUT}" stroke="${OUT}" stroke-width="${f(2 * ow)}" stroke-linejoin="round"/>`;
  const fl = (d: string, c: string, x = "") => `<path d="${d}" fill="${c}" ${x}/>`;
  // ---- open wing in its own frame: x = out along the span, y = toward the trailing edge
  const openWing = (raise: number, sc: number) => {
    const s = Math.max(0.2, p.spread);
    const k = sc;
    const wrist: V = [96 * k * (0.7 + 0.3 * s), -14 * k];
    const back = (1 - s) * 95;
    const hand = 0.62 + 0.38 * s;
    const tipA = [-10, 0, 10, 20, 30], tipL = [104, 106, 100, 90, 78];
    const pts: V[] = [[0, -2 * k], [36 * k, -12 * k], [70 * k * (0.75 + 0.25 * s), -16 * k], wrist];
    for (let i = 0; i < 5; i++) {
      pts.push(add(wrist, rot([tipL[i] * k * hand, 0], tipA[i] + back)));
      if (i < 4) pts.push(add(wrist, rot([68 * k * hand, 0], tipA[i] + 5 + back)));
    }
    const tr: V[] = [[140, 40], [112, 47], [84, 51], [56, 51], [28, 45], [6, 31], [-4, 12]];
    for (const q of tr) pts.push([q[0] * k * (0.65 + 0.35 * s), q[1] * k * (0.8 + 0.2 * s)]);
    const mir = Math.sin((raise * Math.PI) / 180) < 0;
    const M = (q: V): V => rot(mir ? [q[0], -q[1]] : q, raise);
    const d = closedPath(pts.map(M), 0.5);
    const cov = closedPath(([[0, -2], [36, -12], [70, -16], [96, -14], [92, 8], [60, 22], [30, 22], [4, 16]] as V[])
      .map((q) => M([q[0] * k * (0.75 + 0.25 * s), q[1] * k])), 0.7);
    const wp = closedPath(([[0, 0], [30, -6], [34, 14], [6, 20]] as V[]).map((q) => M(add(wrist, [q[0] * k, q[1] * k]))), 0.7);
    return { d, cov, wp };
  };
  const shoulder = R([16, -16]);
  const tr = (d: string, op = 1) => `<g transform="translate(${P(shoulder)})"${op < 1 ? ` opacity="${f(op)}"` : ""}>${d}</g>`;
  // raise = screen angle of the wing span (0 forward, -90 up, 180 back, 90 down), relative to a level body
  const wF = openWing(p.raiseF - p.tilt, 0.94), wN = openWing(p.raiseN - p.tilt, 1.0);
  const folded = closedPath(([[24, -18], [0, -24], [-40, -22], [-90, -14], [-142, -4], [-152, 4], [-136, 8], [-90, 12], [-40, 16], [0, 14], [22, 4]] as V[]).map(R), 0.6);
  const foldedCov = closedPath(([[22, -16], [-30, -20], [-46, -6], [-10, 6]] as V[]).map(R), 0.7);
  const body = closedPath(([[72, -16], [56, -30], [20, -34], [-24, -28], [-56, -14], [-64, 2], [-44, 18], [-6, 30], [34, 28], [60, 14], [74, 0]] as V[]).map(R), 0.9);
  const ts = p.tailSpread;
  const tail = closedPath(([[-52, -8], [-96, -14 - 8 * ts], [-124, -12 - 10 * ts], [-128, -4], [-131, 4], [-128, 12], [-122, 20 + 10 * ts], [-94, 22 + 8 * ts], [-52, 10]] as V[]).map(R), 0.6);
  const tailBand = closedPath(([[-104, -30], [-140, -30], [-140, 40], [-104, 40]] as V[]).map(R), 0.3);
  const hd = R([78, -24]);
  const H = (x: number, y: number): V => add(hd, rot([x, y], -p.tilt + p.headRot));
  const head = closedPath([H(-26, 12), H(-26, -10), H(-12, -24), H(8, -27), H(24, -20), H(32, -6), H(30, 8), H(16, 18), H(-4, 22)], 0.9);
  const nape = closedPath([H(-34, -34), H(14, -34), H(6, -16), H(-12, 0), H(-36, 14)], 0.8);
  const beak = closedPath([H(22, -14), H(36, -15), H(48, -8), H(54, 4), H(52, 15), H(46, 8), H(40, 4), H(24, 6)], 0.5);
  const cere = closedPath([H(22, -14), H(32, -15), H(34, -2), H(24, 0)], 0.6);
  // legs
  const legBase = R([6, 22]);
  const ext = p.legs * (1 - p.perch);
  const foot: V = add(legBase, [16 * ext, 16 + 26 * Math.max(p.legs, p.perch)]);
  const showLegs = Math.max(p.legs, p.perch) > 0.05;
  const pants = `M${P(legBase)}L${P(lerpV(legBase, foot, 0.72))}`;
  const toes = [[15, 3], [11, 9], [3, 10], [-10, 4]].map((q) => `M${P(foot)}l${f(q[0])},${f(q[1])}`).join("");
  let s = "";
  const openOp = 1 - p.fold;
  // ---- outline pass
  if (openOp > 0) s += tr(fillO(wF.d), openOp);
  s += fillO(tail) + fillO(body) + fillO(head) + fillO(beak);
  if (showLegs) s += `<path d="${pants}" stroke="${OUT}" stroke-width="${f(22 + 2 * ow)}" stroke-linecap="round"/><path d="${toes}" stroke="${OUT}" stroke-width="${f(6 + 2 * ow)}" stroke-linecap="round"/>`;
  // ---- fill pass
  if (openOp > 0) s += tr(fl(wF.d, C.far), openOp);
  s += fl(tail, C.white) + `<clipPath id="${id}tl"><path d="${tail}"/></clipPath><g clip-path="url(#${id}tl)">${fl(tailBand, C.band)}</g>`;
  s += fl(body, C.body);
  s += `<clipPath id="${id}b"><path d="${body}"/></clipPath><g clip-path="url(#${id}b)">${fl(closedPath(([[-70, 8], [0, 14], [70, 6], [70, 40], [-70, 40]] as V[]).map(R)), C.shade)}</g>`;
  if (showLegs) {
    s += `<path d="${pants}" stroke="${C.pants}" stroke-width="22" stroke-linecap="round"/>`;
    s += `<path d="${toes}" stroke="${C.feet}" stroke-width="6" stroke-linecap="round"/>`;
  }
  s += fl(head, C.body);
  s += `<clipPath id="${id}h"><path d="${head}"/></clipPath><g clip-path="url(#${id}h)">${fl(nape, C.nape)}</g>`;
  s += fl(beak, C.beak) + fl(cere, C.cere);
  s += `<path d="M${P(H(24, 5))}L${P(H(12, 3))}" stroke="${C.cere}" stroke-width="3" stroke-linecap="round"/>`;
  const e = H(12, -8);
  s += `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="7" fill="${OUT}"/><circle cx="${f(e[0])}" cy="${f(e[1])}" r="5.2" fill="${C.iris}"/><circle cx="${f(e[0] + 1.2)}" cy="${f(e[1])}" r="2.8" fill="#1d1717"/><circle cx="${f(e[0] + 2.6)}" cy="${f(e[1] - 1.8)}" r="1.2" fill="#fff"/>`;
  s += `<path d="M${P(H(0, -14))}Q${P(H(14, -19))} ${P(H(27, -11))}" stroke="${OUT}" stroke-width="4.4" stroke-linecap="round" fill="none"/>`;
  // folded wing (perched) and open near wing
  if (p.fold > 0) {
    s += `<g opacity="${f(p.fold)}">${fillO(folded)}${fl(folded, C.body)}<clipPath id="${id}fw"><path d="${folded}"/></clipPath><g clip-path="url(#${id}fw)">${fl(foldedCov, C.pants)}</g>`;
    s += `<path d="${openPath(([[-60, 2], [-100, 0], [-140, 2]] as V[]).map(R))}" stroke="${OUT}" stroke-width="2" fill="none" opacity="0.7"/></g>`;
  }
  if (openOp > 0) s += tr(fillO(wN.d) + fl(wN.d, C.body) + `<clipPath id="${id}w"><path d="${wN.d}"/></clipPath><g clip-path="url(#${id}w)">${fl(wN.cov, C.pants)}${fl(wN.wp, C.white, `opacity="0.8"`)}</g>`, openOp);
  return s;
};

// ------------------------------------------------------------------ TITLE «Қанат» (stroke centrelines, pen lifts between)
const ell = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 18): V[] => {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + (a1 - a0) * (i / n)) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
};
const slant = (pts: V[]): V[] => pts.map(([x, y]) => [x - y * 0.16, y]);
export const TITLE_STROKES: V[][] = [
  slant([[2, -112], [0, -70], [-1, -30], [-2, 0]]), // Қ stem
  slant([[56, -112], [40, -94], [20, -72], [4, -56], [16, -48], [32, -30], [44, -12], [50, -2], [58, -1], [60, 10], [59, 26]]), // Қ arm, leg, descender
  slant([...ell(98, -30, 22, 30, -30, -330, 22), [120, -54], [118, -24], [117, -4], [124, 2]]), // а
  slant([[152, -60], [150, -30], [148, 0]]), // н stem 1
  slant([[150, -32], [168, -34], [188, -34]]), // н bar
  slant([[192, -60], [190, -30], [188, 0]]), // н stem 2
  slant([...ell(232, -30, 22, 30, -30, -330, 22), [254, -54], [252, -24], [251, -4], [258, 2]]), // а
  slant([[280, -60], [304, -62], [330, -61]]), // т bar
  slant([[305, -61], [304, -30], [302, -2]]), // т stem
];

/** A point in the leopard's head frame (same units as the head drawing) -> leopard local coords. */
export const leoHeadPt = (p: LeopardPose, x: number, y: number): V => {
  const hs = p.R / 62;
  return add(p.head, rot([x * hs, y * hs], p.headRot));
};
/** A point in the leopard's body frame (s along hip->chest, t in body radii, up positive). */
export const leoBodyPt = (p: LeopardPose, s: number, t: number): V => {
  const axis = sub(p.chest, p.hip);
  const Lb = len(axis);
  const u = mul(axis, 1 / Lb);
  const n: V = [u[1], -u[0]];
  return add(add(p.hip, mul(u, s * Lb)), mul(n, t * p.R));
};
export const polyLen = (pts: V[]) => pts.slice(1).reduce((a, q, i) => a + len(sub(q, pts[i])), 0);
export const polyAt = (pts: V[], d: number): V => {
  for (let i = 1; i < pts.length; i++) {
    const l = len(sub(pts[i], pts[i - 1]));
    if (d <= l) return lerpV(pts[i - 1], pts[i], l ? d / l : 0);
    d -= l;
  }
  return pts[pts.length - 1];
};
