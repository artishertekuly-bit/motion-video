import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BIG_Y, C, CAPTION_Y, MONT, OSW } from "../qagaz/theme";
import { AUDIO, BIG_WORDS, CUTS, sec, START } from "./timeline";

// «|» — новая порция; «%» — жёлтое ключевое слово. Слов столько же, сколько в таймингах голоса.
const DEFS: { id: string; text: string; who: "n" | "t" | "b" }[] = [
  { id: "n1", who: "n", text: "Емтиханға | бір түн қалды. | Ерасыл | оқудың орнына | %шпаргалка жазды." },
  { id: "n2", who: "n", text: "Қаламның ішіне. | Су бөтелкесіне. | Сағаттың астына. | Тіпті | аяқ киімнің | %табанына." },
  { id: "n3", who: "n", text: "Бірақ ертеңгі | емтиханды | %Гүлнар %апай алады. | Оның көзінен | әлі ешкім | құтылған емес." },
  { id: "t1", who: "t", text: "Телефондарды | үстелге қойыңдар. | %Уақыт %басталды." },
  { id: "n4", who: "n", text: "Ерасыл | қаламға қол созды — | апай %қарады. | Бөтелкеге — | тағы %қарады. | Аяқ киімге | еңкейсе — | апай | %дәл %қасында тұр." },
  { id: "b1", who: "b", text: "Біттім..." },
  { id: "n5", who: "n", text: "Ол амалсыз | сұраққа қарады... | және %кенет %түсінді." },
  { id: "b2", who: "b", text: "Мен мұны... | %білемін!" },
  { id: "n6", who: "n", text: "Түні бойы | ұсақ әріппен | %үш %рет көшірген | нәрсенің бәрі | %басында қалыпты." },
  { id: "t2", who: "t", text: "%Жарайсың, Ерасыл. | Табаныңдағыны да | %өшіріп таста." },
  { id: "n7", who: "n", text: "Ал апайдың үстелінде | отыз жыл бойы | бір кішкентай | %шпаргалка | сақтаулы тұр." },
];

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
  // реплики героев — в «облачке», голос рассказчика — просто текст
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
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          top: CAPTION_Y - 90,
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
            columnGap: 20,
            rowGap: 4,
            padding: bubble ? "18px 34px" : 0,
            borderRadius: 40,
            background: bubble ? (c.who === "t" ? "rgba(122,46,58,0.92)" : "rgba(46,62,102,0.92)") : "none",
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
          left: 120,
          right: 120,
          top: (b.y ?? BIG_Y) - 110,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: OSW,
          fontWeight: 700,
          fontSize: 168,
          letterSpacing: 4 + 6 * life,
          color: C.white,
          opacity: inK * outK,
          transform: `scale(${1.18 - 0.18 * inK + 0.03 * life}) rotate(${-2 + 2 * inK}deg)`,
          textShadow: `0 0 40px rgba(255,190,90,0.55), 0 6px 26px rgba(0,0,0,0.8)`,
          whiteSpace: "nowrap",
        }}
      >
        {b.text}
      </div>
    </AbsoluteFill>
  );
};
