// «Барыс ағай» 1-сабақ: the cast (Barys + nine pupils), per-shot staging and the effect cards (diary, notebook,
// pencils, phone, flat-earth bubble, journal stamp, laughs, stars).
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { leopardFront, leopardBack, LeoOpts, LExpr } from "./leopard";
import { FPS, clamp01, SHOTS, T_BOARD, T_DESK, A_BOARD, ALI, TOM, NUR, SAN, NUR_UP, ALI_UP, ROWZ, SEAT_Y, TDESK, EQ_X, V3 } from "./story";
import { shotStart, talking, ws, we } from "./timeline";
import { CamInfo, Stage, Who, Place, person, blob, lidAt, setLight, light2D, q } from "./cast";

// ---------------- the class ----------------
const P = "#2a2a35", BT = "#1c1c22";
export const ALIHAN: Outfit = { jacket: "#3a4f7a", pants: P, boots: BT, hat: "hair", hair: "#1a1410", skin: "#eec39c", buttons: "#d9dde0", build: "kid" };
export const TOMIRIS: Outfit = { jacket: "#f4f1ea", dress: "#2c3a63", pants: P, boots: BT, hat: "hair", hair: "#20140e", long: "#20140e", bow: true, glasses: true, skin: "#f3cfae", build: "kid" };
const SANZHAR: Outfit = { jacket: "#5a6270", pants: P, boots: BT, hat: "hair", hair: "#2a1a10", skin: "#e2b48c", build: "kid" };
const NURLYBEK: Outfit = { jacket: "#c8452f", pants: P, boots: BT, hat: "hair", hair: "#1a1410", skin: "#e8b896", build: "kid" };
const KID = (jacket: string, hair: string, girl: boolean, extra: Partial<Outfit> = {}): Outfit =>
  ({ jacket, pants: P, boots: BT, hat: "hair", hair, skin: "#efc6a0", build: "kid", ...(girl ? { dress: "#2c3a63", long: hair } : {}), ...extra });
const W_ALI: Who = { i: 1, o: ALIHAN, okey: "ali" };
const W_TOM: Who = { i: 2, o: TOMIRIS, okey: "tom" };
const W_SAN: Who = { i: 3, o: SANZHAR, okey: "san" };
const W_NUR: Who = { i: 4, o: NURLYBEK, okey: "nur" };
/** the other six pupils: who, seat x, row */
const EXTRAS: [Who, number, number][] = [
  [{ i: 5, o: KID("#f4f1ea", "#3a2414", true, { dress: "#7a3a5a" }), okey: "e1" }, -2.05, 0],
  [{ i: 6, o: KID("#2f6fb0", "#1a1410", false), okey: "e2" }, 2.05, 0],
  [{ i: 7, o: KID("#e8b23a", "#1a1410", true, { bow: true }), okey: "e3" }, -2.05, 1],
  [{ i: 8, o: KID("#f4f1ea", "#5a3a1a", true, { dress: "#3f6a4a" }), okey: "e5" }, 2.05, 1],
  [{ i: 9, o: KID("#3f9a4f", "#2a1a10", false), okey: "e6" }, 1.45, 2],
  [{ i: 10, o: KID("#8a5ab0", "#1a1410", false), okey: "e7" }, 2.05, 2],
];

// ---------------- Barys ----------------
const tmp = new THREE.Vector3();
/** leopard drawing resolution by distance (video: the cast.ts tiers, a step finer for the hero) */
const tierL = (d: number): [number, number, number] => (d < 2.4 ? [1200, 2000, 2] : d < 4.5 ? [900, 1500, 1.5] : [600, 1000, 1]);
const barys = (cam: CamInfo, at: V3, o: LeoOpts, f: number, back = false): Place => {
  const [x, y, z] = at;
  const size = tierL(cam.pos.distanceTo(tmp.set(x, y + 1.3, z)));
  const light = light2D(cam, false);
  const oo: LeoOpts = { glasses: true, blink: lidAt(f / FPS, 11), ...o };
  return back
    ? { key: `leoB|${q(light, 12)}`, x, y, z, size, draw: (p) => leopardBack(p, { light }) }
    : { key: `leo|${JSON.stringify(oo)}|${q(light, 12)}`, x, y, z, size, draw: (p) => leopardFront(p, { light, ...oo }) };
};

