import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, CARD_AT, TOTAL as DURATION, FPS, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;
const W = (id: string, i: number) => ws(id, i) / FPS;
const C0 = CARD_AT / FPS;

const EVENTS: Ev[] = [
  // 1. Chalk writing 100M vs 1₸ + gentle music
  { id: "x-chalk", at: 0, len: 1.0, fade: 0.15, vol: 1 },
  { id: "s-music", at: 0.5, len: C0 - 0.5, fadeIn: 1.2, fade: 0.8, loop: true, vol: 0.38 },

  // 2. Choice sparkle
  { id: "v-sparkle", at: W("t1", 5), vol: 0.6 },
  { id: "s-ping", at: W("t1", 16), vol: 0.6 },

  // 3. Nurlybek Gelik dream (sh02)
  { id: "s-whoosh", at: B.sh02 - 0.05, vol: 0.65 },
  { id: "s-boing", at: W("u1", 2), vol: 0.6 },
  { id: "x-laugh", at: W("u1", 8), len: 1.8, fade: 0.4, vol: 0.85 },

  // 4. Barys 1 Billion shock (sh03)
  { id: "s-stamp", at: W("t2", 4) - 0.05, vol: 0.9 },
  { id: "x-ooh", at: W("t2", 6), vol: 0.85 },

  // 5. Nurlybek shock (sh04)
  { id: "s-boing", at: B.sh04 + 0.05, vol: 0.65 },
  { id: "s-pop", at: W("u2", 3), vol: 0.6 },

  // 6. Board table 1 to 10 (sh05)
  { id: "x-tap", at: W("t3", 3), vol: 0.85 },
  { id: "x-tap", at: W("t3", 7), vol: 0.85 },
  { id: "x-tap", at: W("t3", 11), vol: 0.85 },
  { id: "s-ping", at: W("t3", 18), vol: 0.7 },

  // 7. Nurlybek doner laugh (sh06)
  { id: "x-laugh", at: B.sh06 + 0.1, len: 1.6, fade: 0.4, vol: 0.9 },

  // 8. Exponential explosion (sh07)
  { id: "v-sparkle", at: W("t4", 3), vol: 0.7 },
  { id: "w-correct", at: W("t4", 9), vol: 0.85 },
  { id: "s-stamp", at: W("t4", 15), vol: 0.9 },

  // 9. Chess & wheat legend (sh08)
  { id: "s-whoosh", at: B.sh08 + 0.1, vol: 0.65 },
  { id: "x-ooh", at: W("t5", 8), vol: 0.75 },

  // 10. Nurlybek fainting & ambulance (sh09)
  { id: "s-boing", at: B.sh09 + 0.05, vol: 0.75 },
  { id: "s-pop", at: W("u4", 2), vol: 0.65 },

  // 11. Homework x 2 (sh10)
  { id: "x-tap", at: B.sh10 + 0.05, vol: 0.85 },
  { id: "s-stamp", at: W("t6", 14), vol: 0.95 },

  // 12. Scream (sh11)
  { id: "s-boing", at: B.sh11 + 0.05, vol: 0.8 },

  // 13. End card (sh12)
  { id: "x-bell", at: B.sh12 + 0.1, vol: 0.8 },
  { id: "v-sparkle", at: W("n1", 4), vol: 0.7 },
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
