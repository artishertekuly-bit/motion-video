// «30 КҮН» 4-күн: three sets in one three.js scene:
// 1. Kitchen (x -3..3)
// 2. School corridor (x 36.2..41)
// 3. Winter city park / evening street (x 65..80, z -8..8)
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { FPS, SHOTS, ShotDef, camAt, FRIDGE, KCLOCK, SNOWDRIFT_POS } from "./story";

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

const kitchenWallTex = () => ctex("kwall4", 512, 512, (g, r) => {
  g.fillStyle = "#f2e2b8"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 300; y += 40) for (let x = 0; x < 512; x += 40) { g.fillStyle = "rgba(200,120,80,0.18)"; g.beginPath(); g.arc(x + (y % 80 ? 20 : 0), y + 20, 6, 0, 7); g.fill(); }
  const s = 512 / 8;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? "#cfe5df" : "#e2f0ec"; g.fillRect(i * s, 320 + j * s, s, s); }
  g.strokeStyle = "rgba(40,30,40,0.3)"; g.lineWidth = 3;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * s, 320); g.lineTo(i * s, 512); g.stroke(); }
  for (let j = 0; j <= 3; j++) { g.beginPath(); g.moveTo(0, 320 + j * s); g.lineTo(512, 320 + j * s); g.stroke(); }
  void r;
});

const wallTex = (key: string, paint: string, wains: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = paint; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(r() * 512, r() * 370, 30 + r() * 60, 6 + r() * 10); }
  g.fillStyle = wains; g.fillRect(0, 368, 512, 144);
  g.fillStyle = "rgba(40,25,15,0.55)"; g.fillRect(0, 362, 512, 10);
  for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(40,25,15,0.35)"; g.lineWidth = 3; g.strokeRect(i * 64 + 8, 384, 48, 112); }
});

