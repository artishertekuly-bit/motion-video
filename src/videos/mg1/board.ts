// The chalkboard as a live canvas: «2 + 2 = 5» is written in the first second, at the end the «5» is struck out, a
// yellow «4» goes above it and the motto appears line by line under the equation. boardAt(f) gives the chalk progress
// for frame f; BoardTex redraws its canvas only when that state changes.
import * as THREE from "three";
import { BOARD, EQ_X } from "./story";
import { FPS, shotStart, ws, we } from "./timeline";

export const CHALK_FONT = "Caveat";
const CW = 2048, CH = 690;
const cl = (v: number) => Math.max(0, Math.min(1, v));
const q = (v: number) => Math.round(cl(v) * 40) / 40;

export type BoardState = { eq: number; strike: number; four: number; m1: number; m2: number };
export const boardAt = (f: number): BoardState => {
  const s19 = shotStart("sh19");
  return {
    eq: q(0.32 + f / (0.75 * FPS)),
    strike: q((f - s19 - 8) / 7),
    four: q((f - s19 - 18) / 12),
    m1: q((f - ws("t5", 0) + 2) / Math.max(6, we("t5", 1) - ws("t5", 0))),
    m2: q((f - ws("t5", 2) + 2) / Math.max(6, we("t5", 4) - ws("t5", 2))),
  };
};

const CHALK = "rgba(246,244,232,0.95)", YEL = "rgba(255,226,120,0.97)";
const EQ = "2 + 2 = 5";
const cx = ((EQ_X - BOARD.x0) / (BOARD.x1 - BOARD.x0)) * CW;
const font = (px: number) => `700 ${px}px ${CHALK_FONT}`;
/** font size so that `s` is `w` canvas px wide */
const fit = (g: CanvasRenderingContext2D, s: string, w: number, max: number) => { g.font = font(100); return Math.min(max, (100 * w) / g.measureText(s).width); };
/** text revealed from the left up to fraction k (chalk being written) */
const reveal = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, k: number) => {
  if (k <= 0) return;
  g.save(); g.font = font(px); g.textAlign = "left"; g.textBaseline = "middle";
  const w = g.measureText(s).width;
  g.beginPath(); g.rect(x - 10, y - px, (w + 20) * k, px * 2); g.clip();
  g.fillStyle = col; g.fillText(s, x, y);
  g.restore();
};

const paint = (g: CanvasRenderingContext2D, st: BoardState) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#2e5b47"; g.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,255,255,${0.025 + (i % 3) * 0.01})`; g.beginPath(); g.ellipse(120 + i * 140, 200 + (i % 4) * 90, 170, 60, 0.2 * (i % 3), 0, 7); g.fill(); }
  g.font = font(64); g.textAlign = "right"; g.textBaseline = "middle"; g.fillStyle = CHALK; g.fillText("10 қараша", 1990, 70);
  g.textAlign = "left"; g.fillText("Сынып жұмысы", 70, 70);
  // the equation, 1.2 m wide, centred on EQ_X
  const px = fit(g, EQ, 620, 230);
  g.font = font(px);
  const w = g.measureText(EQ).width, x0 = cx - w / 2, y = 250;
  reveal(g, EQ, x0, y, px, CHALK, st.eq);
  const x5 = x0 + g.measureText("2 + 2 = ").width, w5 = g.measureText("5").width;
  if (st.strike > 0) {
    g.save(); g.strokeStyle = CHALK; g.lineWidth = 14; g.lineCap = "round";
    const a: [number, number] = [x5 - 18, y + 70], b: [number, number] = [x5 + w5 + 18, y - 80];
    g.beginPath(); g.moveTo(...a); g.lineTo(a[0] + (b[0] - a[0]) * st.strike, a[1] + (b[1] - a[1]) * st.strike); g.stroke();
    g.restore();
  }
  reveal(g, "4", x5 + w5 * 0.1, y - 150, px * 0.75, YEL, st.four);
  if (st.four >= 1) { g.save(); g.strokeStyle = YEL; g.lineWidth = 9; g.beginPath(); g.ellipse(x5 + w5 * 0.5, y - 150, w5 * 0.75, px * 0.36, -0.1, 0, Math.PI * 2); g.stroke(); g.restore(); }
  // the motto, two lines (each at most 1.15 m wide)
  const L1 = "Ұстазыңа сен.", L2 = "Бірақ — тексер!";
  const mp = Math.min(fit(g, L1, 590, 130), fit(g, L2, 590, 130));
  g.font = font(mp);
  reveal(g, L1, cx - g.measureText(L1).width / 2, 455, mp, CHALK, st.m1);
  reveal(g, L2, cx - g.measureText(L2).width / 2, 585, mp, YEL, st.m2);
  if (st.m2 >= 1) { g.save(); g.strokeStyle = YEL; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 300, 650); g.quadraticCurveTo(cx, 672, cx + 300, 646); g.stroke(); g.restore(); }
};

export class BoardTex {
  cv = document.createElement("canvas");
  tex: THREE.CanvasTexture;
  private key = "";
  constructor() {
    this.cv.width = CW; this.cv.height = CH;
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
  }
  set(st: BoardState) {
    const k = JSON.stringify(st);
    if (k === this.key) return;
    this.key = k;
    paint(this.cv.getContext("2d")!, st);
    this.tex.needsUpdate = true;
  }
}
