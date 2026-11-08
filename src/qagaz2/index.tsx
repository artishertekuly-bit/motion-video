import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, H, OSW, W } from "../qagaz/theme";
import { AUDIO, COLLIDE, DURATION, FLASHES, FPS, WIPES, cs, sec, shotAt, shotStart } from "../qagaz/timeline";
import { Dust, Flash, PaperBurst, PaperFall, PapersToCamera, PaperWipe } from "../qagaz/papers";
import { BigWords, Captions } from "../qagaz/captions";
import { Sound } from "../qagaz/sound";
import { Defs } from "./art";
import { HookScene, SCENES } from "./scenes";

const VOICES = ["s1", "m1", "j1", "m2", "m3", "m4", "m5", "m6", "j2", "m7", "m8", "j3"];
const HOOK_END = shotStart("sh02");

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    <Defs />
    {children}
  </svg>
);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Крючок: полоса-кадр на чёрном, заголовок сверху, листы вылетают из полосы
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const open = ease(interpolate(t, [1.75, 2.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const bandH = interpolate(open, [0, 1], [680, H]);
  const top = (H - bandH) / 2 - interpolate(open, [0, 1], [70, 0]);
  const bottom = H - top - bandH;
  const ty = interpolate(open, [0, 1], [-330, 0]);
  const word = (at: number) => {
    const k = interpolate(t, [at, at + 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: k * (1 - open), transform: `scale(${1.25 - 0.25 * k})` };
  };
  const titleStyle: React.CSSProperties = {
    fontFamily: OSW,
    fontWeight: 700,
    fontSize: 140,
    lineHeight: 1,
    color: C.white,
    letterSpacing: 2,
    textShadow: "0 6px 28px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)",
    whiteSpace: "nowrap",
  };
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <AbsoluteFill style={{ clipPath: `inset(${top}px 0px ${bottom}px 0px)` }}>
        <AbsoluteFill style={{ transform: `translateY(${ty}px)` }}>
          <Svg>
            <HookScene lf={f} len={HOOK_END} f={f} />
          </Svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingRight: 40, gap: 4, transform: "translateY(-550px)" }}>
        <div style={{ ...titleStyle, ...word(0.12) }}>ҚАҒАЗ ПА,</div>
        <div style={{ ...titleStyle, color: C.amber, ...word(0.6) }}>ОҚУШЫ МА?</div>
      </AbsoluteFill>
      <PapersToCamera f={f} t0={0.55} n={11} cx={W / 2 - 20} cy={H / 2 + 40} />
    </AbsoluteFill>
  );
};

const LOOK: Record<string, string> = {
  sh14a: "sepia(0.4) saturate(0.8)",
  sh19a: "grayscale(0.85) sepia(0.25) contrast(1.05) brightness(0.85)",
};
const DARK = new Set(["sh11b", "sh16", "sh18b", "sh19b", "sh22"]);

export const Qagaz2: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const lf = f - shot.from;
  const len = shot.to - shot.from;
  const Scene = SCENES[shot.id];
  const sh06 = shotStart("sh06");
  const sh07 = shotStart("sh07");
  const sh19b = shotStart("sh19b");
  const sh20 = shotStart("sh20");
  const fadeEnd = interpolate(f, [DURATION - 24, DURATION - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < HOOK_END ? (
        <Hook f={f} />
      ) : (
        <AbsoluteFill style={{ filter: LOOK[shot.id] }}>
          <Svg>
            {Scene ? <Scene lf={lf} len={len} f={f} /> : null}
            <rect width={W} height={H} fill="url(#vign)" />
          </Svg>
        </AbsoluteFill>
      )}
      {f >= HOOK_END && !DARK.has(shot.id) ? <Dust f={f} opacity={LOOK[shot.id] ? 0.4 : 0.9} /> : null}

      {/* столкновение: стопка взрывается и листы долетают в следующем плане */}
      {f >= sec(COLLIDE) - 1 && f < sh07 ? <PaperBurst f={f} t0={COLLIDE} x={420} y={1180} n={20} seed="hit2" /> : null}
      {f >= sh06 && f < sh07 ? <PaperFall f={f} t0={sh06 / FPS} /> : null}
      {/* «шашылады»: кирпичи уважения превращаются в листы */}
      {f >= sh19b && f < sh20 ? <PaperBurst f={f} t0={sh19b / FPS + 0.05} x={800} y={1400} n={26} power={1.3} seed="sha2" life={2.6} /> : null}

      {WIPES.map((c) => (
        <PaperWipe key={c} f={f} cut={c} />
      ))}
      {FLASHES.map((a) => (
        <Flash key={a} f={f} at={a} />
      ))}

      <BigWords f={f} />
      <Captions f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeEnd, pointerEvents: "none" }} />

      {VOICES.map((id) => (
        <Sequence key={id} from={cs(id)} durationInFrames={sec(AUDIO[id].duration) + 6}>
          <Audio src={staticFile(AUDIO[id].file)} />
        </Sequence>
      ))}
      <Sound />
    </AbsoluteFill>
  );
};

export const Qagaz2Composition: React.FC = () => (
  <Composition id="Qagaz2" component={Qagaz2} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
