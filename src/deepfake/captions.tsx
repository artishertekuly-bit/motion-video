import React from "react";
import { random } from "remotion";
import { C, CAPTION_TOP, MONT } from "./theme";
import { AUDIO, END_CARD_F, sec, START } from "./timeline";
import { p, rgba } from "./ui";

// Разметка: «|» — новая порция субтитра; первый символ слова: % — жёлтый, $ — красный, + — зелёный, & — тёплый.
// Количество слов должно совпадать с таймингами голоса (теги вида [whispers] не считаются).
type Who = "narr" | "fake" | "mom";
const DEFS: { id: string; who: Who; text: string }[] = [
  { id: "m1", who: "fake", text: "%Балам! | Жол $апатына түстім… | Телефоным $өшіп барады!" },
  { id: "n1", who: "narr", text: "Кешкі сағат | %тоғыз %жарым. | Сіз үйде %жалғызсыз. | Хабарлама $бейтаныс | $нөмірден келді. | Бірақ дауыс — %анаңыздікі. | %Жүз %пайыз." },
  { id: "m2", who: "fake", text: "%Тез мына нөмірге | $ақша $сал! | Болмаса — | $SMS-кодты $жібер!" },
  { id: "n2", who: "narr", text: "Код келді. | %Төрт %сан. | Саусағыңыз %«Жіберу» | түймесінің үстінде." },
  { id: "n3", who: "narr", text: "Дәл осы сәтте | көпшілік $қателеседі: | бірден $ақша $салады, | $кодты $жібереді | немесе сол нөмірге | $қайта $жазады. | Ал арғы жақтағыға | %дәл %осы %керек." },
  { id: "n4", who: "narr", text: "Бірақ сіз | эмоцияға +берілмейсіз. | +Тоқтайсыз. | Анаңыздың +өз +нөміріне | қоңырау шаласыз." },
  { id: "n5", who: "narr", text: "Жауап $жоқ. | Онда — соңғы тексеріс: | %отбасылық %құпия %сөз." },
  { id: "n6", who: "narr", text: "Сіз жазасыз: | «Анамның %сүйікті %гүлі | %қандай?»" },
  { id: "n7", who: "narr", text: "Сол сәтте | дәлізде %кілт %бұралады." },
  { id: "m3", who: "mom", text: "+Балам, +мен +келдім!" },
  { id: "n8", who: "narr", text: "Асүйге анаңыз кіреді. | +Аман-есен. | Ал телефондағы $«анаңыз» | әлі жазып жатыр…" },
  { id: "m4", who: "fake", text: "Қазір гүлге | уақыт жоқ! | $Ақшаны $жібер!" },
  { id: "n9", who: "narr", text: "Жасанды интеллект | дауысты %бірнеше %секундтық | видеодан $көшіре $алады. | Ал отбасылық %құпия %сөзді — | +ешқашан." },
  { id: "n10", who: "narr", text: "Ертең сіздің | %дауысыңызбен | анаңызға хабарлама келсе — | ол сізді | %қалай %таниды?" },
];

type Tok = { text: string; color: string | null; s: number; e: number };
type Chunk = { who: Who; toks: Tok[]; from: number; to: number };

const COLOR: Record<string, string> = { "%": C.amber, $: C.red, "+": C.green, "&": C.warm };

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
          toks[toks.length - 1].text += " —";
          continue;
        }
        const c = COLOR[raw[0]] ?? null;
        toks.push({ text: c ? raw.slice(1) : raw, color: c, s: sec(START[d.id] + w.start), e: sec(START[d.id] + w.end) });
      }
      all.push({ who: d.who, toks, from: toks[0].s - 2, to: 0 });
    }
  }
  all.sort((a, b) => a.from - b.from);
  for (let i = 0; i < all.length; i++) {
    const last = all[i].toks[all[i].toks.length - 1].e;
    const next = i + 1 < all.length ? all[i + 1].from : Infinity;
    all[i].to = Math.min(next, last + 16, END_CARD_F);
  }
  return all;
})();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const ch = CHUNKS.find((c) => f >= c.from && f < c.to);
  if (!ch) return null;
  const inK = p(f, ch.from, 4);
  const outK = 1 - p(f, ch.to - 3, 3);
  const fake = ch.who === "fake";
  const n = ch.toks.length;
  return (
    <div
      style={{
        position: "absolute",
        top: CAPTION_TOP,
        left: 50,
        right: 50,
        height: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        opacity: inK * outK,
        transform: `translateY(${(1 - inK) * 14}px)`,
      }}
    >
      <div
        style={{
          fontFamily: MONT,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.06,
          letterSpacing: "-0.01em",
          textAlign: "center",
          textTransform: "uppercase",
          maxWidth: 980,
        }}
      >
        {ch.toks.map((t, i) => {
          const on = f >= t.s;
          const pop = on ? p(f, t.s, 5) : 0;
          const col = on ? t.color ?? (ch.who === "mom" ? C.green : C.white) : "rgba(200,208,224,0.30)";
          let txt = t.text;
          if (ch.who !== "narr") {
            if (i === 0 && !txt.startsWith("«")) txt = "«" + txt;
            if (i === n - 1 && !txt.endsWith("»")) txt = txt + "»";
          }
          const jit = fake && on && random(`cj${f}${i}`) < 0.18;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                margin: "0 0.13em",
                color: col,
                transform: `scale(${on ? 1.08 - 0.08 * pop : 1}) translateX(${jit ? (random(`cx${f}${i}`) - 0.5) * 10 : 0}px)`,
                textShadow: [
                  "0 4px 18px rgba(0,0,0,0.85)",
                  on && t.color ? `0 0 26px ${rgba(t.color, 0.45)}` : "",
                  jit ? `4px 0 ${rgba(C.red, 0.8)}, -4px 0 ${rgba(C.cyan, 0.8)}` : "",
                ]
                  .filter(Boolean)
                  .join(","),
              }}
            >
              {txt}
            </span>
          );
        })}
      </div>
    </div>
  );
};
