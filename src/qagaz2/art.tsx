import React from "react";
import { random } from "remotion";

// ---------- палитра (тёплый школьный коридор: мёд + бирюза, акцент — белая бумага) ----------
export const P = {
  ink: "#16110C",
  wallHi: "#F3E3C2",
  wall: "#E7D2A9",
  wallLo: "#D8BE8E",
  teal: "#2F6B66",
  tealDk: "#21504C",
  tealHi: "#3E847D",
  rail: "#1B3F3C",
  floor: "#7A4A26",
  floorDk: "#4F2D14",
  floorHi: "#A8683A",
  wood: "#7B4B28",
  woodDk: "#54311A",
  woodHi: "#9C6438",
  brass: "#D9A441",
  sun: "#FFD58A",
  sunHi: "#FFF1CF",
  paper: "#F7F2E7",
  paperDk: "#DCD3C2",
  amber: "#FFC65C",
  sky: "#BFE0EF",
};

// ---------- кейіпкерлер ----------
type Look = {
  skin: string;
  skinDk: string;
  hair: string;
  top: string;
  topDk: string;
  topHi: string;
  under?: string; // свитер/рубашка спереди
  pants: string;
  pantsDk: string;
  shoe: string;
  tie?: string;
  beard?: string;
  backpack?: string;
};
export const LOOKS: Record<"young" | "master" | "boy", Look> = {
  young: {
    skin: "#E0AE86",
    skinDk: "#C48C66",
    hair: "#1B1A20",
    top: "#A9CBEA",
    topDk: "#7FA6CC",
    topHi: "#CFE3F5",
    pants: "#3D4757",
    pantsDk: "#2A313D",
    shoe: "#4A2C1A",
    tie: "#22325A",
  },
  master: {
    skin: "#CF9670",
    skinDk: "#AE7653",
    hair: "#C9CDD2",
    top: "#80593A",
    topDk: "#5E3F27",
    topHi: "#9C7350",
    under: "#EADFC8",
    pants: "#3B302A",
    pantsDk: "#28201B",
    shoe: "#5A3520",
    beard: "#C4C7CC",
  },
  boy: {
    skin: "#E3B08A",
    skinDk: "#C69170",
    hair: "#17161B",
    top: "#22325A",
    topDk: "#172443",
    topHi: "#34477A",
    under: "#F4F4F0",
    pants: "#5E6676",
    pantsDk: "#454C59",
    shoe: "#1C1C22",
    backpack: "#C7392E",
  },
};

export type Pose = {
  lean?: number; // наклон корпуса вперёд, град
  head?: number; // кивок головы вперёд, град
  aBs?: number; // дальняя рука: плечо (вперёд +)
  aBe?: number; // дальняя рука: локоть (сгиб вперёд +)
  aFs?: number; // ближняя рука
  aFe?: number;
  lBh?: number; // дальняя нога: бедро (вперёд +)
  lBk?: number; // дальняя нога: колено (сгиб назад +)
  lFh?: number;
  lFk?: number;
  drop?: number; // насколько опустить таз, px
  rot?: number; // поворот всего тела вокруг ступней (падение), град
};

// Готовые позы
export const walk = (ph: number, amp = 1): Pose => {
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  return {
    lean: 4 * amp,
    lFh: 24 * s * amp,
    lBh: -24 * s * amp,
    lFk: Math.max(0, 34 * Math.sin(ph + 1.2)) * amp + 4,
    lBk: Math.max(0, -34 * Math.sin(ph + 1.2)) * amp + 4,
    aFs: -20 * s * amp,
    aBs: 20 * s * amp,
    aFe: 18,
    aBe: 18,
    drop: Math.abs(c) * 6 * amp,
  };
};
export const run = (ph: number, amp = 1): Pose => {
  const s = Math.sin(ph);
  return {
    lean: 14 * amp,
    lFh: 42 * s * amp,
    lBh: -42 * s * amp,
    lFk: Math.max(10, 75 * Math.sin(ph + 1.4)) * amp,
    lBk: Math.max(10, -75 * Math.sin(ph + 1.4)) * amp,
    aFs: -40 * s * amp,
    aBs: 40 * s * amp,
    aFe: 80,
    aBe: 80,
    drop: Math.abs(Math.cos(ph)) * 14 * amp,
  };
};
export const STAND: Pose = { lean: 0, head: 0, aFs: 4, aBs: -4, aFe: 10, aBe: 10, lFh: 2, lBh: -2, lFk: 2, lBk: 2 };
export const HUG: Partial<Pose> = { aFs: 55, aFe: 75, aBs: 45, aBe: 80 }; // обнимает стопку
export const KNEEL: Pose = { lean: 8, head: 10, lFh: 88, lFk: 92, lBh: -8, lBk: 100, drop: 118, aFs: 30, aFe: 30, aBs: 20, aBe: 30 };
export const SIT: Pose = { lean: -14, head: -4, lFh: 82, lFk: 70, lBh: 76, lBk: 40, drop: 205, aFs: -30, aFe: 10, aBs: -40, aBe: 10 };
export const CROUCH: Pose = { lean: 22, head: 18, lFh: 100, lFk: 130, lBh: 30, lBk: 135, drop: 130, aFs: 70, aFe: 40, aBs: 40, aBe: 30 };
export const BOW: Pose = { ...STAND, lean: 12, head: 34, aFs: 50, aFe: 70, aBs: 40, aBe: 75 };

