import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, H, OSW, W } from "../qagaz/theme";
import { Dust, PaperWipe, PapersToCamera } from "../qagaz/papers";
import { Defs } from "../qagaz2/art";
import { AUDIO, DURATION, FPS, WIPES, cs, sec, shotAt, shotStart } from "./timeline";
import { BigWords, Captions } from "./captions";
import { Sound } from "./sound";
import { HookScene, SCENES } from "./scenes";

const VOICES = ["n1", "n2", "n3", "t1", "n4", "b1", "n5", "b2", "n6", "t2", "n7"];
const HOOK_END = shotStart("sc02");
const NO_DUST = new Set(["sc01", "sc04b", "sc09b", "sc11b", "sc12", "sc05b"]);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    <Defs />
    {children}
  </svg>
);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Крючок: полоса-кадр (ночь, лампа), заголовок «ЕРТЕҢ — ЕМТИХАН», листки вылетают из полосы
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const open = ease(interpolate(t, [2.0, 2.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const bandH = interpolate(open, [0, 1], [680, H]);
  const top = (H - bandH) / 2 - interpolate(open, [0, 1], [70, 0]);
  const bottom = H - top - bandH;
  const ty = interpolate(open, [0, 1], [-250, 0]);
  const word = (at: number) => {
    const k = interpolate(t, [at, at + 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: k * (1 - open), transform: `scale(${1.25 - 0.25 * k})` };
  };
  const st: React.CSSProperties = {
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
            <HookScene lf={f} len={sec(3.1)} />
            <rect width={W} height={H} fill="url(#vign)" />
          </Svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingRight: 40, gap: 4, transform: "translateY(-550px)" }}>
        <div style={{ ...st, ...word(0.12) }}>ЕРТЕҢ —</div>
        <div style={{ ...st, color: C.amber, ...word(0.55) }}>ЕМТИХАН</div>
      </AbsoluteFill>
      <PapersToCamera f={f} t0={0.9} n={8} cx={W / 2 - 40} cy={H / 2 + 60} />
    </AbsoluteFill>
  );
};

export const Shpor: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const lf = f - shot.from;
  const len = shot.to - shot.from;
  const Scene = SCENES[shot.id];
  const fadeEnd = interpolate(f, [DURATION - 20, DURATION - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < HOOK_END && shot.id === "sc01" ? (
        <Hook f={f} />
      ) : (
        <AbsoluteFill>
          <Svg>
            {Scene ? <Scene lf={lf} len={len} /> : null}
            <rect width={W} height={H} fill="url(#vign)" />
          </Svg>
        </AbsoluteFill>
      )}
      {!NO_DUST.has(shot.id) ? <Dust f={f} n={26} opacity={0.6} /> : null}
      {WIPES.map((c) => (
        <PaperWipe key={c} f={f} cut={c} />
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

export const ShporComposition: React.FC = () => (
  <Composition id="Shpor" component={Shpor} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
