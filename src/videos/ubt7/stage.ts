// «30 КҮН» 7-күн: cast, per-shot staging and custom effect cards.
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { FPS, SHOTS, CLASS_POS, RINK_POS } from "./story";
import { talking, shotStart, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };

// Winter skate outfits
export const YSKATE: Outfit = { ...YSUIT, jacket: "#32436d", boots: "#111116" };
export const ASKATE: Outfit = { ...ARUZHAN, jacket: "#e84368", pants: "#2a2d3c", boots: "#ffffff" };

const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const YS: Who = { i: 3, o: YSKATE, okey: "yskate" };
const AS: Who = { i: 4, o: ASKATE, okey: "askate" };

/** Test booklet with 82/140 score and red checkmarks */
const examBooklet82 = (p: Pen, _t: number) => {
  p.poly([[160, 200], [440, 200], [440, 680], [160, 680]], "#ffffff", 10);
  p.poly([[175, 215], [425, 215], [425, 665], [175, 665]], "#f9f9fb", 0);
  p.stroke([[160, 200], [160, 680]], 12, "#3a5080");

  const g = p.g; g.save();
  g.fillStyle = "#1e2436"; g.font = "900 32px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("ҰБТ-2026: ТЕСТ", 300, 270);
  g.font = "900 24px Montserrat, sans-serif"; g.fillStyle = "#606880";
  g.fillText("Математика + Физика", 300, 315);

  // Checkmarks
  g.fillStyle = "#2fb36b"; g.font = "900 36px Montserrat, sans-serif";
  g.fillText("✓ №1 Дұрыс", 280, 380);
  g.fillText("✓ №2 Дұрыс", 280, 430);
  g.fillText("✓ №3 Дұрыс", 280, 480);
  g.fillText("✓ №4 Дұрыс", 280, 530);

  // Big Red Score
  g.fillStyle = "#e2483d"; g.font = "900 58px Montserrat, sans-serif";
  g.fillText("82 / 140", 300, 615);
  g.font = "900 32px Montserrat, sans-serif";
  g.fillText("РЕКОРД! (+4)", 300, 655);
  g.restore();
};

/** Erasyl flying through the air in an awkward leap */
const erasylMidAir = (p: Pen, _t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);
  g.rotate(-0.35);

  // Speed lines
  p.stroke([[-180, 120], [-80, 100]], 8, "rgba(255,255,255,0.7)");
  p.stroke([[-200, 60], [-90, 50]], 10, "rgba(255,255,255,0.85)");
  p.stroke([[-190, 0], [-70, -10]], 8, "rgba(255,255,255,0.7)");

  // Body
  p.ell(0, -60, 65, 75, "#f1c9a3", 8); // Head
  p.poly([[-35, -115], [35, -115], [30, -70], [-35, -70]], "#1a1410", 6); // Hair
  p.poly([[-55, -20], [55, -20], [45, 110], [-45, 110]], "#32436d", 8); // Jacket
  p.stroke([[0, -20], [10, 50]], 8, "#c0353a"); // Tie

  // Flailing arms
  p.stroke([[-45, 0], [-130, -70], [-180, -30]], 18, "#32436d");
  p.stroke([[45, 0], [120, -60], [170, -20]], 18, "#32436d");

  // Legs in a split
  p.stroke([[-30, 100], [-110, 180], [-160, 210]], 22, "#2b2d36");
  p.stroke([[30, 100], [100, 190], [150, 230]], 22, "#2b2d36");

  // Silver skate blades
  p.stroke([[-180, 205], [-130, 225]], 8, "#d9dde0");
  p.stroke([[130, 225], [180, 245]], 8, "#d9dde0");

  // Face: excited shouting
  p.ell(-18, -65, 8, 8, "#241726", 0);
  p.ell(18, -65, 8, 8, "#241726", 0);
  p.ell(0, -40, 20, 24, "#5a1e28", 4);

  g.restore();
};

