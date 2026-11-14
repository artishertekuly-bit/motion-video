// «Қанат» — Барыс пен Бүркіт. 10 s, 1920x1080, 60 fps. Watercolour layers (baked in Python) + code-drawn 2D cast.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Audio } from "remotion";
import { loadFont } from "@remotion/google-fonts/Caveat";
import { eagleSide, eagleSoar, feather, leoBodyPt, leoHeadPt, leopard, openPath, polyAt, polyLen, TITLE_STROKES, type EaglePose, type LeopardPose, type V } from "./art";
import { EAGLE_POSES, LEO_POSES, lerpPose } from "./poses";
import { LAYERS, type LayerMeta } from "./layers";

const { fontFamily: CAVEAT } = loadFont("normal", { weights: ["500"], subsets: ["cyrillic", "cyrillic-ext"] });

export const FPS = 60;
export const BARYS_FRAMES = 600;
const T_B = 2.2, T_C = 4.6;
const F = 1000;
export const SHOW_AUDIO = { on: true };

// ------------------------------------------------------------------ math
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const s5 = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixV = (a: V, b: V, t: number): V => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
/** Catmull-Rom (non-uniform) through keys; zero slope at the ends. */
const spline = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
  const m = (j: number) => (j <= 0 || j >= n - 1 ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const h = t1 - t0, u = (t - t0) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return h00 * v0 + h10 * h * m(i) + h01 * v1 + h11 * h * m(i + 1);
};
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ camera (A and C share the world)
type Cam = { x: number; y: number; z: number; roll: number };
const camA = (t: number): Cam => ({
  x: spline(t, [[0, 0], [1.1, -6], [2.2, -24]]),
  y: spline(t, [[0, -1500], [0.35, -1420], [1.2, -720], [2.2, -150]]),
  z: spline(t, [[0, 0], [2.2, 80]]),
  roll: spline(t, [[0, -1.6], [2.2, 0.6]]),
});
const CK: [number, number, number, number][] = [
  [4.6, -30, -40, 210], [5.0, 40, -80, 140], [5.65, 190, -130, 20], [6.1, 400, -128, 0], [6.5, 560, -100, 0],
  [7.1, 590, -112, -40], [8.2, 452, -300, -380], [9.0, 426, -330, -450], [10.0, 418, -346, -480],
];
const camC = (t: number): Cam => ({
  x: spline(t, CK.map((k) => [k[0], k[1]])),
  y: spline(t, CK.map((k) => [k[0], k[2]])),
  z: spline(t, CK.map((k) => [k[0], k[3]])),
  roll: spline(t, [[4.6, 0.8], [5.65, -1.2], [6.5, 0.6], [7.2, 0], [10, -0.4]]),
});
const camAt = (t: number) => (t < T_B ? camA(t) : camC(t));
/** project a point given in depth-d reference coords to screen */
const proj = (c: Cam, X: number, Y: number, d: number) => {
  const k = d / (d - c.z);
  return { x: 960 + k * (X - 960 - (c.x * F) / d), y: 540 + k * (Y - 540 - (c.y * F) / d), k };
};

// ------------------------------------------------------------------ leopard timeline
const LP = LEO_POSES;
const seq = (t: number, keys: [number, string][]): LeopardPose => {
  if (t <= keys[0][0]) return LP[keys[0][1]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, pa] = keys[i], [b, pb] = keys[i + 1];
    if (t <= b) return lerpPose(LP[pa], LP[pb], s5(a, b, t));
  }
  return LP[keys[keys.length - 1][1]];
};
const TAKEOFF = 4.86, LANDING = 6.46;
const X0 = 700, Y0 = 700, X1 = 1650, Y1 = 652, HJ = 250;
const flightS = (t: number) => { const u = clamp((t - TAKEOFF) / (LANDING - TAKEOFF)); return u + (0.13 * Math.sin(2 * Math.PI * u)); };

