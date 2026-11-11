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
  // Background upbeat music
  { id: "s-music", at: 0.2, len: END - 0.4, fadeIn: 1.2, fade: 1.2, loop: true, vol: 0.38 },

  // sh01: Nurlybek laptop panic
  { id: "s-whoosh", at: 0.1, vol: 0.6 },
  { id: "s-boing", at: W("u1", 4), vol: 0.55 },
  { id: "s-pop", at: W("u1", 7), vol: 0.6 },

  // sh02: Barys announces AI
  { id: "s-whoosh", at: B.sh02, vol: 0.65 },
  { id: "x-tap", at: B.sh02 + 0.15, vol: 0.9 },
  { id: "v-sparkle", at: W("t1", 5), vol: 0.75 },
  { id: "w-correct", at: W("t1", 7), vol: 0.7 },

  // sh03: 3 Feature cards pop
  { id: "s-whoosh", at: B.sh03, vol: 0.65 },
  { id: "s-pop", at: B.sh03 + 0.1, vol: 0.65 },
  { id: "s-ping", at: B.sh03 + 0.8, vol: 0.65 },
  { id: "v-sparkle", at: B.sh03 + 1.5, vol: 0.7 },
  { id: "w-correct", at: W("t2", 15), vol: 0.8 },

  // sh04: Course announcement
  { id: "s-whoosh", at: B.sh04, vol: 0.7 },
  { id: "s-stamp", at: W("t3", 4) - 0.05, vol: 0.85 },
  { id: "v-sparkle", at: W("t3", 11), vol: 0.75 },
  { id: "s-ping", at: W("t3", 12), vol: 0.7 },

  // sh05: Telegram announcement
  { id: "s-whoosh", at: B.sh05, vol: 0.7 },
  { id: "s-ping", at: W("t4", 5) - 0.05, vol: 0.85 },
  { id: "v-sparkle", at: W("t4", 7), vol: 0.75 },

  // sh06: Nurlybek jumps
  { id: "s-boing", at: B.sh06 + 0.05, vol: 0.8 },
  { id: "x-laugh", at: W("u2", 1), len: 1.2, fade: 0.3, vol: 0.75 },

  // sh07: Final CTA & bell
  { id: "s-whoosh", at: B.sh07, vol: 0.65 },
  { id: "x-bell", at: B.sh07 + 0.1, len: 1.5, fade: 0.4, vol: 0.6 },
  { id: "w-correct", at: W("t5", 1), vol: 0.85 },
  { id: "v-sparkle", at: W("t5", 4), vol: 0.7 },
];

const One: React.FC<{ e: Ev }> = ({ e }) => {
  const meta = SFX[e.id];
  if (!meta) return null;
  const from = sec(e.at);
  const dur = sec(e.len ?? meta.duration);
  const vol = e.vol ?? 1;
  const fin = e.fadeIn ? sec(e.fadeIn) : 0;
  const fout = e.fade ? sec(e.fade) : 0;
  return (
    <Sequence from={from} durationInFrames={dur}>
      <Audio
        src={staticFile(meta.file)}
        loop={e.loop}
        volume={(f) => {
          let v = vol;
          if (fin > 0 && f < fin) v *= interpolate(f, [0, fin], [0, 1], { extrapolateRight: "clamp" });
          if (fout > 0 && f > dur - fout) v *= interpolate(f, [dur - fout, dur], [1, 0], { extrapolateLeft: "clamp" });
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
