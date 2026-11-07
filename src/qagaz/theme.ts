import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";

const subsets = ["cyrillic", "cyrillic-ext", "latin"] as const;

export const MONT = loadMont("normal", { weights: ["700", "800"], subsets: [...subsets] }).fontFamily;
export const OSW = loadOswald("normal", { weights: ["600", "700"], subsets: [...subsets] }).fontFamily;

export const C = {
  ink: "#0B0906",
  white: "#FFF8EC",
  amber: "#FFC65C",
  warm: "#F0A848",
  paper: "#F6F0E4",
  paperEdge: "#D9CFBD",
  line: "rgba(80, 110, 160, 0.22)",
};

export const W = 1080;
export const H = 1920;
// Безопасные зоны Reels: верх ≥ 250, низ ≤ 1520, справа ≥ 150
export const CAPTION_Y = 1300; // центр субтитров
export const BIG_Y = 560; // центр больших слов