const leoB = (t: number): LeopardPose => {
  let p = seq(t, [[2.2, "lie"], [3.34, "lie"], [3.72, "alert"], [3.92, "alert"], [4.48, "crouch"]]);
  p = { ...p };
  // eyes: half-closed -> open on the feather (2.85) -> blink 3.07 -> wide on the cry
  const open = mix(0.42, 1.08, ss(2.84, 2.98, t)) * (1 - 0.9 * Math.max(0, 1 - Math.abs(t - 3.08) / 0.05));
  if (t < 3.6) p.eyeOpen = open;
  if (t > 2.86 && t < 3.4) p.look = mixV(p.look, [0.05, -1.0], ss(2.86, 3.0, t) * (1 - ss(3.3, 3.4, t)));
  // ear flick when the feather lands
  if (t > 2.78 && t < 3.0) p.ears = p.ears + 0.6 * Math.sin(((t - 2.78) / 0.22) * Math.PI);
  // breathing + tail wave
  const br = Math.sin(t * 3.1) * 1.6;
  p.chest = [p.chest[0], p.chest[1] + br]; p.back += br * 0.5;
  const tw = Math.sin(t * 4.2) * (t > 4.0 ? 26 : 12);
  p.tail = [p.tail[0], [p.tail[1][0], p.tail[1][1] + tw * 0.5], [p.tail[2][0] + tw * 0.3, p.tail[2][1] + tw]];
  // crouch: rump wiggle before the jump
  if (t > 4.3) { const w = Math.sin((t - 4.3) * 38) * 3 * ss(4.3, 4.45, t); p.hip = [p.hip[0] + w, p.hip[1]]; }
  return p;
};
const leoC = (t: number): { p: LeopardPose; root: V; rot: number } => {
  let p = seq(t, [[4.6, "crouch"], [4.86, "push"], [5.18, "fly"], [6.02, "fly"], [6.3, "reach"], [6.46, "reach"], [6.6, "land"], [6.78, "land"], [7.3, "sit"]]);
  p = { ...p };
  // flight stretch / breathing tail
  if (t > 5.1 && t < 6.1) { const st = Math.sin(((t - 5.1) / 1.0) * Math.PI) * 10; p.chest = [p.chest[0] + st, p.chest[1]]; p.hip = [p.hip[0] - st, p.hip[1]]; }
  const tw = Math.sin(t * 5.0) * (t < 6.5 ? 14 : 8);
  p.tail = [p.tail[0], [p.tail[1][0], p.tail[1][1] + tw * 0.5], [p.tail[2][0], p.tail[2][1] + tw]];
  if (t > 7.6) { const bl = 1 - 0.95 * Math.max(0, 1 - Math.abs(t - 8.4) / 0.06); p.eyeOpen *= bl; }
  let root: V;
  if (t < TAKEOFF) root = [mix(680, X0, ss(4.6, TAKEOFF, t)), Y0];
  else if (t < LANDING) {
    const s = flightS(t);
    root = [mix(X0, X1, s), mix(Y0, Y1, s) - 4 * HJ * s * (1 - s)];
  } else root = [X1 + 14 * ss(LANDING, 6.7, t), Y1];
  // landing squash: dip the body
  if (t > LANDING && t < 6.9) { const d = Math.sin(((t - LANDING) / 0.44) * Math.PI) * 12; p.chest = [p.chest[0], p.chest[1] + d]; p.hip = [p.hip[0], p.hip[1] + d * 0.6]; }
  // body rotation follows the flight direction a little
  const dt = 1 / 120;
  let rot = 0;
  if (t > TAKEOFF && t < LANDING) {
    const s0 = flightS(t - dt), s1 = flightS(t + dt);
    const y0 = mix(Y0, Y1, s0) - 4 * HJ * s0 * (1 - s0), y1 = mix(Y0, Y1, s1) - 4 * HJ * s1 * (1 - s1);
    const vx = (X1 - X0) * (s1 - s0), vy = y1 - y0;
    rot = (Math.atan2(vy, vx) * 180) / Math.PI * 0.45;
  }
  return { p, root, rot };
};

