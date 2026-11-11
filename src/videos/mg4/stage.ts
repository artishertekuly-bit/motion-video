// «Барыс ағай» Анонс: «ЖИ Видео Курсы (Телеграм)»:
// Staging of the cast (Barys + pupils) and the 3D effect cards:
// - sh01: Nurlybek's panic laptop card («ERROR 99% 💥»)
// - sh02: AI Bot card («🤖 AI ЖАСАНДЫ ИНТЕЛЛЕКТ»)
// - sh03: 3 Feature cards (3D Анимация, Дауыс, Сценарий)
// - sh04: Masterclass Course card («🚀 AI ВИДЕО КУРСЫ: МИЛЛИОН ҚАРАЛЫМ»)
// - sh05: Telegram launch card («✈️ ТЕЛЕГРАМ: БАРЛЫҚ ПРОМПТТАР»)
// - sh06: Nurlybek excited jump
// - sh07: Final invitation with phone card & Telegram CTA
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

const RED = "#e53e3e", GRN = "#38a169", GOLD = "#f6ad55", BLUE = "#3182ce", CYAN = "#00b4d8", DARK = "#1a202c";

/** sh01: Laptop Panic / Render Error card (520 x 400) */
const laptopPanicCard = (p: Pen) => {
  p.poly([[15, 15], [505, 15], [505, 385], [15, 385]], "#fff5f5", 10);
  p.g.strokeStyle = RED;
  p.g.lineWidth = 6;
  p.g.strokeRect(25, 25, 470, 350);

  txt(p.g, "⚠ РЕНДЕР ҚАТЕСІ!", 260, 70, 36, RED, 0, 900);
  txt(p.g, "10 ЖЫЛ ОҚУ КЕРЕК ПЕ?!", 260, 130, 28, DARK, 0, 800);

  // Big warning icon
  p.g.fillStyle = RED;
  p.g.beginPath();
  p.g.arc(260, 220, 50, 0, Math.PI * 2);
  p.g.fill();
  txt(p.g, "!", 260, 220, 60, "#ffffff", 0, 900);

  txt(p.g, "ҚЫМБАТ КОМПЬЮТЕР КЕРЕК ПЕ?", 260, 320, 24, "#742a2a", 0, 800);
};

/** sh02: AI Bot Card (480 x 360) */
const aiBotCard = (p: Pen) => {
  p.poly([[15, 15], [465, 15], [465, 345], [15, 345]], "#ebf8ff", 10);
  p.g.strokeStyle = CYAN;
  p.g.lineWidth = 6;
  p.g.strokeRect(25, 25, 430, 310);

  txt(p.g, "🤖 ЖАСАНДЫ ИНТЕЛЛЕКТ", 240, 75, 30, BLUE, 0, 900);
  txt(p.g, "БӘРІН ӨЗІ ЖАСАЙДЫ!", 240, 135, 26, GRN, 0, 800);

  // Robot head graphic
  p.poly([[160, 180], [320, 180], [320, 290], [160, 290]], "#3182ce", 6);
  p.g.fillStyle = "#90cdf4";
  p.g.beginPath();
  p.g.arc(200, 225, 18, 0, Math.PI * 2);
  p.g.arc(280, 225, 18, 0, Math.PI * 2);
  p.g.fill();

  // Smile
  p.g.strokeStyle = "#ffffff";
  p.g.lineWidth = 6;
  p.g.beginPath();
  p.g.arc(240, 250, 25, 0.2, Math.PI - 0.2);
  p.g.stroke();
};

/** sh03: 3 Feature cards */
const featureCard1 = (p: Pen) => {
  p.poly([[10, 10], [450, 10], [450, 230], [10, 230]], "#fffff0", 8);
  p.g.strokeStyle = GOLD;
  p.g.lineWidth = 5;
  p.g.strokeRect(18, 18, 424, 204);
  txt(p.g, "🎬 3D АНИМАЦИЯ", 230, 65, 32, "#b7791f", 0, 900);
  txt(p.g, "0 ТӘЖІРИБЕ ЖӘНЕ ТЕЗ", 230, 125, 24, DARK, 0, 800);
  txt(p.g, "Сурет салудың қажеті жоқ!", 230, 175, 20, "#744210", 0, 700);
};

const featureCard2 = (p: Pen) => {
  p.poly([[10, 10], [450, 10], [450, 230], [10, 230]], "#f0fff4", 8);
  p.g.strokeStyle = GRN;
  p.g.lineWidth = 5;
  p.g.strokeRect(18, 18, 424, 204);
  txt(p.g, "🎙️ ДАУЫС ЖӘНЕ ДУБЛЯЖ", 230, 65, 28, GRN, 0, 900);
  txt(p.g, "1 КЛИКПЕН СТУДИЯ САПАСЫ", 230, 125, 23, DARK, 0, 800);
  txt(p.g, "Кез келген тілде дыбыстау!", 230, 175, 20, "#22543d", 0, 700);
};

