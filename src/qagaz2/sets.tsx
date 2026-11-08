import React from "react";
import { random } from "remotion";
import { P } from "./art";

export const FLOOR = 1450;
const TILE = 1100;

// ---------- коридор сбоку: стена с дверьми, свет из окон за камерой, пол ----------
const Door: React.FC<{ x: number; num: number; open: number }> = ({ x, num, open }) => {
  const w = 240;
  const h = 600;
  const top = FLOOR - h;
  const leafW = w * (1 - open * 0.82);
  return (
    <g>
      <rect x={x - 22} y={top - 22} width={w + 44} height={h + 22} fill={P.woodDk} />
      <rect x={x} y={top} width={w} height={h} fill="#2A1A10" />
      {open > 0 ? (
        <>
          <rect x={x} y={top} width={w} height={h} fill="#F6D9A0" opacity={0.85 * open} />
          <rect x={x + w * 0.55} y={top + 60} width={w * 0.4} height={h * 0.45} fill="#FFF4D8" opacity={0.6 * open} />
        </>
      ) : null}
      <g transform={`translate(${x} ${top})`}>
        <rect width={leafW} height={h} fill={P.wood} />
        <rect x={leafW * 0.12} y={40} width={leafW * 0.76} height={220} rx={6} fill={P.woodHi} opacity={0.5} />
        <rect x={leafW * 0.12} y={300} width={leafW * 0.76} height={260} rx={6} fill={P.woodHi} opacity={0.5} />
        <rect x={leafW * 0.12} y={40} width={leafW * 0.76} height={220} rx={6} fill="none" stroke={P.woodDk} strokeWidth={4} />
        <rect x={leafW * 0.12} y={300} width={leafW * 0.76} height={260} rx={6} fill="none" stroke={P.woodDk} strokeWidth={4} />
        <circle cx={leafW - 26} cy={330} r={11} fill={P.brass} />
        <rect x={leafW / 2 - 30} y={12} width={60} height={22} rx={3} fill={P.brass} opacity={open > 0.5 ? 0 : 1} />
        <text x={leafW / 2} y={29} textAnchor="middle" fontSize={18} fontWeight={700} fill="#4A2E10" fontFamily="sans-serif" opacity={open > 0.5 ? 0 : 1}>
          {num}
        </text>
      </g>
    </g>
  );
};

const Portrait: React.FC<{ x: number; y: number; seed: number }> = ({ x, y, seed }) => (
  <g>
    <rect x={x} y={y} width={150} height={190} fill="#3A2412" />
    <rect x={x + 14} y={y + 14} width={122} height={162} fill={["#6E7C6A", "#7A6A58", "#5E6E7E"][seed % 3]} />
    <ellipse cx={x + 75} cy={y + 78} rx={26} ry={32} fill="#2B2620" opacity={0.6} />
    <path d={`M ${x + 34} ${y + 176} Q ${x + 75} ${y + 100} ${x + 116} ${y + 176} Z`} fill="#2B2620" opacity={0.6} />
  </g>
);

