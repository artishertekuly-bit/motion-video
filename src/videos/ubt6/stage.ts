// «30 КҮН» 6-күн: cast, per-shot staging and custom effect cards.
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { FPS, SHOTS, BED_POS, SHOP_POS, DESK_POS, LIB_OUT, LIB_IN } from "./story";
import { talking, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };

const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };

const FONT = "900 48px Montserrat, 'DejaVu Sans', sans-serif";

/** Mirror on bedroom wall */
const mirrorReflection = (p: Pen, _t: number) => {
  p.ell(300, 320, 180, 240, "#cbe3f7", 12);
  p.ell(300, 320, 160, 220, "#e8f4fc", 0);
  p.stroke([[200, 180], [360, 460]], 12, "rgba(255,255,255,0.7)");
  p.stroke([[230, 160], [390, 440]], 6, "rgba(255,255,255,0.5)");
};

/** Empty pocket with falling coins */
const pocketCoins = (p: Pen, t: number) => {
  p.poly([[180, 180], [420, 180], [380, 380], [220, 380]], "#3a4a6e", 8);
  p.poly([[200, 190], [400, 190], [365, 360], [235, 360]], "#2e3b57", 0);
  p.stroke([[190, 185], [410, 185]], 4, "#ffd84a");
  const dy = (t * 60) % 180;
  p.ell(260, 400 + dy, 32, 32, "#ffd84a", 6);
  p.ell(340, 440 + dy * 1.1, 26, 26, "#e8eaed", 6);
  const g = p.g; g.save(); g.font = "900 28px Montserrat, sans-serif"; g.fillStyle = "#120c06"; g.textAlign = "center";
  g.fillText("100", 260, 408 + dy);
  g.fillText("50", 340, 448 + dy * 1.1);
  g.restore();
};

/** Massive 101-rose bouquet with 25 000 tg price tag */
const flowerShopBouquet = (p: Pen, _t: number) => {
  p.poly([[160, 480], [440, 480], [520, 220], [80, 220]], "#f5cb5c", 10);
  p.poly([[180, 460], [420, 460], [490, 240], [110, 240]], "#e5b93b", 0);
  p.ell(300, 460, 60, 24, "#e84368", 6);
  for (let row = 0; row < 4; row++) {
    const n = 5 + row * 2;
    for (let col = 0; col < n; col++) {
      const rx = 140 + (col * 320) / (n - 1);
      const ry = 180 - row * 38;
      p.ell(rx, ry, 28, 26, row % 2 ? "#e84368" : "#c41e3a", 4);
      p.ell(rx - 4, ry - 4, 16, 14, "#ff6b8b", 0);
    }
  }
  p.poly([[200, 500], [400, 500], [380, 580], [220, 580]], "#ffffff", 8);
  const g = p.g; g.save(); g.font = FONT; g.textAlign = "center"; g.fillStyle = "#e2483d";
  g.fillText("25 000 ₸", 300, 555);
  g.restore();
};

/** Single elegant red rose */
const singleRose = (p: Pen, _t: number) => {
  p.stroke([[300, 280], [300, 650]], 12, "#387a3e");
  p.poly([[300, 420], [380, 390], [350, 430]], "#4aa352", 6);
  p.poly([[300, 510], [220, 480], [250, 520]], "#4aa352", 6);
  p.ell(300, 260, 65, 75, "#c41e3a", 8);
  p.ell(300, 240, 55, 60, "#e84368", 6);
  p.ell(295, 230, 35, 40, "#ff6b8b", 0);
};

/** Formula-wrapped single rose (The UNT Shpargalka Bouquet!) */
const formulaBouquet = (p: Pen, _t: number) => {
  p.poly([[220, 680], [380, 680], [480, 280], [120, 280]], "#dfcaa4", 10);
  p.poly([[235, 660], [365, 660], [455, 300], [145, 300]], "#d2ba8f", 0);
  p.poly([[270, 660], [330, 660], [340, 710], [260, 710]], "#e84368", 6);
  p.stroke([[300, 280], [300, 210]], 12, "#387a3e");
  p.poly([[300, 250], [350, 230], [330, 260]], "#4aa352", 5);
  p.ell(300, 180, 60, 70, "#c41e3a", 8);
  p.ell(300, 165, 50, 55, "#e84368", 6);
  p.ell(295, 155, 30, 35, "#ff6b8b", 0);

  const g = p.g; g.save(); g.font = "900 32px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillStyle = "#1e2436";
  g.fillText("sin²α + cos²α = 1", 300, 360);
  g.fillText("c² = a² + b²", 300, 420);
  g.fillText("tg α · ctg α = 1", 300, 480);
  g.fillText("E = mc²", 300, 540);
  g.fillStyle = "#e84368";
  g.font = "900 36px Montserrat, sans-serif";
  g.fillText("♥ АРУЖАНҒА ♥", 300, 610);
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
  heart(p, 160 + 20 * Math.sin(t * 3), 220 - t * 40, 0.75);
  heart(p, 310 - 15 * Math.cos(t * 2.5), 160 - t * 50, 0.95);
  heart(p, 430 + 25 * Math.sin(t * 3.5), 240 - t * 45, 0.7);
};

