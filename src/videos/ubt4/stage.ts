// «30 КҮН» 4-күн: cast, per-shot staging and custom effect cards.
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { FPS, clamp01, SHOTS, YK, YSTAND_K, MOM_K, CORR_X, YPARK, APARK, SNOWDRIFT_POS, SLED_POS } from "./story";
import { shotStart, talking, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };
export const MOM_ROBE: Outfit = { jacket: "#b98ac0", dress: "#d9a8cf", pants: "#4e4a5e", boots: "#7a4a6a", hat: "hair", hair: "#2a1e18", bun: "#2a1e18", skin: "#e8b896" };

const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };
const M: Who = { i: 3, o: MOM_ROBE, okey: "momrobe" };

const FONT = "900 72px Montserrat, 'DejaVu Sans', sans-serif";

/** Thought cloud: book + moon + «ТҮНІ БОЙЫ ОҚУ» */
const thoughtNight = (p: Pen) => {
  const g = p.g;
  for (const [x, y, r] of [[130, 560, 22], [190, 515, 34]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 8);
  for (const [x, y, rx, ry] of [[400, 260, 300, 200], [210, 230, 130, 110], [600, 220, 140, 120], [330, 120, 140, 100], [500, 110, 130, 95], [300, 380, 150, 90], [520, 390, 150, 90]]) p.ell(x, y, rx, ry, null, 14);
  for (const [x, y, rx, ry] of [[400, 260, 300, 200], [210, 230, 130, 110], [600, 220, 140, 120], [330, 120, 140, 100], [500, 110, 130, 95], [300, 380, 150, 90], [520, 390, 150, 90]]) p.ell(x, y, rx, ry, "#ffffff", 0);
  
  // crescent moon
  p.ell(250, 210, 36, 36, "#ffd84a", 6);
  p.ell(262, 198, 30, 30, "#ffffff", 0);

  g.save(); g.font = FONT; g.textAlign = "center"; g.lineJoin = "round";
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeText("ТҮНІ БОЙЫ", 450, 220);
  g.fillStyle = "#1a2040"; g.fillText("ТҮНІ БОЙЫ", 450, 220);
  g.strokeText("ОҚУ!", 450, 310);
  g.fillStyle = "#ffd84a"; g.fillText("ОҚУ!", 450, 310);
  g.restore();
};

/** Floating hearts for romantic moment */
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
  heart(p, 150 + 20 * Math.sin(t * 3), 200 - t * 40, 0.7);
  heart(p, 300 - 15 * Math.cos(t * 2.5), 150 - t * 50, 0.9);
  heart(p, 420 + 25 * Math.sin(t * 3.5), 230 - t * 45, 0.65);
};

/** Snore cloud: «Хррр... Zzz» */
const snoreCloud = (p: Pen, t: number) => {
  const g = p.g;
  p.ell(250, 150, 120, 70, "#ffffff", 10);
  g.save(); g.font = "900 60px Montserrat, 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 10; g.strokeStyle = INK; g.strokeText("Хррр... Zzz", 250, 150);
  g.fillStyle = "#4a68a8"; g.fillText("Хррр... Zzz", 250, 150);
  g.restore();
};

/** Legs kicking out of a snowbank */
const bootsInDrift = (p: Pen, kick: number) => {
  // snowbank mound
  p.ell(300, 320, 240, 120, "#eef6ff", 12);
  p.ell(300, 320, 220, 100, "#ffffff", 0);
  // two legs with black boots pointing up
  const k1 = Math.sin(kick * Math.PI * 4) * 15;
  const k2 = Math.cos(kick * Math.PI * 4) * 15;
  // left leg
  p.poly([[230 + k1, 260], [250 + k1, 140], [280 + k1, 140], [255 + k1, 260]], "#2b2d36", 8);
  p.poly([[245 + k1, 140], [240 + k1, 95], [290 + k1, 95], [285 + k1, 140]], "#141418", 8);
  // right leg
  p.poly([[330 + k2, 260], [350 + k2, 130], [380 + k2, 130], [355 + k2, 260]], "#2b2d36", 8);
  p.poly([[345 + k2, 130], [340 + k2, 85], [390 + k2, 85], [385 + k2, 130]], "#141418", 8);
};

