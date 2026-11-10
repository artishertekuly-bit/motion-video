// «Барыс ағай» 3-сабақ: «Кім кімнен озады? (Абай. 18-қара сөз)»:
// Staging of the cast (Barys + nine pupils) and the effect cards:
// - Нұрлыбек's 100K sneaker card
// - Санжар & Томирис flex card (iPhone + 10K followers)
// - Abai shock card («АҚЫМАҚ!»)
// - Golden box vs old book (empty box vs deep knowledge)
// - Әлихан's solved Olympiad sheet
// - Journal stamp «5»
// - Final chalkboard celebration
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { leopardFront, leopardBack, LeoOpts, LExpr } from "./leopard";
import { FPS, clamp01, SHOTS, T_BOARD, T_DESK, A_BOARD, ALI, TOM, NUR, SAN, NUR_UP, ROWZ, SEAT_Y, TDESK, EQ_X, V3 } from "./story";
import { shotStart, talking, ws } from "./timeline";
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

// ---------------- Effect Drawings ----------------
const MONT = "Montserrat, 'DejaVu Sans', sans-serif";
const txt = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, stroke = 0, weight = 900, align: CanvasTextAlign = "center") => {
  g.save();
  g.font = `${weight} ${px}px ${MONT}`;
  g.textAlign = align;
  g.textBaseline = "middle";
  g.lineJoin = "round";
  if (stroke) {
    g.lineWidth = stroke;
    g.strokeStyle = INK;
    g.strokeText(s, x, y);
  }
  g.fillStyle = fill;
  g.fillText(s, x, y);
  g.restore();
};

const RED = "#d8332c", GRN = "#2fb36b", GOLD = "#f4b825", BLUE = "#23458c";

/** Нұрлыбек's glowing sneaker card (520 x 420) */
const sneakerCard = (p: Pen) => {
  p.poly([[20, 20], [500, 20], [500, 400], [20, 400]], "#fdfaf0", 10);
  txt(p.g, "ЖАҢА ТРЕНД!", 260, 60, 28, "#2c3a63", 0, 800);

  // Sneaker body
  p.g.save();
  p.g.fillStyle = "#ff4438";
  p.g.beginPath();
  p.g.moveTo(100, 280);
  p.g.quadraticCurveTo(120, 160, 220, 150);
  p.g.quadraticCurveTo(280, 200, 360, 210);
  p.g.quadraticCurveTo(430, 220, 440, 270);
  p.g.quadraticCurveTo(420, 290, 100, 290);
  p.g.closePath();
  p.g.fill();
  p.g.lineWidth = 8;
  p.g.strokeStyle = INK;
  p.g.stroke();

  // White sole
  p.poly([[90, 285], [445, 285], [445, 320], [90, 320]], "#ffffff", 8);

  // Star logo
  p.g.fillStyle = "#ffffff";
  p.g.beginPath();
  p.g.ellipse(270, 230, 40, 14, -0.3, 0, Math.PI * 2);
  p.g.fill();
  p.g.restore();

  // Price tag badge
  p.poly([[280, 90], [480, 90], [480, 160], [280, 160]], GOLD, 8);
  txt(p.g, "100 000 ₸", 380, 125, 34, "#1a1a24", 0, 900);
  txt(p.g, "ОРИГИНАЛ! ✔", 260, 365, 36, GRN, 0, 900);
};

/** Class flex card (iPhone + 10K Followers) */
const flexCard = (p: Pen) => {
  p.poly([[20, 20], [560, 20], [560, 380], [20, 380]], "#f6f7fb", 10);

  // Phone side (Sanjar)
  p.poly([[40, 50], [260, 50], [260, 350], [40, 350]], "#1c1c24", 8);
  p.poly([[55, 70], [245, 70], [245, 330], [55, 330]], "#2a344d", 0);
  txt(p.g, "IPHONE 16", 150, 130, 24, "#ffffff", 0, 800);
  txt(p.g, "PRO MAX", 150, 175, 30, GOLD, 0, 900);
  txt(p.g, "«МЕН ОЗДЫМ!»", 150, 260, 22, "#ffffff", 0, 700);

  // Social side (Tomiris)
  p.poly([[300, 50], [540, 50], [540, 350], [300, 350]], "#ffffff", 8);
  p.poly([[330, 90], [510, 90], [510, 160], [330, 160]], "#e1306c", 6);
  txt(p.g, "INSTA", 420, 125, 32, "#ffffff", 0, 900);
  txt(p.g, "10 000", 420, 220, 52, "#1a1a24", 0, 900);
  txt(p.g, "ОҚЫРМАН", 420, 280, 26, "#777777", 0, 800);
};

