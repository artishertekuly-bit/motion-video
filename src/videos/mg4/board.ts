// The chalkboard as a live canvas for Lesson 4 (AI Course Announcement):
// 1) sh01: «3D АНИМАЦИЯ = ?» (Confused student chalk)
// 2) sh02: «ЖАСАНДЫ ИНТЕЛЛЕКТ 🤖»
// 3) sh03: 3 Advantages:
//    - 1. 3D АНИМАЦИЯ (0 ТӘЖІРИБЕ)
//    - 2. AI ДАУЫС ПЕН ДУБЛЯЖ
//    - 3. СЦЕНАРИЙ 2 МИНУТТА
// 4) sh04: «АВТОРЛЫҚ КУРС 🚀: НӨЛДЕН ➔ МИЛЛИОН ҚАРАЛЫМ»
// 5) sh05: «ТЕЛЕГРАМ КАНАЛДА ✈️: ПРОМПТТАР МЕН САБАҚТАР»
// 6) sh07: «СІЛТЕМЕ ПРОФИЛЬДЕ! 👆»
import * as THREE from "three";
import { BOARD, EQ_X } from "./story";
import { FPS, shotStart } from "./timeline";

export const CHALK_FONT = "Caveat";
const CW = 2048, CH = 690;
const cl = (v: number) => Math.max(0, Math.min(1, v));
const q = (v: number) => Math.round(cl(v) * 40) / 40;

export type BoardState = {
  f: number;
  s01: number;
  s02: number;
  s03: number;
  s04: number;
  s05: number;
  s07: number;
};

export const boardAt = (f: number): BoardState => {
  const s01 = shotStart("sh01");
  const s02 = shotStart("sh02");
  const s03 = shotStart("sh03");
  const s04 = shotStart("sh04");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  return {
    f,
    s01: q((f - s01) / 20),
    s02: q((f - s02) / 20),
    s03: q((f - s03) / 25),
    s04: q((f - s04) / 25),
    s05: q((f - s05) / 25),
    s07: q((f - s07) / 20),
  };
};

const CHALK = "rgba(246,244,232,0.95)",
  YEL = "rgba(255,226,120,0.98)",
  CYAN = "rgba(130,230,255,0.98)",
  GREEN = "rgba(135,255,160,0.98)",
  ORANGE = "rgba(255,170,80,0.98)";

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

const paint = (g: CanvasRenderingContext2D, st: BoardState) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#204637";
  g.fillRect(0, 0, CW, CH);

  // Chalk dusting
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + (i % 3) * 0.01})`;
    g.beginPath();
    g.ellipse(120 + i * 140, 200 + (i % 4) * 90, 170, 60, 0.2 * (i % 3), 0, 7);
    g.fill();
  }

  // Header info
  g.font = font(50);
  g.textAlign = "right";
  g.textBaseline = "middle";
  g.fillStyle = CHALK;
  g.fillText("11 қараша", 1990, 55);
  g.textAlign = "left";
  g.fillText("ЖИ Шеберлік сабағы", 70, 55);

  const f = st.f;
  const s02 = shotStart("sh02");
  const s03 = shotStart("sh03");
  const s04 = shotStart("sh04");
  const s05 = shotStart("sh05");

  if (f < s02) {
    // sh01: Student panic
    const T1 = "3D АНИМАЦИЯ = 10 ЖЫЛ?";
    const px1 = fit(g, T1, 620, 130);
    reveal(g, T1, cx, 180, px1, ORANGE, st.s01);
    reveal(g, "«КҮРДЕЛІ МОНТАЖ ЖӘНЕ ҚИЫН БАҒДАРЛАМАЛАР?!»", cx, 320, 65, CHALK, st.s01);
  } else if (f < s03) {
    // sh02: Barys introduces AI
    const T2 = "ЖАСАНДЫ ИНТЕЛЛЕКТ 🤖";
    const px2 = fit(g, T2, 650, 140);
    reveal(g, T2, cx, 170, px2, GREEN, st.s02);
    reveal(g, "«Компьютердің де, 10 жыл оқудың да қажеті жоқ!»", cx, 320, 70, YEL, st.s02);
  } else if (f < s04) {
    // sh03: 3 Key Advantages
    reveal(g, "ЖИ МҮМКІНДІКТЕРІ ✦", cx, 120, 95, CYAN, st.s03);
    const bw = 540, bh = 80;
    paintBox(g, "🎬 3D АНИМАЦИЯ (0 ТӘЖІРИБЕ)", cx, 230, bw, bh, YEL, st.s03);
    paintBox(g, "🎙️ СТУДИЯЛЫҚ AI ДАУЫС", cx, 340, bw, bh, GREEN, st.s03);
    paintBox(g, "⚡ СЦЕНАРИЙ 2 МИНУТТА", cx, 450, bw, bh, CYAN, st.s03);
  } else if (f < s05) {
    // sh04: Course Announcement
    reveal(g, "🚀 АВТОРЛЫҚ КУРС: AI ВИДЕО", cx, 120, 105, GREEN, st.s04);
    reveal(g, "НӨЛДЕН ➔ 1 000 000 ҚАРАЛЫМ!", cx, 240, 95, YEL, st.s04);
    paintBox(g, "💰 ВИРУСТЫҚ ТАБЫС ЖӘНЕ МОНЕТИЗАЦИЯ", cx, 370, 680, 90, ORANGE, st.s04);
    reveal(g, "«Кез келген адам өз үйінде жасай алады!»", cx, 490, 65, CHALK, st.s04);
  } else {
    // sh05 .. sh07: Telegram Launch & Call to action
    reveal(g, "✈️ ТЕЛЕГРАМ КАНАЛДА ШЫҒАДЫ!", cx, 110, 110, CYAN, st.s05);
    const bw = 600, bh = 75;
    paintBox(g, "✦ БАРЛЫҚ ДАЙЫН ПРОМПТТАР", cx, 220, bw, bh, YEL, st.s05);
    paintBox(g, "✦ ҚАДАМДЫҚ БЕЙНЕ САБАҚТАР", cx, 320, bw, bh, GREEN, st.s05);
    paintBox(g, "✦ АВТОРЛЫҚ ШАБЛОНДАР", cx, 420, bw, bh, ORANGE, st.s05);
    reveal(g, "СІЛТЕМЕ ПРОФИЛЬДЕ / СИПАТТАМАДА! 👆", cx, 540, 85, YEL, st.s07);
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
  dispose() {
    this.tex.dispose();
  }
}
