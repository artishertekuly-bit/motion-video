import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C, MONO } from "./theme";
import { ce, cs, SCENES } from "./timeline";
import { ChatHeader, LiveWave, Phone, VoiceBubble, lerp, p } from "./ui";

// S1 — крючок: незнакомый номер, голосовое «мамы»
export const S1: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = SCENES.s1;
  const k = p(f, a, b - a, Easing.inOut(Easing.cubic));
  const vib = f < 18 ? Math.sin(f * 2.7) * 9 * (1 - f / 18) : 0;
  const pop = p(f, cs("m1") - 6, 8, Easing.out(Easing.back(1.6)));
  return (
    <AbsoluteFill>
      <LiveWave f={f} cue="m1" cx={540} cy={760} width={1040} height={420} color={C.red} jag opacity={0.3} bars={52} />
      <Phone
        x={540 + vib}
        y={290}
        glow={C.red}
        glowAmt={0.75 + 0.25 * Math.sin(f * 0.35)}
        rx={lerp(10, 3, k)}
        ry={lerp(-18, -5, k)}
        scale={lerp(0.97, 1.04, k)}
      >
        <ChatHeader avatar="?" name="+7 708 ••• 41 17" sub="бейтаныс нөмір" ring={C.red} />
        <div
          style={{
            position: "absolute",
            top: 214,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 19,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          БҮГІН · 21:30
        </div>
        <div style={{ position: "absolute", top: 262, left: 28, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: "left top", opacity: pop }}>
          <VoiceBubble f={f} cue="m1" fake />
        </div>
        <LiveWave f={f} cue="m1" cx={286} cy={590} width={500} height={300} color={C.red} jag bars={34} opacity={pop} idle={0.06} />
        <div
          style={{
            position: "absolute",
            top: 790,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.14em",
            color: C.red,
            opacity: pop * (Math.floor(f / 12) % 2 === 0 ? 1 : 0.55),
          }}
        >
          ● ТЫҢДАЛУДА 0:0{Math.min(4, Math.max(0, Math.floor((f - cs("m1")) / 30)))} / 0:0{Math.round((ce("m1") - cs("m1")) / 30)}
        </div>
      </Phone>
    </AbsoluteFill>
  );
};
