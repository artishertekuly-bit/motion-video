// DOM overlays over the 3D picture: the series tag, the lesson timer (10:00 -> 01:00 -> stops at the stamp) and the end
// card (no WebGL): a chalkboard with the question, Barys drawn with the same leopard Pen as the 3D cards.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { MONT } from "../../qagaz/theme";
import { CARD_AT, FPS, shotStart, ws } from "./timeline";
import { Pen } from "./toon";
import { leopardFront } from "./leopard";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => { const c = 1.9, x = cl(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

/** «БАРЫС АҒАЙ · 2-САБАҚ» — the series tag over the hook (0 .. sh03) */
export const SeriesTag: React.FC<{ f: number }> = ({ f }) => {
  const end = shotStart("sh03") + 20;
  if (f >= end) return null;
  const k = back((f - 4) / 10) * (1 - cl((f - end + 8) / 8));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 250, display: "flex", justifyContent: "center", opacity: cl(k * 2), transform: `translateY(${(1 - k) * -40}px)` }}>
        <div style={{ background: "#FFD84A", color: "#120C06", borderRadius: 30, padding: "0 34px", fontFamily: MONT, fontWeight: 800, fontSize: 36, lineHeight: "62px", letterSpacing: 2, boxShadow: "0 7px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          БАРЫС АҒАЙ · 2-САБАҚ
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** lesson timer: appears on «он минут», runs 10:00 -> 01:00 by «Бір минут қалды», then slowly, stops at the stamp */
export const Timer: React.FC<{ f: number }> = ({ f }) => {
  const a = ws("t2", 13) - 2, b = ws("n7", 0), stop = shotStart("sh15"), hide = shotStart("sh18");
  if (f < a || f >= hide) return null;
  const ff = Math.min(f, stop);
  const left = ff <= b ? 600 - (540 * (ff - a)) / Math.max(1, b - a) : 60 - ((ff - b) / FPS) * 3.5;
  const s = Math.max(0, Math.round(left)), mm = String(Math.floor(s / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  const inK = back((f - a) / 9), out = 1 - cl((f - hide + 8) / 8);
  const pulse = Math.max(0, 1 - Math.abs(f - b - 4) / 14);
  const red = f >= b - 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", right: 60, top: 250, height: 92, borderRadius: 46, padding: "0 30px 0 22px", display: "flex", alignItems: "center", gap: 14,
        background: red ? "rgba(226,72,61,0.94)" : "rgba(18,12,6,0.82)", border: "4px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
        transform: `scale(${(0.3 + 0.7 * inK) * (1 + 0.28 * pulse)})`, transformOrigin: "100% 50%", opacity: cl(inK * 2) * out,
      }}>
        <svg width={52} height={52} viewBox="-26 -26 52 52">
          <circle r={21} fill="none" stroke="#FFD84A" strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-13} stroke="#FFD84A" strokeWidth={5} strokeLinecap="round" transform={`rotate(${(ff * 12) % 360})`} />
          <rect x={-6} y={-31} width={12} height={6} rx={2} fill="#FFD84A" />
        </svg>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 58, color: "#FFFFFF", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</div>
      </div>
    </AbsoluteFill>
  );
};

const Leo: React.FC<{ w: number }> = ({ w }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const h = Math.round((w * 1000) / 600);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(cv.width / 600, 0, 0, cv.width / 600, 0, 0);
    leopardFront(new Pen(g), { expr: "smile", facing: -1, arms: ["point", "hip"], glasses: true, tail: 1, light: (-3 * Math.PI) / 4 });
  }, [w]);
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h, display: "block" }} />;
};

/** end card (CARD_AT ..): «Ал сен 10 сұраққа әдейі "ҚАТЕ" жаза алар ма едің?» on a chalkboard + «ПІКІРГЕ ЖАЗ ↓» */
export const EndCard: React.FC<{ f: number; chalk: string }> = ({ f, chalk }) => {
  if (f < CARD_AT) return null;
  const lf = f - CARD_AT, inK = eo(lf / 10);
  const line = (i: number) => eo((f - ws("n9", [0, 2, 5][i]) + 6) / 8);
  const btn = back((f - ws("n9", 10) + 3) / 9);
  const pulse = btn > 0.9 ? 1 + 0.05 * Math.sin((f - ws("n9", 10)) * 0.35) : 1;
  const leo = back((lf - 4) / 12);
  const dust = Array.from({ length: 18 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
    return { x: 80 + r(1) * 920, y: ((r(2) * 1700 + lf * (0.8 + r(3))) % 1700) + 120, s: 4 + r(4) * 6 };
  });
  const T = (s: string, px: number, col = "#F6F4E8") => (
    <span style={{ fontFamily: chalk, fontWeight: 700, fontSize: px, lineHeight: 1.0, color: col, textShadow: "0 0 2px rgba(255,255,255,0.35)" }}>{s}</span>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "#6b4526", opacity: inK }}>
      <div style={{ position: "absolute", left: 34, top: 150, right: 34, bottom: 150, borderRadius: 18, background: "radial-gradient(ellipse at 45% 35%, #3a6e57 0%, #2e5b47 55%, #244a3a 100%)", boxShadow: "inset 0 0 0 14px #4a2e18, inset 0 0 60px rgba(0,0,0,0.45)" }} />
      {dust.map((d, i) => <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: d.s, background: "rgba(255,255,255,0.18)" }} />)}
      <div style={{ position: "absolute", left: 90, top: 320, width: 900 }}>
        <div style={{ opacity: line(0), transform: `translateX(${(1 - line(0)) * -40}px)` }}>{T("Ал сен", 108)}</div>
        <div style={{ opacity: line(1), transform: `translateX(${(1 - line(1)) * -40}px)`, marginTop: 14 }}>{T("он сұраққа әдейі", 102)}</div>
        <div style={{ opacity: line(2), transform: `translateX(${(1 - line(2)) * -40}px)`, marginTop: 22, whiteSpace: "nowrap" }}>
          {T("«ҚАТЕ»", 148, "#FFE278")} {T(" жаза алар", 100)}
        </div>
        <div style={{ opacity: line(2), marginTop: 18 }}>{T("ма едің?", 108)}</div>
        <svg width={520} height={40} style={{ marginTop: 6, opacity: line(2) }}><path d="M 10 22 Q 260 40 510 14" stroke="#FFE278" strokeWidth={8} fill="none" strokeLinecap="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 540, top: 880, transform: `translateY(${(1 - leo) * 260}px)`, opacity: cl(leo * 2) }}><Leo w={470} /></div>
      <div style={{ position: "absolute", left: 70, top: 1250, width: 520, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 52, color: "#120C06", background: "#FFD84A", borderRadius: 60, padding: "16px 50px", boxShadow: "0 10px 0 #B88A10", transform: `scale(${(0.4 + 0.6 * btn) * pulse})`, opacity: cl(btn * 2), whiteSpace: "nowrap" }}>ПІКІРГЕ ЖАЗ ↓</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 212, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: "#FFD84A", opacity: cl((lf - 30) / 12) }}>БАРЫС АҒАЙ · 3-САБАҚ ЖАҚЫНДА</div>
    </AbsoluteFill>
  );
};
