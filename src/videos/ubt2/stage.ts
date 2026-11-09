// «30 КҮН» 2-күн: our cast (outfits), per-shot staging and the custom effect cards.
import { Pen, bodyFront, fxBurst, Outfit, Expr, FrontOpts, INK } from "./toon";
import { FPS, clamp01, SHOTS, YSEAT, DESK, RTABLE, TABLE_K, DOOR_X, SHELF_Z } from "./story";
import { talking, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, viewOf, setLight, q } from "./cast";

export const YERASYL: Outfit = { jacket: "#2e3e66", pants: "#2a2d38", boots: "#1c1c22", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };
export const APAI: Outfit = { jacket: "#6b4e8a", dress: "#4a5a7a", pants: "#4a4a55", boots: "#3a2a20", hat: "hair", hair: "#8a8a92", bun: "#8a8a92", glasses: true, skin: "#e8b896", build: "stout" };
export const MOM: Outfit = { jacket: "#3f7f6f", dress: "#f2e6d0", pants: "#4e4a5e", boots: "#3a2a20", hat: "hair", hair: "#2a1e18", bun: "#2a1e18", skin: "#e8b896" };
const Y: Who = { i: 1, o: YERASYL, okey: "yer" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const L: Who = { i: 3, o: APAI, okey: "apai" };
const M: Who = { i: 4, o: MOM, okey: "mom" };

const CLOUD: [number, number, number, number][] = [[400, 260, 300, 200], [210, 230, 130, 110], [600, 220, 140, 120], [330, 120, 140, 100], [500, 110, 130, 95], [300, 380, 150, 90], [520, 390, 150, 90]];
/** thought cloud with a small Aruzhan and «ГРАНТ» (800 x 600 canvas) */
const thought = (p: Pen) => {
  const g = p.g;
  for (const [x, y, r] of [[130, 560, 22], [190, 515, 34]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 8);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, null, 14);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, "#ffffff", 0);
  g.save(); g.translate(150, 30); g.scale(0.42, 0.42);
  bodyFront(new Pen(g), ARUZHAN, { mode: "stand", expr: "smile_closed", facing: 1, seed: 7, prop: "book" });
  g.restore();
  g.save();
  g.font = "900 92px Montserrat, 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.lineJoin = "round";
  g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("ГРАНТ", 540, 300);
  g.fillStyle = "#ffd84a"; g.fillText("ГРАНТ", 540, 300);
  g.restore();
  for (const [x, y, s] of [[640, 150, 1], [460, 170, 0.7], [690, 360, 0.8]] as const) {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = (i % 2 ? 14 : 34) * s; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};
/** a hand from the top of the card whose thumb «scrolls» a round loaf (flat card, 600 x 600) */
const handBread = (p: Pen, ph: number) => {
  p.ell(300, 330, 230, 215, "#d99a4a", 12);
  p.ell(300, 330, 150, 135, "#e8b46a", 0);
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; p.dot(300 + 95 * Math.cos(a), 330 + 85 * Math.sin(a), 9, "#b8742e"); }
  const dy = -40 + 80 * ph;
  p.poly([[230, -10], [370, -10], [380, 150], [220, 150]], "#f1c9a3", 10);
  p.ell(300, 175, 95, 70, "#f1c9a3", 10);
  p.ell(372, 220 + dy, 26, 58, "#f1c9a3", 9); // thumb
  p.stroke([[440, 150 + dy], [440, 260 + dy]], 9, INK);
  p.stroke([[470, 170 + dy], [470, 240 + dy]], 7, INK);
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
  const [tx, , tz] = TABLE_K;
  const ySeat = (peek: number, fo: FrontOpts) => front(Y, YSEAT[0], YSEAT[1] + peek, YSEAT[2], { mode: "sit", facing: 1, ...fo }, false);
  const burst = (x: number, y: number, z: number, at: number, w = 1.2, n = 10) => {
    if (f < at || f >= at + n) return;
    const u = q((f - at) / n, 30);
    out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u), x, y, z, w, h: w });
  };
  switch (k) {
    case "sh01":
      front(M, -0.65, 0, -1.55, { mode: "stand", prop: "phone", facing: 1, expr: f < W("n2", 4) ? "stern" : "grin" });
      front(Y, tx + 0.15, 0.3, tz - 0.65, { mode: "sit", facing: -1, expr: f < W("n2", 3) ? "neutral" : "pained" }, false);
      break;
    case "sh03": {
      const ph = q(0.5 + 0.5 * Math.sin(f * 0.9), 6);
      front(Y, tx, 0.3, tz - 0.65, { mode: "sit", facing: 0, expr: f < W("n3", 5) ? "neutral" : "dazed" }, false);
      out.fx.push({ key: `hand${ph}`, cw: 600, ch: 600, draw: (p) => handBread(p, ph), x: tx, y: TABLE_K[1] + 0.075, z: tz + 0.22, w: 0.5, h: 0.5, flat: true });
      break;
    }
    case "sh04": {
      const up = f >= W("n4", 8) - 2;
      if (up) front(Y, tx, 0, tz - 0.7, { mode: "stand", facing: 0, expr: "stern" });
      else front(Y, tx, 0.3, tz - 0.65, { mode: "sit", facing: 1, expr: "think", look: 0.6 }, false);
      if (!up && f >= W("n4", 1) - 4) {
        const kk = clamp01((f - W("n4", 1) + 4) / 6);
        out.fx.push({ key: "thought", cw: 800, ch: 600, draw: thought, x: tx + 0.12, y: 1.95, z: tz - 0.6, w: 0.85 * (0.6 + 0.4 * kk), h: 0.64 * (0.6 + 0.4 * kk) });
      }
      break;
    }
    case "sh05": {
      const door = W("n5", 7) - 4;
      const u = clamp01((f - 585) / 105), x = 37.05, z = 1.6 - 1.95 * u;
      if (f < 690) {
        const view = viewOf(cam, x, z, 0, -1);
        out.places.push(person(cam, Y, x, 0, z, view, {}, { mode: "march", phase: t, stride: 0.55 * Math.max(0.3, view.fs), stomp: 0.6, blink: lidAt(t, 1) }));
        blob(out, x, 0, z);
      } else front(Y, x, 0, z, { mode: "stand", facing: -1, expr: f < door ? "stern" : "shock" });
      burst(DOOR_X + 0.15, 1.3, 0, door + 4, 1.8, 14);
      break;
    }
    case "sh06": {
      const wipe = f >= W("n6", 4) - 2 && f < W("n6", 7) + 16;
      front(L, DESK[0], 0, DESK[2] + 0.75, {
        mode: "stand", facing: 0, prop: wipe ? "cloth" : null, tilt: wipe ? 3 * Math.sign(Math.sin((f - W("n6", 4)) * 0.45)) : 0,
        expr: f < W("n6", 3) - 2 ? "neutral" : wipe ? "stern" : "shock", look: f < W("n6", 3) - 2 ? -0.5 : 0,
      });
      break;
    }
    case "sh07": {
      const lift = f >= W("n7", 6) - 2;
      front(Y, 30.5, 0, SHELF_Z + 0.55, { mode: "stand", facing: 0, prop: lift ? "book" : null, expr: lift ? "pained" : f >= W("n7", 4) ? "grin" : "think", look: lift ? 0 : 0.7 });
      break;
    }
    case "sh08":
      front(A, DOOR_X + 0.75, 0, 0.0, { mode: "stand", facing: -1, expr: "smile" });
      burst(DOOR_X + 0.6, 1.35, 0.0, W("n8", 4) - 2, 1.3, 12);
      ySeat(f < 1054 ? 0 : f < 1058 ? 0.08 : 0.17, { expr: "shock" });
      break;
    case "sh09":
      front(A, RTABLE[0] + 0.5, 0, RTABLE[2] + 0.8, { mode: "stand", facing: -1, expr: say("a1", "say", "smile") });
      ySeat(0.17, { expr: "nervous" });
      break;
    case "sh10":
      ySeat(0.32, { expr: say("e1", "sayNervous", "nervous") });
      break;
    case "sh11":
      front(L, DESK[0], 0, DESK[2] + 0.75, { mode: "stand", facing: 0, expr: say("l1", "sayStern", "stern") });
      break;
    case "sh12":
      ySeat(0.3, { expr: f < W("n9", 2) ? "shock" : "dazed" });
      break;
    case "sh13":
      front(A, RTABLE[0] + 0.5, 0, RTABLE[2] + 0.8, { mode: "stand", facing: -1, expr: say("a2", "say", "smile"), wave: f >= W("a2", 1) - 6 ? 0.4 : undefined });
      ySeat(0.17, { expr: "nervous" });
      break;
    case "sh14": {
      const sit = f >= W("n10", 2) - 2;
      if (sit) front(A, RTABLE[0] + 0.7, 0.3, RTABLE[2] - 0.1, { mode: "sit", facing: -1, expr: "smile_closed" }, false);
      else front(A, RTABLE[0] + 0.5, 0, RTABLE[2] + 0.8, { mode: "stand", facing: -1, expr: "laugh" });
      ySeat(0.2, { expr: sit ? "smile" : "nervous" });
      break;
    }
    case "sh15": {
      const jump = f >= W("e2", 0) - 3;
      front(A, RTABLE[0] + 0.7, 0.3, RTABLE[2] - 0.1, { mode: "sit", facing: -1, expr: say("a3", "say", "smile") }, false);
      if (jump) front(Y, YSEAT[0], 0, YSEAT[2], { mode: "stand", facing: 0, expr: "relief_open", wave: 1 });
      else ySeat(0.22, { expr: f < W("a3", 4) ? "shock" : "relief" });
      break;
    }
    case "sh16":
      ySeat(f < W("n11", 4) - 2 ? 0.2 : 0.3, { expr: f < W("n11", 2) ? "neutral" : f < W("n11", 4) - 2 ? "nervous" : f < W("n11", 9) ? "shock" : "dazed" });
      break;
  }
  return out;
};