const featureCard3 = (p: Pen) => {
  p.poly([[10, 10], [450, 10], [450, 230], [10, 230]], "#e6fffa", 8);
  p.g.strokeStyle = CYAN;
  p.g.lineWidth = 5;
  p.g.strokeRect(18, 18, 424, 204);
  txt(p.g, "⚡ СЦЕНАРИЙ 2 МИНУТТА", 230, 65, 28, "#285e61", 0, 900);
  txt(p.g, "ВИРУСТЫҚ ИДЕЯЛАР", 230, 125, 24, DARK, 0, 800);
  txt(p.g, "Трендтерді автоматты табады!", 230, 175, 20, "#234e52", 0, 700);
};

/** sh04: Masterclass Course Card (560 x 380) */
const courseCard = (p: Pen) => {
  p.poly([[15, 15], [545, 15], [545, 365], [15, 365]], "#1a202c", 10);
  p.g.strokeStyle = GOLD;
  p.g.lineWidth = 6;
  p.g.strokeRect(25, 25, 510, 330);

  txt(p.g, "🚀 АВТОРЛЫҚ КУРС", 280, 70, 36, GOLD, 0, 900);
  txt(p.g, "ЖАСАНДЫ ИНТЕЛЛЕКТ АРҚЫЛЫ ВИДЕО", 280, 125, 22, "#ffffff", 0, 800);

  // Badge
  p.poly([[60, 170], [500, 170], [500, 255], [60, 255]], "#2d3748", 6);
  txt(p.g, "1 000 000+ ҚАРАЛЫМ", 280, 212, 34, "#68d391", 0, 900);

  txt(p.g, "💰 НӨЛДЕН БАСТАП ТАБЫСҚА ЖЕТУ", 280, 305, 23, GOLD, 0, 800);
};

/** sh05: Telegram Announcement Card (540 x 380) */
const telegramCard = (p: Pen) => {
  p.poly([[15, 15], [525, 15], [525, 365], [15, 365]], "#0088cc", 10);
  p.g.strokeStyle = "#ffffff";
  p.g.lineWidth = 6;
  p.g.strokeRect(25, 25, 490, 330);

  txt(p.g, "✈️ ТЕЛЕГРАМ КАНАЛ", 270, 70, 38, "#ffffff", 0, 900);
  txt(p.g, "БАРЛЫҚ МАТЕРИАЛДАР ОСЫНДА!", 270, 125, 24, "#e0f2fe", 0, 800);

  p.poly([[50, 165], [490, 165], [490, 260], [50, 260]], "#ffffff", 8);
  txt(p.g, "✦ ДАЙЫН ПРОМПТТАР", 270, 195, 22, "#0088cc", 0, 900);
  txt(p.g, "✦ ҚАДАМДЫҚ САБАҚТАР", 270, 232, 22, "#0088cc", 0, 900);

  txt(p.g, "СІЛТЕМЕ ПРОФИЛЬДЕ! 👆", 270, 310, 28, GOLD, 0, 900);
};

