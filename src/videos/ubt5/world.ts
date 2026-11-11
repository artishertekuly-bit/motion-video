// «30 КҮН» 5-күн: 5 sets in one three.js scene:
// 1. Bedroom (x -3..3)
// 2. Morning running street (x 12..24)
// 3. School classroom / exam hall (x 34..44)
// 4. School corridor with notice board (x 52..60)
// 5. Snowy street to library (x 70..82)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, BCLOCK, CLASS_POS, CCLOCK, BOARD_POS, WALK_POS } from "./story";

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

const snowGroundTex = () => ctex("snowG5", 512, 512, (g, r) => {
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

const cityBuildingTex = () => ctex("cityB5", 512, 1024, (g, r) => {
  g.fillStyle = "#2c3b5a"; g.fillRect(0, 0, 512, 1024);
  const rows = 12, cols = 6;
  const cw = 512 / cols, ch = 1024 / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const lit = r() > 0.45;
      g.fillStyle = lit ? (r() > 0.3 ? "#ffd978" : "#ffeed0") : "#1c253c";
      g.fillRect(x * cw + 14, y * ch + 16, cw - 28, ch - 32);
      if (lit) {
        g.fillStyle = "rgba(255,255,255,0.4)";
        g.fillRect(x * cw + 18, y * ch + 20, cw - 36, 6);
      }
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

const clockFace = (key: string) => basic(key, 400, 400, (g) => {
  g.fillStyle = "#f4f1ea"; g.beginPath(); g.arc(200, 200, 190, 0, 7); g.fill();
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.beginPath(); g.arc(200, 200, 182, 0, 7); g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    g.lineWidth = i % 3 ? 6 : 12;
    g.beginPath();
    g.moveTo(200 + 150 * Math.sin(a), 200 - 150 * Math.cos(a));
    g.lineTo(200 + 168 * Math.sin(a), 200 - 168 * Math.cos(a));
    g.stroke();
  }
  g.fillStyle = "#d23b3b"; g.beginPath(); g.arc(200, 200, 16, 0, 7); g.fill();
});

type Mats = Record<string, THREE.Material>;
type Dyn = {
  bHands: { h: THREE.Object3D; m: THREE.Object3D };
  cHands: { h: THREE.Object3D; m: THREE.Object3D };
};

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
  private d: Dyn;

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);

    M.bfloor = lam("bfloor5", () => ({ map: parquetTex("bfloorT5") }));
    M.bwall = lam("bwall5", () => ({ map: wallTex("bwallT5", "#dde4f0", "#788aa8") }));
    M.ceil = lam("ceil5", () => ({ color: "#f2efe6" }));
    M.white = lam("white5", () => ({ color: "#f4f4f2" }));
    M.cream = lam("cream5", () => ({ color: "#ecdcb8" }));
    M.dark = lam("dark5", () => ({ color: "#2b2b33" }));
    M.wood = lam("wood5", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk5", () => ({ color: "#6e4426" }));
    M.cwall = lam("cwall5", () => ({ map: wallTex("cwallT5", "#e9e4d8", "#4f6f8f") }));
    M.cfloor = lam("cfloor5", () => ({ map: tilesTex("cfloorT5", "#c9c4ba", "#aaa49a", 6) }));
    M.classWall = lam("classWall5", () => ({ map: wallTex("classWallT5", "#eef0ea", "#487a58") }));
    M.classFloor = lam("classFloor5", () => ({ map: parquetTex("classFloorT5") }));
    M.snow = lam("snowGround5", () => ({ map: snowGroundTex() }));
    M.city = lam("cityB5", () => ({ map: cityBuildingTex() }));
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

    // Bed frame & mattress
    box(furn, M.woodDk, -1.2, 0, -2.4, 1.2, 0.45, -0.2);
    box(furn, M.white, -1.15, 0.45, -2.35, 1.15, 0.72, -0.25);
    box(furn, M.woodDk, -1.2, 0.45, -2.5, 1.2, 1.4, -2.4);
    box(furn, M.wood, 1.35, 0, -2.4, 1.95, 0.65, -1.8);

    const winBed = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winBed5", "day"));
    winBed.position.set(-1.8, 1.7, -2.99); R.add(winBed);

    // Wall Clock at 10:00
    const bClockMesh = new THREE.Mesh(new THREE.CircleGeometry(0.24, 40), clockFace("bClockFace5"));
    bClockMesh.position.set(...BCLOCK); R.add(bClockMesh);
    const hand = (pos: [number, number, number], len: number, w: number, col: string, z: number) => {
      const pivot = new THREE.Group(); pivot.position.set(pos[0], pos[1], pos[2] + z);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len).translate(0, len / 2 - 0.012, 0), new THREE.MeshBasicMaterial({ color: col }));
      m.layers.set(NOINK); pivot.add(m); R.add(pivot); return pivot;
    };
    const bHands = {
      h: hand(BCLOCK, 0.11, 0.026, "#241726", 0.004),
      m: hand(BCLOCK, 0.16, 0.016, "#241726", 0.006),
    };
    bHands.h.rotation.z = (10 / 12) * Math.PI * 2;
    bHands.m.rotation.z = 0;

    // Wall calendar «26» (СЫНАҚ ТЕСТ)
    const cal26 = new THREE.Mesh(plane(0.42, 0.52), basic("calendar26", 420, 520, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 420, 520);
      g.fillStyle = "#d23b3b"; g.fillRect(0, 0, 420, 130);
      text(g, "ЖҰМА", 210, 68, 56, "#ffffff");
      text(g, "26", 210, 320, 210, "#241726");
      g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(6, 6, 408, 508);
    }));
    cal26.position.set(1.4, 1.85, -2.99); R.add(cal26);

    // ======== 2. Morning running street (x 12..24) ========
    box(walls, M.snow, 10, -0.05, -6, 26, 0, 6, 4);
    box(furn, M.cfloor, 11, 0.01, -1.2, 25, 0.02, 1.2, 2);
    for (let i = 0; i < 4; i++) {
      const bx = 12 + i * 3.5;
      box(furn, M.city, bx - 1.4, 0, -4.5, bx + 1.4, 7.5, -4.2);
    }

    // ======== 3. School Classroom (x 34..44) ========
    room(M.classWall, M.classFloor, 33.5, 43.5, -3.2, 3.2, 3.4);

    const board = new THREE.Mesh(plane(3.4, 1.4), basic("blackboard5", 680, 280, (g) => {
      g.fillStyle = "#244a34"; g.fillRect(0, 0, 680, 280);
      g.strokeStyle = "#8a5232"; g.lineWidth = 14; g.strokeRect(7, 7, 666, 266);
      text(g, "ҰБТ СЫНАҚ ТЕСТІ", 340, 75, 44, "#ffffff");
      text(g, "УАҚЫТЫ: 10:30 — 12:30", 340, 150, 38, "#ffd84a");
      text(g, "«ТӘРТІП ПЕН ТАЗАЛЫҚ»", 340, 220, 28, "#cfe5df");
    }));
    board.position.set(CLASS_POS[0], 2.0, -3.19); R.add(board);

    const cClockMesh = new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), clockFace("cClockFace5"));
    cClockMesh.position.set(CCLOCK[0] + 1.8, CCLOCK[1], -3.18); R.add(cClockMesh);
    const cHands = {
      h: hand([CCLOCK[0] + 1.8, CCLOCK[1], -3.18], 0.1, 0.024, "#241726", 0.004),
      m: hand([CCLOCK[0] + 1.8, CCLOCK[1], -3.18], 0.15, 0.014, "#241726", 0.006),
    };
    cHands.h.rotation.z = (12 / 12) * Math.PI * 2;
    cHands.m.rotation.z = 0;

    for (const dz of [-1.2, 0.6]) {
      for (const dx of [-1.5, 0, 1.5]) {
        const x = CLASS_POS[0] + dx, z = CLASS_POS[2] + dz;
        box(furn, M.wood, x - 0.55, 0.72, z - 0.25, x + 0.55, 0.76, z + 0.25);
        for (const [lx, lz] of [[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]])
          box(furn, M.dark, x + lx - 0.02, 0, z + lz - 0.02, x + lx + 0.02, 0.72, z + lz + 0.02);
        box(furn, M.woodDk, x - 0.25, 0.44, z + 0.4, x + 0.25, 0.48, z + 0.7);
        box(furn, M.woodDk, x - 0.25, 0.48, z + 0.68, x + 0.25, 0.95, z + 0.72);
      }
    }

    // ======== 4. School Corridor & Notice Board (x 52..60) ========
    room(M.cwall, M.cfloor, 51.5, 60.5, -3.2, 3.2, 3.4);

    const scoreBoard = new THREE.Mesh(plane(1.8, 1.4), basic("scoreBoard5", 540, 420, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 540, 420);
      g.fillStyle = "#1e2b4c"; g.fillRect(0, 0, 540, 80);
      text(g, "ҰБТ СЫНАҚ НӘТИЖЕЛЕРІ", 270, 42, 32, "#ffd84a");
      g.fillStyle = "#f8edf2"; g.fillRect(20, 100, 500, 60);
      text(g, "1. АРУЖАН  —  124 балл 👑", 270, 130, 32, "#d23b78");
      g.fillStyle = "#edf2f8"; g.fillRect(20, 175, 500, 60);
      text(g, "2. ЕРАСЫЛ  —  78 балл ⭐", 270, 205, 32, "#2e5fb0");
      text(g, "БӘС ҚОРЫТЫНДЫСЫ: АРУЖАН ЖЕҢДІ", 270, 275, 24, "#120c06");
      text(g, "Мектеп әкімшілігі", 270, 360, 22, "#7a8a9e");
      g.strokeStyle = "#241726"; g.lineWidth = 8; g.strokeRect(4, 4, 532, 412);
    }));
    scoreBoard.position.set(BOARD_POS[0], BOARD_POS[1], -3.19); R.add(scoreBoard);

    // ======== 5. Snowy Road to Library (x 70..82) ========
    box(walls, M.snow, 68, -0.05, -8, 84, 0, 8, 4);
    box(furn, M.cfloor, 69, 0.01, -1.2, 83, 0.02, 1.2, 2);

    const libSign = new THREE.Mesh(plane(3.2, 0.8), basic("libSign5", 640, 160, (g) => {
      g.fillStyle = "#8a5232"; g.fillRect(0, 0, 640, 160);
      g.strokeStyle = "#ffd84a"; g.lineWidth = 8; g.strokeRect(6, 6, 628, 148);
      text(g, "КІТАПХАНА / LIBRARY", 320, 80, 42, "#ffffff");
    }));
    libSign.position.set(WALK_POS[0], 2.8, -3.8); R.add(libSign);

    for (const lx of [71.5, 78.5]) {
      box(furn, M.dark, lx - 0.04, 0, -2.2, lx + 0.04, 3.2, -2.12);
      furn.add(new THREE.CylinderGeometry(0.18, 0.12, 0.28, 12).translate(lx, 3.2, -2.16), M.lampWarm);
    }

    walls.build(R, false);
    furn.build(R, true);

    this.d = { bHands, cHands };
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

    if (s.key === "sh09" || s.key === "sh10") {
      const prog = (f - s.a) / Math.max(1, s.b - s.a);
      this.d.cHands.m.rotation.z = -prog * Math.PI * 4;
    }

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
