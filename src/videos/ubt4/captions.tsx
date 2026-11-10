import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CARD_AT, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420;

type Who = "n" | "a" | "e" | "m";

// n12 has no captions: the VS screen shows the big numbers and titles
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Төртінші күн. | ҰБТ-ға | %жиырма %жеті | күн қалды." },
  { id: "n2", who: "n", text: "Ең көп лайк | жинаған идея: | %түні %бойы %оқу." },
  { id: "n3", who: "n", text: "Кітапханадан шыққан | Ерасыл үйге | %ұшып %жетті." },
  { id: "n4", who: "n", text: "Үстелге кітаптың | %бәрін %үйді. | Шай — | %бес %кесе." },
  { id: "n5", who: "n", text: "Сағат он. | %Он %екі. | %Түнгі %үш." },
  { id: "m1", who: "m", text: "Балам... | %ұйықтасаңшы | енді." },
  { id: "e1", who: "e", text: "Болмайды, мама! | Жұмада | %бәс %бар!" },
  { id: "n6", who: "n", text: "Таңға қарай | сынақ тест шешті. | %Елу %алты %балл! | Кеше — | %қырық %сегіз %еді." },
  { id: "n7", who: "n", text: "Бірақ | ұйықтауға | %уақыт %қалмады." },
  { id: "n8", who: "n", text: "Кешке | мұздатқыш дірілдеді. | Ішінде — | %телефон." },
  { id: "e2", who: "e", text: "%Серуен?!" },
  { id: "n9", who: "n", text: "Кешкі қала. | Қар | %баяу %жауып %тұр." },
  { id: "a1", who: "a", text: "Қандай | %әдемі..." },
  { id: "e3", who: "e", text: "Иә... | %өте %әдемі." },
  { id: "a2", who: "a", text: "Мен қарды | %айтып %тұрмын | ғой." },
  { id: "e4", who: "e", text: "Мен де... | %қарды." },
  { id: "e5", who: "e", text: "Аружан... | саған бір | %маңызды %нәрсе | айтқым келеді..." },
  { id: "n10", who: "n", text: "Бірақ ол | түні бойы | %ұйықтамаған %еді." },
  { id: "a3", who: "a", text: "%Ерасыл?!" },
  { id: "e6", who: "e", text: "Икс... | %минус %жеті | де бар..." },
  { id: "n11", who: "n", text: "Үйіне Аружан | жеткізіп салды. | %Шанамен." },
  { id: "n13", who: "n", text: "Ерасыл жеңсе, | %қандай %тілек | айтады? | %Пікірге жазыңдар. | Ең көп лайк | жинаған тілек — | бесінші | %күнде." },
];

const BUBBLE: Record<Who, string | null> = {
  n: null,
  a: "rgba(196,72,120,0.95)",
  e: "rgba(46,62,102,0.95)",
  m: "rgba(150,90,150,0.95)",
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