/** Erasyl fallen on the ice in a split, holding his sore back */
const erasylFallen = (p: Pen, _t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);

  // Ice crack marks under him
  p.stroke([[-80, 110], [-140, 130]], 6, "rgba(255,255,255,0.85)");
  p.stroke([[80, 110], [150, 140]], 6, "rgba(255,255,255,0.85)");
  p.stroke([[0, 120], [20, 160]], 6, "rgba(255,255,255,0.85)");

  // Split legs flat on ice
  p.stroke([[-40, 80], [-160, 100], [-230, 90]], 22, "#2b2d36");
  p.stroke([[40, 80], [160, 100], [230, 90]], 22, "#2b2d36");
  // Silver skate blades sticking up
  p.stroke([[-245, 75], [-205, 75]], 8, "#d9dde0");
  p.stroke([[205, 75], [245, 75]], 8, "#d9dde0");

  // Torso slumped, leaning sideways
  p.poly([[-50, -10], [50, -10], [40, 85], [-40, 85]], "#32436d", 8);
  p.stroke([[0, -10], [15, 40]], 8, "#c0353a"); // Tie

  // One hand holding lower back in pain, other hand on the ice
  p.stroke([[-40, 10], [-100, 60], [-80, 100]], 18, "#32436d");
  p.stroke([[40, 10], [85, 40], [45, 75]], 18, "#32436d");

  // Head tilted with groaning face
  p.ell(0, -65, 65, 75, "#f1c9a3", 8);
  p.poly([[-35, -120], [35, -120], [30, -75], [-35, -75]], "#1a1410", 6); // Hair

  // Dazed dizzy eyes (crosses)
  p.stroke([[-25, -75], [-12, -62]], 5, "#241726");
  p.stroke([[-25, -62], [-12, -75]], 5, "#241726");
  p.stroke([[12, -75], [25, -62]], 5, "#241726");
  p.stroke([[12, -62], [25, -75]], 5, "#241726");

  // Wavy mouth
  p.stroke([[-18, -45], [-5, -40], [5, -50], [18, -42]], 5, "#241726");

  // Thought / groan bubble: «Fүйк ≈ 0 !»
  p.ell(130, -130, 80, 45, "#ffffff", 6);
  p.ell(65, -95, 12, 12, "#ffffff", 4);
  g.fillStyle = "#e2483d"; g.font = "900 24px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillText("Fүйк ≈ 0 !", 130, -122);

  g.restore();
};

/** Spinning cartoon dizzy stars and swirls */
const dizzyStars = (p: Pen, t: number) => {
  const g = p.g; g.save();
  g.translate(300, 300);
  for (let i = 0; i < 4; i++) {
    const ang = t * 4 + (i * Math.PI) / 2;
    const radX = 130, radY = 50;
    const sx = Math.cos(ang) * radX;
    const sy = Math.sin(ang) * radY;

    // Draw 4-point star
    g.save(); g.translate(sx, sy); g.rotate(t * 5 + i);
    p.poly([[-18, 0], [0, -18], [18, 0], [0, 18]], "#ffd84a", 4);
    g.restore();
  }
  g.restore();
};

