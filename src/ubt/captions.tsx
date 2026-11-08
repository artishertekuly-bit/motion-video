import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT, OSW } from "../qagaz/theme";
import { AUDIO, BIG_WORDS, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420; // субтитры ниже — над ними герой, сверху табло

// «|» — порция; «%» — жёлтое слово. Количество слов = тайминги голоса.
type Who = "n" | "a" | "m" | "e";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Отыз күн. | ҰБТ-ға дейін | %Ерасылда | дәл осынша | уақыт қалды." },
  { id: "n2", who: "n", text: "Қараңызшы. | Ерасыл — нағыз | %ертең %бастаймын | дейтін адам." },
  { id: "n3", who: "n", text: "Күніне | %тоғыз %сағат | телефон. | Кітаптары | әлі %целлофанда. | Сынақ ҰБТ-дан — | %қырық %жеті балл." },
  { id: "n4", who: "n", text: "Сол кезде | оған %Аружан жазады. | Иә, сол Аружан — | бесінші сыныптан бері | ұнайтын | параллельдегі қыз." },
  { id: "a1", who: "a", text: "Алматыға %грантқа | түсемін. | Сен ше?" },
  { id: "n5", who: "n", text: "Отыз күн. | %Адам %болуға. | Неден | бастау керек?" },
  { id: "n6", who: "n", text: "Алдымен | бөлмені тексеру. | Үстелде | бір айлық %шай, | жарты %самса | және үш | %зарядтағыш. | %Кітап %жоқ." },
  { id: "n7", who: "n", text: "Кітап шкафта. | Шкафты ашқанда | %шаң одан: | %сіз %кімсіз? — | деп сұрайды." },
  { id: "n8", who: "n", text: "Тарих оқулығы | ашылғанда | %сықырлады. | Өмірінде | %бірінші %рет." },
  { id: "m1", who: "m", text: "Ерасыл! | Сабақ оқып | жатырсың ба?" },
  { id: "e1", who: "e", text: "%Иә!" },
  { id: "n9", who: "n", text: "Экранда — | %ойын." },
  { id: "n10", who: "n", text: "Ауладағы %апалар | Ерасылды | кітаппен көріп, | бір-біріне қарайды: | %ауырып қалған ба, | байғұс?" },
  { id: "n11", who: "n", text: "Кешке | Аружанға | жауап жазады. | %Өшіреді. | Қайта жазады. | %Өшіреді. | Ақыры жібереді: | %мен %де." },
  { id: "n12", who: "n", text: "Отыз күн. | Және бұл оның | алғашқы | %өтірігі ғана." },
  { id: "n13", who: "n", text: "Ертеңгі күнді | сендер шешесіңдер: | %телефонды | анасына тапсыру ма, | әлде | %таңғы %алтыда | тұру ма? | Пікірге | %бір %сөз %жаз. | Екінші күн | сенің | таңдауыңнан басталады." },
];
const BUBBLE: Record<Who, string | null> = { n: null, a: "rgba(196,72,120,0.95)", m: "rgba(44,94,82,0.95)", e: "rgba(46,62,102,0.95)" };

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

export const BigWords: React.FC<{ f: number }> = ({ f }) => {
  const b = BIG_WORDS.find((x) => f >= x.from && f < x.to);
  if (!b) return null;
  const inK = interpolate(f, [b.from, b.from + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outK = interpolate(f, [b.to - 5, b.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: (b.y ?? 640) - 110,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: OSW,
          fontWeight: 700,
          fontSize: 150,
          color: "#FFD84A",
          WebkitTextStroke: "6px #120C06",
          paintOrder: "stroke fill",
          opacity: inK * outK,
          transform: `scale(${1.4 - 0.4 * inK}) rotate(${-4 + 2 * inK}deg)`,
          textShadow: "0 10px 0 rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {b.text}
      </div>
    </AbsoluteFill>
  );
};
