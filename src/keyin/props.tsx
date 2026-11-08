import React from "react";
import { random } from "remotion";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { MONT } from "../qagaz/theme";
import { P, Pose, STAND } from "../qagaz2/art";
import { FLOOR } from "../qagaz2/sets";

export const CAVEAT = loadCaveat("normal", { weights: ["700"], subsets: ["cyrillic", "cyrillic-ext", "latin"] }).fontFamily;

export const K = {
  wall: "#E6CC9E",
  wallHi: "#F2DFBC",
  wallDk: "#C9A777",
  sofa: "#3F6E8E",
  sofaDk: "#2C506A",
  sofaHi: "#5585A6",
  floor: "#7A4A26",
  floorDk: "#4F2D14",
  rug: "#A8452F",
  rugDk: "#86331F",
  lamp: "#FFD58A",
  paper: "#FBF6EA",
  screen: "#8FD3FF",
  phone: "#1B1D25",
  office: "#A9BCCE",
  officeDk: "#7F95AB",
};
export const FL = 1560; // пол в квартире
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------- кинематика человечка из qagaz2/art (те же размеры) ----------
const TH = 128;
const SH = 126;
const TO = 188;
const NK = 16;
const HR = 41;
const UA = 102;
const FA = 96;
const rad = (d: number) => (d * Math.PI) / 180;
const rot = (x: number, y: number, a: number) => [x * Math.cos(rad(a)) - y * Math.sin(rad(a)), x * Math.sin(rad(a)) + y * Math.cos(rad(a))];
type Pt = { x: number; y: number };
// Где кисть руки (front — ближняя) и центр головы, в координатах кадра
export const handAt = (pose: Pose, x: number, y: number, s: number, face: 1 | -1, front = true): Pt => {
  const p = { ...STAND, ...pose };
  const L = p.lean ?? 0;
  const hipY = -(TH + SH) + (p.drop ?? 0);
  const sh = front ? p.aFs ?? 0 : p.aBs ?? 0;
  const el = front ? p.aFe ?? 0 : p.aBe ?? 0;
  const [sx, sy] = rot(front ? 4 : -4, -TO + 14, L);
  const [ux, uy] = rot(0, UA, L - sh);
  const [fx, fy] = rot(0, FA, L - sh - el);
  const lx = sx + ux + fx;
  const ly = hipY + sy + uy + fy;
  const [rx, ry] = rot(lx, ly, p.rot ?? 0);
  return { x: x + face * s * rx, y: y + s * ry };
};
export const headAt = (pose: Pose, x: number, y: number, s: number, face: 1 | -1): Pt => {
  const p = { ...STAND, ...pose };
  const L = p.lean ?? 0;
  const hipY = -(TH + SH) + (p.drop ?? 0);
  const [nx, ny] = rot(4, -TO - NK, L);
  const [hx, hy] = rot(0, -HR + 4, L + (p.head ?? 0));
  return { x: x + face * s * (nx + hx), y: y + s * (hipY + ny + hy) };
};
export const lapAt = (pose: Pose, x: number, y: number, s: number, face: 1 | -1): Pt => {
  const p = { ...STAND, ...pose };
  const hipY = -(TH + SH) + (p.drop ?? 0);
  const h = p.lFh ?? 0;
  const [kx, ky] = rot(0, TH, -h);
  return { x: x + face * s * kx * 0.55, y: y + s * (hipY + ky * 0.55) - 22 * s };
};

