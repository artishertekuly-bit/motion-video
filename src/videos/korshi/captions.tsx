// One word at a time, white bold with a black outline in the lower middle (the reference channel's caption style).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MONT } from "../../qagaz/theme";
import raw from "./words.json";

type W = { w: string; s: number; e: number; spk: string };
const WORDS = (raw as W[]).filter((x) => x.w !== "—");
const FPS = 30;
const clean = (w: string) => w.replace(/[.,!?:;…]+$/g, "").replace(/\.\.\.$/, "");
export const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  let cur: W | null = null;
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i], next = WORDS[i + 1];
    const end = next && next.s - w.e < 0.45 ? next.s : w.e + 0.18;
    if (t >= w.s - 0.03 && t < end) { cur = w; break; }
  }
  if (!cur) return null;
  const k = Math.min(1, (t - cur.s + 0.03) * 30 / 3); // 3-frame pop
  const voice = cur.spk !== "n";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1180, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{
          fontFamily: MONT, fontWeight: 800, fontSize: 96, color: voice ? "#FFE36A" : "#FFFFFF", letterSpacing: 1,
          WebkitTextStroke: "14px #000", paintOrder: "stroke fill", transform: `scale(${0.88 + 0.12 * k})`, whiteSpace: "nowrap",
          textShadow: "0 6px 0 rgba(0,0,0,0.85)",
        }}>{clean(cur.w)}</span>
      </div>
    </AbsoluteFill>
  );
};
