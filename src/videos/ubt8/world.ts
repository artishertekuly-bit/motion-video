// «30 КҮН» 8-күн: 2 sets in one three.js scene:
// 1. Classroom (x -4..4, Gulnar apai's strict trial)
// 2. Study Hall / Corridor (x 32..40, Aruzhan's strategy blueprint)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, CORRIDOR_POS } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

const basic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, transparent = false) =>
  new THREE.MeshBasicMaterial({ map: ctex(key, w, h, (g) => draw(g)), transparent, toneMapped: true });
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
// ---------------- textures ----------------
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

const hallwayTileTex = (key: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = "#e2e6eb"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = (x / 64 + y / 64) % 2 === 0 ? "#d5dbe2" : "#e8ecf1";
      g.fillRect(x, y, 64, 64);
      g.strokeStyle = "rgba(120,130,145,0.3)"; g.lineWidth = 2;
      g.strokeRect(x, y, 64, 64);
    }
  }
});

const wallTex = (key: string, paint: string, wains: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = paint; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(r() * 512, r() * 370, 30 + r() * 60, 6 + r() * 10); }
  g.fillStyle = wains; g.fillRect(0, 368, 512, 144);
  g.fillStyle = "rgba(40,25,15,0.55)"; g.fillRect(0, 362, 512, 10);
  for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(40,25,15,0.35)"; g.lineWidth = 3; g.strokeRect(i * 64 + 8, 384, 48, 112); }
});

