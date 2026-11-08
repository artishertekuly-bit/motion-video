import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, DURATION, FPS, WIPES, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;
const W = (id: string, i: number) => ws(id, i) / FPS;

const EVENTS: Ev[] = [
  // ночь
  { id: "s-tick", at: 0, len: B.sc03a, fade: 0.5, loop: true },
  { id: "s-scribble", at: B.sc02, len: B.sc03a - B.sc02, fade: 0.3, loop: true },
  { id: "s-music", at: B.sc02 - 0.3, len: B.sc04a - B.sc02 + 0.3, fadeIn: 0.8, fade: 0.8, loop: true },
  { id: "s-stamp", at: W("n1", 7) - 0.05, vol: 0.55 },
  ...["sc03a", "sc03b", "sc03c", "sc03d"].map((k) => ({ id: "s-pop", at: B[k] + 0.03, vol: 1 })),
  // утро, класс
  { id: "s-bell", at: B.sc04a, vol: 0.85, len: 2.4, fade: 0.8 },
  { id: "s-door", at: B.sc04a + 0.3, vol: 0.9 },
  { id: "s-steps", at: B.sc04a + 0.7, vol: 0.9 },
  { id: "s-room", at: B.sc04a, len: B.sc11a - B.sc04a + 0.5, fadeIn: 1, fade: 1, loop: true },
  { id: "s-whoosh", at: B.sc04b + 0.1, vol: 0.8 },
  { id: "s-whoosh", at: B.sc04b + 1.5, vol: 0.7 },
  { id: "s-stamp", at: W("n3", 7) - 0.05, vol: 0.5 },
  { id: "s-pop", at: B.sc05a + 12 / FPS, vol: 0.9 },
  { id: "s-pop", at: B.sc05a + 22 / FPS, vol: 0.9 },
  // напряжение на экзамене
  { id: "s-tick", at: B.sc05b, len: B.sc08a - B.sc05b, fade: 0.4, loop: true, vol: 0.8 },
  { id: "s-heart", at: B.sc06a, len: B.sc08a - B.sc06a, fadeIn: 0.8, fade: 0.6, loop: true },
  { id: "s-music", at: B.sc06a, len: B.sc07 - B.sc06a, fadeIn: 0.6, fade: 0.4, loop: true, vol: 0.7 },
  { id: "s-whoosh", at: W("n4", 5) - 0.1, vol: 0.9 },
  { id: "s-whoosh", at: W("n4", 9) - 0.1, vol: 0.9 },
  { id: "s-boing", at: W("n4", 15) - 0.1, vol: 0.8 },
  // озарение
  { id: "s-riser", at: W("n5", 5) - 1.8, vol: 0.6 },
  { id: "s-ping", at: W("n5", 5), vol: 0.9 },
  { id: "s-ping", at: W("b2", 2) - 0.05, vol: 1 },
  { id: "s-stamp", at: W("b2", 2) - 0.05, vol: 0.5 },
  { id: "s-scribble", at: B.sc09a, len: B.sc09b - B.sc09a, fade: 0.3, loop: true },
  { id: "s-music", at: B.sc09a, len: END - B.sc09a, fadeIn: 1, fade: 2.5, loop: true, vol: 0.9 },
  // финал
  { id: "s-paper", at: B.sc10a + (B.sc10b - B.sc10a) * 0.55, vol: 0.7, len: 1.2, fade: 0.4 },
  { id: "s-boing", at: B.sc10b + 12 / FPS, vol: 0.9 },
  { id: "s-scribble", at: B.sc10c, len: B.sc11a - B.sc10c, vol: 0.6, fade: 0.3 },
  { id: "s-paper", at: B.sc11b, vol: 0.7, len: 1.6, fade: 0.5 },
  { id: "s-scribble", at: B.sc12 + 0.45, len: 1.6, vol: 0.8, fade: 0.3 },
  { id: "s-stamp", at: B.sc12 + 1.6, vol: 0.55 },
  ...WIPES.map((c) => ({ id: "s-whoosh", at: c / FPS - 0.35, vol: 0.8 })),
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
