// «Барыс ағай» 5-сабақ: «100 миллион әлде 1 теңге? (Экспоненциалды өсу)»:
// Staging of cast & effect cards
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { leopardFront, leopardBack, LeoOpts, LExpr } from "./leopard";
import { FPS, clamp01, SHOTS, T_BOARD, NUR, NUR_UP, ROWZ, SEAT_Y, EQ_X, V3, ALI, TOM, SAN } from "./story";
import { shotStart, talking } from "./timeline";
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

const RED = "#d8332c", GRN = "#2fb36b", GOLD = "#f4b825";

/** Nurlybek's Gelik & Doner dream card */
const gelikDonerCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#181a20", 10);
  txt(p.g, "НҰРЛЫБЕКТІҢ АРМАНЫ 😎", 280, 60, 28, GOLD, 0, 900);

  // Gelik (Black boxy SUV silhouette)
  p.poly([[50, 150], [220, 150], [250, 200], [270, 200], [270, 260], [40, 260], [40, 200]], "#252830", 8);
  p.g.fillStyle = "#111";
  p.g.beginPath(); p.g.arc(90, 260, 22, 0, 7); p.g.fill();
  p.g.beginPath(); p.g.arc(220, 260, 22, 0, 7); p.g.fill();
  txt(p.g, "G-WAGON", 150, 215, 22, "#fff", 0, 800);

  // Giant Doner
  p.poly([[320, 140], [490, 140], [470, 270], [340, 270]], "#e5a752", 8);
  txt(p.g, "ТЕГІН ДОНЕР!", 405, 205, 22, RED, 0, 900);
  txt(p.g, "БАСТЫҚ БОЛАМЫН!", 280, 335, 30, GRN, 0, 900);
};

/** 1 Billion loss card */
const shockBillionCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#2a1518", 12);
  txt(p.g, "ШОК ХАБАРЛАМА! 💥", 280, 75, 30, GOLD, 0, 900);
  txt(p.g, "- 1 000 000 000 ₸", 280, 185, 46, RED, 0, 900);
  txt(p.g, "1 МИЛЛИАРД ШЫҒЫН!", 280, 265, 36, GOLD, 0, 900);
  txt(p.g, "ҚАТЕ ТАҢДАУ ЖАСАЛДЫ!", 280, 335, 24, "#fff", 0, 800);
};

/** Chessboard & Indian wheat king card */
const chessWheatCard = (p: Pen) => {
  p.poly([[20, 20], [560, 20], [560, 390], [20, 390]], "#f6f3eb", 10);
  txt(p.g, "ШАХМАТ ЖӘНЕ БИДАЙ АҢЫЗЫ 🌾", 290, 60, 26, "#2c3a63", 0, 900);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      p.poly(
        [[50 + c * 40, 100 + r * 40], [90 + c * 40, 100 + r * 40], [90 + c * 40, 140 + r * 40], [50 + c * 40, 140 + r * 40]],
        (r + c) % 2 === 0 ? "#4a5568" : "#e2e8f0",
        0
      );
    }
  }

  p.poly([[240, 240], [380, 100], [520, 240]], GOLD, 6);
  txt(p.g, "18 КВИНТИЛЛИОН ДӘН!", 380, 185, 20, "#1a1a24", 0, 900);
  txt(p.g, "ҮНДІ ПАТШАСЫ ТАҚЫРҒА ОТЫРДЫ!", 290, 320, 22, RED, 0, 800);
  txt(p.g, "БҮКІЛ ӘЛЕМДЕ МҰНША БИДАЙ ЖОҚ!", 290, 360, 20, "#444", 0, 800);
};

/** Ambulance & fainting heart attack card */
const ambulanceCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#1c1c24", 10);
  txt(p.g, "ЖЕДЕЛ ЖӘРДЕМ! 🚨 103", 280, 65, 30, RED, 0, 900);
  p.stroke([[50, 190], [180, 190], [210, 120], [240, 260], [270, 160], [300, 210], [330, 190], [500, 190]], 10, "#ff4444");
  txt(p.g, "💔 ЖҮРЕК ҰСТАП ҚАЛДЫ!", 280, 265, 32, GOLD, 0, 900);
  txt(p.g, "«1 МИЛЛИАРДТЫ ЖІБЕРІП АЛДЫМ!»", 280, 330, 24, "#ffffff", 0, 800);
};