// ------------------------------------------------------------------ eagle timeline (shot C)
const EP = EAGLE_POSES;
const eseq = (t: number, keys: [number, EaglePose][]): EaglePose => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, pa] = keys[i], [b, pb] = keys[i + 1];
    if (t <= b) return lerpPose(pa, pb, s5(a, b, t));
  }
  return keys[keys.length - 1][1];
};
const DIVE: EaglePose = { ...EP.mid, raiseN: -158, raiseF: -166, spread: 0.55, tilt: -14, tailSpread: 0.1 };
const HERALD: EaglePose = { ...EP.mid, raiseN: -132, raiseF: -146, spread: 1, tilt: 0, tailSpread: 0.5 };
const PERCH_LOOK: EaglePose = { ...EP.perch, headRot: -48 };
const eagleC = (t: number) => {
  const L = leoC(t);
  const leoPt = (s: number, tt: number): V => {
    const q = leoBodyPt(L.p, s, tt);
    const r = (L.rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
    const qq: V = [q[0], q[1] + 150];
    return [L.root[0] + qq[0] * c - qq[1] * sn, L.root[1] - 150 + qq[0] * sn + qq[1] * c];
  };
  const align = leoPt(0.46, 0.3);
  const perchC: V = [1962, 462];
  let pos: V;
  if (t < 5.42) {
    const u = ss(4.7, 5.42, t);
    const a0: V = [180, -90];
    const a1: V = [align[0] - 40, align[1] - 28];
    pos = [mix(a0[0], a1[0], u), mix(a0[1], a1[1], u) - Math.sin(u * Math.PI) * 30];
  } else if (t < 5.96) {
    const u = ss(5.42, 5.56, t);
    pos = [mix(align[0] - 40, align[0], u), mix(align[1] - 28, align[1], u)];
  } else {
    const u = ss(5.96, 6.5, t);
    const lift = Math.sin(u * Math.PI) * -70;
    pos = [mix(align[0], perchC[0], s5(5.96, 6.5, t)), mix(align[1], perchC[1], u) + lift];
  }
  const flap = Math.sin(t * 22);
  let pose = eseq(t, [[4.7, DIVE], [5.36, DIVE], [5.5, HERALD], [5.96, HERALD], [6.08, EP.down], [6.2, EP.up], [6.34, EP.brake], [6.52, EP.brake], [6.64, { ...EP.perch, fold: 0.15, spread: 0.6, raiseN: -110, raiseF: -120 }], [7.0, EP.perch], [7.6, EP.perch], [8.1, PERCH_LOOK]]);
  pose = { ...pose };
  if (t > 5.5 && t < 5.96) { pose.raiseN += flap * 5; pose.raiseF += flap * 5; }
  return { pos, pose, scale: 0.95 };
};

// ------------------------------------------------------------------ feather path
const featherA = (t: number) => ({
  x: 760 + 70 * t + 150 * Math.sin(2.3 * t + 0.4),
  y: -160 + Math.pow(t / 2.2, 1.08) * 1460,
  rot: 62 + 38 * Math.sin(2.3 * t + 0.4 + 1.2),
  flip: Math.cos(2.9 * t + 0.3),
  scale: 1.05,
});

// ------------------------------------------------------------------ drawing helpers
type Sample = (dt: number) => { svg: string; v: number };
/** Motion blur: average N sub-frame samples additively (plus-lighter) inside an isolated container. */
const Blurred: React.FC<{ sample: Sample; t: number; fps?: number; shutter?: number; filter?: string; style?: React.CSSProperties }> = ({ sample, filter, style }) => {
  const s0 = sample(0);
  const N = s0.v < 1.5 ? 1 : Math.min(9, 2 + Math.ceil(s0.v / 2.2));
  const sh = 0.5 / FPS;
  const items = N === 1 ? [0] : Array.from({ length: N }, (_, i) => (i / (N - 1) - 0.5) * sh);
  return (
    <div style={{ position: "absolute", inset: 0, isolation: "isolate", filter, ...style }}>
      {items.map((dt, i) => (
        <svg key={i} width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, mixBlendMode: N > 1 ? "plus-lighter" : undefined, opacity: 1 / N, overflow: "visible" }}
          dangerouslySetInnerHTML={{ __html: (dt === 0 ? s0 : sample(dt)).svg }} />
      ))}
    </div>
  );
};

