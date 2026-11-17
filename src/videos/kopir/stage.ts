// Staging, character outfits and Canvas2D cards for «Көпір»
import { Pen, Outfit, Expr, FrontOpts, fxBurst } from "./toon";
import { FPS, SHOTS, CLASS_POS } from "./story";
import { talking, shotStart } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

// ---------------- Outfits ----------------
export const GULNAR: Outfit = {
  jacket: "#542b36", dress: "#2d1d24", pants: "#231b20", boots: "#141113",
  hair: "#261a18", bun: "#261a18", glasses: true, skin: "#f3cfb0", build: "adult",
};

export const ARUZHAN: Outfit = {
  jacket: "#f4f1ea", dress: "#243c68", pants: "#323648", boots: "#181a24",
  hat: "hair", hair: "#1c1410", long: "#1c1410", bow: true, skin: "#f3cfae",
};

export const DINA: Outfit = {
  jacket: "#d45842", dress: "#3a2432", pants: "#282c3c", boots: "#161822",
  hat: "hair", hair: "#221614", skin: "#f4d0b2",
};

export const NURSULTAN: Outfit = {
  jacket: "#8a5832", pants: "#263048", boots: "#161820",
  hat: "hair", hair: "#1e1612", glasses: true, skin: "#f1c8a4",
};

export const ERMEK: Outfit = {
  jacket: "#2d7a4c", pants: "#222a36", boots: "#181a20",
  hat: "hair", hair: "#1e1812", skin: "#f2cba6",
};

export const MIRAS: Outfit = {
  jacket: "#6d2836", pants: "#252b3d", boots: "#161820",
  hat: "hair", hair: "#201814", skin: "#f0c7a2",
};

const G: Who = { i: 1, o: GULNAR, okey: "gulnar" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const D: Who = { i: 3, o: DINA, okey: "dina" };
const N: Who = { i: 4, o: NURSULTAN, okey: "nur" };
const E: Who = { i: 5, o: ERMEK, okey: "ermek" };
const M: Who = { i: 6, o: MIRAS, okey: "miras" };

// ---------------- Custom Canvas2D Cards ----------------
/** 4-step visual routine schedule card */
const stepScheduleCard = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Paper base
  p.poly([[-170, -220], [170, -220], [170, 220], [-170, 220]], "#ffffff", 8);
  p.poly([[-160, -210], [160, -210], [160, 210], [-160, 210]], "#fafbfe", 0);

  g.fillStyle = "#16203a"; g.font = "900 24px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("КҮН ТӘРТІБІ: 4 ҚАДАМ", 0, -165);

  const steps = [
    { num: "1", title: "Тапсырма", desc: "Рөлдерді таңдау" },
    { num: "2", title: "Модельдеу", desc: "Сызба & 3D модель" },
    { num: "3", title: "Тестілеу", desc: "Жүк қойып сынау" },
    { num: "4", title: "Қорытынды", desc: "Спикердің сөзі" },
  ];

  for (let i = 0; i < 4; i++) {
    const y = -105 + i * 72;
    p.poly([[-145, y - 28], [145, y - 28], [145, y + 28], [-145, y + 28]], "#edf2fb", 4);
    p.poly([[-130, y - 18], [-95, y - 18], [-95, y + 18], [-130, y + 18]], "#2d7a4c", 0);
    g.fillStyle = "#ffffff"; g.font = "900 20px Montserrat, sans-serif";
    g.fillText(steps[i].num, -112, y + 7);

    g.fillStyle = "#16203a"; g.font = "900 20px Montserrat, sans-serif"; g.textAlign = "left";
    g.fillText(steps[i].title, -80, y - 4);
    g.fillStyle = "#556484"; g.font = "700 15px Montserrat, sans-serif";
    g.fillText(steps[i].desc, -80, y + 18);
  }

  g.restore();
};

/** 3D model on Miras's tablet */
const tablet3DModel = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Tablet frame
  p.poly([[-180, -130], [180, -130], [180, 130], [-180, 130]], "#181a24", 10);
  p.poly([[-165, -115], [165, -115], [165, 115], [-165, 115]], "#0d1326", 0);

  // 3D wireframe truss bridge
  g.strokeStyle = "#4da6ff"; g.lineWidth = 4; g.lineCap = "round";

  g.save(); g.translate(0, 10);
  // Bottom chord
  g.beginPath(); g.moveTo(-130, 40); g.lineTo(130, 40); g.stroke();
  // Top chord
  g.beginPath(); g.moveTo(-80, -30); g.lineTo(80, -30); g.stroke();
  // Triangles
  g.beginPath();
  g.moveTo(-130, 40); g.lineTo(-80, -30); g.lineTo(-30, 40);
  g.lineTo(0, -30); g.lineTo(30, 40); g.lineTo(80, -30); g.lineTo(130, 40);
  g.stroke();

  // Stress vector arrows
  g.strokeStyle = "#ff4d4d"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, -35); g.lineTo(0, 5); g.stroke();
  g.fillStyle = "#ff4d4d"; g.beginPath(); g.moveTo(-6, -5); g.lineTo(0, 5); g.lineTo(6, -5); g.fill();
  g.restore();

  g.fillStyle = "#7aa2f7"; g.font = "800 16px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("3D МОДЕЛЬ: ФЕРМА ҚҰРЫЛЫМЫ", 0, -85);

  g.restore();
};

