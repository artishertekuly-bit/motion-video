import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BIG_Y, C, CAPTION_Y, MONT, OSW } from "./theme";
import { AUDIO, BIG_WORDS, sec, START } from "./timeline";

// Разметка: «|» — новая порция субтитра; «%» перед словом — жёлтое (ключевое) слово.
// Количество слов должно совпадать с таймингами голоса.
const DEFS: { id: string; text: string }[] = [
  { id: "s1", text: "Кешіріңіз, | ағай!" },
  { id: "m1", text: "Бұл қағаздардың | %мәні %жоқ қой." },
  { id: "j1", text: "Қалайша, ағай? | Бұл — жоспарлар, | есептер… | Бәрі керек қой." },
  { id: "m2", text: "%Қағазды құтқарам деп, | %баланы құлатып кеттің." },
  { id: "m3", text: "Ол бала | сабағына асықты. | Сені де сыныпта | %балалар %күтіп отыр." },
  { id: "m4", text: "Ұстаздың шеберлігі — | қағазда емес. | Сыныпқа кірген сәттегі | %алғашқы %сөзіңде, | балаға қараған | %көзқарасыңда." },
  { id: "m5", text: "Абырой | бұйрықпен келмейді. | Оны %балалар | %өздері береді — | күн сайын, | аздап-аздап." },
  { id: "m6", text: "Ал бір сәт | балаға немқұрайлы | қарасаң — | ол %қағаздай | %шашылады." },
  { id: "j2", text: "Мұның бәрін маған | неге айттыңыз?" },
  { id: "m7", text: "Мен де кезінде | дәл осылай | жүгіргенмін." },
  { id: "m8", text: "Сен бұл | шұңқырдан | әлі %шыға %аласың." },
  { id: "j3", text: "Кешіріңіз, | ағай." },
];

type Tok = { text: string; key: boolean; s: number };
type Chunk = { toks: Tok[]; from: number; to: number };

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
      const last = words[k - 1];
      all.push({ toks, from: toks[0].s - 2, to: sec(START[d.id] + last.end) + 12 });
    }
  }
  all.sort((a, b) => a.from - b.from);
  for (let i = 0; i + 1 < all.length; i++) all[i].to = Math.min(all[i].to, all[i + 1].from);
  return all;
})();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const out = interpolate(f, [c.to - 4, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          top: CAPTION_Y - 90,
          height: 180,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "center",
          columnGap: 22,
          rowGap: 4,
          opacity: out,
        }}
      >
        {c.toks.map((t, i) => {
          const d = f - t.s;
          const k = interpolate(d, [-2, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span
              key={i}
              style={{
                fontFamily: MONT,
                fontWeight: 800,
                fontSize: 66,
                lineHeight: 1.15,
                color: t.key ? C.amber : C.white,
                opacity: 0.15 + 0.85 * k,
                transform: `translateY(${(1 - k) * 10}px) scale(${0.94 + 0.06 * k})`,
                textShadow: "0 3px 14px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Большие слова: ШЕБЕРЛІК, АБЫРОЙ, ШҰҢҚЫР
export const BigWords: React.FC<{ f: number }> = ({ f }) => {
  const b = BIG_WORDS.find((x) => f >= x.from && f < x.to);
  if (!b) return null;
  const inK = interpolate(f, [b.from, b.from + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outK = interpolate(f, [b.to - 6, b.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const life = (f - b.from) / Math.max(1, b.to - b.from);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: BIG_Y - 110,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: OSW,
          fontWeight: 700,
          fontSize: 176,
          letterSpacing: 4 + 6 * life,
          color: C.white,
          opacity: inK * outK,
          transform: `scale(${1.18 - 0.18 * inK + 0.03 * life})`,
          textShadow: `0 0 40px rgba(255,190,90,0.55), 0 6px 26px rgba(0,0,0,0.8)`,
          whiteSpace: "nowrap",
        }}
      >
        {b.text}
      </div>
    </AbsoluteFill>
  );
};
