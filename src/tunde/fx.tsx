import React from "react";
import { AbsoluteFill, random } from "remotion";
import { MONO } from "../deepfake/theme";

// ---------- палитра ночи ----------
export const N = {
  sky0: "#060A16",
  sky1: "#12203C",
  moon: "#DCE6FF",
  wall: "#1A2335",
  wallDk: "#111829",
  wallHi: "#26324A",
  floor: "#151B28",
  ink: "#05070D",
  beam: "#FFF4D6",
  warm: "#FFC978",
  nv: "#9CFFB4",
  ghost: "#D8E6FF",
  red: "#FF4B4B",
};

// ---------- фильтры ----------
export const TDefs: React.FC = () => (
  <defs>
    <filter id="tn-night" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.10 0.15 0.05 0 0  0.12 0.19 0.08 0 0.01  0.19 0.30 0.28 0 0.035  0 0 0 1 0" />
    </filter>
    <filter id="tn-moon" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.16 0.22 0.06 0 0  0.18 0.27 0.10 0 0.01  0.26 0.40 0.34 0 0.04  0 0 0 1 0" />
    </filter>
    <filter id="tn-nv" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.10 0.22 0.04 0 0  0.36 0.78 0.14 0 0.05  0.10 0.22 0.04 0 0  0 0 0 1 0" />
    </filter>
    <filter id="tn-ghost" x="-40%" y="-20%" width="180%" height="140%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0.84  0 0 0 0 0.91  0 0 0 0 1  0 0 0 0.7 0" result="c" />
      <feGaussianBlur in="c" stdDeviation="12" result="g" />
      <feMerge>
        <feMergeNode in="g" />
        <feMergeNode in="c" />
      </feMerge>
    </filter>
    <filter id="tn-sil" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0.03  0 0 0 0 0.04  0 0 0 0 0.07  0 0 0 1 0" />
    </filter>
    <filter id="tn-blur3">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <filter id="tn-blur40" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <radialGradient id="tn-spot" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="tn-vig" cx="0.5" cy="0.46" r="0.72">
      <stop offset="0.5" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.78" />
    </radialGradient>
    <linearGradient id="tn-skyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={N.sky0} />
      <stop offset="1" stopColor={N.sky1} />
    </linearGradient>
  </defs>
);

// ---------- луч фонаря: всё в ночном фильтре, внутри луча — настоящие цвета ----------
export type Beam = { x: number; y: number; tx: number; ty: number; w: number; k?: number };
const cone = (b: Beam) => {
  const dx = b.tx - b.x;
  const dy = b.ty - b.y;
  const L = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / L;
  const ny = dx / L;
  return `${b.x + nx * 10},${b.y + ny * 10} ${b.tx + nx * b.w},${b.ty + ny * b.w} ${b.tx - nx * b.w},${b.ty - ny * b.w} ${b.x - nx * 10},${b.y - ny * 10}`;
};
const BeamShapes: React.FC<{ id: string; beams: Beam[]; glow: boolean }> = ({ id, beams, glow }) => (
  <>
    {beams.map((b, i) => (
      <g key={i} opacity={b.k ?? 1}>
        <defs>
          <linearGradient id={`${id}-g${i}`} gradientUnits="userSpaceOnUse" x1={b.x} y1={b.y} x2={b.tx} y2={b.ty}>
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={glow ? 0.55 : 1} />
            <stop offset="0.8" stopColor="#FFFFFF" stopOpacity={glow ? 0.22 : 0.85} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={cone(b)} fill={`url(#${id}-g${i})`} />
        <ellipse cx={b.tx} cy={b.ty} rx={b.w * 1.05} ry={b.w * 0.8} fill="url(#tn-spot)" opacity={glow ? 0.5 : 1} />
      </g>
    ))}
  </>
);

export const Lit: React.FC<{ id: string; beams: Beam[]; night?: string; children: React.ReactNode; tint?: string }> = ({
  id,
  beams,
  night = "tn-night",
  children,
  tint = N.beam,
}) => (
  <g>
    <g filter={`url(#${night})`}>{children}</g>
    {beams.length > 0 && (
      <>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#000" />
          <BeamShapes id={`${id}-mm`} beams={beams} glow={false} />
        </mask>
        <g mask={`url(#${id}-m)`}>{children}</g>
        <g style={{ mixBlendMode: "screen" }} filter="url(#tn-blur3)">
          <g fill={tint}>
            {beams.map((b, i) => (
              <g key={i}>
                <polygon points={cone(b)} fill={tint} opacity={0.1 * (b.k ?? 1)} />
              </g>
            ))}
          </g>
        </g>
        {beams.map((b, i) => (
          <circle key={`s${i}`} cx={b.x} cy={b.y} r={34} fill={tint} opacity={0.75 * (b.k ?? 1)} filter="url(#blur20)" />
        ))}
      </>
    )}
  </g>
);