const snowGroundTex = () => ctex("snowG", 512, 512, (g, r) => {
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

const cityBuildingTex = () => ctex("cityB", 512, 1024, (g, r) => {
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

const skyWindow = (key: string, mode: "day" | "night" | "dawn") => basic(key, 512, 640, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 640);
  if (mode === "night") { gr.addColorStop(0, "#0e1430"); gr.addColorStop(1, "#2e3e76"); }
  else if (mode === "dawn") { gr.addColorStop(0, "#3a4a7a"); gr.addColorStop(0.6, "#df7e68"); gr.addColorStop(1, "#ffd08a"); }
  else { gr.addColorStop(0, "#6a9fe0"); gr.addColorStop(1, "#dcebf8"); }
  g.fillStyle = gr; g.fillRect(0, 0, 512, 640);
  if (mode === "night") {
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(360, 150, 52, 0, 7); g.fill();
    g.fillStyle = "#0e1430"; g.beginPath(); g.arc(385, 132, 46, 0, 7); g.fill();
  }
  g.fillStyle = mode === "night" ? "#c9cfe0" : "#f4f1ea";
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
  hands: { h: THREE.Object3D; m: THREE.Object3D; s: THREE.Object3D };
  winNight: THREE.Mesh; winDawn: THREE.Mesh; winDay: THREE.Mesh;
  phoneMesh: THREE.Mesh;
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

    M.kfloor = lam("kfloor4", () => ({ map: tilesTex("kfloorT4", "#d9c9a8", "#b9a27e") }));
    M.kwall = lam("kwall4", () => ({ map: kitchenWallTex() }));
    M.ceil = lam("ceil4", () => ({ color: "#f2efe6" }));
    M.white = lam("white4", () => ({ color: "#f4f4f2" }));
    M.cream = lam("cream4", () => ({ color: "#ecdcb8" }));
    M.dark = lam("dark4", () => ({ color: "#2b2b33" }));
    M.wood = lam("wood4", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk4", () => ({ color: "#6e4426" }));
    M.cwall = lam("cwall4", () => ({ map: wallTex("cwallT4", "#e9e4d8", "#4f6f8f") }));
    M.cfloor = lam("cfloor4", () => ({ map: tilesTex("cfloorT4", "#c9c4ba", "#aaa49a", 6) }));
    M.snow = lam("snowGround4", () => ({ map: snowGroundTex() }));
    M.city = lam("cityB4", () => ({ map: cityBuildingTex() }));
    M.lampWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 2.6, 1.2) });
    M.bark = lam("bark4", () => ({ color: "#3a2a20" }));
    M.red = lam("red4", () => ({ color: "#b0412e" }));
    M.blue = lam("blue4", () => ({ color: "#2e5fb0" }));
    M.teaCup = lam("teaCup4", () => ({ color: "#ffffff" }));

    const walls = new Batch(), furn = new Batch();
    const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
      b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);

    // ======== 1. Kitchen (x -3.1..3.1) ========
    const room = (m: THREE.Material, fl: THREE.Material, x0: number, x1: number, z0: number, z1: number, h: number) => {
      box(walls, fl, x0, -0.05, z0, x1, 0, z1, 2);
      box(walls, M.ceil, x0, h, z0, x1, h + 0.05, z1, 4);
      box(walls, m, x0, 0, z0 - 0.1, x1, h, z0, h);
      box(walls, m, x0, 0, z1, x1, h, z1 + 0.1, h);
      box(walls, m, x0 - 0.1, 0, z0, x0, h, z1, h);
      box(walls, m, x1, 0, z0, x1 + 0.1, h, z1, h);
    };
    room(M.kwall, M.kfloor, -3.1, 3.1, -3.2, 3.2, 3.2);

    // Fridge
    const [fx0] = FRIDGE;
    box(furn, M.white, fx0 - 0.4, 0, -3.2, fx0 + 0.4, 1.95, -2.5);
    box(furn, M.dark, fx0 - 0.4, 0.74, -2.5, fx0 + 0.4, 0.76, -2.48);
    box(furn, M.dark, fx0 + 0.28, 1.0, -2.48, fx0 + 0.33, 1.55, -2.44);

    // Base cabinets & table
    box(furn, M.cream, -1.85, 0, -3.2, 2.95, 0.88, -2.6);
    box(furn, M.wood, -1.9, 0.88, -3.22, 3.0, 0.94, -2.55);
    box(furn, M.wood, -0.3, 0.72, -1.05, 1.3, 0.76, -0.15);
    for (const [x, z] of [[-0.24, -1.0], [1.24, -1.0], [-0.24, -0.2], [1.24, -0.2]])
      box(furn, M.woodDk, x - 0.03, 0, z - 0.03, x + 0.03, 0.72, z + 0.03);
    box(furn, M.woodDk, 0.4, 0.44, -1.55, 0.9, 0.48, -1.1);
    box(furn, M.woodDk, 0.4, 0.48, -1.6, 0.9, 1.05, -1.55);

    // Tower of books on the kitchen table
    for (let i = 0; i < 7; i++) {
      const col = [M.red, M.blue, M.cream, M.dark, M.red, M.blue, M.cream][i];
      box(furn, col, 0.15 + (i % 2) * 0.02, 0.76 + i * 0.05, -0.7 + (i % 3) * 0.01, 0.45, 0.81 + i * 0.05, -0.4);
    }
    // 5 tea cups / bowls on the table
    for (const [tx, tz] of [[0.6, -0.4], [0.75, -0.42], [0.9, -0.4], [0.68, -0.55], [0.84, -0.56]]) {
      furn.add(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 12).translate(tx, 0.79, tz), M.teaCup);
    }

    // Window with Day / Night / Dawn views
    const winNight = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winKN4", "night"));
    winNight.position.set(1.35, 1.7, -3.19); R.add(winNight);
    const winDawn = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winKDawn4", "dawn"));
    winDawn.position.set(1.35, 1.7, -3.19); R.add(winDawn);
    const winDay = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winKDay4", "day"));
    winDay.position.set(1.35, 1.7, -3.19); R.add(winDay);

    // Wall Calendar «27»
    const cal = new THREE.Mesh(plane(0.42, 0.52), basic("calendar27", 420, 520, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 420, 520);
      g.fillStyle = "#d23b3b"; g.fillRect(0, 0, 420, 130);
      text(g, "ҚАРАША", 210, 68, 56, "#ffffff");
      text(g, "27", 210, 320, 210, "#241726");
      g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(6, 6, 408, 508);
    }));
    cal.position.set(-0.05, 1.85, -3.19); R.add(cal);

    // Wall Clock with spinning hands
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), clockFace("clockFace4"));
    clock.position.set(...KCLOCK); R.add(clock);
    const hand = (len: number, w: number, col: string, z: number) => {
      const pivot = new THREE.Group(); pivot.position.set(KCLOCK[0], KCLOCK[1], KCLOCK[2] + z);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len).translate(0, len / 2 - 0.012, 0), new THREE.MeshBasicMaterial({ color: col }));
      m.layers.set(NOINK); pivot.add(m); R.add(pivot); return pivot;
    };
    const hands = {
      h: hand(0.1, 0.026, "#241726", 0.004),
      m: hand(0.15, 0.016, "#241726", 0.006),
      s: hand(0.16, 0.006, "#d23b3b", 0.008),
    };

    // Phone in freezer (lights up)
    const phoneMesh = new THREE.Mesh(boxGeo(V(-0.06, 0, -0.1), V(0.06, 0.015, 0.1)), new THREE.MeshBasicMaterial({ color: "#5bb2ff" }));
    phoneMesh.position.set(FRIDGE[0], 0.45, FRIDGE[2] + 0.4);
    phoneMesh.layers.set(NOINK); R.add(phoneMesh);

    // ======== 2. Corridor (x 36.35..41) ========
    const CX0 = 36.35, CX1 = 41;
    room(M.cwall, M.cfloor, CX0, CX1, -6, 6, 3.4);

    // ======== 3. Winter City Park (x 65..80, z -8..8) ========
    // Ground covered in snow
    box(walls, M.snow, 62, -0.05, -12, 85, 0, 12, 4);

    // Paved walkway with snow
    box(furn, M.cfloor, 63, 0.01, -1.2, 84, 0.02, 1.2, 2);

    // Street Lanterns
    for (const lx of [66, 72, 78]) {
      furn.add(new THREE.CylinderGeometry(0.035, 0.05, 3.2, 8).translate(lx, 1.6, 1.8), M.dark);
      furn.add(new THREE.BoxGeometry(0.25, 0.35, 0.25).translate(lx, 3.3, 1.8), M.lampWarm);
      box(furn, M.snow, lx - 0.16, 3.48, 1.64, lx + 0.16, 3.55, 1.96); // snow cap on lamp
    }

    // Bare snowy trees
    for (const [tx, tz] of [[65, -3.5], [70, 3.8], [75, -4.2], [79, 3.5], [83, -3.0]]) {
      furn.add(new THREE.CylinderGeometry(0.08, 0.14, 2.8, 8).translate(tx, 1.4, tz), M.bark);
      furn.add(new THREE.SphereGeometry(0.9, 8, 6).translate(tx, 3.2, tz), M.snow);
      furn.add(new THREE.SphereGeometry(0.65, 8, 6).translate(tx + 0.3, 3.6, tz - 0.2), M.snow);
    }

    // Distant apartment blocks (панельные дома) in the background
    for (const [bx, bz, bw, bh] of [[60, -11, 8, 14], [70, -11.5, 9, 16], [80, -11, 8, 13]]) {
      furn.add(boxGeo(V(bx - bw / 2, 0, bz - 2), V(bx + bw / 2, bh, bz)), M.city);
      box(furn, M.snow, bx - bw / 2 - 0.2, bh, bz - 2.2, bx + bw / 2 + 0.2, bh + 0.3, bz + 0.2); // snow on roofs
    }

    // Snowbank where Yerasyl falls (x = 72, z = -0.2)
    furn.add(new THREE.SphereGeometry(0.7, 12, 8).translate(SNOWDRIFT_POS[0], 0.2, SNOWDRIFT_POS[2]), M.snow);

    walls.build(R, false);
    furn.build(R, true);

    this.d = {
      hands,
      winNight,
      winDawn,
      winDay,
      phoneMesh,
    };
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

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);

    // Light rig
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

    // Window visibility
    const isNight = ["sh03", "sh04", "sh05", "sh06"].includes(s.key);
    const isDawn = s.key === "sh07" || s.key === "sh08";
    this.d.winNight.visible = isNight;
    this.d.winDawn.visible = isDawn;
    this.d.winDay.visible = !isNight && !isDawn;

    // Clock animation (sh04 fast spinning 22:00 -> 00:00 -> 03:00)
    if (s.key === "sh04") {
      const prog = (f - s.a) / Math.max(1, s.b - s.a);
      const hour = 10 + prog * 17; // 10 -> 27 (3 a.m.)
      this.d.hands.h.rotation.z = (-2 * Math.PI * hour) / 12;
      this.d.hands.m.rotation.z = (-2 * Math.PI * hour * 12) / 12;
      this.d.hands.s.rotation.z = -f * 0.8;
    } else {
      this.d.hands.h.rotation.z = -Math.PI * 0.5;
      this.d.hands.m.rotation.z = 0;
      this.d.hands.s.rotation.z = -f * 0.1;
    }

    // Phone pulse
    this.d.phoneMesh.visible = s.key === "sh09";

    // Cast + stage
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

    void FPS;
    return focus;
  }
}
