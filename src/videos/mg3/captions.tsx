import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440;

// «|» — chunk separator; «%» — yellow keyword.
type Who = "n" | "t" | "a" | "o" | "s" | "u";
// t9 and n7 are omitted: chalkboard and end card show them directly.
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Бор тақтаға | баяу жазылды: | «Кім кімнен озады?». | Барыс ағай | %сыныпқа %бұрылды." },
  { id: "u1", who: "u", text: "Ағай, қараңыз! | %Оригинал %кроссовка, | %жүз %мың %теңге! | Мен бүкіл | %сыныптан %оздым!" },
  { id: "n2", who: "n", text: "Санжар соңғы | %айфонын, | ал Томирис | %он %мың | %оқырманын | %мақтап %жарысты." },
  { id: "t1", who: "t", text: "Абай атамыз | тура %жүз %отыз | жыл бұрын | сендер сияқтыларды | қалай атағанын | %білесіңдер %ме?" },
  { id: "u2", who: "u", text: "Қалай, ағай? | %Трендсеттер %деді %ме?" },
  { id: "t2", who: "t", text: "«Ақымақ» деп %атаған." },
  { id: "t3", who: "t", text: "Абайдың %он %сегізінші | %қара сөзі. | %Мұқият %тыңдаңдар." },
  { id: "t4", who: "t", text: "Адам баласы | адам баласынан | тек %төрт | нәрсемен озады: | %ақыл, %ғылым, | %ар және %мінез." },
  { id: "t5", who: "t", text: "Одан басқа | %нәрсемен %оздым | деудің бәрі — | %ақымақтық!" },
  { id: "n3", who: "n", text: "Барыс ағай | үстелге %жылтыр | %алтын %қорап | пен қарапайым | %ескі %оқулықты | %қойды." },
  { id: "t6", who: "t", text: "Сырты қанша | жылтыр болса да, | іші %бос %қораптың | құны жоқ. | %Кроссовкаң %да %сондай." },
  { id: "n4", who: "n", text: "%Нұрлыбек аяғын | %партадан %ақырын %түсірді." },
  { id: "n5", who: "n", text: "Ал соңғы партадағы | %Әлиханның үстінде | %ескі %көйлек. | %Бірақ..." },
  { id: "t7", who: "t", text: "Бүгінгі %ең %қиын | есепті бүкіл сыныптан | %жалғыз %Әлихан | %ғана %шығарды." },
  { id: "t8", who: "t", text: "Ендеше, бүгін | бұл сыныпта | %кім %бәрінен %озды?" },
  { id: "n6", who: "n", text: "Сынып %үнсіз %қалды. | Ешкімнің телефоны да, | %кроссовкасы да | %есепті %шығара | %алмады." },
  { id: "u3", who: "u", text: "Ағай... онда маған | %кроссовка %емес, | миыма %жаңа | %білім %керек | %екен %ғой." },
];

const BUBBLE: Record<Who, string | null> = {
  n: null,
  t: "rgba(64,48,72,0.95)",
  a: "rgba(46,62,102,0.95)",
  o: "rgba(196,72,120,0.95)",
  s: "rgba(74,84,100,0.95)",
  u: "rgba(200,69,47,0.95)",
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
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const out = c.fade ? interpolate(f, [c.to - 3, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const pop = interpolate(f, [c.from, c.from + 4], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bubble = BUBBLE[c.who];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 150,
          top: CAP_Y - 90,
          height: 180,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: out,
        }}
      >
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
                  color: t.key ? C.amber : "#FFFFFF",
                  opacity: 0.28 + 0.72 * k,
                  transform: `scale(${1 + 0.12 * Math.sin(k * Math.PI)})`,
                  display: "inline-block",
                  textShadow: bubble
                    ? "none"
                    : "0 4px 0 #120C06, 0 -4px 0 #120C06, 4px 0 0 #120C06, -4px 0 0 #120C06, 0 8px 16px rgba(0,0,0,0.7)",
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