// ---------------- effect drawings ----------------
const MONT = "Montserrat, 'DejaVu Sans', sans-serif";
const txt = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, stroke = 0, weight = 900, align: CanvasTextAlign = "center") => {
  g.save(); g.font = `${weight} ${px}px ${MONT}`; g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y); g.restore();
};
const RED = "#d8332c";
/** open diary (600 x 420): three red «2» circled */
const diary = (p: Pen) => {
  p.poly([[20, 40], [300, 20], [300, 400], [20, 390]], "#fbf8ee", 10);
  p.poly([[300, 20], [580, 40], [580, 390], [300, 400]], "#fbf8ee", 10);
  txt(p.g, "КҮНДЕЛІК", 160, 70, 34, "#2c3a63", 0, 800);
  for (let i = 0; i < 6; i++) { p.stroke([[50, 120 + i * 45], [270, 116 + i * 45]], 3, "rgba(60,70,110,0.45)"); p.stroke([[330, 116 + i * 45], [550, 120 + i * 45]], 3, "rgba(60,70,110,0.45)"); }
  for (const [x, y] of [[230, 150], [470, 200], [250, 300]] as const) {
    txt(p.g, "2", x, y, 78, RED, 0, 900);
    p.g.save(); p.g.strokeStyle = RED; p.g.lineWidth = 6; p.g.beginPath(); p.g.ellipse(x, y + 2, 40, 46, -0.2, 0, 7); p.g.stroke(); p.g.restore();
  }
};
/** Томирис's notebook page (500 x 600) filling with formulas, k 0..1 */
const FORMS = ["2 + 2 = 4 ?", "x + x = 5", "2x = 5", "x = 2,5 !?", "√16 = 5 ?", "(2+2)² = 25", "?!?!"];
const notebook = (p: Pen, k: number) => {
  p.poly([[20, 20], [480, 20], [480, 580], [20, 580]], "#fbfbf6", 10);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 10; j++) p.g.fillRect(30 + j * 46, 30 + i * 46, 1, 1);
  p.g.strokeStyle = "rgba(90,140,200,0.35)"; p.g.lineWidth = 2;
  for (let x = 40; x < 480; x += 36) { p.g.beginPath(); p.g.moveTo(x, 24); p.g.lineTo(x, 576); p.g.stroke(); }
  for (let y = 40; y < 580; y += 36) { p.g.beginPath(); p.g.moveTo(24, y); p.g.lineTo(476, y); p.g.stroke(); }
  const n = Math.floor(k * FORMS.length + 0.001);
  FORMS.slice(0, n).forEach((s, i) => txt(p.g, s, 60 + (i % 2) * 20, 70 + i * 74, 46, i === FORMS.length - 1 ? RED : "#233a66", 0, 700, "left"));
};
/** pencils (640 x 320): n of 4 pencils, «+» after the 2nd, «= 4» when eq */
const pencil = (p: Pen, x: number, y: number) => {
  p.poly([[x - 16, y - 120], [x + 16, y - 120], [x + 16, y + 70], [x, y + 112], [x - 16, y + 70]], "#f2c230", 7);
  p.poly([[x - 16, y + 70], [x + 16, y + 70], [x, y + 112]], "#efd9b0", 6);
  p.poly([[x - 5, y + 98], [x + 5, y + 98], [x, y + 112]], "#333", 0);
  p.poly([[x - 16, y - 140], [x + 16, y - 140], [x + 16, y - 120], [x - 16, y - 120]], "#e98aa0", 6);
  p.stroke([[x, y - 118], [x, y + 66]], 3, "rgba(160,110,10,0.6)");
};
const pencils = (p: Pen, n: number, eq: boolean) => {
  const xs = eq ? [60, 120, 250, 310] : [130, 200, 380, 450];
  for (let i = 0; i < n; i++) pencil(p, xs[i], 170);
  if (n >= 3) txt(p.g, "+", eq ? 185 : 290, 170, 90, "#ffffff", 14);
  if (eq) txt(p.g, "= 4", 490, 170, 110, "#ffd84a", 16);
};
/** Санжар's phone (360 x 640): «2 + 2 = 5 ✔» */
const phone = (p: Pen) => {
  p.poly([[30, 20], [330, 20], [330, 620], [30, 620]], "#1c1c22", 12);
  p.poly([[50, 60], [310, 60], [310, 580], [50, 580]], "#ffffff", 0);
  p.poly([[66, 80], [294, 80], [294, 130], [66, 130]], "#eef0f4", 4);
  txt(p.g, "2+2=5 дәлел", 180, 106, 28, "#555", 0, 700);
  txt(p.g, "2 + 2 = 5", 180, 250, 64, "#233a66", 0, 900);
  p.ell(180, 380, 62, 62, "#2fb36b", 8);
  p.stroke([[150, 380], [172, 404], [214, 356]], 14, "#ffffff");
  txt(p.g, "100% ШЫН!", 180, 500, 40, RED, 0, 900);
};
const CLOUD: [number, number, number, number][] = [[300, 210, 230, 150], [150, 190, 100, 90], [450, 180, 110, 95], [260, 110, 110, 80], [380, 100, 100, 75], [230, 300, 120, 70], [400, 300, 120, 70]];
/** thought cloud with a flat earth on elephants... no — on a plate (600 x 480) */
const flatEarth = (p: Pen) => {
  for (const [x, y, r] of [[90, 450, 18], [130, 410, 28]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 7);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, null, 12);
  for (const [x, y, rx, ry] of CLOUD) p.ell(x, y, rx, ry, "#ffffff", 0);
  p.ell(310, 215, 170, 52, "#3f8fe0", 8);
  for (const [x, y, rx, ry] of [[250, 205, 50, 16], [350, 222, 60, 18], [400, 200, 26, 10]] as const) p.ell(x, y, rx, ry, "#6fbf5a", 0);
  p.poly([[140, 222], [480, 222], [470, 262], [150, 262]], "#a8703f", 7);
  for (const x of [170, 230, 290, 350, 410, 450]) p.stroke([[x, 262], [x - 4, 290 + (x % 3) * 8]], 6, "#3f8fe0");
  txt(p.g, "?!", 470, 110, 70, "#e2483d", 12);
};
/** journal page (600 x 420) with «Әлихан» and a stamped red «5» (k 0..1 = stamp landing) */
const journal = (p: Pen, k: number) => {
  p.poly([[10, 10], [590, 10], [590, 410], [10, 410]], "#fbf8ee", 10);
  for (let i = 0; i < 7; i++) p.stroke([[20, 70 + i * 48], [580, 70 + i * 48]], 3, "rgba(60,70,110,0.45)");
  for (let j = 0; j < 5; j++) p.stroke([[250 + j * 66, 20], [250 + j * 66, 400]], 3, "rgba(60,70,110,0.45)");
  ["Әбілқасым Н.", "Ахметова Т.", "Бекұлы С.", "Әлихан Е."].forEach((s, i) => txt(p.g, s, 30, 96 + i * 48 + (i === 3 ? 0 : 0), 30, i === 3 ? "#120c06" : "#4a4a5a", 0, i === 3 ? 900 : 600, "left"));
  for (let i = 0; i < 3; i++) txt(p.g, ["4", "5", "3"][i], 283, 96 + i * 48, 30, "#2c3a63", 0, 800);
  if (k > 0) {
    const s = 1 + 1.6 * (1 - k) ** 2, g = p.g;
    g.save(); g.translate(283, 240); g.scale(s, s); g.globalAlpha = Math.min(1, k * 2);
    txt(g, "5", 0, 0, 120, RED, 0, 900);
    g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 4, 54, 64, -0.2, 0, 7); g.stroke();
    g.restore();
  }
};
/** «ХА!» (300 x 200) */
const ha = (p: Pen, s: string, rot: number) => { p.g.save(); p.g.translate(150, 100); p.g.rotate(rot); txt(p.g, s, 0, 0, 96, "#ffd84a", 16); p.g.restore(); };
/** «?» (200 x 260) */
const qmark = (p: Pen) => txt(p.g, "?", 100, 130, 200, "#ffffff", 18);
const star = (p: Pen, s = 1, col = "#ffd84a") => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = (i % 2 ? 36 : 90) * s; pts.push([128 + r * Math.cos(a), 128 + r * Math.sin(a)]); }
  p.poly(pts, col, 10);
};
/** soft sunburst behind a happy moment (600 x 600, no ink) */
const sunburst = (p: Pen) => {
  const g = p.g;
  for (let i = 0; i < 18; i++) {
    const a0 = (i / 18) * Math.PI * 2, a1 = a0 + Math.PI / 18;
    g.beginPath(); g.moveTo(300, 300); g.lineTo(300 + 300 * Math.cos(a0), 300 + 300 * Math.sin(a0)); g.lineTo(300 + 300 * Math.cos(a1), 300 + 300 * Math.sin(a1)); g.closePath();
    g.fillStyle = "rgba(255,224,110,0.32)"; g.fill();
  }
  const gr = g.createRadialGradient(300, 300, 0, 300, 300, 300);
  gr.addColorStop(0, "rgba(255,248,210,0.75)"); gr.addColorStop(0.4, "rgba(255,240,180,0.22)"); gr.addColorStop(1, "rgba(255,240,180,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 600, 600);
};

// ---------------- staging ----------------
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], k = s.key, t = f / FPS;
  setLight(s.light, cam);
  const W = ws, A = shotStart;
  const kid = (who: Who, at: V3, fo: FrontOpts, shadow = false) => {
    out.places.push(person(cam, who, at[0], at[1], at[2], { side: false, mirror: false }, { blink: lidAt(t, who.i), facing: 0, ...fo }, {}));
    if (shadow) blob(out, at[0], at[1], at[2]);
  };
  const seat = (who: Who, at: V3, expr: Expr, fo: FrontOpts = {}) => kid(who, at, { mode: "sit", expr, ...fo });
  const say = (line: string, open: Expr, shut: Expr) => (talking(line, f) ? open : shut);
  const lsay = (line: string, shut: LExpr): LExpr => (talking(line, f) ? "talk" : shut);
  const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false, flat = false, rot = 0) =>
    out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft, flat, rot });
  const burst = (x: number, y: number, z: number, at0: number, w = 1.0, n = 10, col?: string) => {
    if (f < at0 || f >= at0 + n) return;
    const u = q((f - at0) / n, 30);
    fx(`burst${u}${col ?? ""}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
  };
  const pop = (at0: number) => clamp01((f - at0) / 5) ** 0.5;
  const has = (a: number) => f >= a;
  /** the whole class at their desks; mood picks everyone's face, `skip` leaves seats to the caller */
  const klass = (mood: "calm" | "ooh" | "laugh" | "think", skip: string[] = []) => {
    const face = (i: number): Expr => mood === "ooh" ? "shock" : mood === "laugh" ? (i % 3 === 1 ? "grin" : "laugh") : mood === "think" ? (i % 2 ? "think" : "stare") : (i % 3 === 0 ? "smile" : "neutral");
    for (const [w, x, r] of EXTRAS) seat(w, [x, SEAT_Y, ROWZ[r]], face(w.i));
    if (!skip.includes("tom")) seat(W_TOM, TOM, mood === "laugh" ? "grin" : face(2));
    if (!skip.includes("nur")) seat(W_NUR, NUR, face(4));
    if (!skip.includes("san")) seat(W_SAN, SAN, face(3), { prop: "phone" });
    if (!skip.includes("ali")) seat(W_ALI, ALI, mood === "laugh" ? "pained" : face(1));
  };
  const laughs = (x0: number, z0: number) => {
    for (let i = 0; i < 4; i++) {
      const ph = ((f + i * 7) % 20) / 20, x = x0 + [-0.5, 0.35, -0.15, 0.55][i], z = z0 + [0, 1.6, 3.2, 0.8][i];
      fx(`ha${i}|${q(ph, 10)}`, 300, 200, (p) => ha(p, i % 2 ? "ХА!" : "ХА-ХА!", -0.2 + 0.1 * i + 0.06 * Math.sin(ph * 6.28)), x, 1.45 + 0.05 * Math.sin(ph * 6.28), z, 0.42, 0.28);
    }
  };
  switch (k) {
    case "sh01": {
      const turn = 13;
      out.places.push(f < turn
        ? barys(cam, T_BOARD, {}, f, true)
        : barys(cam, T_BOARD, { expr: lsay("t1", "smug"), facing: 1, arms: ["hang", "point"], tail: -1, look: 0.5 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      break;
    }
    case "sh02":
      klass("ooh");
      break;
    case "sh03": {
      klass("calm", ["ali"]);
      seat(W_ALI, ALI, has(W("n1", 8) - 2) ? "stare" : "nervous");
      const a0 = W("n1", 4) - 4;
      if (has(a0)) { const kk = pop(a0); fx("diary", 600, 420, diary, ALI[0] + 0.26, 1.0, ALI[2] - 0.55, 0.32 * kk, 0.22 * kk); }
      break;
    }
    case "sh04":
      out.places.push(barys(cam, T_DESK, { expr: lsay("t2", "smug"), arms: ["present", "hip"], facing: -1, tail: 1 }, f));
      break;
    case "sh05": {
      klass("calm", ["tom"]);
      const talk = has(W("o1", 0) - 2);
      seat(W_TOM, TOM, talk ? say("o1", "sayNervous", "nervous") : "think");
      if (!talk) {
        const kk = q(clamp01((f - A("sh05") - 6) / (W("n2", 4) + 14 - A("sh05"))), 14);
        fx(`note${kk}`, 500, 600, (p) => notebook(p, kk), TOM[0] + 0.2, 1.0, TOM[2] - 0.55, 0.22, 0.27);
      } else fx("qm", 200, 260, qmark, TOM[0] + 0.18, 1.38, TOM[2], 0.12, 0.16);
      break;
    }
    case "sh06": {
      klass("calm", ["ali"]);
      seat(W_ALI, ALI, "think");
      const n = [0, 1, 2, 3].filter((i) => has(A("sh06") + 6 + i * 8)).length;
      if (n) fx(`pen${n}`, 640, 320, (p) => pencils(p, n, false), ALI[0] + 0.08, 0.86, ALI[2] - 0.45, 0.36, 0.18);
      break;
    }
    case "sh07": {
      klass("calm", ["san"]);
      const up = has(W("s1", 0) - 2);
      seat(W_SAN, SAN, up ? say("s1", "say", "grin") : "grin", { prop: "phone", look: up ? 0 : 0.4 });
      if (up) { const kk = pop(W("s1", 0) - 2); fx("phone", 360, 640, phone, SAN[0] - 0.17, 1.2, SAN[2] - 0.35, 0.15 * kk, 0.27 * kk); }
      break;
    }
    case "sh08": {
      out.places.push(barys(cam, T_DESK, { expr: lsay("t3", "meh"), arms: ["cross", "cross"], tail: -1 }, f));
      const a0 = W("t3", 1) - 3;
      if (has(a0)) { const kk = pop(a0); fx("flat", 600, 480, flatEarth, T_DESK[0] + 0.18, 1.95, T_DESK[2] + 0.1, 0.5 * kk, 0.4 * kk); }
      break;
    }
    case "sh09": {
      const laugh = f < W("n4", 0) - 2;
      klass(laugh ? "laugh" : "calm", ["nur", "san"]);
      seat(W_SAN, SAN, laugh ? "pained" : "neutral");
      const up = has(W("n4", 0) + 6);
      if (laugh) laughs(1.75, -0.2);
      if (!up) seat(W_NUR, NUR, laugh ? "laugh" : "grin");
      else kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u1", "say", "grin"), wave: has(W("u1", 0)) ? 0.6 + 0.4 * Math.sin(t * 9) : undefined }, true);
      if (has(W("u1", 3))) burst(NUR_UP[0] + 0.35, 1.55, NUR_UP[2], W("u1", 3), 0.8, 10);
      break;
    }
    case "sh10":
      out.places.push(barys(cam, T_DESK, { expr: f < A("sh10") + 30 ? "meh" : "smug", arms: ["glasses", "hang"], tail: 1 }, f));
      break;
    case "sh11": {
      klass("calm", ["ali"]);
      seat(W_ALI, ALI, "think");
      fx("pen4", 640, 320, (p) => pencils(p, 4, false), ALI[0] + 0.08, 0.86, ALI[2] - 0.45, 0.36, 0.18);
      break;
    }
    case "sh12": {
      klass("think", ["ali"]);
      const hand = W("n6", 8) - 4;
      seat(W_ALI, ALI, has(hand) ? "nervous" : "think", { wave: has(hand) ? 0 : undefined });
      break;
    }
    case "sh13": {
      klass("calm", ["ali"]);
      kid(W_ALI, ALI_UP, { mode: "stand", expr: say("a1", "sayNervous", "nervous") }, true);
      if (has(W("a1", 6) - 3)) { const kk = pop(W("a1", 6) - 3); fx("pen4eq", 640, 320, (p) => pencils(p, 4, true), ALI_UP[0] + 0.04, 1.43, ALI_UP[2] - 0.3, 0.3 * kk, 0.15 * kk); }
      break;
    }
    case "sh14":
      klass("laugh", ["ali"]);
      kid(W_ALI, ALI_UP, { mode: "stand", expr: "pained" }, true);
      laughs(-1.75, -0.2);
      break;
    case "sh15": {
      const kk = q(clamp01((f - A("sh15") - 7) / 4), 8);
      fx(`journal${kk}`, 600, 420, (p) => journal(p, kk), T_DESK[0] - 0.05, TDESK.h + 0.016, T_DESK[2] + 0.42, 0.5, 0.35, false, true);
      break;
    }
    case "sh16":
      out.places.push(barys(cam, T_DESK, { expr: lsay("t4", "proud"), arms: ["hip", "present"], facing: 1, tail: -1 }, f));
      break;
    case "sh17": {
      klass("ooh", ["ali"]);
      kid(W_ALI, ALI_UP, { mode: "stand", expr: f < W("n8", 4) ? "relief_open" : "laugh", wave: has(W("n8", 4)) ? 0.5 + 0.5 * Math.sin(t * 10) : undefined }, true);
      if (has(W("n8", 4) - 2)) {
        fx("sunburst", 600, 600, sunburst, ALI_UP[0], 1.0, ALI_UP[2] + 0.5, 2.2, 2.2, true);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + t * 1.2, r = 0.4 + 0.05 * Math.sin(t * 5 + i);
          const sc = pop(W("n8", 4) + i * 2);
          fx(`star${i % 2}`, 256, 256, (p) => star(p, 1, i % 2 ? "#ff8fb0" : "#ffd84a"), ALI_UP[0] + r * Math.cos(a), 1.02 + 0.3 * Math.sin(a), ALI_UP[2] - 0.15, 0.14 * sc, 0.14 * sc);
        }
      }
      break;
    }
    case "sh18": {
      out.places.push(barys(cam, T_BOARD, { expr: "smile", facing: 1, arms: ["hang", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      kid(W_ALI, A_BOARD, { mode: "stand", expr: "smile" }, true);
      for (const d of [6, 14]) burst(EQ_X - 0.55, 1.62, -3.9, A("sh18") + d, 0.35, 8);
      break;
    }
    case "sh19":
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "smile"), facing: 1, arms: ["hang", "hang"], tail: -1 }, f));
      kid(W_ALI, A_BOARD, { mode: "stand", expr: "smile" }, true);
      break;
    case "sh20": {
      out.places.push(barys(cam, T_BOARD, { expr: "joy", facing: 1, arms: ["hip", "present"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      kid(W_ALI, A_BOARD, { mode: "stand", expr: "laugh", wave: 0.6 + 0.4 * Math.sin(t * 8) }, true);
      break;
    }
  }
  void we;
  return out;
};
