// Chalkboard canvas for Lesson 5: «100 миллион әлде 1 теңге? (Экспоненциалды өсу)»
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
  s08: number;
  s10: number;
};

export const boardAt = (f: number): BoardState => {
  const s01 = shotStart("sh01");
  const s03 = shotStart("sh03");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  const s08 = shotStart("sh08");
  const s10 = shotStart("sh10");
  return {
    f,
    s01: q((f - s01) / 20),
    s03: q((f - s03) / 15),
    s05: q((f - s05) / 25),
    s07: q((f - s07) / 25),
    s08: q((f - s08) / 20),
    s10: q((f - s10) / 20),
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
  g.fillText("12 қараша", 1990, 55);
  g.textAlign = "left";
  g.fillText("Математика сабағы", 70, 55);

  const f = st.f;
  const s03 = shotStart("sh03");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  const s08 = shotStart("sh08");
  const s10 = shotStart("sh10");

  if (f < s03) {
    // sh01-sh02: The Big Choice
    reveal(g, "ТАҢДАУ: ҚАЙСЫСЫ КӨП? 🤔", cx, 110, 85, YEL, st.s01);

    // Left option: 100M
    paintBox(g, "💼 100 000 000 ₸", cx - 420, 260, 480, 100, GOLD, st.s01);
    reveal(g, "ДӘЛ ҚАЗІР ҚОЛМА-ҚОЛ!", cx - 420, 360, 52, CHALK, st.s01);

    // VS
    reveal(g, "VS", cx, 260, 75, RED, st.s01);

    // Right option: 1 тг x 2
    paintBox(g, "🪙 1 ₸ × 2 (30 КҮН)", cx + 420, 260, 480, 100, CYAN, st.s01);
    reveal(g, "КҮН САЙЫН 2 ЕСЕЛЕНЕДІ", cx + 420, 360, 52, CHALK, st.s01);

    reveal(g, "«Нұрлыбек: Мен 100 миллионды аламын!»", cx, 490, 65, GREEN, st.s01);
  } else if (f < s05) {
    // sh03-sh04: The 1 Billion Shock
    reveal(g, "ҚАТЕ ТАҢДАУ! 😱", cx, 110, 95, RED, st.s03);
    reveal(g, "- 1 000 000 000 ₸ ШЫҒЫН!", cx, 240, 115, GOLD, st.s03);
    reveal(g, "100 000 000 ₸ < 1 ₸ × 2 (30 күн)", cx, 370, 85, CYAN, st.s03);
    reveal(g, "«Нұрлыбек: Ағай, неге?! Қалай сонда?!»", cx, 500, 65, CHALK, st.s03);
  } else if (f < s07) {
    // sh05-sh06: Days 1 to 10
    reveal(g, "КЕСТЕ: АЛҒАШҚЫ 10 КҮН 📈", cx, 95, 80, CYAN, st.s05);

    const leftX = cx - 360, rightX = cx + 360;
    reveal(g, "1-күн:  1 ₸", leftX, 190, 65, CHALK, st.s05);
    reveal(g, "2-күн:  2 ₸", leftX, 270, 65, CHALK, st.s05);
    reveal(g, "3-күн:  4 ₸", leftX, 350, 65, CHALK, st.s05);
    reveal(g, "5-күн:  16 ₸", leftX, 430, 65, YEL, st.s05);

    reveal(g, "7-күн:   64 ₸", rightX, 190, 65, CHALK, st.s05);
    reveal(g, "8-күн:  128 ₸", rightX, 270, 65, CHALK, st.s05);
    reveal(g, "9-күн:  256 ₸", rightX, 350, 65, CHALK, st.s05);
    paintBox(g, "10-күн:  512 ₸", rightX, 430, 360, 75, RED, st.s05);

    reveal(g, "«Нұрлыбек: Ахаха! 10 күнде 1 донер де жоқ қой!»", cx, 550, 60, ORANGE, st.s05);
  } else if (f < s08) {
    // sh07: Exponential Explosion 20-30 days
    reveal(g, "ЭКСПОНЕНЦИАЛДЫ ЖАРЫЛЫС! 💥", cx, 95, 85, RED, st.s07);
    reveal(g, "20-күн:  524 288 ₸  (Жарты миллион!)", cx, 200, 75, YEL, st.s07);
    reveal(g, "30-күн:  536 870 912 ₸ ! 🚀", cx, 305, 90, GREEN, st.s07);

    paintBox(g, "ЖАЛПЫ: 1 073 741 823 ₸ 💰", cx, 440, 920, 110, GOLD, st.s07);
    reveal(g, "БІР МИЛЛИАРД ЖЕТПІС ҮШ МИЛЛИОН ТЕҢГЕ!", cx, 555, 62, CHALK, st.s07);
  } else if (f < s10) {
    // sh08-sh09: Chessboard & King of India
    reveal(g, "ШАХМАТ ПЕН БИДАЙ АҢЫЗЫ 🌾", cx, 95, 85, GOLD, st.s08);
    reveal(g, "Үнді патшасы мен шахматты ойлап тапқан данышпан", cx, 195, 60, CHALK, st.s08);
    paintBox(g, "2⁶⁴ - 1 = 18 446 744 073 709 551 615 дән!", cx, 310, 1050, 95, CYAN, st.s08);
    reveal(g, "Жер бетіндегі барлық бидайды жинаса да ЖЕТПЕЙДІ!", cx, 430, 70, RED, st.s08);
    reveal(g, "«Нұрлыбек: Жедел жәрдем шақырыңызшы... жүрегім!»", cx, 540, 65, ORANGE, st.s08);
  } else {
    // sh10-sh11: Homework 2x twist
    reveal(g, "БАСТЫ САБАҚ: БІЛІМ САҒАН КҮШ БЕРЕДІ! 🧠", cx, 100, 85, GREEN, st.s10);
    paintBox(g, "ҮЙ ТАПСЫРМАСЫ × 2 ЕСЕЛЕНЕДІ! 📝", cx, 240, 950, 105, RED, st.s10);
    reveal(g, "«Күн сайын оқымасаң — қиындық та екі еселенеді!»", cx, 380, 70, YEL, st.s10);
    reveal(g, "АЛ СЕН 100 МИЛЛИОНДЫ АЛАР МА ЕДІҢ, ӘЛДЕ 1 ТЕҢГЕНІ МЕ? 👇", cx, 520, 62, GOLD, st.s10);
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
