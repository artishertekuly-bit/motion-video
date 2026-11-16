// «Барыс ағай» 7-сабақ: «Ата-ананың сенімі: Қанат па, әлде ауыр жүк пе?»
// Staging of cast & effect cards
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { leopardFront, leopardBack, LeoOpts, LExpr } from "./leopard";
import { FPS, clamp01, SHOTS, T_BOARD, NUR, NUR_UP, ROWZ, SEAT_Y, V3, ALI, TOM, SAN } from "./story";
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

const RED = "#d8332c", GOLD = "#f4b825", CYAN = "#38bdf8", GREEN = "#22c55e", ORANGE = "#f97316";

/** 1. Trust Wings vs Scales Card (sh01) */
const trustWingsCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#181a24", 10);
  txt(p.g, "АТА-АНАНЫҢ СЕНІМІ 🕊️⚖️", 280, 60, 28, GOLD, 0, 900);
  txt(p.g, "ҚАНАТ ПА, ӘЛДЕ ЖҮК ПЕ?", 280, 130, 26, CYAN, 0, 800);
  txt(p.g, "«Адамды биікке самғататын", 280, 220, 24, "#ffffff", 0, 700);
  txt(p.g, "ең алып күш қандай?»", 280, 270, 26, GOLD, 0, 900);
  txt(p.g, "— Барыс ағайдың сұрағы", 280, 335, 20, "#94a3b8", 0, 600);
};

/** 2. Nurlybek's Answer: Wi-Fi, iPhone & Angry Mom (sh02) */
const wifiIphoneMomCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#1e293b", 10);
  txt(p.g, "НҰРЛЫБЕКТІҢ ҮЛКЕН КҮШІ ⚡", 280, 55, 26, GOLD, 0, 900);
  txt(p.g, "📶 ЖЫЛДАМ WI-FI 5G!", 280, 130, 28, CYAN, 0, 900);
  txt(p.g, "📱 IPHONE 16 PRO MAX!", 280, 200, 28, GREEN, 0, 900);
  txt(p.g, "😤 АНАМНЫҢ АШУЫ!", 280, 275, 30, RED, 0, 900);
  txt(p.g, "«Ең қорқынышты күш осы ғой!»", 280, 340, 22, "#fde68a", 0, 800);
};

/** 3. Pure Trust Definition (sh03) */
const pureTrustCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#2e1a47", 10);
  txt(p.g, "КІРШІКСІЗ СЕНІМ ✨", 285, 60, 30, GOLD, 0, 900);
  txt(p.g, "«Адамды тұлға ететін", 285, 150, 28, "#ffffff", 0, 800);
  txt(p.g, "ең ұлы қозғаушы күш!»", 285, 205, 30, CYAN, 0, 900);
  txt(p.g, "Жай сезім емес — қуат көзі! 🔋", 285, 285, 24, GREEN, 0, 800);
  txt(p.g, "❤️ АТА-АНА ҮМІТІ", 285, 340, 22, GOLD, 0, 800);
};

/** 4. Study Demands & Nagging (sh04) */
const studyNaggingCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#331818", 10);
  txt(p.g, "ТАЛАП ПЕН МАЗАЛАУ? 📚", 280, 60, 28, RED, 0, 900);
  txt(p.g, "«Үнемі сабақ оқы дейді...»", 280, 150, 26, "#ffffff", 0, 800);
  txt(p.g, "«Жақсы бол деп мазаны алады...»", 280, 220, 24, "#fca5a5", 0, 800);
  txt(p.g, "Нұрлыбектің күмәні: жүк пе? 🤔", 280, 310, 24, GOLD, 0, 800);
};

/** 5. Pygmalion Effect Card (sh05) */
const pygmalionCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#0f231c", 10);
  txt(p.g, "ПИГМАЛИОН ЭФФЕКТІСІ 🧬", 285, 60, 28, GREEN, 0, 900);
  txt(p.g, "СЕНІМ БЕРСЕ ➔ ТАУ ҚОПАРАДЫ! 🚀", 285, 145, 25, CYAN, 0, 900);
  txt(p.g, "«Сенен түк шықпайды десе —", 285, 230, 24, "#fca5a5", 0, 700);
  txt(p.g, "қанаты бірден сынады!» 💔", 285, 280, 26, RED, 0, 900);
  txt(p.g, "Ата-ана көзіндегі әлеует 🌟", 285, 340, 22, GOLD, 0, 800);
};

/** 6. Touching Story: Dad's Trust (sh06) */
const dadTrustCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#1e1b4b", 10);
  txt(p.g, "ӘКЕНІҢ ЖЫЛЫ СӨЗІ ❤️", 285, 60, 28, GOLD, 0, 900);
  txt(p.g, "МАТЕМАТИКАДАН 2 АЛҒАНДА: 📉", 285, 130, 24, RED, 0, 800);
  txt(p.g, "«Балам, мен саған сенемін,", 285, 205, 28, "#ffffff", 0, 900);
  txt(p.g, "сен бұны жеңесің!» 👨‍👦", 285, 255, 30, CYAN, 0, 900);
  txt(p.g, "«Сол сәтте ұяттан жерге кірдім...»", 285, 335, 22, "#cbd5e1", 0, 700);
};