export const mix = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.max(0, Math.min(1, t));
  const out: Pose = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Pose>;
  keys.forEach((key) => {
    out[key] = (a[key] ?? 0) * (1 - k) + (b[key] ?? 0) * k;
  });
  return out;
};

const TH = 128; // бедро
const SH = 126; // голень
const TO = 188; // корпус
const NK = 16;
const HR = 41;
const UA = 102;
const FA = 96;

const Shoe: React.FC<{ c: string; rot: number }> = ({ c, rot }) => (
  <g transform={`rotate(${rot})`}>
    <path d={`M -14 -8 Q -14 -14 -6 -14 L 22 -12 Q 46 -8 46 4 L 46 8 L -14 8 Z`} fill={c} />
    <rect x={-14} y={6} width={60} height={4} rx={2} fill="#000" opacity={0.35} />
  </g>
);

const Leg: React.FC<{ L: Look; h: number; k: number; back?: boolean }> = ({ L, h, k, back }) => {
  const pc = back ? L.pantsDk : L.pants;
  return (
    <g transform={`rotate(${-h})`}>
      <path d={`M -24 -6 L 24 -6 L 21 ${TH} L -19 ${TH} Z`} fill={pc} />
      <g transform={`translate(0 ${TH}) rotate(${k})`}>
        <circle r={20} fill={pc} />
        <path d={`M -19 0 L 20 0 L 16 ${SH} L -15 ${SH} Z`} fill={pc} />
        <g transform={`translate(0 ${SH})`}>
          <Shoe c={L.shoe} rot={h - k} />
        </g>
      </g>
    </g>
  );
};

const Arm: React.FC<{ L: Look; s: number; e: number; back?: boolean; hold?: React.ReactNode }> = ({ L, s, e, back, hold }) => {
  const c = back ? L.topDk : L.top;
  return (
    <g transform={`rotate(${-s})`}>
      <path d={`M -16 -4 L 16 -4 L 13 ${UA} L -12 ${UA} Z`} fill={c} />
      <g transform={`translate(0 ${UA}) rotate(${-e})`}>
        <circle r={13} fill={c} />
        <path d={`M -12 0 L 13 0 L 10 ${FA - 8} L -9 ${FA - 8} Z`} fill={c} />
        <g transform={`translate(0 ${FA})`}>
          <circle r={12} fill={back ? L.skinDk : L.skin} />
          {hold}
        </g>
      </g>
    </g>
  );
};

// Стопка бумаг и папок (растёт вверх от y=0)
export const Stack: React.FC<{ n: number; w?: number; seed?: number; wobble?: number }> = ({ n, w = 120, seed = 1, wobble = 0 }) => {
  const cols = [P.paper, P.paper, "#EDE6D6", "#7FA7C9", P.paper, "#E2C26A", P.paper, "#8BB68A", P.paper, "#E7E0D0"];
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const h = 7 + (random(`st${seed}-${i}`) > 0.7 ? 4 : 0);
        const dx = (random(`sx${seed}-${i}`) - 0.5) * 14 + wobble * i * 0.9;
        const c = cols[Math.floor(random(`sc${seed}-${i}`) * cols.length)];
        return (
          <g key={i} transform={`translate(${dx} ${-i * 7.6})`}>
            <rect x={-w / 2} y={-h} width={w} height={h} rx={1.5} fill={c} stroke="rgba(60,40,20,0.25)" strokeWidth={1} />
          </g>
        );
      })}
    </g>
  );
};

