// «Көршінің баласы» cast as lit flat sprites in the 3D world (template cast.ts: canvas pool, Actor cards, Fx cards,
// person(), contact blobs); stage() at the bottom: the two fathers, the two boys, the flock, the horse, the dogs.
import * as THREE from "three";
import { Pen, bodyFront, fxPuff, fxShadow, fxContact, fxNote, fxStars, ASQAR, BERIK, ERLAN, DAUREN, sheepCard, horseCard, dogCard, sleeperCard, fxDombra, fxHandshake, fxMedal, Outfit, Expr, FrontOpts } from "./toon";
import { FPS, SHOTS, TAPSHAN, HAY_A, HORSE, SIT_Z, BEAT, terrainH, clamp01, glide } from "./story";
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
let LNAME: "day" | "golden" | "night" = "day";
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
const CONTACT: Record<"day" | "golden" | "night", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.3, 0.32, 0.45] };
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

/** someone standing (or sitting) at (x, y, z) */
const who = (cam: CamInfo, out: Stage, i: number, o: Outfit, okey: string, x: number, y: number, z: number, t: number, fo: FrontOpts, sc = 1, shadow = true) => {
  out.places.push(person(cam, { i, o, okey }, x, y, z, { mode: "stand", blink: lidAt(t, i), ...fo }, sc));
  if (shadow) blob(out, x, y, z, sc);
};
const KID = 0.8;
/** a lit animal / prop card in the 600 x 1000 design space (soles at y 975) */
const card = (cam: CamInfo, out: Stage, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, sc: number, dirX = 1, roll = 0) => {
  const d = cam.pos.distanceTo(new THREE.Vector3(x, y + 1, z)) / sc;
  const [w, h, k] = tier(d);
  const mirror = dirX * cam.right.x + 0 < 0;
  out.places.push({ key: `${key}|${w}`, x, y, z, scale: sc, mirror, roll, draw, size: [w, h, k] });
};
const sheep = (cam: CamInfo, out: Stage, x: number, z: number, dirX: number, step: number, i: number) => {
  const st = q(step, 4);
  card(cam, out, `sheep${st}`, (p) => sheepCard(p, st), x, terrainH(x, z), z, 1.15, dirX);
  blob(out, x, terrainH(x, z), z, 0.9);
  void i;
};
const notes = (out: Stage, x: number, y: number, z: number, t: number, n = 3) => {
  for (let k = 0; k < n; k++) {
    const u = (t * 0.6 + k / n) % 1, kind = k % 2;
    out.fx.push({ key: `note${kind}`, cw: 220, ch: 260, draw: (p) => fxNote(p, kind), x: x + 0.3 + 0.5 * u + 0.1 * Math.sin(u * 9 + k), y: y + 0.4 + 1.2 * u, z, w: 0.26, h: 0.31 });
  }
};
const dombra = (out: Stage, x: number, y: number, z: number, strum: number) =>
  out.fx.push({ key: "dombra", cw: 600, ch: 220, draw: fxDombra, x, y, z: z + 0.08, w: 0.95, h: 0.35, rot: 0.55 + 0.04 * strum });

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, t = f / FPS;
  LNAME = SHOTS[id - 1].light;
  if (cam.sun) SUN.copy(cam.sun).normalize();
  const flock = (cx: number, cz: number, n: number, spread: number, run = 0, seed = 0) => {
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + seed, r0 = 1.2 + spread * ((k * 0.37) % 1), r = r0 + run * (6 + 8 * ((k * 0.61) % 1));
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r * 0.8;
      sheep(cam, out, x, z, run > 0 ? Math.sign(Math.cos(a)) || 1 : (k % 2 ? 1 : -1), run > 0 ? Math.sin(t * 14 + k) * 0.5 + 0.5 : 0, k);
    }
  };
  const [tx, , tz] = TAPSHAN;
  switch (id) {
    case 1: case 2: case 15: {
      // the two boys in their yards, the fathers by the houses, the flock beyond
      const evening = id === 15;
      who(cam, out, 1, ERLAN, "erlan", evening ? -0.6 : -2.6, 0, evening ? SIT_Z + 1 : 11, t, { expr: evening ? "laugh" : "smile" }, KID);
      who(cam, out, 2, DAUREN, "dauren", evening ? 0.6 : 2.6, 0, evening ? SIT_Z + 1 : 11.6, t, { expr: evening ? "laugh" : "smile_closed" }, KID);
      who(cam, out, 3, ASQAR, "asqar", evening ? -0.8 : -12.5, 0, evening ? 12 : -8.5, t, { expr: "smile" });
      who(cam, out, 4, BERIK, "berik", evening ? 0.8 : 12.5, 0, evening ? 12 : -8.5, t, { expr: "smile" });
      flock(10, 46, 9, 4, 0, 1);
      break;
    }
    case 3: {
      // Asqar over the sleeping Erlan; beyond the fence Dauren drives the flock out at dawn
      who(cam, out, 3, ASQAR, "asqar", tx + 1.7, 0, tz + 0.7, t, { expr: f > 370 ? "shock" : "stern" });
      card(cam, out, "sleeper", (p) => sleeperCard(p, q(Math.sin(t * 2) * 0.5 + 0.5, 4)), tx - 0.2, 0.56, tz, 1.05);
      const dx = 6 + 7 * clamp01((f - 277) / 150);
      who(cam, out, 2, DAUREN, "dauren", dx, 0, -3.5, t, { expr: "grin" }, KID);
      for (let k = 0; k < 6; k++) sheep(cam, out, dx + 1.4 + (k % 3) * 1.1, -4.6 + Math.floor(k / 3) * 1.4 + 0.2 * Math.sin(k), 1, Math.sin(t * 9 + k) * 0.5 + 0.5, k);
      break;
    }
    case 4: {
      // dawn: Erlan with the flock; on "Бәрі әр жаққа" they bolt in every direction
      const run = glide((f - BEAT.scatter) / 30);
      who(cam, out, 1, ERLAN, "erlan", -6, 0, 40, t, { expr: run > 0.1 ? "shock" : "stern", wave: run > 0.1 ? q(Math.sin(t * 12), 20) : undefined }, KID);
      flock(-6, 38.5, 9, 2.2, run, 2);
      break;
    }
    case 5: {
      // Asqar points over the fence: Dauren plays the dombra on the other side
      who(cam, out, 3, ASQAR, "asqar", -1.15, 0, 7.4, t, { expr: "stern", wave: q(Math.sin(t * 5) * 0.4, 20) });
      who(cam, out, 2, DAUREN, "dauren", 3.4, 0, 3.4, t, { expr: "smile_closed" }, KID);
      dombra(out, 3.55, 0.95, 3.4, Math.sin(t * 20));
      notes(out, 3.4, 1.3, 3.4, t);
      break;
    }
    case 6: {
      // night: Erlan strums on the тапшан; the dogs answer
      const howl = glide((f - BEAT.howl) / 10);
      who(cam, out, 1, ERLAN, "erlan", tx + 0.2, 0.56, tz + 0.2, t, { expr: "dazed", mode: "sit" }, KID, false);
      dombra(out, tx + 0.36, 1.12, tz + 0.2, Math.sin(t * 24));
      notes(out, tx + 0.2, 1.5, tz + 0.2, t, 2);
      const hw = q(howl * (0.75 + 0.25 * Math.sin(t * 3)), 10);
      card(cam, out, `dog${hw}`, (p) => dogCard(p, hw), -10.6, 0, 7.6, 1.5, -1);
      card(cam, out, `dog${hw}`, (p) => dogCard(p, hw), 10.5, 0, 3, 1.0, 1);
      break;
    }
    case 7: {
      // "first at the bäige": Asqar opens his arms; beyond the fence Dauren with a medal, Berik beaming
      who(cam, out, 3, ASQAR, "asqar", -1.0, 0, 5.6, t, { expr: "nervous", wave: q(Math.sin(t * 7), 20) });
      who(cam, out, 2, DAUREN, "dauren", 5.2, 0, 2.6, t, { expr: "grin" }, KID);
      out.fx.push({ key: "medal", cw: 300, ch: 400, draw: fxMedal, x: 5.2, y: 1.42, z: 2.8, w: 0.3, h: 0.4, rot: 0.15 * Math.sin(t * 6) });
      who(cam, out, 4, BERIK, "berik", 7.4, 0, 1.6, t, { expr: "laugh" });
      card(cam, out, "horse0", (p) => horseCard(p, 0, 0), 9.6, 0, 0.6, 1.9, 1);
      break;
    }
    case 8: {
      // Erlan gets on; the horse rears; Erlan flies into the haystack
      const [hx, , hz] = HORSE;
      const rear = f < BEAT.buck ? 0 : f < 1012 ? Math.sin(clamp01((f - BEAT.buck) / 46) * Math.PI) : 0;
      const away = clamp01((f - 1010) / 30);
      card(cam, out, `horse${q(rear, 10)}${q(away > 0 ? Math.sin(t * 10) * 0.5 + 0.5 : 0, 4)}`, (p) => horseCard(p, q(rear, 10), q(away > 0 ? Math.sin(t * 10) * 0.5 + 0.5 : 0, 4)), hx + 8 * away, 0, hz, 1.9, 1);
      if (f < BEAT.mount) who(cam, out, 1, ERLAN, "erlan", hx + 0.9, 0, hz + 0.8, t, { expr: "stern" }, KID);
      else if (f < BEAT.buck + 6) who(cam, out, 1, ERLAN, "erlan", hx - 0.1, 1.15 + 0.4 * rear, hz + 0.3, t, { expr: f > BEAT.buck ? "shock" : "grin", mode: "sit" }, KID, false);
      else if (f < BEAT.land) {
        const u = (f - BEAT.buck - 6) / (BEAT.land - BEAT.buck - 6), [ax, , az] = HAY_A;
        const x = hx + (ax - hx) * u, z = hz + 0.3 + (az + 1.5 - hz - 0.3) * u, y = 1.6 + 3.2 * Math.sin(u * Math.PI) - 0.2 * u;
        out.places.push({ ...person(cam, { i: 1, o: ERLAN, okey: "erlan" }, x, y, z, { mode: "fall", expr: "shock", blink: 0 }, KID), roll: -u * 5.5 });
      } else {
        const [ax, , az] = HAY_A;
        who(cam, out, 1, ERLAN, "erlan", ax + 0.4, 1.05, az + 1.6, t, { expr: "dazed", mode: "sit" }, KID, false);
        const u = q(clamp01((f - BEAT.land) / 24), 24);
        for (let k = 0; k < 5; k++) out.fx.push({ key: `puff${u}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, u), x: ax + Math.cos(k * 1.3) * 1.6, y: 1.6, z: az + 1.6 + Math.sin(k * 1.3) * 0.8, w: 2.0, h: 2.0, soft: true });
        const s2 = q((t * 0.9) % 1, 30);
        out.fx.push({ key: `stars${s2}`, cw: 420, ch: 210, draw: (p) => fxStars(p, s2), x: ax + 0.4, y: 2.15, z: az + 1.7, w: 0.6, h: 0.3 });
      }
      break;
    }
    case 9: case 10: case 11: case 12: {
      const peek = id === 12 && f >= BEAT.peek, fathers = id === 12 && f >= BEAT.fathers;
      const sad: Expr = "pained";
      if (peek) {
        const k = f >= BEAT.peek + 20 ? 1 : 0;
        who(cam, out, 1, ERLAN, "erlan", -0.42, 0, SIT_Z, t, { expr: k ? "smile" : "shock", look: 1 }, KID);
        who(cam, out, 2, DAUREN, "dauren", 0.42, 0, SIT_Z, t, { expr: k ? "smile" : "shock", look: -1 }, KID);
      } else {
        who(cam, out, 1, ERLAN, "erlan", -0.55, 0, SIT_Z, t, { expr: sad, mode: "sit" }, KID);
        if (id >= 10) who(cam, out, 2, DAUREN, "dauren", 0.55, 0, SIT_Z, t, { expr: sad, mode: "sit" }, KID);
      }
      if (id === 10) who(cam, out, 4, BERIK, "berik", 2.3, 0, SIT_Z - 0.6, t, { expr: "stern", wave: q(Math.sin(t * 6) * 0.5, 20) });
      if (fathers) {
        who(cam, out, 3, ASQAR, "asqar", -1.45, 0, SIT_Z - 1.0, t, { expr: "nervous", look: 1 });
        who(cam, out, 4, BERIK, "berik", 1.45, 0, SIT_Z - 1.0, t, { expr: "nervous", look: -1 });
      }
      break;
    }
    case 14: {
      // the deal over the fence; the boys laugh together in front of it
      who(cam, out, 3, ASQAR, "asqar", -0.85, 0, 12, t, { expr: f > BEAT.deal ? "grin" : "smile_closed" });
      who(cam, out, 4, BERIK, "berik", 0.85, 0, 12, t, { expr: f > BEAT.deal ? "grin" : "smile_closed" });
      if (f > BEAT.deal) out.fx.push({ key: "handshake", cw: 500, ch: 300, draw: fxHandshake, x: 0, y: 1.32, z: 12.12, w: 0.8, h: 0.48 });
      who(cam, out, 1, ERLAN, "erlan", -0.55, 0, SIT_Z + 0.9, t, { expr: "laugh" }, KID);
      who(cam, out, 2, DAUREN, "dauren", 0.55, 0, SIT_Z + 0.9, t, { expr: "laugh" }, KID);
      break;
    }
    default: break;
  }
  return out;
};
void glide;
