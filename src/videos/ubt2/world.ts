// «30 КҮН» 2-күн: the three sets as one three.js scene — kitchen (x -3..3), school library (x 24..36.2) and the corridor
// behind its door (x 36.35..41). Built from boxes with painted canvas textures, two-tone shaded (shade.ts), inked by
// ink.ts; walls and ceilings never cast shadows (an interior lit by the camera-relative sun of the bridge rig).
// update(id, f, camera) poses the camera, light, the moving props (freezer drawer, phone, library door, the thick
// book) and the cast for shot `id` at frame f — a pure function of (id, f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { FPS, SHOTS, ShotDef, camAt, smooth, clamp01, FRIDGE, BOOK_AT, DOOR_X } from "./story";
import { ws } from "./timeline";

export const loadKit = () => Promise.resolve({} as Kit); // no Kenney models in these sets

const FONT = "Montserrat, 'DejaVu Sans', 'Liberation Sans', sans-serif";
/** unlit painted sign / picture (stays readable whatever the sun does) */
const basic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, transparent = false) =>
  new THREE.MeshBasicMaterial({ map: ctex(key, w, h, (g) => draw(g)), transparent, toneMapped: true });
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, stroke = "", lw = 0) => {
  g.font = `900 ${px}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- painted textures ----------------
const tilesTex = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 512, (g, r) => {
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s);
    g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.05})`; g.fillRect(i * s + 4, j * s + 4, s * 0.5, s * 0.2);
  }
  g.strokeStyle = "rgba(40,30,40,0.35)"; g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});
