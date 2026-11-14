// Chalkboard canvas for Lesson 6: «Троя аты: 10 жылдық қамалды 1 сыйлық қалай құлатты?»
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
};

export const boardAt = (f: number): BoardState => {
  const s01 = shotStart("sh01");
  const s03 = shotStart("sh03");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  const s09 = shotStart("sh09");
  return {
    f,
    s01: q((f - s01) / 20),
    s03: q((f - s03) / 15),
    s05: q((f - s05) / 20),
    s07: q((f - s07) / 20),
    s09: q((f - s09) / 20),
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
  g.fillText("14 қараша", 1990, 55);
  g.textAlign = "left";
  g.fillText("Тарих сабағы", 70, 55);

  const f = st.f;
  const s03 = shotStart("sh03");
  const s05 = shotStart("sh05");
  const s07 = shotStart("sh07");
  const s09 = shotStart("sh09");

  if (f < s03) {
    // sh01-sh02: The Trojan Puzzle
    reveal(g, "ТРОЯ АТЫ: ТАРИХИ ҚҰПИЯ 🤔", cx, 110, 85, YEL, st.s01);

    // Left: Castle
    paintBox(g, "🏰 10 ЖЫЛДЫҚ ҚАМАЛ", cx - 440, 260, 500, 100, GOLD, st.s01);
    reveal(g, "ЕШКІМ БҰЗА АЛМАҒАН!", cx - 440, 360, 52, CHALK, st.s01);

    // VS
    reveal(g, "VS", cx, 260, 75, RED, st.s01);

    // Right: Trojan horse
    paintBox(g, "🐴 1 АҒАШ АТ (СЫЙЛЫҚ)", cx + 440, 260, 500, 100, CYAN, st.s01);
    reveal(g, "ҚАҚПА АЛДЫНДАҒЫ ОЙЫНШЫҚ", cx + 440, 360, 52, CHALK, st.s01);

    reveal(g, "«Нұрлыбек: Олар қабырғаны дронмен атқан!»", cx, 490, 65, GREEN, st.s01);
  } else if (f < s05) {
    // sh03-sh04: 3200 years ago trick
    reveal(g, "3200 ЖЫЛ БҰРЫНҒЫ АЙЛА ⚔️", cx, 110, 85, CYAN, st.s03);
    reveal(g, "Гректер кемемен «кетіп қалған» болып алдады!", cx, 230, 70, CHALK, st.s03);
    paintBox(g, "🎁 АЛЫП АҒАШ АТ — ТЕГІН СЫЙЛЫҚ?!", cx, 350, 950, 100, GOLD, st.s03);
    reveal(g, "«Нұрлыбек: Тегін ойыншық! Селфи жасаймын!»", cx, 490, 65, ORANGE, st.s03);
  } else if (f < s07) {
    // sh05-sh06: Trojan Party
    reveal(g, "ТРОЯЛЫҚТАРДЫҢ МӘЗ ТОЙЫ 🎉", cx, 105, 85, GREEN, st.s05);
    reveal(g, "Атты қала ішіне кіргізді → Бүкіл қала тойлады!", cx, 220, 68, CHALK, st.s05);
    paintBox(g, "ТҮНДЕ БӘРІ ҰЙЫҚТАП ҚАЛДЫ... Zzz", cx, 345, 900, 95, YEL, st.s05);
    reveal(g, "«Нұрлыбек: Сосын не болды? Тағы сыйлық әкелді ме?»", cx, 490, 62, CYAN, st.s05);
  } else if (f < s09) {
    // sh07-sh08: Night ambush
    reveal(g, "ТҮНГІ ШАБУЫЛ ЖӘНЕ ТҰТҚИЫЛ! 💥", cx, 100, 85, RED, st.s07);
    reveal(g, "Ағаш аттың ішінен 40 қарулы батыр шықты!", cx, 210, 70, YEL, st.s07);
    paintBox(g, "ҚАҚПА ІШТЕН АШЫЛДЫ! ҚАЛА ЖОЙЫЛДЫ!", cx, 335, 980, 105, RED, st.s07);
    reveal(g, "«Нұрлыбек: Неге?! Сонда Троян вирусы да осыдан ба?!»", cx, 490, 62, ORANGE, st.s07);
  } else {
    // sh09-sh11: Historical lesson & modern cyber warning
    reveal(g, "ТАРИХИ ЕРЕЖЕ ЖӘНЕ САБАҚ 📜", cx, 95, 85, GOLD, st.s09);
    paintBox(g, "«СЫЙЛЫҚ ӘКЕЛГЕН ГРЕКТЕН ҚОРЫҚ!»", cx, 225, 980, 100, RED, st.s09);
    reveal(g, "⚠️ ҚАЗІРГІ ЗАМАН: «iPhone ұттыңыз» деген күдікті сілтемені БАСПА!", cx, 360, 60, GREEN, st.s09);
    reveal(g, "«Нұрлыбек: Кеше 1 миллион ұттыңыз деп смс келген еді...»", cx, 480, 58, YEL, st.s09);
    reveal(g, "АЛ СЕН БЕЙТАНЫС СЫЙЛЫҚТАРҒА СЕНЕСІҢ БЕ? 👇", cx, 570, 62, CYAN, st.s09);
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
    const k = `${st.f}|${st.s01}|${st.s03}|${st.s05}|${st.s07}|${st.s09}`;
    if (k === this.key) return;
    this.key = k;
    const g = this.cv.getContext("2d");
    if (!g) return;
    paint(g, st);
    this.tex.needsUpdate = true;
  }
  dispose() {
    this.tex.dispose();
  }
}