/** High-contrast large print assignment sheet for Nursultan */
const largePrintSheet = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  p.poly([[-160, -210], [160, -210], [160, 210], [-160, 210]], "#fffffe", 8);
  g.fillStyle = "#0a0d18"; g.font = "900 32px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("КӨПІР САЛУ", 0, -140);
  g.font = "800 24px Montserrat, sans-serif";
  g.fillText("КВЕСТІ", 0, -100);

  g.fillStyle = "#1e2844"; g.font = "900 24px Montserrat, sans-serif"; g.textAlign = "left";
  g.fillText("• Ұзындығы: 60 см", -130, -30);
  g.fillText("• Ені: 15 см", -130, 25);
  g.fillText("• Мақсат: Максимум жүк", -130, 80);
  g.fillText("• Материал: Таяқшалар", -130, 135);

  g.restore();
};

/** 7-minute visual countdown timer */
const timerCard = (p: Pen, t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  p.poly([[-120, -130], [120, -130], [120, 130], [-120, 130]], "#20283e", 8);
  g.fillStyle = "#ff4d4d"; g.beginPath(); g.arc(0, -10, 75, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f4f1ea"; g.beginPath(); g.arc(0, -10, 68, 0, Math.PI * 2); g.fill();

  // Wedge
  const ang = (t * 0.4) % (Math.PI * 2);
  g.fillStyle = "#ff4d4d"; g.beginPath();
  g.moveTo(0, -10); g.arc(0, -10, 68, -Math.PI / 2, -Math.PI / 2 + ang); g.closePath(); g.fill();

  g.fillStyle = "#ffffff"; g.font = "900 24px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("ТАЙМЕР: 7 МИН", 0, 95);

  g.restore();
};

/** Question prompt card: «Көпір неге құлады? Күш қайда түсті?» */
const mistakePromptCard = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  p.poly([[-170, -110], [170, -110], [170, 110], [-170, 110]], "#ffffff", 8);
  p.poly([[-160, -100], [160, -100], [160, 100], [-160, 100]], "#fff9e6", 0);

  g.fillStyle = "#d4422e"; g.font = "900 46px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("❓", 0, -45);
  g.fillStyle = "#16203a"; g.font = "900 24px Montserrat, sans-serif";
  g.fillText("Көпір неге құлады?", 0, 8);
  g.fillStyle = "#24508a"; g.font = "900 22px Montserrat, sans-serif";
  g.fillText("Күш қайда түсті?", 0, 48);

  g.restore();
};

/** Broken bridge model under 800g weights */
const brokenBridgeModel = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Left desk top edge & right desk top edge
  g.fillStyle = "#a8743f";
  g.fillRect(-190, 30, 70, 60);
  g.fillRect(120, 30, 70, 60);

  // Broken bridge sticks
  g.strokeStyle = "#dfb07a"; g.lineWidth = 14; g.lineCap = "round";
  // Left half sagging down
  g.beginPath(); g.moveTo(-160, 30); g.lineTo(-10, 75); g.stroke();
  // Right half broken off
  g.beginPath(); g.moveTo(150, 30); g.lineTo(10, 80); g.stroke();

  // Metal weight cylinder at crack
  g.fillStyle = "#4a5568";
  g.beginPath(); g.roundRect(-40, 20, 80, 50, 8); g.fill();
  g.fillStyle = "#ffffff"; g.font = "900 20px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("800 г", 0, 52);

  // Red crack flash
  g.strokeStyle = "#ff3333"; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(-12, 60); g.lineTo(2, 74); g.lineTo(-4, 88); g.lineTo(8, 102);
  g.stroke();

  g.restore();
};

