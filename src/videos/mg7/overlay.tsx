// DOM overlays over the 3D picture for Lesson 7:
// 1) «БАРЫС АҒАЙ · 7-САБАҚ» series tag.
// 2) «АТА-АНАНЫҢ СЕНІМІ 🕊️❤️» badge during the core lesson.
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

/** «БАРЫС АҒАЙ · 7-САБАҚ» — the series tag over the hook (0 .. sh03) */
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
          БАРЫС АҒАЙ · 7-САБАҚ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** «АТА-АНАНЫҢ СЕНІМІ 🕊️❤️» top badge */
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
          left: 0,
          width: 1080,
          top: 250,
          display: "flex",
          justifyContent: "center",
          opacity: cl(inK * out),
          transform: `scale(${cl(inK)}) translateY(${(1 - out) * -30}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(22, 40, 30, 0.92)",
            border: "3px solid #FFD84A",
            color: "#FFFFFF",
            borderRadius: 24,
            padding: "10px 32px",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 1.5,
            boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: "#FFD84A" }}>🕊️</span>
          <span>АТА-АНАНЫҢ СЕНІМІ</span>
          <span>❤️</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** End card: question + CTA */
export const EndCard: React.FC<{ f: number }> = ({ f }) => {
  if (f < CARD_AT) return null;
  const k = back((f - CARD_AT) / 10);
  const pulse = 1 + 0.04 * Math.sin((f - CARD_AT) * 0.25);
  const cvs = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, 300, 360);
    const p = new Pen(g);
    g.save();
    g.translate(150, 330);
    g.scale(0.3, 0.3);
    leopardFront(p, { expr: "smile", arms: ["point", "hang"], light: 1 });
    g.restore();
  }, []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 16, 12, 0.55)",
          backdropFilter: "blur(4px)",
          opacity: cl(k),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 380,
          transform: `scale(${cl(k)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            background: "#16281e",
            border: "8px solid #a3704c",
            borderRadius: 36,
            padding: "48px 36px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 0 40px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 38,
              color: "#FFD84A",
              marginBottom: 20,
              letterSpacing: 2,
            }}
          >
            СҰРАҚ: 🕊️❤️
          </div>
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 800,
              fontSize: 44,
              color: "#FFFFFF",
              lineHeight: 1.35,
              textShadow: "0 3px 10px rgba(0,0,0,0.8)",
            }}
          >
            Ата-анаңа соңғы рет қашан жақсы көретініңді айттың?
          </div>
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 600,
              fontSize: 30,
              color: "#86efac",
              marginTop: 24,
            }}
          >
            «Олардың саған сенгені — ең үлкен қанат!» ✨
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 44,
            transform: `scale(${pulse})`,
            background: "linear-gradient(135deg, #e11d48, #be123c)",
            border: "4px solid #fff",
            borderRadius: 40,
            padding: "20px 54px",
            boxShadow: "0 12px 30px rgba(225, 29, 72, 0.6)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 40 }}>💬</span>
          <span
            style={{
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 34,
              color: "#fff",
              letterSpacing: 2,
            }}
          >
            ПІКІРГЕ ЖАЗ!
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
