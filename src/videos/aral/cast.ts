// «Арал» cast as lit flat sprites in the 3D world (template cast.ts: canvas pool, Actor cards, Fx cards, person(),
// contact blobs); the stage() at the bottom is ours: fishermen, townsfolk, the grandpa and the kid by the bathtub,
// flounders, fish crates, the drinking sun, dust and splashes.
import * as THREE from "three";
import { Pen, bodyFront, fxBurst, fxSplash, fxPuff, fxShadow, fxContact, fxFlounder, fxFish, fxCrate, fxSunStraw, fisher, folk, ATA, BALA, Outfit, Expr, FrontOpts } from "./toon";
import { FPS, SHOTS, PIER, PIER_END, SHIPS, SETTLE, BOAT, BATH, BATH_Y, DAM_X0, DAM_X1, DAM_Z, CANAL, COTTON, terrainH, bathState, clamp01, glide } from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1440, 2400, 2.4] : d < 6.5 ? [900, 1500, 1.5] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

// ---------------- blinks ----------------
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number) => {
  const f = Math.round(t * FPS);
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, scale = 1): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2 * scale, z)) / scale;
  const [w, h, k] = tier(d);
  const light = light2D(cam, false), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed };
  return { key: `F|${who.okey}|${fkey(f2)}`, x, y, z, scale, draw: (p) => bodyFront(p, who.o, f2), size: [w, h, k] };
};
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

export type Stage = { places: Place[]; fx: FxPlace[] };
const FISH = [0, 1, 2, 3].map((v) => fisher(v));
const FOLK = [0, 1, 2, 3, 4, 5].map((v) => folk(v));
type Lv = { n: number; s: number; dam: number };

