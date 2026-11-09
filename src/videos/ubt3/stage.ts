// «30 КҮН» 3-күн: our cast (outfits), per-shot staging and the custom effect cards.
import { Pen, bodyFront, fxBurst, Outfit, Expr, FrontOpts, INK } from "./toon";
import { FPS, clamp01, SHOTS, YSEAT, ASEAT, YK, YSTAND_K, MOM_K, MOM_K2, DESK, DOOR_X, YIN } from "./story";
import { shotStart, talking, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, viewOf, setLight, q } from "./cast";

/** dad's suit: dark jacket and trousers, white shirt, red tie */
export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };
export const APAI: Outfit = { jacket: "#6b4e8a", dress: "#4a5a7a", pants: "#4a4a55", boots: "#3a2a20", hat: "hair", hair: "#8a8a92", bun: "#8a8a92", glasses: true, skin: "#e8b896", build: "stout" };
/** mom at 4 a.m.: dressing gown */
export const MOM_ROBE: Outfit = { jacket: "#b98ac0", dress: "#d9a8cf", pants: "#4e4a5e", boots: "#7a4a6a", hat: "hair", hair: "#2a1e18", bun: "#2a1e18", skin: "#e8b896" };
const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const L: Who = { i: 3, o: APAI, okey: "apai" };
const M: Who = { i: 4, o: MOM_ROBE, okey: "momrobe" };

