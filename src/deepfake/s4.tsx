import React from "react";
import { AbsoluteFill, Easing, random } from "remotion";
import { C, MONO, MONT } from "./theme";
import { cs, ce, SCENES, ws } from "./timeline";
import { Glyph, HudTag, LiveWave, Person, lerp, p, rgba } from "./ui";

const RED_ORDER = [3, 7, 0, 5, 9, 2, 6, 8];

const Icon: React.FC<{ kind: number; color: string }> = ({ kind, color }) => {
  if (kind === 0)
    return (
      <svg width={58} height={58} viewBox="0 0 24 24">
        <rect x={2} y={6} width={20} height={12} rx={2} fill="none" stroke={color} strokeWidth={2} />
        <circle cx={12} cy={12} r={3} fill="none" stroke={color} strokeWidth={2} />
      </svg>
    );
  if (kind === 1) return <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color }}>4817</div>;
  return (
    <svg width={58} height={58} viewBox="0 0 24 24">
      <path d="M10 5L3 12l7 7M3.5 12H15a6 6 0 016 6v1" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// S4 — главная ошибка: три неправильных действия
export const S4: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SCENES.s4;
  const w = (i: number) => ws("n3", i);
  const cards = [
    { label: "Ақша салу", at: w(5) - 2, hit: w(7) },
    { label: "Кодты жіберу", at: w(8) - 2, hit: w(9) },
    { label: "Сол нөмірге жазу", at: w(10) - 2, hit: w(14) },
  ];
  const eat = p(f, w(15), 10, Easing.in(Easing.cubic));
  const av = p(f, w(15) + 4, 10, Easing.out(Easing.back(1.5)));
  const flare = f >= w(18) ? Math.exp(-(f - w(18)) / 8) : 0;
  const gl = (random(`av${Math.floor(f / 2)}`) < 0.25 ? 1 : 0) + flare;
  // реплика «мамы» как «голос» незнакомца — повтор огибающей m1
  const loopF = cs("m1") + ((f - a) % Math.max(1, ce("m1") - cs("m1")));
  const toCenter = (x: number, y: number) => ({ dx: (540 - x) * eat, dy: (760 - y) * eat });

  return (
    <AbsoluteFill>
      <HudTag f={f} at={a + 2} out={w(15)} x={540} y={300} align="center" color={C.red} title="Басты қате" sub="эмоция → асығыс шешім" icon="!" />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const x = 540 - 4.5 * 86 + i * 86;
          const ri = RED_ORDER.indexOf(i);
          const red = ri >= 0 && f >= w(3) + ri * 2;
          const { dx, dy } = toCenter(x, 470);
          return <Person key={i} x={x + dx} y={470 + dy} s={1.15 * (1 - eat * 0.8)} color={red ? C.red : "rgba(255,255,255,0.55)"} opacity={p(f, a + i, 6) * (1 - eat)} />;
        })}
      </svg>

      {cards.map((c, i) => {
        const y = 580 + i * 170;
        const k = p(f, c.at, 9);
        const hit = f >= c.hit;
        const hk = p(f, c.hit, 6, Easing.out(Easing.back(2)));
        const { dx, dy } = toCenter(540, y + 70);
        if (k <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 160,
              top: y,
              width: 760,
              height: 140,
              borderRadius: 22,
              border: `2px solid ${hit ? C.red : "rgba(255,255,255,0.16)"}`,
              background: hit ? rgba(C.red, 0.12) : "rgba(255,255,255,0.04)",
              boxShadow: hit ? `0 0 30px ${rgba(C.red, 0.35)}` : undefined,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 26px",
              boxSizing: "border-box",
              opacity: k * (1 - eat),
              transform: `translate(${(1 - k) * 120 + dx}px, ${dy}px) scale(${1 - eat * 0.8})`,
            }}
          >
            <div style={{ width: 92, height: 92, borderRadius: 18, border: `2px solid ${hit ? C.red : "rgba(255,255,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon kind={i} color={hit ? C.red : C.white} />
            </div>
            <div style={{ position: "relative", fontFamily: MONT, fontWeight: 900, fontSize: 46, color: hit ? "#FF9AA1" : C.white, textTransform: "uppercase", flex: 1 }}>
              {c.label}
              <div style={{ position: "absolute", left: 0, top: "52%", height: 6, borderRadius: 3, width: `${hk * 100}%`, background: C.red }} />
            </div>
            {hit && (
              <div style={{ width: 70, height: 70, borderRadius: 35, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${lerp(2.2, 1, hk)})`, opacity: hk, boxShadow: `0 0 30px ${rgba(C.red, 0.7)}` }}>
                <Glyph kind="x" color={C.white} size={38} />
              </div>
            )}
          </div>
        );
      })}

      {av > 0 && (
        <>
          <LiveWave f={loopF} cue="m1" cx={540} cy={760} width={1000} height={300} color={C.red} jag opacity={0.35 * av} bars={50} idle={0.15} />
          <div
            style={{
              position: "absolute",
              left: 540 - 180,
              top: 760 - 180,
              width: 360,
              height: 360,
              borderRadius: 180,
              background: "radial-gradient(circle at 50% 40%, #1A0E14 0%, #07080D 70%)",
              border: `5px solid ${C.red}`,
              boxShadow: `0 0 ${60 + 120 * flare}px ${rgba(C.red, 0.55 + 0.4 * flare)}, inset 0 0 50px ${rgba(C.red, 0.35)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${av * (1 + 0.08 * flare)}) translateX(${gl ? (random(`ax${f}`) - 0.5) * 22 : 0}px)`,
            }}
          >
            <div
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: 230,
                color: C.white,
                textShadow: gl ? `9px 0 ${rgba(C.red, 0.9)}, -9px 0 ${rgba(C.cyan, 0.9)}` : `0 0 40px ${rgba(C.red, 0.6)}`,
                marginTop: -10,
              }}
            >
              ?
            </div>
          </div>
          <HudTag f={f} at={w(16)} x={540} y={1010} align="center" color={C.red} title="Арғы жақта — ?" sub="дауыс: 100% · адам: белгісіз" icon="!" />
        </>
      )}
    </AbsoluteFill>
  );
};
