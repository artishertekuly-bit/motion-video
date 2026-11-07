import React from "react";
import { AbsoluteFill, Easing, random } from "remotion";
import { C, INTER, MONO, MONT } from "./theme";
import { ce, cs, END_CARD_F, SCENES, ws } from "./timeline";
import { BigLock, ChatHeader, Glyph, HudTag, Phone, TextBubble, VoiceBubble, lerp, p, rgba } from "./ui";
import { MomSilhouette } from "./door";

const COPY_BARS = Array.from({ length: 26 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

// S8 — вывод: голос копируется за секунды, кодовое слово — нет. Вопрос зрителю. Финальная карточка.
export const S8: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SCENES.s8;
  const w = (i: number) => ws("n9", i);
  const v = (i: number) => ws("n10", i);

  if (f >= END_CARD_F) {
    const k = f - END_CARD_F;
    const t1 = p(k, 2, 10, Easing.out(Easing.back(1.3)));
    const t2 = p(k, 7, 10, Easing.out(Easing.back(1.3)));
    const t3 = p(k, 16, 10);
    const t4 = p(k, 24, 10);
    return (
      <AbsoluteFill style={{ background: "#030407" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: p(k, 0, 8) }}>
          <Glyph kind="lock" color={C.red} size={110} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 108, color: C.white, transform: `scale(${t1})`, opacity: t1, lineHeight: 1 }}>ОТБАСЫЛЫҚ</div>
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 138,
              color: C.red,
              textShadow: `0 0 50px ${rgba(C.red, 0.6)}`,
              transform: `scale(${t2})`,
              opacity: t2,
              lineHeight: 1.05,
              marginTop: 8,
            }}
          >
            ҚҰПИЯ СӨЗ
          </div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 44, color: "rgba(255,255,255,0.88)", marginTop: 46, opacity: t3 }}>
            Бүгін отбасыңызбен келісіп алыңыз
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 25, letterSpacing: "0.14em", color: C.red, marginTop: 26, opacity: t4 }}>
            ҚҰПИЯ СӨЗДІ ЕШКІМГЕ ЖАЗБАҢЫЗ
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // c–d) «завтра вашим голосом…»
  if (f >= v(0) - 3) {
    const k = p(f, v(0) - 3, 10);
    const dim = p(f, v(7), 12);
    const len = Math.max(1, ce("m1") - cs("m1"));
    const loopF = cs("m1") + ((f - v(0)) % len);
    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 380,
            textAlign: "center",
            fontFamily: MONT,
            fontWeight: 900,
            fontSize: 820,
            color: C.amber,
            opacity: 0.04 + 0.1 * dim,
            lineHeight: 1,
          }}
        >
          ?
        </div>
        <Phone y={290} glow={C.amber} glowAmt={0.8} opacity={k * lerp(1, 0.22, dim)} scale={lerp(0.96, 1, k) * lerp(1, 0.94, dim)} clock="??:??">
          <ChatHeader avatar="Б" name="Балам" sub="желіде" subColor={C.green} ring={C.green} />
          <div style={{ position: "absolute", top: 214, left: 28 }}>
            <div style={{ fontFamily: MONO, fontSize: 19, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 14 }}>ЕРТЕҢ</div>
            <div style={{ opacity: p(f, v(1), 6) }}>
              <VoiceBubble f={loopF} cue="m1" fake label="0:05" />
            </div>
          </div>
          <div style={{ position: "absolute", top: 410, left: 28, opacity: p(f, v(4), 8) }}>
            <TextBubble text="Анашым, тез ақша жібер!" color="rgba(255,59,71,0.16)" />
          </div>
        </Phone>
        <HudTag f={f} at={v(2)} out={v(7) + 4} x={540} y={1110} align="center" color={C.amber} title="Сіздің дауысыңыз?" sub="ертең · ??:??" icon="?" />
      </AbsoluteFill>
    );
  }

  // a–b) сторис → копия голоса → замок
  const story = 1 - p(f, w(8) - 2, 10);
  const scan = p(f, w(5) - 3, 12, Easing.linear);
  const copyOut = p(f, w(6), 12, Easing.out(Easing.cubic));
  const rush = p(f, w(11), Math.max(6, w(13) - w(11)), Easing.in(Easing.cubic));
  const hit = f >= w(13);
  const shatter = hit ? p(f, w(13), 22, Easing.out(Easing.cubic)) : 0;
  const lockOn = p(f, w(9) - 2, 14);
  const copyCx = lerp(lerp(290, 760, copyOut), 650, rush);
  const sticker = f >= w(3) ? 1 + 0.15 * Math.exp(-(f - w(3)) / 6) : 1;

  return (
    <AbsoluteFill>
      {story > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: story, transform: `translateX(${(1 - story) * -200}px)` }}>
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 370,
              width: 360,
              height: 640,
              borderRadius: 30,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.16)",
              background: "linear-gradient(180deg,#3A2418 0%,#1C120D 60%,#0D0907 100%)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              opacity: p(f, a, 8),
            }}
          >
            <div style={{ position: "absolute", left: 14, right: 14, top: 14, display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
                  <div style={{ width: i === 0 ? `${p(f, a, 90, Easing.linear) * 100}%` : "0%", height: "100%", background: "#fff" }} />
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 18, top: 34, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: rgba(C.warm, 0.5), border: "2px solid #fff" }} />
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 22, color: "#fff" }}>анам</div>
              <div style={{ fontFamily: INTER, fontSize: 18, color: "rgba(255,255,255,0.6)" }}>2 сағ</div>
            </div>
            <div style={{ position: "absolute", left: -70, top: 40, width: 500, height: 940, transform: "scale(0.62)", transformOrigin: "250px 300px" }}>
              <MomSilhouette f={f} appear={1} />
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 40,
                transform: `translateX(-50%) scale(${sticker})`,
                padding: "8px 20px",
                borderRadius: 30,
                background: f >= w(3) ? C.amber : "rgba(0,0,0,0.6)",
                color: f >= w(3) ? "#111" : "#fff",
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: 30,
              }}
            >
              ▶ 0:03
            </div>
            {scan > 0 && scan < 1 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 6, background: C.red, boxShadow: `0 0 30px 8px ${rgba(C.red, 0.6)}` }} />
            )}
          </div>
        </div>
      )}

      {/* копия голоса */}
      {copyOut > 0 && shatter < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {COPY_BARS.map((h, i) => {
            const x0 = copyCx - 13 * 15 + i * 15;
            const hh = h * 200 * (0.7 + 0.5 * random(`cb${f}${i}`));
            const ang = random(`sa${i}`) * Math.PI * 2;
            const dx = Math.cos(ang) * 420 * shatter;
            const dy = Math.sin(ang) * 420 * shatter;
            return (
              <g key={i} opacity={(1 - shatter) * copyOut}>
                <rect x={x0 + dx - 4} y={720 - hh / 2 + dy} width={8} height={hh} rx={4} fill={C.cyan} opacity={0.45} />
                <rect x={x0 + dx + 4} y={720 - hh / 2 + dy} width={8} height={hh} rx={4} fill="#FF00AA" opacity={0.45} />
                <rect x={x0 + dx} y={720 - hh / 2 + dy} width={8} height={hh} rx={4} fill={C.red} />
              </g>
            );
          })}
        </svg>
      )}
      <HudTag f={f} at={w(6) + 4} out={w(8) - 2} x={760} y={880} align="center" color={C.red} title="Көшірме" sub="жи · бірнеше секундтан" icon="!" titleSize={28} />

      {lockOn > 0 && (
        <>
          <BigLock cx={400} cy={720} draw={lockOn} fill={lockOn} color={C.amber} scale={0.75} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <circle cx={400} cy={720} r={230} fill="none" stroke={C.amber} strokeWidth={hit ? 8 : 3} opacity={hit ? 1 - shatter * 0.6 : 0.5 * lockOn} style={{ filter: `drop-shadow(0 0 ${hit ? 30 : 8}px ${C.amber})` }} />
          </svg>
          <HudTag f={f} at={w(13)} x={540} y={1060} align="center" color={C.green} title="Құпия сөз" sub="көшірілмейді" icon="lock" />
        </>
      )}
    </AbsoluteFill>
  );
};