/** Triangle truss bridge (1000g triumph) */
const triangleTrussBridge = (p: Pen) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Desks
  g.fillStyle = "#a8743f";
  g.fillRect(-190, 40, 60, 60);
  g.fillRect(130, 40, 60, 60);

  // Solid wood triangular truss
  g.strokeStyle = "#c89456"; g.lineWidth = 12; g.lineCap = "round";
  g.beginPath();
  g.moveTo(-170, 40); g.lineTo(170, 40); // bottom chord
  g.moveTo(-110, -25); g.lineTo(110, -25); // top chord
  // triangles
  g.moveTo(-170, 40); g.lineTo(-110, -25); g.lineTo(-50, 40);
  g.lineTo(0, -25); g.lineTo(50, 40); g.lineTo(110, -25); g.lineTo(170, 40);
  g.stroke();

  // 1000g gold weight on top
  g.fillStyle = "#e5a93b";
  g.beginPath(); g.roundRect(-45, -80, 90, 55, 10); g.fill();
  g.fillStyle = "#120c06"; g.font = "900 24px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("1000 г", 0, -45);

  g.fillStyle = "#2d7a4c"; g.font = "900 22px Montserrat, sans-serif";
  g.fillText("✓ ТӨТЕП БЕРДІ!", 0, 85);

  g.restore();
};

