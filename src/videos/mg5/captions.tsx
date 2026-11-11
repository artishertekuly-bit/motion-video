import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440;

// «|» — chunk separator; «%» — yellow keyword.
type Who = "n" | "t" | "u";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "t1", who: "t", text: "Балалар, | сендерге таңдау: | дәл қазір | %100 %миллион теңге ме, | әлде %30 %күн бойы | күн сайын | %екі %еселенетін | %1 %теңге ме?" },
  { id: "u1", who: "u", text: "Әрине %100 %миллион! | Мен бүгіннен бастап | мектепке %қара %геликпен келемін, | бәріңе %тегін %донер таратамын!" },
  { id: "t2", who: "t", text: "Нұрлыбек... | сен дәл қазір | %1 %МИЛЛИАРД | %теңгеден %айырылдың!" },
  { id: "u2", who: "u", text: "Неге?! | Ағай, %100 %миллионнан | %1 %теңге қалай көп болады?!" },
  { id: "t3", who: "t", text: "Қара: | бірінші күні %1 %теңге, | екінші күні %2 %теңге, | бесінші күні %16 %теңге. | Ал оныншы күні | бар болғаны %512 %теңге!" },
  { id: "u3", who: "u", text: "Ахаха, көрдіңіз бе! | %10 %күнде тіпті | бір %донер %де | шықпайды ғой!" },
  { id: "t4", who: "t", text: "Асықпа! | 20-күні %524 %мың теңге, | ал 30-күні — %536 %миллион теңге! | Барлығын қосқанда — | %1 %миллиард | %73 %миллион | теңге шығады!" },
  { id: "t5", who: "t", text: "Бұл — %экспоненциалды | өсу құпиясы! | Кезінде Үнді патшасы да | шахмат ойлап тапқан данышпанға | дәл осылай алданып, | бүкіл әлемнің бидайы | жетпей қалған!" },
  { id: "u4", who: "u", text: "Ағай... %жедел %жәрдем шақырыңызшы... | мен %1 %миллиардтан айырылдым! | Ағай, сол %1 %теңгені | бере салыңызшы!" },
  { id: "t6", who: "t", text: "Кешіктің, Нұрлыбек! | Саған %1 %теңге де жоқ! | Бірақ сабақ оқымасаң, | ертең үй тапсырмаң | дәл осылай %екі %еселенеді!" },
  { id: "u5", who: "u", text: "Жоқ, ағай!" },
  { id: "n1", who: "n", text: "Ал сен қайсысын | таңдар едің? | %Пікірге %жаз!" },
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
    if (count !== words.length) {
      throw new Error(`captions ${d.id}: ${count} tokens vs ${words.length} words`);
    }
    let k = 0;
    for (const part of parts) {
      const toks: Tok[] = [];
      for (const raw of part) {
        const w = words[k++];
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
  const cur = CHUNKS.find((c) => f >= c.from && f < c.to);
  if (!cur) return null;
  const op = cur.fade ? interpolate(f, [cur.from, cur.from + 3, cur.to - 3, cur.to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const bg = BUBBLE[cur.who];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: CAP_Y,
          left: 60,
          right: 60,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 18px",
          opacity: op,
        }}
      >
        {cur.toks.map((t, i) => {
          const lit = f >= t.s;
          const col = t.key ? (lit ? "#FFE040" : "rgba(255,224,64,0.45)") : lit ? "#FFFFFF" : "rgba(255,255,255,0.45)";
          return (
            <span
              key={i}
              style={{
                fontFamily: MONT,
                fontWeight: 900,
                fontSize: 58,
                lineHeight: 1.15,
                color: col,
                textTransform: "uppercase",
                textShadow: "0 4px 14px rgba(0,0,0,0.85), 0 2px 4px #000",
                background: bg ?? undefined,
                padding: bg ? "4px 14px" : undefined,
                borderRadius: bg ? 12 : undefined,
                transform: lit ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.08s ease-out",
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
