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
  // 1. Chalk writing Trojan Horse + gentle background music
  { id: "x-chalk", at: 0, len: 1.0, fade: 0.15, vol: 1 },
  { id: "s-music", at: 0.5, len: C0 - 0.5, fadeIn: 1.2, fade: 0.8, loop: true, vol: 0.38 },

  // 2. Puzzle sparkles (t1)
  { id: "v-sparkle", at: W("t1", 8), vol: 0.65 },
  { id: "s-ping", at: W("t1", 13), vol: 0.6 },

  // 3. Nurlybek drones & cannons (sh02)
  { id: "s-whoosh", at: B.sh02 - 0.05, vol: 0.65 },
  { id: "s-boing", at: W("u1", 5), vol: 0.6 },
  { id: "x-laugh", at: W("u1", 9), len: 1.6, fade: 0.4, vol: 0.8 },

  // 4. Barys wooden horse reveal (sh03)
  { id: "x-tap", at: W("t2", 8), vol: 0.85 },
  { id: "s-pop", at: W("t2", 13), vol: 0.7 },
  { id: "s-ping", at: W("t2", 19), vol: 0.65 },

  // 5. Nurlybek selfie & free toy (sh04)
  { id: "s-whoosh", at: B.sh04 - 0.05, vol: 0.65 },
  { id: "v-sparkle", at: W("u2", 1), vol: 0.7 },
  { id: "x-laugh", at: W("u2", 10), len: 1.5, fade: 0.4, vol: 0.85 },

  // 6. Trojans party & sleep (sh05)
  { id: "v-sparkle", at: W("t3", 8), vol: 0.7 },
  { id: "s-tick", at: W("t3", 11), vol: 0.65 },

  // 7. Nurlybek asks: another gift? (sh06)
  { id: "s-boing", at: B.sh06 + 0.05, vol: 0.65 },
  { id: "s-ping", at: W("u3", 7), vol: 0.65 },

  // 8. Midnight ambush & soldiers (sh07)
  { id: "s-stamp", at: B.sh07 + 0.05, vol: 0.95 },
  { id: "x-ooh", at: W("t4", 6), vol: 0.85 },
  { id: "s-boing", at: W("t4", 14), vol: 0.75 },

  // 9. Nurlybek shock: Trojan virus?! (sh08)
  { id: "s-boing", at: B.sh08 + 0.05, vol: 0.75 },
  { id: "s-pop", at: W("u4", 10), vol: 0.7 },

  // 10. Barys lesson & cyber warning (sh09)
  { id: "x-tap", at: W("t5", 4), vol: 0.85 },
  { id: "s-stamp", at: W("t5", 20), vol: 0.95 },
  { id: "v-sparkle", at: W("t5", 22), vol: 0.7 },

  // 11. Nurlybek SMS 1 million (sh10)
  { id: "s-ping", at: W("u5", 8), vol: 0.75 },
  { id: "x-laugh", at: W("u5", 14), len: 1.6, fade: 0.4, vol: 0.85 },

  // 12. End card (sh11)
  { id: "x-bell", at: B.sh11 + 0.1, vol: 0.8 },
  { id: "v-sparkle", at: W("n1", 5), vol: 0.75 },
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
