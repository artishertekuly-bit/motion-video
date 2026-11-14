// «Барыс ағай» 1-сабақ: the school classroom of the «Мұғалім» portfolio as a three.js scene (boxes + painted canvas
// textures, two-tone shaded by shade.ts, inked by ink.ts, walls and ceiling never cast shadows), lit by the
// camera-relative interior sun of the bridge rig. The chalkboard is a live canvas (board.ts). update(id, f, camera) poses
// the camera, light, board and the cast for shot `id` at frame f.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cast";
import { stage } from "./stage";
import { SHOTS, ShotDef, camAt, BOARD, TDESK } from "./story";
import { BoardTex, boardAt } from "./board";

export const loadKit = () => Promise.resolve({} as Kit); // no Kenney models in this set

const FONT = "Montserrat, 'DejaVu Sans', 'Liberation Sans', sans-serif";
const basic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, transparent = false) =>
  new THREE.MeshBasicMaterial({ map: ctex(key, w, h, (g) => draw(g)), transparent, toneMapped: true });
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, font = FONT, weight = "900") => {
  g.font = `${weight} ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- painted textures ----------------
const parquetTex = () => ctex("parquetM", 512, 512, (g, r) => {
  const cols = ["#c08a55", "#b07a46", "#cc9a64", "#b9824c"];
  for (let j = 0; j < 8; j++) for (let i = -1; i < 4; i++) {
    const off = j % 2 ? 64 : 0;
    g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(i * 128 + off, j * 64, 128, 64);
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(i * 128 + off + 8, j * 64 + 10, 90, 6);
  }
  g.strokeStyle = "rgba(60,35,20,0.6)"; g.lineWidth = 3;
  for (let j = 0; j <= 8; j++) { g.beginPath(); g.moveTo(0, j * 64); g.lineTo(512, j * 64); g.stroke(); }
  for (let j = 0; j < 8; j++) for (let i = 0; i <= 4; i++) { const x = i * 128 + (j % 2 ? 64 : 0); g.beginPath(); g.moveTo(x, j * 64); g.lineTo(x, j * 64 + 64); g.stroke(); }
});
/** wall: warm paint over a teal wainscot (bottom 28 % of a 3.4 m wall ~ 0.95 m) */
const wallTex = () => ctex("cwallM", 512, 512, (g, r) => {
  g.fillStyle = "#efe2c4"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; g.fillRect(r() * 512, r() * 360, 30 + r() * 60, 6 + r() * 10); }
  g.fillStyle = "#5f9aa8"; g.fillRect(0, 368, 512, 144);
  g.fillStyle = "rgba(30,40,50,0.5)"; g.fillRect(0, 362, 512, 9);
  for (let i = 0; i < 8; i++) { g.strokeStyle = "rgba(20,40,50,0.35)"; g.lineWidth = 3; g.strokeRect(i * 64 + 8, 386, 48, 108); }
});
const skyWindow = () => basic("winM", 512, 640, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 640); gr.addColorStop(0, "#5e95dc"); gr.addColorStop(1, "#d6e8f8");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 640);
  for (const [x, y, s] of [[140, 150, 1], [390, 240, 0.8]]) { g.fillStyle = "#ffffff"; for (const [dx, dy, rr] of [[0, 0, 40], [40, 8, 34], [-38, 10, 30], [10, -20, 30]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, rr * s, 0, 7); g.fill(); } }
  for (let i = 0; i < 6; i++) { const x = i * 90 - 10, top = 460 - (i % 3) * 50; g.fillStyle = "#9fb7c9"; g.fillRect(x, top, 70, 200); g.fillStyle = "#c9d8e6"; for (let k = 0; k < 3; k++) g.fillRect(x + 12 + (k % 2) * 28, top + 22 + k * 48, 16, 20); }
  g.fillStyle = "#6fae5a"; g.beginPath(); g.ellipse(120, 640, 160, 90, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(430, 650, 150, 80, 0, 0, 7); g.fill();
  g.fillStyle = "#f4f1ea"; g.fillRect(246, 0, 20, 640); g.fillRect(0, 300, 512, 20);
  g.strokeStyle = "#241726"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 630);
});
const clockFace = () => basic("clockM", 400, 400, (g) => {
  g.fillStyle = "#f4f1ea"; g.beginPath(); g.arc(200, 200, 190, 0, 7); g.fill();
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.beginPath(); g.arc(200, 200, 182, 0, 7); g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = i % 3 ? 6 : 12; g.beginPath(); g.moveTo(200 + 150 * Math.sin(a), 200 - 150 * Math.cos(a)); g.lineTo(200 + 168 * Math.sin(a), 200 - 168 * Math.cos(a)); g.stroke(); }
  g.lineCap = "round"; g.lineWidth = 16; g.beginPath(); g.moveTo(200, 200); g.lineTo(200 + 90 * Math.sin(5.2), 200 - 90 * Math.cos(5.2)); g.stroke();
  g.lineWidth = 10; g.beginPath(); g.moveTo(200, 200); g.lineTo(200 + 140 * Math.sin(0.5), 200 - 140 * Math.cos(0.5)); g.stroke();
  g.fillStyle = "#d23b3b"; g.beginPath(); g.arc(200, 200, 16, 0, 7); g.fill();
});
/** colour-block poster «ӘЛІППЕ» with letter tiles */
const posterLetters = () => basic("posterAbc", 600, 800, (g) => {
  g.fillStyle = "#fdf6e3"; g.fillRect(0, 0, 600, 800);
  g.fillStyle = "#e2553f"; g.fillRect(0, 0, 600, 150); text(g, "ӘЛІППЕ", 300, 80, 92, "#ffffff");
  const L = ["Аа", "Әә", "Бб", "Вв", "Гг", "Ғғ", "Дд", "Ее", "Жж", "Зз", "Ии", "Кк"], C = ["#2f6fb0", "#3f9a4f", "#e8a23a", "#8a5ab0"];
  L.forEach((s, i) => { const x = 40 + (i % 3) * 180, y = 190 + Math.floor(i / 3) * 150; g.fillStyle = C[i % 4]; g.fillRect(x, y, 160, 130); text(g, s, x + 80, y + 68, 72, "#ffffff"); });
  g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(6, 6, 588, 788);
});
/** a sunny "solar system" poster */
const posterSpace = () => basic("posterSpace", 600, 800, (g) => {
  g.fillStyle = "#1f2f5c"; g.fillRect(0, 0, 600, 800);
  g.fillStyle = "#ffd23a"; g.beginPath(); g.arc(70, 400, 160, 0, 7); g.fill();
  const P: [number, number, number, string][] = [[250, 400, 22, "#c9b9a8"], [320, 400, 30, "#e8a050"], [400, 400, 32, "#3f8fe0"], [470, 400, 24, "#d9573a"], [540, 400, 44, "#e8c08a"]];
  g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 3; for (const [x] of P) { g.beginPath(); g.arc(70, 400, x - 70, -0.5, 0.5); g.stroke(); }
  for (const [x, y, r, c] of P) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.fillStyle = "#ffffff"; for (let i = 0; i < 40; i++) g.fillRect((i * 137) % 600, (i * 211) % 800, 4, 4);
  text(g, "ҒАРЫШ", 300, 110, 96, "#ffd23a");
  g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(6, 6, 588, 788);
});
const pageTex = () => basic("pagesM", 800, 520, (g) => {
  g.fillStyle = "#fbf8ee"; g.fillRect(0, 0, 800, 520);
  g.fillStyle = "rgba(40,40,60,0.55)";
  for (let s = 0; s < 2; s++) for (let i = 0; i < 9; i++) g.fillRect(40 + s * 400, 60 + i * 48, 300 - (i % 3) * 40, 12);
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(396, 0, 8, 520);
  g.fillStyle = "#3f8fe0"; g.fillRect(470, 330, 230, 140);
});
const globeTex = () => ctex("globeM", 512, 256, (g, r) => {
  g.fillStyle = "#3f8fe0"; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#6fbf5a";
  for (const [x, y, w, h] of [[60, 70, 90, 60], [110, 140, 50, 80], [250, 60, 110, 70], [270, 130, 60, 70], [380, 150, 70, 50], [420, 60, 60, 40]]) { g.beginPath(); g.ellipse(x, y, w / 2 + r() * 8, h / 2, r(), 0, 7); g.fill(); }
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 512, 14); g.fillRect(0, 242, 512, 14);
});

type Mats = Record<string, THREE.Material>;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private bt = new BoardTex();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);

    M.floor = lam("floorM", () => ({ map: parquetTex() }));
    M.wall = lam("wallM", () => ({ map: wallTex() }));
    M.ceil = lam("ceilM", () => ({ color: "#f4f1e8" }));
    M.white = lam("whiteM", () => ({ color: "#f4f4f2" }));
    M.wood = lam("woodM", () => ({ color: "#c99a62" }));
    M.woodDk = lam("woodDkM", () => ({ color: "#7a4c2a" }));
    M.metal = lam("metalM", () => ({ color: "#3d4452" }));
    M.tdesk = lam("tdeskM", () => ({ color: "#a8703f" }));
    M.red = lam("redM", () => ({ color: "#c8452f" }));
    M.blue = lam("blueM", () => ({ color: "#2f6fb0" }));
    M.green = lam("greenM", () => ({ color: "#3f9a4f" }));
    M.yellow = lam("yellowM", () => ({ color: "#e8b23a" }));
    M.cream = lam("creamM", () => ({ color: "#f1e6cc" }));
    M.pot = lam("potM", () => ({ color: "#c46a3a" }));
    M.leaf = lam("leafM", () => ({ color: "#3f9a4f" }));
    M.leafDk = lam("leafDkM", () => ({ color: "#2f7a3f" }));
    M.globe = lam("globeMat", () => ({ map: globeTex() }));
    M.brass = lam("brassM", () => ({ color: "#d9a441" }));

    const walls = new Batch(), furn = new Batch();
    const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) => b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);

    // ======== room x -5..5, z -4..5.5, h 3.4 ========
    const X0 = -5, X1 = 5, Z0 = -4, Z1 = 5.5, H = 3.4;
    box(walls, M.floor, X0, -0.05, Z0, X1, 0, Z1, 2);
    box(walls, M.ceil, X0, H, Z0, X1, H + 0.05, Z1, 4);
    box(walls, M.wall, X0, 0, Z0 - 0.1, X1, H, Z0, H);
    box(walls, M.wall, X0, 0, Z1, X1, H, Z1 + 0.1, H);
    box(walls, M.wall, X0 - 0.1, 0, Z0, X0, H, Z1, H);
    box(walls, M.wall, X1, 0, Z0, X1 + 0.1, H, Z1, H);
    // skirting
    box(furn, M.woodDk, X0, 0, Z0, X1, 0.1, Z0 + 0.03);

    // ======== chalkboard ========
    const { x0: bx0, x1: bx1, y0: by0, y1: by1, z: bz } = BOARD;
    const board = new THREE.Mesh(plane(bx1 - bx0, by1 - by0), new THREE.MeshBasicMaterial({ map: this.bt.tex, toneMapped: true }));
    board.position.set((bx0 + bx1) / 2, (by0 + by1) / 2, bz + 0.03); R.add(board);
    box(furn, M.woodDk, bx0 - 0.08, by0 - 0.08, Z0, bx1 + 0.08, by0, bz + 0.04); // frame bottom
    box(furn, M.woodDk, bx0 - 0.08, by1, Z0, bx1 + 0.08, by1 + 0.08, bz + 0.04); // top
    box(furn, M.woodDk, bx0 - 0.08, by0, Z0, bx0, by1, bz + 0.04); box(furn, M.woodDk, bx1, by0, Z0, bx1 + 0.08, by1, bz + 0.04);
    box(furn, M.woodDk, bx0, by0 - 0.1, Z0, bx1, by0 - 0.07, bz + 0.12); // chalk tray
    for (const [x, c] of [[-1.8, M.white], [-1.7, M.yellow], [0.6, M.white]] as const) furn.add(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8).rotateZ(Math.PI / 2).translate(x, by0 - 0.055, bz + 0.08), c);
    // clock, posters
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.24, 40), clockFace()); clock.position.set((bx0 + bx1) / 2, 2.82, bz + 0.02); R.add(clock);
    const pA = new THREE.Mesh(plane(0.75, 1.0), posterLetters()); pA.position.set(2.45, 1.95, bz + 0.02); R.add(pA);
    const pS = new THREE.Mesh(plane(0.75, 1.0), posterSpace()); pS.position.set(3.55, 1.95, bz + 0.02); R.add(pS);

    // ======== windows on the left wall ========
    const wm = skyWindow();
    for (const z of [-2.4, 0.6, 3.6]) {
      const m = new THREE.Mesh(plane(1.5, 1.7), wm); m.position.set(X0 + 0.02, 1.85, z); m.rotation.y = Math.PI / 2; R.add(m);
      box(furn, M.white, X0, 0.92, z - 0.82, X0 + 0.16, 1.0, z + 0.82); box(furn, M.white, X0, 2.7, z - 0.82, X0 + 0.08, 2.78, z + 0.82);
      box(furn, M.white, X0, 0.92, z - 0.82, X0 + 0.08, 2.78, z - 0.75); box(furn, M.white, X0, 0.92, z + 0.75, X0 + 0.08, 2.78, z + 0.82);
    }
    // plant on a stand in the front-left corner
    furn.add(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 18).translate(-4.4, 0.18, -3.4), M.pot);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, lf = new THREE.SphereGeometry(0.2, 10, 8).scale(0.45, 1.25, 0.3).rotateZ(0.5 * Math.cos(a)).rotateX(0.5 * Math.sin(a));
      furn.add(lf.translate(-4.4 + 0.16 * Math.cos(a), 0.62, -3.4 + 0.16 * Math.sin(a)), i % 2 ? M.leaf : M.leafDk);
    }

    // ======== teacher's desk (front panel hides the legs), chair, books, globe ========
    const { x0: dx0, x1: dx1, z0: dz0, z1: dz1, h: dh } = TDESK;
    box(furn, M.tdesk, dx0, dh - 0.05, dz0, dx1, dh, dz1); // top
    box(furn, M.woodDk, dx0 + 0.03, 0.08, dz1 - 0.05, dx1 - 0.03, dh - 0.05, dz1 - 0.02); // front panel
    box(furn, M.woodDk, dx0 + 0.03, 0, dz0 + 0.05, dx0 + 0.09, dh - 0.05, dz1 - 0.05); box(furn, M.woodDk, dx1 - 0.09, 0, dz0 + 0.05, dx1 - 0.03, dh - 0.05, dz1 - 0.05);
    box(furn, M.metal, 2.15, 0.45, -3.75, 2.65, 0.49, -3.3); box(furn, M.metal, 2.15, 0.49, -3.8, 2.65, 1.05, -3.75); // chair
    for (let i = 0; i < 4; i++) box(furn, [M.red, M.blue, M.green, M.yellow][i], 2.82 + (i % 2) * 0.02, dh + i * 0.06, -2.95, 3.08 - (i % 3) * 0.02, dh + 0.055 + i * 0.06, -2.6);
    furn.add(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 16).translate(1.98, dh + 0.015, -2.95), M.woodDk);
    furn.add(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6).translate(1.98, dh + 0.09, -2.95), M.brass);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 18), M.globe); globe.position.set(1.98, dh + 0.27, -2.95); globe.rotation.set(0.4, 1.2, 0.2); globe.castShadow = true; R.add(globe);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 6, 40, Math.PI), M.brass); ring.position.copy(globe.position); ring.rotation.set(0, 0, 0.4); R.add(ring);
    // open book on the desk in front of the seat
    const pages = new THREE.Mesh(plane(0.42, 0.27), pageTex()); pages.rotation.x = -Math.PI / 2; pages.rotation.z = 0.08; pages.position.set(2.42, dh + 0.012, -2.8); R.add(pages);
    box(furn, M.blue, 2.19, dh, -2.95, 2.65, dh + 0.01, -2.65);
    // pencil cup
    furn.add(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 14).translate(2.85, dh + 0.05, -2.62), M.red);

    // ======== student desks (2 columns x 3 rows) with chairs and a few books ========
    const rows = [-0.75, 1.05, 2.85];
    rows.forEach((z, ri) => {
      for (const cx of [-1.75, 1.75]) {
        box(furn, M.wood, cx - 0.62, 0.7, z - 0.27, cx + 0.62, 0.74, z + 0.27);
        for (const sx of [-1, 1]) {
          box(furn, M.metal, cx + sx * 0.56 - 0.025, 0, z - 0.22, cx + sx * 0.56 + 0.025, 0.7, z - 0.17);
          box(furn, M.metal, cx + sx * 0.56 - 0.025, 0, z + 0.17, cx + sx * 0.56 + 0.025, 0.7, z + 0.22);
          // chairs behind (toward +z)
          const ch = cx + sx * 0.3;
          box(furn, M.wood, ch - 0.2, 0.43, z + 0.45, ch + 0.2, 0.47, z + 0.82);
          box(furn, M.wood, ch - 0.2, 0.6, z + 0.84, ch + 0.2, 0.86, z + 0.87);
          for (const [lx, lz] of [[-0.17, 0.48], [0.17, 0.48], [-0.17, 0.82], [0.17, 0.82]]) box(furn, M.metal, ch + lx - 0.015, 0, z + lz - 0.015, ch + lx + 0.015, 0.43, z + lz + 0.015);
          box(furn, M.metal, ch - 0.17, 0.47, z + 0.85, ch - 0.14, 0.86, z + 0.86); box(furn, M.metal, ch + 0.14, 0.47, z + 0.85, ch + 0.17, 0.86, z + 0.86);
        }
        const k = (ri * 2 + (cx > 0 ? 1 : 0)) % 4;
        box(furn, [M.red, M.blue, M.green, M.yellow][k], cx - 0.35, 0.74, z - 0.12, cx - 0.05, 0.77, z + 0.1);
        box(furn, M.cream, cx + 0.1, 0.74, z - 0.1, cx + 0.38, 0.75, z + 0.12);
      }
    });
    // bookshelf on the back-right wall + ceiling lamps
    box(furn, M.woodDk, 3.4, 0, 4.9, 4.9, 1.8, 5.5);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 9; j++) box(furn, [M.red, M.blue, M.green, M.yellow, M.cream][(i * 3 + j) % 5], 3.5 + j * 0.15, 0.1 + i * 0.58, 4.95, 3.62 + j * 0.15, 0.45 + i * 0.58 - (j % 3) * 0.04, 5.0);
    const lampM = new THREE.MeshBasicMaterial({ color: "#fffaf0" });
    for (const z of [-2.2, 1.0, 4.0]) for (const x of [-2, 2]) { const l = new THREE.Mesh(boxGeo(V(x - 0.7, H - 0.08, z - 0.12), V(x + 0.7, H - 0.02, z + 0.12)), lampM); l.layers.set(NOINK); R.add(l); }

    walls.build(R, false);
    furn.build(R, true);
  }

  /** camera-relative sun, frozen per shot (bridge rig) */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const c = camAt(s.a);
    let fx = c.look[0] - c.pos[0], fz = c.look[2] - c.pos[2];
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
    this.bt.set(boardAt(f));
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
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
      const [w, h, k] = p.size ?? [600, 1000, 1];
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
    return focus;
  }
}