/** Homework x2 card */
const homeworkCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#faf9f4", 10);
  txt(p.g, "САБАҚТЫ ОҚЫМАЙ КӨР! 😈", 280, 65, 26, "#1a1a24", 0, 900);
  p.poly([[60, 110], [490, 110], [490, 280], [60, 280]], "#fff0f0", 8);
  txt(p.g, "ҮЙ ТАПСЫРМАСЫ", 275, 155, 32, RED, 0, 900);
  txt(p.g, "× 2 ЕСЕЛЕНЕДІ!", 275, 215, 48, RED, 0, 900);
  txt(p.g, "1 бет ➔ 2 бет ➔ 4 бет ➔ 8 бет...", 275, 255, 22, "#555", 0, 800);
  txt(p.g, "ЭКСПОНЕНЦИАЛДЫ ЖАЗА! 📝", 280, 335, 24, "#2c3a63", 0, 900);
};

const qmark = (p: Pen) => {
  txt(p.g, "???", 100, 120, 95, GOLD, 8);
};

// ---------------- Staging ----------------
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  const k = s.key;
  const t = f / FPS;
  setLight(s.light, cam);
  const A = shotStart;

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
          ? "dazed"
          : "neutral"
        : i % 3 === 0
        ? "grin"
        : "neutral";
    for (const [w, x, r] of EXTRAS) seat(w, [x, SEAT_Y, ROWZ[r]], face(w.i));
    if (!skip.includes("tom")) seat(W_TOM, TOM, mood === "laugh" ? "grin" : face(2));
    if (!skip.includes("nur")) seat(W_NUR, NUR, face(4));
    if (!skip.includes("san")) seat(W_SAN, SAN, face(3), { prop: "phone" });
    if (!skip.includes("ali")) seat(W_ALI, ALI, mood === "laugh" ? "grin" : face(1));
  };

  switch (k) {
    case "sh01": {
      const turn = 20;
      out.places.push(
        f < turn
          ? barys(cam, T_BOARD, {}, f, true)
          : barys(cam, T_BOARD, { expr: lsay("t1", "smug"), facing: 1, arms: ["hang", "point"], tail: -1 }, f)
      );
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      break;
    }
    case "sh02": {
      klass("ooh", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u1", "laugh", "grin"), wave: 0.5 + 0.3 * Math.sin(t * 8) }, true);
      burst(NUR_UP[0] + 0.32, 1.55, NUR_UP[2], A("sh02") + 2, 0.85, 10);
      const kk = pop(A("sh02") + 2);
      fx("gelikDoner", 540, 380, gelikDonerCard, NUR_UP[0] - 0.42, 1.36, NUR_UP[2] - 0.2, 0.36 * kk, 0.26 * kk);
      break;
    }
    case "sh03": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t2", "proud"), facing: 1, arms: ["hang", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("ooh");
      burst(EQ_X, 1.55, -3.9, A("sh03") + 2, 0.85, 10, "#e2483d");
      const kk = pop(A("sh03") + 2);
      fx("shockBillion", 540, 380, shockBillionCard, EQ_X, 1.55, -3.5, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh04": {
      klass("calm", ["nur"]);
      seat(W_NUR, NUR, say("u2", "shock", "shock"));
      fx("qm", 200, 260, qmark, NUR[0] + 0.2, 1.38, NUR[2], 0.16, 0.2);
      break;
    }
    case "sh05": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t3", "proud"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      break;
    }
    case "sh06": {
      klass("laugh", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u3", "laugh", "grin") }, true);
      break;
    }
    case "sh07": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t4", "proud"), facing: 1, arms: ["present", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("ooh");
      burst(T_BOARD[0], 1.6, T_BOARD[2], A("sh07") + 2, 1.0, 12, GOLD);
      break;
    }
    case "sh08": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "proud"), facing: 1, arms: ["present", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      const kk = pop(A("sh08") + 2);
      fx("chessWheat", 560, 390, chessWheatCard, EQ_X + 0.3, 1.5, -3.4, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh09": {
      klass("ooh", ["nur"]);
      seat(W_NUR, NUR, say("u4", "shock", "shock"));
      const kk = pop(A("sh09") + 2);
      fx("ambulance", 540, 380, ambulanceCard, NUR[0] - 0.25, 1.4, NUR[2] - 0.2, 0.38 * kk, 0.26 * kk);
      break;
    }
    case "sh10": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t6", "proud"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      const kk = pop(A("sh10") + 2);
      fx("homework", 540, 380, homeworkCard, EQ_X, 1.55, -3.4, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh11": {
      klass("calm", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: "shock" }, true);
      break;
    }
  }

  return out;
};
