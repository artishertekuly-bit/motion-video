// Chalkboard canvas for Lesson 7: «Ата-ананың сенімі: Қанат па, әлде ауыр жүк пе?»
import * as THREE from "three";
import { BOARD, EQ_X } from "./story";
import { shotStart } from "./timeline";

export const CHALK_FONT = "Caveat";
const CW = 2048, CH = 690;
const cl = (v: number) => Math.max(0, Math.min(1, v));
const q = (v: number) => Math.round(cl(v) * 40) / 40;

export type BoardState = {
  f: number;
  s01: number;
  s03: number;
  s05: number;
  s07: number;
  s09: number;
  s11: number;
};

export const boardAt = (f: number): BoardState => {
  const s01 = shotStart("sh01");
  const s03 = shotStart("sh03");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  const s09 = shotStart("sh09");
  const s11 = shotStart("sh11");
  return {
    f,
    s01: q((f - s01) / 20),
    s03: q((f - s03) / 15),
    s05: q((f - s05) / 20),
    s07: q((f - s07) / 20),
    s09: q((f - s09) / 20),
    s11: q((f - s11) / 20),
  };
};

const CHALK = "rgba(246,244,232,0.95)",
  YEL = "rgba(255,226,120,0.98)",
  CYAN = "rgba(130,230,255,0.98)",
  GREEN = "rgba(135,255,160,0.98)",
  RED = "rgba(255,100,90,0.98)",
  GOLD = "rgba(255,200,60,0.98)",
  ORANGE = "rgba(255,160,70,0.98)";

const cx = ((EQ_X - BOARD.x0) / (BOARD.x1 - BOARD.x0)) * CW;
const font = (px: number) => `700 ${px}px ${CHALK_FONT}`;

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

const paintBox = (g: CanvasRenderingContext2D, s: string, x: number, y: number, w: number, h: number, col: string, k: number) => {
  if (k <= 0) return;
  g.save();
  g.globalAlpha = k;
  g.strokeStyle = col;
  g.lineWidth = 4;
  g.strokeRect(x - w / 2, y - h / 2, w, h);
  g.font = font(h * 0.55);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = col;
  g.fillText(s, x, y);
  g.restore();
};

export class BoardTex {
  tex: THREE.CanvasTexture;
  can: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  private last = "";

  constructor() {
    this.can = document.createElement("canvas");
    this.can.width = CW;
    this.can.height = CH;
    this.g = this.can.getContext("2d")!;
    this.tex = new THREE.CanvasTexture(this.can);
    this.tex.wrapS = THREE.ClampToEdgeWrapping;
    this.tex.wrapT = THREE.ClampToEdgeWrapping;
    this.tex.generateMipmaps = false;
    this.tex.minFilter = THREE.LinearFilter;
    this.tex.magFilter = THREE.LinearFilter;
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.set(boardAt(0));
  }

  set(st: BoardState) {
    const key = `${st.s01}|${st.s03}|${st.s05}|${st.s07}|${st.s09}|${st.s11}`;
    if (key === this.last) return;
    this.last = key;
    const g = this.g;
    g.clearRect(0, 0, CW, CH);

    // Deep school green chalkboard background
    g.fillStyle = "#16281e";
    g.fillRect(0, 0, CW, CH);

    // Texture grain & dust
    g.fillStyle = "rgba(255,255,255,0.02)";
    for (let i = 0; i < 400; i++) {
      const rx = (i * 97) % CW;
      const ry = (i * 53) % CH;
      g.fillRect(rx, ry, 2, 2);
    }

    // 1. Hook Header (s01)
    reveal(g, "АТА-АНАНЫҢ СЕНІМІ: ҚАНАТ ПА, ӘЛДЕ ЖҮК ПЕ?", cx, 85, 78, YEL, st.s01);

    // Decorative subtitle line
    if (st.s01 > 0) {
      g.save();
      g.globalAlpha = st.s01;
      g.strokeStyle = "rgba(255,226,120,0.5)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - 580 * st.s01, 135);
      g.lineTo(cx + 580 * st.s01, 135);
      g.stroke();
      g.restore();
    }

    // Left diagram: 🕊️ ҚАНАТ (Wings) vs ⚖️ ТАРАЗЫ (Scales)
    if (st.s01 > 0.4) {
      const k = (st.s01 - 0.4) / 0.6;
      paintBox(g, "🕊️ ҚАНАТ: САМҒАТАДЫ", cx - 420, 210, 480, 80, CYAN, k);
      paintBox(g, "⚖️ ЖҮК: ЖАУАПКЕРШІЛІК", cx + 420, 210, 520, 80, ORANGE, k);
    }

    // 2. Parents' Spotless Trust (s03)
    if (st.s03 > 0) {
      reveal(g, "СЕНІМ — АДАМДЫ ТҰЛҒА ЕТЕТІН ҰЛЫ КҮШ! ✨", cx, 310, 68, GOLD, st.s03);
      reveal(g, "«Кіршіксіз сенім — жан дүниенің сауыты»", cx, 375, 52, CHALK, st.s03);
    }

    // 3. Pygmalion Effect (s05)
    if (st.s05 > 0) {
      paintBox(g, "ПИГМАЛИОН ЭФФЕКТІСІ 🧬", cx, 455, 600, 75, GREEN, st.s05);
      reveal(g, "СЕНІМ ✅ ➔ ТАУ ҚОПАРАДЫ ⛰️", cx - 400, 540, 56, CYAN, st.s05);
      reveal(g, "КҮДІК ❌ ➔ ҚАНАТ СЫНАДЫ 💔", cx + 400, 540, 56, RED, st.s05);
    }

    // 4. Trust = Precious Capital (s07)
    if (st.s07 > 0) {
      reveal(g, "СЕНІМ = ӨМІРЛІК НЕ СИЕГЕ БЕРІЛГЕН КАПИТАЛ 🪙", cx, 450, 64, YEL, st.s07);
      reveal(g, "Ұрыс пен айқайдан 10 есе салмақты жауапкершілік!", cx, 525, 54, ORANGE, st.s07);
    }

    // 5. Mirror & Restoring Trust (s09)
    if (st.s09 > 0) {
      paintBox(g, "СЕНІМ — ХРУСТАЛЬ АЙНА 🪞", cx, 440, 620, 70, CYAN, st.s09);
      reveal(g, "Сынса қайтару жолы: Шынайылық + Адалдық + Табанды еңбек ✨", cx, 525, 54, GOLD, st.s09);
      reveal(g, "Басты ереже: ЕШҚАШАН ӨТІРІК АЙТПАУ!", cx, 595, 56, RED, st.s09);
    }

    // 6. Finale Wings (s11)
    if (st.s11 > 0) {
      reveal(g, "АТА-АНА СЕНІМІ — АРҚАҢДАҒЫ ҚОС ҚАНАТЫҢ! 🕊️✨", cx, 480, 72, GOLD, st.s11);
      reveal(g, "Сол қанатпен самғап, олардың мақтанышы бол! 🦅", cx, 565, 60, GREEN, st.s11);
    }

    this.tex.needsUpdate = true;
  }

  dispose() {
    this.tex.dispose();
  }
}