/** 7. Trust Capital & Responsibility (sh07) */
const trustCapitalCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#2b2111", 10);
  txt(p.g, "СЕНІМ = ӨМІРЛІК КАПИТАЛ 🪙", 280, 60, 26, GOLD, 0, 900);
  txt(p.g, "Ұрыстан 10 есе салмақты! ⚖️", 280, 145, 28, ORANGE, 0, 900);
  txt(p.g, "«Несиеге берілген байлық»", 280, 225, 26, "#ffffff", 0, 800);
  txt(p.g, "Оны жоғалтсаң — өзіңді жоғалтасың!", 280, 300, 24, RED, 0, 800);
  txt(p.g, "Жауапкершіліктің биік шыңы", 280, 345, 20, "#94a3b8", 0, 600);
};

/** 8. Cracked Glass / Fear of Losing Trust (sh08) */
const crackedGlassCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#18181b", 10);
  txt(p.g, "СЕНІМГЕ СЫЗАТ ТҮССЕ? 🪞⚡", 280, 60, 28, RED, 0, 900);
  txt(p.g, "«Қателесіп қалсақ ше?»", 280, 150, 28, "#ffffff", 0, 800);
  txt(p.g, "«Қайта қалпына келе ме?»", 280, 225, 28, CYAN, 0, 900);
  txt(p.g, "Нұрлыбектің шын жүректен сұрағы", 280, 320, 22, GOLD, 0, 700);
};

/** 9. Kintsugi / Healing Trust with Honesty (sh09) */
const kintsugiCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#1c1917", 10);
  txt(p.g, "СЕНІМ — ХРУСТАЛЬ АЙНА 🪞", 285, 60, 26, CYAN, 0, 900);
  txt(p.g, "ҚАЙТА ҚАЛПЫНА КЕЛТІРУ ЖОЛЫ: ✨", 285, 130, 22, GOLD, 0, 800);
  txt(p.g, "1. Шынайы өкініш 🥺", 285, 185, 24, "#ffffff", 0, 800);
  txt(p.g, "2. Табанды еңбек 🛠️", 285, 235, 24, GREEN, 0, 800);
  txt(p.g, "3. Адалдық пен шындық 🛡️", 285, 285, 24, CYAN, 0, 800);
  txt(p.g, "БАСТЫСЫ — ӨТІРІК АЙТПАУ! 🚫", 285, 345, 24, RED, 0, 900);
};

/** 10. Hug Parents & Make Promises (sh10) */
const hugParentsCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#3b0764", 10);
  txt(p.g, "ҮМІТТІ АҚТАУ ШЕШІМІ! ❤️", 280, 60, 28, GOLD, 0, 900);
  txt(p.g, "«Үйге барып құшақтаймын!» 🫂", 280, 150, 30, "#f472b6", 0, 900);
  txt(p.g, "«Рақмет айтып, үміттерін", 280, 230, 26, "#ffffff", 0, 800);
  txt(p.g, "міндетті түрде ақтаймын!» 🌟", 280, 280, 28, GREEN, 0, 900);
  txt(p.g, "Нұрлыбектің жүрекжарды уәдесі", 280, 340, 20, "#e9d5ff", 0, 600);
};

