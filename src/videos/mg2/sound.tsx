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
  // ілмек: бор «10 ҚАТЕ = 5», Нұрлыбек «Алақай!», сынып күлкісі
  { id: "x-chalk", at: 0, len: 0.9, fade: 0.15, vol: 1 },
  { id: "s-music", at: 0.6, len: C0 - 0.6, fadeIn: 1.5, fade: 0.8, loop: true, vol: 0.45 },
  { id: "s-boing", at: W("t1", 7) - 0.05, vol: 0.45 },
  { id: "s-whoosh", at: B.sh02 - 0.05, vol: 0.65 },
  { id: "v-sparkle", at: W("u1", 0), vol: 0.55 },
  { id: "x-laugh", at: B.sh03 - 0.1, len: 1.7, fade: 0.5, vol: 0.95 },
  // Әлихан, күнделік
  { id: "s-pop", at: W("n1", 6) - 0.1, vol: 0.8 },
  { id: "s-boing", at: W("n1", 8) - 0.05, vol: 0.5 },
  // шарт және таймер «10:00»
  { id: "s-stamp", at: W("t2", 10) - 0.05, vol: 0.6 },
  { id: "s-ping", at: W("t2", 13) - 0.05, vol: 0.7 },
  { id: "s-tick", at: W("t2", 13), len: 2.4, fade: 0.4, loop: true, vol: 0.6 },
  // Нұрлыбек: «100°C» → абайсызда дұрыс!
  { id: "s-pop", at: W("u2", 0) - 0.08, vol: 0.7 },
  { id: "w-correct", at: B.sh06, vol: 0.75 },
  { id: "s-boing", at: B.sh06 + 0.18, vol: 0.85 },
  // Томирис
  { id: "x-scribble", at: B.sh07 + 0.15, len: 1.76, fade: 0.3, vol: 0.85 },
  { id: "s-boing", at: W("o1", 6) - 0.05, vol: 0.55 },
  { id: "x-laugh", at: W("o1", 10) + 0.35, len: 1.5, fade: 0.5, vol: 0.85 },
  // Санжар, телефон
  { id: "s-whoosh", at: W("s1", 0) - 0.15, vol: 0.6 },
  { id: "s-boing", at: W("s1", 3) - 0.05, vol: 0.55 },
  // көзілдірік, Әлиханның оқулығы
  { id: "v-sparkle", at: B.sh10 + 0.2, vol: 0.4 },
  ...[0, 1, 2].map((i) => ({ id: "s-pop", at: B.sh11 + (4 + i * 14) / FPS, vol: 0.7 })),
  // «Бір минут қалды!», қол көтерілді
  { id: "s-tick", at: W("n7", 0) - 0.1, len: 2.6, fade: 0.4, loop: true, vol: 0.85 },
  { id: "s-ping", at: W("n7", 8) - 0.05, vol: 0.65 },
  // Әлихан: «10 / 10 ҚАТЕ!»
  { id: "s-pop", at: W("a1", 6) - 0.1, vol: 0.75 },
  { id: "x-ooh", at: B.sh14 - 0.05, vol: 0.85 },
  // журнал: «5»
  { id: "s-whoosh", at: B.sh15 + 0.05, vol: 0.6 },
  { id: "s-stamp", at: B.sh15 + 0.3, vol: 0.9 },
  { id: "s-pop", at: W("t3", 6) - 0.1, vol: 0.7 },
  // «жаттап алды»
  { id: "w-correct", at: W("n8", 4) - 0.1, vol: 0.85 },
  { id: "v-sparkle", at: W("n8", 5), vol: 0.6 },
  // тақта: тақ-тақ, бор
  { id: "x-tap", at: B.sh18 + 0.15, vol: 0.9 },
  { id: "x-chalk", at: B.sh19 + 0.25, len: 0.7, fade: 0.15, vol: 0.8 },
  { id: "x-chalk", at: W("t4", 0) - 0.05, len: 1.3, fade: 0.2, vol: 0.55 },
  // қоңырау, соңғы карточка
  { id: "x-bell", at: C0 - 0.2, len: 1.6, fade: 0.5, vol: 0.55 },
  { id: "s-music", at: C0 + 0.3, len: END - C0 - 0.3, fadeIn: 0.4, fade: 1.6, loop: true, vol: 0.7 },
  { id: "s-ping", at: W("n9", 10) - 0.05, vol: 0.8 },
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