export const CorridorSide: React.FC<{ sx: number; doorOpen?: (idx: number) => number; light?: number }> = ({ sx, doorOpen, light = 1 }) => {
  const base = Math.floor(sx / TILE);
  const off = sx - base * TILE;
  return (
    <g>
      <rect width={1080} height={FLOOR} fill="url(#wallG)" />
      <rect y={0} width={1080} height={230} fill="#B99A66" />
      <rect y={230} width={1080} height={18} fill="#A88A58" />
      {[-1, 0, 1, 2].map((i) => {
        const idx = base + i;
        const tx = i * TILE - off;
        return (
          <g key={idx} transform={`translate(${tx} 0)`}>
            {/* лампа под потолком */}
            <ellipse cx={560} cy={210} rx={90} ry={16} fill="#FFF3D6" opacity={0.9} />
            <ellipse cx={560} cy={232} rx={260} ry={60} fill={P.sunHi} opacity={0.12} filter="url(#blur20)" />
            <Portrait x={790} y={560} seed={idx + 3} />
            <Portrait x={60} y={560} seed={idx + 7} />
          </g>
        );
      })}
      {/* бирюзовая панель */}
      <rect y={1130} width={1080} height={FLOOR - 1130} fill="url(#tealG)" />
      <rect y={1118} width={1080} height={16} fill={P.rail} />
      <rect y={FLOOR - 24} width={1080} height={24} fill="#16302E" />
      {/* двери поверх панели */}
      {[-1, 0, 1, 2].map((i) => {
        const idx = base + i;
        const tx = i * TILE - off;
        return (
          <g key={`d${idx}`} transform={`translate(${tx} 0)`}>
            <Door x={330} num={30 + idx} open={doorOpen ? doorOpen(idx) : 0} />
          </g>
        );
      })}
      {/* пол */}
      <rect y={FLOOR} width={1080} height={1920 - FLOOR} fill="url(#floorG)" />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const y = FLOOR + 24 + k * k * 15 + k * 30;
        return <rect key={k} y={y} width={1080} height={2} fill="#3A200C" opacity={0.35} />;
      })}
      {/* отражения дверей в лакированном полу */}
      {[-1, 0, 1, 2].map((i) => {
        const tx = i * TILE - off;
        return <rect key={`r${i}`} x={tx + 310} y={FLOOR} width={280} height={260} fill={P.woodDk} opacity={0.35} />;
      })}
      {/* окна за камерой: пятна солнца на стене и полосы на полу */}
      {[-1, 0, 1, 2].map((i) => {
        const tx = i * TILE - off;
        return [0, 590].map((dx) => {
          const x0 = tx + dx + 10;
          return (
            <g key={`s${i}-${dx}`} opacity={light}>
              <path d={`M ${x0} ${FLOOR} L ${x0} 420 Q ${x0 + 120} 300 ${x0 + 240} 420 L ${x0 + 240} ${FLOOR} Z`} fill={P.sunHi} opacity={0.32} style={{ mixBlendMode: "screen" }} />
              <path d={`M ${x0} ${FLOOR} L ${x0 + 240} ${FLOOR} L ${x0 + 380} 1920 L ${x0 + 100} 1920 Z`} fill={P.sun} opacity={0.42} style={{ mixBlendMode: "screen" }} />
            </g>
          );
        });
      })}
    </g>
  );
};

