import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT } from "../../qagaz/theme";
import { AUDIO, CARD_AT, CUTS, sec, START } from "./timeline";

export const CAP_Y = 1420;

type Who = "n" | "a" | "e" | "g";

const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "n1", who: "n", text: "Сегізінші күн. | Дүйсенбі таңында | %мектепте %нағыз | %дауыл %басталды!" },
  { id: "g1", who: "g", text: "Ерасыл! | Кеше мұз | %айдынында %мәз | %болып %жүргеніңді | көрдім. | Ал енді | %нағыз %бейіндік | %ҰБТ %сұрақтарына | жауап бер!" },
  { id: "e1", who: "e", text: "Гүлнар апай, | менің балым | %сексен %екіден | асқан! | Кез келген | %есепті %оп-оңай | шығарамын!" },
  { id: "g2", who: "g", text: "Олай болса, | мына нағыз | %күрделі %деңгейлі | %сынақты %шеш!" },
  { id: "n2", who: "n", text: "Қатал сынақ | басталды. | Бірақ бұл | %жолы %бәрі | %басқаша %еді." },
  { id: "e2", who: "e", text: "Бұл... кванттық | физика ма? | Термодинамика... | Тоқта, бұл | %формулаларды %неге | %түсінбей %тұрмын?!" },
  { id: "n3", who: "n", text: "Уақыт бітті. | Қызыл қаламның | %қатал %үкімі." },
  { id: "g3", who: "g", text: "Нәтижең — елу | сегіз балл! | Сен осыған | %дейін %тек | %жеңіл %есептерді | шығарып, | өзіңді алдап | келгенсің!" },
  { id: "n4", who: "n", text: "Сексен екіден | елу сегізге | %бір-ақ %құлады. | Ауыр соққы." },
  { id: "e3", who: "e", text: "Масқара... | Мен тек | %оңай %есептермен | алданып, | Аружанмен серуендеп, | %бар %уақытымды | құртыппын ғой... | Енді қалай | %грантқа %түсемін?!" },
  { id: "a1", who: "a", text: "Ерасыл! | Босқа салың | %суға %кетпесін! | Бұл — біздің | %ең %үлкен | %мүмкіндігіміз!" },
  { id: "e4", who: "e", text: "Аружан... мен | бәрін құрттым... | %күрделі %есептерге | миым жетпейді..." },
  { id: "a2", who: "a", text: "Жоқ! Мен | сенің барлық | %қатеңді %талдап, | арнайы жүйе | %құрастырып %шықтым! | Қара!" },
  { id: "n5", who: "n", text: "Аружан құпия | стратегияны ашты. | %Үш %деңгейлі | %қателер %картасы." },
  { id: "a3", who: "a", text: "Міне: біз | алдымен С | %деңгейінің %басты | жиырма формуласын | бөлшектеп, | күніне он | %күрделі %есепті | талдаймыз. | Мен әр | %қадамыңды %қадағалаймын!" },
  { id: "e5", who: "e", text: "Аружан... сен | кереметсің! | Енді бос | %уақыт %құрту | жоқ. | Тек нақты | %мақсат %пен | қажырлы еңбек!" },
  { id: "a4", who: "a", text: "Ендеше кеттік! | Біз бұл | %шыңды %міндетті | %түрде %бағындырамыз!" },
  { id: "n6", who: "n", text: "Қатал сабақ | %нағыз %дайындыққа | жол ашты." },
  { id: "n7", who: "n", text: "ҰБТ-ға жиырма | үш күн | %қалды. %Ерасыл | мен Аружан | %нағыз %күреске | көшті!" },
];

const BUBBLE: Record<Who, string | null> = {
  n: null,
  g: "rgba(168,36,54,0.95)",
  a: "rgba(196,72,120,0.95)",
  e: "rgba(46,62,102,0.95)",
};

type Tok = { text: string; key: boolean; s: number };
type Chunk = { toks: Tok[]; from: number; to: number; fade: boolean; who: Who };

const CHUNKS: Chunk[] = (() => {
  const all: Chunk[] = [];
  for (const d of DEFS) {
    const words = AUDIO[d.id]?.words;
    if (!words || words.length === 0) continue;
    const parts = d.text.split("|").map((s) => s.trim().split(/\s+/));
    let k = 0;
    for (const part of parts) {
      const toks: Tok[] = [];
      for (const raw of part) {
        if (k >= words.length) break;
        const w = words[k++];
        if (raw === "—" && toks.length) {
          toks[toks.length - 1].text += " —";
          continue;
        }
        const key = raw.startsWith("%");
        toks.push({ text: key ? raw.slice(1) : raw, key, s: sec(START[d.id] + w.start) });
      }
      if (toks.length === 0) continue;
      const lastF = sec(START[d.id] + words[Math.min(k - 1, words.length - 1)].end);
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
