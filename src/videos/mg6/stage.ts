// «Барыс ағай» 6-сабақ: «Троя аты: 10 жылдық қамалды 1 сыйлық қалай құлатты?»
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

const RED = "#d8332c", GOLD = "#f4b825", CYAN = "#38bdf8";

/** Drones & Cannons guess card (Nurlybek) */
const droneCannonCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#181a24", 10);
  txt(p.g, "НҰРЛЫБЕКТІҢ БОЛЖАМЫ 🚀", 280, 60, 28, GOLD, 0, 900);

  // Drone drawing
  p.poly([[120, 140], [240, 140], [250, 180], [110, 180]], "#334155", 6);
  txt(p.g, "ДРОНДАР & ЛАЗЕР!", 180, 215, 20, CYAN, 0, 800);

  // Cannon
  p.poly([[330, 220], [470, 150], [490, 180], [350, 250]], "#475569", 8);
  p.g.fillStyle = "#1e293b";
  p.g.beginPath(); p.g.arc(340, 250, 26, 0, 7); p.g.fill();
  txt(p.g, "ЗЕҢБІРЕК!", 420, 230, 22, RED, 0, 900);

  txt(p.g, "«ҚАБЫРҒАНЫ АТҚАН!»", 280, 335, 26, "#fff", 0, 900);
};

/** Giant Wooden Trojan Horse Card */
const trojanHorseCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#2b1e16", 10);
  txt(p.g, "АЛЫП ТРОЯ АТЫ 🐴🎁", 285, 60, 28, GOLD, 0, 900);

  // Wooden horse body
  p.poly([[160, 140], [340, 140], [350, 240], [180, 240]], "#b45309", 8);
  // Neck & head
  p.poly([[320, 140], [370, 80], [420, 100], [380, 170]], "#92400e", 8);
  // Legs & wheels
  p.poly([[190, 240], [190, 290], [220, 290], [220, 240]], "#78350f", 6);
  p.poly([[310, 240], [310, 290], [340, 290], [340, 240]], "#78350f", 6);
  p.g.fillStyle = "#451a03";
  p.g.beginPath(); p.g.arc(205, 305, 18, 0, 7); p.g.fill();
  p.g.beginPath(); p.g.arc(325, 305, 18, 0, 7); p.g.fill();

  // Big Gift Bow
  txt(p.g, "🎀 ТЕГІН СЫЙЛЫҚ!", 285, 190, 30, RED, 2, 900);
  txt(p.g, "3200 ЖЫЛ БҰРЫНҒЫ АЙЛА", 285, 340, 22, "#fde68a", 0, 800);
};

/** Selfie & Free toy (Nurlybek) */
const selfieHorseCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#1e293b", 10);
  txt(p.g, "ТЕГІН ОЙЫНШЫҚ & ХАЙП! 😎", 280, 60, 26, GOLD, 0, 900);
  txt(p.g, "📸 СЕЛФИ ЖАСАЙМЫН!", 280, 160, 36, CYAN, 0, 900);
  txt(p.g, "ҮСТІНЕ МІНІП ТРЕНДКЕ КІРЕМІН!", 280, 240, 24, "#fff", 0, 800);
  txt(p.g, "«Кім тегін сыйлықтан қашады?!»", 280, 325, 22, GOLD, 0, 800);
};

/** Trojan Party & Sleep */
const partyTrojanCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#31103f", 10);
  txt(p.g, "ТРОЯЛЫҚТАРДЫҢ ТОЙЫ 🎉", 280, 65, 28, GOLD, 0, 900);
  txt(p.g, "БҮКІЛ ҚАЛА МӘЗ БОЛДЫ!", 280, 165, 32, "#f472b6", 0, 900);
  txt(p.g, "ТОЙЛАП ҰЙЫҚТАП ҚАЛДЫ... 😴", 280, 255, 30, CYAN, 0, 900);
  txt(p.g, "Z z z . . .", 280, 335, 36, "#fff", 0, 900);
};

/** Night Ambush & Greek Soldiers */
const nightAmbushCard = (p: Pen) => {
  p.poly([[20, 20], [550, 20], [550, 380], [20, 380]], "#1f0a0c", 12);
  txt(p.g, "ТҮНГІ ШАБУЫЛ! ⚔️💥", 285, 65, 32, RED, 0, 900);
  txt(p.g, "АТТЫҢ ІШІНЕН ӘСКЕР ШЫҚТЫ!", 285, 165, 30, GOLD, 0, 900);
  txt(p.g, "ҚАҚПА ІШТЕН АШЫЛДЫ!", 285, 250, 32, RED, 0, 900);
  txt(p.g, "10 ЖЫЛДЫҚ ҚАМАЛ ҚҰЛАДЫ!", 285, 335, 24, "#fff", 0, 800);
};