// ---------- коридор в перспективе (вид вдоль) ----------
export const CorridorPersp: React.FC<{ vx?: number; vy?: number; F?: number; camZ?: number; papersOnFloor?: number; glow?: number }> = ({
  vx = 540,
  vy = 800,
  F = 720,
  camZ = 0,
  papersOnFloor = 0,
  glow = 1,
}) => {
  const XL = -1.15;
  const XR = 1.15;
  const YC = -1.45;
  const YF = 1.55;
  const Z0 = 0.55;
  const Z1 = 16;
  const pr = (X: number, Y: number, z: number): [number, number] => {
    const d = Math.max(0.05, z - camZ);
    return [vx + (X * F) / d, vy + (Y * F) / d];
  };
  const poly = (pts: [number, number, number][]) =>
    pts
      .map(([X, Y, z]) => pr(X, Y, z))
      .map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`)
      .join(" ");
  const winZ = [1.1, 2.3, 3.5, 4.7, 5.9, 7.1, 8.3, 9.5, 10.7, 11.9, 13.1, 14.3];
  const doorZ = [1.7, 3.8, 5.9, 8.0, 10.1, 12.2, 14.3];
  const [bx0, by0] = pr(XL, YC, Z1);
  const [bx1, by1] = pr(XR, YF, Z1);
  return (
    <g>
      <rect width={1080} height={1920} fill="#2A1C10" />
      {/* потолок, пол, стены */}
      <polygon points={poly([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, Z1], [XL, YC, Z1]])} fill="#B89A68" />
      <polygon points={poly([[XL, YF, Z0], [XR, YF, Z0], [XR, YF, Z1], [XL, YF, Z1]])} fill="url(#floorG)" />
      <polygon points={poly([[XL, YC, Z0], [XL, YF, Z0], [XL, YF, Z1], [XL, YC, Z1]])} fill={P.wall} />
      <polygon points={poly([[XR, YC, Z0], [XR, YF, Z0], [XR, YF, Z1], [XR, YC, Z1]])} fill={P.wallLo} />
      <polygon points={poly([[XL, 0.72, Z0], [XL, YF, Z0], [XL, YF, Z1], [XL, 0.72, Z1]])} fill={P.teal} />
      <polygon points={poly([[XR, 0.72, Z0], [XR, YF, Z0], [XR, YF, Z1], [XR, 0.72, Z1]])} fill={P.tealDk} />
      <polygon points={poly([[XL, 0.68, Z0], [XL, 0.74, Z0], [XL, 0.74, Z1], [XL, 0.68, Z1]])} fill={P.rail} />
      <polygon points={poly([[XR, 0.68, Z0], [XR, 0.74, Z0], [XR, 0.74, Z1], [XR, 0.68, Z1]])} fill={P.rail} />
      {/* дальняя стена и окно в конце */}
      <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill={P.wallHi} />
      <rect x={bx0 + (bx1 - bx0) * 0.3} y={by0 + (by1 - by0) * 0.15} width={(bx1 - bx0) * 0.4} height={(by1 - by0) * 0.55} fill={P.sunHi} />
      <ellipse cx={(bx0 + bx1) / 2} cy={by0 + (by1 - by0) * 0.4} rx={160} ry={200} fill={P.sunHi} opacity={0.5 * glow} filter="url(#blur20)" />
      {/* двери справа */}
      {doorZ.map((z, i) => (
        <g key={`d${i}`}>
          <polygon points={poly([[XR, -0.32, z - 0.06], [XR, YF, z - 0.06], [XR, YF, z + 0.51], [XR, -0.32, z + 0.51]])} fill={P.woodDk} />
          <polygon points={poly([[XR, -0.25, z], [XR, YF, z], [XR, YF, z + 0.45], [XR, -0.25, z + 0.45]])} fill={P.wood} />
          <polygon points={poly([[XR, -1.0, z + 0.85], [XR, -0.55, z + 0.85], [XR, -0.55, z + 1.15], [XR, -1.0, z + 1.15]])} fill="#3A2412" />
        </g>
      ))}
      {/* лампы */}
      {[1.6, 3.6, 5.6, 7.6, 9.6, 11.6, 13.6].map((z, i) => {
        const [a, b] = pr(0, YC + 0.02, z);
        const w = (0.25 * F) / Math.max(0.05, z - camZ);
        return <ellipse key={`l${i}`} cx={a} cy={b} rx={w} ry={w * 0.18} fill="#FFF3D6" />;
      })}
      {/* окна слева и солнечные полосы на полу */}
      {winZ.map((z, i) => (
        <g key={`w${i}`}>
          <polygon points={poly([[XL, -1.05, z - 0.04], [XL, 0.6, z - 0.04], [XL, 0.6, z + 0.6], [XL, -1.05, z + 0.6]])} fill="#E8D5A8" />
          <polygon points={poly([[XL, -1.0, z], [XL, 0.55, z], [XL, 0.55, z + 0.55], [XL, -1.0, z + 0.55]])} fill={P.sunHi} />
          <polygon points={poly([[XL, 0.0, z], [XL, 0.03, z], [XL, 0.03, z + 0.55], [XL, 0.0, z + 0.55]])} fill="#E2C48C" />
          <polygon
            points={poly([[XL, YF, z + 0.05], [XL, YF, z + 0.6], [XR, YF, z - 0.45], [XR, YF, z - 1.0]])}
            fill={P.sun}
            opacity={0.5}
            style={{ mixBlendMode: "screen" }}
          />
          <polygon
            points={poly([[XL, -1.0, z], [XL, 0.55, z + 0.55], [XR * 0.2, YF, z - 0.2], [XR * 0.2, YF, z - 0.75]])}
            fill="url(#sunBeam)"
            opacity={0.13}
          />
        </g>
      ))}
      {/* листы на полу (финал) */}
      {papersOnFloor > 0
        ? [
            [-0.4, 1.3, 0.2],
            [0.35, 1.65, -0.3],
            [-0.05, 2.3, 0.6],
            [0.55, 2.9, 0.1],
          ]
            .slice(0, papersOnFloor)
            .map(([X, z, r], i) => {
              const c = Math.cos(r);
              const s = Math.sin(r);
              const pts: [number, number, number][] = [
                [X - 0.14 * c + 0.1 * s, YF - 0.001, z - 0.1 * c - 0.14 * s],
                [X + 0.14 * c + 0.1 * s, YF - 0.001, z - 0.1 * c + 0.14 * s],
                [X + 0.14 * c - 0.1 * s, YF - 0.001, z + 0.1 * c + 0.14 * s],
                [X - 0.14 * c - 0.1 * s, YF - 0.001, z + 0.1 * c - 0.14 * s],
              ];
              return (
                <g key={`p${i}`}>
                  <polygon points={poly(pts)} fill="#000" opacity={0.25} transform="translate(6 8)" />
                  <polygon points={poly(pts)} fill={P.paper} stroke={P.paperDk} strokeWidth={2} />
                </g>
              );
            })
        : null}
    </g>
  );
};

// ---------- пол сверху ----------
export const FloorTop: React.FC<{ papers: { x: number; y: number; r: number; s?: number }[] }> = ({ papers }) => (
  <g>
    <rect width={1080} height={1920} fill={P.floor} />
    {new Array(9).fill(0).map((_, i) => (
      <rect key={i} x={i * 130 - 40} y={0} width={130} height={1920} fill={i % 2 ? P.floorHi : P.floor} opacity={0.35 + random(`pl${i}`) * 0.25} />
    ))}
    {new Array(9).fill(0).map((_, i) => (
      <rect key={`l${i}`} x={i * 130 - 40} y={0} width={3} height={1920} fill="#3A200C" opacity={0.5} />
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={`s${i}`} x={-400} y={420 + i * 560} width={2000} height={190} fill={P.sun} opacity={0.4} transform={`rotate(-24 540 ${420 + i * 560})`} style={{ mixBlendMode: "screen" }} />
    ))}
    {papers.map((p, i) => (
      <g key={`p${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s ?? 1})`}>
        <rect x={-58} y={-78} width={116} height={156} fill="#000" opacity={0.22} transform="translate(8 10)" />
        <rect x={-58} y={-78} width={116} height={156} fill={P.paper} stroke={P.paperDk} strokeWidth={2} />
        {new Array(6).fill(0).map((_, k) => (
          <rect key={k} x={-44} y={-60 + k * 20} width={88 - (k % 3) * 14} height={3} fill="#9DB0C8" opacity={0.6} />
        ))}
      </g>
    ))}
  </g>
);

// Фигура сверху (сидит на полу)
export const TopFigure: React.FC<{ x: number; y: number; s: number; rot: number; kind: "young" | "boy" }> = ({ x, y, s, rot, kind }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={120} ry={80} fill="#000" opacity={0.25} filter="url(#blur8)" />
    {/* ноги */}
    <rect x={-60} y={20} width={44} height={190} rx={20} fill={kind === "boy" ? "#5E6676" : "#3D4757"} transform="rotate(-12 -38 20)" />
    <rect x={16} y={20} width={44} height={190} rx={20} fill={kind === "boy" ? "#5E6676" : "#3D4757"} transform="rotate(14 38 20)" />
    {/* плечи */}
    <ellipse cx={0} cy={0} rx={92} ry={52} fill={kind === "boy" ? "#22325A" : "#A9CBEA"} />
    {kind === "boy" ? <rect x={-50} y={-70} width={100} height={60} rx={18} fill="#C7392E" /> : null}
    <rect x={-112} y={-14} width={40} height={110} rx={18} fill={kind === "boy" ? "#22325A" : "#A9CBEA"} transform="rotate(20 -92 -14)" />
    <rect x={72} y={-14} width={40} height={110} rx={18} fill={kind === "boy" ? "#22325A" : "#A9CBEA"} transform="rotate(-20 92 -14)" />
    {/* голова (макушка) */}
    <circle cx={0} cy={-6} r={40} fill="#17161B" />
  </g>
);

// ---------- класс: вид от доски на ряды учеников ----------
export const ClassroomBG: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill={P.wallHi} />
    <rect y={0} width={1080} height={180} fill="#C9AE7E" />
    {/* окна слева */}
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={40 + i * 300} y={300} width={230} height={520} fill="#E3CFA0" />
        <rect x={56 + i * 300} y={316} width={198} height={488} fill={P.sunHi} />
        <rect x={152 + i * 300} y={316} width={6} height={488} fill="#E3CFA0" />
        <rect x={56 + i * 300} y={540} width={198} height={6} fill="#E3CFA0" />
      </g>
    ))}
    <ellipse cx={300} cy={560} rx={420} ry={340} fill={P.sunHi} opacity={0.35} filter="url(#blur20)" />
    {/* карта и часы */}
    <rect x={720} y={330} width={260} height={180} fill="#3A2412" />
    <rect x={732} y={342} width={236} height={156} fill="#9DBBAA" />
    <path d="M 760 420 Q 820 370 880 410 T 950 400 L 950 470 L 760 470 Z" fill="#D9C48C" opacity={0.8} />
    <circle cx={850} cy={600} r={46} fill="#FFFFFF" stroke="#3A2412" strokeWidth={6} />
    <rect y={900} width={1080} height={180} fill="url(#tealG)" />
    <rect y={890} width={1080} height={12} fill={P.rail} />
    <rect y={1080} width={1080} height={840} fill="url(#floorG)" />
  </g>
);

export const ClockHands: React.FC<{ t: number }> = ({ t }) => (
  <g transform="translate(850 600)">
    <rect x={-3} y={-34} width={6} height={36} fill="#2B1A0E" transform={`rotate(${t * 36})`} />
    <rect x={-3} y={-24} width={6} height={26} fill="#2B1A0E" transform={`rotate(${120 + t * 3})`} />
    <circle r={5} fill="#2B1A0E" />
  </g>
);

export const Desk: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 0 L 150 0 L 170 40 L -170 40 Z" fill={P.woodHi} />
    <rect x={-170} y={40} width={340} height={150} fill={P.wood} />
    <rect x={-170} y={40} width={340} height={14} fill={P.woodDk} />
    <rect x={-120} y={-14} width={90} height={14} rx={2} fill={P.paper} transform="rotate(-6 -75 -7)" />
  </g>
);

// ---------- яма из бумаг (вид сверху вниз) ----------
export const Pit: React.FC<{ cx: number; cy: number; rings?: number }> = ({ cx, cy, rings = 22 }) => {
  const cols = [P.paper, "#EDE6D6", "#7FA7C9", P.paper, "#E2C26A", P.paper, "#8BB68A", "#E7E0D0", P.paper, "#C9B8A0"];
  const out: React.ReactNode[] = [];
  const R = (i: number) => {
    const k = Math.pow(0.86, i);
    return { w: 1500 * k, h: 2400 * k };
  };
  for (let i = 0; i < rings; i++) {
    const a = R(i);
    const b = R(i + 1);
    const shade = 1 - i / (rings + 4);
    const c = cols[Math.floor(random(`pit${i}`) * cols.length)];
    const ax0 = cx - a.w / 2;
    const ax1 = cx + a.w / 2;
    const ay0 = cy - a.h / 2;
    const ay1 = cy + a.h / 2;
    const bx0 = cx - b.w / 2;
    const bx1 = cx + b.w / 2;
    const by0 = cy - b.h / 2;
    const by1 = cy + b.h / 2;
    out.push(
      <g key={i} opacity={1}>
        <polygon points={`${ax0},${ay0} ${ax1},${ay0} ${bx1},${by0} ${bx0},${by0}`} fill={c} />
        <polygon points={`${ax1},${ay0} ${ax1},${ay1} ${bx1},${by1} ${bx1},${by0}`} fill={c} />
        <polygon points={`${ax0},${ay1} ${ax1},${ay1} ${bx1},${by1} ${bx0},${by1}`} fill={c} />
        <polygon points={`${ax0},${ay0} ${ax0},${ay1} ${bx0},${by1} ${bx0},${by0}`} fill={c} />
        {/* затенение глубины: стены темнеют книзу */}
        <polygon points={`${ax0},${ay0} ${ax1},${ay0} ${bx1},${by0} ${bx0},${by0}`} fill="#1A0F06" opacity={0.25 + (1 - shade) * 0.55} />
        <polygon points={`${ax1},${ay0} ${ax1},${ay1} ${bx1},${by1} ${bx1},${by0}`} fill="#1A0F06" opacity={0.45 + (1 - shade) * 0.5} />
        <polygon points={`${ax0},${ay1} ${ax1},${ay1} ${bx1},${by1} ${bx0},${by1}`} fill="#1A0F06" opacity={0.3 + (1 - shade) * 0.55} />
        <polygon points={`${ax0},${ay0} ${ax0},${ay1} ${bx0},${by1} ${bx0},${by0}`} fill="#1A0F06" opacity={0.1 + (1 - shade) * 0.55} />
        <rect x={ax0} y={ay0} width={a.w} height={a.h} fill="none" stroke="#3A2A18" strokeOpacity={0.35} strokeWidth={Math.max(0.5, 3 * Math.pow(0.86, i))} />
      </g>,
    );
  }
  const b = R(rings);
  return (
    <g>
      <rect width={1080} height={1920} fill="#0E0905" />
      {out}
      <rect x={cx - b.w / 2} y={cy - b.h / 2} width={b.w} height={b.h} fill="#2A1C10" />
    </g>
  );
};

// ---------- крупно: звонок на стене ----------
export const Bell: React.FC<{ t: number; ring: number }> = ({ t, ring }) => {
  const shake = Math.sin(t * 90) * 4 * ring;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#tealG)" />
      <rect y={0} width={1080} height={520} fill={P.wall} />
      <rect y={508} width={1080} height={16} fill={P.rail} />
      <ellipse cx={720} cy={300} rx={500} ry={420} fill={P.sunHi} opacity={0.3} filter="url(#blur20)" />
      {/* звуковые волны */}
      {[0, 1, 2, 3].map((i) => {
        const ph = ((t * 2.2 + i * 0.25) % 1 + 1) % 1;
        return (
          <circle
            key={i}
            cx={540}
            cy={940}
            r={300 + ph * 420}
            fill="none"
            stroke={P.sunHi}
            strokeWidth={10 * (1 - ph)}
            opacity={0.55 * (1 - ph) * ring}
          />
        );
      })}
      <g transform={`translate(${540 + shake} 940)`}>
        <rect x={-40} y={-360} width={80} height={120} rx={10} fill="#4A4A4A" />
        <rect x={-120} y={260} width={240} height={70} rx={14} fill="#3E3E40" />
        <circle r={300} fill="#8E6A2E" />
        <circle r={286} fill="url(#bellG)" />
        <ellipse cx={-90} cy={-110} rx={110} ry={70} fill="#FFF3D0" opacity={0.45} />
        <circle r={40} fill="#5A4220" />
        <circle r={20} fill="#2A1E10" />
        <g transform={`rotate(${Math.sin(t * 90) * 18 * ring} 0 230)`}>
          <rect x={-12} y={230} width={24} height={150} rx={8} fill="#2E2E30" />
          <circle cx={0} cy={380} r={34} fill="#3A3A3E" />
        </g>
      </g>
      <defs>
        <radialGradient id="bellG" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#F7D58A" />
          <stop offset="0.5" stopColor="#C9973F" />
          <stop offset="1" stopColor="#6E4F1E" />
        </radialGradient>
      </defs>
    </g>
  );
};