// ---------- телефон в руке (маленький, со светящимся экраном) ----------
export const HandPhone: React.FC<{ at: Pt; s: number; tilt?: number; glow?: number; lit?: number }> = ({ at, s, tilt = 0, glow = 1, lit = 1 }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${tilt}) scale(${s})`}>
    {glow > 0 ? <circle r={120} fill={K.screen} opacity={0.22 * glow} filter="url(#blur20)" /> : null}
    <rect x={-17} y={-32} width={34} height={60} rx={6} fill={K.phone} />
    <rect x={-14} y={-28} width={28} height={52} rx={4} fill={K.screen} opacity={0.35 + 0.65 * lit} />
    <rect x={-10} y={-22} width={20} height={6} rx={2} fill="#FFFFFF" opacity={0.6 * lit} />
    <rect x={-10} y={-12} width={14} height={10} rx={2} fill="#F2508A" opacity={0.7 * lit} />
    <rect x={-10} y={2} width={20} height={4} rx={2} fill="#FFFFFF" opacity={0.5 * lit} />
  </g>
);

// Свет экрана на лице (поверх головы)
export const FaceGlow: React.FC<{ at: Pt; s: number; k?: number; c?: string }> = ({ at, s, k = 1, c = K.screen }) => (
  <circle cx={at.x} cy={at.y} r={70 * s} fill={c} opacity={0.28 * k} filter="url(#blur20)" style={{ mixBlendMode: "screen" }} />
);

// ---------- гостиная (вечер/ночь) ----------
export const LivingRoom: React.FC<{ night?: number; door?: number; frame?: boolean }> = ({ night = 0, door = 0, frame = true }) => (
  <g>
    <defs>
      <linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={K.wallDk} />
        <stop offset="0.45" stopColor={K.wall} />
        <stop offset="1" stopColor={K.wallHi} />
      </linearGradient>
      <linearGradient id="kDusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24305E" />
        <stop offset="0.65" stopColor="#7A5C8C" />
        <stop offset="1" stopColor="#E89A62" />
      </linearGradient>
      <radialGradient id="kLampGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={K.lamp} stopOpacity="0.75" />
        <stop offset="1" stopColor={K.lamp} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1080} height={FL} fill="url(#kWall)" />
    {/* орнамент обоев */}
    {new Array(9).fill(0).map((_, c) =>
      new Array(11).fill(0).map((_, r) => (
        <path key={`${c}-${r}`} d={`M ${c * 130 + (r % 2) * 65 + 40} ${r * 140 + 80} l 10 18 l -10 18 l -10 -18 Z`} fill="#FFFFFF" opacity={0.09} />
      )),
    )}
    {/* окно */}
    <g transform="translate(120 470)">
      <rect x={-16} y={-16} width={292} height={392} rx={6} fill="#F4EEE2" />
      <rect width={260} height={360} fill={night > 0.5 ? "#121A3A" : "url(#kDusk)"} />
      {[30, 90, 150, 200].map((x, i) => (
        <rect key={i} x={x} y={250 - (i % 2) * 40} width={46} height={150} fill="#1B2348" opacity={0.85} />
      ))}
      {[38, 100, 160, 208].map((x, i) => (
        <rect key={`w${i}`} x={x} y={270 - (i % 2) * 40} width={10} height={12} fill="#FFD58A" opacity={0.8} />
      ))}
      <rect x={126} width={8} height={360} fill="#F4EEE2" />
      <path d="M -46 -36 L 30 -36 Q 22 190 50 392 L -46 392 Z" fill="#B85A3C" />
      <path d="M 230 -36 L 306 -36 L 306 392 L 212 392 Q 238 190 230 -36 Z" fill="#B85A3C" />
      <rect x={-56} y={-50} width={372} height={16} rx={8} fill="#3A2A1A" />
    </g>
    {/* семейная фотография в рамке */}
    {frame ? (
      <g transform="translate(470 560) rotate(2)">
        <rect width={190} height={150} fill="#5A3A22" />
        <rect x={12} y={12} width={166} height={126} fill="#E9DCC4" />
        {[40, 80, 118, 150].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={70 - (i === 2 ? -10 : 0)} r={i === 2 ? 11 : 14} fill="#7A5A44" opacity={0.75} />
            <rect x={x - (i === 2 ? 10 : 14)} y={86 - (i === 2 ? -10 : 0)} width={i === 2 ? 20 : 28} height={40} rx={8} fill="#7A5A44" opacity={0.6} />
          </g>
        ))}
      </g>
    ) : null}
    {/* дверь слева (открывается: тёплый свет из коридора) */}
    <g>
      <rect x={-20} y={880} width={150} height={FL - 880} fill="#6E4428" />
      <rect x={0} y={900} width={110} height={FL - 900} fill={door > 0 ? "#FFE2A8" : "#4A2C18"} opacity={door > 0 ? 0.35 + 0.65 * door : 1} />
    </g>
    {/* полка справа (для телефона) */}
    <g>
      <rect x={760} y={760} width={300} height={16} rx={4} fill="#7B4B28" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={790 + i * 34} y={650 + (i % 2) * 14} width={28} height={110 - (i % 2) * 14} rx={3} fill={["#C7392E", "#2E6FB0", "#E2C26A", "#3F7F6F", "#8A5A9A"][i]} />
      ))}
      <path d="M 990 760 L 1000 700 L 1046 700 L 1056 760 Z" fill="#B0412E" />
      <ellipse cx={1023} cy={690} rx={40} ry={26} fill="#3E8A4E" />
    </g>
    {/* торшер */}
    <g>
      <circle cx={1010} cy={930} r={260} fill="url(#kLampGlow)" opacity={0.55 + 0.45 * night} />
      <rect x={1004} y={960} width={10} height={FL - 960} fill="#2B2B30" />
      <ellipse cx={1009} cy={FL - 4} rx={50} ry={10} fill="#2B2B30" />
      <path d="M 950 960 L 1068 960 L 1046 870 L 972 870 Z" fill="#F1D9A8" />
    </g>
    {/* пол и ковёр */}
    <rect y={FL - 16} width={1080} height={16} fill="#EFE6D6" />
    <rect x={-300} y={FL} width={1680} height={1920 - FL} fill={K.floor} />
    {new Array(6).fill(0).map((_, i) => (
      <rect key={i} y={FL + 34 + i * 62} width={1080} height={4} fill={K.floorDk} opacity={0.45} />
    ))}
    <path d={`M 140 ${FL + 60} L 980 ${FL + 60} L 1060 ${FL + 260} L 60 ${FL + 260} Z`} fill={K.rug} />
    <path d={`M 180 ${FL + 90} L 940 ${FL + 90} L 1000 ${FL + 230} L 120 ${FL + 230} Z`} fill="none" stroke={K.rugDk} strokeWidth={10} />
    {night > 0 ? <rect width={1080} height={1920} fill="#0A0E28" opacity={0.5 * night} /> : null}
  </g>
);

// Диван: спинка (позади человека) и подлокотник (спереди)
export const SofaBack: React.FC<{ x?: number }> = ({ x = 600 }) => (
  <g>
    <rect x={x} y={1150} width={520} height={290} rx={40} fill={K.sofaDk} />
    <rect x={x + 20} y={1170} width={480} height={150} rx={30} fill={K.sofa} />
    <rect x={x - 20} y={1400} width={560} height={110} rx={26} fill={K.sofa} />
    <rect x={x - 20} y={1400} width={560} height={22} rx={10} fill={K.sofaHi} opacity={0.6} />
    <rect x={x} y={1500} width={18} height={FL - 1500} fill="#2B2018" />
    <rect x={x + 480} y={1500} width={18} height={FL - 1500} fill="#2B2018" />
  </g>
);
export const SofaArm: React.FC<{ x?: number }> = ({ x = 600 }) => (
  <g>
    <rect x={x - 70} y={1300} width={100} height={210} rx={30} fill={K.sofaDk} />
    <rect x={x - 70} y={1300} width={100} height={30} rx={14} fill={K.sofaHi} opacity={0.5} />
  </g>
);

// Ноутбук на коленях (лицом к человеку)
export const Laptop: React.FC<{ at: Pt; s: number; face: 1 | -1; glow?: number }> = ({ at, s, face, glow = 1 }) => (
  <g transform={`translate(${at.x} ${at.y}) scale(${s * face} ${s})`}>
    <rect x={-10} y={-6} width={120} height={10} rx={3} fill="#9AA0AC" />
    <g transform="translate(108 0) rotate(-104)">
      <rect x={0} y={-6} width={96} height={8} rx={3} fill="#7E8592" />
    </g>
    <circle cx={60} cy={-80} r={120} fill={K.screen} opacity={0.18 * glow} filter="url(#blur20)" />
  </g>
);

// ---------- детский рисунок «МЕНІҢ ОТБАСЫМ» ----------
const jit = (seed: string, i: number, a: number) => (random(`${seed}-${i}`) - 0.5) * 2 * a;
type XY = [number, number];
const wob = (pts: XY[], seed: string, a = 4): XY[] => pts.map(([x, y], i) => [x + jit(seed + "x", i, a), y + jit(seed + "y", i, a)]);
const smooth = (pts: XY[], close = false) => {
  if (pts.length < 3) return `M ${pts.map((p) => p.join(" ")).join(" L ")}`;
  const n = pts.length;
  const mid = (a: XY, b: XY): XY => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = close ? `M ${mid(pts[n - 1], pts[0]).join(" ")}` : `M ${pts[0].join(" ")}`;
  const last = close ? n : n - 1;
  for (let i = close ? 0 : 1; i < last; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    d += ` Q ${p[0]} ${p[1]} ${mid(p, q).join(" ")}`;
  }
  if (!close) d += ` L ${pts[n - 1].join(" ")}`;
  return d + (close ? " Z" : "");
};
const ring = (cx: number, cy: number, rx: number, ry: number, seed: string, a = 3, n = 14): XY[] =>
  new Array(n).fill(0).map((_, i) => {
    const t = (i / n) * Math.PI * 2;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry] as XY;
  }).map(([x, y], i) => [x + jit(seed + "rx", i, a), y + jit(seed + "ry", i, a)] as XY);

const Cr: React.FC<{ d: string; c: string; w?: number; fill?: string; fo?: number }> = ({ d, c, w = 9, fill, fo = 0.75 }) => (
  <g>
    {fill ? <path d={d} fill={fill} opacity={fo} /> : null}
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
    <path d={d} fill="none" stroke={c} strokeWidth={w * 0.45} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} transform="translate(2.5 -2)" />
  </g>
);
// штриховка карандашом внутри области (как дети закрашивают)
const Hatch: React.FC<{ x: number; y: number; w: number; h: number; c: string; seed: string; clip: string }> = ({ x, y, w, h, c, seed, clip }) => (
  <g clipPath={`url(#${clip})`}>
    {new Array(Math.ceil((w + h) / 16)).fill(0).map((_, i) => {
      const o = i * 16 + jit(seed, i, 3);
      return <line key={i} x1={x + o} y1={y} x2={x + o - h * 0.8} y2={y + h} stroke={c} strokeWidth={7} strokeLinecap="round" opacity={0.55} />;
    })}
  </g>
);

