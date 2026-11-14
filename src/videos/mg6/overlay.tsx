// DOM overlays over the 3D picture for Lesson 6:
// 1) «БАРЫС АҒАЙ · 6-САБАҚ» series tag.
// 2) «ТРОЯ АТЫ 🐴🎁» badge during the core lesson.
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

/** «БАРЫС АҒАЙ · 6-САБАҚ» — the series tag over the hook (0 .. sh03) */
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
          БАРЫС АҒАЙ · 6-САБАҚ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** «ТРОЯ АТЫ 🐴🎁» top badge */
export const TopicBadge: React.FC<{ f: number }> = ({ f }) => {
  const start = shotStart("sh03"),
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
        <span style={{ fontSize: 40 }}>🐴</span>
        <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 28, color: "#FFFFFF", letterSpacing: 1 }}>
          ТРОЯ АТЫ ҚҰПИЯСЫ
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
    g.clearRect(0, 0, 480, 560);
    const p = new Pen(g);
    leopardFront(p, { expr: "smile", glasses: true, facing: 0, arms: ["hip", "present"] });
  }, []);

  const k = back(t / 14);
  const pulse = 1 + 0.05 * Math.sin((t / 30) * Math.PI * 4);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,12,18,0.78)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: cl(k * 2),
        }}
      >
        {/* Chalkboard frame */}
        <div
          style={{
            position: "relative",
            width: 940,
            background: "#204637",
            border: "18px solid #6b4423",
            borderRadius: 36,
            boxShadow: "0 20px 60px rgba(0,0,0,0.85), inset 0 0 40px rgba(0,0,0,0.5)",
            padding: "48px 44px 56px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${cl(k)})`,
          }}
        >
          {/* Header pill */}
          <div
            style={{
              background: "#FFD84A",
              color: "#1a1208",
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: 2,
              padding: "10px 28px",
              borderRadius: 24,
              marginBottom: 32,
              boxShadow: "0 4px 0 rgba(0,0,0,0.25)",
            }}
          >
            ТАРИХТАН САБАҚ 📜
          </div>

          <div
            style={{
              fontFamily: "Caveat, cursive",
              fontWeight: 700,
              fontSize: 58,
              lineHeight: "68px",
              color: "#f6f4e8",
              textAlign: "center",
              marginBottom: 20,
              maxWidth: 820,
            }}
          >
            «Сыйлық әкелген гректен қорық!»
          </div>

          <div
            style={{
              fontFamily: MONT,
              fontWeight: 800,
              fontSize: 34,
              lineHeight: "48px",
              color: "#38bdf8",
              textAlign: "center",
              marginBottom: 36,
              maxWidth: 780,
            }}
          >
            Ал сен бейтаныс сыйлықтарға сенесің бе?
          </div>

          {/* Barys miniature avatar */}
          <canvas
            ref={cvRef}
            width={480}
            height={560}
            style={{
              width: 170,
              height: 200,
              marginBottom: 20,
            }}
          />

          {/* CTA button */}
          <div
            style={{
              background: "linear-gradient(135deg, #FF6B4A, #FF3D71)",
              borderRadius: 36,
              padding: "20px 64px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 12px 28px rgba(255,61,113,0.45)",
              transform: `scale(${pulse})`,
            }}
          >
            <span style={{ fontSize: 34 }}>👇</span>
            <div
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: 36,
                color: "#FFFFFF",
                letterSpacing: 1.5,
              }}
            >
              ПІКІРГЕ ЖАЗ!
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
