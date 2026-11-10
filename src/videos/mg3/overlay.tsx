// DOM overlays over the 3D picture for Lesson 3:
// 1) «БАРЫС АҒАЙ · 3-САБАҚ» series tag.
// 2) «АБАЙ · 18-ҚАРА СӨЗ» banner widget during the central lesson.
// 3) End card: chalkboard with the question, Barys drawn with leopard Pen, pulsing CTA button.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { MONT } from "../../qagaz/theme";
import { CARD_AT, shotStart, ws } from "./timeline";
import { Pen } from "./toon";
import { leopardFront } from "./leopard";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => {
  const c = 1.9,
    x = cl(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** «БАРЫС АҒАЙ · 3-САБАҚ» — the series tag over the hook (0 .. sh03) */
export const SeriesTag: React.FC<{ f: number }> = ({ f }) => {
  const end = shotStart("sh03") + 25;
  if (f >= end) return null;
  const k = back((f - 4) / 10) * (1 - cl((f - end + 8) / 8));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 250,
          display: "flex",
          justifyContent: "center",
          opacity: cl(k * 2),
          transform: `translateY(${(1 - k) * -40}px)`,
        }}
      >
        <div
          style={{
            background: "#FFD84A",
            color: "#120C06",
            borderRadius: 30,
            padding: "0 36px",
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 36,
            lineHeight: "64px",
            letterSpacing: 2,
            boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          БАРЫС АҒАЙ · 3-САБАҚ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** «АБАЙ · 18-ҚАРА СӨЗ» top widget during the core lesson (sh06 .. sh11) */
export const AbaiBadge: React.FC<{ f: number }> = ({ f }) => {
  const start = shotStart("sh06"),
    hide = shotStart("sh12");
  if (f < start || f >= hide) return null;
  const inK = back((f - start) / 9),
    out = 1 - cl((f - hide + 8) / 8);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 250,
          height: 84,
          borderRadius: 42,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(18,12,6,0.85)",
          border: "4px solid #FFD84A",
          boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
          transform: `scale(${0.3 + 0.7 * inK})`,
          transformOrigin: "100% 50%",
          opacity: cl(inK * 2) * out,
        }}
      >
        <div style={{ fontSize: 32 }}>📜</div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 30,
            color: "#FFFFFF",
            letterSpacing: 1.5,
          }}
        >
          АБАЙ · 18-СӨЗ
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Leo: React.FC<{ w: number }> = ({ w }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const h = Math.round((w * 1000) / 600);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(cv.width / 600, 0, 0, cv.width / 600, 0, 0);
    leopardFront(new Pen(g), {
      expr: "smile",
      facing: -1,
      arms: ["point", "hip"],
      glasses: true,
      tail: 1,
      light: (-3 * Math.PI) / 4,
    });
  }, [w]);
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h, display: "block" }} />;
};

/** End card (CARD_AT ..): «Ал сен үшін адам несімен мықты: киімімен бе, әлде ақылымен бе?» + «ПІКІРГЕ ЖАЗ ↓» */
export const EndCard: React.FC<{ f: number; chalk: string }> = ({ f, chalk }) => {
  if (f < CARD_AT) return null;
  const lf = f - CARD_AT,
    inK = eo(lf / 10);
  const line = (i: number) => eo((f - ws("n7", [0, 4, 7, 10][i]) + 6) / 8);
  const btn = back((f - ws("n7", 11) + 3) / 9);
  const pulse = btn > 0.9 ? 1 + 0.05 * Math.sin((f - ws("n7", 11)) * 0.35) : 1;
  const leo = back((lf - 4) / 12);
  const dust = Array.from({ length: 18 }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return { x: 80 + r(1) * 920, y: ((r(2) * 1700 + lf * (0.8 + r(3))) % 1700) + 120, s: 4 + r(4) * 6 };
  });
  const T = (s: string, px: number, col = "#F6F4E8") => (
    <span
      style={{
        fontFamily: chalk,
        fontWeight: 700,
        fontSize: px,
        lineHeight: 1.05,
        color: col,
        textShadow: "0 0 2px rgba(255,255,255,0.35)",
      }}
    >
      {s}
    </span>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "#6b4526", opacity: inK }}>
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 150,
          right: 34,
          bottom: 150,
          borderRadius: 18,
          background:
            "radial-gradient(ellipse at 45% 35%, #3a6e57 0%, #2e5b47 55%, #244a3a 100%)",
          boxShadow: "inset 0 0 0 14px #4a2e18, inset 0 0 60px rgba(0,0,0,0.45)",
        }}
      />
      {dust.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            borderRadius: d.s,
            background: "rgba(255,255,255,0.18)",
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 90, top: 310, width: 900 }}>
        <div style={{ opacity: line(0), transform: `translateX(${(1 - line(0)) * -40}px)` }}>
          {T("Ал сен үшін", 108)}
        </div>
        <div
          style={{
            opacity: line(1),
            transform: `translateX(${(1 - line(1)) * -40}px)`,
            marginTop: 14,
          }}
        >
          {T("адам несімен мықты:", 100)}
        </div>
        <div
          style={{
            opacity: line(2),
            transform: `translateX(${(1 - line(2)) * -40}px)`,
            marginTop: 22,
            whiteSpace: "nowrap",
          }}
        >
          {T("КИІМІМЕН БЕ,", 112, "#ff6b5b")}
        </div>
        <div
          style={{
            opacity: line(3),
            transform: `translateX(${(1 - line(3)) * -40}px)`,
            marginTop: 16,
            whiteSpace: "nowrap",
          }}
        >
          {T("әлде ", 96)} {T("АҚЫЛЫМЕН БЕ?", 128, "#FFE278")}
        </div>
        <svg width={560} height={40} style={{ marginTop: 8, opacity: line(3) }}>
          <path d="M 10 22 Q 280 40 550 14" stroke="#FFE278" strokeWidth={8} fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 880,
          transform: `translateY(${(1 - leo) * 260}px)`,
          opacity: cl(leo * 2),
        }}
      >
        <Leo w={470} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          bottom: 230,
          display: "flex",
          justifyContent: "center",
          opacity: cl(btn * 2),
          transform: `scale(${btn * pulse})`,
        }}
      >
        <div
          style={{
            background: "#FFD84A",
            color: "#120C06",
            borderRadius: 36,
            padding: "0 54px",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 44,
            lineHeight: "84px",
            letterSpacing: 2,
            boxShadow: "0 10px 0 rgba(0,0,0,0.45)",
          }}
        >
          ПІКІРГЕ ЖАЗ ↓
        </div>
      </div>
    </AbsoluteFill>
  );
};