// ---------- снег / пылинки ----------
export const Snow: React.FC<{ f: number; n?: number; opacity?: number; wind?: number }> = ({ f, n = 70, opacity = 0.8, wind = 0.4 }) => (
  <g opacity={opacity}>
    {new Array(n).fill(0).map((_, i) => {
      const sp = 1.2 + random(`sn${i}`) * 2.4;
      const y = (random(`sy${i}`) * 2100 + f * sp) % 2100 - 90;
      const x = (random(`sx${i}`) * 1180 + f * wind * sp + Math.sin(f * 0.04 + i) * 14) % 1180 - 50;
      const r = 1.5 + random(`sr${i}`) * 3.5;
      return <circle key={i} cx={x} cy={y} r={r} fill="#E8F0FF" opacity={0.35 + 0.5 * random(`so${i}`)} />;
    })}
  </g>
);

// ---------- запись с телефона: REC, таймкод, рамка, полосы, зерно ----------
export const Footage: React.FC<{ f: number; t: number; clock?: string; shake?: number }> = ({ f, t, clock = "00:00", shake = 0 }) => {
  const ss = Math.floor(t);
  const tc = `00:00:${String(ss).padStart(2, "0")}:${String(Math.floor((t % 1) * 30)).padStart(2, "0")}`;
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: `translate(${shake * (random(`fs${f}`) - 0.5) * 4}px, 0)` }}>
      <AbsoluteFill
        style={{
          background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 3px, rgba(0,0,0,0.22) 4px, rgba(0,0,0,0.0) 5px)",
          mixBlendMode: "multiply",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.22 }}>
        <filter id="tn-fnoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 30} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 1  0 0 0 0 0.6  0 0 0 1.2 -0.45" />
        </filter>
        <rect width={1080} height={1920} filter="url(#tn-fnoise)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 48%, transparent 50%, rgba(0,12,4,0.85) 100%)" }} />
      {/* рамка видоискателя */}
      {[
        [70, 270, 1, 1],
        [1010, 270, -1, 1],
        [70, 1580, 1, -1],
        [1010, 1580, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - (sx < 0 ? 70 : 0),
            top: y - (sy < 0 ? 70 : 0),
            width: 70,
            height: 70,
            borderLeft: sx > 0 ? "5px solid rgba(220,255,225,0.85)" : "none",
            borderRight: sx < 0 ? "5px solid rgba(220,255,225,0.85)" : "none",
            borderTop: sy > 0 ? "5px solid rgba(220,255,225,0.85)" : "none",
            borderBottom: sy < 0 ? "5px solid rgba(220,255,225,0.85)" : "none",
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 100, top: 300, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "#EFFFF2", textShadow: "0 0 10px rgba(150,255,170,0.7)" }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: N.red, opacity: blink ? 1 : 0.15, boxShadow: `0 0 16px ${N.red}` }} />
        REC
      </div>
      <div style={{ position: "absolute", right: 100, top: 302, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: "#EFFFF2", textShadow: "0 0 10px rgba(150,255,170,0.7)" }}>
        {clock}
      </div>
      <div style={{ position: "absolute", left: 100, top: 352, fontFamily: MONO, fontWeight: 500, fontSize: 26, color: "rgba(230,255,235,0.8)" }}>{tc}</div>
      <div style={{ position: "absolute", right: 100, top: 352, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(230,255,235,0.8)" }}>NIGHT ◐</div>
    </AbsoluteFill>
  );
};

// ---------- помехи: шум + разрывы строк ----------
export const Static: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="tn-static">
          <feTurbulence type="fractalNoise" baseFrequency="0.75 0.04" numOctaves={2} seed={(f * 7) % 97} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.95  0 0 0 0 0.88  0 0 0 2.2 -0.7" />
        </filter>
        <rect width={1080} height={1920} fill="#0B120D" />
        <rect width={1080} height={1920} filter="url(#tn-static)" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={0} y={random(`tear${f}${i}`) * 1920} width={1080} height={6 + random(`th${f}${i}`) * 40} fill="#E8FFF0" opacity={0.25 + 0.5 * random(`to${f}${i}`)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
