import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, DURATION, FPS, START as S, WIPES, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;
const W = (id: string, i: number) => ws(id, i) / FPS;

const EVENTS: Ev[] = [
  // вечер: бег, телефон, «кейін»
  { id: "s-room", at: 0, len: B.sc06a, fadeIn: 0.3, fade: 0.6, loop: true },
  { id: "s-steps", at: 0.0, len: 1.15, vol: 0.55, fade: 0.25 },
  { id: "s-notify", at: 1.6, vol: 0.45 },
  { id: "s-stamp", at: W("d1", 0) - 0.05, vol: 0.7 },
  { id: "k-piano", at: S.d1 + 0.5, len: B.sc07b + 0.6 - (S.d1 + 0.5), fadeIn: 1.5, fade: 1.6, loop: true },
  { id: "s-notify", at: B.sc02 + 2.4, vol: 0.35 },
  // утро
  { id: "s-door", at: B.sc04 - 0.45, vol: 0.6 },
  { id: "s-stamp", at: W("d2", 0) - 0.05, vol: 0.55 },
  // ночь
  { id: "s-typing", at: B.sc04, len: B.sc05 - B.sc04, fadeIn: 0.3, fade: 0.4, loop: true, vol: 0.8 },
  { id: "s-stamp", at: W("d3", 1) - 0.05, vol: 0.4 },
  { id: "k-fold", at: B.sc05 + 0.45, vol: 0.9 },
  { id: "s-whoosh", at: B.sc05 + 1.9, vol: 0.35 },
  // день: офис и звонок
  ...WIPES.map((c) => ({ id: "s-whoosh", at: c / FPS - 0.35, vol: 0.75 })),
  { id: "s-tick", at: B.sc06a, len: B.sc07a - B.sc06a, fadeIn: 0.3, fade: 0.3, loop: true, vol: 0.7 },
  { id: "s-vibrate", at: B.sc06a + 0.15, vol: 0.9 },
  { id: "s-vibrate", at: B.sc06a + 1.6, vol: 0.8 },
  // школа
  { id: "s-steps", at: B.sc07a, len: B.sc07b - B.sc07a + 0.2, vol: 0.9, fade: 0.25 },
  { id: "s-crowd", at: B.sc07a, len: B.sc10a - B.sc07a, fadeIn: 0.4, fade: 1.0, loop: true, vol: 0.55 },
  { id: "k-shutter", at: B.sc07b + 1.9, vol: 1 },
  { id: "s-heart", at: B.sc07c, len: B.sc07d + 1.6 - B.sc07c, fadeIn: 0.4, fade: 0.8, loop: true },
  { id: "s-ping", at: W("d4", 2) - 0.05, vol: 0.45 },
  { id: "k-hope", at: S.d4 + 0.5, len: END - (S.d4 + 0.5), fadeIn: 1.8, fade: 2.8, loop: true },
  // вечер дома
  { id: "s-notify", at: B.sc10a + 0.95, vol: 0.3 },
  { id: "s-notify", at: B.sc10a + 1.55, vol: 0.25 },
  { id: "s-notify", at: B.sc10a + 2.1, vol: 0.2 },
  { id: "k-crayon", at: B.sc10b, len: B.sc11 - B.sc10b + 0.3, fade: 0.3, loop: true, vol: 0.7 },
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
