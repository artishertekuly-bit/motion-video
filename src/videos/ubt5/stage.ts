// «30 КҮН» 5-күн: cast, per-shot staging and custom effect cards.
import { Pen, Outfit, Expr, FrontOpts, INK, fxBurst } from "./toon";
import { FPS, SHOTS, BED_POS, RUN_X, CLASS_POS, CORR_POS, WALK_POS } from "./story";
import { talking, ws } from "./timeline";
import { CamInfo, Stage, Who, person, blob, lidAt, setLight, q } from "./cast";

export const YSUIT: Outfit = { jacket: "#2b2d36", pants: "#2b2d36", boots: "#141418", hat: "hair", hair: "#1a1410", skin: "#f1c9a3", buttons: "#d9dde0", tie: "#c0353a" };
export const YPAJAMAS: Outfit = { jacket: "#6a88b8", pants: "#6a88b8", boots: "#42567a", hat: "hair", hair: "#1a1410", skin: "#f1c9a3" };
export const ARUZHAN: Outfit = { jacket: "#f4f1ea", dress: "#2e3e66", pants: "#3a3a48", boots: "#1c1c22", hat: "hair", hair: "#1e1410", long: "#1e1410", bow: true, skin: "#f3cfae" };

const Y: Who = { i: 1, o: YSUIT, okey: "ysuit" };
const YP: Who = { i: 1, o: YPAJAMAS, okey: "ypajamas" };
const A: Who = { i: 2, o: ARUZHAN, okey: "aru" };

const FONT = "900 64px Montserrat, 'DejaVu Sans', sans-serif";

/** Sleeping in bed with tangled blanket */
const bedSleeping = (p: Pen) => {
  p.poly([[60, 360], [540, 360], [520, 260], [80, 260]], "#8a5232", 10);
  p.ell(180, 230, 80, 40, "#ffffff", 8);
  p.ell(190, 215, 42, 38, "#f1c9a3", 8);
  p.poly([[150, 205], [210, 190], [230, 220], [175, 230]], "#1a1410", 6);
  p.stroke([[175, 215], [195, 215]], 5, INK);
  p.ell(330, 290, 170, 75, "#4d6d9e", 10);
  p.ell(330, 280, 160, 65, "#6285bc", 0);
  const g = p.g; g.save(); g.font = "900 48px Montserrat, sans-serif"; g.fillStyle = "#8cb2ea";
  g.fillText("Zzz...", 240, 160); g.restore();
};

/** Flying clothes and backpack in panic rush */
const flyingClothes = (p: Pen, t: number) => {
  p.poly([[120, 160], [170, 140], [190, 190], [140, 200]], "#f4f1ea", 6);
  p.poly([[420, 180], [490, 160], [510, 210], [430, 220]], "#c0353a", 8);
  p.ell(280, 150 + Math.sin(t * 8) * 15, 70, 85, "#2b2d36", 8);
  p.ell(280, 150 + Math.sin(t * 8) * 15, 55, 40, "#ffd84a", 6);
  for (let i = 0; i < 5; i++) {
    const y = 80 + i * 50;
    p.stroke([[60 + (i % 2) * 40, y], [200 + (i % 3) * 30, y]], 4, "rgba(255,255,255,0.7)");
    p.stroke([[360 + (i % 2) * 30, y], [520 + (i % 2) * 40, y]], 4, "rgba(255,255,255,0.7)");
  }
};

/** Math equations and test smoke */
const examFormulas = (p: Pen, t: number) => {
  const g = p.g;
  g.save(); g.font = FONT; g.textAlign = "center"; g.lineJoin = "round";
  const items = [
    { s: "x + y = 140", x: 200, y: 140 - (t * 20) % 80, c: "#ffd84a" },
    { s: "f'(x) = 2x", x: 400, y: 190 - (t * 25) % 80, c: "#ffffff" },
    { s: "S = v · t", x: 280, y: 260 - (t * 22) % 80, c: "#4cd98a" },
  ];
  for (const it of items) {
    g.lineWidth = 10; g.strokeStyle = INK; g.strokeText(it.s, it.x, it.y);
    g.fillStyle = it.c; g.fillText(it.s, it.x, it.y);
  }
  g.restore();
};

