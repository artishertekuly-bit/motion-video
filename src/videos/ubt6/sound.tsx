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
  // күнтізбе хук: «25»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: W("n7", 0) - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.55 },

  // айна алдындағы Ерасыл
  { id: "s-whoosh", at: B.sh02 + 0.05, vol: 0.7 },
  { id: "s-boing", at: W("e1", 0) - 0.05, vol: 0.75 },

  // қалтаны қағу: тиындар сылдыры
  { id: "s-ping", at: W("n2", 5) - 0.05, vol: 0.85 },
  { id: "s-pop", at: W("n2", 7) - 0.05, vol: 0.7 },

  // гүл дүкені: 25 000 теңге шок!
  { id: "s-whoosh", at: B.sh04 - 0.05, vol: 0.8 },
  { id: "v-alarm", at: W("e2", 0) - 0.05, vol: 0.85 },
  { id: "s-boing", at: W("e2", 4) - 0.05, vol: 0.8 },

  // бір тал қызыл раушан
  { id: "v-sparkle", at: W("n3", 6) - 0.05, vol: 0.8 },

  // орамына формула жазу
  { id: "s-paper", at: B.sh06 + 0.1, vol: 0.85 },
  { id: "s-typing", at: W("e3", 5) - 0.05, vol: 0.7 },

  // шпаргалка-букет пайда болды
  { id: "v-sparkle", at: W("n4", 4) - 0.05, vol: 0.85 },
  { id: "s-whoosh", at: B.sh08 - 0.1, vol: 0.8 },

  // сенбілік тыныш таң, кітапхана алды
  { id: "w-wind", at: B.sh08, len: 4.5, fadeIn: 0.6, fade: 0.8, vol: 0.5 },
  { id: "s-steps", at: B.sh10, len: 2.5, fade: 0.5, vol: 0.7 },

  // гүлді сыйлау: романтикалық сиқырлы қоңырау!
  { id: "x-chime", at: W("e5", 0) - 0.1, vol: 0.95 },
  { id: "x-romantic", at: W("e5", 0) + 0.1, len: 4.0, fadeIn: 0.5, fade: 0.8, vol: 0.7 },

  // Аружан риза болады
  { id: "v-sparkle", at: W("a2", 0) - 0.05, vol: 0.85 },

  // орамдағы формулаларды көріп таңғалу
  { id: "s-boing", at: W("a3", 0) - 0.05, vol: 0.85 },
  { id: "w-switch", at: W("a3", 4) - 0.05, vol: 0.8 },

  // Ерасылдың комплименті: романтика
  { id: "v-sparkle", at: W("e6", 5) - 0.05, vol: 0.9 },

  // Аружанның күлкісі
  { id: "s-pop", at: W("a4", 0) - 0.05, vol: 0.8 },

  // кітапхана төрінде жалғасу
  { id: "s-door", at: B.sh16 - 0.05, vol: 0.75 },
  { id: "s-paper", at: W("a5", 6) - 0.05, vol: 0.8 },

  // Ерасыл есеп шығарады
  { id: "s-pop", at: W("e7", 2) - 0.05, vol: 0.8 },
  { id: "w-correct", at: W("a6", 0) - 0.05, vol: 0.9 },

  // балл өсті: 82 балл!
  { id: "w-correct", at: W("n7", 6) - 0.08, vol: 0.95 },
  { id: "s-ping", at: W("n7", 8) - 0.05, vol: 0.9 },
  { id: "s-boing", at: W("n7", 9) - 0.05, vol: 0.8 },

  // нәтиже экраны
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },
  { id: "s-pop", at: W("n8", 2), vol: 0.7 },
  { id: "s-ping", at: W("n8", 5) - 0.05, vol: 0.8 },

  // пікір карточкасы
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.85 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n9", 10), vol: 0.9 },
  { id: "s-pop", at: W("n9", 14), vol: 0.7 },
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
        <One key={i} e={e} />
      ))}
    </>
  );
};
