import React from "react";
import { C } from "./theme";
import { lerp, rgba } from "./ui";

// Входная дверь (вид из квартиры) + силуэт мамы с тюльпанами
export const DX = 290;
export const DY = 300;
export const DW = 500;
export const DH = 940;
export const LOCK: [number, number] = [DX + 430, DY + 420];

export const Door: React.FC<{ f: number; open: number; turn: number; leak: number; behind?: React.ReactNode }> = ({ f, open, turn, leak, behind }) => {
  const flick = 0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <>
      {/* стена */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 42%, #14161D 0%, #0C0E13 55%, #06070A 100%)",
        }}
      />
      {/* пол */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: DY + DH,
          height: 140,
          background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${rgba(C.warm, 0.32 * leak * flick)} 0%, transparent 70%), #07080B`,
        }}
      />
      {/* проём: свет из подъезда */}
      <div
        style={{
          position: "absolute",
          left: DX,
          top: DY,
          width: DW,
          height: DH,
          overflow: "hidden",
          background: `radial-gradient(ellipse 80% 70% at 55% 35%, #FFD9A8 0%, #FFB46B 35%, #C9632A 75%, #5A2410 100%)`,
          opacity: Math.min(1, open * 3),
        }}
      >
        {behind}
      </div>
      {/* наличник */}
      <div
        style={{
          position: "absolute",
          left: DX - 26,
          top: DY - 26,
          width: DW + 52,
          height: DH + 26,
          border: "26px solid #16130F",
          borderBottom: "none",
          boxSizing: "border-box",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)",
        }}
      />
      {/* полоска света под дверью и по краям */}
      <div
        style={{
          position: "absolute",
          left: DX + 6,
          top: DY + DH - 6,
          width: DW - 12,
          height: 8,
          background: rgba(C.warm, 0.9 * leak * flick),
          boxShadow: `0 0 30px ${rgba(C.warm, 0.8 * leak)}, 0 0 80px ${rgba(C.warm, 0.4 * leak)}`,
        }}
      />
      {/* полотно двери */}
      <div
        style={{
          position: "absolute",
          left: DX,
          top: DY,
          width: DW,
          height: DH,
          transformOrigin: "left center",
          transform: `perspective(1500px) rotateY(${-78 * open}deg)`,
          background: "linear-gradient(90deg, #2E2621 0%, #3A302A 50%, #2B231E 100%)",
          boxShadow: `inset 0 0 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.03)${open > 0 ? `, 30px 0 60px rgba(0,0,0,0.6)` : ""}`,
        }}
      >
        <div style={{ position: "absolute", left: 50, right: 50, top: 70, height: 360, border: "3px solid rgba(255,255,255,0.05)", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 50, right: 50, top: 480, height: 400, border: "3px solid rgba(255,255,255,0.05)", borderRadius: 6 }} />
        {/* глазок */}
        <div
          style={{
            position: "absolute",
            left: DW / 2 - 14,
            top: 200,
            width: 28,
            height: 28,
            borderRadius: 14,
            background: `radial-gradient(circle, ${rgba("#FFD9A8", 0.9 * leak)} 0%, #6D6560 45%, #2A2522 100%)`,
            boxShadow: `0 0 ${18 * leak}px ${rgba(C.warm, 0.8 * leak)}`,
          }}
        />
        {/* цепочка */}
        <svg width={DW} height={DH} style={{ position: "absolute", inset: 0 }}>
          <path d={`M ${DW - 150} 300 Q ${DW - 80} ${360 - 60 * open} ${DW - 4} 310`} fill="none" stroke="#9A938C" strokeWidth={5} strokeDasharray="10 6" />
        </svg>
        {/* замки */}
        {[420, 640].map((yy, i) => (
          <div
            key={yy}
            style={{
              position: "absolute",
              left: 430 - 22,
              top: yy - 22,
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "radial-gradient(circle at 35% 30%, #E8E2DA 0%, #9C958E 60%, #5E5853 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 19,
                top: 7,
                width: 6,
                height: 30,
                borderRadius: 3,
                background: "#2A2522",
                transform: `rotate(${i === 0 ? lerp(0, 360, turn) : 0}deg)`,
              }}
            />
          </div>
        ))}
        {/* ручка */}
        <div style={{ position: "absolute", left: 400, top: 515, width: 60, height: 60, borderRadius: 30, background: "radial-gradient(circle at 35% 30%, #EEE8E0, #8E8780)" }} />
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 530,
            width: 140,
            height: 30,
            borderRadius: 15,
            background: "linear-gradient(180deg, #F2ECE4, #A39C95)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </>
  );
};

/** Силуэт мамы в дверном проёме (координаты относительно проёма 500×940) */
export const MomSilhouette: React.FC<{ f: number; appear: number; x?: number; scale?: number }> = ({ f, appear, x = 270, scale = 1 }) => {
  const breathe = Math.sin(f * 0.08) * 3;
  const tul = (cx: number, cy: number, col: string, r: number) => (
    <g transform={`translate(${cx},${cy}) rotate(${r})`}>
      <path d="M0 0 C-22 -8 -24 -44 -14 -58 L-6 -40 L0 -62 L6 -40 L14 -58 C24 -44 22 -8 0 0 Z" fill={col} />
    </g>
  );
  return (
    <svg width={500} height={940} viewBox="0 0 500 940" style={{ position: "absolute", inset: 0, opacity: appear }}>
      <g transform={`translate(${x - 270},${(1 - appear) * 30 + breathe}) translate(270,940) scale(${scale}) translate(-270,-940)`}>
        {/* тень-силуэт */}
        <g fill="#140D0A" style={{ filter: `drop-shadow(0 0 16px ${rgba(C.warm, 0.85)})` }}>
          <ellipse cx={270} cy={300} rx={62} ry={72} />
          <path d="M226 360 Q270 392 314 360 L320 410 Q270 430 220 410 Z" />
          <path d="M150 470 Q160 410 230 400 L310 400 Q380 410 390 470 L430 940 L110 940 Z" />
          {/* платок/волосы */}
          <path d="M205 290 Q205 210 270 214 Q338 210 336 292 Q350 360 318 372 Q330 300 270 296 Q212 300 222 372 Q190 360 205 290 Z" />
        </g>
        {/* букет */}
        <g>
          <path d="M300 610 L352 470 L392 610 Z" fill="#E9DCCB" opacity={0.92} />
          <g stroke="#3DBB6A" strokeWidth={6} strokeLinecap="round">
            <line x1={346} y1={600} x2={330} y2={470} />
            <line x1={350} y1={600} x2={358} y2={455} />
            <line x1={354} y1={600} x2={384} y2={478} />
          </g>
          {tul(330, 478, "#FF4D6D", -12)}
          {tul(358, 462, "#FF6B81", 4)}
          {tul(386, 486, "#E8364F", 16)}
          {/* рука */}
          <ellipse cx={346} cy={598} rx={34} ry={22} fill="#140D0A" />
        </g>
      </g>
    </svg>
  );
};