/** Floating hearts for romantic confession */
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

/** Flustered sweat drop and blush marks */
const flusteredFx = (p: Pen, _t: number) => {
  p.poly([[380, 110], [395, 135], [365, 135]], "#6bb7f5", 4);
  p.ell(380, 140, 15, 18, "#6bb7f5", 5);
  for (let i = 0; i < 3; i++) {
    p.stroke([[420, 120 + i * 16], [445, 120 + i * 16]], 4, INK);
    p.stroke([[160, 120 + i * 16], [185, 120 + i * 16]], 4, INK);
  }
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
      front(Y, CORR_POS[0], 0, 0, { mode: "stand", facing: 0, expr: "smile" });
      break;
    }
    case "sh02": {
      fx("bedSleep", 600, 450, bedSleeping, BED_POS[0], 0.8, -0.3, 2.3, 1.7);
      break;
    }
    case "sh03": {
      fx("bedSleep", 600, 450, bedSleeping, BED_POS[0], 0.8, -0.3, 2.3, 1.7);
      break;
    }
    case "sh04": {
      front(YP, BED_POS[0] - 0.2, 0.15, BED_POS[2] + 0.3, { mode: "stand", facing: 0, expr: say("e1", "sayStern", "shock"), wave: 0.8 }, false);
      burst(BED_POS[0] - 0.2, 1.4, BED_POS[2] + 0.3, W("e1", 0), 0.8, 12, "#ffd84a");
      break;
    }
    case "sh05": {
      front(Y, BED_POS[0] + 0.3, 0, BED_POS[2] + 0.6, { mode: "stand", facing: 1, expr: "dazed" });
      fx("flyingClothes", 600, 400, (p) => flyingClothes(p, (f - s.a) / FPS), BED_POS[0] + 0.2, 1.2, BED_POS[2] + 0.7, 2.0, 1.35, true);
      break;
    }
    case "sh06": {
      const rx = RUN_X + ((f - s.a) * 0.04) % 6;
      front(Y, rx, 0, 0, { mode: "march", facing: 1, expr: say("e2", "sayStern", "stern") });
      burst(rx - 0.5, 0.4, 0, W("e2", 0), 0.7, 10);
      break;
    }
    case "sh07": {
      front(Y, CLASS_POS[0] - 1.2, 0, 0, { mode: "march", facing: 1, expr: "dazed" });
      burst(CLASS_POS[0] - 1.2, 0.3, 0, W("n5", 3), 0.8, 10);
      break;
    }
    case "sh08": {
      front(A, CLASS_POS[0] + 0.8, 0.25, CLASS_POS[2] - 0.8, { mode: "sit", facing: -1, expr: "smile" }, false);
      front(Y, CLASS_POS[0] - 0.4, 0.25, CLASS_POS[2] - 0.8, { mode: "sit", facing: 1, expr: "stern" }, false);
      break;
    }
    case "sh09": {
      front(Y, CLASS_POS[0] - 0.4, 0.25, CLASS_POS[2] - 0.8, { mode: "sit", facing: 0, expr: say("e3", "sayStern", "think") }, false);
      fx("examFormulas", 600, 400, (p) => examFormulas(p, (f - s.a) / FPS), CLASS_POS[0] - 0.4, 1.45, CLASS_POS[2] - 0.7, 1.8, 1.2, true);
      break;
    }
    case "sh10": {
      front(Y, CLASS_POS[0] - 0.4, 0.25, CLASS_POS[2] - 0.8, { mode: "sit", facing: 0, expr: "relief_open", wave: 1 }, false);
      burst(CLASS_POS[0] - 0.4, 1.4, CLASS_POS[2] - 0.8, W("n7", 0), 0.9, 14, "#ffd84a");
      break;
    }
    case "sh11": {
      front(A, CORR_POS[0] + 0.7, 0, 0, { mode: "stand", facing: -1, expr: say("n8", "smile", "grin"), wave: 0.7 });
      burst(CORR_POS[0] + 0.7, 1.5, 0, W("n8", 4), 1.0, 14, "#ffd84a");
      break;
    }
    case "sh12": {
      front(Y, CORR_POS[0] - 0.7, 0, 0, { mode: "stand", facing: 1, expr: "relief_open", wave: 0.9 });
      burst(CORR_POS[0] - 0.7, 1.5, 0, W("n9", 2), 1.1, 16, "#4cd98a");
      break;
    }
    case "sh13": {
      front(Y, CORR_POS[0] - 0.6, 0, 0, { mode: "stand", facing: 0, expr: say("e4", "grin", "relief_open"), wave: 1 });
      burst(CORR_POS[0] - 0.6, 1.6, 0, W("e4", 4), 1.0, 14, "#4cd98a");
      break;
    }
    case "sh14": {
      front(A, CORR_POS[0] + 0.6, 0, 0, { mode: "stand", facing: -1, expr: say("a1", "sayStern", "stern") });
      front(Y, CORR_POS[0] - 0.6, 0, 0, { mode: "stand", facing: 1, expr: "dazed" });
      break;
    }
    case "sh15": {
      front(Y, CORR_POS[0] - 0.6, 0, 0, { mode: "stand", facing: 1, expr: say("e5", "sayNervous", "dazed") });
      front(A, CORR_POS[0] + 0.6, 0, 0, { mode: "stand", facing: -1, expr: "stern" });
      break;
    }
    case "sh16": {
      front(A, CORR_POS[0] + 0.6, 0, 0, { mode: "stand", facing: -1, expr: say("a2", "sayStern", "stern") });
      front(Y, CORR_POS[0] - 0.6, 0, 0, { mode: "stand", facing: 1, expr: "nervous" });
      break;
    }
    case "sh17": {
      front(Y, CORR_POS[0] - 0.45, 0, 0, { mode: "stand", facing: 1, expr: say("e6", "sayNervous", "nervous") });
      front(A, CORR_POS[0] + 0.55, 0, 0, { mode: "stand", facing: -1, expr: "shock" });
      const ht = (f % 45) / 45;
      fx("hearts", 500, 400, (p) => heartsFx(p, ht), CORR_POS[0] + 0.05, 1.5, 0.2, 0.75, 0.6, true);
      break;
    }
    case "sh18": {
      front(Y, CORR_POS[0] - 0.45, 0, 0, { mode: "stand", facing: 1, expr: say("e7", "nervous", "shock") });
      front(A, CORR_POS[0] + 0.55, 0, 0, { mode: "stand", facing: -1, expr: "smile" });
      fx("flustered", 500, 300, (p) => flusteredFx(p, (f - s.a) / FPS), CORR_POS[0] - 0.45, 1.55, 0.1, 0.7, 0.42, true);
      break;
    }
    case "sh19": {
      front(A, CORR_POS[0] + 0.5, 0, 0, { mode: "stand", facing: -1, expr: say("a3", "smile_closed", "grin") });
      front(Y, CORR_POS[0] - 0.5, 0, 0, { mode: "stand", facing: 1, expr: "relief_open", wave: 0.6 });
      break;
    }
    case "sh20": {
      front(Y, WALK_POS[0] - 0.55, 0, 0, { mode: "stroll", facing: 1, expr: "grin" });
      front(A, WALK_POS[0] + 0.55, 0, 0, { mode: "stroll", facing: 1, expr: "smile", wave: 0.6 });
      break;
    }
  }

  return out;
};
