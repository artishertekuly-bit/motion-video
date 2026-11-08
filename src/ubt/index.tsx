import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../qagaz/theme";
import { Defs } from "../qagaz2/art";
import { AUDIO, DURATION, FPS, cs, sec, shotAt } from "./timeline";
import { BigWords, Captions } from "./captions";
import { Big30, Hud, VoteCard } from "./hud";
import { Sound } from "./sound";
import { SCENES } from "./scenes";

const VOICES = ["n1", "n2", "n3", "n4", "a1", "n5", "n6", "n7", "n8", "m1", "e1", "n9", "n10", "n11", "n12", "n13"];

// «30 КҮН: ЕРАСЫЛ ҰБТ-ға» — 1-күн
export const Ubt1: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const lf = f - shot.from;
  const len = shot.to - shot.from;
  const Scene = SCENES[shot.id];
  // лёгкий «толчок» камеры на каждой склейке
  const punch = shot.from > 0 ? 1 + 0.045 * Math.pow(1 - Math.min(1, lf / 6), 2) : 1;
  const flash = shot.from > 0 ? interpolate(lf, [0, 3], [0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const fadeEnd = interpolate(f, [DURATION - 18, DURATION - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <Defs />
          {Scene ? <Scene lf={lf} len={len} /> : null}
          <rect width={W} height={H} fill="url(#vign)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />
      <Big30 f={f} />
      <Hud f={f} />
      <VoteCard f={f} />
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

export const Ubt1Composition: React.FC = () => <Composition id="Ubt1" component={Ubt1} durationInFrames={DURATION} fps={FPS} width={W} height={H} />;
