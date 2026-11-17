// Sound design and Foley mapping for «Көпір»
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, TOTAL as DURATION, FPS, sec } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;

const EVENTS: Ev[] = [
  // Ambient background music throughout the documentary short
  { id: "s-music", at: 0.5, len: END - 1.0, fadeIn: 2.0, fade: 2.5, loop: true, vol: 0.38 },

  // Act 1: Classroom opening, teacher writes on board
  { id: "s-whoosh", at: 0.5, vol: 0.5 },
  { id: "s-pop", at: 2.5, vol: 0.4 },
  { id: "s-pop", at: 5.0, vol: 0.4 },

  // Aruzhan steps in, card placed
  { id: "s-whoosh", at: B.sh02 + 0.2, vol: 0.45 },
  { id: "v-sparkle", at: B.sh03 + 0.5, vol: 0.55 },
  { id: "s-pop", at: B.sh04 + 0.3, vol: 0.5 },

  // Act 2: Teacher places kits on desks
  { id: "u-slam", at: B.sh05 + 0.3, vol: 0.55 },
  { id: "s-pop", at: B.sh05 + 1.2, vol: 0.45 },

  // Quest announced
  { id: "s-ping", at: B.sh07 + 0.5, vol: 0.5 }, // Dina's tablet
  { id: "s-pop", at: B.sh08 + 0.4, vol: 0.5 },  // Nursultan's paper

  // Act 3: Ermek fidgets, timer set
  { id: "s-tick", at: B.sh11 + 0.8, len: 10.0, loop: true, vol: 0.6 },
  { id: "u-slam", at: B.sh12 + 0.4, vol: 0.6 }, // weights placed

  // Miras tablet 3D model & Nursultan tactile touch
  { id: "s-ping", at: B.sh13 + 0.5, vol: 0.5 },
  { id: "v-sparkle", at: B.sh14 + 0.5, vol: 0.5 },

  // Question card placed
  { id: "s-pop", at: B.sh15 + 0.4, vol: 0.5 },

  // Act 4: Bridge test (200g, 500g, 800g)
  { id: "u-slam", at: B.sh16 + 1.0, vol: 0.65 },
  // Bridge cracks at 800g!
  { id: "x-crash", at: B.sh17 + 2.0, vol: 0.95 },
  { id: "u-slam", at: B.sh17 + 2.1, vol: 0.8 },

  // Dina sign language chime
  { id: "v-sparkle", at: B.sh18 + 0.2, vol: 0.7 },

  // Group validation & teacher star
  { id: "w-correct", at: B.sh19 + 0.3, vol: 0.8 },
  { id: "s-ping", at: B.sh19 + 1.2, vol: 0.6 },

  // Act 5: Aruzhan presentation triumph
  { id: "w-correct", at: B.sh20 + 0.4, vol: 0.85 },

  // School bell rings
  { id: "x-bell", at: B.sh21 + 0.1, vol: 0.75 },

  // Concluding warmth
  { id: "v-sparkle", at: B.sh22 + 0.5, vol: 0.6 },
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
          if (fi > 0 && f < fi) v *= interpolate(f, [0, fi], [0, 1], { extrapolateRight: "clamp" });
          if (fo > 0 && f > len - fo) v *= interpolate(f, [len - fo, len], [1, 0], { extrapolateLeft: "clamp" });
          return v;
        }}
      />
    </Sequence>
  );
};

export const Sound: React.FC = () => {
  return (
    <>
      {EVENTS.map((e, i) => (
        <One key={i} e={e} />
      ))}
    </>
  );
};
