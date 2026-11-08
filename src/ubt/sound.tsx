import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, DURATION, FPS, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const END = DURATION / FPS;
const W = (id: string, i: number) => ws(id, i) / FPS;

const EVENTS: Ev[] = [
  // крючок
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.2, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.6 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: B.sh14 - 0.4, fadeIn: 1.2, fade: 1.2, loop: true, vol: 0.75 },
  // «ертең бастаймын»
  { id: "s-pop", at: W("n2", 1), vol: 0.9 },
  ...[4, 5, 5, 6].map((w, i) => ({ id: "s-pop", at: W("n2", w) - 0.12 + i * 0.17, vol: 0.8 })),
  // 9 сағ, целлофан, 47
  { id: "s-tick", at: B.sh03a, len: 0.9, fade: 0.2, vol: 1 },
  { id: "s-ping", at: B.sh03a + 0.9, vol: 0.8 },
  { id: "s-paper", at: B.sh03b, len: 1.2, fade: 0.4, vol: 0.9 },
  { id: "s-stamp", at: W("n3", 10) - 0.04, vol: 0.7 },
  { id: "s-boing", at: W("n3", 11), vol: 0.8 },
  // Аружан
  { id: "s-notify", at: W("n4", 3) - 0.1, vol: 1 },
  { id: "s-boing", at: W("n4", 3) + 0.1, vol: 0.6 },
  { id: "s-whoosh", at: B.sh04b - 0.25, vol: 0.7 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: W("n4", 12) + i * 0.2, vol: 0.6 })),
  { id: "s-notify", at: B.sh05 + 0.33, vol: 0.9 },
  // «адам болуға»
  { id: "s-whoosh", at: B.sh06 + 0.1, vol: 0.7 },
  { id: "s-ping", at: W("n5", 2) - 0.05, vol: 1 },
  { id: "s-boing", at: W("n5", 4) + 0.05, vol: 0.8 },
  // стол
  { id: "s-whoosh", at: B.sh07 + 0.2, vol: 0.5 },
  { id: "s-pop", at: W("n6", 4) + 0.13, vol: 0.9 },
  { id: "s-pop", at: W("n6", 7) + 0.13, vol: 0.9 },
  { id: "s-pop", at: W("n6", 10) + 0.2, vol: 0.9 },
  { id: "s-stamp", at: W("n6", 12) - 0.04, vol: 0.7 },
  // шкаф
  { id: "s-steps", at: B.sh08, len: 1.2, fade: 0.3, vol: 0.8 },
  { id: "s-door", at: W("n7", 2), vol: 0.9 },
  { id: "u-dust", at: W("n7", 4) - 0.1, vol: 1 },
  { id: "s-pop", at: W("n7", 6) - 0.07, vol: 0.8 },
  // книга
  { id: "u-creak", at: W("n8", 2), vol: 1 },
  { id: "s-ping", at: W("n8", 4) + 0.05, vol: 1 },
  // мама, «Иә!», игра
  { id: "s-boing", at: B.sh10b + 0.05, vol: 0.5 },
  { id: "u-game", at: B.sh10c, vol: 0.9 },
  // двор
  { id: "s-steps", at: B.sh11, len: 1.7, fade: 0.3, vol: 0.8 },
  { id: "s-pop", at: W("n10", 5) + 0.13, vol: 0.7 },
  { id: "s-boing", at: W("n10", 7) - 0.05, vol: 0.8 },
  // чат
  { id: "s-typing", at: W("n11", 2), len: W("n11", 4) - W("n11", 2) - 0.05, fade: 0.1, loop: true, vol: 0.9 },
  { id: "s-whoosh", at: W("n11", 4) - 0.05, vol: 0.6 },
  { id: "s-typing", at: W("n11", 5), len: W("n11", 7) - W("n11", 5) - 0.05, fade: 0.1, loop: true, vol: 0.9 },
  { id: "s-whoosh", at: W("n11", 7) - 0.05, vol: 0.6 },
  { id: "s-typing", at: W("n11", 8), len: 0.55, fade: 0.1, vol: 0.9 },
  { id: "s-notify", at: W("n11", 10) - 0.05, vol: 0.9 },
  // ночь
  { id: "s-tick", at: B.sh13, len: B.sh14 - B.sh13, fadeIn: 0.3, fade: 0.3, loop: true, vol: 0.8 },
  { id: "s-stamp", at: W("n12", 6) - 0.04, vol: 0.8 },
  // голосование
  { id: "s-whoosh", at: B.sh14 - 0.2, vol: 0.9 },
  { id: "s-music", at: B.sh14, len: END - B.sh14, fadeIn: 0.5, fade: 2, loop: true, vol: 0.9 },
  { id: "s-pop", at: W("n13", 4), vol: 0.8 },
  { id: "s-pop", at: W("n13", 9), vol: 0.8 },
  { id: "s-ping", at: W("n13", 13), vol: 0.9 },
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
