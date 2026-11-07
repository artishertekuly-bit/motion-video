import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C, INTER, MONO } from "./theme";
import { ce, cs, SCENES, we, ws, FPS } from "./timeline";
import { ChatHeader, HudTag, Phone, TextBubble, TypingDots, VoiceBubble, Wire, lerp, p } from "./ui";
import { Door, LOCK } from "./door";

const Q = "Анамның сүйікті гүлі қандай?";
const ROWS = [10, 9, 7];

// S6 — пишем секретный вопрос… и в коридоре поворачивается ключ
export const S6: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = SCENES.s6;
  const w = (i: number) => ws("n6", i);
  const key = cs("key");
  const typeA = w(2) - 2;
  const typeB = we("n6", 5);
  const n = Math.round(Q.length * p(f, typeA, typeB - typeA, Easing.linear));
  const sendAt = typeB + 4;
  const sent = f >= sendAt;
  const sentK = p(f, sendAt, 8, Easing.out(Easing.back(1.4)));
  const typing = f >= sendAt + 12;
  const keyIdx = n > 0 && !sent ? Math.floor((n * 7.3) % 26) : -1;

  if (f < key) {
    const push = p(f, a, key - a, Easing.linear);
    return (
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * push})` }}>
        <Phone y={290} glow={C.cyan} glowAmt={0.55} ry={lerp(3, -2, push)} clock="21:33">
          <ChatHeader
            avatar="?"
            name="+7 708 ••• 41 17"
            sub={typing ? "жазып жатыр…" : "бейтаныс нөмір"}
            subColor={typing ? C.amber : undefined}
            ring={C.red}
          />
          <div style={{ position: "absolute", top: 206, left: 28, transform: `translateY(${-sentK * 40}px)` }}>
            <VoiceBubble f={f} cue="m2" fake />
          </div>
          {sent && (
            <div style={{ position: "absolute", top: lerp(560, 330, sentK), right: 28, opacity: sentK }}>
              <TextBubble text={Q} out time="21:33 ✓✓" />
            </div>
          )}
          {typing && (
            <div style={{ position: "absolute", top: 492, left: 28, opacity: p(f, sendAt + 12, 6) }}>
              <TypingDots f={f} />
            </div>
          )}
          {/* поле ввода */}
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              top: 598,
              height: 74,
              borderRadius: 37,
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              padding: "0 14px 0 26px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ flex: 1, fontFamily: INTER, fontWeight: 500, fontSize: 27, color: n ? "#fff" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden" }}>
              {sent ? "Хабарлама…" : n ? Q.slice(0, n) : "Хабарлама…"}
              {!sent && Math.floor(f / 8) % 2 === 0 && <span style={{ color: C.blue }}>|</span>}
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: n && !sent ? C.blue : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={28} height={28} viewBox="0 0 24 24">
                <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {/* клавиатура */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, bottom: 0, background: "rgba(255,255,255,0.03)", padding: "18px 10px", boxSizing: "border-box" }}>
            {ROWS.map((cnt, r) => (
              <div key={r} style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 12 }}>
                {Array.from({ length: cnt }, (_, i) => {
                  const idx = ROWS.slice(0, r).reduce((s, x) => s + x, 0) + i;
                  const on = idx === keyIdx;
                  return <div key={i} style={{ width: 46, height: 56, borderRadius: 8, background: on ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.13)" }} />;
                })}
              </div>
            ))}
            <div style={{ margin: "0 auto", width: 300, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.13)" }} />
          </div>
        </Phone>
      </AbsoluteFill>
    );
  }

  // дверь: ключ поворачивается
  const kk = f - key;
  const turn = p(kk, 0.55 * FPS, 0.45 * FPS) * 0.5 + p(kk, 1.25 * FPS, 0.45 * FPS) * 0.5;
  const leak = lerp(0.25, 1, p(kk, 0, 1.6 * FPS));
  const push = p(f, key, b - key, Easing.inOut(Easing.cubic));
  const clicks = [Math.round(1.0 * FPS), Math.round(1.7 * FPS)];
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.1 * push})`, transformOrigin: `${LOCK[0]}px ${LOCK[1]}px` }}>
      <Door f={f} open={0} turn={turn} leak={leak} />
      {clicks.map((c) =>
        kk >= c && kk < c + 14 ? (
          <div
            key={c}
            style={{
              position: "absolute",
              left: LOCK[0] - 30 - (kk - c) * 5,
              top: LOCK[1] - 30 - (kk - c) * 5,
              width: 60 + (kk - c) * 10,
              height: 60 + (kk - c) * 10,
              borderRadius: "50%",
              border: `3px solid ${C.amber}`,
              opacity: 1 - (kk - c) / 14,
            }}
          />
        ) : null,
      )}
      <Wire f={f} at={key + 10} from={[300, 400]} to={LOCK} color={C.amber} />
      <HudTag f={f} at={key + 6} x={70} y={330} color={C.amber} title="Есік ашылып жатыр" sub="21:34 · кіреберіс" icon="lock" titleSize={28} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1255, textAlign: "center", fontFamily: MONO, fontSize: 20, letterSpacing: "0.3em", color: "rgba(255,180,107,0.5)", opacity: p(f, key + 20, 10) * (1 - p(f, ce("n7"), 6)) }}>
        ДӘЛІЗ
      </div>
    </AbsoluteFill>
  );
};