/** someone standing at (x, z) on the ground or the pier */
const stand = (cam: CamInfo, out: Stage, i: number, o: Outfit, okey: string, x: number, y: number, z: number, t: number, fo: FrontOpts, sc = 1) => {
  out.places.push(person(cam, { i, o, okey }, x, y, z, { mode: "stand", blink: lidAt(t, i), ...fo }, sc));
  blob(out, x, y, z, sc);
};
const fishAt = (out: Stage, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, rot = 0, cw = 400, ch = 260) =>
  out.fx.push({ key, cw, ch, draw, x, y, z, w, h, rot });

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo, lv: Lv): Stage => {
  const out: Stage = { places: [], fx: [] }, t = f / FPS;
  LNAME = SHOTS[id - 1].light;
  if (cam.sun) SUN.copy(cam.sun).normalize();
  const py = PIER.y, px = PIER.x;
  switch (id) {
    case 2: case 6: {
      // 1957 harbour / the sea running away: fishermen along the pier, townsfolk on the shore
      const shock = id === 6 ? (f >= 666 ? 2 : f >= 628 ? 1 : 0) : 0;
      const pierExpr: Expr = (["smile", "grin", "nervous", "shock"] as Expr[])[Math.min(3, shock + (id === 6 ? 1 : 0))];
      [[-1.2, 512], [1.1, 522], [-0.8, 540], [1.3, 556], [0.2, 575]].forEach(([dx, z], k) =>
        stand(cam, out, 10 + k, FISH[k % 4], `fi${k % 4}`, px + dx, py, z, t, { expr: k === 2 && id === 2 ? "laugh" : pierExpr, wave: id === 2 && k === 4 ? q(Math.sin(t * 8), 20) : undefined }));
      [[-18, 618], [-10, 624], [16, 620], [24, 628], [-26, 630], [4, 632]].forEach(([x, z], k) =>
        stand(cam, out, 30 + k, k === 3 ? BALA : FOLK[k % 6], k === 3 ? "bala" : `fo${k % 6}`, x, terrainH(x, z), z, t, { expr: id === 6 ? (shock >= 2 ? "shock" : "nervous") : (["smile", "grin", "smile_closed"] as Expr[])[k % 3] }, k === 3 ? 0.72 : 1));
      break;
    }
    case 4: {
      // fishermen unloading crates; the stack grows on "қырық сегіз мың тонна" (f 394-444)
      const [ex, , ez] = PIER_END;
      stand(cam, out, 20, FISH[0], "fi0", ex - 1.0, py, ez + 2.2, t, { expr: "grin" });
      stand(cam, out, 21, FISH[1], "fi1", ex + 0.9, py, ez + 4.0, t, { expr: f > 420 ? "laugh" : "smile" });
      stand(cam, out, 22, FISH[2], "fi2", ex - 0.2, py, ez + 6.3, t, { expr: "smile_closed" });
      const n = 2 + Math.max(0, Math.min(8, Math.floor((f - 394) / 6)));
      for (let k = 0; k < n; k++) {
        const row = k < 5 ? 0 : k < 9 ? 1 : k < 12 ? 2 : 3, inRow = row === 0 ? k : row === 1 ? k - 5 : row === 2 ? k - 9 : k - 12;
        out.fx.push({ key: `crate${k % 3}`, cw: 360, ch: 300, draw: (p) => fxCrate(p, k % 3), x: ex + 1.2 + (inRow - (4 - row) / 2) * 0.4, y: py + 0.2 + row * 0.34, z: ez + 3.6, w: 0.48, h: 0.4 });
      }
      break;
    }
    case 5: {
      // an engineer at the gate points the water toward the cotton; pickers far in the field
      const [gx, , gz] = CANAL[0];
      stand(cam, out, 40, FOLK[0], "fo0", gx - 34, terrainH(gx - 34, gz - 30), gz - 30, t, { expr: "grin", wave: q(Math.sin(t * 6) * 0.6, 20) });
      [[COTTON.x0 + 40, COTTON.z0 + 20], [COTTON.x0 + 70, COTTON.z0 + 34], [COTTON.x0 + 24, COTTON.z0 + 52]].forEach(([x, z], k) =>
        stand(cam, out, 41 + k, FOLK[(k + 1) % 6], `fo${(k + 1) % 6}`, x, terrainH(x, z), z, t, { expr: "smile" }));
      break;
    }
    case 7: {
      // the dry pier: fishermen staring down at the sand; the settling ship throws up dust
      const [ex, , ez] = PIER_END;
      stand(cam, out, 50, FISH[0], "fi0", ex - 0.9, py, ez + 1.5, t, { expr: "dazed" });
      stand(cam, out, 51, FISH[3], "fi3", ex + 1.0, py, ez + 3.2, t, { expr: "shock" });
      stand(cam, out, 52, FISH[1], "fi1", ex - 0.3, py, ez + 5.6, t, { expr: "nervous" });
      if (f >= SETTLE.f) {
        const sp = SHIPS[SETTLE.ship], gy = terrainH(sp.x, sp.z), u = clamp01((f - SETTLE.f - 10) / 36);
        for (let k = 0; k < 5; k++) {
          const a = k * 1.3, r = 6 + 6 * u;
          out.fx.push({ key: `puff${q(u, 30)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30)), x: sp.x + Math.cos(a) * r, y: gy + 0.8, z: sp.z + Math.sin(a) * r * 0.6, w: 7, h: 7, soft: true });
        }
      }
      break;
    }
    case 9: case 10: {
      // the low sea: a fisherman in a rowboat; "камбала" (f 1043) he lifts a flounder; shot 10: a boat full of flounders
      const wy = lv.n, bx = BOAT[0], bz = BOAT[2];
      const lift = id === 9 ? glide((f - 1036) / 8) : 1;
      stand(cam, out, 60, FISH[2], "fi2", bx - 0.2, wy + 0.35, bz + 0.1, t, { expr: id === 10 ? "dazed" : f >= 1043 ? "grin" : "neutral" });
      if (id === 9 && lift > 0) {
        const wig = Math.sin(t * 14) * (1 - lift * 0.5);
        fishAt(out, `flo${q(wig, 10)}`, (p) => fxFlounder(p, q(wig, 10)), bx + 0.25, wy + 0.35 + 1.25 + 0.45 * lift, bz + 0.35, 0.62, 0.4);
        if (f >= 1043 && f < 1056) { const u = (f - 1043) / 13; out.fx.push({ key: `burst${q(u, 13)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 13)), x: bx + 0.25, y: wy + 2.1, z: bz + 0.3, w: 1.3, h: 1.3 }); }
      }
      if (id === 10) {
        for (let k = 0; k < 12; k++) {
          const a = k * 2.4, r = 0.25 + 0.06 * (k % 4);
          out.fx.push({ key: "floF", cw: 400, ch: 260, draw: (p) => fxFlounder(p), x: bx + 0.35 + Math.cos(a) * r, y: wy + 0.2 + k * 0.012, z: bz - 0.6 + Math.sin(a) * r * 0.7, w: 0.55, h: 0.36, flat: true, rot: a });
        }
        fishAt(out, "floH", (p) => fxFlounder(p), bx + 0.3, wy + 1.55, bz + 0.25, 0.58, 0.38, -0.2);
      }
      break;
    }
    case 11: {
      // the bathtub yard: grandpa at the tap, the kid watching; the sun drinks through the straw
      const bs = bathState(f), [bx, , bz] = BATH, gy = BATH_Y + 0.1;
      const turning = (f >= 1360 && f < 1380) || (f >= 1458 && f < 1476);
      stand(cam, out, 70, ATA, "ata", bx - 1.55, gy, bz - 0.45, t, { expr: turning ? "grin" : f > 1404 && f < 1430 ? "nervous" : "smile_closed", wave: turning ? q(Math.sin(t * 10), 20) : undefined });
      stand(cam, out, 71, BALA, "bala", bx + 1.4, gy, bz + 0.75, t, { expr: f > 1394 && f < 1440 ? "shock" : f > 1500 ? "laugh" : "smile" }, 0.72);
      if (bs.straw > 0) {
        const sip = q(0.5 + 0.5 * Math.sin(t * 9), 10);
        out.fx.push({ key: `sun${sip}`, cw: 600, ch: 600, draw: (p) => fxSunStraw(p, sip), x: bx + 1.5, y: gy + 12.6, z: bz - 22.4, w: 7.0, h: 7.0 });
      }
      break;
    }
    case 12: {
      // dust where the dam is growing
      if (lv.dam > 0 && lv.dam < 1) {
        const x = DAM_X0 + (DAM_X1 - DAM_X0) * lv.dam, u = (t * 1.7) % 1;
        out.fx.push({ key: `puff${q(u, 30)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30)), x, y: 1, z: DAM_Z, w: 34, h: 34, soft: true });
      }
      break;
    }
    case 13: {
      // the water comes back: fishermen cheer, fish jump on "балық қайтты" (f 1763)
      const [ex, , ez] = PIER_END, up = f > 1712;
      stand(cam, out, 80, FISH[0], "fi0", ex - 1.0, py, ez + 1.6, t, { expr: up ? "laugh" : "nervous", wave: up ? q(Math.sin(t * 9), 20) : undefined });
      stand(cam, out, 81, FISH[1], "fi1", ex + 1.0, py, ez + 3.4, t, { expr: up ? "grin" : "neutral" });
      stand(cam, out, 82, BALA, "bala", ex + 0.1, py, ez + 5.4, t, { expr: f > 1760 ? "laugh" : "smile" }, 0.72);
      for (let k = 0; k < 6; k++) {
        const t0 = 1760 + k * 5, u = (f - t0) / 22;
        if (u <= 0 || u >= 1) continue;
        const x = ex - 6 + k * 2.6, z = ez - 10 - (k % 3) * 3, y = lv.n + 0.3 + 3.2 * Math.sin(u * Math.PI), rot = (u - 0.5) * 2.2 * (k % 2 ? 1 : -1);
        const tint = k % 2 ? "#a9b9c4" : "#c8b98a";
        out.fx.push({ key: `fish${tint}`, cw: 420, ch: 220, draw: (p) => fxFish(p, tint), x, y, z, w: 1.2, h: 0.63, rot });
        if (u > 0.85) out.fx.push({ key: `spl${q((u - 0.85) / 0.15, 10)}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, q((u - 0.85) / 0.15, 10)), x, y: lv.n + 0.6, z, w: 2.2, h: 2.2 });
      }
      break;
    }
    default: break;
  }
  return out;
};
