// «Мұғалім» portfolio: flat model-sheet pages (DOM + canvas, no WebGL) and the text overlays of the 3D pages.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Pen, INK } from "./toon";
import { leopardFront, leopardSide, leopardBack, LeoOpts, LExpr, LEO, LEO_METRICS } from "./leopard";

export const mont = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["cyrillic", "cyrillic-ext", "latin"] });
const MONT = mont.fontFamily;
const PLUM = "#241726";
const PAPER = "#f3ecdf";

const Draw: React.FC<{ w: number; h: number; style?: React.CSSProperties; draw: (g: CanvasRenderingContext2D) => void }> = ({ w, h, style, draw }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    draw(g);
  }, [w, h, draw]);
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", width: w, height: h, ...style }} />;
};
const at = (g: CanvasRenderingContext2D, x: number, y: number, s: number, fn: (p: Pen) => void) => {
  g.save(); g.setTransform(s, 0, 0, s, x, y); fn(new Pen(g)); g.restore();
};

const paperBg: React.CSSProperties = {
  background: PAPER,
  backgroundImage: "linear-gradient(rgba(36,23,38,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(36,23,38,0.05) 2px, transparent 2px)",
  backgroundSize: "54px 54px",
};
const Title: React.FC<{ big: string; small: string; n: string }> = ({ big, small, n }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 70 }}>
    <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: "#c0503a" }}>{n} · МҰҒАЛІМ</div>
    <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: PLUM, marginTop: 6 }}>{big}</div>
    <div style={{ fontFamily: MONT, fontWeight: 600, fontSize: 38, color: "#5a4a5e", marginTop: 8 }}>{small}</div>
  </div>
);

