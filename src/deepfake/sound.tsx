import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { AUDIO, CUTS, DURATION, END_CARD_F, SCENES, cs, we, ws } from "./timeline";

const Snd: React.FC<{ at: number; src: string; vol: number | ((f: number) => number); dur?: number; loop?: boolean }> = ({ at, src, vol, dur, loop }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur} layout="none">
    <Html5Audio src={staticFile(src)} volume={vol} loop={loop} />
  </Sequence>
);

const sfx = (name: string) => `deepfake/sfx/sfx-${name}.mp3`;

export const Sound: React.FC = () => {
  const voices = ["m1", "n1", "m2", "n2", "n3", "n4", "ring", "n5", "n6", "key", "n7", "door", "m3", "n8", "m4", "n9", "n10"];
  const VOL: Record<string, number> = { ring: 0.6, key: 0.85, door: 0.6, m1: 0.95, m2: 0.95, m4: 0.95 };
  const sendAt = we("n6", 5) + 4;
  const drone = (f: number) => {
    const g = f; // кадр от начала ролика
    const base = 0.2;
    const warmDip = g >= cs("door") && g < SCENES.s8[0] ? 0.45 : 1;
    const fadeIn = interpolate(g, [0, 20], [0.4, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(g, [DURATION - 30, DURATION], [1, 0], { extrapolateLeft: "clamp" });
    return base * warmDip * fadeIn * fadeOut;
  };
  return (
    <>
      <Snd at={0} src={sfx("drone")} vol={drone} loop />
      {voices.map((id) =>
        AUDIO[id].file ? <Snd key={id} at={cs(id)} src={AUDIO[id].file as string} vol={VOL[id] ?? 1} /> : null,
      )}
      {/* вибрация, уведомления */}
      <Snd at={0} src={sfx("vibrate")} vol={0.55} />
      <Snd at={cs("m2") - 14} src={sfx("vibrate")} vol={0.45} />
      <Snd at={ws("n2", 0) - 4} src={sfx("notify")} vol={0.5} />
      {/* глитч на склейках */}
      {CUTS.map((c) => (
        <Snd key={c} at={c - 3} src={sfx("glitch")} vol={0.3} />
      ))}
      {/* удары */}
      {[ws("n1", 15), ws("n3", 7), ws("n3", 9), ws("n3", 14), ws("m4", 5), ws("n9", 13)].map((t, i) => (
        <Snd key={`st${i}`} at={t - 1} src={sfx("stamp")} vol={i === 0 ? 0.32 : 0.42} />
      ))}
      {/* сердце */}
      <Snd at={ws("n2", 4)} src={sfx("heartbeat")} vol={0.5} loop dur={SCENES.s4[0] + 12 - ws("n2", 4)} />
      <Snd at={sendAt} src={sfx("heartbeat")} vol={0.32} loop dur={cs("key") - sendAt} />
      {/* печать вопроса */}
      <Snd at={ws("n6", 2) - 2} src={sfx("typing")} vol={0.32} dur={we("n6", 5) - ws("n6", 2) + 4} />
      <Snd at={sendAt} src={sfx("whoosh")} vol={0.18} />
      {/* переходы */}
      <Snd at={SCENES.s5[0]} src={sfx("whoosh")} vol={0.28} />
      <Snd at={ws("n8", 0) - 4} src={sfx("whoosh")} vol={0.28} />
      <Snd at={ws("n8", 4) - 2} src={sfx("whoosh")} vol={0.28} />
      <Snd at={ws("n9", 6)} src={sfx("whoosh")} vol={0.32} />
      <Snd at={END_CARD_F - 60} src={sfx("riser")} vol={0.32} />
      <Snd at={END_CARD_F} src={sfx("stamp")} vol={0.4} />
    </>
  );
};