const FONT = "900 92px Montserrat, 'DejaVu Sans', sans-serif";
const star = (p: Pen, x: number, y: number, s: number, col = "#ffd84a") => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = (i % 2 ? 14 : 34) * s; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
  p.poly(pts, col, 6);
};
const CLOUD: [number, number, number, number][] = [[400, 260, 300, 200], [210, 230, 130, 110], [600, 220, 140, 120], [330, 120, 140, 100], [500, 110, 130, 95], [300, 380, 150, 90], [520, 390, 150, 90]];
/** thought cloud: a small Aruzhan with a book and «07:00» (800 x 600 canvas) */
const thought7 = (p: Pen) => {
  const g = p.g;
  for (const [x, y, r] of [[130, 560, 22], [190, 515, 34]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 8);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, null, 14);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, "#ffffff", 0);
  g.save(); g.translate(150, 30); g.scale(0.42, 0.42);
  bodyFront(new Pen(g), ARUZHAN, { mode: "stand", expr: "smile_closed", facing: 1, seed: 7, prop: "book" });
  g.restore();
  g.save(); g.font = FONT; g.textAlign = "center"; g.lineJoin = "round";
  g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("07:00", 545, 300);
  g.fillStyle = "#ffd84a"; g.fillText("07:00", 545, 300);
  g.restore();
  star(p, 650, 150, 1, "#ff8fb0"); star(p, 450, 170, 0.7); star(p, 690, 380, 0.8, "#ff8fb0");
};
/** the green smell cloud with stink lines and two flies (600 x 500); ph = wobble phase 0..1 */
const stink = (p: Pen, ph: number, a = 1) => {
  const g = p.g, w = Math.sin(ph * Math.PI * 2);
  g.save(); g.globalAlpha = a;
  const parts: [number, number, number, number][] = [[300, 300, 210, 130], [170, 280, 100, 85], [430, 285, 110, 90], [250, 210, 110, 80], [370, 205, 100, 75]];
  for (const [x, y, rx, ry] of parts) p.ell(x + 6 * w, y, rx, ry, null, 12);
  for (const [x, y, rx, ry] of parts) p.ell(x + 6 * w, y, rx, ry, "#9ed86a", 0);
  for (const [x, y, rx, ry] of [[270, 290, 120, 60], [400, 260, 50, 30]] as const) p.ell(x + 6 * w, y, rx, ry, "#b8e88a", 0);
  for (let i = 0; i < 3; i++) {
    const x0 = 190 + i * 110, pts: [number, number][] = [];
    for (let k = 0; k <= 8; k++) pts.push([x0 + 16 * Math.sin(k * 1.2 + ph * 6.28 + i), 150 - k * 15]);
    p.stroke(pts, 9, "#4f8a2f");
  }
  for (const [fx0, fy0] of [[120, 120], [500, 140]] as const) {
    const fx = fx0 + 18 * Math.cos(ph * 6.28 * 2 + fx0), fy = fy0 + 12 * Math.sin(ph * 6.28 * 3 + fy0);
    p.ell(fx - 9, fy - 10, 9, 6, "#ffffff", 3); p.ell(fx + 9, fy - 10, 9, 6, "#ffffff", 3); p.dot(fx, fy, 8);
  }
  g.restore();
};
/** perfume mist puff (500 x 500): pale cloud + glints, t 0..1 */
const mist = (p: Pen, t: number) => {
  const r = 60 + 150 * t, a = 1 - 0.6 * t;
  p.g.save(); p.g.globalAlpha = a;
  for (let i = 0; i < 7; i++) { const b = (i / 7) * Math.PI * 2; p.ell(250 + r * 0.55 * Math.cos(b), 250 + r * 0.4 * Math.sin(b), r * 0.42, r * 0.34, "#d9f6e4", 0); }
  p.ell(250, 250, r * 0.6, r * 0.45, "#eefcf3", 0);
  p.g.restore();
  for (let i = 0; i < 5; i++) { const b = i * 1.3 + t * 2; star(p, 250 + r * 0.8 * Math.cos(b), 250 + r * 0.6 * Math.sin(b), 0.45 * (1 - t) + 0.2, "#ff9fd0"); }
};
/** falling snow (1000 x 1000), ph 0..1 = one loop; outlined flakes stay readable on pale walls */
const snow = (p: Pen, ph: number, n = 46, sz = 1) => {
  for (let i = 0; i < n; i++) {
    const r1 = Math.sin(i * 127.1) * 43758.5453, r2 = Math.sin(i * 311.7) * 23421.631, r3 = Math.sin(i * 74.7) * 9871.13;
    const fx = r1 - Math.floor(r1), fy = r2 - Math.floor(r2), fs = r3 - Math.floor(r3);
    const y = ((fy + ph * (0.6 + 0.6 * fs)) % 1) * 1060 - 30, x = fx * 1000 + 40 * Math.sin(ph * 6.28 + i);
    const s = (7 + 9 * fs) * sz;
    p.ell(x, y, s, s, "#ffffff", 3 * sz);
  }
};
/** breath puff (300 x 200), t 0..1 */
const breath = (p: Pen, t: number) => {
  p.g.save(); p.g.globalAlpha = 0.85 * (1 - t);
  for (let i = 0; i < 3; i++) p.ell(80 + i * 55 + 60 * t, 110 - i * 8, 30 + 22 * t, 24 + 16 * t, "#f4f8ff", 4);
  p.g.restore();
};
/** loading bar over his head (800 x 260); k 0..1 */
const loading = (p: Pen, k: number) => {
  const g = p.g;
  p.poly([[40, 60], [760, 60], [760, 200], [40, 200]], "#1a2040", 12);
  p.poly([[64, 84], [64 + 672 * k, 84], [64 + 672 * k, 176], [64, 176]], k < 1 ? "#4cd98a" : "#ffd84a", 0);
  g.save(); g.font = "900 64px Montserrat, 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  const s = k < 1 ? `ЖҮКТЕЛУДЕ ${Math.round(k * 100)}%` : "100%!";
  g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(s, 400, 132); g.fillStyle = "#ffffff"; g.fillText(s, 400, 132);
  g.restore();
};
/** «+1» (300 x 200) */
const plus1 = (p: Pen) => {
  const g = p.g; g.save(); g.font = "900 150px Montserrat, 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = 18; g.strokeStyle = INK; g.strokeText("+1", 150, 105); g.fillStyle = "#4cd98a"; g.fillText("+1", 150, 105); g.restore();
};
/** handshake (600 x 360): his dark suit sleeve from the left, her white sleeve from the right */
const shake = (p: Pen) => {
  p.poly([[0, 150], [210, 120], [230, 230], [0, 260]], "#2b2d36", 10);
  p.poly([[190, 118], [232, 112], [250, 236], [208, 240]], "#f4f4f2", 8);
  p.poly([[600, 150], [390, 120], [370, 230], [600, 260]], "#f4f1ea", 10);
  p.ell(300, 178, 105, 78, "#f1c9a3", 10);
  for (let i = 0; i < 3; i++) p.stroke([[262 + i * 26, 128], [276 + i * 26, 210]], 7);
  p.ell(352, 140, 40, 26, "#f3cfae", 8);
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], k = s.key, t = f / FPS;
  setLight(s.light, cam);
  const front = (who: Who, x: number, y: number, z: number, fo: FrontOpts, shadow = true) => {
    out.places.push(person(cam, who, x, y, z, { side: false, mirror: false }, { blink: lidAt(t, who.i), ...fo }, {}));
    if (shadow) blob(out, x, y, z);
  };
  const say = (line: string, open: Expr, shut: Expr) => (talking(line, f) ? open : shut);
  const W = ws;
  const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false) =>
    out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft });
  const burst = (x: number, y: number, z: number, at0: number, w = 1.2, n = 10, col?: string) => {
    if (f < at0 || f >= at0 + n) return;
    const u = q((f - at0) / n, 30);
    fx(`burst${u}${col ?? ""}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
  };
  const shiver = (i: number) => 2.2 * (Math.floor(f / 2 + i) % 2 ? 1 : -1);
  const snowAt = (x: number, y: number, z: number, w: number, n = 46, sz = 1) => { const ph = q((f % 60) / 60, 30); fx(`snow${ph}|${n}|${sz}`, 1000, 1000, (p) => snow(p, ph, n, sz), x, y, z, w, w); };
  const ySeat = (fo: FrontOpts) => front(Y, YSEAT[0], YSEAT[1], YSEAT[2], { mode: "sit", facing: 1, ...fo }, false);
  const aSeat = (fo: FrontOpts) => front(A, ASEAT[0], ASEAT[1], ASEAT[2], { mode: "sit", facing: -1, ...fo }, false);
  const cold = f >= W("n8", 3); // windows open from here on
  switch (k) {
    case "sh01": {
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "stare", blink: 0 }, false);
      const t0 = W("n2", 2) - 4;
      if (f >= t0) { const kk = clamp01((f - t0) / 6); fx("thought7", 800, 600, thought7, YK[0] - 0.42, 1.72, YK[2] + 0.05, 0.66 * (0.6 + 0.4 * kk), 0.5 * (0.6 + 0.4 * kk)); }
      break;
    }
    case "sh02":
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "stare", blink: 0 }, false);
      break;
    case "sh03": {
      const sp = W("m1", 2) - 2;
      front(M, MOM_K[0], 0, MOM_K[2], { mode: "stand", facing: 1, expr: f < sp ? "shock" : say("m1", "sayStern", "stern") });
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: -1, expr: f < W("m1", 1) ? "stare" : "grin", blink: f < W("m1", 1) ? 0 : undefined }, false);
      break;
    }
    case "sh04": {
      const [x, , z] = YSTAND_K, spray = W("n4", 6) - 2, big = W("n4", 7) - 3;
      const hold = f >= W("n4", 4) - 3;
      front(Y, x, 0, z, { mode: "stand", facing: f >= big ? -1 : 0, prop: hold ? "perfume" : null, expr: f < W("n4", 2) ? "smile" : f < big ? "grin" : "relief_open" });
      burst(x - 0.02, 0.98, z + 0.05, W("n4", 2) - 2, 0.38, 12); // the tie sparkles
      for (let i = 0; i < 3; i++) {
        const a0 = spray + i * 7;
        if (f >= a0 && f < a0 + 14 && f < big) { const u = q((f - a0) / 14, 14); fx(`mist${u}`, 500, 500, (p) => mist(p, u), x + 0.16, 1.4, z + 0.12, 0.42, 0.42, true); }
      }
      if (f >= big) {
        const g = clamp01((f - big) / 10), ph = q((f % 30) / 30, 15);
        front(M, MOM_K2[0], 0, MOM_K2[2], { mode: "stand", facing: 1, expr: "pained", tilt: shiver(0) * 1.4 });
        fx(`stinkH${ph}`, 600, 500, (p) => stink(p, ph, 0.5), x - 0.2, 0.75, z + 0.3, 1.5 * (0.5 + 0.5 * g), 1.0 * (0.5 + 0.5 * g), true);
      }
      break;
    }
    case "sh05":
      aSeat({ expr: "smile", facing: 0 });
      break;
    case "sh06": {
      const c0 = W("n6", 2) - 2, c1 = W("n6", 5) + 4, walk0 = W("n6", 5) - 6;
      if (f >= c0) {
        const u = clamp01((f - c0) / (c1 - c0)), ph = q((f % 30) / 30, 15), fade = q(1 - clamp01((f - c1) / 12), 12);
        if (fade > 0) fx(`stinkD${ph}|${fade}`, 600, 500, (p) => stink(p, ph, 0.25 + 0.6 * fade), DOOR_X + 0.4 - 1.1 * u, 1.5 + 0.12 * u, 0.05 - 1.15 * u, 1.05, 0.88, true);
      }
      if (f >= walk0) {
        const u = clamp01((f - walk0) / 26), x = DOOR_X + 0.9 - 1.6 * u, z = 0.05 - 0.4 * u;
        if (u < 1) {
          const view = viewOf(cam, x, z, -1, -0.25);
          out.places.push(person(cam, Y, x, 0, z, view, {}, { mode: "march", phase: t, stride: 0.5 * Math.max(0.3, view.fs), stomp: 0.4, blink: lidAt(t, 1) }));
          blob(out, x, 0, z);
        } else front(Y, x, 0, z, { mode: "stand", facing: -1, expr: "grin", wave: 0.5 });
      }
      break;
    }
    case "sh07": {
      const wilt = W("n7", 2) - 2;
      front(L, DESK[0], 0, DESK[2] + 0.75, { mode: "stand", facing: 1, expr: f < wilt - 6 ? "neutral" : f < wilt + 12 ? "shock" : "pained", look: f < wilt - 6 ? -0.4 : 0.5 });
      break;
    }
    case "sh08": {
      const sn = W("a1", 0);
      aSeat({ expr: f < sn - 8 ? "smile" : f < sn ? "pained" : f < sn + 16 ? "sneeze" : say("a1", "sayNervous", "nervous"), headTilt: f >= sn && f < sn + 16 ? -8 : 0, facing: 0 });
      burst(ASEAT[0] - 0.3, 1.22, ASEAT[2] + 0.3, sn + 1, 0.42, 10, "#ffffff");
      const ph = q((f % 30) / 30, 15);
      fx(`stinkS${ph}`, 600, 500, (p) => stink(p, ph, 0.7), ASEAT[0] - 0.45, 1.55, ASEAT[2] + 0.4, 0.5, 0.42, true);
      break;
    }
    case "sh09": {
      front(Y, YIN[0], 0, YIN[2], { mode: "stand", facing: -1, expr: say("e1", "say", "grin"), wave: f >= W("e1", 1) - 3 ? 0.8 : undefined });
      burst(YIN[0] + 0.25, 1.75, YIN[2] + 0.1, W("e1", 1) - 2, 0.5, 12);
      const ph = q((f % 30) / 30, 15);
      fx(`stinkS${ph}`, 600, 500, (p) => stink(p, ph, 0.6), YIN[0] - 0.35, 1.25, YIN[2] + 0.2, 0.55, 0.46, true);
      break;
    }
    case "sh10":
      front(L, DESK[0], 0, DESK[2] + 0.75, { mode: "stand", facing: 0, expr: say("l1", "sayStern", "stern") });
      break;
    case "sh11": {
      const two = f >= W("n8", 4) - 3;
      if (!two) {
        if (cold) snowAt(24.9, 1.9, -1.5, 1.9, 40);
      } else {
        ySeat({ expr: "nervous", tilt: shiver(0) });
        aSeat({ expr: "nervous", tilt: shiver(1) });
        snowAt(YSEAT[0] + 0.32, 1.3, YSEAT[2] + 0.3, 1.5, 40, 0.6);
        for (const [i, x] of [[0, YSEAT[0]], [1, ASEAT[0]]] as const) {
          const u = q(((f + i * 17) % 34) / 34, 17);
          if (u < 0.7) fx(`breath${u}`, 300, 200, (p) => breath(p, u / 0.7), x + (i ? -0.14 : 0.14), 1.12, YSEAT[2] + 0.25, 0.26, 0.17, true);
        }
      }
      break;
    }
    case "sh12":
      ySeat({ expr: "nervous", tilt: f < W("a2", 2) ? shiver(0) * 0.5 : 0 });
      aSeat({ expr: say("a2", "say", "smile") });
      snowAt(YSEAT[0] + 0.32, 1.3, YSEAT[2] + 0.3, 1.5, 20, 0.6);
      break;
    case "sh13": {
      ySeat({ expr: f < W("n9", 2) - 2 ? "think" : "dazed", facing: 0 });
      aSeat({ expr: "smile" });
      const k0 = W("n9", 1) - 2, k1 = W("n9", 3) + 14, kk = q(clamp01((f - k0) / (k1 - k0)), 40);
      if (f >= k0 - 4) fx(`load${kk}`, 800, 260, (p) => loading(p, kk), YSEAT[0], 1.6, YSEAT[2] + 0.1, 0.5, 0.16);
      break;
    }
    case "sh14": {
      const j = clamp01((f - shotStart("sh14")) / 8), hop = 0.12 * Math.sin(j * Math.PI);
      front(Y, YSEAT[0], hop, YSEAT[2], { mode: "stand", facing: 0, expr: say("e2", "relief_open", "grin"), wave: 1 }, false);
      aSeat({ expr: "shock" });
      break;
    }
    case "sh15": {
      const cu = f >= W("n10", 1) - 3;
      front(Y, YSEAT[0], 0, YSEAT[2], { mode: "stand", facing: 0, expr: cu ? "relief" : "relief_open", wave: cu ? 0.3 : 1 }, false);
      aSeat({ expr: f < W("n10", 1) ? "smile_closed" : "smile" });
      burst(YSEAT[0], 1.75, YSEAT[2] + 0.2, W("n10", 0) - 2, 1.0, 14, "#4cd98a");
      const p0 = W("n10", 0);
      if (f >= p0 && f < p0 + 40) { const u = (f - p0) / 40; fx("plus1", 300, 200, plus1, YSEAT[0] + 0.3, 1.75 + 0.25 * u, YSEAT[2] + 0.2, 0.3 * (u < 0.15 ? u / 0.15 : 1), 0.2 * (u < 0.15 ? u / 0.15 : 1)); }
      break;
    }
    case "sh16":
      front(Y, YSEAT[0], 0, YSEAT[2], { mode: "stand", facing: 0, expr: f < W("a3", 2) - 2 ? "relief_open" : "dazed", wave: f < W("a3", 2) - 2 ? 0.3 : undefined }, false);
      aSeat({ expr: say("a3", "say", "smile"), wave: f < W("a3", 1) ? 0.6 : undefined });
      break;
    case "sh17": {
      const deal = f >= W("e3", 0) - 3;
      ySeat({ expr: deal ? say("e3", "relief_open", "grin") : f < W("a4", 10) - 2 ? "nervous" : "shock" });
      aSeat({ expr: deal ? "smile_closed" : say("a4", "say", "smile") });
      if (deal) {
        const kk = clamp01((f - W("e3", 0) + 3) / 6);
        out.fx.push({ key: "shake", cw: 600, ch: 360, draw: shake, x: (YSEAT[0] + ASEAT[0]) / 2, y: 0.98, z: YSEAT[2] + 0.45, w: 0.48 * (0.6 + 0.4 * kk), h: 0.29 * (0.6 + 0.4 * kk) });
        burst((YSEAT[0] + ASEAT[0]) / 2, 1.0, YSEAT[2] + 0.4, W("e3", 0) - 1, 0.8, 12);
      }
      break;
    }
  }
  return out;
};
