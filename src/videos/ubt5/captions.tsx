import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CARD_AT, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420;

type Who = "n" | "a" | "e";

const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Бесінші күн. | Ең көп лайк | %жинаған %тілек: | Аружанға | %сезім %білдіру." },
  { id: "n2", who: "n", text: "Түнгі дайындық пен | серуеннен соң, | Ерасыл | %өліп %ұйықтаған | еді." },
  { id: "n3", who: "n", text: "Бірақ көзін ашса... | %сағат %таңғы %он!" },
  { id: "e1", who: "e", text: "Сағат он?! | Сынақ тестке | %жарты-ақ %сағат | қалды ғой!" },
  { id: "n4", who: "n", text: "Шұлықтары ауада ұшып, | %көшеге %оқтай %атылды." },
  { id: "e2", who: "e", text: "Үлгеруім керек! | Бүгін Аружанмен | %бәс %бар!" },
  { id: "n5", who: "n", text: "Қоңырау соғылған сәтте | %кабинетке %сырғып %кірді." },
  { id: "n6", who: "n", text: "ҰБТ сынақ тесті. | Екі сағаттық | %нағыз %шайқас | басталды." },
  { id: "e3", who: "e", text: "Икс плюс игрек... | %Формула %жұмыс | істеп тұр!" },
  { id: "n7", who: "n", text: "Уақыт бітті! | %Қаламдарды %қойыңыздар." },
  { id: "n8", who: "n", text: "Нәтиже ілінді. | Аружан — | %жүз %жиырма %төрт | балл!" },
  { id: "n9", who: "n", text: "Ал Ерасыл... | %жетпіс %сегіз! | Кеше ғана | %елу %алты | еді!" },
  { id: "e4", who: "e", text: "Жиырма екі балл | қосқанмын! | %Бұл %жеңіс!" },
  { id: "a1", who: "a", text: "Бәсті мен жеңдім. | Бірақ саған | %өкпем %қара %қазандай!" },
  { id: "e5", who: "e", text: "Неге, | %Аружан?" },
  { id: "a2", who: "a", text: "Кеше шанада | қатып қалдың, | бүгін тестке | %әрең %жеттің!" },
  { id: "e6", who: "e", text: "Аружан, мен | түні бойы | сенің алдыңда | ұятқа қалмауды | ойладым... | Өйткені сен маған... | %қатты %ұнайсың!" },
  { id: "e7", who: "e", text: "Ой... не | %деп %қойдым?!" },
  { id: "a3", who: "a", text: "Хм... Жетпіс сегіз | жинағаның үшін ғана | кешірдім. | Ал енді жүр... | %кітапханаға %барамыз!" },
  { id: "n10", who: "n", text: "Аружан байқамағансып, | бәрін жаңа | %тақырыпқа %бұрып %әкетті." },
];

const BUBBLE: Record<Who, string | null> = {
  n: null,
  a: "rgba(196,72,120,0.95)",
  e: "rgba(46,62,102,0.95)",
};

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

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  if (f >= CARD_AT) return null;
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
            const on = f >= t.s;
            const col = t.key ? "#ffd644" : on ? "#f4f1ea" : "rgba(244,241,234,0.42)";
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 54,
                  lineHeight: 1.15,
                  color: col,
                  textShadow: bubble ? "0 3px 0 rgba(0,0,0,0.45)" : "0 4px 0 #241726, 0 8px 24px rgba(0,0,0,0.65)",
                  letterSpacing: "-0.5px",
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