// ---------------- page 5: six moods ----------------
const MOODS: { e: LExpr; o: LeoOpts; label: string; bg: string; fx?: "idea" | "shock" | "laugh" }[] = [
  { e: "smug", o: { arms: ["cross", "cross"] }, label: "Сенімді", bg: "#d9e8f6" },
  { e: "laugh", o: { headTilt: -4 }, label: "Көңілді", bg: "#fde0c6", fx: "laugh" },
  { e: "think", o: { arms: ["chinUnder", "chin"] }, label: "Ойланып тұр", bg: "#e0efd3" },
  { e: "shock", o: {}, label: "Таң қалды", bg: "#f8d6de", fx: "shock" },
  { e: "meh", o: { facing: -1 }, label: "Күмәнді", bg: "#e4def2" },
  { e: "idea", o: { glasses: true, arms: ["hang", "glasses"], facing: 1 }, label: "Идея бар!", bg: "#fff0bd", fx: "idea" },
];
const TILE = 470;
const moodDraw = (m: (typeof MOODS)[number]) => (g: CanvasRenderingContext2D) => {
  const s = 1.18;
  at(g, TILE / 2 - 300 * s, (m.e === "think" ? 205 : 240) - LEO_METRICS.hc * s, s, (p) => leopardFront(p, { expr: m.e, ...m.o }));
  const p = new Pen(g);
  if (m.fx === "idea") {
    for (const [a, l] of [[-80, 46], [-45, 58], [-10, 46]] as const) {
      const r = (a * Math.PI) / 180, cx = 395, cy = 120;
      p.stroke([[cx + 22 * Math.cos(r), cy + 22 * Math.sin(r)], [cx + (22 + l) * Math.cos(r), cy + (22 + l) * Math.sin(r)]], 10, "#f2b928");
    }
  }
  if (m.fx === "shock") for (const [x, y] of [[90, 70], [118, 58]] as const) { p.poly([[x - 7, y - 30], [x + 7, y - 30], [x + 3, y + 8], [x - 3, y + 8]], "#e2453c", 4); p.ell(x, y + 22, 7, 7, "#e2453c", 4); }
  if (m.fx === "laugh") for (const [x, y, a] of [[78, 150, -150], [92, 112, -125], [392, 112, -55], [406, 150, -30]] as const) { const r = (a * Math.PI) / 180; p.stroke([[x, y], [x + 26 * Math.cos(r), y + 26 * Math.sin(r)]], 9, "#f2b928"); }
};
export const FacesPage: React.FC = () => (
  <AbsoluteFill style={paperBg}>
    <Title n="05" big="ЭМОЦИЯЛАР" small="Мұғалімнің алты түрлі көңіл-күйі" />
    {MOODS.map((m, i) => {
      const x = 50 + (i % 2) * (TILE + 40), y = 360 + Math.floor(i / 2) * (TILE + 50);
      return (
        <div key={m.e} style={{ position: "absolute", left: x, top: y, width: TILE, height: TILE, borderRadius: 44, background: m.bg, border: `7px solid ${PLUM}`, overflow: "hidden", boxSizing: "border-box" }}>
          <Draw w={TILE} h={TILE} style={{ left: -7, top: -7 }} draw={moodDraw(m)} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}>
            <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: 36, color: PLUM, background: "#ffffff", border: `5px solid ${PLUM}`, borderRadius: 40, padding: "6px 26px" }}>{m.label}</span>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);

// ---------------- page 6: turnaround, colours, character ----------------
const TS = 0.66, SOLE_Y = 640;
const VIEWS: { x: number; label: string; draw: (p: Pen) => void }[] = [
  { x: 182, label: "АЛДЫ", draw: (p) => leopardFront(p, { expr: "smile", tail: -1 }) },
  { x: 432, label: "ЖАРТЫЛАЙ", draw: (p) => leopardFront(p, { expr: "proud", facing: 1, tail: -1 }) },
  { x: 702, label: "ЖАНЫ", draw: (p) => leopardSide(p, { expr: "smug" }) },
  { x: 925, label: "АРТЫ", draw: (p) => leopardBack(p) },
];
const turnDraw = (g: CanvasRenderingContext2D) => {
  const p = new Pen(g);
  for (const v of VIEWS) p.ell(v.x + 8, SOLE_Y + 2, 120, 16, "rgba(36,23,38,0.12)", 0);
  p.stroke([[30, SOLE_Y + 4], [1050, SOLE_Y + 4]], 5, "rgba(36,23,38,0.45)");
  for (const y of [SOLE_Y - 0.5 * 463 * TS, SOLE_Y - 1.0 * 463 * TS, SOLE_Y - 1.5 * 463 * TS]) {
    g.save(); g.setLineDash([14, 14]); p.stroke([[30, y], [1050, y]], 2.5, "rgba(36,23,38,0.25)"); g.restore();
  }
  for (const v of VIEWS) at(g, v.x - 300 * TS, SOLE_Y - 975 * TS, TS, v.draw);
};
const SWATCH: [string, string][] = [["Жүні", LEO.fur], ["Дақтары", LEO.spot], ["Жилет", LEO.vest], ["Көйлек", LEO.shirt], ["Галстук", LEO.tie], ["Мұрны", LEO.nose]];
const TRAITS: [string, string][] = [["Ақылды", "#2f6fb0"], ["Мейірімді", "#e2553f"], ["Білімқұмар", "#3f9a4f"], ["Шабыттандырады", "#e8a23a"]];
export const TurnPage: React.FC = () => (
  <AbsoluteFill style={paperBg}>
    <Title n="06" big="ЖАН-ЖАҚТАН" small="Ақ барыс · бойы 1,7 метр" />
    <Draw w={1080} h={700} style={{ left: 0, top: 300 }} draw={turnDraw} />
    {[0.5, 1.0, 1.5].map((m) => (
      <div key={m} style={{ position: "absolute", right: 34, top: 300 + SOLE_Y - m * 463 * TS - 40, fontFamily: MONT, fontWeight: 700, fontSize: 24, color: "rgba(36,23,38,0.5)" }}>{String(m).replace(".", ",")} м</div>
    ))}
    {VIEWS.map((v) => (
      <div key={v.label} style={{ position: "absolute", left: v.x - 110, width: 220, top: 300 + SOLE_Y + 26, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: PLUM }}>{v.label}</div>
    ))}
    <div style={{ position: "absolute", left: 60, top: 1080, fontFamily: MONT, fontWeight: 900, fontSize: 46, color: PLUM }}>ТҮСТЕРІ</div>
    {SWATCH.map(([name, c], i) => (
      <div key={name} style={{ position: "absolute", left: 60 + i * 162, top: 1160, width: 150, textAlign: "center" }}>
        <div style={{ width: 112, height: 112, margin: "0 auto", borderRadius: 60, background: c, border: `6px solid ${PLUM}`, boxSizing: "border-box" }} />
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 25, color: PLUM, marginTop: 10 }}>{name}</div>
        <div style={{ fontFamily: MONT, fontWeight: 600, fontSize: 21, color: "#6a5a6e" }}>{c.toUpperCase()}</div>
      </div>
    ))}
    <div style={{ position: "absolute", left: 60, top: 1420, fontFamily: MONT, fontWeight: 900, fontSize: 46, color: PLUM }}>МІНЕЗІ</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1500, display: "flex", flexWrap: "wrap", gap: 22 }}>
      {TRAITS.map(([t, c]) => (
        <div key={t} style={{ fontFamily: MONT, fontWeight: 800, fontSize: 38, color: "#ffffff", background: c, border: `6px solid ${PLUM}`, borderRadius: 46, padding: "12px 34px" }}>{t}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1730, fontFamily: MONT, fontWeight: 700, fontSize: 36, lineHeight: 1.35, color: "#5a4a5e" }}>«Әр оқушыға сенеді — қатесін де, жетістігін де көреді.»</div>
  </AbsoluteFill>
);

// ---------------- overlays on the 3D pages ----------------
const Tag: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ position: "absolute", left: 48, bottom: 64, display: "flex", alignItems: "center", gap: 16 }}>
    <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 34, color: "#ffffff", background: "#c0503a", border: `5px solid ${PLUM}`, borderRadius: 30, padding: "6px 18px" }}>{n}</span>
    <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: 36, color: PLUM, background: "#fffaf0", border: `5px solid ${PLUM}`, borderRadius: 30, padding: "6px 24px" }}>{t}</span>
  </div>
);
export const HeroOverlay: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 44, top: 70, transform: "rotate(-3deg)", background: "#fbf3df", border: `7px solid ${PLUM}`, borderRadius: 26, padding: "18px 34px 24px", boxShadow: "8px 10px 0 rgba(36,23,38,0.35)" }}>
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 98, lineHeight: 1, color: PLUM }}>Мұғалім</div>
      <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: 40, color: "#c0503a", marginTop: 10 }}>— саған әрқашан сенеді!</div>
    </div>
    <Tag n="01" t="Танысыңыз" />
  </>
);
export const PageTag: React.FC<{ f: number }> = ({ f }) =>
  f === 1 ? <Tag n="02" t="Сабақ үстінде" /> : f === 2 ? <Tag n="03" t="Ойланып отыр" /> : f === 3 ? <Tag n="04" t="Керемет!" /> : null;
void INK;
