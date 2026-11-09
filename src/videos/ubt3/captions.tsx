import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420; // субтитры ниже — над ними герой, сверху табло

// «|» — порция; «%» — жёлтое слово. Количество слов = тайминги голоса.
type Who = "n" | "a" | "e" | "l" | "m";
// n11 has no captions: the VS screen shows the same numbers
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Үшінші күн. | ҰБТ-ға | %жиырма %сегіз | күн қалды." },
  { id: "n2", who: "n", text: "Сендер | таңдадыңдар: | %таңғы %жетіде | %Аружанмен | бірге оқу." },
  { id: "n3", who: "n", text: "%Оятқыш %жоқ. | Сондықтан Ерасыл | түні бойы | %ұйықтамады. | Сағат %төртте | %дайын отырды." },
  { id: "m1", who: "m", text: "Ойбай! | Ерасыл? | Сағат %төрт %қой!" },
  { id: "n4", who: "n", text: "Ол әкесінің | %костюмін киді. | Әкесінің | %әтірін септі. | %Жарты %бөтелке." },
  { id: "n5", who: "n", text: "%Таңғы %жеті. | Аружан | кітапханада | күтіп отыр." },
  { id: "n6", who: "n", text: "Есік ашылды. | Алдымен | %иіс %кірді. | Сосын Ерасыл." },
  { id: "n7", who: "n", text: "Апайдың | %гүлі | %солып қалды." },
  { id: "a1", who: "a", text: "%Апчхи! | Ерасыл... | бұл не иіс?" },
  { id: "e1", who: "e", text: "Бұл... | %білімнің %иісі." },
  { id: "l1", who: "l", text: "Балам, | білімнің иісі | %мұндай %болмайды." },
  { id: "n8", who: "n", text: "Апай | терезенің бәрін | %ашты. | Сыртта — | %минус %он %бес." },
  { id: "a2", who: "a", text: "Бірінші есеп. | Икс квадрат — | қырық тоғыз. | Икс | %нешеге %тең?" },
  { id: "n9", who: "n", text: "Ерасылдың миы | %жүктеле %бастады." },
  { id: "e2", who: "e", text: "%Жеті!" },
  { id: "n10", who: "n", text: "%Дұрыс! | Өмірінде | %бірінші %рет. | Өз басымен." },
  { id: "a3", who: "a", text: "Жарайсың! | Бірақ | %минус %жеті | де бар." },
  { id: "a4", who: "a", text: "Жұма күні | %сынақ %тест. | Кім көп | балл алса — | сол %тілек | айтады." },
  { id: "e3", who: "e", text: "%Келістік!" },
  { id: "n12", who: "n", text: "Төртінші күнді | %қалай %өткіземіз? | %Пікірге жазыңдар. | Ең көп %лайк | жинаған идея — | ертеңгі күннің | басы." },
];
const BUBBLE: Record<Who, string | null> = { n: null, a: "rgba(196,72,120,0.95)", e: "rgba(46,62,102,0.95)", l: "rgba(96,70,128,0.95)", m: "rgba(150,90,150,0.95)" };

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
