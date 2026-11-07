import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { C, INTER, MONO, MONT } from "./theme";
import { cs, SCENES, ws, FPS } from "./timeline";
import { BigLock, CL, Glyph, HudTag, Phone, lerp, mixHex, p, rgba } from "./ui";

/** Форма кардиограммы на отрезке 0…1 */
const ecg = (t: number) => {
  const g = (c: number, w: number, h: number) => h * Math.exp(-((t - c) ** 2) / (2 * w * w));
  return g(0.16, 0.03, 0.12) - g(0.29, 0.012, 0.18) + g(0.32, 0.012, 1) - g(0.355, 0.014, 0.32) + g(0.58, 0.05, 0.22);
};

// S5 — правильный шаг: стоп, звонок маме на её номер, нет ответа → кодовое слово
export const S5: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SCENES.s5;
  const w = (i: number) => ws("n4", i);
  const v = (i: number) => ws("n5", i);
  const ring = cs("ring");
  const calm = p(f, w(2), Math.max(8, w(4) - w(2)), Easing.inOut(Easing.cubic));
  const ecgOut = p(f, w(4) - 2, 8);
  const bpm = Math.round(lerp(128, 84, calm));
  const col = mixHex(C.red, C.green, calm);

  // кардиограмма
  const period = lerp(230, 400, calm);
  const amp = lerp(190, 120, calm);
  let path = "";
  let phase = 0;
  for (let x = 0; x <= 1080; x += 4) {
    phase = (x + (f - a) * 15) / period;
    const y = 700 - ecg(phase - Math.floor(phase)) * amp * (1 - ecgOut);
    path += `${x === 0 ? "M" : "L"}${x},${y.toFixed(1)} `;
  }

  const pause = p(f, w(4), 8, Easing.out(Easing.back(1.8)));
  const phoneIn = p(f, w(5) - 2, 12);
  const phoneOut = p(f, v(2), 10, Easing.in(Easing.cubic));
  const unavailable = f >= ring + Math.round(2.7 * FPS);
  const ringsOn = f >= ring && !unavailable;
  const lockDraw = p(f, v(4) - 2, 18);
  const lockFill = p(f, v(6), 10);

  return (
    <AbsoluteFill>
      {f < w(5) + 4 && (
        <AbsoluteFill style={{ opacity: 1 - p(f, w(5) - 4, 8) }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - ecgOut * 0.6 }}>
            <defs>
              <linearGradient id="ecgfade" x1="0" x2="1">
                <stop offset="0" stopColor="#fff" stopOpacity={0} />
                <stop offset="0.25" stopColor="#fff" stopOpacity={1} />
              </linearGradient>
              <mask id="ecgmask">
                <rect width={1080} height={1920} fill="url(#ecgfade)" />
              </mask>
            </defs>
            <path d={path} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" mask="url(#ecgmask)" style={{ filter: `drop-shadow(0 0 12px ${col})` }} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: 1 - pause }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: rgba(col, 0.85) }}>ПУЛЬС</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: col, textShadow: `0 0 40px ${rgba(col, 0.5)}`, lineHeight: 1.05 }}>{bpm}</div>
          </div>
          {pause > 0 && (
            <div
              style={{
                position: "absolute",
                left: 540 - 150,
                top: 700 - 150,
                width: 300,
                height: 300,
                borderRadius: 150,
                border: `6px solid ${C.green}`,
                boxShadow: `0 0 60px ${rgba(C.green, 0.5)}, inset 0 0 40px ${rgba(C.green, 0.25)}`,
                background: "rgba(5,20,14,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 34,
                transform: `scale(${pause})`,
              }}
            >
              <div style={{ width: 34, height: 120, borderRadius: 8, background: C.green }} />
              <div style={{ width: 34, height: 120, borderRadius: 8, background: C.green }} />
            </div>
          )}
          <HudTag f={f} at={w(4) + 2} x={540} y={300} align="center" color={C.green} title="Дұрыс қадам №1" sub="тоқта · ойлан" icon="ok" />
        </AbsoluteFill>
      )}

      {phoneIn > 0 && phoneOut < 1 && (
        <Phone y={lerp(1300, 290, phoneIn) + phoneOut * 900} glow={unavailable ? "#8A93A6" : C.green} glowAmt={0.8} opacity={1 - phoneOut}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 210, height: 210 }}>
              {ringsOn &&
                [0, 1].map((i) => {
                  const t0 = ring + Math.round(i * 1.4 * FPS);
                  const ph = interpolate(f, [t0, t0 + 40], [0, 1], CL);
                  if (f < t0) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        inset: -ph * 130,
                        borderRadius: "50%",
                        border: `4px solid ${C.green}`,
                        opacity: (1 - ph) * 0.9,
                      }}
                    />
                  );
                })}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 105,
                  background: rgba(C.green, unavailable ? 0.06 : 0.16),
                  border: `4px solid ${unavailable ? "#5B6375" : C.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 96,
                  color: unavailable ? "#8A93A6" : C.white,
                }}
              >
                А
              </div>
              <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", right: -6, bottom: -4 }}>
                <path d="M12 21s-7.5-4.6-9.5-9.3C1 8.2 3.2 5 6.4 5c2 0 3.6 1.2 4.6 2.7C12 6.2 13.6 5 15.6 5 18.8 5 21 8.2 21.5 11.7 19.5 16.4 12 21 12 21z" fill={C.red} />
              </svg>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 56, color: C.white, marginTop: 40 }}>Анам</div>
            <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 25, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>ұялы · сақталған нөмір</div>
            <div
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: 32,
                marginTop: 46,
                color: unavailable ? "#FF8A92" : rgba(C.green, 0.95),
              }}
            >
              {unavailable ? "Абонент қолжетімсіз" : `Қоңырау шалынуда${".".repeat(1 + (Math.floor(f / 10) % 3))}`}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 90,
              width: 130,
              height: 130,
              marginLeft: -65,
              borderRadius: 65,
              background: C.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(135deg)",
            }}
          >
            <Glyph kind="phone" color={C.white} size={60} />
          </div>
        </Phone>
      )}
      <HudTag f={f} at={w(6)} out={v(0)} x={70} y={1110} color={C.green} title="Өз нөміріне" sub="анаңыздың сақталған нөмірі" icon="phone" titleSize={28} />
      <HudTag f={f} at={v(0)} out={v(2) + 4} x={70} y={1110} color={C.red} title="Жауап жоқ" sub="21:32 · қолжетімсіз" icon="x" titleSize={28} />

      {lockDraw > 0 && (
        <>
          <BigLock cx={540} cy={680} draw={lockDraw} fill={lockFill} color={C.amber} />
          <HudTag f={f} at={v(6)} x={540} y={1060} align="center" color={C.green} title="Дұрыс қадам №2" sub="отбасылық құпия сөз" icon="lock" />
        </>
      )}
    </AbsoluteFill>
  );
};
