import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BIG_Y, C, CAPTION_Y, MONT, OSW } from "../qagaz/theme";
import { AUDIO, BIG_WORDS, CUTS, DURATION, sec, START } from "./timeline";

// «|» — новая порция; «%» — жёлтое ключевое слово. Слов столько же, сколько в таймингах голоса.
// n5 не здесь: в финале он идёт большой надписью (FinalCard).
const DEFS: { id: string; text: string; who: "n" | "b" | "d" | "t" }[] = [
  { id: "b1", who: "b", text: "Әке, | қараңызшы! | Мен %сурет салдым!" },
  { id: "d1", who: "d", text: "%Кейін, балам." },
  { id: "n1", who: "n", text: "Айбардың әкесі — | жақсы адам. | Тек оның | ең жиі айтатын сөзі — | %кейін." },
  { id: "b2", who: "b", text: "Әке, ертең | мектепте | %көрме болады!" },
  { id: "d2", who: "d", text: "%Кейін, %кейін. | Кешігіп барамын." },
  { id: "b3", who: "b", text: "Әке, ертең | %келесіз бе?" },
  { id: "d3", who: "d", text: "Көрерміз. | %Кейін айтам." },
  { id: "n2", who: "n", text: "Айбар суретін | бүктеп, | рюкзагына салды." },
  { id: "n3", who: "n", text: "Ертеңіне | мектептен хабарласты." },
  { id: "t1", who: "t", text: "Айбардың суреті | %бірінші %орын алды. | Келіп көріңізші." },
  { id: "b4", who: "b", text: "Ұнамады ма? | Мейлі... | %кейін қарарсыз." },
  { id: "d4", who: "d", text: "Жоқ, балам. | %Қазір." },
  { id: "n4", who: "n", text: "Сол кеші телефон | алғаш рет | сөреде %жалғыз жатты." },
];
const BUBBLE: Record<string, string> = { b: "rgba(46,62,102,0.92)", d: "rgba(52,56,66,0.92)", t: "rgba(122,46,58,0.92)" };

type Tok = { text: string; key: boolean; s: number };
type Chunk = { toks: Tok[]; from: number; to: number; fade: boolean; who: string };

const CHUNKS: Chunk[] = (() => {
  const all: Chunk[] = [];
  for (const d of DEFS) {
    const words = AUDIO[d.id].words;
    const parts = d.text.split("|").map((s) => s.trim().split(/\s+/));
    const count = parts.reduce((a, b) => a + b.length, 0);
    if (count !== words.length) throw new Error(`captions ${d.id}: ${count} tokens vs ${words.length} words`);
    let k = 0;
    for (const part of parts) {
      const toks: Tok[] = [];
      for (const raw of part) {
        const w = words[k++];
        if (raw === "—" && toks.length) {
          toks[toks.length - 1].text += " —";
          continue;
        }
        const key = raw.startsWith("%");
        toks.push({ text: key ? raw.slice(1) : raw, key, s: sec(START[d.id] + w.start) });
      }
      const lastF = sec(START[d.id] + words[k - 1].end);
      const cut = CUTS.find((c) => c > lastF) ?? Infinity;
      all.push({ toks, from: toks[0].s - 2, to: Math.min(lastF + 12, cut), fade: true, who: d.who });
    }
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
  const bubble = c.who !== "n";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAPTION_Y - 200,
          height: 400,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(8,5,2,0.4) 30%, rgba(8,5,2,0.4) 70%, rgba(0,0,0,0) 100%)",
          opacity: out * inn * (bubble ? 0 : 1),
        }}
      />
      <div style={{ position: "absolute", left: 90, right: 150, top: CAPTION_Y - 90, height: 180, display: "flex", justifyContent: "center", alignItems: "center", opacity: out }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 20,
            rowGap: 4,
            padding: bubble ? "18px 34px" : 0,
            borderRadius: 40,
            background: bubble ? BUBBLE[c.who] : "none",
            boxShadow: bubble ? "0 10px 30px rgba(0,0,0,0.35)" : "none",
          }}
        >
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
                  color: t.key ? C.amber : C.white,
                  opacity: 0.5 + 0.5 * k,
                  transform: `translateY(${(1 - k) * 10}px) scale(${0.94 + 0.06 * k})`,
                  textShadow: bubble ? "none" : "0 3px 14px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)",
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

// «КЕЙІН» — штамп, каждый раз крупнее и с дрожью; «ҚАЗІР» — тёплое свечение
export const BigWords: React.FC<{ f: number }> = ({ f }) => {
  const b = BIG_WORDS.find((x) => f >= x.from && f < x.to);
  if (!b) return null;
  const inK = interpolate(f, [b.from, b.from + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outK = interpolate(f, [b.to - 6, b.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const life = (f - b.from) / Math.max(1, b.to - b.from);
  const shake = b.warm ? 0 : Math.max(0, 1 - (f - b.from) / 8) * 10 * (f % 2 ? 1 : -1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: (b.y ?? BIG_Y) - 130,
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: OSW,
          fontWeight: 700,
          fontSize: b.size,
          letterSpacing: 4 + 6 * life,
          color: b.warm ? C.amber : C.white,
          opacity: inK * outK,
          transform: `translateX(${shake}px) scale(${(b.warm ? 1.3 : 1.5) - (b.warm ? 0.3 : 0.5) * inK + 0.03 * life}) rotate(${b.warm ? 0 : -3 + 3 * inK}deg)`,
          textShadow: b.warm ? "0 0 60px rgba(255,190,90,0.85), 0 6px 26px rgba(0,0,0,0.6)" : "0 0 30px rgba(120,170,255,0.45), 0 6px 26px rgba(0,0,0,0.85)",
          whiteSpace: "nowrap",
        }}
      >
        {b.text}
      </div>
    </AbsoluteFill>
  );
};

// Финал: «Бүгін балаңа "кейін" десең — ертең ол саған "кейін" дейді.» по словам голоса
const FINAL = [
  ["Бүгін", "балаңа", "«кейін»", "десең —"],
  ["ертең", "ол", "саған", "«кейін»", "дейді."],
];
export const FinalCard: React.FC<{ f: number }> = ({ f }) => {
  const w = AUDIO.n5.words;
  const s0 = sec(START.n5);
  if (f < s0 - 12) return null;
  const dim = interpolate(f, [s0 - 12, s0 + 6], [0, 0.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let k = 0;
  const fadeOut = interpolate(f, [DURATION - 16, DURATION - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#0B0705", opacity: dim }} />
      <div style={{ position: "absolute", left: 80, right: 150, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: fadeOut }}>
        {FINAL.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22 }}>
            {line.map((t) => {
              const ww = w[Math.min(k++, w.length - 1)];
              const at = s0 + sec(ww.start);
              const a = interpolate(f - at, [-4, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const key = t.includes("кейін");
              return (
                <span
                  key={t + li}
                  style={{
                    fontFamily: MONT,
                    fontWeight: 800,
                    fontSize: 84,
                    lineHeight: 1.12,
                    color: key ? C.amber : C.white,
                    opacity: a,
                    transform: `translateY(${(1 - a) * 18}px)`,
                    textShadow: "0 4px 22px rgba(0,0,0,0.8)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