export const Notebook: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-6} y={-46} width={44} height={60} rx={4} fill="#6B3E22" />
    <rect x={-2} y={-42} width={36} height={52} rx={2} fill="#8A5530" />
    <rect x={-6} y={-46} width={8} height={60} rx={3} fill="#4E2C16" />
  </g>
);

export const Sheet2D: React.FC<{ w?: number; glow?: number }> = ({ w = 70, glow = 0 }) => (
  <g>
    {glow > 0 ? <rect x={-w / 2 - 14} y={-w * 0.7 - 14} width={w + 28} height={w * 1.4 + 28} rx={10} fill={P.sun} opacity={0.35 * glow} filter="url(#blur8)" /> : null}
    <rect x={-w / 2} y={-w * 0.7} width={w} height={w * 1.4} rx={2} fill={P.paper} stroke={P.paperDk} strokeWidth={1.5} />
    {new Array(7).fill(0).map((_, i) => (
      <rect key={i} x={-w / 2 + 8} y={-w * 0.7 + 14 + i * (w * 0.17)} width={w - 16 - (i % 3) * 8} height={2.4} fill="#9DB0C8" opacity={0.6} />
    ))}
  </g>
);

// Голова без лица
const Head: React.FC<{ L: Look; kind: string }> = ({ L, kind }) => (
  <g>
    <ellipse cx={4} cy={0} rx={HR * 0.92} ry={HR} fill={L.skin} />
    <ellipse cx={-6} cy={6} rx={HR * 0.6} ry={HR * 0.8} fill={L.skinDk} opacity={0.35} />
    {/* волосы */}
    {kind === "master" ? (
      <path d={`M ${-HR - 2} 6 Q ${-HR - 6} ${-HR - 6} 2 ${-HR - 6} Q ${HR + 4} ${-HR - 4} ${HR - 2} -10 Q ${HR - 14} -26 ${8} -26 Q -14 -24 -22 4 Z`} fill={L.hair} />
    ) : (
      <path d={`M ${-HR - 3} 12 Q ${-HR - 8} ${-HR - 10} 4 ${-HR - 9} Q ${HR + 8} ${-HR - 6} ${HR + 2} -8 Q ${HR - 10} -30 10 -24 Q -10 -22 -20 10 Z`} fill={L.hair} />
    )}
    {/* ухо */}
    <ellipse cx={-6} cy={4} rx={7} ry={10} fill={L.skinDk} />
    {/* борода у мастера */}
    {L.beard ? <path d={`M -6 18 Q 6 ${HR + 10} ${HR - 2} 16 Q ${HR - 8} 30 18 30 Q 4 30 -6 18 Z`} fill={L.beard} /> : null}
    {/* блик */}
    <ellipse cx={18} cy={-8} rx={12} ry={16} fill="#FFFFFF" opacity={0.12} />
  </g>
);

// Корпус (вид сбоку, лицом вправо)
const Torso: React.FC<{ L: Look; kind: string }> = ({ L, kind }) => (
  <g>
    <path d={`M -34 0 L 32 0 L 38 ${-TO + 26} Q 36 ${-TO} 12 ${-TO} L -24 ${-TO} Q -42 ${-TO} -40 ${-TO + 30} Z`} fill={L.top} />
    <path d={`M -34 0 L -10 0 L -14 ${-TO + 10} L -24 ${-TO} Q -42 ${-TO} -40 ${-TO + 30} Z`} fill={L.topDk} opacity={0.55} />
    {kind === "young" ? (
      <>
        <path d={`M 30 ${-TO + 18} L 36 ${-TO + 30} L 30 ${-TO + 120} L 24 ${-TO + 30} Z`} fill={L.tie} />
        <rect x={-34} y={-14} width={66} height={12} fill="#2B2B30" />
        <rect x={8} y={-TO + 70} width={18} height={24} rx={2} fill="#FFFFFF" />
        <rect x={10} y={-TO + 74} width={14} height={6} fill="#5A7FB5" />
      </>
    ) : null}
    {kind === "master" ? (
      <>
        <path d={`M 22 ${-TO + 6} L 37 ${-TO + 26} L 33 -40 L 20 -40 Z`} fill={L.under} />
        <path d={`M 22 ${-TO + 6} L 14 ${-TO + 60} L 22 -40`} stroke={L.topDk} strokeWidth={4} fill="none" />
        <rect x={-10} y={-90} width={30} height={6} rx={2} fill={L.topDk} opacity={0.6} />
      </>
    ) : null}
    {kind === "boy" ? (
      <>
        <path d={`M 18 ${-TO + 4} L 36 ${-TO + 22} L 30 ${-TO + 44} Z`} fill={L.under} />
        <rect x={-72} y={-TO + 22} width={42} height={120} rx={14} fill={L.backpack} />
        <rect x={-68} y={-TO + 70} width={34} height={40} rx={8} fill="#A52C22" />
      </>
    ) : null}
  </g>
);

