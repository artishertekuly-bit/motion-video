import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C, INTER, MONO, MONT } from "./theme";
import { ce, cs, SCENES, ws } from "./timeline";
import { ChatHeader, HudTag, Phone, VoiceBubble, lerp, p, rgba } from "./ui";

// S3 — второе голосовое, код из SMS, палец над «Жіберу»
export const S3: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = SCENES.s3;
  const w = (i: number) => ws("n2", i);
  const pop2 = p(f, cs("m2") - 8, 8, Easing.out(Easing.back(1.5)));
  const sms = p(f, w(0) - 4, 9);
  const otp = p(f, w(2) - 2, 8);
  const btn = p(f, w(4) - 2, 9);
  const blur = Math.max(otp, btn);
  const secs = Math.max(0, 59 - Math.floor((f - cs("m2")) / 30));
  const beat = (f - w(4)) % 20;
  const pulse = f >= w(4) ? Math.exp(-beat / 4) : 0;
  const push = p(f, a, b - a, Easing.linear);
  const fingerY = lerp(1180, 905, p(f, w(4), Math.max(10, ce("n2") - w(4)), Easing.inOut(Easing.cubic)));

  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * push})` }}>
      <Phone
        y={290}
        glow={C.red}
        clock="21:31"
        glowAmt={0.7 + 0.3 * Math.sin(f * 0.4)}
        ry={lerp(-4, 3, push)}
        rx={2}
        scale={lerp(1, 0.92, blur)}
        opacity={lerp(1, 0.35, blur)}
      >
        <div style={{ position: "absolute", inset: 0, filter: `blur(${blur * 7}px)` }}>
          <ChatHeader avatar="?" name="+7 708 ••• 41 17" sub="бейтаныс нөмір" ring={C.red} />
          <div style={{ position: "absolute", top: 214, left: 28 }}>
            <VoiceBubble f={f} cue="m1" fake />
          </div>
          <div style={{ position: "absolute", top: 372, left: 28, opacity: pop2, transform: `scale(${0.85 + 0.15 * pop2})`, transformOrigin: "left top" }}>
            <VoiceBubble f={f} cue="m2" fake />
          </div>
          {/* SMS сверху */}
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: lerp(-200, 80, sms),
              padding: "18px 22px",
              borderRadius: 28,
              background: "#2C3242", isolation: "isolate", zIndex: 5,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              opacity: sms,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.green, color: "#062", fontFamily: MONO, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                SMS
              </div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 25, color: C.white, flex: 1 }}>БАНК</div>
              <div style={{ fontFamily: INTER, fontSize: 20, color: "rgba(255,255,255,0.5)" }}>қазір</div>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 27, color: C.white, marginTop: 10, lineHeight: 1.3 }}>
              Растау коды: <b>4817</b>.<br />
              <span style={{ color: "#FF8A92" }}>Ешкімге айтпаңыз!</span>
            </div>
          </div>
        </div>
      </Phone>

      <HudTag f={f} at={cs("m2")} x={930} y={318} align="right" color={C.red} title={`Тез! 00:${String(secs).padStart(2, "0")}`} sub="уақыт қысымы" icon="!" titleSize={28} />

      {/* код крупно */}
      {otp > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lerp(560, 430, btn), display: "flex", justifyContent: "center", gap: 26 }}>
          {"4817".split("").map((d, i) => {
            const k = p(f, w(2) + i * 3, 7, Easing.out(Easing.back(1.8)));
            return (
              <div
                key={i}
                style={{
                  width: 150,
                  height: 190,
                  borderRadius: 22,
                  border: `3px solid ${C.amber}`,
                  background: rgba(C.amber, 0.08),
                  boxShadow: `0 0 30px ${rgba(C.amber, 0.35)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO,
                  fontWeight: 800,
                  fontSize: 120,
                  color: C.amber,
                  transform: `scale(${0.6 + 0.4 * k})`,
                  opacity: k,
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      )}

      {/* кнопка и палец */}
      {btn > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 240,
              top: 820,
              width: 600,
              height: 160,
              borderRadius: 80,
              background: `linear-gradient(180deg, #4A8DFF, ${C.blue})`,
              boxShadow: `0 0 ${40 + 50 * pulse}px ${rgba(C.blue, 0.6 + 0.3 * pulse)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              opacity: btn,
              transform: `scale(${(0.8 + 0.2 * btn) * (1 + 0.025 * pulse)})`,
            }}
          >
            <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 64, color: C.white, letterSpacing: "0.04em" }}>ЖІБЕРУ</div>
            <svg width={56} height={56} viewBox="0 0 24 24">
              <path d="M3 11.5L21 3l-6.5 18-3.2-7.3L3 11.5z" fill={C.white} />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              left: 640 - 78,
              top: fingerY - 78,
              width: 156,
              height: 156,
              borderRadius: 78,
              background: "rgba(255,255,255,0.16)",
              border: "3px solid rgba(255,255,255,0.65)",
              boxShadow: "0 0 40px rgba(255,255,255,0.3)",
              opacity: btn,
              transform: `scale(${1 + 0.06 * pulse})`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
