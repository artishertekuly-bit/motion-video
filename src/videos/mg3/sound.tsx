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
  // 1. Chalk writing «КІМ КІМНЕН ОЗАДЫ?» + background score
  { id: "x-chalk", at: 0, len: 1.0, fade: 0.15, vol: 1 },
  { id: "s-music", at: 0.6, len: C0 - 0.6, fadeIn: 1.5, fade: 0.8, loop: true, vol: 0.42 },

  // 2. Sneaker flex (sh02)
  { id: "s-whoosh", at: B.sh02 - 0.05, vol: 0.65 },
  { id: "v-sparkle", at: W("u1", 2), vol: 0.6 },
  { id: "s-boing", at: W("u1", 4), vol: 0.5 },

  // 3. Class laughs & phone flex (sh03)
  { id: "x-laugh", at: B.sh03 - 0.1, len: 1.6, fade: 0.4, vol: 0.9 },
  { id: "s-ping", at: W("n2", 2), vol: 0.6 },
  { id: "s-pop", at: W("n2", 6), vol: 0.6 },

  // 4. Barys asks about 130 years ago (sh04)
  { id: "s-tick", at: B.sh04 + 0.1, len: 1.5, fade: 0.3, loop: true, vol: 0.4 },

  // 5. Nurlybek smug: «Трендсеттер?» (sh05)
  { id: "s-boing", at: W("u2", 1), vol: 0.5 },

  // 6. Tap-tap on board: «АҚЫМАҚ!» (sh06)
  { id: "x-tap", at: B.sh06 + 0.05, vol: 0.95 },
  { id: "s-stamp", at: W("t2", 0) - 0.05, vol: 0.8 },
  { id: "x-ooh", at: W("t2", 2) + 0.15, vol: 0.85 },

  // 7. Chalk writes «18-ҚАРА СӨЗ» (sh07)
  { id: "x-chalk", at: B.sh07 + 0.15, len: 1.2, fade: 0.2, vol: 0.8 },

  // 8. 4 virtues appear (sh08)
  { id: "v-sparkle", at: W("t4", 7) - 0.05, vol: 0.6 },
  { id: "s-ping", at: W("t4", 8) - 0.05, vol: 0.65 },
  { id: "s-pop", at: W("t4", 9) - 0.05, vol: 0.65 },
  { id: "w-correct", at: W("t4", 11) - 0.05, vol: 0.75 },

  // 9. Index finger raised: «Ақымақтық!» (sh09)
  { id: "s-stamp", at: W("t5", 5) - 0.05, vol: 0.8 },

  // 10. Gold box & old book placed (sh10)
  { id: "s-whoosh", at: B.sh10 + 0.1, vol: 0.6 },
  { id: "v-sparkle", at: W("n3", 3), vol: 0.5 },

  // 11. Box opened (empty!) (sh11)
  { id: "s-boing", at: W("t6", 5), vol: 0.6 },
  { id: "s-pop", at: W("t6", 9), vol: 0.7 },

  // 12. Nurlybek lowers foot in shame (sh12)
  { id: "s-whoosh", at: B.sh12 + 0.1, vol: 0.5 },

  // 13. Back desk: Ali Khan solving hard problem (sh13)
  { id: "x-scribble", at: B.sh13 + 0.1, len: 1.8, fade: 0.3, vol: 0.8 },
  { id: "v-sparkle", at: W("n5", 6), vol: 0.6 },

  // 14. Barys lifts solved notebook (sh14)
  { id: "w-correct", at: W("t7", 6) - 0.05, vol: 0.85 },
  { id: "v-sparkle", at: W("t7", 7), vol: 0.7 },

  // 15. Journal: Red stamp «5» (sh15)
  { id: "s-whoosh", at: B.sh15 + 0.05, vol: 0.6 },
  { id: "s-stamp", at: B.sh15 + 0.3, vol: 1.0 },

  // 16. Barys asks class (sh16)
  { id: "s-ping", at: W("t8", 4), vol: 0.7 },

  // 17. Class stunned silence (sh17)
  { id: "s-tick", at: B.sh17 + 0.1, len: 2.0, fade: 0.4, loop: true, vol: 0.5 },

  // 18. Nurlybek wants a brain upgrade (sh18)
  { id: "s-pop", at: W("u3", 3), vol: 0.6 },
  { id: "x-laugh", at: W("u3", 8) + 0.4, len: 1.6, fade: 0.4, vol: 0.9 },

  // 19. Board final motto (sh19)
  { id: "x-tap", at: B.sh19 + 0.1, vol: 0.9 },
  { id: "x-chalk", at: B.sh19 + 0.3, len: 1.5, fade: 0.25, vol: 0.85 },
  { id: "v-sparkle", at: W("t9", 9), vol: 0.65 },

  // 20. Celebration & applause (sh20)
  { id: "w-correct", at: B.sh20 + 0.1, vol: 0.8 },
  { id: "v-sparkle", at: B.sh20 + 0.4, vol: 0.7 },

  // 21. Bell & End card (sh21)
  { id: "x-bell", at: C0 - 0.2, len: 1.6, fade: 0.5, vol: 0.55 },
  { id: "s-music", at: C0 + 0.3, len: END - C0 - 0.3, fadeIn: 0.4, fade: 1.6, loop: true, vol: 0.7 },
  { id: "s-ping", at: W("n7", 10) - 0.05, vol: 0.8 },
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