/** sh07: Smartphone Card showing Telegram CTA (360 x 540) */
const phoneCard = (p: Pen) => {
  p.poly([[20, 20], [340, 20], [340, 520], [20, 520]], "#111827", 14);
  p.poly([[35, 40], [325, 40], [325, 500], [35, 500]], "#f3f4f6", 8);

  txt(p.g, "TELEGRAM", 180, 75, 22, "#0088cc", 0, 900);
  txt(p.g, "БАСТЫ ЖАҢАЛЫҚ!", 180, 120, 24, DARK, 0, 900);

  // Big Blue Button
  p.poly([[55, 160], [305, 160], [305, 230], [55, 230]], "#0088cc", 8);
  txt(p.g, "КАНАЛҒА ҚОСЫЛУ", 180, 195, 20, "#ffffff", 0, 900);

  txt(p.g, "ТЕГІН ҚАТЫСУ!", 180, 280, 22, GRN, 0, 900);
  txt(p.g, "Алғашқы сабақты жіберіп алма!", 180, 330, 16, "#4b5563", 0, 700);

  p.poly([[55, 380], [305, 380], [305, 460], [55, 460]], "#fef3c7", 8);
  txt(p.g, "СІЛТЕМЕ ШАПКАДА 👆", 180, 420, 19, "#b45309", 0, 900);
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
    if (!skip.includes("tom")) seat(W_TOM, TOM, face(2));
    if (!skip.includes("nur")) seat(W_NUR, NUR, face(4));
    if (!skip.includes("san")) seat(W_SAN, SAN, face(3));
    if (!skip.includes("ali")) seat(W_ALI, ALI, face(1));
  };

  switch (k) {
    case "sh01": {
      // Nurlybek panicking at desk
      klass("calm", ["nur"]);
      seat(W_NUR, NUR, say("u1", "shock", "pained"));
      out.places.push(barys(cam, T_BOARD, { expr: "smug", facing: 1, arms: ["hang", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);

      // Laptop panic card
      const kk = pop(A("sh01") + 2);
      fx("laptopPanic", 520, 400, laptopPanicCard, NUR[0] - 0.38, 1.35, NUR[2] - 0.2, 0.35 * kk, 0.27 * kk);
      break;
    }
    case "sh02": {
      // Barys smirks at board: «Бүгінде мұның бәрін ЖИ жасайды!»
      klass("ooh");
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t1", "smug"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);

      burst(T_BOARD[0] + 0.5, 1.5, T_BOARD[2], A("sh02") + 2, 0.9, 10, "#00b4d8");
      const kk = pop(A("sh02") + 2);
      fx("aiBot", 480, 360, aiBotCard, T_BOARD[0] + 0.52, 1.48, T_BOARD[2] + 0.1, 0.36 * kk, 0.27 * kk);
      break;
    }
    case "sh03": {
      // 3 Feature Cards float around Barys
      klass("calm");
      out.places.push(barys(cam, [-0.75, 0, -3.2], { expr: lsay("t2", "proud"), facing: 1, arms: ["present", "present"], tail: -1 }, f));
      blob(out, -0.75, 0, -3.2, 1.1);

      const a0 = A("sh03");
      const k1 = pop(a0 + 2);
      const k2 = pop(a0 + 24);
      const k3 = pop(a0 + 46);

      fx("feat1", 460, 240, featureCard1, -1.35, 1.55, -2.9, 0.36 * k1, 0.19 * k1);
      fx("feat2", 460, 240, featureCard2, -0.15, 1.55, -2.9, 0.36 * k2, 0.19 * k2);
      fx("feat3", 460, 240, featureCard3, -0.75, 1.88, -2.9, 0.36 * k3, 0.19 * k3);
      break;
    }
    case "sh04": {
      // Masterclass Course Card
      klass("think");
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t3", "joy"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);

      burst(T_BOARD[0] + 0.6, 1.5, T_BOARD[2], A("sh04") + 2, 1.0, 10, "#f6ad55");
      const kk = pop(A("sh04") + 2);
      fx("courseCard", 560, 380, courseCard, T_BOARD[0] + 0.62, 1.48, T_BOARD[2] + 0.1, 0.42 * kk, 0.28 * kk);
      break;
    }
    case "sh05": {
      // Telegram Launch Announcement
      klass("ooh");
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t4", "proud"), facing: 1, arms: ["present", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);

      burst(T_BOARD[0] + 0.55, 1.5, T_BOARD[2], A("sh05") + 2, 1.0, 10, "#0088cc");
      const kk = pop(A("sh05") + 2);
      fx("tgCard", 540, 380, telegramCard, T_BOARD[0] + 0.58, 1.48, T_BOARD[2] + 0.1, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh06": {
      // Nurlybek jumps up
      klass("calm", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u2", "laugh", "grin"), wave: 0.8 + 0.2 * Math.sin(t * 12) }, true);
      burst(NUR_UP[0] + 0.2, 1.6, NUR_UP[2], A("sh06") + 2, 0.85, 10);
      fx("qm", 200, 260, qmark, NUR_UP[0] - 0.25, 1.45, NUR_UP[2], 0.15, 0.2);
      break;
    }
    case "sh07": {
      // Final CTA & phone card
      klass("laugh");
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "smile"), facing: 1, arms: ["point", "present"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);

      const kk = pop(A("sh07") + 2);
      fx("phoneCard", 360, 540, phoneCard, T_BOARD[0] + 0.52, 1.45, T_BOARD[2] + 0.1, 0.28 * kk, 0.42 * kk);

      // Sparkle stars
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + t * 1.5;
        const r = 0.45;
        const sc = pop(A("sh07") + 4 + i * 2);
        fx(`star${i}`, 256, 256, (p) => star(p, 1, i % 2 ? "#38a169" : "#ffd84a"), T_BOARD[0] + 0.52 + r * Math.cos(a), 1.45 + 0.3 * Math.sin(a), T_BOARD[2], 0.12 * sc, 0.12 * sc);
      }
      break;
    }
  }
  return out;
};