// ---------------- Staging Builder ----------------
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

  const CX = CLASS_POS[0], CY = CLASS_POS[1], CZ = CLASS_POS[2];

  switch (k) {
    case "sh01": // Teacher at blackboard drawing 4 steps
      front(G, CX + 0.1, CY, CZ, { mode: "stand", expr: "smile", facing: 1, wave: 0.3 });
      fx("scheduleCard", 600, 600, (p) => stepScheduleCard(p), CX + 0.85, CY + 0.75, CZ - 0.2, 1.2, 1.2);
      break;

    case "sh02": // Aruzhan at door hesitating
      front(A, CX - 0.3, CY, CZ, { mode: "stand", expr: "nervous", facing: 1 });
      break;

    case "sh03": // Gulnar talking to Aruzhan (dialogue g1)
      front(G, CX - 0.45, CY, CZ, { mode: "stand", expr: say("g1", "say", "smile"), facing: 1, wave: 0.4 });
      front(A, CX + 0.45, CY, CZ, { mode: "stand", expr: "smile", facing: -1 });
      fx("scheduleCard", 600, 600, (p) => stepScheduleCard(p), CX, CY + 0.65, CZ + 0.1, 0.95, 0.95);
      break;

    case "sh04": // Aruzhan at window desk with card
      front(A, CX - 0.2, CY, CZ, { mode: "stand", expr: "smile", facing: 1 });
      fx("scheduleCard", 600, 600, (p) => stepScheduleCard(p), CX + 0.45, CY + 0.55, CZ + 0.1, 0.9, 0.9);
      break;

    case "sh05": // Gulnar placing bridge kits
      front(G, CX, CY, CZ, { mode: "stand", expr: "smile", facing: 1, wave: 0.3 });
      front(E, CX - 0.7, CY, CZ - 0.2, { mode: "stand", expr: "think", facing: 1 });
      break;

    case "sh06": // Gulnar explaining quest (dialogue g2)
      front(G, CX - 0.1, CY, CZ, { mode: "stand", expr: say("g2", "sayStern", "smile"), facing: 1, wave: 0.5 });
      fx("triangleTruss", 600, 600, (p) => triangleTrussBridge(p), CX + 0.85, CY + 0.65, CZ - 0.2, 1.3, 1.3);
      break;

    case "sh07": // Dina watching lips, tablet subtitles
      front(D, CX - 0.2, CY, CZ, { mode: "stand", expr: "think", facing: 1 });
      fx("tablet3D", 600, 600, (p) => tablet3DModel(p), CX + 0.55, CY + 0.55, CZ + 0.1, 1.1, 1.1);
      break;

    case "sh08": // Nursultan holding large print sheet
      front(N, CX - 0.2, CY, CZ, { mode: "stand", expr: "smile", facing: 1 });
      fx("largePrint", 600, 600, (p) => largePrintSheet(p), CX + 0.45, CY + 0.6, CZ + 0.1, 1.0, 1.0);
      break;

    case "sh09": // Ermek fidgeting restlessly
      front(E, CX, CY, CZ, { mode: "stand", expr: "nervous", facing: 1, wave: 0.5 });
      break;

    case "sh10": // Ermek speaks (dialogue e1)
      front(E, CX, CY, CZ, { mode: "stand", expr: say("e1", "sayNervous", "nervous"), facing: 1, wave: 0.6 });
      break;

    case "sh11": // Gulnar giving tester role & timer (dialogue g3)
      front(G, CX - 0.45, CY, CZ, { mode: "stand", expr: say("g3", "say", "smile"), facing: 1, wave: 0.4 });
      front(E, CX + 0.45, CY, CZ, { mode: "stand", expr: "grin", facing: -1 });
      fx("timerCard", 600, 600, (p) => timerCard(p, t), CX, CY + 0.85, CZ + 0.1, 0.95, 0.95);
      break;

    case "sh12": // Ermek carrying metal weights happily
      front(E, CX - 0.1, CY, CZ, { mode: "stand", expr: "grin", facing: 1, wave: 0.6 });
      fx("timerCard", 600, 600, (p) => timerCard(p, t), CX + 0.65, CY + 0.8, CZ, 0.85, 0.85);
      break;

    case "sh13": // Miras tablet 3D model
      front(M, CX - 0.2, CY, CZ, { mode: "stand", expr: "smile", facing: 1 });
      fx("tablet3D", 600, 600, (p) => tablet3DModel(p), CX + 0.55, CY + 0.6, CZ + 0.1, 1.2, 1.2);
      break;

    case "sh14": // Nursultan touching tactile bridge
      front(N, CX - 0.2, CY, CZ, { mode: "stand", expr: "smile", facing: 1, wave: 0.3 });
      fx("triangleTruss", 600, 600, (p) => triangleTrussBridge(p), CX + 0.55, CY + 0.55, CZ + 0.1, 1.2, 1.2);
      break;

    case "sh15": // Disagreement prompt card
      front(E, CX - 0.6, CY, CZ, { mode: "stand", expr: "think", facing: 1 });
      front(A, CX + 0.6, CY, CZ, { mode: "stand", expr: "think", facing: -1 });
      fx("mistakeCard", 600, 600, (p) => mistakePromptCard(p), CX, CY + 0.6, CZ + 0.1, 1.1, 1.1);
      break;

    case "sh16": // Bridge test 200g - 500g
      front(E, CX - 0.5, CY, CZ, { mode: "stand", expr: "think", facing: 1 });
      front(D, CX + 0.5, CY, CZ, { mode: "stand", expr: "think", facing: -1 });
      fx("triangleTruss", 600, 600, (p) => triangleTrussBridge(p), CX, CY + 0.75, CZ, 1.3, 1.3);
      break;

    case "sh17": // Ermek adding 800g, bridge cracks! (dialogue e2)
      burst(CX, CY + 0.5, CZ, shotStart("sh17") + 60, 1.3, 14, "#ff4d4d");
      front(E, CX - 0.55, CY, CZ, { mode: "stand", expr: say("e2", "sayNervous", "shock"), facing: 1, wave: 0.7 });
      fx("brokenBridge", 600, 600, (p) => brokenBridgeModel(p), CX, CY + 0.72, CZ + 0.1, 1.35, 1.35);
      break;

    case "sh18": // Dina sign language
      front(D, CX - 0.15, CY, CZ, { mode: "stand", expr: "smile", facing: 1, wave: 0.8 });
      fx("brokenBridge", 600, 600, (p) => brokenBridgeModel(p), CX + 0.65, CY + 0.5, CZ, 1.0, 1.0);
      break;

    case "sh19": // Group agreement & star mark (dialogue grp1)
      front(E, CX - 0.55, CY, CZ, { mode: "stand", expr: say("grp1", "grin", "smile"), facing: 1, wave: 0.4 });
      front(G, CX + 0.55, CY, CZ, { mode: "stand", expr: "smile", facing: -1 });
      fx("scheduleCard", 600, 600, (p) => stepScheduleCard(p), CX, CY + 0.6, CZ, 0.9, 0.9);
      break;

    case "sh20": // Aruzhan presenting winning bridge (dialogue a1)
      front(A, CX - 0.45, CY, CZ, { mode: "stand", expr: say("a1", "say", "grin"), facing: 1, wave: 0.4 });
      fx("triangleTruss", 600, 600, (p) => triangleTrussBridge(p), CX + 0.55, CY + 0.6, CZ, 1.3, 1.3);
      break;

    case "sh21": // Class empties, teacher wiping board
      front(G, CX, CY, CZ, { mode: "stand", expr: "smile", facing: 1, wave: 0.3 });
      fx("scheduleCard", 600, 600, (p) => stepScheduleCard(p), CX + 0.75, CY + 0.75, CZ, 0.95, 0.95);
      break;

    case "sh22": // Closing slow zoom (dialogue nar1)
      front(G, CX, CY, CZ, { mode: "stand", expr: say("nar1", "say", "smile"), facing: 1 });
      break;

    default:
      break;
  }

  return out;
};