/** Abai shock card («АҚЫМАҚ!») */
const abaiShockCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#1c1b22", 12);
  txt(p.g, "АБАЙ АТАМЫЗ (1895 Ж.):", 280, 75, 26, GOLD, 0, 800);
  txt(p.g, "«АҚЫМАҚ!»", 280, 190, 82, RED, 0, 900);
  txt(p.g, "«КИІММЕН ОЗДЫМ ДЕМЕК!»", 280, 305, 30, "#ffffff", 0, 800);
};

/** Gold shiny box vs old book (560 x 390) */
const boxAndBookCard = (p: Pen, isOpen: boolean) => {
  p.poly([[20, 20], [540, 20], [540, 370], [20, 370]], "#faf9f4", 10);

  // Left: Golden box
  p.poly([[40, 70], [260, 70], [260, 300], [40, 300]], GOLD, 8);
  p.stroke([[40, 185], [260, 185]], 12, RED); // ribbon
  p.stroke([[150, 70], [150, 300]], 12, RED);

  if (isOpen) {
    p.poly([[55, 85], [245, 85], [245, 285], [55, 285]], "#2a2824", 4);
    txt(p.g, "ІШІ БОС!", 150, 185, 34, "#ffffff", 0, 900);
    txt(p.g, "ҚҰНЫ: 0 ₸", 150, 335, 26, RED, 0, 800);
  } else {
    txt(p.g, "ЖЫЛТЫР ҚОРАП", 150, 335, 22, "#444", 0, 800);
  }

  // Right: Old green textbook
  p.poly([[300, 60], [520, 60], [520, 310], [300, 310]], "#2a6245", 8);
  txt(p.g, "ОҚУЛЫҚ", 410, 110, 28, GOLD, 0, 900);
  txt(p.g, "E = mc²", 410, 175, 32, "#ffffff", 0, 800);
  txt(p.g, "∫ f(x) dx", 410, 235, 30, "#ffffff", 0, 800);
  txt(p.g, "ТЕРЕҢ БІЛІМ ✔", 410, 335, 24, GRN, 0, 900);
};

/** Әлихан's solved Olympiad sheet (480 x 580) */
const aliSolvedCard = (p: Pen) => {
  p.poly([[20, 20], [460, 20], [460, 560], [20, 560]], "#fcfbf7", 10);
  txt(p.g, "ОЛИМПИАДА ЕСЕБІ", 240, 65, 28, BLUE, 0, 800);

  const formulas = [
    "sin²x + cos²x = 1 ✔",
    "lim (x→0) sin(x)/x = 1 ✔",
    "f'(x) = 3x² - 6x + 2 ✔",
    "x₁ = 2.41,  x₂ = -0.41 ✔",
    "ЖАУАБЫ: ДӘЛ ШЕШІЛДІ!",
  ];
  formulas.forEach((f, i) => {
    txt(p.g, f, 50, 130 + i * 62, 26, i === 4 ? BLUE : GRN, 0, 800, "left");
  });

  // Stamp
  p.g.save();
  p.g.strokeStyle = RED;
  p.g.lineWidth = 7;
  p.g.strokeRect(70, 430, 320, 90);
  txt(p.g, "100% ДҰРЫС! ✔", 230, 475, 38, RED, 0, 900);
  p.g.restore();
};

/** Journal page (600 x 420) with stamped red «5» */
const journal = (p: Pen, k: number) => {
  p.poly([[10, 10], [590, 10], [590, 410], [10, 410]], "#fbf8ee", 10);
  for (let i = 0; i < 7; i++) p.stroke([[20, 70 + i * 48], [580, 70 + i * 48]], 3, "rgba(60,70,110,0.45)");
  for (let j = 0; j < 5; j++) p.stroke([[250 + j * 66, 20], [250 + j * 66, 400]], 3, "rgba(60,70,110,0.45)");
  ["Әбілқасым Н.", "Ахметова Т.", "Бекұлы С.", "Әлихан Е."].forEach((s, i) =>
    txt(p.g, s, 30, 96 + i * 48, 30, i === 3 ? "#120c06" : "#4a4a5a", 0, i === 3 ? 900 : 600, "left")
  );
  for (let i = 0; i < 3; i++) txt(p.g, ["2", "4", "4"][i], 283, 96 + i * 48, 30, "#2c3a63", 0, 800);
  if (k > 0) {
    const s = 1 + 1.6 * (1 - k) ** 2,
      g = p.g;
    g.save();
    g.translate(283, 240);
    g.scale(s, s);
    g.globalAlpha = Math.min(1, k * 2);
    txt(g, "5", 0, 0, 120, RED, 0, 900);
    g.strokeStyle = RED;
    g.lineWidth = 8;
    g.beginPath();
    g.ellipse(0, 4, 54, 64, -0.2, 0, 7);
    g.stroke();
    g.restore();
  }
};

