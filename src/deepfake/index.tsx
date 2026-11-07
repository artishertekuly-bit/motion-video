import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { C } from "./theme";
import { CUTS, DURATION, END_CARD_F, FPS, SCENES, SceneId, cs, ws } from "./timeline";
import { Background, Glitch, Grain, TimeChip, flick, p } from "./ui";
import { Captions } from "./captions";
import { Sound } from "./sound";
import { S1 } from "./s1";
import { S2 } from "./s2";
import { S3 } from "./s3";
import { S4 } from "./s4";
import { S5 } from "./s5";
import { S6 } from "./s6";
import { S7 } from "./s7";
import { S8 } from "./s8";

const SCENE_C: Record<SceneId, React.FC<{ f: number }>> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8 };

const sceneAt = (f: number): SceneId => {
  for (const [id, [a, b]] of Object.entries(SCENES)) if (f >= a && f < b) return id as SceneId;
  return "s8";
};

type Mood = { tint: string; amt: number; city: number; dark: number };
const moodAt = (f: number, s: SceneId): Mood => {
  switch (s) {
    case "s1":
      return { tint: C.red, amt: 0.85, city: 1, dark: 0 };
    case "s2":
      return f < ws("n1", 11) ? { tint: C.cyan, amt: 0.3, city: 1, dark: 0 } : { tint: C.amber, amt: 0.3, city: 1, dark: 0 };
    case "s3":
      return { tint: C.red, amt: 0.75, city: 1, dark: 0 };
    case "s4":
      return { tint: C.red, amt: 0.55, city: 1, dark: 0 };
    case "s5":
      return f < ws("n5", 2) ? { tint: C.green, amt: 0.45, city: 1, dark: 0 } : { tint: C.amber, amt: 0.35, city: 1, dark: 0 };
    case "s6":
      return f < cs("key") ? { tint: C.cyan, amt: 0.2, city: 1, dark: 0 } : { tint: C.warm, amt: 0.25, city: 0, dark: 0.3 };
    case "s7":
      return f >= ws("n8", 0) - 4 && f < ws("n8", 4) - 2 ? { tint: C.warm, amt: 0.4, city: 1, dark: 0 } : { tint: C.warm, amt: 0.6, city: 0, dark: 0 };
    default:
      return f < ws("n10", 0) - 3 ? { tint: C.cyan, amt: 0.2, city: 1, dark: 0 } : { tint: C.amber, amt: 0.25, city: 1, dark: p(f, ws("n10", 7), 14) * 0.5 };
  }
};

const chipAt = (f: number, s: SceneId): { text: string; changedAt: number; opacity: number } => {
  if (f >= END_CARD_F) return { text: "", changedAt: 0, opacity: 0 };
  const T = (hhmm: string) => `КЕШ — ${hhmm}`;
  if (s === "s1") return { text: T("21:30"), changedAt: -99, opacity: flick(f, 3) };
  if (s === "s2") {
    const back = ws("n1", 4) - 2;
    return f < back ? { text: T("21:30"), changedAt: -99, opacity: 0 } : { text: T("21:30"), changedAt: back, opacity: 1 };
  }
  if (s === "s3" || s === "s4") return { text: T("21:31"), changedAt: SCENES.s3[0], opacity: 1 };
  if (s === "s5") return f < ws("n4", 4) ? { text: T("21:31"), changedAt: -99, opacity: 1 } : { text: T("21:32"), changedAt: ws("n4", 4), opacity: 1 };
  if (s === "s6") return f < cs("key") ? { text: T("21:33"), changedAt: SCENES.s6[0], opacity: 1 } : { text: T("21:34"), changedAt: cs("key"), opacity: 1 };
  if (s === "s7") return { text: T("21:34"), changedAt: -99, opacity: 1 };
  return f < ws("n10", 0) ? { text: T("21:35"), changedAt: SCENES.s8[0], opacity: 1 } : { text: "ЕРТЕҢ — ??:??", changedAt: ws("n10", 0), opacity: 1 };
};

export const Deepfake: React.FC = () => {
  const f = useCurrentFrame();
  const s = sceneAt(f);
  const mood = moodAt(f, s);
  const [a, b] = SCENES[s];
  const push = (f - a) / Math.max(1, b - a);
  const g = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(f - c) / 6), f >= END_CARD_F && f < END_CARD_F + 8 ? 1 - (f - END_CARD_F) / 8 : 0);
  const Scene = SCENE_C[s];
  const chip = chipAt(f, s);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Glitch f={f} amount={g} id="cut">
        <Background f={f} tint={mood.tint} tintAmt={mood.amt} city={mood.city} dark={f >= END_CARD_F ? 1 : mood.dark} />
        <AbsoluteFill style={{ transform: `scale(${1 + 0.025 * push})` }}>
          <Scene f={f} />
        </AbsoluteFill>
        <TimeChip f={f} text={chip.text} changedAt={chip.changedAt} opacity={chip.opacity} />
      </Glitch>
      <Captions f={f} />
      <Grain f={f} amount={0.06} />
      <Sound />
    </AbsoluteFill>
  );
};

export const DeepfakeComposition: React.FC = () => (
  <Composition id="Deepfake" component={Deepfake} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
