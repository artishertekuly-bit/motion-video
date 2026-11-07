import React from "react";
import { C, MONO } from "./theme";
import { lerp, mixHex, p, rgba } from "./ui";

// План квартиры (вид сверху). Локальные координаты 0…800, на экране — с (140, 330).
export const PX = 140;
export const PY = 330;
export const toAbs = (x: number, y: number): [number, number] => [PX + x, PY + y];
export const YOU: [number, number] = [215, 290];
export const ENTRANCE: [number, number] = [345, 760];
export const MOM_PATH: [number, number][] = [
  [345, 830],
  [345, 740],
  [345, 480],
  [195, 425],
  [195, 340],
  [258, 292],
];

const WALLS: [number, number, number, number][] = [
  [40, 40, 760, 40],
  [760, 40, 760, 760],
  [40, 760, 300, 760],
  [390, 760, 760, 760],
  [40, 40, 40, 760],
  [40, 380, 150, 380],
  [240, 380, 390, 380],
  [390, 40, 390, 430],
  [390, 430, 400, 430],
  [460, 430, 760, 430],
  [470, 430, 470, 520],
  [470, 600, 470, 760],
  [40, 560, 120, 560],
  [200, 560, 240, 560],
  [240, 560, 240, 760],
];

const ROOMS = [
  { id: "k", d: "M40 40 H390 V380 H40 Z", label: "АСҮЙ", lx: 215, ly: 70 },
  { id: "l", d: "M390 40 H760 V430 H390 Z", label: "ҚОНАҚ БӨЛМЕ", lx: 575, ly: 250 },
  { id: "b", d: "M470 430 H760 V760 H470 Z", label: "ЖАТЫН БӨЛМЕ", lx: 615, ly: 470 },
  { id: "w", d: "M40 560 H240 V760 H40 Z", label: "ЖУЫНАТЫН", lx: 140, ly: 600 },
  { id: "h", d: "M40 380 H390 V430 H470 V760 H240 V560 H40 Z", label: "ДӘЛІЗ", lx: 330, ly: 520 },
];

/** Точка на ломаной по доле пути t (0…1) */
export const along = (pts: [number, number][], t: number): [number, number] => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const k = d / seg[i];
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

export const FloorPlan: React.FC<{
  f: number;
  drawAt: number; // кадр начала прорисовки стен
  kitchen: number; // 0…1 свет на кухне
  warm: number; // 0…1 свет во всей квартире (тёплый)
  opacity?: number;
  children?: React.ReactNode; // доп. слои в локальных координатах
}> = ({ f, drawAt, kitchen, warm, opacity = 1, children }) => {
  const draw = p(f, drawAt, 20);
  const wall = mixHex(C.cyan, C.warm, warm);
  const fur = rgba(wall, 0.32);
  return (
    <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: "absolute", left: PX, top: PY, opacity, overflow: "visible" }}>
      <defs>
        <radialGradient id="kglow" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor={C.amber} stopOpacity={0.32} />
          <stop offset="1" stopColor={C.amber} stopOpacity={0.06} />
        </radialGradient>
      </defs>
      {ROOMS.map((r) => (
        <path
          key={r.id}
          d={r.d}
          fill={r.id === "k" ? "url(#kglow)" : rgba(C.warm, 0.13 * warm)}
          opacity={r.id === "k" ? Math.max(kitchen, warm) : 1}
        />
      ))}
      {ROOMS.map((r) => (
        <path key={`w${r.id}`} d={r.d} fill={rgba(C.warm, 0.12 * warm)} opacity={r.id === "k" ? warm : 0} />
      ))}
      {/* мебель */}
      <g stroke={fur} strokeWidth={2.5} fill="none" opacity={draw}>
        <rect x={52} y={52} width={326} height={42} rx={4} />
        <circle cx={215} cy={215} r={56} />
        <rect x={200} y={128} width={30} height={30} rx={6} />
        <rect x={200} y={272} width={30} height={30} rx={6} />
        <rect x={118} y={200} width={30} height={30} rx={6} />
        <rect x={282} y={200} width={30} height={30} rx={6} />
        <rect x={420} y={330} width={300} height={70} rx={14} />
        <line x1={440} y1={62} x2={710} y2={62} strokeWidth={6} />
        <rect x={560} y={520} width={180} height={220} rx={10} />
        <rect x={575} y={532} width={70} height={36} rx={8} />
        <rect x={655} y={532} width={70} height={36} rx={8} />
        <rect x={56} y={640} width={168} height={104} rx={26} />
        <path d={`M300 760 A90 90 0 0 1 390 670`} strokeDasharray="5 6" />
        <path d={`M150 380 A90 90 0 0 0 240 470`} strokeDasharray="5 6" opacity={0.6} />
      </g>
      <g stroke={wall} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${rgba(wall, 0.7)})` }}>
        {WALLS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
      </g>
      {ROOMS.map((r) => (
        <text
          key={`t${r.id}`}
          x={r.lx}
          y={r.ly}
          textAnchor="middle"
          fontFamily={MONO}
          fontWeight={700}
          fontSize={18}
          letterSpacing="0.12em"
          fill={rgba(r.id === "k" && kitchen > 0.5 ? C.amber : wall, 0.7)}
          opacity={p(f, drawAt + 12, 10)}
        >
          {r.label}
        </text>
      ))}
      {children}
    </svg>
  );
};

/** Пульсирующая точка-человек на плане */
export const Dot: React.FC<{ f: number; x: number; y: number; color: string; at: number; label?: string; labelDy?: number }> = ({ f, x, y, color, at, label, labelDy = 46 }) => {
  if (f < at) return null;
  const k = p(f, at, 8);
  const ph = ((f - at) % 36) / 36;
  return (
    <g opacity={k}>
      <circle cx={x} cy={y} r={16 + ph * 34} fill="none" stroke={color} strokeWidth={3} opacity={1 - ph} />
      <circle cx={x} cy={y} r={15 * k} fill={color} style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
      {label && (
        <text x={x} y={y + labelDy} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill={color} letterSpacing="0.1em">
          {label}
        </text>
      )}
    </g>
  );
};
