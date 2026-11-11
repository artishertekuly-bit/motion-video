// DOM overlays over the 3D picture for Lesson 5:
// 1) «БАРЫС АҒАЙ · 5-САБАҚ» series tag.
// 2) «100 МЛН әлде 1 ТЕҢГЕ? 💰» badge during the core lesson.
// 3) End card: Chalkboard with question and pulsing CTA button.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { MONT } from "../../qagaz/theme";
import { CARD_AT, shotStart } from "./timeline";
import { Pen } from "./toon";
import { leopardFront } from "./leopard";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const back = (t: number) => {
  const c = 1.9,
    x = cl(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** «БАРЫС АҒАЙ · 5-САБАҚ» — the series tag over the hook (0 .. sh03) */
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
          БАРЫС АҒАЙ · 5-САБАҚ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** «100 МЛН әлде 1 ТЕҢГЕ? 💰» top badge */
export const TopicBadge: React.FC<{ f: number }> = ({ f }) => {
  const start = shotStart("sh05"),
    hide = CARD_AT;
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
          background: "rgba(22,20,32,0.92)",
          border: "3px solid #FFD84A",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          opacity: cl(inK * out),
          transform: `scale(${cl(inK * out)})`,
        }}
      >
        <span style={{ fontSize: 40 }}>💰</span>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 28, color: "#FFFFFF", letterSpacing: 1 }}>
          100 МЛН әлде 1 ТЕҢГЕ?
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** End card at frame CARD_AT */
export const EndCard: React.FC<{ f: number }> = ({ f }) => {
  if (f < CARD_AT) return null;
  const t = f - CARD_AT;
  const cvRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, cv.width, cv.height);
    const p = new Pen(g);
    leopardFront(p, {
      expr: "smile",
      arms: ["present", "point"],
      glasses: true,
      light: 0,
    });
  }, []);

  const op = cl(t / 8);
  const pulse = Math.sin(t * 0.2) * 0.04 + 1.0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "#1c3b2b", opacity: op }}>
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 50,
          right: 50,
          background: "#204637",
          border: "12px solid #8B5A2B",
          borderRadius: 24,
          padding: "36px 30px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 32, color: "#FFD84A", letterSpacing: 2, marginBottom: 12 }}>
          БАСТЫ СҰРАҚ! 🤔
        </div>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 50, color: "#FFFFFF", lineHeight: 1.25 }}>
          АЛ СЕН 100 000 000 ₸ АЛАР МА ЕДІҢ, ӘЛДЕ 1 ₸ × 2 МЕ?
        </div>
      </div>

      <canvas
        ref={cvRef}
        width={600}
        height={1000}
        style={{
          position: "absolute",
          bottom: 240,
          left: "50%",
          transform: "translateX(-50%) scale(1.15)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#FFD84A",
            color: "#120C06",
            borderRadius: 40,
            padding: "16px 54px",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 44,
            boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
            transform: `scale(${pulse})`,
          }}
        >
          ПІКІРГЕ ЖАЗ! 👇
        </div>
      </div>
    </AbsoluteFill>
  );
};
