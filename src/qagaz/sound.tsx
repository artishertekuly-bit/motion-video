import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND, COLLIDE, DURATION, FPS, WIPES, sec } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;

// Звуковые события (секунды). vol — относительная громкость, len — обрезать до, fade — затухание в конце (с)
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const B = BOUND;
const END = DURATION / FPS;

const EVENTS: Ev[] = [
  { id: "q-bell", at: 0.05, vol: 1, fade: 0.6 }, // звонок на крючке
  { id: "q-crowd", at: B.sh02 - 0.3, vol: 1, len: B.sh05 - B.sh02 + 0.8, fadeIn: 0.3, fade: 1.2 },
  { id: "q-bell", at: B.sh03, vol: 0.8, len: B.sh04 - B.sh03 + 0.3, fade: 0.3 }, // звонок крупно
  { id: "q-steps-fast", at: B.sh04, vol: 0.9, len: B.sh05 - B.sh04 + 0.4, fade: 0.3 },
  { id: "q-collide", at: COLLIDE - 0.18, vol: 1.1 },
  { id: "q-papers-settle", at: B.sh06, vol: 0.9 },
  { id: "q-run-away", at: B.sh07 + 0.35, vol: 0.85 },
  { id: "q-door-close", at: B.sh08 + 0.7, vol: 0.9 },
  { id: "q-steps-calm", at: B.sh09, vol: 0.9 },
  { id: "q-gather", at: B.sh09 + 0.2, vol: 0.55, len: B.sh11 - B.sh09, fade: 0.6 },
  // тихий коридор после звонка — до конца
  { id: "q-room", at: B.sh08, vol: 1, len: END - B.sh08, fadeIn: 1.0, fade: 1.5, loop: true },
  // мягкий фон-подложка под разговор мастера
  { id: "q-pad", at: B.sh13 - 0.5, vol: 1, len: B.sh25 + 3.5 - (B.sh13 - 0.5), fadeIn: 2.5, fade: 2.5, loop: true },
  { id: "q-burst", at: B.sh19b - 0.05, vol: 1 },
  { id: "q-door-close", at: B.sh24 + 2.3, vol: 0.7 },
  ...WIPES.map((c) => ({ id: "q-whoosh", at: c / FPS - 0.35, vol: 0.9 })),
];

const Ev: React.FC<{ e: Ev }> = ({ e }) => {
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
      <Ev key={i} e={e} />
    ))}
  </>
);
