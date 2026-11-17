// 3D Classroom Environment for «Көпір» (9 «Б» сынып)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, CLASS_POS } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

const basic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, transparent = false) =>
  new THREE.MeshBasicMaterial({ map: ctex(key, w, h, (g) => draw(g)), transparent, toneMapped: true });
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);

// ---------------- Textures ----------------
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

const blackboardTex = () => ctex("blackboardKopir", 1024, 512, (g, r) => {
  g.fillStyle = "#1e3328"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 100; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`;
    g.fillRect(r() * 1024, r() * 512, 40 + r() * 100, 20 + r() * 40);
  }
  g.strokeStyle = "#5a3a22"; g.lineWidth = 20; g.strokeRect(10, 10, 1004, 492);

  g.fillStyle = "rgba(255,255,255,0.95)"; g.font = "900 36px 'DejaVu Sans', sans-serif";
  g.fillText("9 «Б» · ФИЗИКА + ИНФОРМАТИКА", 50, 75);

  g.fillStyle = "#ffd84a"; g.font = "900 44px 'DejaVu Sans', sans-serif";
  g.fillText("«КӨПІР» КВЕСТІ: 4 ҚАДАМ", 50, 140);

  g.fillStyle = "rgba(255,255,255,0.9)"; g.font = "800 28px 'DejaVu Sans', sans-serif";
  g.fillText("1. Тапсырма & Рөлдер ➔ 2. 3D Модель ➔ 3. Сынақ ➔ 4. Спикер", 50, 210);

  // Chalk bridge sketch
  g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 6;
  g.strokeRect(50, 290, 80, 120); // Left desk
  g.strokeRect(400, 290, 80, 120); // Right desk
  g.beginPath();
  g.moveTo(130, 320); g.lineTo(400, 320); // Bridge deck
  g.moveTo(130, 320); g.lineTo(265, 260); g.lineTo(400, 320); // Truss top
  g.moveTo(200, 320); g.lineTo(265, 260); g.lineTo(330, 320);
  g.stroke();

  g.fillStyle = "#ff6b6b"; g.font = "900 32px 'DejaVu Sans', sans-serif";
  g.fillText("F ↓ (Жүк?)", 215, 240);
  g.fillStyle = "#4cd98a"; g.font = "800 24px 'DejaVu Sans', sans-serif";
  g.fillText("Максималды беріктік!", 530, 350);
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

    M.cfloor = lam("cfloorKopir", () => ({ map: parquetTex("cfloorTKopir") }));
    M.cwall = lam("cwallKopir", () => ({ map: wallTex("cwallTKopir", "#edf3ea", "#4e6a57") }));
    M.ceil = lam("ceilKopir", () => ({ color: "#f2efe6" }));
    M.wood = lam("woodKopir", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDkKopir", () => ({ color: "#6e4426" }));

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

    // Classroom Room (x -4..4, z -3..3)
    room(M.cwall, M.cfloor, CLASS_POS[0] - 4.0, CLASS_POS[0] + 4.0, -3.0, 3.0, 3.6);

    // Blackboard on back wall
    const boardMat = lam("boardTexKopir", () => ({ map: blackboardTex() }));
    const blackboard = new THREE.Mesh(plane(4.4, 2.2), boardMat);
    blackboard.position.set(CLASS_POS[0], 1.8, -2.95); blackboard.layers.enable(NOINK);
    R.add(blackboard);

    // Desks
    box(furn, M.woodDk, CLASS_POS[0] - 1.8, 0.65, -0.6, CLASS_POS[0] + 1.8, 0.74, 0.2);
    box(furn, M.wood, CLASS_POS[0] - 1.7, 0, -0.5, CLASS_POS[0] - 1.5, 0.65, -0.3);
    box(furn, M.wood, CLASS_POS[0] + 1.5, 0, -0.5, CLASS_POS[0] + 1.7, 0.65, -0.3);
    box(furn, M.wood, CLASS_POS[0] - 1.7, 0, 0.0, CLASS_POS[0] - 1.5, 0.65, 0.2);
    box(furn, M.wood, CLASS_POS[0] + 1.5, 0, 0.0, CLASS_POS[0] + 1.7, 0.65, 0.2);

    // Window on left wall with morning daylight
    const winClass = new THREE.Mesh(plane(1.6, 2.0), skyWindow("winKopir", "day"));
    winClass.position.set(CLASS_POS[0] - 3.95, 2.0, -0.5); winClass.rotation.y = Math.PI / 2;
    winClass.layers.enable(NOINK); R.add(winClass);

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
    const s = SHOTS[id - 1] ?? SHOTS[0];
    const L = LIGHTS[s.light ?? "day"], K = LOOK[s.light ?? "day"];
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
