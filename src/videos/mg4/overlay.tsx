// DOM overlays over the 3D picture for Lesson 4 (AI Course Announcement):
// 1) «БАСТЫ ЖАҢАЛЫҚ · AI КУРС» series tag.
// 2) «✈️ TELEGRAM: @barys_agai» top badge during sh04 .. sh07.
// 3) End card: Telegram masterclass invitation with pulsing CTA button.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { MONT } from "../../qagaz/theme";
import { CARD_AT, shotStart } from "./timeline";
import { Pen } from "./toon";
import { leopardFront } from "./leopard";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => {
  const c = 1.9,
    x = cl(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** Top tag over the hook (0 .. sh03) */
export const SeriesTag: React.FC<{ f: number }> = ({ f }) => {
  const end = shotStart("sh03") + 15;
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
            fontSize: 34,
            lineHeight: "64px",
            letterSpacing: 2,
            boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          БАСТЫ ЖАҢАЛЫҚ · AI КУРС 🚀
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Telegram badge widget during the course announcement (sh04 .. sh07) */
export const TelegramBadge: React.FC<{ f: number }> = ({ f }) => {
  const start = shotStart("sh04");
  if (f < start || f >= CARD_AT) return null;
  const inK = back((f - start) / 9);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 50,
          top: 250,
          height: 84,
          borderRadius: 42,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,136,204,0.92)",
          border: "4px solid #FFD84A",
          boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
          transform: `scale(${0.3 + 0.7 * inK})`,
          transformOrigin: "100% 50%",
          opacity: cl(inK * 2),
        }}
      >
        <div style={{ fontSize: 34 }}>✈️</div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 28,
            color: "#FFFFFF",
            letterSpacing: 1.5,
          }}
        >
          TELEGRAM КАНАЛ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** End card: full-bleed summary and invitation */
export const EndCard: React.FC<{ f: number }> = ({ f }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, 500, 800);
    const p = new Pen(g);
    leopardFront(p, {
      light: 0.95,
      glasses: true,
      expr: "joy",
      arms: ["present", "point"],
      tail: -1,
      facing: 1,
    });
  }, []);

  if (f < CARD_AT) return null;
  const u = eo((f - CARD_AT) / 14);
  const pulse = 1 + 0.05 * Math.sin((f - CARD_AT) * 0.35);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% 40%, rgba(16,42,32,${0.96 * u}) 0%, rgba(8,16,12,${0.98 * u}) 100%)`,
        opacity: u,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      {/* Board container */}
      <div
        style={{
          width: 960,
          borderRadius: 36,
          background: "#1e3d2f",
          border: "12px solid #6b4423",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 0 40px rgba(0,0,0,0.5)",
          padding: "50px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          transform: `scale(${0.9 + 0.1 * u})`,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 44,
            color: "#FFD84A",
            textAlign: "center",
            letterSpacing: 2,
            textShadow: "0 4px 12px rgba(0,0,0,0.6)",
            marginBottom: 24,
          }}
        >
          ЖАСАНДЫ ИНТЕЛЛЕКТ КУРСЫ 🚀
        </div>

        {/* Benefits checklist */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 36,
            padding: "0 20px",
          }}
        >
          {[
            "🎬 3D Анимация және вирустық мультфильмдер",
            "🎙️ Кез келген тілдегі AI дауыс пен дубляж",
            "⚡ Дайын сценарийлер мен құпия промпттар",
            "💰 Миллиондаған қаралым мен монетизация!",
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                fontFamily: MONT,
                fontWeight: 700,
                fontSize: 27,
                color: "#FFFFFF",
                background: "rgba(0,0,0,0.25)",
                padding: "14px 20px",
                borderRadius: 16,
                borderLeft: "6px solid #00b4d8",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Telegram Box */}
        <div
          style={{
            background: "#0088cc",
            borderRadius: 24,
            padding: "18px 36px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 10px 25px rgba(0,136,204,0.4)",
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 40 }}>✈️</span>
          <span
            style={{
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 32,
              color: "#FFFFFF",
              letterSpacing: 1.5,
            }}
          >
            БАРЛЫҚ САБАҚ ТЕЛЕГРАМДА!
          </span>
        </div>

        {/* Pulsing CTA Button */}
        <div
          style={{
            background: "#FFD84A",
            color: "#120C06",
            borderRadius: 36,
            padding: "20px 48px",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 1.5,
            boxShadow: "0 12px 30px rgba(255,216,74,0.45)",
            transform: `scale(${pulse})`,
            textAlign: "center",
          }}
        >
          СІЛТЕМЕ ПРОФИЛЬДЕ! КІРІП ҮЛГЕР 👆
        </div>
      </div>
    </AbsoluteFill>
  );
};
