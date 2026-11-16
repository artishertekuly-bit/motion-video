import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440;

// «|» — chunk separator; «%» — yellow keyword.
type Who = "n" | "t" | "u";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "t1", who: "t", text: "Балалар, | адамды %өмірде | ең %биік %шыңға | жетелейтін | дүниедегі %ең %алып %күш | не деп %ойлайсыңдар?" },
  { id: "u1", who: "u", text: "Ой, ағай! | Дүниедегі %ең %үлкен %күш | — ол %жылдам %интернет | пен соңғы %айфон! | Немесе анамның бөлмеге | %ашуланып %кіріп %келгені!" },
  { id: "t2", who: "t", text: "Жоқ, Нұрлыбек. | Ол — %ата-ананың | баласына деген | %кіршіксіз %сенімі! | Бұл жай ғана сезім емес, | адамды %тұлға %ететін | ең ұлы %қозғаушы %күш." },
  { id: "u2", who: "u", text: "Ағай, бірақ | %ата-ана %кейде | бізге көп талап қояды ғой... | Үнемі %сабақ %оқы, | жақсы бол деп | %мазаны %алады..." },
  { id: "t3", who: "t", text: "Өйткені олар сенің | бойыңдағы %мүмкіндікті %көреді! | Ғылымда мұны | %Пигмалион %эффектісі дейді. | Егер адамға %сенім %артса | — ол сенімді ақтау үшін | %тау %қопара %алады. | Ал сенен түк шықпайды десе | — %қанаты %бірден %сынады!" },
  { id: "u3", who: "u", text: "Рас қой... | Өткенде математикадан | %екілік алып келгенде, | әкем ұрыспай: | %Балам, %мен %саған %сенемін, | сен бұл %қиындықты %жеңесің деді. | Сол сәтте ұяттан | %жерге %кіріп %кете %жаздадым..." },
  { id: "t4", who: "t", text: "Міне, көрдің бе?! | %Сенім — кез келген ұрыстан | он есе %салмақты %жауапкершілік | жүктейді. | Ата-ананың сенімі — саған | өмірлік несиеге берілген | ең %құнды %капитал. | Оны бос өткізсең | — %өзіңді %жоғалтасың." },
  { id: "u4", who: "u", text: "Ағай, ал егер | біз %қателесіп, | сол сенімге %сызат %түсіріп | алсақ ше? | Оны қайта %қалпына %келтіру | %мүмкін %бе?" },
  { id: "t5", who: "t", text: "Сенім — %айна %сияқты, | Нұрлыбек. | Сынса қайта %құрау %қиын. | Бірақ %шынайы %өкініш, | табанды еңбек | және %адалдық арқылы | сол сенімді қайтадан | %жаңғыртуға %болады. | Бастысы — %өтірік %айтпау!" },
  { id: "u5", who: "u", text: "Түсіндім, ағай... | Мен дәл қазір үйге барып, | %ата-анама %рақмет %айтып, | үміттерін міндетті түрде | %ақтайтынымды | айтқым келіп тұр!" },
  { id: "t6", who: "t", text: "Жарайсың, Нұрлыбек! | Ата-ананың сенімі — сенің | арқаңдағы %қос %қанатың. | Сол қанатпен %биікке %самғап, | олардың %мақтанышы %болу | — әр баланың ең %асыл %борышы." },
  { id: "n1", who: "n", text: "Ал сен | %ата-анаңның %сенімін | сезінесің бе? | Олардың саған айтқан | ең %қанаттандыратын | сөзі қандай? | %Пікірге %жазып %кет!" },
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
    const parts = d.text.split("|").map((s) => s.trim().split(/\s+/).filter(Boolean));
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
  const c = CHUNKS.find((k) => f >= k.from && f < k.to);
  if (!c) return null;
  const fo = c.fade && c.to - f < 4 ? interpolate(c.to - f, [0, 4], [0, 1]) : 1;
  const bg = BUBBLE[c.who];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: CAP_Y,
          display: "flex",
          justifyContent: "center",
          opacity: fo,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            columnGap: 16,
            rowGap: 6,
            maxWidth: 960,
            padding: bg ? "14px 32px" : undefined,
            background: bg ?? undefined,
            borderRadius: bg ? 26 : undefined,
            boxShadow: bg ? "0 10px 30px rgba(0,0,0,0.45)" : undefined,
          }}
        >
          {c.toks.map((tok, i) => {
            const act = f >= tok.s;
            const pop = act && f - tok.s < 5;
            const scale = pop ? interpolate(f - tok.s, [0, 2, 5], [1, 1.15, 1]) : 1;
            const color = tok.key ? "#FFD84A" : "#FFFFFF";
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 54,
                  lineHeight: 1.15,
                  letterSpacing: 1,
                  color,
                  textTransform: "uppercase",
                  transform: `scale(${scale})`,
                  display: "inline-block",
                  opacity: act ? 1 : 0.45,
                  textShadow:
                    "-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 5px 12px rgba(0,0,0,0.8)",
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
