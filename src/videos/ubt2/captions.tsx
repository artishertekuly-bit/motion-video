import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420; // субтитры ниже — над ними герой, сверху табло

// «|» — порция; «%» — жёлтое слово. Количество слов = тайминги голоса.
type Who = "n" | "a" | "e" | "l";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Екінші күн. | ҰБТ-ға | %жиырма %тоғыз | күн қалды." },
  { id: "n2", who: "n", text: "Кеше сендер | шештіңдер: | %телефон — | анасына. | Анасы оны | %мұздатқышқа салды. | %Етпен %бірге." },
  { id: "n3", who: "n", text: "Ерасылдың | бас бармағы | әлі де бірдеңені | %айналдырып отыр. | %Нанды." },
  { id: "n4", who: "n", text: "Ал Аружан оны | %грантқа | дайындалып жүр | деп ойлайды. | %Дәлел %керек." },
  { id: "n5", who: "n", text: "Сондықтан Ерасыл | өміріндегі | ең %батыл %қадамға | барды. | %Кітапханаға." },
  { id: "n6", who: "n", text: "Кітапханашы апай | оны көріп, | %көзілдірігін | %екі %рет сүртті." },
  { id: "n7", who: "n", text: "Ақылды | көріну үшін | ол ең %қалың | %кітапты алды." },
  { id: "n8", who: "n", text: "Сол кезде | есік ашылды. | %Аружан." },
  { id: "a1", who: "a", text: "Ерасыл? | Сен де осында | %дайындаласың ба?" },
  { id: "e1", who: "e", text: "Иә... | мен мұнда | %күнде келемін." },
  { id: "l1", who: "l", text: "Балам, | сені %бірінші %рет | көріп тұрмын ғой." },
  { id: "n9", who: "n", text: "%Өтірік %нөмір %екі. | Ұсталды." },
  { id: "a2", who: "a", text: "Ерасыл... | кітабың | %төңкеріліп тұр." },
  { id: "n10", who: "n", text: "Аружан күлді. | Бірақ %кетпеді." },
  { id: "a3", who: "a", text: "Ертең %таңғы %жетіде | осында. | Бірге | дайындаламыз." },
  { id: "e2", who: "e", text: "%Келемін!" },
  { id: "n11", who: "n", text: "%Таңғы %жеті. | %Телефонсыз. | %Оятқышсыз. | Ерасыл соңғы рет | таңғы жетіде | %бесінші %сыныпта тұрған." },
  { id: "n12", who: "n", text: "Ертең не болады — | сендер шешесіңдер: | Аружанға | %шындықты айту ма, | әлде | %өтірікті жалғастыру ма? | Пікірге | %бір %сөз %жаз. | Үшінші күн | сенің | таңдауыңнан басталады." },
];
const BUBBLE: Record<Who, string | null> = { n: null, a: "rgba(196,72,120,0.95)", e: "rgba(46,62,102,0.95)", l: "rgba(96,70,128,0.95)" };

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
