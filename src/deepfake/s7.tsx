import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C } from "./theme";
import { ce, cs, SCENES, we, ws, FPS } from "./timeline";
import { ChatHeader, Glitch, HudTag, LiveWave, Phone, Stamp, TextBubble, TypingDots, VoiceBubble, Wire, lerp, p, rgba } from "./ui";
import { Door, DX, DY, MomSilhouette } from "./door";
import { along, Dot, FloorPlan, MOM_PATH, toAbs, YOU } from "./plan";

// S7 — входит настоящая мама; а «мама» в телефоне всё ещё пишет
export const S7: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SCENES.s7;
  const door = cs("door");
  const w = (i: number) => ws("n8", i);
  const planA = w(0) - 4;
  const splitA = w(4) - 2;
  const open = p(f, door + Math.round(0.15 * FPS), Math.round(1.1 * FPS), Easing.inOut(Easing.cubic));
  const appear = p(f, door + Math.round(0.5 * FPS), 14);

  // a) дверь открывается
  const doorShot = (
    <>
      <Door f={f} open={open} turn={1} leak={1} behind={<MomSilhouette f={f} appear={appear} />} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at 52% 55%, ${rgba(C.warm, 0.32 * open)} 0%, transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
    </>
  );

  if (f < planA) {
    const push = p(f, a, planA - a, Easing.inOut(Easing.cubic));
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${lerp(1.08, 1, push)})` }}>{doorShot}</AbsoluteFill>
        <LiveWave f={f} cue="m3" cx={DX + 250} cy={DY + 905} width={440} height={60} color={C.warm} bars={34} opacity={0.9} idle={0} />
        <Wire f={f} at={ws("m3", 0) + 6} from={[330, 470]} to={[DX + 270, DY + 300]} color={C.green} />
        <HudTag f={f} at={ws("m3", 0) + 2} x={70} y={392} color={C.green} title="Анаңыз" sub="нағыз · аман-есен" icon="ok" titleSize={30} />
        <Wire f={f} at={ws("m3", 2)} from={[880, 1000]} to={[DX + 360, DY + 480]} color={C.amber} />
        <HudTag f={f} at={ws("m3", 2) - 4} x={930} y={1000} align="right" color={C.amber} title="Қызғалдақ" sub="сүйікті гүлі ✓" icon="ok" titleSize={28} />
      </AbsoluteFill>
    );
  }

  // b) план: мама идёт на кухню
  if (f < splitA) {
    const walk = p(f, planA + 4, Math.max(10, we("n8", 2) - planA), Easing.inOut(Easing.cubic));
    const [mx, my] = along(MOM_PATH, walk);
    const safe = f >= w(3);
    return (
      <AbsoluteFill>
        <FloorPlan f={f} drawAt={planA - 30} kitchen={1} warm={p(f, planA, 14)}>
          <Dot f={f} x={YOU[0]} y={YOU[1]} color={safe ? C.green : C.amber} at={planA - 20} label="СІЗ" labelDy={-34} />
          <Dot f={f} x={mx} y={my} color={C.green} at={planA} label="АНАҢЫЗ" />
          {safe && <circle cx={(YOU[0] + mx) / 2} cy={(YOU[1] + my) / 2} r={90 + 20 * Math.sin(f * 0.2)} fill="none" stroke={C.green} strokeWidth={4} opacity={0.6} />}
        </FloorPlan>
        <HudTag f={f} at={planA + 6} x={540} y={1110} align="center" color={C.green} title={safe ? "Аман-есен" : "Үйде: 2 адам"} sub="21:34 · асүй" icon="ok" />
        <Wire f={f} at={w(3)} from={[540, 1110]} to={toAbs(YOU[0] + 20, YOU[1] + 10)} color={C.green} dot={false} />
      </AbsoluteFill>
    );
  }

  // c–d) раздельный экран
  const sp = p(f, splitA, 10);
  const m4a = cs("m4");
  const stampAt = ws("m4", 5);
  const fakeHit = f >= stampAt;
  const glitchR = fakeHit ? Math.max(0, 1 - (f - stampAt) / 10) : f >= m4a && f < ce("m4") ? 0.15 : 0;
  return (
    <AbsoluteFill>
      {/* слева — мама в тёплом свете */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: 1080, transform: `translateX(${-250 + (1 - sp) * 250}px) scale(0.92)`, transformOrigin: "540px 760px" }}>
          {doorShot}
        </div>
      </div>
      {/* справа — телефон */}
      <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, overflow: "hidden", background: "rgba(5,6,10,0.75)" }}>
        <Glitch f={f} amount={glitchR} id="g7">
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-270 + (1 - sp) * 200}px)` }}>
            <Phone x={540} y={290} glow={C.red} glowAmt={0.9} scale={0.78} clock="21:34">
              <ChatHeader avatar="?" name="+7 708 ••• 41 17" sub="жазып жатыр…" subColor={C.amber} ring={C.red} glitch={glitchR} f={f} />
              <div style={{ position: "absolute", top: 214, left: 28 }}>
                <VoiceBubble f={f} cue="m2" fake />
              </div>
              <div style={{ position: "absolute", top: 370, right: 28 }}>
                <TextBubble text="Анамның сүйікті гүлі қандай?" out />
              </div>
              <div style={{ position: "absolute", top: 520, left: 28 }}>
                {f < m4a - 6 ? (
                  <TypingDots f={f} />
                ) : (
                  <div style={{ opacity: p(f, m4a - 6, 6) }}>
                    <VoiceBubble f={f} cue="m4" fake />
                  </div>
                )}
              </div>
            </Phone>
          </div>
        </Glitch>
      </div>
      {/* разделитель */}
      <div
        style={{
          position: "absolute",
          left: 538,
          top: 0,
          width: 4,
          height: 1920,
          background: "rgba(255,255,255,0.75)",
          boxShadow: `0 0 20px ${rgba(C.white, 0.6)}`,
          transform: `scaleY(${sp})`,
        }}
      />
      <HudTag f={f} at={splitA + 4} x={40} y={300} color={C.green} title="Нағыз ана" sub="асүйде · қасыңызда" icon="ok" titleSize={26} />
      <HudTag f={f} at={splitA + 8} x={1040} y={300} align="right" color={C.red} title="Телефондағы «ана»" sub="бейтаныс нөмір" icon="!" titleSize={26} />
      <Stamp f={f} at={stampAt} text="ДИПФЕЙК" color={C.red} x={810} y={760} rot={-10} size={66} />
      <HudTag f={f} at={stampAt + 6} x={810} y={1130} align="center" color={C.red} title="ЖИ · дауыс көшірмесі" sub="адам емес" icon="!" titleSize={24} />
    </AbsoluteFill>
  );
};
