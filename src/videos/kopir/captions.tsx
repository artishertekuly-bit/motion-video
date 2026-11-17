// Documentary style subtitles for «Көпір»
import React from "react";
import { AbsoluteFill } from "remotion";
import { AUDIO, START, FPS, shotStart } from "./timeline";

const MONT = "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

type Speaker = { name: string; bg: string; color: string; border: string };
const SPEAKERS: Record<string, Speaker> = {
  g: { name: "ГҮЛНАР СЕРІКҚЫЗЫ", bg: "rgba(102, 24, 38, 0.95)", color: "#FFD84A", border: "#FFD84A" },
  a: { name: "АРУЖАН", bg: "rgba(22, 38, 70, 0.95)", color: "#FFFFFF", border: "#7AA2F7" },
  e: { name: "ЕРМЕК", bg: "rgba(20, 60, 40, 0.95)", color: "#FFFFFF", border: "#4CD98A" },
  grp: { name: "СЫНЫПТАСТАР", bg: "rgba(40, 44, 60, 0.95)", color: "#FFD84A", border: "#FFD84A" },
  nar: { name: "ДИКТОР", bg: "rgba(15, 18, 30, 0.92)", color: "#F4F1EA", border: "rgba(255,255,255,0.4)" },
  dina: { name: "ДИНА (ЫМ-ИШАРАМЕН) 🤲", bg: "rgba(28, 48, 80, 0.95)", color: "#FFD84A", border: "#4CD98A" },
};

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;

  // 1. Check special sign language subtitle for Dina in Shot 18
  const dStart = shotStart("sh18") / FPS + 0.3;
  const dEnd = shotStart("sh19") / FPS - 0.2;
  if (t >= dStart && t < dEnd) {
    const sp = SPEAKERS.dina;
    const anim = cl((t - dStart) / 0.2);
    return (
      <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
        <div style={{
          position: "absolute", left: 0, width: 1080, bottom: 210,
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: anim, transform: `translateY(${(1 - anim) * 15}px)`,
        }}>
          <div style={{
            background: sp.bg, border: `2.5px solid ${sp.border}`, borderRadius: 18,
            padding: "5px 22px", fontFamily: MONT, fontWeight: 800, fontSize: 24,
            color: sp.color, letterSpacing: 1.5, marginBottom: 8,
            boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
          }}>
            {sp.name}
          </div>
          <div style={{
            maxWidth: 960, background: "rgba(10, 14, 26, 0.94)",
            border: "2px solid rgba(255,255,255,0.25)", borderRadius: 24,
            padding: "16px 36px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
          }}>
            <span style={{
              fontFamily: MONT, fontWeight: 800, fontSize: 40, lineHeight: 1.35,
              color: "#FFFFFF",
            }}>
              «Орталықты күшейту керек еді.»
            </span>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 2. Check regular spoken dialogue
  for (const [id, start] of Object.entries(START)) {
    const meta = AUDIO[id];
    if (!meta || !meta.words) continue;
    const dur = meta.duration;
    if (t >= start && t < start + dur + 0.35) {
      const rel = t - start;
      const curWord = meta.words.find((w) => rel >= w.start - 0.05 && rel <= w.end + 0.05);
      const spKey = id.startsWith("grp") ? "grp" : id[0];
      const sp = SPEAKERS[spKey] ?? SPEAKERS.nar;

      // Group words into short 4-6 word readable chunks
      const chunkWords: typeof meta.words = [];
      const curIdx = curWord ? meta.words.indexOf(curWord) : 0;
      const chunkStart = Math.max(0, Math.floor(curIdx / 5) * 5);
      const chunkEnd = Math.min(meta.words.length, chunkStart + 5);
      for (let k = chunkStart; k < chunkEnd; k++) chunkWords.push(meta.words[k]);

      return (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
          <div style={{
            position: "absolute", left: 0, width: 1080, bottom: 200,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              background: sp.bg, border: `2.5px solid ${sp.border}`, borderRadius: 18,
              padding: "5px 22px", fontFamily: MONT, fontWeight: 800, fontSize: 24,
              color: sp.color, letterSpacing: 1.5, marginBottom: 8,
              boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
            }}>
              {sp.name}
            </div>
            <div style={{
              maxWidth: 960, background: "rgba(10, 14, 26, 0.94)",
              border: "2px solid rgba(255,255,255,0.22)", borderRadius: 24,
              padding: "16px 36px", textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
            }}>
              {chunkWords.map((w, idx) => {
                const isHighlight = rel >= w.start - 0.03 && rel <= w.end + 0.06;
                return (
                  <span
                    key={idx}
                    style={{
                      fontFamily: MONT,
                      fontWeight: 800,
                      fontSize: 38,
                      lineHeight: 1.35,
                      color: isHighlight ? "#FFD84A" : "rgba(255,255,255,0.92)",
                      textShadow: isHighlight ? "0 0 16px rgba(255,216,74,0.6)" : "none",
                      margin: "0 6px",
                      display: "inline-block",
                      transform: isHighlight ? "scale(1.04)" : "scale(1)",
                      transition: "transform 0.08s ease-out",
                    }}
                  >
                    {w.word}
                  </span>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      );
    }
  }

  return null;
};