const Face: React.FC<{ cx: number; cy: number; r: number; seed: string }> = ({ cx, cy, r, seed }) => (
  <g>
    <circle cx={cx - r * 0.35} cy={cy - r * 0.12} r={r * 0.09} fill="#2A1C14" />
    <circle cx={cx + r * 0.35} cy={cy - r * 0.12} r={r * 0.09} fill="#2A1C14" />
    <Cr d={smooth(wob([[cx - r * 0.45, cy + r * 0.25], [cx, cy + r * 0.6], [cx + r * 0.45, cy + r * 0.25]], seed + "m", 2))} c="#C0392B" w={6} />
  </g>
);

const Stick: React.FC<{ pts: XY[]; seed: string; c?: string; w?: number }> = ({ pts, seed, c = "#2A1C14", w = 8 }) => <Cr d={smooth(wob(pts, seed, 3))} c={c} w={w} />;

export const KidDrawing: React.FC<{ fixed?: number; award?: boolean; heart?: number }> = ({ fixed = 0, award = false, heart = 0 }) => {
  const title = "МЕНІҢ ОТБАСЫМ";
  const cols = ["#D2412F", "#2E6FB0", "#3E9A4E", "#E08A1E", "#8A4FB0"];
  return (
    <g filter="url(#kCrayon)">
      {/* лист */}
      <rect x={-462} y={-612} width={924} height={1224} fill="#000" opacity={0.25} filter="url(#blur8)" transform="translate(10 14)" />
      <rect x={-450} y={-600} width={900} height={1200} fill={K.paper} />
      <rect x={-450} y={-600} width={900} height={1200} fill="none" stroke="#E6DCC6" strokeWidth={4} />
      {/* скотч по углам */}
      {[
        [-430, -585, -20],
        [430, -585, 20],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x - 60} y={y - 18} width={120} height={36} fill="#F4EBC8" opacity={0.75} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {/* заголовок */}
      <text x={0} y={-470} textAnchor="middle" fontFamily={CAVEAT} fontWeight={700} fontSize={104}>
        {title.split("").map((ch, i) => (
          <tspan key={i} fill={cols[i % cols.length]} dy={i === 0 ? 0 : (i % 2 ? -6 : 6)}>
            {ch}
          </tspan>
        ))}
      </text>
      {/* солнце */}
      <Cr d={smooth(ring(330, -330, 62, 62, "sun", 4), true)} c="#E8B21E" w={10} fill="#FFD84A" fo={0.7} />
      {new Array(9).fill(0).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <Stick key={i} seed={`ray${i}`} c="#E8B21E" pts={[[330 + Math.cos(a) * 84, -330 + Math.sin(a) * 84], [330 + Math.cos(a) * 124, -330 + Math.sin(a) * 124]]} />;
      })}
      {/* трава */}
      <Cr d={`M -440 470 ${new Array(30).fill(0).map((_, i) => `L ${-440 + i * 30 + 15} ${450 + (i % 2) * 34 + jit("gr", i, 6)}`).join(" ")}`} c="#3E9A4E" w={9} />
      {/* ÄЖЕ: платок в горошек, фиолетовое платье, палочка */}
      <defs>
        <clipPath id="kAje">
          <path d="M -330 -90 L -420 330 L -240 330 Z" />
        </clipPath>
        <clipPath id="kAna">
          <path d="M -160 -110 L -250 330 L -70 330 Z" />
        </clipPath>
        <clipPath id="kBoy">
          <rect x={-55} y={10} width={110} height={170} />
        </clipPath>
        <clipPath id="kDad">
          <rect x={170} y={-110} width={130} height={260} />
        </clipPath>
      </defs>
      <Hatch x={-430} y={-100} w={200} h={440} c="#8A4FB0" seed="hA" clip="kAje" />
      <Cr d={smooth(wob([[-330, -90], [-420, 330], [-240, 330]], "aje", 4), true)} c="#6A3290" w={9} />
      <Cr d={smooth(ring(-330, -150, 50, 52, "ajeH", 3), true)} c="#B5784E" w={8} fill="#F5C9A0" fo={0.85} />
      <Cr d={smooth(wob([[-392, -150], [-382, -212], [-330, -226], [-278, -212], [-268, -150], [-300, -186], [-360, -186]], "scarf", 3), true)} c="#2E6FB0" w={8} fill="#FFFFFF" fo={0.9} />
      {[
        [-350, -205],
        [-318, -210],
        [-296, -196],
        [-366, -190],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill="#2E6FB0" />
      ))}
      <Face cx={-330} cy={-146} r={50} seed="ajeF" />
      <Stick seed="ajeA1" pts={[[-360, 0], [-420, 90]]} />
      <Stick seed="ajeA2" pts={[[-300, 0], [-240, 70]]} />
      <Stick seed="cane" c="#7B4B28" w={10} pts={[[-425, 85], [-440, 330]]} />
      {/* АНА: длинные волосы, розовое платье, держит Айбара за руку */}
      <Hatch x={-260} y={-120} w={200} h={460} c="#E86A9A" seed="hB" clip="kAna" />
      <Cr d={smooth(wob([[-160, -110], [-250, 330], [-70, 330]], "ana", 4), true)} c="#C2406E" w={9} />
      <Cr d={smooth(wob([[-218, -150], [-226, -60], [-200, -90], [-120, -90], [-96, -60], [-104, -150], [-160, -232]], "hair", 4), true)} c="#2A1C14" w={8} fill="#3A2418" fo={0.9} />
      <Cr d={smooth(ring(-160, -168, 52, 54, "anaH", 3), true)} c="#B5784E" w={8} fill="#F5C9A0" fo={0.85} />
      <Cr d={smooth(wob([[-212, -180], [-200, -228], [-160, -236], [-118, -226], [-106, -184], [-140, -206], [-180, -206]], "fringe", 3), true)} c="#2A1C14" w={7} fill="#3A2418" fo={0.95} />
      <Face cx={-160} cy={-164} r={52} seed="anaF" />
      <Stick seed="anaA1" pts={[[-190, -20], [-250, 70]]} />
      <Stick seed="anaA2" pts={[[-130, -20], [-70, 40], [-40, 60]]} />
      {/* АЙБАР: маленький, синяя рубашка */}
      <Hatch x={-60} y={10} w={120} h={180} c="#3F86D0" seed="hC" clip="kBoy" />
      <Cr d={smooth(wob([[-55, 10], [55, 10], [55, 180], [-55, 180]], "boyB", 3), true)} c="#2E6FB0" w={9} />
      <Cr d={smooth(ring(0, -40, 44, 46, "boyH", 3), true)} c="#B5784E" w={8} fill="#F5C9A0" fo={0.85} />
      <Cr d={`M -40 -64 L -30 -96 L -14 -70 L 0 -102 L 14 -70 L 30 -96 L 40 -64`} c="#2A1C14" w={8} />
      <Face cx={0} cy={-36} r={44} seed="boyF" />
      <Stick seed="boyA1" pts={[[-50, 40], [-40, 60]]} />
      <Stick seed="boyA2" pts={[[50, 40], [100, 80]]} />
      <Stick seed="boyL1" pts={[[-30, 180], [-40, 330]]} />
      <Stick seed="boyL2" pts={[[30, 180], [40, 330]]} />
      {/* ӘКЕ: костюм, красный галстук, вместо головы — телефон */}
      <Hatch x={170} y={-110} w={130} h={260} c="#6E7682" seed="hD" clip="kDad" />
      <Cr d={smooth(wob([[170, -110], [300, -110], [300, 150], [170, 150]], "dadB", 3), true)} c="#3E444E" w={9} />
      <Cr d={smooth(wob([[235, -108], [222, -40], [235, 10], [248, -40]], "tie", 2), true)} c="#C0392B" w={7} fill="#E04A3A" fo={0.9} />
      <Stick seed="dadA1" pts={[[170, -90], [120, 10]]} />
      <Stick seed="dadA2" pts={[[300, -90], [350, 20]]} />
      <Stick seed="dadL1" pts={[[200, 150], [190, 330]]} />
      <Stick seed="dadL2" pts={[[270, 150], [280, 330]]} />
      <Stick seed="neck" pts={[[235, -130], [235, -110]]} />
      <g opacity={1 - cl(fixed * 1.5)}>
        <Cr d={smooth(wob([[172, -330], [298, -330], [298, -134], [172, -134]], "ph", 3), true)} c="#14141A" w={11} fill="#2A2C36" fo={0.95} />
        <rect x={188} y={-312} width={94} height={156} rx={8} fill="#8FD3FF" opacity={0.9} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={198 + c * 28} y={-300 + r * 30} width={20} height={20} rx={5} fill={["#F2508A", "#FFD84A", "#3E9A4E", "#E08A1E"][(r + c) % 4]} />),
        )}
        <rect x={198} y={-208} width={74} height={8} rx={4} fill="#FFFFFF" opacity={0.8} />
        <rect x={198} y={-192} width={54} height={8} rx={4} fill="#FFFFFF" opacity={0.6} />
        {new Array(6).fill(0).map((_, i) => {
          const a = -Math.PI * 0.9 + (i / 5) * Math.PI * 0.8;
          return <Stick key={i} seed={`glow${i}`} c="#5BB8F0" w={6} pts={[[235 + Math.cos(a) * 120, -232 + Math.sin(a) * 135], [235 + Math.cos(a) * 150, -232 + Math.sin(a) * 165]]} />;
        })}
      </g>
      {/* исправленная голова папы: кружок бумаги на скотче с улыбкой */}
      {fixed > 0 ? (
        <g opacity={cl(fixed * 1.4)} transform={`translate(235 -232) scale(${0.85 + 0.15 * cl(fixed)}) translate(-235 232)`}>
          <circle cx={235} cy={-232} r={86} fill="#FFFDF5" stroke="#E2D8C2" strokeWidth={3} />
          <rect x={175} y={-330} width={120} height={30} fill="#F4EBC8" opacity={0.8} transform="rotate(-12 235 -315)" />
          <Cr d={smooth(ring(235, -232, 56, 58, "dadH", 3), true)} c="#B5784E" w={8} fill="#F5C9A0" fo={0.85} />
          <Cr d={smooth(wob([[182, -246], [190, -290], [235, -300], [280, -290], [288, -246], [262, -270], [210, -270]], "dadHair", 3), true)} c="#2A1C14" w={7} fill="#2A1C14" fo={0.9} />
          <Face cx={235} cy={-226} r={56} seed="dadF" />
        </g>
      ) : null}
      {heart > 0 ? (
        <g transform={`translate(115 -150) scale(${heart})`}>
          <Cr d={smooth(wob([[0, 30], [-46, -6], [-34, -40], [0, -24], [34, -40], [46, -6]], "heart", 2), true)} c="#C0392B" w={8} fill="#F05A5A" fo={0.85} />
        </g>
      ) : null}
      {/* дастархан впереди: стол, кесе, баурсаки, чайник */}
      <Cr d={smooth(wob([[-420, 210], [420, 210], [400, 300], [-400, 300]], "tbl", 4), true)} c="#7B4B28" w={10} fill="#B5773E" fo={0.85} />
      {[-300, -120, 80, 260].map((x, i) => (
        <Cr key={i} d={`M ${x - 34} 208 Q ${x} 250 ${x + 34} 208 Z`} c="#2E6FB0" w={7} fill="#FFFFFF" fo={0.9} />
      ))}
      {[
        [-20, 196],
        [10, 192],
        [-5, 172],
        [26, 178],
        [-36, 180],
      ].map(([x, y], i) => (
        <Cr key={`b${i}`} d={smooth(ring(x, y, 14, 12, `bs${i}`, 2, 8), true)} c="#8A5525" w={5} fill="#D99A4E" fo={0.9} />
      ))}
      <Cr d={smooth(wob([[330, 205], [320, 150], [360, 130], [400, 150], [390, 205]], "tea", 3), true)} c="#C0392B" w={7} fill="#F2C94C" fo={0.9} />
      <Stick seed="spout" c="#C0392B" w={7} pts={[[322, 165], [290, 140]]} />
      {/* мысық у стола */}
      <Cr d={smooth(ring(400, 380, 46, 30, "catB", 3), true)} c="#C46A1E" w={7} fill="#F2A24A" fo={0.85} />
      <Cr d={smooth(wob([[350, 360], [352, 322], [366, 340], [384, 322], [388, 360]], "catH", 2), true)} c="#C46A1E" w={7} fill="#F2A24A" fo={0.85} />
      <Stick seed="tail" c="#C46A1E" w={7} pts={[[444, 380], [460, 340], [446, 320]]} />
      {/* розетка «1-ОРЫН» */}
      {award ? (
        <g transform="translate(-350 -360) rotate(-12)">
          <path d="M -30 30 L -54 130 L -22 112 L -6 140 L 10 40 Z" fill="#2E6FB0" />
          <path d="M 30 30 L 54 130 L 22 112 L 6 140 L -10 40 Z" fill="#C0392B" />
          {new Array(16).fill(0).map((_, i) => (
            <circle key={i} cx={Math.cos((i / 16) * Math.PI * 2) * 62} cy={Math.sin((i / 16) * Math.PI * 2) * 62} r={18} fill="#E8B21E" />
          ))}
          <circle r={60} fill="#FFD84A" />
          <circle r={46} fill="#FFFFFF" />
          <text y={18} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={44} fill="#B0412E">
            1
          </text>
        </g>
      ) : null}
    </g>
  );
};

