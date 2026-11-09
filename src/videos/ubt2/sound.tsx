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
  // крючок: «29»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: C0 - 0.4, fadeIn: 1.2, fade: 1.0, loop: true, vol: 0.7 },
  // телефон анасына -> мұздатқыш
  { id: "v-alarm", at: W("n2b", 6) - 0.08, vol: 0.75 },
  { id: "v-alarm", at: W("n2b", 11) - 0.08, len: 1.4, fade: 0.2, vol: 0.75 },
  { id: "s-pop", at: W("n2b", 11) + 0.02, vol: 0.8 },
  { id: "s-ping", at: W("n3b", 2) + 0.05, vol: 0.8 },
  { id: "v-freezer", at: B.sh02 - 0.05, vol: 0.9 },
  { id: "s-pop", at: W("n3b", 4) + 0.15, vol: 0.9 },
  // нан
  { id: "s-boing", at: W("n3", 8) - 0.03, vol: 0.8 },
  // ой-бұлт, «Дәлел керек»
  { id: "v-sparkle", at: W("n4", 1) - 0.12, vol: 0.6 },
  { id: "s-whoosh", at: W("n4", 8) - 0.15, vol: 0.8 },
  // дәліз, есік
  { id: "s-steps", at: B.sh05 + 0.1, len: 3.4, fade: 0.3, vol: 0.85 },
  { id: "u-creak", at: W("n5", 7) - 0.25, vol: 0.8 },
  { id: "v-sparkle", at: W("n5", 7), vol: 0.8 },
  // апай көзілдірігін сүртеді
  { id: "s-boing", at: W("n6", 3) - 0.05, vol: 0.6 },
  { id: "v-squeak", at: W("n6", 5) - 0.12, vol: 1 },
  // қалың кітап
  { id: "v-thud", at: W("n7", 7) - 0.03, vol: 1 },
  // Аружан кіреді
  { id: "u-creak", at: W("n8", 2) - 0.1, vol: 0.7 },
  { id: "v-sparkle", at: W("n8", 4) - 0.12, vol: 0.9 },
  // ӨТІРІК №2
  { id: "s-stamp", at: W("n9", 2) - 0.04, vol: 0.8 },
  { id: "s-boing", at: W("n9", 3), vol: 0.7 },
  // кітап төңкеріледі, Аружан отырады, «Келемін!»
  { id: "s-whoosh", at: W("a2", 2) - 0.05, vol: 0.7 },
  { id: "s-pop", at: W("n10", 2), vol: 0.7 },
  { id: "s-ping", at: W("e2", 0) - 0.05, vol: 0.9 },
  // кешкі кітапхана
  { id: "s-tick", at: B.sh16, len: C0 - B.sh16, fadeIn: 0.3, fade: 0.3, loop: true, vol: 0.8 },
  { id: "s-boing", at: W("n11b", 10) - 0.05, vol: 0.8 },
  // дауыс беру
  { id: "s-whoosh", at: C0 - 0.2, vol: 0.9 },
  { id: "s-music", at: C0, len: END - C0, fadeIn: 0.5, fade: 2, loop: true, vol: 0.9 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: C0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n12b", 4), vol: 0.9 },
  { id: "s-pop", at: W("n12b", 6), vol: 0.7 },
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