const blackboardTex = () => ctex("blackboard8", 1024, 512, (g, r) => {
  g.fillStyle = "#1b3326"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`;
    g.fillRect(r() * 1024, r() * 512, 40 + r() * 100, 20 + r() * 40);
  }
  g.strokeStyle = "#5a3a22"; g.lineWidth = 20; g.strokeRect(10, 10, 1004, 492);
  g.fillStyle = "rgba(255,255,255,0.92)"; g.font = "900 42px 'DejaVu Sans', sans-serif";
  g.fillText("E = h · ν", 80, 105);
  g.fillText("λ = h / p", 80, 195);
  g.fillText("ΔU = Q + A", 80, 285);
  g.fillText("F = G · M·m / R²", 80, 375);

  g.fillStyle = "#ff4d4d"; g.font = "900 52px 'DejaVu Sans', sans-serif";
  g.fillText("ҰБТ: С ДЕҢГЕЙІ!", 540, 140);
  g.fillStyle = "#ffd84a"; g.font = "900 38px 'DejaVu Sans', sans-serif";
  g.fillText("Қатал сынақ: 58/140", 540, 240);
  g.fillStyle = "#ffffff"; g.font = "900 34px 'DejaVu Sans', sans-serif";
  g.fillText("Күрделі есептер 📉", 540, 330);
});

const strategyBoardTex = () => ctex("strategyBoard8", 1024, 512, (g) => {
  g.fillStyle = "#f5f7fa"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#2b3d68"; g.lineWidth = 14; g.strokeRect(8, 8, 1008, 496);

  g.fillStyle = "#1f2a44"; g.font = "900 44px 'DejaVu Sans', sans-serif"; g.textAlign = "center";
  g.fillText("ҰБТ-НЫ БҰЗУ СТРАТЕГИЯСЫ", 512, 80);

  // Tier A
  g.fillStyle = "#e6f8ee"; g.fillRect(60, 130, 270, 240);
  g.strokeStyle = "#2fb36b"; g.lineWidth = 6; g.strokeRect(60, 130, 270, 240);
  g.fillStyle = "#2fb36b"; g.font = "900 32px 'DejaVu Sans', sans-serif";
  g.fillText("А ДЕҢГЕЙІ", 195, 185);
  g.fillStyle = "#1f2a44"; g.font = "900 24px 'DejaVu Sans', sans-serif";
  g.fillText("30/30 База", 195, 245);
  g.fillStyle = "#2fb36b"; g.font = "900 28px 'DejaVu Sans', sans-serif";
  g.fillText("Меңгерілді ✓", 195, 305);

  // Tier B
  g.fillStyle = "#fef8e7"; g.fillRect(375, 130, 270, 240);
  g.strokeStyle = "#f5a623"; g.lineWidth = 6; g.strokeRect(375, 130, 270, 240);
  g.fillStyle = "#f5a623"; g.font = "900 32px 'DejaVu Sans', sans-serif";
  g.fillText("В ДЕҢГЕЙІ", 510, 185);
  g.fillStyle = "#1f2a44"; g.font = "900 24px 'DejaVu Sans', sans-serif";
  g.fillText("40/40 Стандарт", 510, 245);
  g.fillStyle = "#f5a623"; g.font = "900 28px 'DejaVu Sans', sans-serif";
  g.fillText("Талдау 📝", 510, 305);

  // Tier C
  g.fillStyle = "#fbeeed"; g.fillRect(690, 130, 270, 240);
  g.strokeStyle = "#e84368"; g.lineWidth = 6; g.strokeRect(690, 130, 270, 240);
  g.fillStyle = "#e84368"; g.font = "900 32px 'DejaVu Sans', sans-serif";
  g.fillText("С ДЕҢГЕЙІ", 825, 185);
  g.fillStyle = "#1f2a44"; g.font = "900 24px 'DejaVu Sans', sans-serif";
  g.fillText("30/30 Күрделі", 825, 245);
  g.fillStyle = "#e84368"; g.font = "900 28px 'DejaVu Sans', sans-serif";
  g.fillText("100+ ШЫҢ 🎯", 825, 305);

  g.fillStyle = "#2b3d68"; g.font = "900 30px 'DejaVu Sans', sans-serif";
  g.fillText("Күніне 10 күрделі есеп = 100+ Бағындыру!", 512, 440);
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

    M.cfloor = lam("cfloor8", () => ({ map: parquetTex("cfloorT8") }));
    M.hfloor = lam("hfloor8", () => ({ map: hallwayTileTex("hfloorT8") }));
    M.cwall = lam("cwall8", () => ({ map: wallTex("cwallT8", "#edf3ea", "#4e6a57") }));
    M.hwall = lam("hwall8", () => ({ map: wallTex("hwallT8", "#eef2f8", "#384a68") }));
    M.ceil = lam("ceil8", () => ({ color: "#f2efe6" }));
    M.wood = lam("wood8", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk8", () => ({ color: "#6e4426" }));

    const walls = new Batch(), furn = new Batch();
    const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);

    const room = (m: THREE.Material, fl: THREE.Material, x0: number, x1: number, z0: number, z1: number, h: number) => {
      box(walls, fl, x0, -0.05, z0, x1, 0, z1, 2);
      box(walls, M.ceil, x0, h, z0, x1, h + 0.05, z1, 4);
      box(walls, m, x0, 0, z0 - 0.1, x1, h, z0, h);
      box(walls, m, x0 - 0.1, 0, z0, x0, h, z1, h);
      box(walls, m, x1, 0, z0, x1 + 0.1, h, z1, h);
    };

    // ======== 1. Classroom Set (x -3.8..3.8, z -2.8..2.8) ========
    room(M.cwall, M.cfloor, -3.8, 3.8, -2.8, 2.8, 3.6);

    // Blackboard on back wall
    const boardMat = lam("boardTex8", () => ({ map: blackboardTex() }));
    const blackboard = new THREE.Mesh(plane(4.4, 2.2), boardMat);
    blackboard.position.set(0, 1.8, -2.75); blackboard.layers.enable(NOINK);
    R.add(blackboard);

    // Student Desks & Chairs
    box(furn, M.woodDk, -1.8, 0.65, -0.6, 1.8, 0.74, 0.2); // front desk top
    box(furn, M.wood, -1.7, 0, -0.5, -1.5, 0.65, -0.3); // legs
    box(furn, M.wood, 1.5, 0, -0.5, 1.7, 0.65, -0.3);
    box(furn, M.wood, -1.7, 0, 0.0, -1.5, 0.65, 0.2);
    box(furn, M.wood, 1.5, 0, 0.0, 1.7, 0.65, 0.2);

    // Window on left wall
    const winClass = new THREE.Mesh(plane(1.6, 2.0), skyWindow("winClass8", "day"));
    winClass.position.set(-3.75, 2.0, -0.5); winClass.rotation.y = Math.PI / 2;
    winClass.layers.enable(NOINK); R.add(winClass);

    // ======== 2. Study Hall / Corridor Set (x 32.2..39.8) ========
    room(M.hwall, M.hfloor, 32.2, 39.8, -2.8, 2.8, 3.6);

    // Strategy Board on back wall
    const stratMat = lam("stratBoardTex8", () => ({ map: strategyBoardTex() }));
    const stratBoard = new THREE.Mesh(plane(4.4, 2.2), stratMat);
    stratBoard.position.set(CORRIDOR_POS[0], 1.8, -2.75); stratBoard.layers.enable(NOINK);
    R.add(stratBoard);

    // Study Desk / Bench
    box(furn, M.woodDk, CORRIDOR_POS[0] - 1.6, 0.65, -0.6, CORRIDOR_POS[0] + 1.6, 0.74, 0.2);
    box(furn, M.wood, CORRIDOR_POS[0] - 1.5, 0, -0.5, CORRIDOR_POS[0] - 1.3, 0.65, -0.3);
    box(furn, M.wood, CORRIDOR_POS[0] + 1.3, 0, -0.5, CORRIDOR_POS[0] + 1.5, 0.65, -0.3);

    // Window on right wall with golden evening sunlight
    const winHall = new THREE.Mesh(plane(1.6, 2.0), skyWindow("winHall8", "golden"));
    winHall.position.set(39.75, 2.0, -0.5); winHall.rotation.y = -Math.PI / 2;
    winHall.layers.enable(NOINK); R.add(winHall);

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
