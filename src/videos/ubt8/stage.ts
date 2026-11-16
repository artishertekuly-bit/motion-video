// Cast, per-shot staging and custom Canvas2D effect cards for Day 8.
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { FPS, SHOTS, CLASS_POS, CORRIDOR_POS } from "./story";
import { talking, shotStart, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };
export const GULNAR: Outfit = { jacket: "#542b36", dress: "#2d1d24", pants: "#231b20", boots: "#141113", hair: "#261a18", bun: "#261a18", glasses: true, skin: "#f3cfb0", build: "adult" };

const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const G: Who = { i: 3, o: GULNAR, okey: "gulnar" };

/** Strict C-Level Exam test booklet with red crosses and 58/140 score */
const examTest58 = (p: Pen, _t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // White paper with dark blue shadow
  p.poly([[-140, -180], [140, -180], [140, 180], [-140, 180]], "#ffffff", 10);
  p.poly([[-130, -170], [130, -170], [130, 170], [-130, 170]], "#fbfbfe", 0);
  p.stroke([[-140, -180], [-140, 180]], 12, "#a82436"); // Red spine

  g.fillStyle = "#1e2436"; g.font = "900 26px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("ҰБТ: С ДЕҢГЕЙІ", 0, -125);
  g.font = "900 18px Montserrat, sans-serif"; g.fillStyle = "#a82436";
  g.fillText("Бейіндік Физика (Қатал)", 0, -95);

  // Red crosses
  g.fillStyle = "#e2483d"; g.font = "900 24px Montserrat, sans-serif";
  g.fillText("❌ №1 Қате (-2)", -15, -45);
  g.fillText("❌ №2 Қате (-3)", -15, -10);
  g.fillText("❌ №3 Қате (-2)", -15, 25);
  g.fillText("❌ №4 Қате (-3)", -15, 60);

  // Big Red Score
  g.fillStyle = "#e2483d"; g.font = "900 44px Montserrat, sans-serif";
  g.fillText("58 / 140", 0, 120);
  g.font = "900 22px Montserrat, sans-serif";
  g.fillText("ҚАТАЛ САБАҚ 📉", 0, 150);

  g.restore();
};

/** Floating chaotic formulas */
const floatingFormulas = (p: Pen, t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  const formulas = ["ΔU = Q + A", "λ = h / p", "E = h · ν", "? ? ?"];
  for (let i = 0; i < 4; i++) {
    const ang = t * 2.5 + (i * Math.PI) / 2;
    const sx = Math.cos(ang) * 140;
    const sy = Math.sin(ang) * 60;

    g.save(); g.translate(sx, sy);
    p.poly([[-70, -22], [70, -22], [70, 22], [-70, 22]], "#ffffff", 5);
    g.fillStyle = i === 3 ? "#e2483d" : "#1f2a44";
    g.font = "900 20px Montserrat, sans-serif"; g.textAlign = "center";
    g.fillText(formulas[i], 0, 7);
    g.restore();
  }
  g.restore();
};

/** Dark cartoon rain cloud with lightning over slumped Erasyl */
const despairCloud = (p: Pen, t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Dark cloud circles
  p.ell(0, -20, 90, 50, "#4a536b", 6);
  p.ell(-50, -10, 60, 45, "#4a536b", 6);
  p.ell(50, -10, 60, 45, "#4a536b", 6);
  p.ell(-25, -45, 65, 50, "#383f52", 6);
  p.ell(25, -45, 65, 50, "#383f52", 6);

  // Rain drops falling
  for (let i = 0; i < 6; i++) {
    const rx = -70 + i * 28;
    const ry = 40 + ((t * 180 + i * 35) % 90);
    p.stroke([[rx, ry], [rx - 4, ry + 18]], 5, "#4ea8de");
  }

  // Small lightning flash
  if (Math.sin(t * 12) > 0.7) {
    p.stroke([[10, 20], [0, 45], [15, 50], [5, 80]], 6, "#ffd84a");
  }

  g.restore();
};

