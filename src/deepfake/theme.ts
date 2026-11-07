import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const subsets = ["cyrillic", "cyrillic-ext", "latin"] as const;

export const MONT = loadMont("normal", { weights: ["800", "900"], subsets: [...subsets] }).fontFamily;
export const INTER = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: [...subsets] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700", "800"], subsets: [...subsets] }).fontFamily;

export const C = {
  bg: "#070A12",
  bg2: "#0D1220",
  panel: "#0E1424",
  amber: "#FFC83D",
  red: "#FF3B47",
  green: "#34E39A",
  cyan: "#3FA9F5",
  blue: "#2F7BFF",
  warm: "#FFB46B",
  white: "#F4F6FB",
  dim: "rgba(244,246,251,0.30)",
  line: "rgba(120,150,200,0.22)",
};

export const W = 1080;
export const H = 1920;
// Раскладка 9:16 с безопасными зонами Reels
export const CHIP_Y = 196; // тайм-код
export const STAGE_TOP = 290; // главный объект: 290…1250
export const CAPTION_TOP = 1290; // субтитры: 1290…1480