/** Rose in glass water vase on library table */
const roseInVase = (p: Pen, _t: number) => {
  p.poly([[240, 460], [360, 460], [350, 340], [250, 340]], "#b4d8f2", 6);
  p.poly([[245, 455], [355, 455], [345, 370], [255, 370]], "rgba(100,180,240,0.5)", 0);
  p.stroke([[300, 220], [300, 440]], 10, "#387a3e");
  p.poly([[300, 270], [360, 240], [330, 280]], "#4aa352", 5);
  p.ell(300, 180, 55, 65, "#c41e3a", 8);
  p.ell(300, 165, 45, 50, "#e84368", 6);
  p.ell(295, 155, 28, 30, "#ff6b8b", 0);
};

/** UNT Math test book open with +4 checkmark */
const examMathBook = (p: Pen, _t: number) => {
  p.poly([[80, 380], [290, 360], [290, 180], [80, 200]], "#ffffff", 8);
  p.poly([[520, 380], [310, 360], [310, 180], [520, 200]], "#f4f1ea", 8);
  p.stroke([[110, 230], [260, 220]], 4, "#2b2d36");
  p.stroke([[110, 260], [260, 250]], 4, "#2b2d36");
  p.stroke([[110, 290], [260, 280]], 4, "#2b2d36");
  p.poly([[130, 340], [230, 340], [230, 300]], "#34508a", 4);
  const g = p.g; g.save(); g.font = "900 64px Montserrat, sans-serif"; g.textAlign = "center";
  g.fillStyle = "#2fb36b"; g.fillText("+4 БАЛЛ!", 415, 260);
  g.font = "900 48px Montserrat, sans-serif";
  g.fillStyle = "#1e2436"; g.fillText("Жауабы: 2 ✔", 415, 330);
  g.restore();
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
    case "sh01": // Kuntizbe «25» hook
      front(Y, LIB_OUT[0] - 0.7, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      front(A, LIB_OUT[0] + 0.7, 0, 0, { mode: "stand", expr: "grin", facing: -1, wave: 0.6 });
      break;

    case "sh02": // Bedroom mirror, Erasyl nervous
      fx("mirror", 600, 600, (p) => mirrorReflection(p, t), BED_POS[0] + 0.6, 1.4, -0.6, 1.3, 1.3);
      front(Y, BED_POS[0] - 0.2, 0, 0, { mode: "stand", expr: say("e1", "sayNervous", "nervous"), facing: 1 });
      break;

    case "sh03": // Bedroom, checking pocket
      fx("pocket", 600, 600, (p) => pocketCoins(p, t), BED_POS[0] + 0.6, 1.2, -0.3, 1.3, 1.3);
      front(Y, BED_POS[0] - 0.2, 0, 0, { mode: "stand", expr: "stern", facing: 1 });
      break;

    case "sh04": // Flower shop: 101-rose bouquet
      fx("shopBouquet", 600, 600, (p) => flowerShopBouquet(p, t), SHOP_POS[0] + 0.7, 1.1, -0.2, 1.8, 1.8);
      front(Y, SHOP_POS[0] - 0.5, 0, 0, { mode: "stand", expr: say("e2", "sayStern", "shock"), facing: 1, wave: 0.8 });
      break;

    case "sh05": // Flower shop: single rose
      fx("rose", 600, 600, (p) => singleRose(p, t), SHOP_POS[0] + 0.5, 1.1, -0.2, 1.4, 1.4);
      front(Y, SHOP_POS[0] - 0.3, 0, 0, { mode: "stand", expr: "think", facing: 1 });
      break;

    case "sh06": // Desk: writing formulas on wrapping
      fx("formulaBouquet", 600, 800, (p) => formulaBouquet(p, t), DESK_POS[0] + 0.5, 1.0, -0.2, 1.4, 1.8);
      front(Y, DESK_POS[0] - 0.3, 0, 0, { mode: "stand", expr: say("e3", "say", "grin"), facing: 1 });
      break;

    case "sh07": // Formula bouquet CU
      fx("formulaBouquetCU", 600, 800, (p) => formulaBouquet(p, t), DESK_POS[0], 1.1, 0, 1.8, 2.4);
      break;

    case "sh08": // Library entrance wide
      front(A, LIB_OUT[0] + 0.8, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh09": // Aruzhan waiting with test book
      front(A, LIB_OUT[0] + 0.6, 0, 0, { mode: "stand", expr: say("a1", "say", "smile"), facing: -1 });
      break;

    case "sh10": // Erasyl approaches hiding rose
      front(Y, LIB_OUT[0] - 0.6, 0, 0, { mode: "stroll", expr: say("e4", "sayNervous", "nervous"), facing: 1 });
      front(A, LIB_OUT[0] + 0.6, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh11": // Erasyl presents the rose!
      fx("formulaBouquet", 600, 800, (p) => formulaBouquet(p, t), LIB_OUT[0] - 0.1, 1.0, -0.1, 1.2, 1.6);
      front(Y, LIB_OUT[0] - 0.5, 0, 0, { mode: "stand", expr: say("e5", "say", "grin"), facing: 1 });
      front(A, LIB_OUT[0] + 0.6, 0, 0, { mode: "stand", expr: "shock", facing: -1 });
      break;

    case "sh12": // Aruzhan touched and happy
      fx("hearts", 600, 600, (p) => heartsFx(p, t), LIB_OUT[0] + 0.4, 1.5, -0.2, 1.4, 1.4);
      front(A, LIB_OUT[0] + 0.4, 0, 0, { mode: "stand", expr: say("a2", "say", "grin"), facing: -1, wave: 0.5 });
      break;

    case "sh13": // Aruzhan spots formulas
      front(A, LIB_OUT[0] + 0.4, 0, 0, { mode: "stand", expr: say("a3", "sayStern", "shock"), facing: -1 });
      fx("formulaBouquet", 600, 800, (p) => formulaBouquet(p, t), LIB_OUT[0] - 0.2, 1.0, -0.1, 1.1, 1.5);
      break;

    case "sh14": // Erasyl proud romantic
      fx("hearts", 600, 600, (p) => heartsFx(p, t), LIB_OUT[0] - 0.4, 1.5, -0.2, 1.3, 1.3);
      front(Y, LIB_OUT[0] - 0.4, 0, 0, { mode: "stand", expr: say("e6", "say", "grin"), facing: 1 });
      front(A, LIB_OUT[0] + 0.5, 0, 0, { mode: "stand", expr: "smile", facing: -1 });
      break;

    case "sh15": // Aruzhan laughing warmly
      front(Y, LIB_OUT[0] - 0.5, 0, 0, { mode: "stand", expr: "grin", facing: 1 });
      front(A, LIB_OUT[0] + 0.5, 0, 0, { mode: "stand", expr: say("a4", "laugh", "grin"), facing: -1, wave: 0.7 });
      break;

    case "sh16": // Library inside: reading table with rose in vase
      fx("roseVase", 600, 600, (p) => roseInVase(p, t), LIB_IN[0], 0.85, -0.3, 1.2, 1.2);
      front(Y, LIB_IN[0] - 0.6, 0.2, -0.6, { mode: "sit", expr: "smile", facing: 1 }, false);
      front(A, LIB_IN[0] + 0.6, 0.2, -0.6, { mode: "sit", expr: "smile", facing: -1 }, false);
      break;

    case "sh17": // Aruzhan tests him with formula
      fx("book", 600, 600, (p) => examMathBook(p, t), LIB_IN[0], 0.75, -0.2, 1.4, 1.4);
      front(A, LIB_IN[0] + 0.6, 0.2, -0.6, { mode: "sit", expr: say("a5", "sayStern", "think"), facing: -1 }, false);
      front(Y, LIB_IN[0] - 0.6, 0.2, -0.6, { mode: "sit", expr: "think", facing: 1 }, false);
      break;

    case "sh18": // Erasyl solves equation
      fx("book", 600, 600, (p) => examMathBook(p, t), LIB_IN[0], 0.75, -0.2, 1.4, 1.4);
      front(Y, LIB_IN[0] - 0.5, 0.2, -0.6, { mode: "sit", expr: say("e7", "say", "grin"), facing: 1 }, false);
      front(A, LIB_IN[0] + 0.6, 0.2, -0.6, { mode: "sit", expr: "shock", facing: -1 }, false);
      break;

    case "sh19": // Aruzhan gives him "+4" approval
      fx("book", 600, 600, (p) => examMathBook(p, t), LIB_IN[0], 0.75, -0.2, 1.4, 1.4);
      front(A, LIB_IN[0] + 0.5, 0.2, -0.6, { mode: "sit", expr: say("a6", "say", "grin"), facing: -1, wave: 0.6 }, false);
      front(Y, LIB_IN[0] - 0.5, 0.2, -0.6, { mode: "sit", expr: "grin", facing: 1 }, false);
      break;

    case "sh20": // Celebration, 82 score jump!
      burst(LIB_IN[0] - 0.3, 1.4, 0, ws("n7", 6), 1.2, 14, "#ffd84a");
      front(Y, LIB_IN[0] - 0.3, 0, 0, { mode: "stand", expr: "grin", facing: 1, wave: 0.8 });
      front(A, LIB_IN[0] + 0.6, 0, 0, { mode: "stand", expr: "grin", facing: -1, wave: 0.8 });
      break;
  }

  return out;
};
