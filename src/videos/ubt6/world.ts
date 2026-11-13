// «30 КҮН» 6-күн: 5 sets in one three.js scene:
// 1. Bedroom (x -3..3)
// 2. Flower Boutique (x 15..21)
// 3. Formula Writing Desk (x 33..39)
// 4. Library Outside / Snowy Entrance (x 50..62)
// 5. Library Interior Reading Hall (x 72..84)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, LIB_OUT, LIB_IN } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

const FONT = "Montserrat, 'DejaVu Sans', 'Liberation Sans', sans-serif";
const basic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, transparent = false) =>
  new THREE.MeshBasicMaterial({ map: ctex(key, w, h, (g) => draw(g)), transparent, toneMapped: true });
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, stroke = "", lw = 0) => {
  g.font = `900 ${px}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- textures ----------------
const tilesTex = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 512, (g, r) => {
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s);
    g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.05})`; g.fillRect(i * s + 4, j * s + 4, s * 0.5, s * 0.2);
  }
  g.strokeStyle = "rgba(40,30,40,0.35)"; g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});

const parquetTex = (key: string) => ctex(key, 512, 512, (g, r) => {
  const cols = ["#b98552", "#a8743f", "#c69460", "#b07a46"];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
    const off = j % 2 ? 64 : 0;
    g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(i * 128 + off - 128, j * 64, 128, 64); g.fillRect(i * 128 + off, j * 64, 128, 64);
  }
  g.strokeStyle = "rgba(60,35,20,0.6)"; g.lineWidth = 3;
  for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(0, j * 64); g.lineTo(512, j * 64); g.stroke(); }
  for (let j = 0; j < 8; j++) for (let i = 0; i <= 4; i++) { const x = i * 128 + (j % 2 ? 64 : 0); g.beginPath(); g.moveTo(x, j * 64); g.lineTo(x, j * 64 + 64); g.stroke(); }
});

const wallTex = (key: string, paint: string, wains: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = paint; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(r() * 512, r() * 370, 30 + r() * 60, 6 + r() * 10); }
  g.fillStyle = wains; g.fillRect(0, 368, 512, 144);
  g.fillStyle = "rgba(40,25,15,0.55)"; g.fillRect(0, 362, 512, 10);
  for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(40,25,15,0.35)"; g.lineWidth = 3; g.strokeRect(i * 64 + 8, 384, 48, 112); }
});

