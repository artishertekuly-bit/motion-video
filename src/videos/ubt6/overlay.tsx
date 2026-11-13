// DOM overlays over the 3D picture: «25» hook slam, game HUD, the Results screen and the
// comment card (no WebGL in the last two).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT, OSW } from "../../qagaz/theme";
import { CARD_AT, FPS, sec, shotStart, ws } from "./timeline";
import { Pen, bodyFront, Expr, Outfit } from "./toon";
import { ARUZHAN, YSUIT } from "./stage";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => { const c = 1.9, x = cl(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

const BOX_Y = 316, BOX_H = 124, BOX_W = 276, BOX_X = [60, 357, 654];
const BOX1 = { x: BOX_X[0] + BOX_W / 2, y: BOX_Y + 78 };
const FLY_AT = 2.2, FLY_DUR = 0.5;
const SHOW = sec(FLY_AT + 0.25);
const PLUS = ws("n7", 7); // «сексен екі баллға жетті!» — БАЛЛ 78 -> 82 (+4)
const PULSES: { box: number; at: number }[] = [{ box: 1, at: PLUS }];

const Box: React.FC<{ i: number; f: number; label: string; value: string; color: string }> = ({ i, f, label, value, color }) => {
  const k = back((f - SHOW - i * 4) / 9);
  const pulse = PULSES.filter((p) => p.box === i).reduce((a, p) => Math.max(a, Math.max(0, 1 - Math.abs(f - p.at - 3) / 8)), 0);
  return (
    <div style={{
      position: "absolute", left: BOX_X[i], top: BOX_Y, width: BOX_W, height: BOX_H, borderRadius: 26, background: "rgba(10,14,32,0.92)",
      border: `4px solid ${pulse > 0.05 ? color : "rgba(255,255,255,0.85)"}`, boxShadow: `0 8px 0 rgba(0,0,0,0.35), 0 0 ${40 * pulse}px ${color}`,
      transform: `scale(${(0.2 + 0.8 * k) * (1 + 0.12 * pulse)})`, opacity: cl(k * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 25, letterSpacing: 2, color: "#A9BCE6" }}>{label}</div>
      <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 60, lineHeight: 1, color, marginTop: 4, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
};

export const Hud: React.FC<{ f: number }> = ({ f }) => {
  if (f < SHOW - 2 || f >= CARD_AT) return null;
  const rib = eo((f - SHOW) / 8);
  const up = f >= PLUS + 2;
  const plus = cl((f - PLUS) / 30);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60, width: 870, top: 252, height: 50, display: "flex", justifyContent: "center", opacity: rib, transform: `translateY(${(1 - rib) * -30}px)` }}>
        <div style={{ background: "#FFD84A", color: "#120C06", borderRadius: 25, padding: "0 28px", fontFamily: MONT, fontWeight: 800, fontSize: 30, lineHeight: "50px", letterSpacing: 1, boxShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          6-КҮН · СЕНБІ · ДЕМАЛЫС
        </div>
      </div>
      <Box i={0} f={f} label="ҰБТ-ҒА" value="25 КҮН" color="#FFD84A" />
      <Box i={1} f={f} label="БАЛЛ" value={up ? "82/140" : "78/140"} color="#4CD98A" />
      <Box i={2} f={f} label="ТЕЛЕФОН" value="0 САҒ" color="#4CD98A" />
      {f >= PLUS && plus < 1 ? (
        <div style={{ position: "absolute", left: BOX_X[1], width: BOX_W, top: BOX_Y + BOX_H + 4 - 60 * eo(plus), textAlign: "center", opacity: 1 - plus * plus, fontFamily: OSW, fontWeight: 700, fontSize: 72, color: "#4CD98A", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill" }}>+4</div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Big25: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  if (t > FLY_AT + FLY_DUR + 0.05) return null;
  const slam = cl((f - 1) / 6), sc = 1 + 2.2 * Math.pow(1 - slam, 2), fly = eo((t - FLY_AT) / FLY_DUR);
  const cx = interpolate(fly, [0, 1], [540, BOX1.x]), cy = interpolate(fly, [0, 1], [720, BOX1.y]), s = interpolate(fly, [0, 1], [1, 0.2]);
  const shake = f > 6 && f < 16 ? Math.sin(f * 3.1) * (16 - f) * 1.6 : 0;
  const sub = eo((f - ws("n1", 2) + 2) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - 400 + shake, top: cy - 260, width: 800, height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${sc * s})`, opacity: slam > 0 ? 1 - fly * 0.2 : 0 }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 380, lineHeight: 0.9, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 16px 0 rgba(0,0,0,0.5)" }}>25</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 86, lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", marginTop: -6, opacity: 1 - fly }}>КҮН</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 48, color: "#120C06", background: "#FFFFFF", borderRadius: 16, padding: "4px 22px", marginTop: 18, opacity: sub * (1 - fly), transform: `scale(${0.6 + 0.4 * sub})` }}>СЕНБІ · ГҮЛ СЫЙЛАУ</div>
      </div>
    </AbsoluteFill>
  );
};

export const SnowWalk: React.FC<{ f: number }> = ({ f }) => {
  const a = shotStart("sh08"), b = shotStart("sh16");
  if (f < a || f >= b) return null;
  const lf = f - a;
  const flakes = Array.from({ length: 30 }, (_, i) => {
    const rx = ((Math.sin(i * 123.4) * 43758.5) % 1 + 1) % 1;
    const ry = ((Math.cos(i * 321.7) * 23421.3) % 1 + 1) % 1;
    const sz = 6 + (i % 5) * 3;
    const x = (rx * 1080 + Math.sin((lf + i * 20) * 0.05) * 30) % 1080;
    const y = (ry * 1920 + lf * (3 + (i % 3) * 2)) % 1920;
    return { x, y, sz, op: 0.4 + (i % 4) * 0.15 };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {flakes.map((fl, i) => (
          <circle key={i} cx={fl.x} cy={fl.y} r={fl.sz} fill="#ffffff" opacity={fl.op} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Portrait: React.FC<{ o: Outfit; expr: Expr; facing: -1 | 0 | 1; w: number; wave?: number }> = ({ o, expr, facing, w, wave }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const h = Math.round((w * 1000) / 600);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(cv.width / 600, 0, 0, cv.width / 600, 0, 0);
    bodyFront(new Pen(g), o, { mode: "stand", expr, facing, seed: 3, light: (-3 * Math.PI) / 4, wave });
  }, [o, expr, facing, wave, w]);
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h, display: "block" }} />;
};

const count = (f: number, a: number, b: number, to: number) => Math.round(to * eo((f - a) / Math.max(1, b - a)));

/** Results screen (frames CARD_AT .. sh22): Aruzhan 10/10 vs Yerasyl 82 (+4) */
export const VsScreen: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh21"), en = shotStart("sh22");
  if (f < st || f >= en) return null;
  const lf = f - st;
  const inA = eo(lf / 10), inY = eo((lf - 5) / 10), vs = cl((lf - 6) / 6), vsSc = 1 + 1.8 * Math.pow(1 - vs, 2);
  const shake = lf > 10 && lf < 20 ? Math.sin(lf * 3.3) * (20 - lf) * 1.4 : 0;
  const yS = count(f, st + 10, st + 30, 82);
  const pill = back((lf - 20) / 9);
  const yExpr: Expr = "grin";
  const aExpr: Expr = "grin";
  const lines = Array.from({ length: 18 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 91.7 + k * 47.3) * 43758.5453; return x - Math.floor(x); };
    const y = r(1) * 1920, len = 200 + r(2) * 400, x = ((r(3) * 1500 + lf * (30 + r(4) * 30)) % 1600) - 400;
    return { x: i % 2 ? 1080 - x - len : x, y, len };
  });
  const fade = 1 - cl((f - (en - 6)) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "#1a2040", opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="vsA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e84368" /><stop offset="1" stopColor="#962243" /></linearGradient>
          <linearGradient id="vsY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34508a" /><stop offset="1" stopColor="#141a36" /></linearGradient>
        </defs>
        <polygon points="0,0 1080,0 1080,820 0,1180" fill="url(#vsA)" />
        <polygon points="0,1180 1080,820 1080,1920 0,1920" fill="url(#vsY)" />
        {lines.map((l, i) => <rect key={i} x={l.x} y={l.y} width={l.len} height={6} rx={3} fill="#ffffff" opacity={0.12} />)}
        <polygon points="0,1160 1080,800 1080,840 0,1200" fill="#FFD84A" />
      </svg>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 236, display: "flex", justifyContent: "center", opacity: inA }}>
        <div style={{ background: "#FFD84A", borderRadius: 34, padding: "6px 40px", fontFamily: MONT, fontWeight: 800, fontSize: 46, color: "#120C06", boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          6-КҮН · ДЕМАЛЫС ҚОРЫТЫНДЫСЫ
        </div>
      </div>
      <div style={{ position: "absolute", left: -55 - 600 * (1 - inA), top: 105 }}><Portrait o={ARUZHAN} expr={aExpr} facing={1} w={650} wave={0.8} /></div>
      <div style={{ position: "absolute", left: 560, top: 470, width: 480, textAlign: "center", opacity: inA }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 50, color: "#FFFFFF", letterSpacing: 3 }}>АРУЖАН</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 210, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "7px #120C06", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>10/10</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 36, color: "#FFFFFF" }}>СЫЙЛЫҚ ҰНАДЫ! 💖</div>
      </div>
      <div style={{ position: "absolute", left: 475 + 600 * (1 - inY), top: 675 }}><Portrait o={YSUIT} expr={yExpr} facing={-1} w={650} /></div>
      <div style={{ position: "absolute", left: 40, top: 1180, width: 480, textAlign: "center", opacity: inY }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 50, color: "#FFFFFF", letterSpacing: 3 }}>ЕРАСЫЛ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 230, lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: "7px #120C06", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>{yS}</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 38, color: "#4CD98A" }}>+4 БАЛЛ! ⭐</div>
      </div>
      <div style={{ position: "absolute", left: 340 + shake, top: 830, width: 400, height: 300, display: "flex", justifyContent: "center", alignItems: "center", opacity: cl(vs * 3), transform: `rotate(-12deg) scale(${vsSc})` }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 220, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 14px 0 rgba(0,0,0,0.5)" }}>&</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1550, display: "flex", justifyContent: "center", opacity: cl(pill * 2) }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * pill})`, background: "#2FB36B", borderRadius: 44, padding: "12px 48px", fontFamily: MONT, fontWeight: 800, fontSize: 44, color: "#FFFFFF", boxShadow: "0 10px 0 rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          ШПАРГАЛКА-БУКЕТ СӘТТІ!
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Bubble: React.FC = () => (
  <svg width={300} height={250} viewBox="-150 -125 300 250">
    <path d="M -120 -90 Q -120 -110 -100 -110 L 100 -110 Q 120 -110 120 -90 L 120 40 Q 120 60 100 60 L -10 60 L -60 110 L -50 60 L -100 60 Q -120 60 -120 40 Z" fill="#F4F1EA" stroke="#120C06" strokeWidth={10} strokeLinejoin="round" />
    {[-55, 0, 55].map((x) => <circle key={x} cx={x} cy={-25} r={16} fill="#120C06" />)}
  </svg>
);

const IDEAS = [
  "таңғы 6:00-де 100 тест талдау?",
  "компьютерлік клубта турнир?",
  "Аружанмен мұз айдынында сырғанау?",
];

/** final card (sh22): «7-КҮН: ЖЕКСЕНБІДЕ ЕРАСЫЛ НЕ ІСТЕЙДІ?» */
export const VoteCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh22");
  if (f < st) return null;
  const lf = f - st, inK = eo(lf / 10);
  const btn = cl((f - ws("n9", 11) + 3) / 6);
  const pulse = btn > 0 ? 1 + 0.06 * Math.sin((f - ws("n9", 11)) * 0.35) : 1;
  const foot = cl((f - ws("n9", 13) + 3) / 8);
  const conf = Array.from({ length: 26 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
    const tt = ((lf * (0.6 + r(1) * 0.8) + r(2) * 400) % 400) / 400;
    return { x: r(3) * 1080, y: tt * 2000 - 80, rot: tt * 720 + i * 40, c: ["#FFD84A", "#E84368", "#2FB36B", "#FFFFFF"][i % 4] };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg,#24305e 0%,#46244c 55%,#1a2040 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(232,67,104,0.18), rgba(0,0,0,0.4) 72%)" }} />
      {conf.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 16, height: 26, borderRadius: 4, background: c.c, opacity: 0.7, transform: `rotate(${c.rot}deg)` }} />)}
      <div style={{ position: "absolute", left: 60, width: 870, top: 280, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK, transform: `scale(${0.85 + 0.15 * inK})` }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 104, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "5px #120C06", paintOrder: "stroke fill" }}>7-КҮН: ЖЕКСЕНБІДЕ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 88, lineHeight: 1.05, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>ЕРАСЫЛ НЕ ІСТЕЙДІ?</div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 560, display: "flex", justifyContent: "center", opacity: inK }}><Bubble /></div>
      {IDEAS.map((t, i) => {
        const k = back((lf - 18 - i * 12) / 9);
        return (
          <div key={t} style={{ position: "absolute", left: [70, 95, 60][i], top: 830 + i * 100, opacity: cl(k * 2), transform: `scale(${0.4 + 0.6 * k}) rotate(${i % 2 ? 2 : -2}deg)`,
            background: "#FFFFFF", borderRadius: 40, padding: "14px 34px", fontFamily: MONT, fontWeight: 800, fontSize: 36, color: "#120C06", boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
            {t} <span style={{ color: "#E84368" }}>♥ {[842, 521, 915][i]}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 60, width: 870, top: 1140, height: 110, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 54, color: "#120C06", background: "#FFD84A", borderRadius: 60, padding: "14px 64px", boxShadow: "0 10px 0 #B88A10", transform: `scale(${(0.5 + 0.5 * eo(btn)) * pulse})`, opacity: btn }}>ПІКІРГЕ ЖАЗ ↓</div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1262, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 31, color: "#FFFFFF", opacity: foot }}>ЕҢ КӨП ЛАЙК ЖИНАҒАН НҰСҚА — 7-КҮННІҢ БАСЫ →</div>
    </AbsoluteFill>
  );
};
