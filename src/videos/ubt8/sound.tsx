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
const V0 = B.sh20; // comment card

const EVENTS: Ev[] = [
  // Calendar hook: «23»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: W("n6", 0) - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.55 },

  // Classroom: Gulnar apai confronts Erasyl
  { id: "s-whoosh", at: B.sh02 + 0.05, vol: 0.7 },
  { id: "s-boing", at: W("e1", 0) - 0.05, vol: 0.75 },

  // Gulnar apai slams C-level test booklet (THUNDER!)
  { id: "x-thunder", at: B.sh04 + 0.25, vol: 1.0 },
  { id: "u-slam", at: B.sh04 + 0.28, vol: 0.9 },

  // Test begins: clock ticking fast
  { id: "s-tick", at: B.sh05 + 0.2, len: 3.5, loop: true, vol: 0.7 },
  { id: "s-tick", at: B.sh06 + 0.1, len: 4.5, loop: true, vol: 0.8 },

  // Time up, red crosses
  { id: "s-boing", at: B.sh07 + 0.1, vol: 0.85 },
  { id: "s-pop", at: B.sh07 + 0.6, vol: 0.8 },

  // Gulnar apai announces 58 points: SCORE CRASH!
  { id: "x-crash", at: W("g3", 2) - 0.05, vol: 1.0 },
  { id: "u-slam", at: B.sh09 + 0.1, vol: 0.95 },

  // Corridor: Erasyl slumped in despair (rain cloud & sad meme)
  { id: "x-despair", at: B.sh10 + 0.15, vol: 0.85 },

  // Aruzhan arrives to comfort him
  { id: "v-sparkle", at: W("a1", 0) - 0.05, vol: 0.85 },
  { id: "s-whoosh", at: W("a1", 3) - 0.05, vol: 0.75 },

  // Aruzhan reveals secret strategy blueprint! (Discovery!)
  { id: "x-strategy", at: B.sh13 + 0.2, vol: 0.95 },
  { id: "v-sparkle", at: B.sh14 + 0.1, vol: 0.85 },

  // Aruzhan explains 3-tier roadmap
  { id: "w-correct", at: W("a3", 0) - 0.05, vol: 0.85 },
  { id: "s-ping", at: W("a3", 8) - 0.05, vol: 0.8 },

  // Erasyl inspired with new fire!
  { id: "w-correct", at: W("e5", 0) - 0.05, vol: 0.95 },
  { id: "s-boing", at: W("e5", 3) - 0.05, vol: 0.85 },

  // Rallying together with warmth
  { id: "x-romantic", at: B.sh17 + 0.1, len: 4.0, fadeIn: 0.4, fade: 0.6, vol: 0.7 },
  { id: "v-sparkle", at: W("a4", 1) - 0.05, vol: 0.8 },

  // Results screen (VsScreen)
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },

  // VoteCard
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.85 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n8", 10), vol: 0.9 },
  { id: "s-pop", at: W("n8", 13), vol: 0.7 },
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
