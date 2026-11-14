import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CARD_AT, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420;

type Who = "n" | "a" | "e";

const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Жетінші күн. | Жексенбі болса | %да, %ҰБТ | %демалыс %бермейді." },
  { id: "e1", who: "e", text: "Аружан, мен | кешегі тесттің | %барлық %қатесін | %талдап %шықтым!" },
  { id: "a1", who: "a", text: "Жарайсың! | Тест нәтижесі — | %тура %сексен | %екі %балл! | %Өз %рекордың!" },
  { id: "n2", who: "n", text: "Еңбек ақталды. | Ерасылдың балы | %сексен %екіге | көтерілді." },
  { id: "a2", who: "a", text: "Керемет нәтиже! | Енді демалыс | %ретінде %мұз | %айдынына %барып | серуендейік!" },
  { id: "e2", who: "e", text: "Мұз айдыны?! | Әрине! | Конькиде маған | %тең %келер | %ешкім %жоқ!" },
  { id: "n3", who: "n", text: "Тау баурайындағы | мұз айдыны. | Таза ауа | %мен %сықырлаған | аяз." },
  { id: "a3", who: "a", text: "Қандай керемет | %сырғанау! | Ерасыл, тезірек | %кел!" },
  { id: "e3", who: "e", text: "Аружан, қара! | Қазір саған | %мәнерлеп %сырғанау | %мен %физика | %заңын %көрсетемін!" },
  { id: "e4", who: "e", text: "Үйкеліс күші... | %инерция... %секірууу!" },
  { id: "n4", who: "n", text: "Бірақ мұз | айдыны мен | %физиканың %өз | %ережелері %бар | еді." },
  { id: "e5", who: "e", text: "Ойбай... Физикада | %үйкеліс %коэффициенті | %нөлге %тең | %екен %ғой... | белім-ай..." },
  { id: "a4", who: "a", text: "Ахахаха! Ерасыл, | бұл «құлаудың | %үшінші %заңы» | ма?! Тұр, | %қолыңнан %ұстайын!" },
  { id: "n5", who: "n", text: "Бірақ күлкінің | артында | %ерекше %жылы | %сезім %бар | еді." },
  { id: "e6", who: "e", text: "Аружан... рахмет. | Бірақ есеп | %шығарған %мұзда | %сырғанаудан %әлдеқайда | %оңай %екен..." },
  { id: "a5", who: "a", text: "Кел, қолымнан | ұста, | %бірге %сырғанаймыз. | %Қорықпа, %құламайсың!" },
  { id: "n6", who: "n", text: "Қол ұстасып | %сырғанаған %қос | %жүрек." },
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
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 54,
                  lineHeight: 1.15,
                  color: t.key ? (on ? "#FFD84A" : "rgba(255,216,74,0.4)") : on ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  WebkitTextStroke: bubble ? "none" : "7px #120C06",
                  paintOrder: "stroke fill",
                  textShadow: bubble ? "0 4px 10px rgba(0,0,0,0.35)" : "none",
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
