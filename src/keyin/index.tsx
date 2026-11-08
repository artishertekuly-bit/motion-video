import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../qagaz/theme";
import { PaperWipe } from "../qagaz/papers";
import { Defs } from "../qagaz2/art";
import { AUDIO, DURATION, FPS, WIPES, cs, sec, shotAt } from "./timeline";
import { BigWords, Captions, FinalCard } from "./captions";
import { KDefs } from "./props";
import { Sound } from "./sound";
import { SCENES } from "./scenes";

const VOICES = ["b1", "d1", "n1", "b2", "d2", "b3", "d3", "n2", "n3", "t1", "b4", "d4", "n4", "n5"];
const SOFT = new Set(["sc07c", "sc07d", "sc09", "sc10a", "sc10b", "sc11"]); // эмоциональные склейки — без «толчка»

// «Кейін» — семейная история из школьной серии
export const Keyin: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const lf = f - shot.from;
  const len = shot.to - shot.from;
  const Scene = SCENES[shot.id];
  const hard = shot.from > 0 && !SOFT.has(shot.id);
  const punch = hard ? 1 + 0.035 * Math.pow(1 - Math.min(1, lf / 6), 2) : 1;
  const flash = hard ? interpolate(lf, [0, 3], [0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const dip = SOFT.has(shot.id) && shot.from > 0 ? interpolate(lf, [0, 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const fadeEnd = interpolate(f, [DURATION - 18, DURATION - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <Defs />
          <KDefs />
          {Scene ? <Scene lf={lf} len={len} /> : null}
          <rect width={W} height={H} fill="url(#vign)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: dip * 0.85, pointerEvents: "none" }} />
      {WIPES.map((c) => (
        <PaperWipe key={c} f={f} cut={c} />
      ))}
      <BigWords f={f} />
      <Captions f={f} />
      <FinalCard f={f} />
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

export const KeyinComposition: React.FC = () => <Composition id="Keyin" component={Keyin} durationInFrames={DURATION} fps={FPS} width={W} height={H} />;