/** 11. Wings on your back (sh11) */
const wingsSoarCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#0c2738", 10);
  txt(p.g, "АРҚАҢДАҒЫ ҚОС ҚАНАТЫҢ 🕊️🦅", 285, 60, 26, GOLD, 0, 900);
  txt(p.g, "АТА-АНА СЕНІМІ = ҚАНАТ!", 285, 140, 30, CYAN, 0, 900);
  txt(p.g, "«Сол қанатпен биікке самғап,", 285, 220, 26, "#ffffff", 0, 800);
  txt(p.g, "олардың мақтанышы бол!» 🎓", 285, 270, 28, GREEN, 0, 900);
  txt(p.g, "Әр баланың ең асыл борышы ✨", 285, 340, 22, GOLD, 0, 800);
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
      fx("card_w1", 560, 400, trustWingsCard, -0.4, 2.3, -3.2, 1.45 * pop(A("sh01") + 5), 1.05 * pop(A("sh01") + 5));
      break;
    }
    case "sh02": {
      klass("laugh", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u1", "laugh", "grin"), wave: 0.5 + 0.3 * Math.sin(t * 8) }, true);
      fx("card_wifi", 560, 400, wifiIphoneMomCard, 1.85, 1.95, -0.1, 1.45 * pop(A("sh02") + 6), 1.05 * pop(A("sh02") + 6));
      burst(1.85, 2.0, -0.1, A("sh02") + 6, 1.2, 12, GOLD);
      break;
    }
    case "sh03": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t2", "smug"), facing: 1, arms: ["hang", "point"], tail: 1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("calm");
      fx("card_pure", 570, 400, pureTrustCard, -0.3, 2.35, -3.2, 1.45 * pop(A("sh03") + 5), 1.05 * pop(A("sh03") + 5));
      burst(-0.3, 2.35, -3.2, A("sh03") + 6, 1.3, 14, CYAN);
      break;
    }
    case "sh04": {
      klass("think", ["nur"]);
      kid(W_NUR, NUR, { mode: "sit", expr: say("u2", "dazed", "neutral"), prop: "book" }, true);
      fx("card_nag", 560, 400, studyNaggingCard, 1.75, 1.85, ROWZ[0] - 0.2, 1.4 * pop(A("sh04") + 5), 1.0 * pop(A("sh04") + 5));
      break;
    }
    case "sh05": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t3", "idea"), facing: 1, arms: ["point", "hang"], tail: 1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      fx("card_pyg", 570, 400, pygmalionCard, -0.35, 2.35, -3.2, 1.5 * pop(A("sh05") + 6), 1.08 * pop(A("sh05") + 6));
      burst(-0.35, 2.35, -3.2, A("sh05") + 7, 1.4, 14, GREEN);
      break;
    }
    case "sh06": {
      klass("think", ["nur"]);
      kid(W_NUR, NUR, { mode: "sit", expr: say("u3", "dazed", "neutral") }, true);
      fx("card_dad", 570, 400, dadTrustCard, 1.75, 1.85, ROWZ[0] - 0.2, 1.45 * pop(A("sh06") + 6), 1.05 * pop(A("sh06") + 6));
      burst(1.75, 1.85, ROWZ[0] - 0.2, A("sh06") + 7, 1.3, 12, GOLD);
      break;
    }
    case "sh07": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t4", "smug"), facing: 1, arms: ["hang", "point"], tail: 1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("calm");
      fx("card_cap", 560, 400, trustCapitalCard, -0.4, 2.35, -3.2, 1.45 * pop(A("sh07") + 6), 1.05 * pop(A("sh07") + 6));
      burst(-0.4, 2.35, -3.2, A("sh07") + 7, 1.3, 12, GOLD);
      break;
    }
    case "sh08": {
      klass("think", ["nur"]);
      kid(W_NUR, NUR, { mode: "sit", expr: say("u4", "shock", "dazed") }, true);
      fx("card_crack", 560, 400, crackedGlassCard, 1.75, 1.85, ROWZ[0] - 0.2, 1.4 * pop(A("sh08") + 5), 1.0 * pop(A("sh08") + 5));
      break;
    }
    case "sh09": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "idea"), facing: 1, arms: ["point", "hang"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("calm");
      fx("card_kint", 570, 400, kintsugiCard, -0.35, 2.35, -3.2, 1.5 * pop(A("sh09") + 6), 1.08 * pop(A("sh09") + 6));
      burst(-0.35, 2.35, -3.2, A("sh09") + 7, 1.4, 14, CYAN);
      break;
    }
    case "sh10": {
      klass("calm", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u5", "grin", "smile"), wave: 0.3 * Math.sin(t * 6) }, true);
      fx("card_hug", 560, 400, hugParentsCard, 1.85, 1.95, -0.1, 1.45 * pop(A("sh10") + 5), 1.05 * pop(A("sh10") + 5));
      burst(1.85, 1.95, -0.1, A("sh10") + 6, 1.3, 12, "#f472b6");
      break;
    }
    case "sh11": {
      out.places.push(barys(cam, [-0.65, 0, -3.0], { expr: lsay("t6", "smile"), facing: 1, arms: ["point", "hang"], tail: 1 }, f));
      blob(out, -0.65, 0, -3.0, 1.1);
      kid(W_NUR, [0.45, 0, -3.0], { mode: "stand", expr: "grin" }, true);
      klass("calm", ["nur"]);
      fx("card_soar", 570, 400, wingsSoarCard, -0.1, 2.45, -3.1, 1.5 * pop(A("sh11") + 6), 1.1 * pop(A("sh11") + 6));
      burst(-0.1, 2.45, -3.1, A("sh11") + 7, 1.5, 16, GOLD);
      break;
    }
    case "sh12": {
      // Outro card shot
      out.places.push(barys(cam, [-0.6, 0, -3.0], { expr: lsay("n1", "smile"), facing: 1, arms: ["hang", "point"], tail: 1 }, f));
      kid(W_NUR, [0.5, 0, -3.0], { mode: "stand", expr: "grin", wave: 0.4 + 0.3 * Math.sin(t * 6) }, true);
      blob(out, -0.6, 0, -3.0, 1.1);
      klass("calm", ["nur"]);
      break;
    }
  }

  return out;
};
