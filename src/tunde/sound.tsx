import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { AUDIO, BOUND as B, DURATION, FPS, START as S, STEPS_AT, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;
const W = (id: string, i: number) => ws(id, i) / FPS;
const E = (id: string) => S[id] + AUDIO[id].duration;

const FLICK0 = E("n5") + 0.2; // начало мигания
const EVENTS: Ev[] = [
  // ночь в школе
  { id: "t-night", at: 0, len: B.sc14, fadeIn: 0.4, fade: 1.0, loop: true },
  { id: "t-bell", at: 0, len: 4.6, vol: 0.5, fade: 0.4 },
  { id: "t-static", at: B.sc02 - 0.22, vol: 0.85 },
  { id: "t-musicbox", at: B.sc02 + 0.2, len: B.sc08a + 0.4 - (B.sc02 + 0.2), fadeIn: 1.2, fade: 1.2, loop: true, vol: 0.95 },
  { id: "t-lock", at: W("n2", 6) - 0.1 },
  { id: "t-handle", at: W("n2", 7) + 0.55, vol: 0.55 },
  { id: "t-chalk", at: W("n3", 3), vol: 0.95 },
  { id: "t-steps", at: STEPS_AT() },
  // третье: звонок, мигание, темнота
  { id: "t-static", at: B.sc08b - 0.12, vol: 0.6 },
  { id: "t-bell", at: B.sc08b + 0.05, len: FLICK0 + 1.03 - (B.sc08b + 0.05), vol: 0.8, fade: 0.08 },
  { id: "t-flicker", at: FLICK0, vol: 0.95 },
  { id: "t-run", at: S.d1 + 0.12 },
  { id: "t-static", at: B.sc09 + 0.6, vol: 0.5 },
  { id: "t-static", at: B.sc10a - 0.14, vol: 0.8 },
  { id: "t-breath", at: B.sc10a, len: B.sc11 - B.sc10a, fade: 0.5, loop: true, vol: 0.9 },
  { id: "t-handle", at: B.sc10b + 0.25 },
  { id: "t-creak", at: B.sc10c },
  // задняя дверь
  { id: "t-wind", at: B.sc12a, len: B.sc14 - B.sc12a, fadeIn: 0.4, fade: 0.8, loop: true, vol: 0.85 },
  { id: "t-musicbox", at: B.sc13, len: B.sc14 - B.sc13, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.7 },
  { id: "t-lock", at: E("a2") + 1.12, vol: 0.55 },
  // утро
  { id: "t-morning", at: B.sc14, len: B.sc16 - B.sc14 + 0.2, fadeIn: 0.6, fade: 0.25, loop: true },
  { id: "t-sting", at: W("t1", 7) - 0.05, vol: 0.9 },
  { id: "t-click", at: B.sc17 + 1.0 },
  // финал
  { id: "t-musicbox", at: B.sc17 + 1.2, len: END - (B.sc17 + 1.2), fadeIn: 1.5, fade: 2.6, loop: true, vol: 0.95 },
  { id: "t-wind", at: B.sc18, len: END - B.sc18, fadeIn: 0.8, fade: 2.0, loop: true, vol: 0.6 },
];

const One: React.FC<{ e: Ev }> = ({ e }) => {
  const meta = SFX[e.id];
  if (!meta) return null;
  const lenSec = Math.min(e.len ?? meta.duration, e.loop ? Infinity : meta.duration, END - e.at);
  const len = Math.max(1, sec(lenSec));
  const fi = sec(e.fadeIn ?? 0);
  const fo = sec(e.fade ?? 0);
  const vol = e.vol ?? 1;
  return (
    <Sequence from={sec(e.at)} durationInFrames={len}>
      <Audio
        src={staticFile(meta.file)}
        loop={e.loop}
        volume={(f) => {
          let v = vol;
          if (fi > 0) v *= interpolate(f, [0, fi], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (fo > 0) v *= interpolate(f, [len - fo, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return v;
        }}
      />
    </Sequence>
  );
};

export const Sound: React.FC = () => (
  <>
    {EVENTS.map((e, i) => (
      <One key={i} e={e} />
    ))}
  </>
);
