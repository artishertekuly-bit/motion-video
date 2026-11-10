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
const V0 = B.sh22; // the comment card
const EVENTS: Ev[] = [
  // крючок: «27»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: W("n9", 0) - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.6 },

  // түні бойы оқу, кітапханадан үйге ұшу
  { id: "v-sparkle", at: W("n2", 4) - 0.1, vol: 0.6 },
  { id: "s-steps-fast", at: W("n3", 2) - 0.2, len: 1.2, fade: 0.2, vol: 0.8 },
  { id: "s-door", at: W("n3", 5) - 0.1, vol: 0.8 },

  // кітаптар үйіндісі, шай
  { id: "s-paper", at: W("n4", 3) - 0.1, vol: 0.7 },
  { id: "s-pop", at: W("n4", 6) - 0.05, vol: 0.7 },

  // сағат зырылдайды: 10, 12, 3
  { id: "s-tick", at: B.sh04, len: W("m1", 0) - B.sh04 + 0.1, fade: 0.2, loop: true, vol: 0.95 },
  { id: "s-ping", at: W("n5", 2) - 0.05, vol: 0.7 },
  { id: "s-ping", at: W("n5", 4) - 0.05, vol: 0.7 },

  // анасы, бәс
  { id: "w-switch", at: B.sh05 - 0.03, vol: 0.9 },
  { id: "u-creak", at: W("m1", 0) - 0.05, vol: 0.6 },
  { id: "s-boing", at: W("e1", 3) - 0.05, vol: 0.7 },

  // таң атады, 56 балл!
  { id: "w-correct", at: W("n6", 5) - 0.08, vol: 0.9 },
  { id: "s-pop", at: W("n6", 5) + 0.1, vol: 0.8 },
  { id: "v-sparkle", at: W("n6", 7) - 0.1, vol: 0.6 },

  // көзі тартылады
  { id: "s-boing", at: W("n7", 2) - 0.05, vol: 0.8 },

  // мұздатқыш, телефон
  { id: "sfx-vibrate", at: W("n8", 2) - 0.1, len: 1.8, fade: 0.2, vol: 0.85 },
  { id: "s-ping", at: W("n8", 5) - 0.05, vol: 0.8 },
  { id: "s-whoosh", at: W("e2", 0) - 0.08, vol: 0.7 },

  // кешкі қала, қар, серуен
  { id: "w-wind", at: B.sh11, len: 4.5, fadeIn: 0.8, fade: 1.0, vol: 0.55 },
  { id: "s-steps", at: W("n9", 2), len: 3.5, fade: 0.5, vol: 0.6 },

  // махаббат атмосферасы: романтикалық қоңырау
  { id: "x-romantic", at: W("a1", 0) - 0.1, vol: 0.85 },
  { id: "v-sparkle", at: W("e3", 1) - 0.1, vol: 0.7 },
  { id: "s-pop", at: W("a2", 2) - 0.05, vol: 0.7 },
  { id: "s-boing", at: W("e4", 2) - 0.05, vol: 0.7 },

  // фонарь астында мойындау
  { id: "x-romantic", at: W("e5", 0) - 0.1, vol: 0.8 },

  // ұйықтап қарға құлау
  { id: "x-snore", at: W("n10", 3) - 0.1, vol: 0.95 },
  { id: "x-snow-fall", at: W("n10", 4) + 0.1, vol: 0.95 },
  { id: "s-boing", at: W("a3", 0) - 0.05, vol: 0.8 },
  { id: "u-dust", at: W("e6", 0) - 0.1, vol: 0.6 },

  // шанамен сүйреу
  { id: "s-whoosh", at: W("n11", 2) - 0.1, vol: 0.8 },

  // VS экраны
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },
  { id: "s-pop", at: W("n12", 4), vol: 0.7 },
  { id: "s-pop", at: W("n12", 7), vol: 0.7 },
  { id: "s-ping", at: W("n12", 8) - 0.05, vol: 0.8 },

  // пікір карточкасы
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.85 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n13", 4), vol: 0.9 },
  { id: "s-pop", at: W("n13", 7), vol: 0.7 },
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
