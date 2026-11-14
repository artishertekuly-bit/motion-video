// «30 КҮН» 7-күн: 2 sets in one three.js scene:
// 1. Classroom (x -4..4, test analysis & prep)
// 2. Winter Outdoor Ice Rink / Medeu (x 24..48, ice, wooden rails, snowy mountains, pine trees)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, RINK_POS } from "./story";

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

const snowGroundTex = () => ctex("snowG7", 512, 512, (g, r) => {
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

const iceTex = () => ctex("iceRink7", 512, 512, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 512, 512);
  gr.addColorStop(0, "#d8ecf8"); gr.addColorStop(0.5, "#c5e4f5"); gr.addColorStop(1, "#b5dcf2");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 50; i++) {
    g.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.4})`;
    g.lineWidth = 1 + r() * 2.5;
    g.beginPath();
    const x = r() * 512, y = r() * 512, len = 30 + r() * 90, ang = r() * Math.PI;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(ang) * len * 0.5 + (r() - 0.5) * 20, y + Math.sin(ang) * len * 0.5, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.stroke();
  }
});

const blackboardTex = () => ctex("blackboard7", 1024, 512, (g, r) => {
  g.fillStyle = "#1b3326"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`;
    g.fillRect(r() * 1024, r() * 512, 40 + r() * 100, 20 + r() * 40);
  }
  g.strokeStyle = "#5a3a22"; g.lineWidth = 20; g.strokeRect(10, 10, 1004, 492);
  g.fillStyle = "rgba(255,255,255,0.92)"; g.font = "900 44px 'DejaVu Sans', sans-serif";
  g.fillText("Fүйк = μ · N", 80, 110);
  g.fillText("c² = a² + b²", 80, 200);
  g.fillText("sin²α + cos²α = 1", 80, 290);
  g.fillText("E = mc²", 80, 380);

  g.fillStyle = "#ffd84a"; g.font = "900 54px 'DejaVu Sans', sans-serif";
  g.fillText("ҰБТ-2026: 82/140!", 560, 150);
  g.fillStyle = "#ffffff"; g.font = "900 36px 'DejaVu Sans', sans-serif";
  g.fillText("Қатемен жұмыс: ✓", 560, 250);
  g.fillText("78 → 82 балл! (+4)", 560, 340);
});

const mountainTex = () => ctex("mountains7", 1024, 512, (g) => {
  g.clearRect(0, 0, 1024, 512);
  g.fillStyle = "#485b7d";
  g.beginPath();
  g.moveTo(0, 512); g.lineTo(0, 340); g.lineTo(160, 120); g.lineTo(340, 280);
  g.lineTo(520, 80); g.lineTo(720, 250); g.lineTo(880, 100); g.lineTo(1024, 320); g.lineTo(1024, 512);
  g.closePath(); g.fill();
  // Snowy peaks
  g.fillStyle = "#ffffff";
  g.beginPath(); g.moveTo(160, 120); g.lineTo(100, 200); g.lineTo(130, 210); g.lineTo(160, 190); g.lineTo(190, 220); g.lineTo(220, 180); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(520, 80); g.lineTo(440, 170); g.lineTo(480, 180); g.lineTo(520, 160); g.lineTo(560, 190); g.lineTo(600, 150); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(880, 100); g.lineTo(820, 170); g.lineTo(850, 180); g.lineTo(880, 160); g.lineTo(910, 190); g.lineTo(940, 160); g.closePath(); g.fill();
});