// Фильтр «восковой мелок»: неровный край и просветы бумаги
export const KDefs: React.FC = () => (
  <defs>
    <filter id="kCrayon" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="kSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
  </defs>
);

// Обратная сторона рисунка (чтобы не показать его раньше времени)
export const PaperBack: React.FC<{ w: number; h: number; tint?: string }> = ({ w, h, tint = "#EFE7D6" }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={tint} stroke="#D8CDB6" strokeWidth={3} />
    <circle cx={w * 0.18} cy={-h * 0.22} r={w * 0.08} fill="#FFD84A" opacity={0.25} />
    <path d={`M ${-w * 0.3} ${h * 0.3} Q 0 ${h * 0.22} ${w * 0.3} ${h * 0.32}`} stroke="#3E9A4E" strokeWidth={6} fill="none" opacity={0.18} />
  </g>
);

// Лист в руках (вид сбоку, наискосок)
export const HeldSheet: React.FC<{ at: Pt; s: number; rot?: number; up?: number }> = ({ at, s, rot: r = -8, up = 1 }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${r}) scale(${s})`}>
    <path d="M -10 -110 L 40 -96 L 40 70 L -10 60 Z" fill={K.paper} stroke="#D8CDB6" strokeWidth={3} />
    <circle cx={22} cy={-60} r={9} fill="#FFD84A" opacity={0.9 * up} />
    <path d="M -2 30 L 34 36" stroke="#3E9A4E" strokeWidth={5} opacity={0.8} />
    <path d="M 6 -20 L 10 10 M 22 -24 L 26 14" stroke="#2E6FB0" strokeWidth={4} opacity={0.7} />
  </g>
);

// ---------- рюкзак сверху (рисунок прячется внутрь) ----------
export const BackpackTop: React.FC<{ open?: number }> = ({ open = 1 }) => (
  <g>
    <rect x={190} y={1100} width={700} height={620} rx={110} fill="#C7392E" />
    <rect x={250} y={1150} width={580} height={240} rx={60} fill="#A52C22" />
    <path d={`M 260 1180 Q 540 ${1180 - 60 * open} 820 1180 L 820 1240 Q 540 ${1260 + 30 * open} 260 1240 Z`} fill="#3A0E0A" />
    <rect x={250} y={1170} width={580} height={14} rx={7} fill="#E8C24A" />
    <rect x={330} y={1450} width={420} height={200} rx={40} fill="#B23126" />
    <rect x={500} y={1470} width={80} height={16} rx={8} fill="#E8C24A" />
  </g>
);

// ---------- офис ----------
export const Office: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="kOff" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={K.officeDk} />
        <stop offset="1" stopColor={K.office} />
      </linearGradient>
      <linearGradient id="kCity" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8EC8EC" />
        <stop offset="1" stopColor="#DCEFF8" />
      </linearGradient>
    </defs>
    <rect width={1080} height={FL} fill="url(#kOff)" />
    {/* большое окно с городом */}
    <g transform="translate(470 360)">
      <rect x={-14} y={-14} width={588} height={628} fill="#E8EDF2" />
      <rect width={560} height={600} fill="url(#kCity)" />
      {[0, 70, 150, 230, 320, 400, 470].map((x, i) => (
        <g key={i}>
          <rect x={x} y={300 - (i % 3) * 70} width={66} height={400} fill={["#9FB6C9", "#B6C8D6", "#8EA7BC"][i % 3]} />
          {new Array(6).fill(0).map((_, r) => (
            <rect key={r} x={x + 10} y={320 - (i % 3) * 70 + r * 44} width={46} height={10} fill="#DCEAF4" opacity={0.7} />
          ))}
        </g>
      ))}
      <rect x={276} width={8} height={600} fill="#E8EDF2" />
    </g>
    {/* растение и шкаф */}
    <rect x={40} y={980} width={300} height={FL - 980} fill="#C9D2DB" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={60} y={1010 + i * 180} width={260} height={150} fill="#B4BFCA" />
    ))}
    <path d="M 120 980 L 132 900 L 220 900 L 232 980 Z" fill="#7A8A5A" />
    <ellipse cx={176} cy={870} rx={80} ry={60} fill="#4E8A52" />
    <rect y={FL - 14} width={1080} height={14} fill="#E3E8EE" />
    <rect x={-300} y={FL} width={1680} height={1920 - FL} fill="#6E7680" />
    {new Array(6).fill(0).map((_, i) => (
      <rect key={i} y={FL + 40 + i * 60} width={1080} height={3} fill="#4F565F" opacity={0.5} />
    ))}
  </g>
);
// Стол с монитором (папа сидит справа, смотрит влево)
export const OfficeDesk: React.FC = () => (
  <g>
    <rect x={150} y={1290} width={520} height={24} rx={4} fill="#E9EEF2" />
    <rect x={170} y={1314} width={18} height={FL - 1314} fill="#9AA6B2" />
    <rect x={630} y={1314} width={18} height={FL - 1314} fill="#9AA6B2" />
    {/* монитор боком к нам, экран к папе */}
    <rect x={330} y={1270} width={70} height={20} rx={4} fill="#3A3E48" />
    <rect x={358} y={1180} width={14} height={92} fill="#3A3E48" />
    <rect x={384} y={1000} width={22} height={210} rx={6} fill="#2B2E36" />
    <circle cx={500} cy={1100} r={130} fill={K.screen} opacity={0.15} filter="url(#blur20)" />
    {/* бумаги, кружка */}
    <rect x={190} y={1270} width={120} height={20} fill="#FFFFFF" />
    <rect x={200} y={1258} width={110} height={14} fill="#F2F2F2" />
    <rect x={560} y={1236} width={44} height={54} rx={8} fill="#C7392E" />
  </g>
);

// Входящий звонок: телефон на столе сверху
export const CallPhone: React.FC<{ lf: number; answered?: number }> = ({ lf, answered = 0 }) => {
  const buzz = answered > 0.5 ? 0 : Math.sin(lf * 2.1) * 6 * (Math.floor(lf / 12) % 2 === 0 ? 1 : 0.2);
  return (
    <g>
      <rect width={1080} height={1920} fill="#8C6A4A" />
      {new Array(9).fill(0).map((_, i) => (
        <rect key={i} y={i * 230 + 40} width={1080} height={6} fill="#6E5034" opacity={0.5} />
      ))}
      {/* клавиатура и кружка по краям */}
      <rect x={-80} y={1500} width={620} height={240} rx={20} fill="#2E3138" />
      {new Array(4).fill(0).map((_, r) =>
        new Array(9).fill(0).map((_, c) => <rect key={`${r}${c}`} x={-60 + c * 62} y={1520 + r * 54} width={52} height={44} rx={8} fill="#454A54" />),
      )}
      <circle cx={930} cy={400} r={120} fill="#C7392E" />
      <circle cx={930} cy={400} r={92} fill="#5A3A22" />
      <g transform={`translate(${540 + buzz} 900) rotate(${-6 + buzz * 0.4})`}>
        <rect x={-235} y={-450} width={470} height={900} rx={60} fill="#000" opacity={0.35} filter="url(#blur8)" transform="translate(18 24)" />
        <rect x={-235} y={-450} width={470} height={900} rx={60} fill={K.phone} />
        <rect x={-210} y={-425} width={420} height={850} rx={44} fill="#1F3550" />
        <circle cx={0} cy={-170} r={90} fill="#7A2E3A" />
        <text x={0} y={-140} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={86} fill="#FFFFFF">
          Г
        </text>
        <text x={0} y={-20} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={52} fill="#FFFFFF">
          Гүлнар апай
        </text>
        <text x={0} y={36} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={34} fill="#BFD3E8">
          Мектеп · қоңырау
        </text>
        {answered < 0.5 ? (
          <g>
            <circle cx={-110} cy={300} r={58} fill="#E2483D" />
            <rect x={-140} y={292} width={60} height={16} rx={8} fill="#FFFFFF" />
            <circle cx={110} cy={300} r={58 + Math.max(0, Math.sin(lf * 0.4)) * 8} fill="#2FB36B" />
            <path d="M 88 284 Q 110 262 132 284 L 126 300 Q 110 290 94 300 Z" fill="#FFFFFF" />
          </g>
        ) : (
          <text x={0} y={310} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={44} fill="#2FB36B">
            00:0{Math.min(9, Math.floor(lf / 30))}
          </text>
        )}
      </g>
    </g>
  );
};

// ---------- школьная выставка ----------
export const ExhibitWall: React.FC = () => (
  <g>
    <rect width={1080} height={FLOOR} fill="url(#wallG)" />
    <rect y={0} width={1080} height={230} fill="#B99A66" />
    <rect y={230} width={1080} height={18} fill="#A88A58" />
    <ellipse cx={540} cy={210} rx={90} ry={16} fill="#FFF3D6" opacity={0.9} />
    {/* растяжка */}
    <g transform="translate(540 380)">
      <path d="M -380 -50 L 380 -50 L 360 0 L 380 50 L -380 50 L -360 0 Z" fill="#2F6B66" />
      <text y={16} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={42} fill="#FFF8EC" letterSpacing={3}>
        СУРЕТ КӨРМЕСІ
      </text>
    </g>
    {/* чужие рисунки на стене */}
    {[
      [120, 560, -4, "#FFE9A8"],
      [330, 640, 3, "#D9F0FF"],
      [960, 600, 5, "#FFE0E6"],
    ].map(([x, y, r, c], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <rect x={-90} y={-115} width={180} height={230} fill={c as string} stroke="#E0D4BC" strokeWidth={3} />
        {i === 0 ? (
          <g>
            <path d="M -50 40 L -50 -10 L 0 -50 L 50 -10 L 50 40 Z" fill="none" stroke="#C0392B" strokeWidth={7} />
            <circle cx={50} cy={-75} r={18} fill="#FFD84A" />
          </g>
        ) : i === 1 ? (
          <g>
            <path d="M 0 -80 L 30 20 L -30 20 Z" fill="none" stroke="#2E6FB0" strokeWidth={7} />
            <path d="M -16 30 L 0 70 L 16 30" fill="none" stroke="#E08A1E" strokeWidth={7} />
          </g>
        ) : (
          <g>
            <circle cx={0} cy={-10} r={44} fill="none" stroke="#3E9A4E" strokeWidth={7} />
            <path d="M -60 70 L 60 70" stroke="#3E9A4E" strokeWidth={7} />
          </g>
        )}
        <circle cx={0} cy={-108} r={7} fill="#C0392B" />
      </g>
    ))}
    <rect y={1130} width={1080} height={FLOOR - 1130} fill="url(#tealG)" />
    <rect y={1118} width={1080} height={16} fill={P.rail} />
    <rect y={FLOOR - 24} width={1080} height={24} fill="#16302E" />
    <rect y={FLOOR} width={1080} height={1920 - FLOOR} fill="url(#floorG)" />
    {[0, 1, 2, 3, 4].map((k) => (
      <rect key={k} y={FLOOR + 24 + k * k * 15 + k * 30} width={1080} height={2} fill="#3A200C" opacity={0.35} />
    ))}
  </g>
);
// Мольберт с рисунком Айбара
export const Easel: React.FC<{ x: number; s?: number; fixed?: number }> = ({ x, s = 1, fixed = 0 }) => (
  <g transform={`translate(${x} ${FLOOR}) scale(${s})`}>
    <path d="M -150 0 L -40 -760 L -20 -760 L -120 0 Z" fill={P.woodDk} />
    <path d="M 150 0 L 40 -760 L 20 -760 L 120 0 Z" fill={P.woodDk} />
    <path d="M -8 0 L -8 -800 L 8 -800 L 8 0 Z" fill={P.wood} />
    <rect x={-190} y={-330} width={380} height={22} rx={4} fill={P.wood} />
    <g transform="translate(0 -560) scale(0.38)">
      <KidDrawing award fixed={fixed} />
    </g>
  </g>
);

// ---------- полка с одиноким телефоном (крупно) ----------
export const ShelfPhone: React.FC<{ lit: number; count: number }> = ({ lit, count }) => (
  <g>
    <path d="M -40 1160 L 1120 1160 L 1180 1330 L -100 1330 Z" fill="#9C6438" />
    <rect x={-100} y={1330} width={1300} height={70} fill="#7B4B28" />
    {/* телефон лежит экраном вверх, в перспективе */}
    <g transform="translate(560 1235)">
      <path d="M -170 -60 L 150 -66 L 196 52 L -200 60 Z" fill="#000" opacity={0.35} filter="url(#blur8)" transform="translate(10 14)" />
      <path d="M -170 -60 L 150 -66 L 196 52 L -200 60 Z" fill={K.phone} />
      <path d="M -150 -50 L 136 -56 L 176 44 L -178 50 Z" fill="#0E1018" />
      <path d="M -150 -50 L 136 -56 L 176 44 L -178 50 Z" fill={K.screen} opacity={0.85 * lit} />
      {lit > 0.05 ? (
        <g opacity={lit}>
          <path d="M -120 -40 L 110 -44 L 122 -14 L -128 -10 Z" fill="#FFFFFF" opacity={0.9} />
          <text x={-6} y={-20} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={20} fill="#1F3550" transform="skewX(18)">
            {count} жаңа хабарлама
          </text>
        </g>
      ) : null}
    </g>
    {/* растение на полке */}
    <path d="M 860 1180 L 880 1070 L 980 1070 L 1000 1180 Z" fill="#B0412E" />
    <ellipse cx={930} cy={1050} rx={90} ry={60} fill="#3E8A4E" />
    <ellipse cx={880} cy={1010} rx={50} ry={40} fill="#4F9B5E" />
  </g>
);

// Цветные карандаши на столе
export const Crayons: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {["#D2412F", "#2E6FB0", "#3E9A4E", "#E08A1E", "#8A4FB0", "#FFD84A"].map((c, i) => (
      <g key={i} transform={`translate(${i * 26 - 70} ${(i % 2) * 6}) rotate(${-14 + i * 7})`}>
        <rect x={-6} y={-40} width={12} height={64} rx={3} fill={c} />
        <path d="M -6 -40 L 6 -40 L 0 -54 Z" fill={c} />
      </g>
    ))}
  </g>
);

// Низкий журнальный столик
export const CoffeeTable: React.FC<{ x: number; w?: number }> = ({ x, w = 360 }) => (
  <g>
    <rect x={x - w / 2} y={FL - 150} width={w} height={22} rx={6} fill="#9C6438" />
    <rect x={x - w / 2 + 20} y={FL - 128} width={16} height={128} fill="#7B4B28" />
    <rect x={x + w / 2 - 36} y={FL - 128} width={16} height={128} fill="#7B4B28" />
  </g>
);