const snowGroundTex = () => ctex("snowG6", 512, 512, (g, r) => {
  g.fillStyle = "#eaf2fb"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`;
    g.beginPath(); g.arc(r() * 512, r() * 512, 2 + r() * 4, 0, 7); g.fill();
  }
  for (let i = 0; i < 100; i++) {
    g.fillStyle = `rgba(180,210,240,${0.08 + r() * 0.1})`;
    g.fillRect(r() * 512, r() * 512, 10 + r() * 20, 4 + r() * 6);
  }
});

const bookshelfTex = () => ctex("bookshelf6", 512, 512, (g, r) => {
  g.fillStyle = "#4a2d18"; g.fillRect(0, 0, 512, 512);
  const bookColors = ["#b23b3b", "#3b6cb2", "#2e8540", "#d49b28", "#6a408a", "#2b2d36", "#c05832"];
  for (let shelf = 0; shelf < 4; shelf++) {
    const sy = shelf * 128 + 10;
    g.fillStyle = "#2c1a0e"; g.fillRect(0, sy + 110, 512, 18);
    let x = 10;
    while (x < 500) {
      const bw = 14 + Math.floor(r() * 16);
      const bh = 80 + Math.floor(r() * 25);
      g.fillStyle = bookColors[Math.floor(r() * bookColors.length)];
      g.fillRect(x, sy + 110 - bh, bw, bh);
      g.fillStyle = "rgba(255,255,255,0.2)";
      g.fillRect(x + 2, sy + 110 - bh, 3, bh);
      x += bw + 3;
    }
  }
});

const skyWindow = (key: string, mode: "day" | "golden") => basic(key, 512, 640, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 640);
  if (mode === "golden") { gr.addColorStop(0, "#8a6f9a"); gr.addColorStop(0.55, "#f7ae78"); gr.addColorStop(1, "#ffd08a"); }
  else { gr.addColorStop(0, "#6a9fe0"); gr.addColorStop(1, "#dcebf8"); }
  g.fillStyle = gr; g.fillRect(0, 0, 512, 640);
  g.fillStyle = "#f4f1ea";
  g.fillRect(246, 0, 20, 640); g.fillRect(0, 300, 512, 20);
  g.strokeStyle = "#241726"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 630);
});

const signMesh = (textStr: string, color: string, w: number, h: number) => {
  const m = basic(`sign-${textStr}`, 512, 128, (g) => {
    g.fillStyle = color; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(6, 6, 500, 116);
    text(g, textStr, 256, 64, 42, "#ffffff", "#120c06", 6);
  });
  const mesh = new THREE.Mesh(plane(w, h), m);
  mesh.layers.enable(NOINK);
  return mesh;
};

type Mats = Record<string, THREE.Material>;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4();
  private v = new THREE.Vector3();
  private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);

    M.bfloor = lam("bfloor6", () => ({ map: parquetTex("bfloorT6") }));
    M.bwall = lam("bwall6", () => ({ map: wallTex("bwallT6", "#dde4f0", "#788aa8") }));
    M.ceil = lam("ceil6", () => ({ color: "#f2efe6" }));
    M.white = lam("white6", () => ({ color: "#f4f4f2" }));
    M.cream = lam("cream6", () => ({ color: "#ecdcb8" }));
    M.dark = lam("dark6", () => ({ color: "#2b2b33" }));
    M.wood = lam("wood6", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk6", () => ({ color: "#6e4426" }));
    M.shopWall = lam("shopWall6", () => ({ map: wallTex("shopWallT6", "#fce4ec", "#d4528a") }));
    M.shopFloor = lam("shopFloor6", () => ({ map: tilesTex("shopFloorT6", "#fce4ec", "#ffffff", 8) }));
    M.deskWall = lam("deskWall6", () => ({ map: wallTex("deskWallT6", "#f2ede4", "#6d4c2b") }));
    M.deskFloor = lam("deskFloor6", () => ({ map: parquetTex("deskFloorT6") }));
    M.libWall = lam("libWall6", () => ({ map: wallTex("libWallT6", "#f4ede0", "#462b18") }));
    M.libFloor = lam("libFloor6", () => ({ map: parquetTex("libFloorT6") }));
    M.snow = lam("snowGround6", () => ({ map: snowGroundTex() }));
    M.lampWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 2.6, 1.2) });

    const walls = new Batch(), furn = new Batch();
    const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);

    const room = (m: THREE.Material, fl: THREE.Material, x0: number, x1: number, z0: number, z1: number, h: number) => {
      box(walls, fl, x0, -0.05, z0, x1, 0, z1, 2);
      box(walls, M.ceil, x0, h, z0, x1, h + 0.05, z1, 4);
      box(walls, m, x0, 0, z0 - 0.1, x1, h, z0, h);
      // Front wall omitted: diorama open to camera
      box(walls, m, x0 - 0.1, 0, z0, x0, h, z1, h);
      box(walls, m, x1, 0, z0, x1 + 0.1, h, z1, h);
    };

    // ======== 1. Bedroom (x -3..3, z -3..3) ========
    room(M.bwall, M.bfloor, -3.1, 3.1, -3.0, 3.0, 3.2);
    box(furn, M.woodDk, -1.2, 0, -2.4, 1.2, 0.45, -0.2);
    box(furn, M.white, -1.15, 0.45, -2.35, 1.15, 0.72, -0.25);
    box(furn, M.woodDk, -1.2, 0.45, -2.5, 1.2, 1.4, -2.4);
    box(furn, M.wood, 1.35, 0, -2.4, 1.95, 0.65, -1.8);

    const winBed = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winBed6", "day"));
    winBed.position.set(-1.8, 1.7, -2.99); R.add(winBed);

    // ======== 2. Flower Boutique (x 15..21) ========
    room(M.shopWall, M.shopFloor, 14.8, 21.2, -3.0, 3.0, 3.4);
    box(furn, M.white, 16.4, 0, -1.0, 19.6, 1.0, -0.2); // counter
    box(furn, M.woodDk, 16.0, 1.8, -2.9, 20.0, 1.9, -2.4); // shelf 1
    box(furn, M.woodDk, 16.0, 2.5, -2.9, 20.0, 2.6, -2.4); // shelf 2

    const shopSign = signMesh("ГҮЛДЕР ДҮКЕНІ", "#d4528a", 2.8, 0.65);
    shopSign.position.set(18.0, 3.1, -2.9); R.add(shopSign);

    // ======== 3. Formula Writing Desk (x 33..39) ========
    room(M.deskWall, M.deskFloor, 32.8, 39.2, -3.0, 3.0, 3.4);
    box(furn, M.woodDk, 34.6, 0.65, -1.3, 37.4, 0.75, 0.1); // tabletop
    box(furn, M.wood, 34.8, 0, -1.1, 35.0, 0.65, -0.9); // legs
    box(furn, M.wood, 37.0, 0, -1.1, 37.2, 0.65, -0.9);
    box(furn, M.wood, 34.8, 0, -0.1, 35.0, 0.65, 0.1);
    box(furn, M.wood, 37.0, 0, -0.1, 37.2, 0.65, 0.1);

    // ======== 4. Library Outside / Snowy Entrance (x 50..62) ========
    box(walls, M.snow, 46.0, -0.05, -8.0, 66.0, 0, 8.0, 4);
    box(furn, M.white, 51.0, 0.1, -3.5, 61.0, 0.35, -0.5, 2); // step 1
    box(furn, M.white, 52.0, 0.35, -4.0, 60.0, 0.6, -1.2, 2); // step 2
    box(walls, M.white, 50.0, 0.6, -4.5, 62.0, 5.0, -4.2); // facade wall

    // Columns
    for (const cx of [52.5, 54.8, 57.2, 59.5]) {
      box(furn, M.white, cx - 0.25, 0.6, -3.2, cx + 0.25, 4.5, -2.7);
    }

    const libSign = signMesh("ҚАЛАЛЫҚ КІТАПХАНА", "#1e3a6a", 5.2, 0.8);
    libSign.position.set(LIB_OUT[0], 4.7, -4.0); R.add(libSign);

    // Street Lamps
    for (const lx of [50.5, 61.5]) {
      box(furn, M.dark, lx - 0.04, 0, -1.2, lx + 0.04, 3.2, -1.12);
      furn.add(new THREE.CylinderGeometry(0.18, 0.12, 0.28, 12).translate(lx, 3.2, -1.16), M.lampWarm);
    }

    // ======== 5. Library Interior Reading Hall (x 72..84) ========
    room(M.libWall, M.libFloor, 71.8, 84.2, -3.5, 3.5, 4.2);

    const shelfMat = lam("shelfTex6", () => ({ map: bookshelfTex() }));
    const shelf1 = new THREE.Mesh(plane(4.0, 3.2), shelfMat);
    shelf1.position.set(75.5, 1.8, -3.42); shelf1.layers.enable(NOINK);
    const shelf2 = new THREE.Mesh(plane(4.0, 3.2), shelfMat);
    shelf2.position.set(80.5, 1.8, -3.42); shelf2.layers.enable(NOINK);
    R.add(shelf1, shelf2);

    // Reading Table
    box(furn, M.woodDk, 76.2, 0.65, -1.4, 79.8, 0.75, 0.2); // table top
    box(furn, M.wood, 76.4, 0, -1.2, 76.6, 0.65, -1.0); // legs
    box(furn, M.wood, 79.4, 0, -1.2, 79.6, 0.65, -1.0);
    box(furn, M.wood, 76.4, 0, 0, 76.6, 0.65, 0.2);
    box(furn, M.wood, 79.4, 0, 0, 79.6, 0.65, 0.2);

    const winLib = new THREE.Mesh(plane(1.8, 2.2), skyWindow("winLib6", "golden"));
    winLib.position.set(LIB_IN[0], 2.5, -3.43); winLib.layers.enable(NOINK);
    R.add(winLib);

    walls.build(R, false);
    furn.build(R, true);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): THREE.Vector3 {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);

    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 4, 6, 24);
    this.sun.position.copy(focus).addScaledVector(sunDir, 60); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 5; sc.far = 140; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);

    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;

    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));

    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 2.0))) continue;
      const a = this.actor(ai++);
      const [w, h, k2] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k2, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;

    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;

    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();

    return focus;
  }
}
