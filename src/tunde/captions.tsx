import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CAPTION_Y, MONT } from "../qagaz/theme";
import { CAVEAT } from "../keyin/props";
import { AUDIO, DURATION, END_CARD, SHOTS, START, sec, ws } from "./timeline";

// «|» — новая порция; % — бледно-зелёное (страх), $ — красное. Слов столько же, сколько в таймингах голоса.
type Who = "n" | "dam" | "mol" | "ata" | "apai";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "h1", who: "dam", text: "Естідің бе?.. | %Қоңырау соғылып тұр. | %Түн %ортасында." },
  { id: "n1", who: "n", text: "Бұл оқиға | тоғызыншы сыныпта болған. | Біз үшеуміз | мектеп мерейтойына | сахна безендіріп, | %кешігіп %қалдық." },
  { id: "n2", who: "n", text: "Тазалықшы апай | бізді байқамай, | есікті сыртынан | $құлыптап кетті." },
  { id: "m1", who: "mol", text: "$Желі $жоқ... | Енді не істейміз?" },
  { id: "n3", who: "n", text: "%Біріншісі — бор. | Тақтаға %өзі жаза бастады." },
  { id: "n4", who: "n", text: "%Екіншісі — қадам дыбысы. | Жоғарғы қабатта. | Ал онда | $ешкім жоқ еді." },
  { id: "n5", who: "n", text: "%Үшіншісі — | түн ортасында | $қоңырау соғылды." },
  { id: "d1", who: "dam", text: "$Қаш!" },
  { id: "a1", who: "ata", text: "Әй, балалар! | Түн ортасында | мұнда не істеп жүрсіңдер?" },
  { id: "n6", who: "n", text: "Ол бізді артқы есіктен | шығарып салды. | Дамирдың қолына | %шамын ұстатып, | бір-ақ сөз айтты:" },
  { id: "a2", who: "ata", text: "%Түнде %мектеп — | %басқалардікі." },
  { id: "n7", who: "n", text: "Ертеңіне біз | күзетші атаға | рахмет айтуға бардық." },
  { id: "t1", who: "apai", text: "Қандай күзетші? | Сәкен ата | он жыл бұрын | $дүниеден өткен ғой..." },
];
const BASE: Record<Who, string> = { n: "#FFFFFF", dam: "#D7FFE0", mol: "#FFFFFF", ata: "#FFE1B0", apai: "#FFFFFF" };
const KEY = { "%": "#A6F2BF", $: "#FF5A5A" } as const;

type Tok = { text: string; color: string; s: number };
type Chunk = { toks: Tok[]; from: number; to: number; fade: boolean; who: Who };
const CUTS = SHOTS.map((s) => s.from);