const ha = (p: Pen, s: string, rot: number) => {
  p.g.save();
  p.g.translate(150, 100);
  p.g.rotate(rot);
  txt(p.g, s, 0, 0, 96, "#ffd84a", 16);
  p.g.restore();
};
const qmark = (p: Pen) => txt(p.g, "?!", 100, 130, 170, "#ffffff", 18);
const star = (p: Pen, s = 1, col = "#ffd84a") => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2,
      r = (i % 2 ? 36 : 90) * s;
    pts.push([128 + r * Math.cos(a), 128 + r * Math.sin(a)]);
  }
  p.poly(pts, col, 10);
};
const sunburst = (p: Pen) => {
  const g = p.g;
  for (let i = 0; i < 18; i++) {
    const a0 = (i / 18) * Math.PI * 2,
      a1 = a0 + Math.PI / 18;
    g.beginPath();
    g.moveTo(300, 300);
    g.lineTo(300 + 300 * Math.cos(a0), 300 + 300 * Math.sin(a0));
    g.lineTo(300 + 300 * Math.cos(a1), 300 + 300 * Math.sin(a1));
    g.closePath();
    g.fillStyle = "rgba(255,224,110,0.32)";
    g.fill();
  }
  const gr = g.createRadialGradient(300, 300, 0, 300, 300, 300);
  gr.addColorStop(0, "rgba(255,248,210,0.75)");
  gr.addColorStop(0.4, "rgba(255,240,180,0.22)");
  gr.addColorStop(1, "rgba(255,240,180,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 600, 600);
};

// ---------------- Staging ----------------
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1],
    k = s.key,
    t = f / FPS;
  setLight(s.light, cam);
  const W = ws,
    A = shotStart;

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

  const klass = (mood: "calm" | "ooh" | "laugh" | "think", skip: string[] = []) => {
    const face = (i: number): Expr =>
      mood === "ooh"
        ? "shock"
        : mood === "laugh"
        ? i % 3 === 1
          ? "grin"
          : "laugh"
        : mood === "think"
        ? i % 2
          ? "think"
          : "stare"
        : i % 3 === 0
        ? "smile"
        : "neutral";
    for (const [w, x, r] of EXTRAS) seat(w, [x, SEAT_Y, ROWZ[r]], face(w.i));
    if (!skip.includes("tom")) seat(W_TOM, TOM, mood === "laugh" ? "grin" : face(2));
    if (!skip.includes("nur")) seat(W_NUR, NUR, face(4));
    if (!skip.includes("san")) seat(W_SAN, SAN, face(3), { prop: "phone" });
    if (!skip.includes("ali")) seat(W_ALI, ALI, mood === "laugh" ? "grin" : face(1));
  };

  const laughs = (x0: number, z0: number) => {
    for (let i = 0; i < 4; i++) {
      const ph = ((f + i * 7) % 20) / 20,
        x = x0 + [-0.5, 0.35, -0.15, 0.55][i],
        z = z0 + [0, 1.6, 3.2, 0.8][i];
      fx(`ha${i}|${q(ph, 10)}`, 300, 200, (p) => ha(p, i % 2 ? "ХА!" : "ХА-ХА!", -0.2 + 0.1 * i + 0.06 * Math.sin(ph * 6.28)), x, 1.45 + 0.05 * Math.sin(ph * 6.28), z, 0.42, 0.28);
    }
  };

  switch (k) {
    case "sh01": {
      const turn = 15;
      out.places.push(
        f < turn
          ? barys(cam, T_BOARD, {}, f, true)
          : barys(cam, T_BOARD, { expr: lsay("t1", "smug"), facing: 1, arms: ["hang", "point"], tail: -1, look: 0.5 }, f)
      );
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      break;
    }
    case "sh02": {
      klass("ooh", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u1", "laugh", "grin"), wave: 0.6 + 0.4 * Math.sin(t * 10) }, true);
      burst(NUR_UP[0] + 0.32, 1.55, NUR_UP[2], A("sh02") + 2, 0.85, 10);
      const kk = pop(A("sh02") + 2);
      fx("sneaker", 520, 420, sneakerCard, NUR_UP[0] - 0.42, 1.36, NUR_UP[2] - 0.2, 0.32 * kk, 0.26 * kk);
      break;
    }
    case "sh03": {
      const isLaugh = f < W("n2", 4) - 3;
      klass(isLaugh ? "laugh" : "calm", ["san", "tom"]);
      if (isLaugh) laughs(-1.75, -0.2);
      seat(W_SAN, SAN, "grin", { prop: "phone" });
      seat(W_TOM, TOM, "grin");
      const a0 = W("n2", 2) - 3;
      if (has(a0)) {
        const kk = pop(a0);
        fx("flexCard", 560, 380, flexCard, 0.1, 1.45, 0.8, 0.38 * kk, 0.26 * kk);
      }
      break;
    }
    case "sh04": {
      out.places.push(barys(cam, T_DESK, { expr: lsay("t1", "smug"), arms: ["glasses", "present"], facing: -1, tail: 1 }, f));
      break;
    }
    case "sh05": {
      klass("calm", ["nur"]);
      seat(W_NUR, NUR, say("u2", "say", "grin"));
      fx("qm", 200, 260, qmark, NUR[0] + 0.18, 1.38, NUR[2], 0.14, 0.18);
      break;
    }
    case "sh06": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t2", "proud"), facing: 1, arms: ["hang", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("ooh");
      burst(EQ_X, 1.55, -3.9, A("sh06") + 2, 0.85, 10, "#e2483d");
      const kk = pop(A("sh06") + 2);
      fx("abaiShock", 540, 380, abaiShockCard, EQ_X, 1.55, -3.5, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh07": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t3", "proud"), facing: 1, arms: ["present", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      break;
    }
    case "sh08": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t4", "proud"), facing: 1, arms: ["present", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      break;
    }
    case "sh09": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "proud"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      break;
    }
    case "sh10": {
      out.places.push(barys(cam, T_DESK, { expr: "smile", arms: ["present", "hang"], facing: -1, tail: 1 }, f));
      const kk = pop(A("sh10") + 2);
      fx("boxBook0", 560, 390, (p) => boxAndBookCard(p, false), T_DESK[0] - 0.05, TDESK.h + 0.02, T_DESK[2] + 0.42, 0.46 * kk, 0.32 * kk, false, true);
      break;
    }
    case "sh11": {
      out.places.push(barys(cam, T_DESK, { expr: lsay("t6", "proud"), arms: ["present", "hip"], facing: -1, tail: 1 }, f));
      const kk = pop(A("sh11") + 2);
      fx("boxBook1", 560, 390, (p) => boxAndBookCard(p, true), T_DESK[0] - 0.05, TDESK.h + 0.02, T_DESK[2] + 0.42, 0.48 * kk, 0.34 * kk, false, true);
      break;
    }
    case "sh12": {
      klass("calm", ["nur"]);
      seat(W_NUR, NUR, "pained");
      break;
    }
    case "sh13": {
      klass("calm", ["ali"]);
      seat(W_ALI, ALI, "think");
      const kk = pop(A("sh13") + 3);
      fx("aliSolved", 480, 580, aliSolvedCard, ALI[0] + 0.12, 1.42, ALI[2] - 0.35, 0.28 * kk, 0.34 * kk);
      break;
    }
    case "sh14": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t7", "proud"), facing: 1, arms: ["present", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("ooh");
      const kk = pop(A("sh14") + 2);
      fx("aliSolvedBig", 480, 580, aliSolvedCard, T_BOARD[0] + 0.48, 1.48, T_BOARD[2] + 0.1, 0.34 * kk, 0.42 * kk);
      break;
    }
    case "sh15": {
      const kk = q(clamp01((f - A("sh15") - 7) / 4), 8);
      fx(`journal${kk}`, 600, 420, (p) => journal(p, kk), T_DESK[0] - 0.05, TDESK.h + 0.016, T_DESK[2] + 0.42, 0.5, 0.35, false, true);
      break;
    }
    case "sh16": {
      out.places.push(barys(cam, T_DESK, { expr: lsay("t8", "smug"), arms: ["hip", "present"], facing: 1, tail: -1 }, f));
      break;
    }
    case "sh17": {
      klass("think");
      break;
    }
    case "sh18": {
      klass("calm", ["nur"]);
      seat(W_NUR, NUR, say("u3", "say", "grin"));
      break;
    }
    case "sh19": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t9", "smile"), facing: 1, arms: ["hang", "hang"], tail: -1 }, f));
      kid(W_ALI, A_BOARD, { mode: "stand", expr: "smile" }, true);
      break;
    }
    case "sh20": {
      out.places.push(barys(cam, T_BOARD, { expr: "joy", facing: 1, arms: ["hip", "present"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      kid(W_ALI, A_BOARD, { mode: "stand", expr: "laugh", wave: 0.6 + 0.4 * Math.sin(t * 8) }, true);
      if (has(A("sh20") + 4)) {
        fx("sunburst", 600, 600, sunburst, A_BOARD[0], 1.0, A_BOARD[2] + 0.5, 2.2, 2.2, true);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + t * 1.2,
            r = 0.4 + 0.05 * Math.sin(t * 5 + i);
          const sc = pop(A("sh20") + 4 + i * 2);
          fx(`star${i % 2}`, 256, 256, (p) => star(p, 1, i % 2 ? "#ff8fb0" : "#ffd84a"), A_BOARD[0] + r * Math.cos(a), 1.02 + 0.3 * Math.sin(a), A_BOARD[2] - 0.15, 0.14 * sc, 0.14 * sc);
        }
      }
      break;
    }
  }
  return out;
};