export type PersonProps = {
  kind: "young" | "master" | "boy";
  x: number;
  y: number;
  s?: number;
  face?: 1 | -1;
  pose: Pose;
  carry?: "stack" | "notebook" | "sheet" | null;
  stackN?: number;
  stackWobble?: number;
  sheetGlow?: number;
  shadow?: number;
  tint?: string; // заливка-силуэт (для «призрака»/повтора)
  opacity?: number;
};

export const Person: React.FC<PersonProps> = ({
  kind,
  x,
  y,
  s = 1,
  face = 1,
  pose,
  carry = null,
  stackN = 16,
  stackWobble = 0,
  sheetGlow = 0,
  shadow = 0.28,
  tint,
  opacity = 1,
}) => {
  const L = LOOKS[kind];
  const p = { ...STAND, ...pose };
  const hipY = -(TH + SH) + (p.drop ?? 0);
  const hold =
    carry === "notebook" ? (
      <g transform="translate(-4 4)">
        <Notebook s={0.9} />
      </g>
    ) : carry === "sheet" ? (
      <g transform="translate(10 -50) rotate(-8)">
        <Sheet2D w={70} glow={sheetGlow} />
      </g>
    ) : null;
  const body = (
    <g transform={`rotate(${p.rot ?? 0})`}>
      <g transform={`translate(0 ${hipY})`}>
        {/* дальняя рука и нога */}
        <g transform={`translate(0 0) rotate(${p.lean ?? 0})`}>
          <g transform={`translate(-4 ${-TO + 14})`}>
            <Arm L={L} s={p.aBs ?? 0} e={p.aBe ?? 0} back />
          </g>
        </g>
        <Leg L={L} h={p.lBh ?? 0} k={p.lBk ?? 0} back />
        <g transform={`rotate(${p.lean ?? 0})`}>
          <Torso L={L} kind={kind} />
          {carry === "stack" ? (
            <g transform={`translate(${70} ${-TO * 0.32})`}>
              <Stack n={stackN} w={118} wobble={stackWobble} />
            </g>
          ) : null}
        </g>
        <Leg L={L} h={p.lFh ?? 0} k={p.lFk ?? 0} />
        <g transform={`rotate(${p.lean ?? 0})`}>
          <g transform={`translate(4 ${-TO + 14})`}>
            <Arm L={L} s={p.aFs ?? 0} e={p.aFe ?? 0} hold={hold} />
          </g>
          <g transform={`translate(4 ${-TO - NK}) rotate(${p.head ?? 0}) translate(0 ${-HR + 4})`}>
            <rect x={-10} y={HR - 10} width={22} height={NK + 12} fill={L.skinDk} />
            <Head L={L} kind={kind} />
          </g>
        </g>
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`} opacity={opacity}>
      {shadow > 0 ? <ellipse cx={0} cy={4} rx={kind === "boy" ? 70 : 95} ry={14} fill="#000" opacity={shadow} filter="url(#blur6)" /> : null}
      {tint ? (
        <g filter={`url(#tint-${tint})`}>{body}</g>
      ) : (
        body
      )}
    </g>
  );
};

// Силуэт со спины (для перспективных планов)
export const BackFigure: React.FC<{ x: number; y: number; h: number; kind: "young" | "master"; ph: number; rim?: number }> = ({ x, y, h, kind, ph, rim = 0.6 }) => {
  const L = LOOKS[kind];
  const k = h / 560;
  const sw = Math.sin(ph) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx={0} cy={4} rx={90} ry={14} fill="#000" opacity={0.3} filter="url(#blur6)" />
      <rect x={-34} y={-250 + Math.max(0, sw)} width={30} height={250 - Math.max(0, sw)} rx={10} fill={L.pantsDk} />
      <rect x={4} y={-250 + Math.max(0, -sw)} width={30} height={250 - Math.max(0, -sw)} rx={10} fill={L.pantsDk} />
      <path d="M -62 -245 L 62 -245 L 70 -420 Q 66 -445 40 -448 L -40 -448 Q -66 -445 -70 -420 Z" fill={L.topDk} />
      <rect x={-86} y={-430} width={26} height={170} rx={12} fill={L.topDk} transform={`rotate(${sw * 0.6} -73 -430)`} />
      <rect x={60} y={-430} width={26} height={170} rx={12} fill={L.topDk} transform={`rotate(${-sw * 0.6} 73 -430)`} />
      <circle cx={0} cy={-492} r={42} fill={L.skinDk} />
      <path d="M -44 -492 Q -46 -540 0 -540 Q 46 -540 44 -492 Q 30 -470 0 -470 Q -30 -470 -44 -492 Z" fill={L.hair} />
      {/* контровой свет */}
      <path d="M 62 -245 L 70 -420 Q 66 -445 40 -448" stroke={P.sunHi} strokeWidth={6} fill="none" opacity={rim} />
      <path d="M 44 -492 Q 46 -540 0 -540" stroke={P.sunHi} strokeWidth={5} fill="none" opacity={rim} />
    </g>
  );
};