const CHUNKS: Chunk[] = (() => {
  const all: Chunk[] = [];
  for (const d of DEFS) {
    const words = AUDIO[d.id].words;
    const parts = d.text.split("|").map((s) => s.trim().split(/\s+/));
    const count = parts.reduce((a, b) => a + b.length, 0);
    if (count !== words.length) throw new Error(`captions ${d.id}: ${count} tokens vs ${words.length} words`);
    let k = 0;
    parts.forEach((part, pi) => {
      const toks: Tok[] = [];
      for (const raw of part) {
        const w = words[k++];
        if (raw === "—" && toks.length) {
          toks[toks.length - 1].text += " —";
          continue;
        }
        const m = raw[0] as "%" | "$";
        const key = m === "%" || m === "$";
        toks.push({ text: key ? raw.slice(1) : raw, color: key ? KEY[m] : BASE[d.who], s: sec(START[d.id] + w.start) });
      }
      if (d.who !== "n") {
        if (pi === 0) toks[0].text = "«" + toks[0].text;
        if (pi === parts.length - 1) toks[toks.length - 1].text += "»";
      }
      const lastF = sec(START[d.id] + words[k - 1].end);
      const cut = CUTS.find((c) => c > lastF + 2) ?? Infinity;
      all.push({ toks, from: toks[0].s - 2, to: Math.min(lastF + 14, cut), fade: true, who: d.who });
    });
  }
  all.sort((a, b) => a.from - b.from);
  for (let i = 0; i + 1 < all.length; i++) {
    if (all[i + 1].from <= all[i].to + 3) {
      all[i].to = all[i + 1].from;
      all[i].fade = false;
    }
  }
  return all;
})();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const prev = CHUNKS[CHUNKS.indexOf(c) - 1];
  const out = c.fade ? interpolate(f, [c.to - 4, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const inn = prev && !prev.fade ? 1 : interpolate(f, [c.from, c.from + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAPTION_Y - 210,
          height: 420,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(2,4,10,0.55) 32%, rgba(2,4,10,0.55) 68%, rgba(0,0,0,0) 100%)",
          opacity: out * inn,
        }}
      />
      <div style={{ position: "absolute", left: 80, right: 150, top: CAPTION_Y - 95, height: 190, display: "flex", justifyContent: "center", alignItems: "center", opacity: out }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 20, rowGap: 2 }}>
          {c.toks.map((t, i) => {
            const k = interpolate(f - t.s, [-3, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 800,
                  fontSize: 72,
                  lineHeight: 1.15,
                  color: t.color,
                  opacity: 0.38 + 0.62 * k,
                  transform: `translateY(${(1 - k) * 8}px)`,
                  textShadow: t.color === BASE.n ? "0 3px 16px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)" : `0 0 22px ${t.color}55, 0 3px 16px rgba(0,0,0,0.9)`,
                  whiteSpace: "nowrap",
                }}
              >
                {t.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Счётчик «1 · 2 · 3» мелом
const COUNTS = [
  { n: "1", from: ws("n3", 0) - 2, to: ws("n3", 3) + 6 },
  { n: "2", from: ws("n4", 0) - 2, to: ws("n4", 4) - 3 },
  { n: "3", from: ws("n5", 0) - 2, to: ws("n5", 4) - 4 },
];
export const Counter: React.FC<{ f: number }> = ({ f }) => {
  const c = COUNTS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const k = interpolate(f, [c.from, c.from + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(f, [c.to - 5, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jit = (f % 4) - 1.5;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 250,
          textAlign: "center",
          fontFamily: CAVEAT,
          fontWeight: 700,
          fontSize: 330,
          lineHeight: 1,
          color: "#F1F5F0",
          opacity: k * o * 0.95,
          transform: `scale(${1.35 - 0.35 * k}) translateX(${jit}px) rotate(-4deg)`,
          textShadow: "0 0 30px rgba(166,242,191,0.45), 0 8px 30px rgba(0,0,0,0.8)",
        }}
      >
        {c.n}
      </div>
    </AbsoluteFill>
  );
};

// Финальная фраза (n8) — крупно по словам, затем карточка
export const FinalCard: React.FC<{ f: number }> = ({ f }) => {
  const id = "n8";
  const s0 = sec(START[id]);
  if (f < s0 - 10) return null;
  const words = AUDIO[id].words;
  const lines: { text: string; at: number; key: boolean }[][] = [[], []];
  let li = 0;
  words.forEach((w, i) => {
    const at = s0 + sec(w.start);
    if (w.word === "—") {
      const L = lines[li];
      L[L.length - 1].text += " —";
      return;
    }
    lines[li].push({ text: w.word, at, key: /білмеймін|білемін/.test(w.word) });
    if (/білмеймін/.test(w.word) && i < words.length - 1) li = 1;
  });
  const dim = interpolate(f, [s0 - 10, s0 + 8], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toCard = interpolate(f, [END_CARD - 8, END_CARD + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [DURATION - 16, DURATION - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1 = interpolate(f - END_CARD, [2, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c2 = interpolate(f - END_CARD, [14, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#03050A", opacity: Math.max(dim, toCard * 0.92) }} />
      <div style={{ position: "absolute", left: 80, right: 150, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: 1 - toCard }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 20 }}>
            {line.map((t, j) => {
              const a = interpolate(f - t.at, [-4, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span
                  key={j}
                  style={{
                    fontFamily: MONT,
                    fontWeight: 800,
                    fontSize: 80,
                    lineHeight: 1.12,
                    color: t.key ? (i === 0 ? "#A6F2BF" : "#FFE1B0") : "#FFFFFF",
                    opacity: a,
                    transform: `translateY(${(1 - a) * 16}px)`,
                    textShadow: "0 4px 22px rgba(0,0,0,0.85)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {f >= END_CARD - 2 ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 600, textAlign: "center", opacity: fadeOut }}>
          <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: "#FFFFFF", opacity: c1, transform: `scale(${1.15 - 0.15 * c1})`, textShadow: "0 0 40px rgba(166,242,191,0.35)" }}>
            ТҮНДЕ МЕКТЕП —
          </div>
          <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 104, lineHeight: 1.1, color: "#A6F2BF", opacity: c1, transform: `scale(${1.15 - 0.15 * c1})`, textShadow: "0 0 40px rgba(166,242,191,0.55)" }}>
            БАСҚАЛАРДІКІ
          </div>
          <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: 46, color: "rgba(255,255,255,0.9)", marginTop: 60, opacity: c2 }}>Сен түнде мектепте қалар ма едің?</div>
          <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: 36, color: "#FFE1B0", marginTop: 18, opacity: c2 }}>Пікірге жаз ↓</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
