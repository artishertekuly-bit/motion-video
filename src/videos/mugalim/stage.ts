// «Мұғалім» portfolio: where the snow-leopard teacher stands on each 3D page, his pose, and the effect cards.
import { Pen, fxBurst, INK } from "./toon";
import { leopardFront, LeoOpts } from "./leopard";
import { SHOTS, HERO, LESSON, SEATED, JUMP } from "./story";
import { CamInfo, Stage, Place, blob, setLight, light2D } from "./cast";
import * as THREE from "three";

const tmp = new THREE.Vector3();
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design] (stills: generous) */
const tier = (d: number): [number, number, number] => (d < 3.2 ? [1800, 3000, 3] : d < 5.5 ? [1320, 2200, 2.2] : [720, 1200, 1.2]);

const teacher = (cam: CamInfo, x: number, y: number, z: number, o: LeoOpts, key: string): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.3, z));
  const size = tier(d);
  return { key: `leo|${key}|${JSON.stringify(o)}`, x, y, z, size, draw: (p) => leopardFront(p, { light: light2D(cam, false), ...o }) };
};

/** a test paper with a red «5» (graded excellent) */
const paper5 = (p: Pen, rot: number) => {
  const g = p.g;
  g.save(); g.translate(150, 190); g.rotate(rot); g.translate(-150, -190);
  p.poly([[40, 40], [260, 40], [260, 340], [40, 340]], "#fbfaf4", 8);
  for (let i = 0; i < 6; i++) p.stroke([[70, 90 + i * 34], [230 - (i % 2) * 40, 90 + i * 34]], 6, "rgba(60,70,110,0.55)");
  p.ell(185, 270, 52, 46, null, 0);
  g.lineWidth = 9; g.strokeStyle = "#d8332c"; g.beginPath(); g.ellipse(185, 270, 52, 46, -0.2, 0, Math.PI * 2); g.stroke();
  g.font = "900 82px Montserrat, 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d8332c"; g.fillText("5", 185, 274);
  g.restore();
};
const star = (p: Pen, s = 1, col = "#ffd84a") => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = (i % 2 ? 36 : 90) * s; pts.push([128 + r * Math.cos(a), 128 + r * Math.sin(a)]); }
  p.poly(pts, col, 10);
};
/** «!» spark lines over a head (300 x 300) */
const sparks = (p: Pen) => {
  for (const [a, l] of [[-150, 70], [-115, 90], [-75, 90], [-35, 70]] as const) {
    const r = (a * Math.PI) / 180;
    p.stroke([[150 + 70 * Math.cos(r), 220 + 70 * Math.sin(r)], [150 + (70 + l) * Math.cos(r), 220 + (70 + l) * Math.sin(r)]], 16, "#ffcf3a");
  }
};
/** small thought bubble with a lightbulb (400 x 400) */
const bulbThought = (p: Pen) => {
  for (const [x, y, r] of [[70, 360, 16], [110, 320, 24]] as const) p.ell(x, y, r, r * 0.9, "#ffffff", 7);
  p.ell(250, 170, 130, 120, "#ffffff", 9);
  p.ell(250, 150, 52, 54, "#ffe27a", 8);
  p.poly([[226, 196], [274, 196], [270, 236], [230, 236]], "#c9ccd2", 7);
  p.stroke([[236, 150], [250, 130], [264, 150]], 6, "#e8a23a");
  for (const a of [-160, -125, -90, -55, -20]) { const r = (a * Math.PI) / 180; p.stroke([[250 + 70 * Math.cos(r), 150 + 70 * Math.sin(r)], [250 + 92 * Math.cos(r), 150 + 92 * Math.sin(r)]], 7, "#e8a23a"); }
  void INK;
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  setLight(s.light, cam);
  const fx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false) =>
    out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft });
  switch (s.key) {
    case "hero": {
      const [x, y, z] = HERO;
      out.places.push(teacher(cam, x, y, z, { expr: "smug", arms: ["present", "book"], tail: -1, facing: 0, headTilt: -3 }, "hero"));
      blob(out, x, y, z);
      break;
    }
    case "lesson": {
      const [x, y, z] = LESSON;
      out.places.push(teacher(cam, x, y, z, { expr: "talk", facing: 1, arms: ["hang", "point"], tail: -1, look: 0.6, lookY: -1 }, "lesson"));
      blob(out, x, y, z);
      fx("sparks", 300, 300, sparks, -0.95, 2.35, -3.6, 0.42, 0.42);
      break;
    }
    case "desk": {
      const [x, y, z] = SEATED;
      out.places.push(teacher(cam, x, y, z, { expr: "think", legs: "sit", arms: ["deskRest", "deskChin"], tail: 1, facing: 0, headTilt: 4 }, "desk"));
      fx("bulb", 400, 400, bulbThought, x - 0.52, 1.72, z + 0.05, 0.52, 0.52);
      break;
    }
    case "joy": {
      const [x, y, z] = JUMP;
      out.places.push(teacher(cam, x, y, z, { expr: "joy", legs: "jump", arms: ["up", "up"], tail: 1, facing: 0 }, "joy"));
      blob(out, x, 0, z, 0.8, 0.6);
      fx("burst", 500, 500, (p) => fxBurst(p, 0.45, "#fff0a0", 14, 60, 240), x, 1.55, z - 0.35, 2.3, 2.3);
      fx("p5a", 300, 380, (p) => paper5(p, -0.25), x - 0.62, 1.95, z + 0.25, 0.32, 0.4);
      fx("p5b", 300, 380, (p) => paper5(p, 0.3), x + 0.66, 2.15, z + 0.15, 0.3, 0.38);
      fx("p5c", 300, 380, (p) => paper5(p, 0.1), x + 0.52, 1.35, z + 0.4, 0.26, 0.33);
      fx("starA", 256, 256, (p) => star(p, 1), x - 0.5, 2.45, z, 0.22, 0.22);
      fx("starB", 256, 256, (p) => star(p, 1, "#ff8fb0"), x + 0.3, 2.62, z - 0.1, 0.18, 0.18);
      fx("starC", 256, 256, (p) => star(p, 1, "#8fd8ff"), x - 0.72, 1.4, z + 0.1, 0.16, 0.16);
      break;
    }
    default:
  }
  void f;
  return out;
};