const pineTreeCard = (key: string) => basic(key, 512, 800, (g) => {
  g.clearRect(0, 0, 512, 800);
  // Trunk
  g.fillStyle = "#4a2d18"; g.fillRect(236, 620, 40, 180);
  // 3-tier pine
  const drawTier = (topY: number, botY: number, w: number) => {
    g.fillStyle = "#1e4620";
    g.beginPath(); g.moveTo(256, topY); g.lineTo(256 - w, botY); g.lineTo(256 + w, botY); g.closePath(); g.fill();
    // Snow cap
    g.fillStyle = "#ffffff";
    g.beginPath(); g.moveTo(256, topY); g.lineTo(256 - w * 0.45, topY + (botY - topY) * 0.45);
    g.lineTo(256 + w * 0.45, topY + (botY - topY) * 0.45); g.closePath(); g.fill();
  };
  drawTier(40, 280, 110);
  drawTier(200, 480, 170);
  drawTier(380, 660, 230);
}, true);

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

    M.cfloor = lam("cfloor7", () => ({ map: parquetTex("cfloorT7") }));
    M.cwall = lam("cwall7", () => ({ map: wallTex("cwallT7", "#edf3ea", "#4e6a57") }));
    M.ceil = lam("ceil7", () => ({ color: "#f2efe6" }));
    M.white = lam("white7", () => ({ color: "#f4f4f2" }));
    M.wood = lam("wood7", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk7", () => ({ color: "#6e4426" }));
    M.dark = lam("dark7", () => ({ color: "#2b2b33" }));
    M.snow = lam("snowGround7", () => ({ map: snowGroundTex() }));
    M.ice = lam("iceRinkMat7", () => ({ map: iceTex() }));
    M.lampWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 2.6, 1.2) });

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

    // ======== 1. Classroom Set (x -4..4, z -3..3) ========
    room(M.cwall, M.cfloor, -3.8, 3.8, -2.8, 2.8, 3.6);

    // Blackboard on back wall
    const boardMat = lam("boardTex7", () => ({ map: blackboardTex() }));
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
    const winClass = new THREE.Mesh(plane(1.6, 2.0), skyWindow("winClass7", "day"));
    winClass.position.set(-3.75, 2.0, -0.5); winClass.rotation.y = Math.PI / 2;
    winClass.layers.enable(NOINK); R.add(winClass);

    // ======== 2. Winter Ice Rink Set / Medeu (x 24..48) ========
    // Snow surround ground
    box(walls, M.snow, 18.0, -0.05, -12.0, 54.0, 0, 12.0, 6);

    // Ice rink sheet (glossy cyan reflective ice)
    box(furn, M.ice, 26.0, 0.02, -5.0, 46.0, 0.05, 5.0, 4);

    // Wooden perimeter rails around rink
    for (let x = 26.0; x <= 46.0; x += 2.0) {
      box(furn, M.woodDk, x - 0.06, 0.05, -5.06, x + 0.06, 1.05, -4.94); // back rail post
      box(furn, M.woodDk, x - 0.06, 0.05, 4.94, x + 0.06, 1.05, 5.06); // front rail post
    }
    box(furn, M.wood, 25.9, 0.95, -5.08, 46.1, 1.05, -4.92); // back top rail
    box(furn, M.wood, 25.9, 0.5, -5.05, 46.1, 0.58, -4.95); // back mid rail

    // Mountain Backdrop Cards
    const mountMat = new THREE.MeshBasicMaterial({ map: mountainTex(), transparent: true, toneMapped: true });
    const mountCard1 = new THREE.Mesh(plane(14.0, 7.0), mountMat);
    mountCard1.position.set(31.0, 3.8, -9.5); mountCard1.layers.enable(NOINK);
    const mountCard2 = new THREE.Mesh(plane(14.0, 7.0), mountMat);
    mountCard2.position.set(43.0, 3.8, -9.5); mountCard2.layers.enable(NOINK);
    R.add(mountCard1, mountCard2);

    // Snowy Pine Trees
    const pineMat = pineTreeCard("pineCard7");
    for (const [px, pz, ps] of [
      [24.0, -4.0, 3.5], [25.0, -7.0, 4.5], [47.0, -3.5, 3.5], [48.0, -6.5, 4.8],
      [28.0, -7.5, 4.0], [33.0, -8.0, 4.2], [39.0, -8.0, 4.2], [44.0, -7.5, 4.0]
    ]) {
      const tree = new THREE.Mesh(plane(ps * 0.65, ps), pineMat);
      tree.position.set(px, ps * 0.48, pz); tree.layers.enable(NOINK);
      R.add(tree);
    }

    // Ice Rink Entrance Arch Banner
    const rinkSign = signMesh("МҰЗ АЙДЫНЫ · MEDEU", "#1e3a6a", 5.0, 0.8);
    rinkSign.position.set(RINK_POS[0], 3.8, -5.1); R.add(rinkSign);

    // Street Lanterns around Rink
    for (const lx of [29.0, 43.0]) {
      box(furn, M.dark, lx - 0.05, 0, -4.8, lx + 0.05, 3.2, -4.7);
      furn.add(new THREE.CylinderGeometry(0.18, 0.12, 0.28, 12).translate(lx, 3.2, -4.75), M.lampWarm);
    }

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
