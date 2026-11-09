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
const V0 = B.sh19; // the comment card
const EVENTS: Ev[] = [
  // крючок: «28»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: V0 - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.65 },
  // түн: ой-бұлт, сағат, «дайын отырды»
  { id: "v-sparkle", at: W("n2", 2) - 0.12, vol: 0.6 },
  { id: "s-tick", at: B.sh02, len: W("n3", 2) - B.sh02 + 0.2, fade: 0.2, loop: true, vol: 0.9 },
  { id: "s-pop", at: W("n3", 1) - 0.05, vol: 0.8 },
  { id: "s-ping", at: W("n3", 7) - 0.05, vol: 0.8 },
  // шам жанады, анасы
  { id: "w-switch", at: B.sh03 - 0.03, vol: 1 },
  { id: "s-boing", at: W("m1", 0) - 0.05, vol: 0.7 },
  // костюм, әтір, «жарты бөтелке»
  { id: "v-sparkle", at: W("n4", 2) - 0.1, vol: 0.7 },
  { id: "w-spray", at: W("n4", 6) - 0.12, vol: 0.9 },
  { id: "s-boing", at: W("n4", 8) - 0.03, vol: 0.8 },
  // кітапхана 7:00
  { id: "v-sparkle", at: W("n5", 2) - 0.15, vol: 0.55 },
  // есік, иіс, Ерасыл
  { id: "u-creak", at: W("n6", 0) - 0.12, vol: 0.8 },
  { id: "s-whoosh", at: W("n6", 2) - 0.05, vol: 0.7 },
  { id: "s-steps", at: W("n6", 5) - 0.25, len: 1.3, fade: 0.25, vol: 0.8 },
  // гүл солады
  { id: "w-wilt", at: W("n7", 2) - 0.1, vol: 0.9 },
  // «білімнің иісі»
  { id: "v-sparkle", at: W("e1", 1) - 0.1, vol: 0.6 },
  // терезелер ашылады
  { id: "u-creak", at: W("n8", 3) - 0.25, vol: 0.6 },
  { id: "w-wind", at: W("n8", 3) - 0.1, len: 2.6, fade: 0.8, vol: 0.85 },
  // дәптер, ми жүктеледі, «Жеті!», «Дұрыс!»
  { id: "s-paper", at: W("a2", 2) - 0.1, len: 0.8, fade: 0.2, vol: 0.7 },
  { id: "w-loading", at: W("n9", 1) - 0.1, vol: 0.8 },
  { id: "s-whoosh", at: W("e2", 0) - 0.12, vol: 0.7 },
  { id: "w-correct", at: W("n10", 0) - 0.05, vol: 0.9 },
  { id: "s-pop", at: W("n10", 0) + 0.1, vol: 0.7 },
  // «минус жеті де бар»
  { id: "s-boing", at: W("a3", 2) - 0.03, vol: 0.8 },
  // бәс: «тілек», «Келістік!»
  { id: "v-sparkle", at: W("a4", 10) - 0.1, vol: 0.6 },
  { id: "s-stamp", at: W("e3", 0) - 0.03, vol: 0.6 },
  // VS экраны
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },
  { id: "s-pop", at: W("n11", 4), vol: 0.7 },
  { id: "s-pop", at: W("n11", 8), vol: 0.7 },
  { id: "s-ping", at: W("n11", 9) - 0.05, vol: 0.8 },
  // пікір карточкасы
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.9 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n12", 4), vol: 0.9 },
  { id: "s-pop", at: W("n12", 6), vol: 0.7 },
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