/** Trojan Virus Alert (Cyber warning) */
const trojanVirusCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#180f12", 10);
  txt(p.g, "⚠️ ТРОЯН ВИРУСЫ! ⚠️", 280, 65, 30, RED, 0, 900);
  txt(p.g, "TROJAN VIRUS DETECTED!", 280, 165, 32, GOLD, 0, 900);
  txt(p.g, "СЫЙЛЫҚ БОЛЫП КӨРІНЕТІН АЛДАУ!", 280, 250, 24, "#fff", 0, 800);
  txt(p.g, "ІШІНДЕ ҚАУІП ТЫҒЫЛҒАН!", 280, 325, 24, RED, 0, 800);
};

/** Phishing SMS: You won 1 million */
const phishingSmsCard = (p: Pen) => {
  p.poly([[20, 20], [540, 20], [540, 380], [20, 380]], "#0f172a", 10);
  txt(p.g, "КЕЛГЕН ХАБАРЛАМА 📩", 280, 60, 26, CYAN, 0, 900);

  // SMS chat bubble
  p.poly([[40, 110], [520, 110], [520, 250], [40, 250]], "#1e293b", 8);
  txt(p.g, "🎉 СІЗ 1 000 000 ₸ ҰТТЫҢЫЗ!", 280, 155, 26, GOLD, 0, 900);
  txt(p.g, "Сілтемені басып алыңыз! 👉", 280, 205, 22, "#38bdf8", 0, 800);

  txt(p.g, "«Ағай, бұл да гректер ме?!» 😱", 280, 325, 26, RED, 0, 900);
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
      fx("droneCannon", 540, 380, droneCannonCard, NUR_UP[0] - 0.42, 1.36, NUR_UP[2] - 0.2, 0.36 * kk, 0.26 * kk);
      break;
    }
    case "sh03": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t2", "proud"), facing: 1, arms: ["point", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      const kk = pop(A("sh03") + 2);
      fx("trojanHorse", 550, 380, trojanHorseCard, EQ_X, 1.55, -3.5, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh04": {
      klass("calm", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u2", "laugh", "grin") }, true);
      const kk = pop(A("sh04") + 2);
      fx("selfieHorse", 540, 380, selfieHorseCard, NUR_UP[0] - 0.35, 1.36, NUR_UP[2] - 0.2, 0.36 * kk, 0.26 * kk);
      break;
    }
    case "sh05": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t3", "proud"), facing: 1, arms: ["present", "hip"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("laugh");
      const kk = pop(A("sh05") + 2);
      fx("partyTrojan", 540, 380, partyTrojanCard, EQ_X, 1.55, -3.5, 0.42 * kk, 0.29 * kk);
      break;
    }
    case "sh06": {
      klass("think", ["nur"]);
      seat(W_NUR, NUR, say("u3", "dazed", "neutral"));
      fx("qm", 200, 260, qmark, NUR[0] + 0.2, 1.38, NUR[2], 0.16, 0.2);
      break;
    }
    case "sh07": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t4", "shock"), facing: 1, arms: ["point", "hang"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("ooh");
      burst(T_BOARD[0], 1.6, T_BOARD[2], A("sh07") + 2, 1.0, 12, RED);
      const kk = pop(A("sh07") + 2);
      fx("nightAmbush", 550, 380, nightAmbushCard, EQ_X, 1.55, -3.5, 0.44 * kk, 0.3 * kk);
      break;
    }
    case "sh08": {
      klass("ooh", ["nur"]);
      seat(W_NUR, NUR, say("u4", "shock", "shock"));
      const kk = pop(A("sh08") + 2);
      fx("trojanVirus", 540, 380, trojanVirusCard, NUR[0] - 0.25, 1.4, NUR[2] - 0.2, 0.38 * kk, 0.26 * kk);
      break;
    }
    case "sh09": {
      out.places.push(barys(cam, T_BOARD, { expr: lsay("t5", "proud"), facing: 1, arms: ["present", "point"], tail: -1 }, f));
      blob(out, T_BOARD[0], 0, T_BOARD[2], 1.1);
      klass("think");
      break;
    }
    case "sh10": {
      klass("ooh", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: say("u5", "shock", "shock") }, true);
      const kk = pop(A("sh10") + 2);
      fx("phishingSms", 540, 380, phishingSmsCard, NUR_UP[0] - 0.35, 1.36, NUR_UP[2] - 0.2, 0.36 * kk, 0.26 * kk);
      break;
    }
    case "sh11": {
      klass("calm", ["nur"]);
      kid(W_NUR, NUR_UP, { mode: "stand", expr: "grin" }, true);
      break;
    }
  }

  return out;
};