const parquetTex = () => ctex("parquet", 512, 512, (g, r) => {
  const cols = ["#b98552", "#a8743f", "#c69460", "#b07a46"];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
    const off = j % 2 ? 64 : 0;
    g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(i * 128 + off - 128, j * 64, 128, 64); g.fillRect(i * 128 + off, j * 64, 128, 64);
  }
  g.strokeStyle = "rgba(60,35,20,0.6)"; g.lineWidth = 3;
  for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(0, j * 64); g.lineTo(512, j * 64); g.stroke(); }
  for (let j = 0; j < 8; j++) for (let i = 0; i <= 4; i++) { const x = i * 128 + (j % 2 ? 64 : 0); g.beginPath(); g.moveTo(x, j * 64); g.lineTo(x, j * 64 + 64); g.stroke(); }
});
/** wall: plain paint over a wooden wainscot (bottom 28 %) */
const wallTex = (key: string, paint: string, wains: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = paint; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`; g.fillRect(r() * 512, r() * 370, 30 + r() * 60, 6 + r() * 10); }
  g.fillStyle = wains; g.fillRect(0, 368, 512, 144);
  g.fillStyle = "rgba(40,25,15,0.55)"; g.fillRect(0, 362, 512, 10);
  for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(40,25,15,0.35)"; g.lineWidth = 3; g.strokeRect(i * 64 + 8, 384, 48, 112); }
});
const kitchenWallTex = () => ctex("kwall", 512, 512, (g, r) => {
  g.fillStyle = "#f2e2b8"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 300; y += 40) for (let x = 0; x < 512; x += 40) { g.fillStyle = "rgba(200,120,80,0.18)"; g.beginPath(); g.arc(x + (y % 80 ? 20 : 0), y + 20, 6, 0, 7); g.fill(); }
  const s = 512 / 8;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? "#cfe5df" : "#e2f0ec"; g.fillRect(i * s, 320 + j * s, s, s); }
  g.strokeStyle = "rgba(40,30,40,0.3)"; g.lineWidth = 3;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * s, 320); g.lineTo(i * s, 512); g.stroke(); }
  for (let j = 0; j <= 3; j++) { g.beginPath(); g.moveTo(0, 320 + j * s); g.lineTo(512, 320 + j * s); g.stroke(); }
  void r;
});
/** book spines in rows of ~0.55 m (texture = 2 m wide x 2.2 m tall: 4 rows) */
const spinesTex = () => ctex("spines", 1024, 1024, (g, r) => {
  g.fillStyle = "#5e3a20"; g.fillRect(0, 0, 1024, 1024);
  const cols = ["#b0412e", "#2e6fb0", "#2f8a5b", "#c9a23a", "#8a5ab0", "#d9693a", "#3a4a7a", "#7a2e3a", "#e8dcc0", "#4a8a8a"];
  for (let row = 0; row < 4; row++) {
    const y1 = row * 256 + 236; let x = 6;
    while (x < 1010) {
      const w = 18 + r() * 26, h = 150 + r() * 70, c = cols[Math.floor(r() * cols.length)];
      if (r() < 0.06) { x += w; continue; }
      g.fillStyle = c; g.fillRect(x, y1 - h, w - 3, h);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 3, y1 - h + 18, w - 9, 6); g.fillRect(x + 3, y1 - 30, w - 9, 5);
      g.strokeStyle = "rgba(25,15,20,0.8)"; g.lineWidth = 2.5; g.strokeRect(x, y1 - h, w - 3, h);
      x += w;
    }
    g.fillStyle = "#8a5a36"; g.fillRect(0, y1, 1024, 20);
    g.fillStyle = "rgba(25,15,20,0.7)"; g.fillRect(0, y1, 1024, 3);
  }
});
const skyWindow = (key: string, golden: boolean) => basic(key, 512, 640, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 640);
  if (golden) { gr.addColorStop(0, "#8a6f9a"); gr.addColorStop(0.55, "#f7ae78"); gr.addColorStop(1, "#ffd08a"); }
  else { gr.addColorStop(0, "#5e93d9"); gr.addColorStop(1, "#cfe3f6"); }
  g.fillStyle = gr; g.fillRect(0, 0, 512, 640);
  if (golden) { g.fillStyle = "#fff0c8"; g.beginPath(); g.arc(330, 470, 60, 0, 7); g.fill(); }
  else for (const [x, y, s] of [[140, 160, 1], [380, 250, 0.8]]) { g.fillStyle = "#ffffff"; for (const [dx, dy, rr] of [[0, 0, 40], [40, 8, 34], [-38, 10, 30], [10, -20, 30]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, rr * s, 0, 7); g.fill(); } }
  g.fillStyle = golden ? "#5a4060" : "#9fb7c9";
  for (let i = 0; i < 6; i++) g.fillRect(i * 90 - 10, 470 - (i % 3) * 50, 70, 200);
  g.fillStyle = "#f4f1ea"; g.fillRect(246, 0, 20, 640); g.fillRect(0, 300, 512, 20);
  g.strokeStyle = "#241726"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 630);
});

type Mats = Record<string, THREE.Material>;
type Dyn = { drawer: THREE.Group; phone: THREE.Mesh; phoneMat: THREE.MeshLambertMaterial; door: THREE.Group; book: THREE.Group; winDay: THREE.Mesh[]; winGold: THREE.Mesh[] };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private d: Dyn;

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048); // [ubt2] 4096 -> 2048 for the CPU renderer
    R.add(this.hemi, this.sun, this.sun.target);

    M.kfloor = lam("kfloor", () => ({ map: tilesTex("kfloorT", "#d9c9a8", "#b9a27e") }));
    M.kwall = lam("kwall", () => ({ map: kitchenWallTex() }));
    M.lfloor = lam("lfloor", () => ({ map: parquetTex() }));
    M.lwall = lam("lwall", () => ({ map: wallTex("lwallT", "#d7e3c3", "#8a5a36") }));
    M.cwall = lam("cwall", () => ({ map: wallTex("cwallT", "#e9e4d8", "#4f6f8f") }));
    M.cfloor = lam("cfloor", () => ({ map: tilesTex("cfloorT", "#c9c4ba", "#aaa49a", 6) }));
    M.ceil = lam("ceil", () => ({ color: "#f2efe6" }));
    M.white = lam("white", () => ({ color: "#f4f4f2" }));
    M.cream = lam("cream", () => ({ color: "#ecdcb8" }));
    M.green = lam("kgreen", () => ({ color: "#4f8f7c" }));
    M.dark = lam("dark", () => ({ color: "#2b2b33" }));
    M.wood = lam("woodL", () => ({ color: "#a8703f" }));
    M.woodDk = lam("woodDk", () => ({ color: "#6e4426" }));
    M.red = lam("redL", () => ({ color: "#b0412e" }));
    M.bread = lam("bread", () => ({ color: "#d99a4a" }));
    M.meat = lam("meat", () => ({ color: "#e88a8a" }));
    M.wrap = lam("wrap", () => ({ color: "#f4f1ea" }));
    M.spines = lam("spines", () => ({ map: spinesTex() }));
    M.lamp = lam("lampG", () => ({ color: "#2f7a4f" }));

    const walls = new Batch(), furn = new Batch();
    const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) => b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
    const room = (m: THREE.Material, fl: THREE.Material, x0: number, x1: number, z0: number, z1: number, h: number, skip: string[] = []) => {
      box(walls, fl, x0, -0.05, z0, x1, 0, z1, 2);
      box(walls, M.ceil, x0, h, z0, x1, h + 0.05, z1, 4);
      if (!skip.includes("back")) box(walls, m, x0, 0, z0 - 0.1, x1, h, z0, h);
      if (!skip.includes("front")) box(walls, m, x0, 0, z1, x1, h, z1 + 0.1, h);
      if (!skip.includes("left")) box(walls, m, x0 - 0.1, 0, z0, x0, h, z1, h);
      if (!skip.includes("right")) box(walls, m, x1, 0, z0, x1 + 0.1, h, z1, h);
    };

    // ======== kitchen ========
    room(M.kwall, M.kfloor, -3.1, 3.1, -3.2, 3.2, 3.2);
    const [fx0] = FRIDGE;
    box(furn, M.white, fx0 - 0.4, 0, -3.2, fx0 + 0.4, 1.95, -2.5); // fridge body
    box(furn, M.dark, fx0 - 0.4, 0.74, -2.5, fx0 + 0.4, 0.76, -2.48); // door gap
    box(furn, M.dark, fx0 + 0.28, 1.0, -2.48, fx0 + 0.33, 1.55, -2.44); // handle
    box(furn, M.cream, -1.85, 0, -3.2, 2.95, 0.88, -2.6); // base cabinets
    for (const x of [-0.65, 0.55, 1.75]) box(furn, M.dark, x - 0.01, 0.05, -2.6, x + 0.01, 0.84, -2.58);
    box(furn, M.wood, -1.9, 0.88, -3.22, 3.0, 0.94, -2.55); // worktop
    box(furn, M.dark, 1.85, 0.94, -3.15, 2.75, 0.97, -2.62); // hob
    furn.add(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 20).translate(2.3, 1.07, -2.88), M.red); // pot
    box(furn, M.cream, -1.85, 1.6, -3.2, -0.5, 2.35, -2.85); // wall cabinet
    box(furn, M.dark, -1.18, 1.62, -2.85, -1.16, 2.33, -2.84);
    // table, chair, bread
    box(furn, M.wood, -0.3, 0.72, -1.05, 1.3, 0.76, -0.15);
    for (const [x, z] of [[-0.24, -1.0], [1.24, -1.0], [-0.24, -0.2], [1.24, -0.2]]) box(furn, M.woodDk, x - 0.03, 0, z - 0.03, x + 0.03, 0.72, z + 0.03);
    box(furn, M.woodDk, 0.4, 0.44, -1.55, 0.9, 0.48, -1.1); box(furn, M.woodDk, 0.4, 0.48, -1.6, 0.9, 1.05, -1.55);
    furn.add(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24).translate(0.5, 0.79, -0.38), M.bread);
    // window + calendar «29»
    const win = new THREE.Mesh(plane(1.5, 1.0), skyWindow("winK", false)); win.position.set(1.35, 1.7, -3.19); R.add(win);
    box(furn, M.white, 0.55, 1.15, -3.2, 2.15, 1.2, -3.12); box(furn, M.white, 0.55, 2.2, -3.2, 2.15, 2.25, -3.12);
    const cal = new THREE.Mesh(plane(0.42, 0.52), basic("calendar", 420, 520, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 420, 520); g.fillStyle = "#d23b3b"; g.fillRect(0, 0, 420, 130);
      text(g, "ҚАРАША", 210, 68, 56, "#ffffff"); text(g, "29", 210, 320, 210, "#241726");
      g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(6, 6, 408, 508);
    }));
    cal.position.set(-0.05, 1.85, -3.19); R.add(cal);

    // ======== library ========
    const LX0 = 24, LX1 = DOOR_X, LZ0 = -7, LZ1 = 5, LH = 4.0;
    room(M.lwall, M.lfloor, LX0, LX1, LZ0, LZ1, LH, ["right"]);
    // right wall with the door opening (z -0.6..0.6, h 2.2)
    box(walls, M.lwall, LX1, 0, LZ0, LX1 + 0.15, LH, -0.6, LH);
    box(walls, M.lwall, LX1, 0, 0.6, LX1 + 0.15, LH, LZ1, LH);
    box(walls, M.lwall, LX1, 2.2, -0.6, LX1 + 0.15, LH, 0.6, LH);
    box(furn, M.woodDk, LX1 - 0.05, 0, -0.7, LX1 + 0.2, 2.3, -0.6); box(furn, M.woodDk, LX1 - 0.05, 0, 0.6, LX1 + 0.2, 2.3, 0.7);
    box(furn, M.woodDk, LX1 - 0.05, 2.2, -0.7, LX1 + 0.2, 2.3, 0.7);
    // back-wall shelves + frame
    box(furn, M.spines, LX0 + 0.4, 0, LZ0, LX1 - 0.4, 3.2, -6.75, 2.2);
    for (let x = LX0 + 0.4; x <= LX1 - 0.39; x += (LX1 - LX0 - 0.8) / 6) box(furn, M.woodDk, x - 0.05, 0, -6.78, x + 0.05, 3.25, -6.7);
    box(furn, M.woodDk, LX0 + 0.35, 3.2, -7, LX1 - 0.35, 3.3, -6.68);
    // shelves behind the librarian (front wall)
    box(furn, M.spines, 32.0, 0, 4.75, LX1 - 0.3, 2.6, LZ1, 2.2);
    box(furn, M.woodDk, 31.95, 2.6, 4.7, LX1 - 0.25, 2.68, LZ1);
    // reading table + chairs
    box(furn, M.wood, 28.2, 0.72, -2.3, 30.8, 0.76, -1.3);
    for (const [x, z] of [[28.3, -2.2], [30.7, -2.2], [28.3, -1.4], [30.7, -1.4]]) box(furn, M.woodDk, x - 0.04, 0, z - 0.04, x + 0.04, 0.72, z + 0.04);
    box(furn, M.woodDk, 28.95, 0.44, -3.1, 29.45, 0.48, -2.6); box(furn, M.woodDk, 28.95, 0.48, -3.15, 29.45, 1.05, -3.1);
    // librarian desk, lamp, book stack
    box(furn, M.wood, 33.1, 0, 1.6, 35.3, 0.76, 2.4); box(furn, M.woodDk, 33.05, 0.76, 1.55, 35.35, 0.8, 2.45);
    box(furn, M.lamp, 34.9, 0.8, 1.75, 35.1, 0.82, 1.95);
    furn.add(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6).translate(35.0, 1.02, 1.85), M.dark);
    furn.add(new THREE.ConeGeometry(0.16, 0.16, 16, 1, true).translate(35.0, 1.24, 1.85), M.lamp);
    for (let i = 0; i < 5; i++) box(furn, [M.red, M.green, M.cream, M.wood, M.red][i], 33.45 + (i % 2) * 0.02, 0.8 + i * 0.06, 1.75, 33.85 - (i % 3) * 0.03, 0.86 + i * 0.06, 2.05);
    // windows on the left wall
    const winDay: THREE.Mesh[] = [], winGold: THREE.Mesh[] = [];
    const wd = skyWindow("winD", false), wg = skyWindow("winG", true);
    for (const z of [-4.5, -1.5, 1.5]) {
      for (const [mat, list] of [[wd, winDay], [wg, winGold]] as const) {
        const m = new THREE.Mesh(plane(1.4, 1.75), mat); m.position.set(LX0 + 0.02, 1.95, z); m.rotation.y = Math.PI / 2; R.add(m); list.push(m);
      }
      box(furn, M.white, LX0, 1.0, z - 0.75, LX0 + 0.1, 1.08, z + 0.75); box(furn, M.white, LX0, 2.82, z - 0.75, LX0 + 0.1, 2.9, z + 0.75);
    }
    // poster by the door (library side)
    const poster = new THREE.Mesh(plane(1.0, 1.3), basic("posterL", 500, 650, (g) => {
      g.fillStyle = "#2e6fb0"; g.fillRect(0, 0, 500, 650);
      text(g, "КІТАП —", 250, 170, 74, "#ffffff"); text(g, "БІЛІМ", 250, 280, 90, "#ffd84a"); text(g, "БҰЛАҒЫ", 250, 390, 90, "#ffd84a");
      g.fillStyle = "#f4f1ea"; g.fillRect(150, 470, 200, 120); g.strokeStyle = "#241726"; g.lineWidth = 8; g.strokeRect(150, 470, 200, 120); g.beginPath(); g.moveTo(250, 470); g.lineTo(250, 590); g.stroke();
      g.strokeRect(5, 5, 490, 640);
    }));
    poster.position.set(LX1 - 0.01, 1.75, -2.6); poster.rotation.y = -Math.PI / 2; R.add(poster);

    // ======== corridor ========
    const CX0 = DOOR_X + 0.15, CX1 = 41;
    room(M.cwall, M.cfloor, CX0, CX1, -6, 6, 3.4, ["left"]);
    const sign = new THREE.Mesh(plane(1.5, 0.42), basic("signLib", 900, 252, (g) => {
      g.fillStyle = "#1f4f8f"; g.fillRect(0, 0, 900, 252); g.strokeStyle = "#f4f1ea"; g.lineWidth = 14; g.strokeRect(14, 14, 872, 224);
      text(g, "КІТАПХАНА", 450, 130, 128, "#ffffff");
    }));
    sign.position.set(CX0 + 0.02, 2.48, 0); sign.rotation.y = Math.PI / 2; R.add(sign);
    const board = new THREE.Mesh(plane(1.6, 1.0), basic("boardC", 640, 400, (g) => {
      g.fillStyle = "#c99a5a"; g.fillRect(0, 0, 640, 400);
      for (const [x, y, c] of [[40, 40, "#ffffff"], [250, 60, "#ffe066"], [430, 30, "#9fe3b4"], [80, 220, "#ffb3c7"], [330, 230, "#ffffff"]] as const) { g.fillStyle = c as string; g.fillRect(x, y, 160, 130); }
      text(g, "ҰБТ", 330, 125, 64, "#d23b3b"); g.strokeStyle = "#241726"; g.lineWidth = 10; g.strokeRect(5, 5, 630, 390);
    }));
    board.position.set(CX0 + 0.02, 1.6, 3.0); board.rotation.y = Math.PI / 2; R.add(board);

    walls.build(R, false);
    furn.build(R, true);

    // ======== moving props ========
    // freezer drawer (panel + bin with frozen meat), slides out along +z
    const drawer = new THREE.Group();
    const dpart = (m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
      const mesh = new THREE.Mesh(boxGeo(V(x0, y0, z0), V(x1, y1, z1)), m); mesh.castShadow = true; mesh.receiveShadow = true; drawer.add(mesh);
    };
    dpart(M.white, -0.39, 0.03, -0.03, 0.39, 0.72, 0.02); // front panel
    dpart(M.dark, -0.3, 0.6, 0.02, 0.3, 0.64, 0.05); // handle
    dpart(M.white, -0.36, 0.06, -0.6, 0.36, 0.1, -0.03); // bin floor
    for (const sx of [-1, 1]) dpart(M.white, sx * 0.36 - 0.02, 0.1, -0.6, sx * 0.36 + 0.02, 0.5, -0.03);
    dpart(M.white, -0.36, 0.1, -0.62, 0.36, 0.5, -0.58);
    for (const [x, z, w, d, h] of [[-0.18, -0.42, 0.26, 0.2, 0.12], [0.14, -0.4, 0.28, 0.22, 0.1], [-0.16, -0.16, 0.24, 0.18, 0.11], [0.17, -0.15, 0.26, 0.17, 0.12]]) {
      dpart(M.meat, x - w / 2, 0.1, z - d / 2, x + w / 2, 0.1 + h, z + d / 2);
      dpart(M.wrap, x - w / 2 - 0.004, 0.1 + h * 0.4, z - d / 2 - 0.004, x + w / 2 + 0.004, 0.1 + h * 0.62, z + d / 2 + 0.004);
    }
    drawer.position.set(fx0, 0, -2.5);
    R.add(drawer);
    const phoneMat = lam("phoneM", () => ({ color: "#1c1e26" })) as THREE.MeshLambertMaterial; // used by the phone only
    const phone = new THREE.Mesh(boxGeo(V(-0.04, 0, -0.08), V(0.04, 0.012, 0.08)), phoneMat);
    phone.castShadow = true; R.add(phone);
    // library door (hinge at z = 0.6 on the library face)
    const door = new THREE.Group();
    const dp = new THREE.Mesh(boxGeo(V(-0.04, 0, -1.18), V(0.04, 2.18, 0)), lam("doorM", () => ({ color: "#9a6a3e" })));
    dp.castShadow = true; door.add(dp);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), lam("brass", () => ({ color: "#d9a441" }))); knob.position.set(0.07, 1.0, -1.05); door.add(knob);
    door.position.set(DOOR_X + 0.08, 0, 0.6); R.add(door);
    // the thick book: red block + painted cover (title upside down until the flip)
    const book = new THREE.Group();
    const bb = new THREE.Mesh(boxGeo(V(-0.21, -0.28, -0.09), V(0.21, 0.28, 0.09)), M.red); bb.castShadow = true; book.add(bb);
    const pages = new THREE.Mesh(boxGeo(V(-0.2, -0.27, -0.07), V(0.205, 0.27, 0.07)), M.wrap); pages.position.x = 0.012; book.add(pages);
    const cover = new THREE.Mesh(plane(0.4, 0.54), basic("bookCover", 400, 540, (g) => {
      g.fillStyle = "#b0412e"; g.fillRect(0, 0, 400, 540); g.strokeStyle = "#f2d27a"; g.lineWidth = 10; g.strokeRect(24, 24, 352, 492);
      text(g, "ЖОҒАРЫ", 200, 150, 58, "#f2d27a"); text(g, "МАТЕМАТИКА", 200, 225, 44, "#f2d27a");
      g.fillStyle = "#f2d27a"; g.beginPath(); g.arc(200, 360, 70, 0, 7); g.fill(); text(g, "∑", 200, 362, 110, "#b0412e");
      text(g, "1200 бет", 200, 470, 32, "#f2d27a");
    }));
    cover.position.z = 0.092; book.add(cover);
    book.position.set(BOOK_AT[0], BOOK_AT[1] + 0.28, BOOK_AT[2]);
    R.add(book);
    this.d = { drawer, phone, phoneMat: phone.material as THREE.MeshLambertMaterial, door, book, winDay, winGold };
  }

  /** camera-relative sun, frozen per shot (bridge rig) */
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
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig ----
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 4, 6, 18);
    this.sun.position.copy(focus).addScaledVector(sunDir, 60); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 5; sc.far = 140; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.d.winDay) m.visible = s.light === "day";
    for (const m of this.d.winGold) m.visible = s.light === "golden";
    // ---- moving props ----
    const d = this.d;
    // freezer: open through shot 2, shuts on its last frames
    const open = s.key === "sh02" ? 1 - smooth((f - (s.b - 16)) / 12) : 0;
    d.drawer.position.z = -2.5 + 0.55 * open;
    const drop = ws("n2", 9) - 2;
    const fall = clamp01((f - drop) / 7);
    d.phone.visible = s.key === "sh02";
    d.phone.position.set(FRIDGE[0] + 0.02, 0.24 + (1 - fall * fall) * 0.75, d.drawer.position.z - 0.3);
    d.phone.rotation.set(0.15 * (1 - fall), 0.4, 0.1 * (1 - fall));
    const frost = clamp01((f - ws("n2", 10)) / 14);
    d.phoneMat.color.set("#1c1e26").lerp(new THREE.Color("#dcefff"), 0.75 * frost);
    // library door: shut except when Yerasyl opens it (shot 5) and when Aruzhan comes in (shot 8)
    const opening = s.key === "sh05" ? smooth((f - (ws("n5", 7) - 6)) / 14) : s.key === "sh08" ? smooth((f - ws("n8", 2)) / 16) : 0;
    d.door.rotation.y = 1.75 * opening; // swings into the library
    // the thick book: on the table from shot 8, title upside down until Aruzhan points it out
    d.book.visible = f >= SHOTS.find((x) => x.key === "sh08")!.a;
    const flip = smooth((f - ws("a2", 2)) / 10);
    d.book.rotation.set(0, 0, Math.PI * (1 - flip));
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 2.0))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
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