/** Glowing 3-tier study strategy blueprint */
const strategyCard = (p: Pen, _t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Main board
  p.poly([[-160, -130], [160, -130], [160, 130], [-160, 130]], "#ffffff", 8);
  p.stroke([[-160, -130], [160, -130]], 12, "#2b3d68");

  g.fillStyle = "#1f2a44"; g.font = "900 20px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("ҰБТ-НЫ БҰЗУ СТРАТЕГИЯСЫ", 0, -90);

  // 3 Boxes
  // A: Green
  p.poly([[-145, -60], [-55, -60], [-55, 30], [-145, 30]], "#e6f8ee", 4);
  g.fillStyle = "#2fb36b"; g.font = "900 16px Montserrat, sans-serif";
  g.fillText("А: 30 БАЛЛ", -100, -35);
  g.font = "900 13px Montserrat, sans-serif";
  g.fillText("База ✓", -100, 0);

  // B: Orange
  p.poly([[-45, -60], [45, -60], [45, 30], [-45, 30]], "#fef8e7", 4);
  g.fillStyle = "#f5a623"; g.font = "900 16px Montserrat, sans-serif";
  g.fillText("В: 40 БАЛЛ", 0, -35);
  g.font = "900 13px Montserrat, sans-serif";
  g.fillText("Талдау 📝", 0, 0);

  // C: Red/Target
  p.poly([[55, -60], [145, -60], [145, 30], [55, 30]], "#fbeeed", 4);
  g.fillStyle = "#e84368"; g.font = "900 16px Montserrat, sans-serif";
  g.fillText("С: 30 БАЛЛ", 100, -35);
  g.font = "900 13px Montserrat, sans-serif";
  g.fillText("100+ ШЫҢ 🎯", 100, 0);

  // Bottom action
  g.fillStyle = "#2b3d68"; g.font = "900 16px Montserrat, sans-serif";
  g.fillText("Күніне 10 күрделі есеп = 100+", 0, 80);
  g.fillStyle = "#e84368"; g.font = "900 18px Montserrat, sans-serif";
  g.fillText("НАҒЫЗ ДАЙЫНДЫҚ БАСТАЛДЫ!", 0, 110);

  g.restore();
};

/** Floating romantic / supportive hearts */
const heart = (p: Pen, x: number, y: number, s: number) => {
  const g = p.g; g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath();
  g.moveTo(0, 10);
  g.bezierCurveTo(-25, -20, -50, 15, 0, 50);
  g.bezierCurveTo(50, 15, 25, -20, 0, 10);
  g.fillStyle = "#e84368"; g.fill();
  g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  g.restore();
};