// Ученик спереди за партой (без лица). rise: 0 — сидит, 1 — встал
export const KidFront: React.FC<{ x: number; y: number; s: number; rise: number; seed: number }> = ({ x, y, s, rise, seed }) => {
  const girl = random(`kg${seed}`) > 0.5;
  const skin = ["#E3B08A", "#D9A47E", "#E8BC98"][Math.floor(random(`ks${seed}`) * 3)];
  const up = -rise * 120;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${up})`}>
        <path d="M -62 0 L -56 -110 Q -50 -140 -20 -144 L 20 -144 Q 50 -140 56 -110 L 62 0 Z" fill="#22325A" />
        <path d="M -14 -144 L 0 -118 L 14 -144 Z" fill="#F4F4F0" />
        <rect x={-10} y={-166} width={20} height={26} fill={skin} opacity={0.9} />
        <ellipse cx={0} cy={-196} rx={34} ry={38} fill={skin} />
        {girl ? (
          <path d="M -38 -190 Q -40 -240 0 -240 Q 40 -240 38 -190 L 40 -150 L 28 -160 Q 30 -210 0 -214 Q -30 -210 -28 -160 L -40 -150 Z" fill="#2A1E1A" />
        ) : (
          <path d="M -36 -196 Q -38 -238 0 -238 Q 38 -238 36 -196 Q 30 -218 0 -220 Q -30 -218 -36 -196 Z" fill="#17161B" />
        )}
      </g>
    </g>
  );
};

// Рука сверху (метафора «руку помощи»)
export const ReachHand: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-700} width={120} height={600} rx={30} fill="#80593A" />
    <rect x={-60} y={-160} width={120} height={50} rx={10} fill="#5E3F27" />
    <rect x={-44} y={-118} width={88} height={30} fill="#EADFC8" />
    <path d="M -46 -92 Q -56 -20 -40 30 Q -30 60 -6 64 L 30 60 Q 50 40 52 0 L 50 -92 Z" fill="#CF9670" />
    {[-30, -12, 6, 24].map((fx, i) => (
      <rect key={i} x={fx - 7} y={40} width={15} height={70 - Math.abs(i - 1.5) * 10} rx={7} fill="#CF9670" />
    ))}
    <rect x={44} y={-40} width={16} height={60} rx={8} fill="#CF9670" transform="rotate(-30 52 -40)" />
  </g>
);

// Общие SVG-фильтры (размытие для теней, «тонирование» силуэтов)
export const Defs: React.FC = () => (
  <defs>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
    <filter id="blur20" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" />
    </filter>
    <filter id="tint-ghost">
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.86  0 0 0 0 0.6  0 0 0 0.45 0" />
    </filter>
    <filter id="tint-dark">
      <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.07  0 0 0 0 0.05  0 0 0 1 0" />
    </filter>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.floorHi} />
      <stop offset="0.35" stopColor={P.floor} />
      <stop offset="1" stopColor={P.floorDk} />
    </linearGradient>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#CDB487" />
      <stop offset="0.25" stopColor={P.wallHi} />
      <stop offset="1" stopColor={P.wall} />
    </linearGradient>
    <linearGradient id="tealG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.tealHi} />
      <stop offset="1" stopColor={P.tealDk} />
    </linearGradient>
    <linearGradient id="sunBeam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.sunHi} stopOpacity="0.85" />
      <stop offset="1" stopColor={P.sun} stopOpacity="0.15" />
    </linearGradient>
    <radialGradient id="vign" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#120A03" stopOpacity="0.55" />
    </radialGradient>
  </defs>
);
