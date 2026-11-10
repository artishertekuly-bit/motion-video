// The chalkboard as a live canvas for Lesson 3:
// 1) «КІМ КІМНЕН ОЗАДЫ?» (sh01 .. sh06)
// 2) «АБАЙ · 18-ҚАРА СӨЗ» (sh07 ..)
// 3) 4 Virtues in 2x2 grid:
//    1. АҚЫЛ    2. ҒЫЛЫМ
//    3. АР      4. МІНЕЗ
// 4) Final Motto (sh19):
//    «Киім бойды, ақыл — ойды жылытады!»
//    «Сыртыңды емес — миыңды тренд қыл!»
import * as THREE from "three";
import { BOARD, EQ_X } from "./story";
import { FPS, shotStart, ws, we } from "./timeline";

export const CHALK_FONT = "Caveat";
const CW = 2048, CH = 690;
const cl = (v: number) => Math.max(0, Math.min(1, v));
const q = (v: number) => Math.round(cl(v) * 40) / 40;

export type BoardState = {
  title: number;
  abai: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  m1: number;
  m2: number;
};

export const boardAt = (f: number): BoardState => {
  const s07 = shotStart("sh07");
  return {
    title: q(0.35 + f / (0.75 * FPS)),
    abai: q((f - s07) / (0.6 * FPS)),
    p1: q((f - ws("t4", 7) + 2) / Math.max(4, we("t4", 7) - ws("t4", 7))),
    p2: q((f - ws("t4", 8) + 2) / Math.max(4, we("t4", 8) - ws("t4", 8))),
    p3: q((f - ws("t4", 9) + 2) / Math.max(4, we("t4", 9) - ws("t4", 9))),
    p4: q((f - ws("t4", 11) + 2) / Math.max(4, we("t4", 11) - ws("t4", 11))),
    m1: q((f - ws("t9", 0) + 2) / Math.max(6, we("t9", 6) - ws("t9", 0))),
    m2: q((f - ws("t9", 7) + 2) / Math.max(6, we("t9", 11) - ws("t9", 7))),
  };
};

const CHALK = "rgba(246,244,232,0.95)", YEL = "rgba(255,226,120,0.97)", CYAN = "rgba(130,230,255,0.98)";
const cx = ((EQ_X - BOARD.x0) / (BOARD.x1 - BOARD.x0)) * CW;
const font = (px: number) => `700 ${px}px ${CHALK_FONT}`;

const fit = (g: CanvasRenderingContext2D, s: string, w: number, max: number) => {
  g.font = font(100);
  return Math.min(max, (100 * w) / Math.max(1, g.measureText(s).width));
};

const reveal = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, k: number) => {
  if (k <= 0) return;
  g.save();
  g.font = font(px);
  g.textAlign = "center";
  g.textBaseline = "middle";
  const w = g.measureText(s).width;
  g.beginPath();
  g.rect(x - w / 2 - 10, y - px, (w + 20) * k, px * 2);
  g.clip();
  g.fillStyle = col;
  g.fillText(s, x, y);
  g.restore();
};

const paint = (g: CanvasRenderingContext2D, st: BoardState) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#2e5b47";
  g.fillRect(0, 0, CW, CH);

  // Subtle chalk texture
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(255,255,255,${0.025 + (i % 3) * 0.01})`;
    g.beginPath();
    g.ellipse(120 + i * 140, 200 + (i % 4) * 90, 170, 60, 0.2 * (i % 3), 0, 7);
    g.fill();
  }

  // Header dates
  g.font = font(54);
  g.textAlign = "right";
  g.textBaseline = "middle";
  g.fillStyle = CHALK;
  g.fillText("11 қараша", 1990, 60);
  g.textAlign = "left";
  g.fillText("Сынып жұмысы", 70, 60);

  // 1) Main title (sh01 ..)
  const TITLE = "КІМ КІМНЕН ОЗАДЫ?";
  const pxTitle = fit(g, TITLE, 620, 140);
  reveal(g, TITLE, cx, 120, pxTitle, YEL, st.title);

  // 2) Abai 18-Qara Soz (sh07 ..)
  if (st.abai > 0) {
    const ABAI = "АБАЙ · 18-ҚАРА СӨЗ";
    const pxAbai = fit(g, ABAI, 540, 105);
    reveal(g, ABAI, cx, 210, pxAbai, CYAN, st.abai);
  }

  // 3) Four Virtues in a 2x2 grid (sh08 ..)
  const items = [
    { text: "1. АҚЫЛ", k: st.p1, col: YEL, x: cx - 180, y: 310 },
    { text: "2. ҒЫЛЫМ", k: st.p2, col: CYAN, x: cx + 180, y: 310 },
    { text: "3. АР", k: st.p3, col: CHALK, x: cx - 180, y: 410 },
    { text: "4. МІНЕЗ", k: st.p4, col: YEL, x: cx + 180, y: 410 },
  ];
  const pxItem = 76;
  const boxW = 300, boxH = 74;
  items.forEach((it) => {
    if (it.k <= 0) return;
    reveal(g, it.text, it.x, it.y, pxItem, it.col, it.k);
    if (it.k >= 1) {
      g.save();
      g.strokeStyle = it.col;
      g.lineWidth = 4;
      g.strokeRect(it.x - boxW / 2, it.y - boxH / 2, boxW, boxH);
      g.restore();
    }
  });

  // 4) Final Motto in sh19
  const L1 = "Киім бойды, ақыл — ойды жылытады!";
  const L2 = "Сыртыңды емес — миыңды тренд қыл!";
  const mp1 = fit(g, L1, 640, 85);
  const mp2 = fit(g, L2, 640, 88);
  reveal(g, L1, cx, 520, mp1, CHALK, st.m1);
  reveal(g, L2, cx, 605, mp2, YEL, st.m2);
  if (st.m2 >= 1) {
    g.save();
    g.strokeStyle = YEL;
    g.lineWidth = 6;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(cx - 300, 650);
    g.quadraticCurveTo(cx, 665, cx + 300, 650);
    g.stroke();
    g.restore();
  }
};

export class BoardTex {
  cv = document.createElement("canvas");
  tex: THREE.CanvasTexture;
  private key = "";
  constructor() {
    this.cv.width = CW;
    this.cv.height = CH;
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 8;
  }
  set(st: BoardState) {
    const k = JSON.stringify(st);
    if (k === this.key) return;
    this.key = k;
    paint(this.cv.getContext("2d")!, st);
    this.tex.needsUpdate = true;
  }
}