/** Sled with sleeping Yerasyl being pulled */
const sledWithYerasyl = (p: Pen) => {
  // wooden sled runners
  p.stroke([[80, 320], [380, 320], [420, 280]], 12, "#7a4a26");
  p.stroke([[120, 290], [360, 290]], 10, "#9a6234");
  for (const x of [150, 240, 330]) p.stroke([[x, 320], [x, 290]], 8, "#5a3418");
  // blanket bundle / sleeping Yerasyl
  p.ell(240, 240, 100, 50, "#3a4a70", 10); // coat bundle
  p.ell(180, 205, 40, 36, "#f1c9a3", 8); // head
  // sleeping eye & hair
  p.stroke([[165, 205], [185, 205]], 5, INK);
  p.poly([[150, 195], [200, 180], [210, 210], [170, 215]], "#1a1410", 6);
  // Zzz
  const g = p.g; g.save(); g.font = "900 36px Montserrat, sans-serif"; g.fillStyle = "#6a8acc";
  g.fillText("Zzz", 230, 170); g.restore();
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
  const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false) =>
    out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft });

  const burst = (x: number, y: number, z: number, at0: number, w = 1.2, n = 10, col?: string) => {
    if (f < at0 || f >= at0 + n) return;
    const u = q((f - at0) / n, 30);
    fx(`burst${u}${col ?? ""}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
  };

  switch (k) {
    case "sh01": {
      front(Y, CORR_X, 0, 0, { mode: "stand", facing: 0, expr: "smile" });
      const t0 = W("n2", 2) - 4;
      if (f >= t0) {
        const kk = clamp01((f - t0) / 8);
        fx("thoughtNight", 800, 600, thoughtNight, CORR_X - 0.45, 1.75, 0.05, 0.7 * (0.6 + 0.4 * kk), 0.52 * (0.6 + 0.4 * kk));
      }
      break;
    }
    case "sh02": {
      // Yerasyl running home into kitchen
      front(Y, YSTAND_K[0], 0, YSTAND_K[2], { mode: "stand", facing: 0, expr: "grin", wave: 0.6 });
      burst(YSTAND_K[0], 1.2, YSTAND_K[2], W("n3", 5), 0.8, 10);
      break;
    }
    case "sh03": {
      // Kitchen table with book stack & tea
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "think", blink: 0 }, false);
      break;
    }
    case "sh04": {
      // Clock spinning 10..12..3, Yerasyl drinking tea & studying
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "think", blink: 0 }, false);
      break;
    }
    case "sh05": {
      // Mom in robe at kitchen door
      front(M, MOM_K[0], 0, MOM_K[2], { mode: "stand", facing: 1, expr: say("m1", "sayStern", "neutral") });
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: -1, expr: "shock", blink: 0 }, false);
      break;
    }
    case "sh06": {
      // Yerasyl determined: "Болмайды, мама! Жұмада бәс бар!"
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: -1, expr: say("e1", "sayStern", "stern") }, false);
      burst(YK[0] - 0.2, 1.4, YK[2], W("e1", 3), 0.6, 12, "#ffd84a");
      break;
    }
    case "sh07": {
      // Dawn light, 56 балл!
      front(Y, YK[0], 0.1, YK[2], { mode: "stand", facing: 0, expr: "relief_open", wave: 1 }, false);
      burst(YK[0], 1.6, YK[2], W("n6", 5), 1.0, 14, "#4cd98a");
      break;
    }
    case "sh08": {
      // Exhausted, eye twitch
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "pained" }, false);
      break;
    }
    case "sh09": {
      // Freezer with vibrating phone inside
      front(Y, YK[0], YK[1], YK[2], { mode: "sit", facing: 0, expr: "shock" }, false);
      break;
    }
    case "sh10": {
      // "Серуен?!"
      front(Y, YSTAND_K[0], 0, YSTAND_K[2], { mode: "stand", facing: 0, expr: "relief_open", wave: 1 });
      burst(YSTAND_K[0], 1.5, YSTAND_K[2], shotStart("sh10"), 0.8, 12, "#ffd84a");
      break;
    }
    case "sh11": {
      // Evening city park walk
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: "smile" });
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: "smile" });
      break;
    }
    case "sh12": {
      // Aruzhan: "Қандай әдемі..."
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: say("a1", "say", "smile") });
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: "smile" });
      break;
    }
    case "sh13": {
      // Yerasyl: "Иә... өте әдемі" (staring at Aruzhan, floating hearts)
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: say("e3", "smile_closed", "smile") });
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: "smile" });
      const ht = (f % 45) / 45;
      fx("hearts", 500, 400, (p) => heartsFx(p, ht), (YPARK[0] + APARK[0]) / 2, 1.6, 0.2, 0.7, 0.55, true);
      break;
    }
    case "sh14": {
      // Aruzhan giggles: "Мен қарды айтып тұрмын ғой"
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: say("a2", "laugh", "grin") });
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: "shock" });
      break;
    }
    case "sh15": {
      // Yerasyl flustered: "Мен де... қарды"
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: say("e4", "nervous", "nervous") });
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: "smile" });
      break;
    }
    case "sh16": {
      // Under lantern: "Аружан... бір маңызды нәрсе айтқым келеді..."
      front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: say("e5", "sayNervous", "nervous") });
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: "neutral" });
      break;
    }
    case "sh17": {
      // Falling asleep & into snowdrift
      const snoreT = f >= W("n10", 3);
      if (!snoreT) {
        front(Y, YPARK[0], 0, YPARK[2], { mode: "stand", facing: 1, expr: "dazed" });
        front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: "shock" });
      } else {
        fx("snore", 500, 300, (p) => snoreCloud(p, 0), YPARK[0], 1.6, 0, 0.6, 0.36);
        fx("boots", 600, 450, (p) => bootsInDrift(p, (f % 16) / 16), SNOWDRIFT_POS[0], 0.3, SNOWDRIFT_POS[2], 0.8, 0.6);
        front(A, APARK[0] + 0.2, 0, APARK[2], { mode: "stand", facing: -1, expr: "shock" });
      }
      break;
    }
    case "sh18": {
      // Aruzhan shocked/laughing: "Ерасыл?!"
      front(A, APARK[0], 0, APARK[2], { mode: "stand", facing: -1, expr: say("a3", "laugh", "shock") });
      fx("boots", 600, 450, (p) => bootsInDrift(p, (f % 16) / 16), SNOWDRIFT_POS[0], 0.3, SNOWDRIFT_POS[2], 0.8, 0.6);
      break;
    }
    case "sh19": {
      // Boots kicking out of snow: "минус жеті де бар..."
      fx("boots", 600, 450, (p) => bootsInDrift(p, (f % 12) / 12), SNOWDRIFT_POS[0], 0.3, SNOWDRIFT_POS[2], 0.9, 0.68);
      break;
    }
    case "sh20": {
      // Aruzhan pulling sled with Yerasyl
      front(A, SLED_POS[0] + 0.8, 0, SLED_POS[2], { mode: "stand", facing: 1, expr: "smile" });
      fx("sled", 500, 400, (p) => sledWithYerasyl(p), SLED_POS[0], 0.25, SLED_POS[2], 0.9, 0.72);
      break;
    }
  }

  return out;
};
