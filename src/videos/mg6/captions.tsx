import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1440;

// «|» — chunk separator; «%» — yellow keyword.
type Who = "n" | "t" | "u";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "t1", who: "t", text: "Балалар, | %он %жыл бойы | ешкім ала алмаған | алып %қамалды | гректер %бір %күнде | қалай %бағындырды?" },
  { id: "u1", who: "u", text: "Ой, ағай! | Олар қабырғаны | алып %зеңбірекпен атқан, | немесе %дрондармен %шабуылдаған!" },
  { id: "t2", who: "t", text: "Нұрлыбек, | %үш %мың %екі %жүз жыл бұрын | %дрон болмаған! | Олар қақпа алдына | алып %ағаш %ат қалдырып, | біз кеттік, | бұл %сыйлық деп | өтірік кемемен | жүзіп кеткен!" },
  { id: "u2", who: "u", text: "Ойбай, %тегін %сыйлық! | Мен болсам бірден | қалаға кіргізіп, | үстіне мініп | %селфи %жасар едім!" },
  { id: "t3", who: "t", text: "Троялықтар да | дәл сендей мәз болып, | атты қалаға кіргізіп, | %той %тойлап | %ұйықтап %қалған!" },
  { id: "u3", who: "u", text: "Иә, сосын не болды? | Келесі күні | тағы %сыйлық | әкелді ме?" },
  { id: "t4", who: "t", text: "Жоқ! | Түн ортасында | сол %ағаш %аттың ішінен | %қарулы %грек әскері шығып, | қақпаны іштен ашып, | %қаланы %талқандаған!" },
  { id: "u4", who: "u", text: "Неге?! | Аттың ішінде | адамдар %тығылып %жатқан ба?! | Сонда телефондағы | %Троян %вирусы да | осыдан шыққан ба?!" },
  { id: "t5", who: "t", text: "Дәл солай! | Сондықтан тарихта: | %Сыйлық %әкелген %гректен %қорық | деген сөз қалған. | Ал қазір: интернетте | %iPhone ұтып алдың | деген сілтеме көрсең, | %баспа, | ішінде %гректер %тығылып %жатыр!" },
  { id: "u5", who: "u", text: "Ағай... | кеше ғана маған | %бір %миллион ұттыңыз деп | %смс келген еді... | демек ол да | %гректер екен ғой?!" },
  { id: "n1", who: "n", text: "Ал сен | %бейтаныс %сыйлықтарға | сенесің бе? | %Пікірге %жаз!" },
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
          right: 0,
          bottom: 1920 - CAP_Y,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 48px",
          opacity: fo,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px 14px",
            padding: bg ? "16px 28px" : 0,
            background: bg ?? "transparent",
            borderRadius: 22,
            boxShadow: bg ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
            maxWidth: 980,
          }}
        >
          {c.toks.map((t, i) => {
            const on = f >= t.s;
            const pop = on && f - t.s < 5 ? 1 + (1 - (f - t.s) / 5) * 0.18 : 1;
            const col = t.key ? "#FFD84A" : "#FFFFFF";
            return (
              <span
                key={i}
                style={{
                  fontFamily: MONT,
                  fontWeight: 900,
                  fontSize: 50,
                  lineHeight: "62px",
                  color: col,
                  letterSpacing: 0.5,
                  textShadow: bg ? "none" : "0 4px 16px rgba(0,0,0,0.85), 0 2px 4px rgba(0,0,0,0.9)",
                  transform: `scale(${pop})`,
                  display: "inline-block",
                  opacity: on ? 1 : 0.45,
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
