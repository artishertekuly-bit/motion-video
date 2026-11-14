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
  // күнтізбе хук: «24»
  { id: "u-slam", at: 0.02, vol: 1 },
  { id: "s-whoosh", at: 2.1, vol: 0.8 },
  ...[0, 1, 2, 3].map((i) => ({ id: "s-pop", at: 2.45 + i * 0.13, vol: 0.7 })),
  { id: "s-music", at: 0.4, len: W("n6", 0) - 0.4, fadeIn: 1.2, fade: 0.6, loop: true, vol: 0.55 },

  // сыныпта тест талдау: Ерасыл мен Аружан
  { id: "s-whoosh", at: B.sh02 + 0.05, vol: 0.7 },
  { id: "s-boing", at: W("e1", 0) - 0.05, vol: 0.75 },
  { id: "w-correct", at: W("a1", 0) - 0.05, vol: 0.9 },
  { id: "s-ping", at: W("a1", 6) - 0.05, vol: 0.85 },

  // Еңбек ақталды: балл өсті 78 -> 82 (+4)
  { id: "w-correct", at: W("n2", 4) - 0.08, vol: 0.95 },
  { id: "s-ping", at: W("n2", 5) - 0.05, vol: 0.9 },
  { id: "s-boing", at: W("n2", 6) - 0.05, vol: 0.8 },

  // Аружан мұз айдынына шақырады
  { id: "v-sparkle", at: W("a2", 0) - 0.05, vol: 0.85 },
  { id: "s-whoosh", at: W("a2", 5) - 0.05, vol: 0.75 },

  // Ерасыл: «Мұз айдыны?! Маған тең келер ешкім жоқ!»
  { id: "s-boing", at: W("e2", 0) - 0.05, vol: 0.85 },

  // Тау баурайындағы мұз айдыны
  { id: "s-whoosh", at: B.sh07 - 0.1, vol: 0.8 },
  { id: "w-wind", at: B.sh07, len: 4.5, fadeIn: 0.6, fade: 0.8, vol: 0.5 },

  // Аружан шебер сырғанайды
  { id: "x-skate", at: B.sh08, len: 3.5, fadeIn: 0.3, fade: 0.5, vol: 0.85 },
  { id: "v-sparkle", at: W("a3", 0) - 0.05, vol: 0.8 },

  // Ерасыл мұзға шығады
  { id: "x-skate", at: B.sh09, len: 2.5, fadeIn: 0.2, fade: 0.4, vol: 0.75 },
  { id: "s-boing", at: W("e3", 0) - 0.05, vol: 0.8 },

  // Ерасыл екпінмен жүгіріп секіреді
  { id: "s-whoosh", at: W("e4", 1) - 0.05, vol: 0.85 },
  { id: "s-boing", at: W("e4", 3) - 0.05, vol: 0.9 },

  // КҮЛКІЛІ ҚҰЛАУ: тайып, ауада айналып күмп етеді!
  { id: "x-slip", at: B.sh11 - 0.05, vol: 1.0 },
  { id: "u-slam", at: B.sh11 + 0.35, vol: 1.0 },
  { id: "s-boing", at: B.sh11 + 0.6, vol: 0.85 },

  // Ерасыл мұзда жатыр
  { id: "s-ping", at: W("e5", 0) - 0.05, vol: 0.75 },
  { id: "s-pop", at: W("e5", 7) - 0.05, vol: 0.75 },

  // Аружан күледі
  { id: "s-pop", at: W("a4", 0) - 0.05, vol: 0.85 },

  // Романтикалық жылы сезім: қолын созу
  { id: "x-chime", at: B.sh14 - 0.1, vol: 0.95 },
  { id: "x-romantic", at: B.sh14 + 0.1, len: 4.5, fadeIn: 0.5, fade: 0.8, vol: 0.7 },

  // Ерасыл қызарып тұрады
  { id: "v-sparkle", at: W("e6", 0) - 0.05, vol: 0.85 },

  // Бірге сырғанау
  { id: "x-skate", at: B.sh16 + 0.2, len: 4.0, fadeIn: 0.4, fade: 0.6, vol: 0.8 },
  { id: "v-sparkle", at: W("a5", 2) - 0.05, vol: 0.85 },

  // Қос жүрек
  { id: "x-heartbeat", at: B.sh17, vol: 0.7 },
  { id: "x-skate", at: B.sh17 + 0.1, len: 3.5, fadeIn: 0.3, fade: 0.5, vol: 0.8 },

  // Нәтиже экраны
  { id: "w-vs", at: C0 + 0.15, vol: 0.9 },
  { id: "s-pop", at: W("n7", 2), vol: 0.7 },
  { id: "s-ping", at: W("n7", 5) - 0.05, vol: 0.8 },

  // Пікір карточкасы
  { id: "s-whoosh", at: V0 - 0.2, vol: 0.9 },
  { id: "s-music", at: V0, len: END - V0, fadeIn: 0.3, fade: 2, loop: true, vol: 0.85 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: V0 + (18 + i * 12) / FPS, vol: 0.7 })),
  { id: "s-ping", at: W("n8", 10), vol: 0.9 },
  { id: "s-pop", at: W("n8", 14), vol: 0.7 },
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