const heartsFx = (p: Pen, t: number) => {
  heart(p, 300 + Math.sin(t * 3) * 35, 300 - (t * 80) % 240, 0.95);
  heart(p, 230 + Math.cos(t * 2.5) * 30, 340 - ((t + 0.5) * 75) % 240, 0.7);
  heart(p, 370 + Math.sin(t * 2.8) * 30, 320 - ((t + 0.9) * 85) % 240, 0.75);
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  if (!s) return out;
  const k = s.key, t = f / FPS;
  setLight(s.light, cam);

  const front = (who: Who, x: number, y: number, z: number, fo: FrontOpts, shadow = true) => {
    out.places.push(person(cam, who, x, y, z, { side: false, mirror: false }, { blink: lidAt(t, who.i), ...fo }, {}));
    if (shadow) blob(out, x, y, z);
  };
  const say = (line: string, open: Expr, shut: Expr) => (talking(line, f) ? open : shut);
  const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false) => {
    out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft });
  };
  const burst = (x: number, y: number, z: number, at0: number, w = 1.2, n = 10, col?: string) => {
    if (f < at0 || f >= at0 + n) return;
    const u = q((f - at0) / n, 30);
    fx(`burst${u}${col ?? ""}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
  };

  switch (k) {
    case "sh01": // Kuntizbe «23» hook, classroom establishing
      front(G, CLASS_POS[0] + 0.45, 0, 0, { mode: "stand", expr: "stern", facing: -1 });
      front(Y, CLASS_POS[0] - 0.45, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh02": // Classroom: Gulnar apai confronts Erasyl
      front(G, CLASS_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("g1", "sayStern", "stern"), facing: -1, wave: 0.6 });
      front(Y, CLASS_POS[0] - 0.4, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh03": // Classroom: Erasyl boasts 82 points
      front(Y, CLASS_POS[0] - 0.25, 0, 0, { mode: "stand", expr: say("e1", "say", "grin"), facing: 1, wave: 0.8 });
      front(G, CLASS_POS[0] + 0.45, 0, 0, { mode: "stand", expr: "stern", facing: -1 });
      break;

    case "sh04": // Classroom: Gulnar apai slams C-level test
      burst(CLASS_POS[0] - 0.1, 0.45, 0, shotStart("sh04") + 8, 1.4, 12, "#ffd84a");
      fx("examTest", 600, 600, (p) => examTest58(p, t), CLASS_POS[0] - 0.1, 0.7, 0.2, 1.3, 1.3);
      front(G, CLASS_POS[0] + 0.4, 0, 0, { mode: "stand", expr: say("g2", "sayStern", "stern"), facing: -1, wave: 0.9 });
      front(Y, CLASS_POS[0] - 0.45, 0, 0, { mode: "stand", expr: "shock", facing: 1 });
      break;

    case "sh05": // Classroom: Test begins
      fx("examTest", 600, 600, (p) => examTest58(p, t), CLASS_POS[0] - 0.15, 0.7, 0.2, 1.2, 1.2);
      front(Y, CLASS_POS[0] - 0.25, 0, 0, { mode: "stand", expr: "nervous", facing: 1 });
      front(G, CLASS_POS[0] + 0.45, 0, 0, { mode: "stand", expr: "stern", facing: -1 });
      break;

    case "sh06": // Classroom: Erasyl sweating over quantum formulas
      fx("formulas", 600, 600, (p) => floatingFormulas(p, t), CLASS_POS[0] - 0.1, 1.35, 0.1, 1.4, 1.4);
      front(Y, CLASS_POS[0] - 0.1, 0, 0, { mode: "stand", expr: say("e2", "sayNervous", "shock"), facing: 1, wave: 0.7 });
      break;

    case "sh07": // Classroom: Time up, red crosses
      fx("examTest", 600, 600, (p) => examTest58(p, t), CLASS_POS[0], 0.85, 0.2, 1.5, 1.5);
      break;

    case "sh08": // Classroom: Gulnar apai announces 58 points
      fx("examTest", 600, 600, (p) => examTest58(p, t), CLASS_POS[0] - 0.1, 0.7, 0.2, 1.3, 1.3);
      front(G, CLASS_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("g3", "sayStern", "stern"), facing: -1, wave: 0.8 });
      front(Y, CLASS_POS[0] - 0.45, 0, 0, { mode: "stand", expr: "shock", facing: 1 });
      break;

    case "sh09": // Classroom: Score drop 82 -> 58
      burst(CLASS_POS[0] - 0.15, 1.2, 0, shotStart("sh09") + 4, 1.3, 14, "#ff4d4d");
      front(Y, CLASS_POS[0] - 0.15, 0, 0, { mode: "stand", expr: "pained", facing: 1 });
      front(G, CLASS_POS[0] + 0.4, 0, 0, { mode: "stand", expr: "stern", facing: -1 });
      break;

    case "sh10": // Corridor: Erasyl slumped in despair
      fx("despair", 600, 600, (p) => despairCloud(p, t), CORRIDOR_POS[0] - 0.15, 1.4, 0.1, 1.4, 1.4);
      front(Y, CORRIDOR_POS[0] - 0.15, 0, 0, { mode: "stand", expr: say("e3", "sayNervous", "pained"), facing: 1 });
      break;

    case "sh11": // Corridor: Aruzhan arrives to comfort him
      fx("despair", 600, 600, (p) => despairCloud(p, t), CORRIDOR_POS[0] - 0.25, 1.4, 0.1, 1.2, 1.2);
      front(A, CORRIDOR_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("a1", "say", "smile"), facing: -1, wave: 0.7 });
      front(Y, CORRIDOR_POS[0] - 0.25, 0, 0, { mode: "stand", expr: "pained", facing: 1 });
      break;

    case "sh12": // Corridor: Erasyl feeling hopeless
      front(Y, CORRIDOR_POS[0] - 0.2, 0, 0, { mode: "stand", expr: say("e4", "sayNervous", "pained"), facing: 1 });
      front(A, CORRIDOR_POS[0] + 0.35, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh13": // Corridor: Aruzhan reveals strategy
      fx("stratCard", 600, 600, (p) => strategyCard(p, t), CORRIDOR_POS[0] - 0.1, 0.9, 0.2, 1.3, 1.3);
      front(A, CORRIDOR_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("a2", "say", "grin"), facing: -1, wave: 0.9 });
      front(Y, CORRIDOR_POS[0] - 0.4, 0, 0, { mode: "stand", expr: "shock", facing: 1 });
      break;

    case "sh14": // Corridor: Strategy blueprint overview
      fx("stratCard", 600, 600, (p) => strategyCard(p, t), CORRIDOR_POS[0], 0.95, 0.2, 1.5, 1.5);
      front(A, CORRIDOR_POS[0] + 0.45, 0, 0, { mode: "stand", expr: "grin", facing: -1 });
      front(Y, CORRIDOR_POS[0] - 0.45, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh15": // Corridor: Aruzhan explains C-tier formula breakdown
      fx("stratCard", 600, 600, (p) => strategyCard(p, t), CORRIDOR_POS[0] - 0.1, 0.9, 0.2, 1.3, 1.3);
      front(A, CORRIDOR_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("a3", "say", "grin"), facing: -1, wave: 0.8 });
      front(Y, CORRIDOR_POS[0] - 0.4, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh16": // Corridor: Erasyl inspired with new fire
      burst(CORRIDOR_POS[0] - 0.2, 1.3, 0, ws("e5", 4), 1.3, 14, "#ffd84a");
      front(Y, CORRIDOR_POS[0] - 0.2, 0, 0, { mode: "stand", expr: say("e5", "say", "grin"), facing: 1, wave: 1.0 });
      front(A, CORRIDOR_POS[0] + 0.35, 0, 0, { mode: "stand", expr: "grin", facing: -1 });
      break;

    case "sh17": // Corridor: Rallying together towards 100+
      fx("hearts", 600, 600, (p) => heartsFx(p, t), CORRIDOR_POS[0] + 0.05, 1.35, 0.2, 1.3, 1.3);
      front(A, CORRIDOR_POS[0] + 0.25, 0, 0, { mode: "stand", expr: say("a4", "say", "smile"), facing: -1, wave: 0.8 });
      front(Y, CORRIDOR_POS[0] - 0.25, 0, 0, { mode: "stand", expr: "grin", facing: 1, wave: 0.6 });
      break;

    case "sh18": // Corridor: Final march to battle
      fx("hearts", 600, 600, (p) => heartsFx(p, t), CORRIDOR_POS[0], 1.35, 0.2, 1.3, 1.3);
      front(Y, CORRIDOR_POS[0] - 0.25, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      front(A, CORRIDOR_POS[0] + 0.25, 0, 0, { mode: "stand", expr: "grin", facing: -1 });
      break;
  }

  return out;
};
