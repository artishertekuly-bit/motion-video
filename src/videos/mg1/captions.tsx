import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440; // субтитры ниже — над ними герой, сверху таймер

// «|» — порция; «%» — жёлтое слово. Количество слов = тайминги голоса.
type Who = "n" | "t" | "a" | "o" | "s" | "u";
// t5 and n9 have no captions: the board and the end card show the same words
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "t1", who: "t", text: "Екі қосу | екі — %бес. | %Дәлелдеңдер! | Кім дәлелдесе — | тоқсандық бағасы | %бес." },
  { id: "n1", who: "n", text: "Соңғы партада — | %Әлихан. | Күнделігінде — | %үш %екілік. | Тоқсандық %бес | оған %ауадай %керек." },
  { id: "t2", who: "t", text: "Қоңырауға дейін — | %он %бес %минут. | Бастаңдар." },
  { id: "n2", who: "n", text: "%Томирис | бір бет | %формула жазды." },
  { id: "o1", who: "o", text: "Ағай... | бұл %мүмкін %емес қой!" },
  { id: "n3", who: "n", text: "%Санжар | %телефонын | партаның астына тықты." },
  { id: "s1", who: "s", text: "Ағай, | %интернетте жазылған! | Екі қосу екі — %бес!" },
  { id: "t3", who: "t", text: "Интернетте | %жер %жалпақ | деп те жазылған." },
  { id: "n4", who: "n", text: "%Нұрлыбек | ең %мықты %дәлелді | тапты." },
  { id: "u1", who: "u", text: "Ағай, сіз — | %барыссыз! | Барыс айтса, | бәрі %дұрыс!" },
  { id: "n5", who: "n", text: "Барыс ағай тек | %көзілдірігін түзеді. | Ал %Әлихан... | %қарындаш санап отыр." },
  { id: "n6", who: "n", text: "%Бес %минут қалды. | Сол кезде | соңғы партадан | бір %қол көтерілді." },
  { id: "a1", who: "a", text: "Ағай... | бұл %қате. | Мен санап көрдім. | Екі қосу екі — %төрт." },
  { id: "n7", who: "n", text: "Сынып %күліп жіберді. | Енді оған | %бес %жоқ." },
  { id: "t4", who: "t", text: "Мен %«дәлелдеңдер» дедім. | Ол %дәлелдеді — | бұл %қате." },
  { id: "n8", who: "n", text: "Әлихан өмірінде | %бірінші %рет — | %бес алды." },
];
const BUBBLE: Record<Who, string | null> = { n: null, t: "rgba(64,48,72,0.95)", a: "rgba(46,62,102,0.95)", o: "rgba(196,72,120,0.95)", s: "rgba(74,84,100,0.95)", u: "rgba(200,69,47,0.95)" };

type Tok = { text: string; key: boolean; s: number };
type Chunk = { toks: Tok[]; from: number; to: number; fade: boolean; who: Who };
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
      all.push({ toks, from: toks[0].s - 2, to: Math.min(lastF + 10, cut), fade: true, who: d.who });
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

// Как в TikTok-сериалах: крупно, ЗАГЛАВНЫМИ, белый с чёрной обводкой, ключевые слова жёлтые
export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const out = c.fade ? interpolate(f, [c.to - 3, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const pop = interpolate(f, [c.from, c.from + 4], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bubble = BUBBLE[c.who];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 80, right: 150, top: CAP_Y - 90, height: 180, display: "flex", justifyContent: "center", alignItems: "center", opacity: out }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 18,
            rowGap: 2,
            padding: bubble ? "16px 32px" : 0,
            borderRadius: 40,
            background: bubble ?? "none",
            transform: `scale(${pop})`,
          }}
        >
          {c.toks.map((t, i) => {
            const k = interpolate(f - t.s, [-3, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 800,
                  fontSize: 70,
                  lineHeight: 1.12,
                  textTransform: "uppercase",
                  color: t.key ? "#FFD84A" : C.white,
                  opacity: 0.55 + 0.45 * k,
                  WebkitTextStroke: bubble ? "0px" : "3px #120C06",
                  paintOrder: "stroke fill",
                  textShadow: bubble ? "none" : "0 5px 0 rgba(0,0,0,0.55)",
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
