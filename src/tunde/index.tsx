import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../qagaz/theme";
import { Defs } from "../qagaz2/art";
import { AUDIO, DURATION, FOOTAGE, FPS, SHOTS, cs, sec, shotAt, shotStart } from "./timeline";
import { Captions, Counter, FinalCard } from "./captions";
import { Footage, Static, TDefs } from "./fx";
import { Sound } from "./sound";
import { SCENES } from "./scenes";

const VOICES = ["h1", "n1", "n2", "m1", "n3", "n4", "n5", "d1", "a1", "n6", "a2", "n7", "t1", "n8"];
const FADE_IN = new Set(["sc14"]); // утро — из темноты
const FOOT_T0: Record<string, number> = { sc01a: 47, sc08b: 47 }; // одна и та же запись (таймкод)

// «Түнде мектеп» — страшная история из школьной серии
export const Tunde: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const lf = f - shot.from;
  const len = shot.to - shot.from;
  const Scene = SCENES[shot.id];
  const foot = FOOTAGE.has(shot.id);
  // помехи на входе/выходе записи и внутри бега
  const idx = SHOTS.indexOf(shot);
  const prevFoot = idx > 0 && FOOTAGE.has(SHOTS[idx - 1].id);
  const nextFoot = idx + 1 < SHOTS.length && FOOTAGE.has(SHOTS[idx + 1].id);
  let st = 0;
  if (foot !== prevFoot && idx > 0) st = Math.max(st, interpolate(lf, [0, 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  if (foot !== nextFoot && idx + 1 < SHOTS.length) st = Math.max(st, interpolate(lf, [len - 5, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  if (shot.id === "sc09" && (lf % 11 < 2 || (lf > 16 && lf < 19))) st = Math.max(st, 0.75);
  const fadeIn = FADE_IN.has(shot.id) ? interpolate(lf, [0, 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const t0 = shot.id === "sc01b" ? FOOT_T0.sc01a + (shotStart("sc01b") - shotStart("sc01a")) / FPS : shot.id === "sc09" ? FOOT_T0.sc08b + (shotStart("sc09") - shotStart("sc08b")) / FPS : FOOT_T0[shot.id] ?? 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs />
        <TDefs />
        {Scene ? <Scene lf={lf} len={len} /> : null}
        <rect width={W} height={H} fill="url(#tn-vig)" />
      </svg>
      {foot ? <Footage f={f} t={t0 + lf / FPS} clock="00:00" shake={shot.id === "sc09" ? 3 : 1} /> : null}
      <Static f={f} k={st} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn, pointerEvents: "none" }} />
      <Counter f={f} />
      <Captions f={f} />
      <FinalCard f={f} />
      {VOICES.map((id) => (
        <Sequence key={id} from={cs(id)} durationInFrames={sec(AUDIO[id].duration) + 6}>
          <Audio src={staticFile(AUDIO[id].file)} />
        </Sequence>
      ))}
      <Sound />
    </AbsoluteFill>
  );
};

export const TundeComposition: React.FC = () => <Composition id="Tunde" component={Tunde} durationInFrames={DURATION} fps={FPS} width={W} height={H} />;
