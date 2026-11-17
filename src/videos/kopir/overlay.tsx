// Documentary overlays for «Көпір»: timestamps, pedagogical badges, test HUD and final card.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CARD_AT, FPS, shotStart, TOTAL } from "./timeline";

const MONT = "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const OSW = "Oswald, Impact, sans-serif";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);

/** Documentary scene header & pedagogical insight badges */
export const DocHeader: React.FC<{ f: number }> = ({ f }) => {
  if (f >= CARD_AT) return null;
  const t = f / FPS;

  // Shot 1 opening timestamp (0 - 7s)
  if (t < 7.0) {
    const k = cl(t / 0.8) * (1 - cl((t - 6.0) / 0.8));
    return (
      <div style={{
        position: "absolute", left: 60, top: 45, opacity: k, pointerEvents: "none",
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(10, 14, 26, 0.85)", border: "2px solid rgba(255,216,74,0.7)",
          borderRadius: 20, padding: "6px 20px",
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF4D4D", boxShadow: "0 0 10px #FF4D4D" }} />
          <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: 24, color: "#FFD84A", letterSpacing: 2 }}>
            09:00 · 9 «Б» СЫНЫБЫ
          </span>
        </div>
        <div style={{
          fontFamily: MONT, fontWeight: 800, fontSize: 28, color: "#FFFFFF",
          textShadow: "0 4px 12px rgba(0,0,0,0.8)", paddingLeft: 6,
        }}>
          ФИЗИКА + ИНФОРМАТИКА · «КӨПІР» САБАҒЫ
        </div>
      </div>
    );
  }

  // Pedagogical concept badges
  let badgeText = "";
  let bStart = 0, bEnd = 0;

  if (t >= 15.0 && t < 32.0) {
    badgeText = "🌱 Алдын ала ескерту · Визуалды жоспар · Тыныш кеңістік";
    bStart = 15.0; bEnd = 32.0;
  } else if (t >= 40.0 && t < 65.0) {
    badgeText = "🎯 Ойын форматы · Рөл таңдау құқығы · Жазбаша және ірі қаріп";
    bStart = 40.0; bEnd = 65.0;
  } else if (t >= 77.0 && t < 122.0) {
    badgeText = "⚡ Қозғалыс үзілісі · Таймер · Тактильді және цифрлық модель";
    bStart = 77.0; bEnd = 122.0;
  } else if (t >= 132.0 && t < 155.0) {
    badgeText = "⚖️ Көпір сынағы: 800 г · Қатені зерттеу · Жеке үлесті бағалау";
    bStart = 132.0; bEnd = 155.0;
  } else if (t >= 157.0 && t < 172.0) {
    badgeText = "🏆 Үшбұрышты ферма · 1000 г жеңісі · Баршаға тең орта";
    bStart = 157.0; bEnd = 172.0;
  }

  if (badgeText) {
    const k = cl((t - bStart) / 0.5) * (1 - cl((t - (bEnd - 0.5)) / 0.5));
    return (
      <div style={{
        position: "absolute", left: 0, width: 1920, top: 45, display: "flex", justifyContent: "center",
        opacity: k, pointerEvents: "none", transform: `translateY(${(1 - k) * -15}px)`,
      }}>
        <div style={{
          background: "rgba(10, 16, 32, 0.88)", border: "2px solid rgba(255, 216, 74, 0.8)",
          borderRadius: 25, padding: "8px 28px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: 24, color: "#FFD84A", letterSpacing: 1 }}>
            {badgeText}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

/** Load test live HUD in shots 16-17 */
export const LoadHud: React.FC<{ f: number }> = ({ f }) => {
  const st16 = shotStart("sh16"), en17 = shotStart("sh18");
  if (f < st16 || f >= en17) return null;
  const t = f / FPS;
  const isCrack = f >= shotStart("sh17") + 60;
  const load = isCrack ? "800 г ⚠️ (СЫНДЫ!)" : t > (shotStart("sh16") / FPS + 4) ? "500 г" : "200 г";

  return (
    <div style={{
      position: "absolute", right: 60, top: 45, pointerEvents: "none",
      background: "rgba(12, 16, 30, 0.92)", border: `3px solid ${isCrack ? "#FF4D4D" : "#4CD98A"}`,
      borderRadius: 24, padding: "14px 28px", textAlign: "center",
      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 22, color: "#A9BCE6", letterSpacing: 1.5 }}>
        КӨПІР САЛМАҒЫ
      </div>
      <div style={{
        fontFamily: OSW, fontWeight: 700, fontSize: 48, lineHeight: 1.1,
        color: isCrack ? "#FF4D4D" : "#FFD84A", marginTop: 4,
      }}>
        {load}
      </div>
    </div>
  );
};

/** Final closing title card */
export const FinalCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh23");
  if (f < st) return null;
  const lf = f - st;
  const inK = eo(lf / 15);
  const fadeOut = cl((TOTAL - f) / 20);

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(circle at 50% 45%, #1e2848 0%, #0d1222 75%, #05070f 100%)",
      pointerEvents: "none", opacity: inK * fadeOut,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 60px", textAlign: "center",
    }}>
      <div style={{
        fontFamily: MONT, fontWeight: 800, fontSize: 32, letterSpacing: 4,
        color: "#FFD84A", marginBottom: 16,
      }}>
        9 «Б» СЫНЫБЫ · ФИЗИКА + ИНФОРМАТИКА
      </div>

      <div style={{
        fontFamily: OSW, fontWeight: 700, fontSize: 130, lineHeight: 1,
        color: "#FFFFFF", WebkitTextStroke: "6px #120C06", paintOrder: "stroke fill",
        marginBottom: 30, textShadow: "0 14px 30px rgba(0,0,0,0.6)",
      }}>
        «КӨПІР»
      </div>

      <div style={{
        maxWidth: 900, background: "rgba(255,255,255,0.08)",
        border: "2px solid rgba(255,216,74,0.5)", borderRadius: 30,
        padding: "26px 44px", marginBottom: 35,
      }}>
        <div style={{
          fontFamily: MONT, fontWeight: 800, fontSize: 34, lineHeight: 1.45,
          color: "#FFFFFF",
        }}>
          «Бұл сабақта ешкім «ерекше» болып сезінбеді. Әркім өз жолымен нәтижеге жетті.»
        </div>
      </div>

      <div style={{
        background: "#2FB36B", borderRadius: 30, padding: "12px 36px",
        fontFamily: MONT, fontWeight: 800, fontSize: 26, color: "#FFFFFF",
        boxShadow: "0 8px 20px rgba(47,179,107,0.4)",
      }}>
        ИНКЛЮЗИВТІ БІЛІМ БЕРУ — БАРШАҒА ТЕҢ МҮМКІНДІК 🌱
      </div>
    </AbsoluteFill>
  );
};