const Layer: React.FC<{ m: LayerMeta; c: Cam; vblur?: [number, number] }> = ({ m, c, vblur }) => {
  const d = m.depth;
  const k = d / (d - c.z);
  const tx = -(c.x * F) / d, ty = -(c.y * F) / d;
  const id = `mb_${m.file.replace(/\W/g, "")}`;
  const bl = vblur && (vblur[0] > 0.6 || vblur[1] > 0.6);
  return (
    <>
      {bl ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${vblur![0].toFixed(2)} ${vblur![1].toFixed(2)}`} /></filter>
        </svg>
      ) : null}
      <Img src={staticFile(m.file)} style={{
        position: "absolute", left: m.x0, top: m.y0, width: m.w, height: m.h, maxWidth: "none",
        transformOrigin: `${960 - m.x0}px ${540 - m.y0}px`, transform: `scale(${k}) translate(${tx}px, ${ty}px)`,
        filter: bl ? `url(#${id})` : undefined,
      }} />
    </>
  );
};

const Particles: React.FC<{ t: number; c: Cam; n: number; seed: number; warm?: boolean }> = ({ t, c, n, seed, warm }) => {
  const items = [];
  for (let i = 0; i < n; i++) {
    const z = 0.25 + hash(seed + i * 3) * 1.4;
    const bx = hash(seed + i * 7) * 2200, by = hash(seed + i * 11) * 1300;
    const x = ((bx + t * 60 * z - c.x * z * 0.9) % 2200 + 2200) % 2200 - 140;
    const y = ((by + t * (24 + 30 * z) + Math.sin(t * 1.3 + i) * 18 - c.y * z * 0.9) % 1300 + 1300) % 1300 - 110;
    const r = 1.2 + z * 2.4 + (z > 1.35 ? 5 : 0);
    const blur = z > 1.35 ? 3 : 0;
    const tw = 0.55 + 0.45 * Math.sin(t * 6 + i * 1.7);
    items.push(<div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%",
      background: warm ? "radial-gradient(circle, #fffaf0 0%, rgba(255,236,200,0.7) 45%, rgba(255,230,190,0) 70%)" : "radial-gradient(circle, #ffffff 0%, rgba(240,246,255,0.75) 45%, rgba(240,246,255,0) 70%)",
      opacity: (z > 1.35 ? 0.45 : 0.85) * tw, filter: blur ? `blur(${blur}px)` : undefined }} />);
  }
  return <>{items}</>;
};

