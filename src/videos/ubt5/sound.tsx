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
  // күнтізбе хук: «26»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: W("n8", 0) - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.55 },

  // ұйықтап жатқан Ерасыл, сағат 10:00
  { id: "u-creak", at: B.sh02 + 0.1, vol: 0.6 },
  { id: "s-tick", at: B.sh03, len: W("e1", 0) - B.sh03 + 0.1, fade: 0.2, loop: true, vol: 0.95 },
  { id: "v-alarm", at: W("n3", 3) - 0.05, vol: 0.8 },
  { id: "s-boing", at: W("e1", 0) - 0.05, vol: 0.85 },

  // шұлықтар ұшып, көшеге оқтай атылу
  { id: "s-whoosh", at: W("n4", 0) - 0.05, vol: 0.8 },
  { id: "s-steps-fast", at: W("n4", 3) - 0.1, len: 1.8, fade: 0.3, vol: 0.85 },
  { id: "w-wind", at: B.sh06, len: 3.5, fadeIn: 0.5, fade: 0.5, vol: 0.6 },

  // сыныпқа сырғып кіру
  { id: "s-door", at: W("n5", 3) - 0.1, vol: 0.85 },
  { id: "u-dust", at: W("n5", 4) - 0.05, vol: 0.7 },

  // сынақ тест, қаламнан түтін
  { id: "s-paper", at: W("n6", 2) - 0.1, vol: 0.75 },
  { id: "s-tick", at: B.sh08 + 0.2, len: W("n7", 0) - B.sh08 - 0.2, fade: 0.3, loop: true, vol: 0.7 },
  { id: "v-sparkle", at: W("e3", 4) - 0.05, vol: 0.7 },

  // уақыт бітті — мектеп қоңырауы!
  { id: "x-bell", at: W("n7", 0) - 0.05, vol: 0.9 },
  { id: "s-paper", at: W("n7", 2) - 0.05, vol: 0.7 },

  // нәтижелер тақтасы: Аружан 124, Ерасыл 78
  { id: "s-ping", at: W("n8", 4) - 0.05, vol: 0.85 },
  { id: "w-correct", at: W("n9", 2) - 0.08, vol: 0.9 },
  { id: "s-pop", at: W("n9", 2) + 0.1, vol: 0.8 },
  { id: "s-boing", at: W("e4", 4) - 0.05, vol: 0.8 },

  // Аружанның өкпесі
  { id: "w-switch", at: B.sh14 - 0.03, vol: 0.85 },
  { id: "s-boing", at: W("e5", 0) - 0.05, vol: 0.7 },

  // абайсызда сезімін білдіру: романтикалық нота
  { id: "x-romantic", at: W("e6", 11) - 0.2, vol: 0.9 },

  // жүрек дүрсілі: үнсіздік және "Ой не деп қойдым?!"
  { id: "x-heartbeat", at: W("e7", 0) - 0.1, vol: 0.95 },
  { id: "v-sparkle", at: W("a3", 0) - 0.05, vol: 0.7 },

  // кітапханаға қадам басу
  { id: "s-steps", at: W("n10", 0), len: 3.5, fade: 0.5, vol: 0.65 },
  { id: "w-wind", at: B.sh20, len: 4.0, fadeIn: 0.5, fade: 0.8, vol: 0.5 },

  // VS экраны
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },
  { id: "s-pop", at: W("n11", 2), vol: 0.7 },
  { id: "s-ping", at: W("n11", 6) - 0.05, vol: 0.8 },

  // пікір карточкасы
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.85 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n12", 4), vol: 0.9 },
  { id: "s-pop", at: W("n12", 8), vol: 0.7 },
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
        loop={!!e.loop}
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
        <One key={`${e.id}-${i}`} e={e} />
      ))}
    </>
  );
};
