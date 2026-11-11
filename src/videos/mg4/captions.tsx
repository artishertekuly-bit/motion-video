import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440;

// «|» — chunk separator; «%» — yellow keyword.
type Who = "n" | "t" | "u";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "u1", who: "u", text: "Ағай! | Мынадай %3D %мультик | жасау үшін | %миллиондық %компьютер | керек шығар?!" },
  { id: "t1", who: "t", text: "%Қой %әрі, %Нұрлыбек! | Бүгінде мұның бәрін | %жасанды %интеллект %жасайды!" },
  { id: "t2", who: "t", text: "Сурет сала білудің де, | %монтаждың %да керегі жоқ. | %Сценарий, %3D %анимация, | %дауыс — бірнеше | %минутта %дайын %болады!" },
  { id: "t3", who: "t", text: "Мен осыны үйрететін | %авторлық %КУРС %дайындадым! | Нөлден бастап | %тренд %видео жасап, | %миллион %қаралым | %жинайсыңдар!" },
  { id: "t4", who: "t", text: "Курстың %барлық %құпиялары, | %промпттары мен сабақтары | %Телеграм %каналымда %өтеді!" },
  { id: "u2", who: "u", text: "Ағай, | %сілтеме %қайда?!" },
  { id: "t5", who: "t", text: "%Сілтеме %профильде! | %Дәл %қазір | %жазылып үлгер, | %қалып %қойма!" },
];

const BUBBLE: Record<Who, string | null> = {
  n: null,
  t: "rgba(64,48,72,0.95)",
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
          right: 80,
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
            gap: "10px 14px",
            padding: "16px 28px",
            borderRadius: 24,
            background: bubble ?? "rgba(20,22,28,0.92)",
            border: "3px solid rgba(255,255,255,0.25)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
            transform: `scale(${pop})`,
          }}
        >
          {c.toks.map((t, i) => {
            const hit = f >= t.s;
            const col = t.key ? C.amber : "#ffffff";
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 48,
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: col,
                  textShadow: hit ? "0 4px 18px rgba(0,0,0,0.85)" : "0 2px 10px rgba(0,0,0,0.5)",
                  transform: hit ? "scale(1.04)" : "scale(0.96)",
                  opacity: hit ? 1 : 0.65,
                  display: "inline-block",
                  transition: "transform 0.08s ease-out",
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