/** rim light: shift alpha away from the sun, keep the uncovered band, tint it warm */
const RimFilter: React.FC<{ id: string; dx: number; dy: number; amount: number }> = ({ id, dx, dy, amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feOffset in="SourceAlpha" dx={dx} dy={dy} result="off" />
      <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
      <feGaussianBlur in="edge" stdDeviation="0.8" result="edgeb" />
      <feFlood floodColor="#ffe6b0" floodOpacity={amount} />
      <feComposite in2="edgeb" operator="in" result="rim" />
      <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="rim" /></feMerge>
    </filter>
  </svg>
);

// ------------------------------------------------------------------ shots
const ShotA: React.FC<{ t: number }> = ({ t }) => {
  const c = camA(t);
  const c1 = camA(t + 1 / FPS);
  const names = ["sky", "far", "mid", "clouds", "cliffL", "cliffR"];
  const sun = proj(c, 1006, 426, 8000);
  // tiny eagle circling by the sun (sky depth)
  const w = 1.7;
  const ex = 990 + 150 * Math.cos(w * t + 2.2), ey = 470 + 46 * Math.sin(w * t + 2.2);
  const ep = proj(c, ex, ey, 7000);
  const bank = -18 * Math.cos(w * t + 2.2);
  const fa = (dt: number) => {
    const tt = t + dt, q = featherA(tt), q1 = featherA(tt + 1 / FPS);
    const fx = Math.sign(q.flip) * Math.max(0.22, Math.abs(q.flip));
    return {
      svg: `<g transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)}) rotate(${q.rot.toFixed(2)}) scale(${(q.scale * fx).toFixed(3)},${q.scale})">${feather("fa" + Math.round(dt * 1e5))}</g>`,
      v: Math.hypot(q1.x - q.x, q1.y - q.y) + Math.abs(q1.rot - q.rot) * 3,
    };
  };
  return (
    <AbsoluteFill style={{ transform: `rotate(${c.roll}deg) scale(1.03)`, transformOrigin: "960px 540px" }}>
      {names.map((n) => {
        const m = LAYERS[n];
        const p0 = proj(c, 0, 0, m.depth), p1 = proj(c1, 0, 0, m.depth);
        const vy = Math.abs(p1.y - p0.y) * 0.32;
        return <Layer key={n} m={m} c={c} vblur={[0, vy]} />;
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}
        dangerouslySetInnerHTML={{ __html: `<g transform="translate(${ep.x.toFixed(1)},${ep.y.toFixed(1)}) rotate(${bank.toFixed(1)}) scale(${(0.38 * ep.k).toFixed(3)})">${eagleSoar(0.5 + 0.2 * Math.sin(t * 2), "#3a2a2a", 100)}</g>` }} />
      <div style={{ position: "absolute", left: sun.x - 260, top: sun.y - 260, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,250,225,0.55) 0%, rgba(255,226,170,0.18) 40%, rgba(255,220,160,0) 70%)", mixBlendMode: "screen" }} />
      <Particles t={t} c={c} n={46} seed={11} warm />
      <Blurred t={t} sample={fa} style={{ filter: "drop-shadow(0 18px 18px rgba(60,40,50,0.18))" }} />
    </AbsoluteFill>
  );
};

const leoB_ROOT: V = [880, 706];
const LEO_B_SCALE = 1.12;
const ShotB: React.FC<{ t: number }> = ({ t }) => {
  const u = clamp((t - T_B) / (T_C - T_B));
  // gentle push-in with an arc
  const zoom = mix(1.0, 1.085, s5(0, 1, u)) + 0.02 * ss(0.8, 1, u);
  const panX = mix(0, -40, s5(0, 1, u)), panY = mix(0, 18, s5(0, 1, u));
  const tr = (par: number) => `translate(${960 + panX * par}px, ${540 + panY * par}px) scale(${1 + (zoom - 1) * par}) translate(-960px, -540px)`;
  const L = (n: string) => LAYERS[n];
  // feather fall into the head
  const p = leoB(t);
  const head = leoHeadPt(p, -6, -54);
  const hx = leoB_ROOT[0] + head[0] * LEO_B_SCALE, hy = leoB_ROOT[1] + head[1] * LEO_B_SCALE;
  const LAND = 2.8;
  const fB = (dt: number) => {
    const tt = t + dt;
    const pp = leoB(tt);
    const hh = leoHeadPt(pp, -6, -54);
    const hxx = leoB_ROOT[0] + hh[0] * LEO_B_SCALE, hyy = leoB_ROOT[1] + hh[1] * LEO_B_SCALE;
    const restRot = pp.headRot - 28;
    let x: number, y: number, r: number, sc: number, fx = 1;
    if (tt < LAND) {
      const v = clamp((tt - T_B) / (LAND - T_B));
      const e = 1 - Math.pow(1 - v, 1.6);
      x = mix(1180, hxx, e) + Math.sin(v * 7.5) * 70 * (1 - v);
      y = mix(-120, hyy, e);
      r = mix(80, restRot, s5(0.55, 1, v)) + Math.sin(v * 9) * 25 * (1 - v);
      sc = 0.5;
      fx = Math.cos(v * 9) * (1 - v) + v;
      fx = Math.sign(fx) * Math.max(0.3, Math.abs(fx));
    } else {
      const wob = Math.sin((tt - LAND) * 30) * 10 * Math.exp(-(tt - LAND) * 7);
      x = hxx; y = hyy; r = restRot + wob; sc = 0.5;
    }
    const q0 = { x, y };
    return { svg: `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${(sc * fx).toFixed(3)},${sc})">${feather("fb" + Math.round(dt * 1e5))}</g>`, v: tt < LAND ? 9 : Math.hypot(q0.x - hx, q0.y - hy) + 0.5 };
  };
  const lb = (dt: number) => {
    const pp = leoB(t + dt);
    const v = t > 4.25 ? 3 : 0;
    return { svg: `<g transform="translate(${leoB_ROOT[0]},${leoB_ROOT[1]}) scale(${LEO_B_SCALE})">${leopard(pp, "lb" + Math.round(dt * 1e5))}</g>`, v };
  };
  // eagle shadow sweep
  const sw = clamp((t - 3.22) / 0.42);
  const shX = mix(-700, 2600, sw), shY = mix(560, 700, sw);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: tr(0.45) }}><Layer m={L("bbg")} c={{ x: 0, y: 0, z: 0, roll: 0 }} /></AbsoluteFill>
      <AbsoluteFill style={{ transform: tr(1.0) }}>
        <Layer m={L("brock")} c={{ x: 0, y: 0, z: 0, roll: 0 }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={leoB_ROOT[0] + 20} cy={leoB_ROOT[1] + 6} rx={360} ry={22} fill="#5a5070" opacity={0.25} style={{ filter: "blur(8px)" }} />
        </svg>
        <Blurred t={t} sample={lb} />
        <Blurred t={t} sample={fB} />
        {sw > 0 && sw < 1 ? (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", filter: "blur(14px)" }}
            dangerouslySetInnerHTML={{ __html: `<g transform="translate(${shX.toFixed(1)},${shY.toFixed(1)}) rotate(-8) scale(1,0.5)" opacity="0.42">${eagleSoar(0.4, "#40324a", 560)}</g>` }} />
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: tr(1.5) }}><Layer m={L("bfg")} c={{ x: 0, y: 0, z: 0, roll: 0 }} /></AbsoluteFill>
      <Particles t={t} c={{ x: -t * 30, y: 0, z: 0, roll: 0 }} n={34} seed={41} warm />
      {/* hidden: head point helper keeps hx/hy referenced for future tweaks */}
      <div style={{ display: "none" }}>{hx.toFixed(0)}{hy.toFixed(0)}</div>
    </AbsoluteFill>
  );
};

const titleTiming = (() => {
  const lens = TITLE_STROKES.map((s) => polyLen(s));
  const gaps = 0.045;
  const total = lens.reduce((a, b) => a + b, 0);
  const T0 = 7.92, T1 = 9.12;
  const writeT = T1 - T0 - gaps * (lens.length - 1);
  let acc = T0;
  return lens.map((l) => { const a = acc, b = acc + (l / total) * writeT; acc = b + gaps; return { a, b, l }; });
})();

const Title: React.FC<{ t: number }> = ({ t }) => {
  if (t < 7.85) return null;
  const S = 1.9, OX = 700, OY = 300;
  let paths = "", pen: V | null = null;
  TITLE_STROKES.forEach((st, i) => {
    const { a, b, l } = titleTiming[i];
    const pr = clamp((t - a) / (b - a));
    if (pr <= 0) return;
    paths += `<path d="${openPath(st, 0.8)}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - pr).toFixed(4)}" />`;
    if (pr < 1) pen = polyAt(st, pr * l);
  });
  const sub = ss(9.1, 9.6, t);
  const glow = ss(9.1, 9.3, t) * (1 - ss(9.3, 9.9, t));
  const penPt = pen as V | null;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 0 7px rgba(90,60,70,0.35)) drop-shadow(0 0 2px rgba(255,240,210,0.9))" }}>
        <g transform={`translate(${OX},${OY}) scale(${S})`} fill="none" stroke="#fffdf7" strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: paths }} />
        {penPt ? <circle cx={OX + penPt[0] * S} cy={OY + penPt[1] * S} r={7} fill="#fff6dc" opacity={0.9} style={{ filter: "blur(2px)" }} /> : null}
        {glow > 0 ? <ellipse cx={OX + 160 * S} cy={OY - 45 * S} rx={330} ry={130} fill="#fff3d0" opacity={0.25 * glow} style={{ filter: "blur(30px)" }} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 0, width: 1920, top: OY + 58, textAlign: "center", fontFamily: CAVEAT, fontWeight: 500, fontSize: 54, color: "#fffaf0",
        letterSpacing: 2, opacity: sub, transform: `translate(${(OX + 160 * S - 960).toFixed(1)}px, ${(1 - sub) * 14}px)`,
        textShadow: "0 0 10px rgba(80,55,65,0.45), 0 0 2px rgba(255,240,210,0.8)" }}>Барыс пен Бүркіт</div>
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ t: number }> = ({ t }) => {
  const c = camC(t);
  const c1 = camC(t + 1 / FPS);
  const names = ["sky", "far", "mid", "clouds", "cliffL", "cliffR"];
  const sun = proj(c, 1006, 426, 8000);
  const leoSample = (dt: number) => {
    const tt = t + dt, cc = camC(tt);
    const L = leoC(tt), L1 = leoC(tt + 1 / FPS), cc1 = camC(tt + 1 / FPS);
    const s = proj(cc, L.root[0], L.root[1], 1000), s1 = proj(cc1, L1.root[0], L1.root[1], 1000);
    const back = 0.18 + 0.42 * Math.exp(-1 * ((Math.hypot(s.x - sun.x, s.y - 150 * s.k - sun.y)) / 380) ** 2);
    const lt = { back, sil: "#5e4a52" };
    const head = leoHeadPt(L.p, -6, -54);
    const fea = `<g transform="translate(${head[0].toFixed(1)},${head[1].toFixed(1)}) rotate(${(L.p.headRot - 28).toFixed(1)}) scale(0.5)">${feather("fc" + Math.round(dt * 1e5), lt)}</g>`;
    return {
      svg: `<g transform="translate(${s.x.toFixed(1)},${s.y.toFixed(1)}) scale(${s.k.toFixed(4)}) rotate(${L.rot.toFixed(2)} 0 -150)">${leopard(L.p, "lc" + Math.round(dt * 1e5), lt)}${fea}</g>`,
      v: Math.hypot(s1.x - s.x, s1.y - s.y),
    };
  };
  const eagSample = (dt: number) => {
    const tt = t + dt, cc = camC(tt);
    const E = eagleC(tt), E1 = eagleC(tt + 1 / FPS), cc1 = camC(tt + 1 / FPS);
    const s = proj(cc, E.pos[0], E.pos[1], 1000), s1 = proj(cc1, E1.pos[0], E1.pos[1], 1000);
    const back = 0.22 + 0.45 * Math.exp(-1 * ((Math.hypot(s.x - sun.x, s.y - sun.y)) / 380) ** 2);
    return {
      svg: `<g transform="translate(${s.x.toFixed(1)},${s.y.toFixed(1)}) scale(${(s.k * E.scale).toFixed(4)})">${eagleSide(E.pose, "ec" + Math.round(dt * 1e5), { back, sil: "#2e2224" })}</g>`,
      v: Math.hypot(s1.x - s.x, s1.y - s.y) + (tt > 5.9 && tt < 6.4 ? 6 : 0),
    };
  };
  const L0 = leoC(t);
  const ls = proj(c, L0.root[0], L0.root[1], 1000);
  const dir = [sun.x - ls.x, sun.y - (ls.y - 150 * ls.k)];
  const dl = Math.hypot(dir[0], dir[1]) || 1;
  const rimAmt = 0.55 + 0.4 * Math.exp(-1 * (dl / 420) ** 2);
  return (
    <AbsoluteFill style={{ transform: `rotate(${c.roll}deg) scale(1.03)`, transformOrigin: "960px 540px" }}>
      {names.map((n) => {
        const m = LAYERS[n];
        const p0 = proj(c, 0, 0, m.depth), p1 = proj(c1, 0, 0, m.depth);
        return <Layer key={n} m={m} c={c} vblur={[Math.abs(p1.x - p0.x) * 0.3, Math.abs(p1.y - p0.y) * 0.3]} />;
      })}
      <div style={{ position: "absolute", left: sun.x - 420, top: sun.y - 420, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,250,228,0.62) 0%, rgba(255,226,170,0.22) 38%, rgba(255,220,160,0) 70%)", mixBlendMode: "screen" }} />
      <RimFilter id="rimE" dx={(-dir[0] / dl) * 4} dy={(-dir[1] / dl) * 4} amount={rimAmt * 0.9} />
      <RimFilter id="rimL" dx={(-dir[0] / dl) * 4.5} dy={(-dir[1] / dl) * 4.5} amount={rimAmt} />
      <Blurred t={t} sample={eagSample} filter="url(#rimE)" />
      <Blurred t={t} sample={leoSample} filter="url(#rimL)" />
      <Particles t={t} c={c} n={40} seed={77} warm />
      <Title t={t} />
    </AbsoluteFill>
  );
};

export const Barys: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#efe6da", overflow: "hidden" }}>
      {t < T_B ? <ShotA t={t} /> : t < T_C ? <ShotB t={t} /> : <ShotC t={t} />}
      {/* paper vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(70,50,60,0.16) 100%)", pointerEvents: "none" }} />
      {SHOW_AUDIO.on ? <Audio src={staticFile("barys/mix.wav")} /> : null}
    </AbsoluteFill>
  );
};
export { camAt };