/** Floating romantic hearts */
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
  heart(p, 300 + Math.sin(t * 3) * 35, 340 - (t * 80) % 240, 0.95);
  heart(p, 230 + Math.cos(t * 2.5) * 30, 380 - ((t + 0.5) * 75) % 240, 0.7);
  heart(p, 370 + Math.sin(t * 2.8) * 30, 360 - ((t + 0.9) * 85) % 240, 0.75);
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  if (!s) return out;
  const k = s.key, t = f / FPS;
  const lf = f - s.a;
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
    case "sh01": // Kuntizbe «24» hook, rink establishing in distance
      front(YS, RINK_POS[0] - 0.7, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      front(AS, RINK_POS[0] + 0.7, 0, 0, { mode: "stand", expr: "grin", facing: -1, wave: 0.6 });
      break;

    case "sh02": // Classroom: Erasyl says he analyzed tests (exam booklet slightly higher)
      fx("examBooklet", 600, 800, (p) => examBooklet82(p, t), CLASS_POS[0] + 0.1, 0.95, 0.4, 0.9, 1.2);
      front(Y, CLASS_POS[0] - 0.45, 0, 0, { mode: "stand", expr: say("e1", "say", "grin"), facing: 1, wave: 0.5 });
      front(A, CLASS_POS[0] + 0.65, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh03": // Classroom: Aruzhan checking
      fx("examBooklet", 600, 800, (p) => examBooklet82(p, t), CLASS_POS[0] - 0.15, 0.95, 0.4, 1.0, 1.35);
      front(A, CLASS_POS[0] + 0.4, 0, 0, { mode: "stand", expr: say("a1", "say", "grin"), facing: -1, wave: 0.6 });
      front(Y, CLASS_POS[0] - 0.6, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh04": // Classroom: Score Pop 82 points!
      burst(CLASS_POS[0] - 0.35, 1.35, 0, ws("n2", 4), 1.3, 14, "#ffd84a");
      front(Y, CLASS_POS[0] - 0.35, 0, 0, { mode: "stand", expr: "grin", facing: 1, wave: 1.0 });
      front(A, CLASS_POS[0] + 0.65, 0, 0, { mode: "stand", expr: "grin", facing: -1, wave: 0.7 });
      break;

    case "sh05": // Classroom: Aruzhan invites to Ice Rink
      front(A, CLASS_POS[0] + 0.45, 0, 0, { mode: "stand", expr: say("a2", "say", "smile"), facing: -1, wave: 0.9 });
      front(Y, CLASS_POS[0] - 0.45, 0, 0, { mode: "stand", expr: "smile", facing: 1 });
      break;

    case "sh06": // Classroom: Erasyl boasts
      front(Y, CLASS_POS[0] - 0.25, 0, 0, { mode: "stand", expr: say("e2", "say", "grin"), facing: 1, wave: 0.8 });
      front(A, CLASS_POS[0] + 0.7, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh07": // Ice Rink Wide
      front(AS, RINK_POS[0] + 1.2, 0, 0, { mode: "stand", expr: "smile", facing: -1, wave: 0.5 });
      front(YS, RINK_POS[0] - 1.0, 0, 0, { mode: "stand", expr: "nervous", facing: 1 });
      break;

    case "sh08": // Ice Rink: Aruzhan spinning gracefully
      front(AS, RINK_POS[0] + 0.15, 0, 0, { mode: "stand", expr: say("a3", "say", "grin"), facing: -1, wave: 1.0 });
      front(YS, RINK_POS[0] - 1.2, 0, 0.4, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh09": // Ice Rink: Erasyl stepping onto ice
      front(YS, RINK_POS[0] - 0.2, 0, 0, { mode: "stand", expr: say("e3", "say", "grin"), facing: 1, wave: 0.8 });
      front(AS, RINK_POS[0] + 0.45, 0, 0.2, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh10": // Ice Rink: Erasyl leap attempt!
      fx("erasylMidAir", 600, 600, (p) => erasylMidAir(p, t), RINK_POS[0] - 0.2, 1.2, 0, 1.6, 1.6);
      front(AS, RINK_POS[0] + 0.45, 0, 0.2, { mode: "stand", expr: "shock", facing: -1 });
      break;

    case "sh11": // Ice Rink: COMEDIC CRASH!
      fx("erasylFallen", 600, 600, (p) => erasylFallen(p, t), RINK_POS[0] - 0.15, 0.65, 0, 1.6, 1.6);
      burst(RINK_POS[0] - 0.15, 0.35, 0, shotStart("sh11") + 5, 1.2, 12, "#ffffff");
      front(AS, RINK_POS[0] + 0.45, 0, 0.1, { mode: "stand", expr: "shock", facing: -1, wave: 0.6 });
      break;

    case "sh12": // Ice Rink: Erasyl lying on ice groaning
      fx("erasylFallen", 600, 600, (p) => erasylFallen(p, t), RINK_POS[0] - 0.15, 0.65, 0, 1.6, 1.6);
      fx("dizzyStars", 600, 600, (p) => dizzyStars(p, t), RINK_POS[0] - 0.15, 1.05, 0.05, 1.2, 1.2);
      front(AS, RINK_POS[0] + 0.45, 0, 0.1, { mode: "stand", expr: "laugh", facing: -1 });
      break;

    case "sh13": // Ice Rink: Aruzhan laughing
      front(AS, RINK_POS[0] + 0.35, 0, 0, { mode: "stand", expr: say("a4", "laugh", "grin"), facing: -1, wave: 0.9 });
      fx("erasylFallen", 600, 600, (p) => erasylFallen(p, t), RINK_POS[0] - 0.25, 0.65, 0.1, 1.5, 1.5);
      break;

    case "sh14": // Ice Rink: Aruzhan offering hand
      fx("hearts", 600, 600, (p) => heartsFx(p, t), RINK_POS[0] - 0.05, 1.35, 0.2, 1.3, 1.3);
      front(AS, RINK_POS[0] + 0.3, 0, 0, { mode: "stand", expr: "smile", facing: -1, wave: 0.7 });
      front(YS, RINK_POS[0] - 0.3, 0, 0, { mode: "stand", expr: "nervous", facing: 1 });
      break;

    case "sh15": // Ice Rink: Erasyl standing up, blushing
      fx("hearts", 600, 600, (p) => heartsFx(p, t), RINK_POS[0] + 0.08, 1.35, 0.2, 1.3, 1.3);
      front(YS, RINK_POS[0] - 0.25, 0, 0, { mode: "stand", expr: say("e6", "sayNervous", "nervous"), facing: 1 });
      front(AS, RINK_POS[0] + 0.35, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh16": // Ice Rink: Aruzhan holding hand
      fx("hearts", 600, 600, (p) => heartsFx(p, t), RINK_POS[0] + 0.05, 1.35, 0.2, 1.3, 1.3);
      front(AS, RINK_POS[0] + 0.3, 0, 0, { mode: "stand", expr: say("a5", "say", "smile"), facing: -1, wave: 0.5 });
      front(YS, RINK_POS[0] - 0.25, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      break;

    case "sh17": // Ice Rink: Gliding together holding hands
      {
        const slideX = RINK_POS[0] + Math.sin(lf * 0.04) * 0.4;
        fx("hearts", 600, 600, (p) => heartsFx(p, t), slideX, 1.35, 0.2, 1.3, 1.3);
        front(YS, slideX - 0.25, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
        front(AS, slideX + 0.25, 0, 0, { mode: "stand", expr: "smile", facing: -1, wave: 0.6 });
      }
      break;
  }

  return out;
};
