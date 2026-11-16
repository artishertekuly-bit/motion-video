import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import raw from "./audio-data.json";
import { BOUND as B, CARD_AT, FPS, sec, ws } from "./timeline";

type SfxMeta = { file: string; duration: number };
const SFX = (raw as unknown as { _sfx: Record<string, SfxMeta> })._sfx;
type Ev = { id: string; at: number; vol?: number; len?: number; fadeIn?: number; fade?: number; loop?: boolean };
const W = (id: string, i: number) => ws(id, i) / FPS;
const C0 = CARD_AT / FPS;

const EVENTS: Ev[] = [
  // 1. Chalk writing + gentle background music
  { id: "x-chalk", at: 0, len: 1.0, fade: 0.15, vol: 1 },
  { id: "s-music", at: 0.4, len: C0 - 0.4, fadeIn: 1.2, fade: 0.8, loop: true, vol: 0.35 },

  // 2. Question sparkles (t1)
  { id: "v-sparkle", at: W("t1", 5), vol: 0.65 },
  { id: "s-ping", at: W("t1", 10), vol: 0.6 },

  // 3. Nurlybek Wi-Fi, iPhone & angry mom (sh02)
  { id: "s-whoosh", at: B.sh02 - 0.05, vol: 0.65 },
  { id: "s-boing", at: W("u1", 8), vol: 0.6 },
  { id: "x-laugh", at: W("u1", 13), len: 1.6, fade: 0.4, vol: 0.8 },

  // 4. Barys spotless trust reveal (sh03)
  { id: "v-sparkle", at: W("t2", 7), vol: 0.75 },
  { id: "s-ping", at: W("t2", 15), vol: 0.65 },

  // 5. Nurlybek study nagging (sh04)
  { id: "s-whoosh", at: B.sh04 - 0.05, vol: 0.6 },
  { id: "x-scribble", at: W("u2", 9), vol: 0.7 },

  // 6. Pygmalion effect: mountains vs broken wings (sh05)
  { id: "x-tap", at: W("t3", 8), vol: 0.8 },
  { id: "w-correct", at: W("t3", 20), vol: 0.75 },
  { id: "s-pop", at: W("t3", 29), vol: 0.65 },

  // 7. Nurlybek touching dad's trust (sh06)
  { id: "v-sparkle", at: W("u3", 9), vol: 0.8 },
  { id: "s-tick", at: W("u3", 18), vol: 0.5 },

  // 8. Barys capital & responsibility (sh07)
  { id: "s-ping", at: W("t4", 3), vol: 0.7 },
  { id: "x-tap", at: W("t4", 21), vol: 0.8 },

  // 9. Nurlybek cracked trust question (sh08)
  { id: "s-boing", at: W("u4", 7), vol: 0.6 },

  // 10. Barys mirror & Kintsugi (sh09)
  { id: "v-sparkle", at: W("t5", 10), vol: 0.75 },
  { id: "w-correct", at: W("t5", 19), vol: 0.7 },

  // 11. Nurlybek resolution to hug parents (sh10)
  { id: "s-pop", at: W("u5", 2), vol: 0.7 },
  { id: "x-laugh", at: W("u5", 10), len: 1.5, fade: 0.4, vol: 0.8 },

  // 12. Barys wings finale (sh11)
  { id: "v-sparkle", at: W("t6", 6), vol: 0.8 },
  { id: "w-correct", at: W("t6", 13), vol: 0.75 },

  // 13. End Bell (sh12)
  { id: "x-bell", at: C0 + 0.1, vol: 0.8 },
];

export const Sound: React.FC<{ f: number }> = () => {
  return (
    <>
      {EVENTS.map((ev, i) => {
        const meta = SFX[ev.id];
        if (!meta) return null;
        const startFrame = sec(ev.at);
        const durSec = ev.len ?? meta.duration;
        const durFrames = Math.max(1, sec(durSec));
        const vol = ev.vol ?? 1;

        return (
          <Sequence key={`${ev.id}-${i}`} from={startFrame} durationInFrames={durFrames}>
            <Audio
              src={staticFile(meta.file)}
              volume={(f) => {
                let v = vol;
                if (ev.fadeIn && f < sec(ev.fadeIn)) v *= interpolate(f, [0, sec(ev.fadeIn)], [0, 1]);
                if (ev.fade && f > durFrames - sec(ev.fade)) v *= interpolate(f, [durFrames - sec(ev.fade), durFrames], [1, 0]);
                return v;
              }}
              loop={ev.loop}
            />
          </Sequence>
        );
      })}
    </>
  );
};
