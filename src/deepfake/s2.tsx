import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { C, MONO } from "./theme";
import { AUDIO, SCENES, ws } from "./timeline";
import { CL, HudTag, Wire, lerp, p, rgba } from "./ui";
import { Dot, FloorPlan, ENTRANCE, toAbs, YOU } from "./plan";

const barsFrom = (cue: string, n: number) => {
  const r = AUDIO[cue].rms;
  const max = Math.max(...r, 0.0001);
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor((i / n) * r.length);
    const b = Math.max(a + 1, Math.floor(((i + 1) / n) * r.length));
    let m = 0;
    for (let k = a; k < b; k++) m = Math.max(m, r[k] ?? 0);
    return 0.12 + 0.88 * (m / max);
  });
};
const BARS = barsFrom("m1", 44);

const Bars: React.FC<{ y: number; color: string; opacity: number; jag?: number; f: number }> = ({ y, color, opacity, jag = 0, f }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    {BARS.map((v, i) => {
      const hh = Math.max(6, v * 150 * (1 + jag * 0.25 * Math.sin(f * 1.7 + i * 2.1)));
      return <rect key={i} x={140 + i * 18.2} y={y - hh / 2} width={10} height={hh} rx={5} fill={color} />;
    })}
  </svg>
);

// S2 — 21:30, вы дома одни, незнакомый номер, голос мамы — 100%
export const S2: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SCENES.s2;
  const w = (i: number) => ws("n1", i);

  // a) большие часы
  const clockOut = p(f, w(4) - 7, 7, Easing.in(Easing.cubic));
  const clockOn = f < w(4);
  const digits = "21:30".split("");

  // b–c) план
  const planOn = f >= w(4) - 3;
  const planDim = p(f, w(11) - 2, 10);
  const you = toAbs(...YOU);
  const door = toAbs(...ENTRANCE);

  // d) сравнение голосов
  const cmpIn = p(f, w(11), 10);
  const merge = p(f, w(13), Math.max(6, w(14) - w(13)), Easing.inOut(Easing.cubic));
  const pct = Math.round(interpolate(f, [w(12), w(15)], [0, 100], { ...CL, easing: Easing.out(Easing.quad) }));
  const lock = f >= w(15);
  const flash = lock ? 1 - p(f, w(15), 12) : 0;

  return (
    <AbsoluteFill>
      {clockOn && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 560,
            textAlign: "center",
            transform: `translateY(${-clockOut * 400}px) scale(${lerp(1, 0.18, clockOut)})`,
            opacity: 1 - clockOut,
          }}
        >
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 240, color: C.amber, textShadow: `0 0 50px ${rgba(C.amber, 0.55)}`, letterSpacing: "0.02em" }}>
            {digits.map((d, i) => {
              const k = p(f, a + 2 + i * 3, 8, Easing.out(Easing.back(1.4)));
              return (
                <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - k) * 60}px)`, opacity: k }}>
                  {d}
                </span>
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: "0.3em", color: rgba(C.amber, 0.65), marginTop: 6, opacity: p(f, a + 14, 8) }}>
            КЕШКІ САҒАТ
          </div>
        </div>
      )}

      {planOn && (
        <AbsoluteFill style={{ opacity: lerp(1, 0.05, planDim), transform: `scale(${lerp(1, 0.94, planDim)})` }}>
          <FloorPlan f={f} drawAt={w(4) - 3} kitchen={p(f, w(5), 10)} warm={0}>
            <Dot f={f} x={YOU[0]} y={YOU[1]} color={C.amber} at={w(5)} />
            {f >= w(7) &&
              [0, 1, 2].map((i) => {
                const ph = ((f - w(7) + i * 12) % 36) / 36;
                return <circle key={i} cx={YOU[0]} cy={YOU[1]} r={20 + ph * 150} fill="none" stroke={C.red} strokeWidth={3} opacity={(1 - ph) * 0.8} />;
              })}
          </FloorPlan>
          <Wire f={f} at={w(5) + 4} from={[300, 462]} to={you} color={C.amber} dot={false} />
          <HudTag f={f} at={w(5)} x={176} y={392} color={C.amber} title="Сіз · асүй" sub="үйде жалғыз" icon="i" titleSize={28} />
          <Wire f={f} at={w(6) + 4} from={[560, 1128]} to={door} color={C.green} />
          <HudTag f={f} at={w(6)} x={560} y={1096} color={C.green} title="Есік · құлыптаулы" sub="21:30 · ішінен" icon="lock" titleSize={28} />
          <Wire f={f} at={w(7) + 4} from={[600, 560]} to={you} color={C.red} dot={false} />
          <HudTag f={f} at={w(7)} x={560} y={500} color={C.red} title="+7 708 ••• 41 17" sub="бейтаныс нөмір" icon="!" titleSize={27} />
        </AbsoluteFill>
      )}

      {f >= w(11) && (
        <AbsoluteFill style={{ opacity: cmpIn }}>
          <HudTag f={f} at={w(11)} x={540} y={300} align="center" color={C.cyan} title="Дауыс талдауы" sub="жасанды интеллект тексерісі" icon="i" titleSize={28} />
          <div style={{ position: "absolute", left: 140, top: 452, fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: "0.12em", color: C.green, opacity: 1 - merge }}>
            ● АНАҢЫЗДЫҢ ДАУЫСЫ
          </div>
          <div style={{ position: "absolute", left: 140, top: lerp(642, 452, merge), fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: "0.12em", color: C.red, opacity: 1 - merge }}>
            ● ХАБАРЛАМАДАҒЫ ДАУЫС
          </div>
          <Bars f={f} y={565} color={merge > 0.5 ? C.amber : C.green} opacity={0.9} />
          <Bars f={f} y={lerp(755, 565, merge)} color={merge > 0.5 ? C.amber : C.red} opacity={lerp(0.9, 0.55, merge)} jag={1 - merge} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: rgba(C.cyan, 0.8) }}>СӘЙКЕСТІК</div>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: 170,
                lineHeight: 1.05,
                color: lock ? C.amber : C.white,
                textShadow: `0 0 ${lock ? 60 : 20}px ${rgba(C.amber, lock ? 0.75 : 0.3)}`,
                transform: `scale(${lock ? 1 + 0.12 * flash : 1})`,
              }}
            >
              {pct}%
            </div>
          </div>
          <div style={{ position: "absolute", left: 140, top: 1060, width: 800, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 8, background: C.amber, boxShadow: `0 0 20px ${rgba(C.amber, 0.7)}` }} />
          </div>
          {flash > 0 && <AbsoluteFill style={{ background: rgba(C.amber, 0.22 * flash) }} />}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
