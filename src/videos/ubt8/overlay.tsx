// DOM overlays over the 3D picture: «23» hook slam, game HUD, Results screen and Vote card.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT, OSW } from "../../qagaz/theme";
import { CARD_AT, FPS, sec, shotStart, ws } from "./timeline";
import { Pen, bodyFront, Expr, Outfit } from "./toon";
import { ARUZHAN, GULNAR } from "./stage";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => { const c = 1.9, x = cl(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

const BOX_Y = 316, BOX_H = 124, BOX_W = 276, BOX_X = [60, 357, 654];
const BOX1 = { x: BOX_X[0] + BOX_W / 2, y: BOX_Y + 78 };
const FLY_AT = 2.2, FLY_DUR = 0.5;
const SHOW = sec(FLY_AT + 0.25);
const CRASH_AT = ws("g3", 2); // «елу сегіз балл!» — балл 82 -> 58 (-24)

const Box: React.FC<{ i: number; f: number; label: string; value: string; color: string; shake?: number }> = ({ i, f, label, value, color, shake = 0 }) => {
  const k = back((f - SHOW - i * 4) / 9);
  const isCrash = i === 1 && f >= CRASH_AT && f < CRASH_AT + 18;
  const crashShake = isCrash ? Math.sin((f - CRASH_AT) * 4.2) * 8 : 0;
  return (
    <div style={{
      position: "absolute", left: BOX_X[i] + shake + crashShake, top: BOX_Y, width: BOX_W, height: BOX_H, borderRadius: 26, background: "rgba(10,14,32,0.92)",
      border: `4px solid ${isCrash ? "#FF4D4D" : "rgba(255,255,255,0.85)"}`, boxShadow: `0 8px 0 rgba(0,0,0,0.35), 0 0 ${isCrash ? 35 : 0}px ${color}`,
      transform: `scale(${0.2 + 0.8 * k})`, opacity: cl(k * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 25, letterSpacing: 2, color: "#A9BCE6" }}>{label}</div>
      <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 60, lineHeight: 1, color, marginTop: 4, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
};

export const Hud: React.FC<{ f: number }> = ({ f }) => {
  if (f < SHOW - 2 || f >= CARD_AT) return null;
  const rib = eo((f - SHOW) / 8);
  const dropped = f >= CRASH_AT;
  const dropPill = cl((f - CRASH_AT) / 35);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 252, height: 50, display: "flex", justifyContent: "center", opacity: rib, transform: `translateY(${(1 - rib) * -30}px)` }}>
        <div style={{ background: "#FFD84A", color: "#120C06", borderRadius: 25, padding: "0 28px", fontFamily: MONT, fontWeight: 800, fontSize: 30, lineHeight: "50px", letterSpacing: 1, boxShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          8-КҮН · ДҮЙСЕНБІ · ҚАТАЛ СЫНАҚ
        </div>
      </div>
      <Box i={0} f={f} label="ҰБТ-ҒА" value="23 КҮН" color="#FFD84A" />
      <Box i={1} f={f} label="БАЛЛ" value={dropped ? "58/140" : "82/140"} color={dropped ? "#FF4D4D" : "#4CD98A"} />
      <Box i={2} f={f} label="ТЕЛЕФОН" value="0 САҒ" color="#4CD98A" />
      {dropped && dropPill < 1 ? (
        <div style={{ position: "absolute", left: BOX_X[1] - 40, width: BOX_W + 80, top: BOX_Y + BOX_H + 8 - 50 * eo(dropPill), textAlign: "center", opacity: 1 - dropPill * dropPill, fontFamily: OSW, fontWeight: 700, fontSize: 68, color: "#FF4D4D", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
          -24 БАЛЛ! 📉
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Big23: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  if (t > FLY_AT + FLY_DUR + 0.05) return null;
  const slam = cl((f - 1) / 6), sc = 1 + 2.2 * Math.pow(1 - slam, 2), fly = eo((t - FLY_AT) / FLY_DUR);
  const cx = interpolate(fly, [0, 1], [540, BOX1.x]), cy = interpolate(fly, [0, 1], [720, BOX1.y]), s = interpolate(fly, [0, 1], [1, 0.2]);
  const shake = f > 6 && f < 16 ? Math.sin(f * 3.1) * (16 - f) * 1.6 : 0;
  const sub = eo((f - ws("n1", 2) + 2) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - 400 + shake, top: cy - 260, width: 800, height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${sc * s})`, opacity: slam > 0 ? 1 - fly * 0.2 : 0 }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 380, lineHeight: 0.9, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 16px 0 rgba(0,0,0,0.5)" }}>23</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 86, lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", marginTop: -6, opacity: 1 - fly }}>КҮН</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 44, color: "#120C06", background: "#FFFFFF", borderRadius: 16, padding: "4px 22px", marginTop: 18, opacity: sub * (1 - fly), transform: `scale(${0.6 + 0.4 * sub})` }}>ДҮЙСЕНБІ · ҚАТАЛ СЫНАҚ</div>
      </div>
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

/** Results screen (sh19): Gulnar apai 58 vs Strategy 100+ */
export const VsScreen: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh19"), en = shotStart("sh20");
  if (f < st || f >= en) return null;
  const lf = f - st;
  const inA = eo(lf / 10), inY = eo((lf - 5) / 10), vs = cl((lf - 6) / 6), vsSc = 1 + 1.8 * Math.pow(1 - vs, 2);
  const shake = lf > 10 && lf < 20 ? Math.sin(lf * 3.3) * (20 - lf) * 1.4 : 0;
  const pill = back((lf - 20) / 9);
  const fade = 1 - cl((f - (en - 6)) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "#1a2040", opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="vsA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a82436" /><stop offset="1" stopColor="#631420" /></linearGradient>
          <linearGradient id="vsY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24508a" /><stop offset="1" stopColor="#141a36" /></linearGradient>
        </defs>
        <polygon points="0,0 1080,0 1080,820 0,1180" fill="url(#vsA)" />
        <polygon points="0,1180 1080,820 1080,1920 0,1920" fill="url(#vsY)" />
        <polygon points="0,1160 1080,800 1080,840 0,1200" fill="#FFD84A" />
      </svg>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 220, display: "flex", justifyContent: "center", opacity: inA }}>
        <div style={{ background: "#FFD84A", borderRadius: 34, padding: "6px 36px", fontFamily: MONT, fontWeight: 800, fontSize: 42, color: "#120C06", boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          8-КҮН · ДАЙЫНДЫҚ ҚОРЫТЫНДЫСЫ
        </div>
      </div>
      <div style={{ position: "absolute", left: -55 - 600 * (1 - inA), top: 120 }}><Portrait o={GULNAR} expr="stern" facing={1} w={640} /></div>
      <div style={{ position: "absolute", left: 560, top: 460, width: 480, textAlign: "center", opacity: inA }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 44, color: "#FFFFFF", letterSpacing: 2 }}>ГҮЛНАР АПАЙ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 180, lineHeight: 1, color: "#FF4D4D", WebkitTextStroke: "7px #120C06", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>58 / 140</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#FFFFFF" }}>ҚАТАЛ САБАҚ 📉</div>
      </div>
      <div style={{ position: "absolute", left: 475 + 600 * (1 - inY), top: 675 }}><Portrait o={ARUZHAN} expr="grin" facing={-1} w={650} wave={0.7} /></div>
      <div style={{ position: "absolute", left: 40, top: 1180, width: 480, textAlign: "center", opacity: inY }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 44, color: "#FFFFFF", letterSpacing: 2 }}>АРУЖАН & ЕРАСЫЛ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 190, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "7px #120C06", paintOrder: "stroke fill", textShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>100+ 🎯</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#4CD98A", whiteSpace: "nowrap" }}>СТРАТЕГИЯ ТАБЫЛДЫ!</div>
      </div>
      <div style={{ position: "absolute", left: 340 + shake, top: 830, width: 400, height: 300, display: "flex", justifyContent: "center", alignItems: "center", opacity: cl(vs * 3), transform: `rotate(-12deg) scale(${vsSc})` }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 220, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 14px 0 rgba(0,0,0,0.5)" }}>&</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1530, display: "flex", justifyContent: "center", opacity: cl(pill * 2) }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * pill})`, background: "#2FB36B", borderRadius: 44, padding: "12px 48px", fontFamily: MONT, fontWeight: 800, fontSize: 38, color: "#FFFFFF", boxShadow: "0 10px 0 rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          ЖАЛҒАН ӨСУДЕН — НАҒЫЗ ДАЙЫНДЫҚҚА!
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
  "түнгі кітапханада марафон?",
  "Гүлнар апайдан қайта сынақ?",
  "күрделі физикалық тәжірибе?",
];

/** Final vote card (sh20): «9-КҮН: СЕЙСЕНБІДЕ НЕ ІСТЕЙДІ?» */
export const VoteCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh20");
  if (f < st) return null;
  const lf = f - st, inK = eo(lf / 10);
  const btn = cl((f - ws("n8", 10) + 3) / 6);
  const pulse = btn > 0 ? 1 + 0.06 * Math.sin((f - ws("n8", 10)) * 0.35) : 1;
  const foot = cl((f - ws("n8", 12) + 3) / 8);
  const conf = Array.from({ length: 26 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
    const tt = ((lf * (0.6 + r(1) * 0.8) + r(2) * 400) % 400) / 400;
    return { x: r(3) * 1080, y: tt * 2000 - 80, rot: tt * 720 + i * 40, c: ["#FFD84A", "#E84368", "#2FB36B", "#FFFFFF"][i % 4] };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg,#24305e 0%,#46244c 55%,#1a2040 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(232,67,104,0.18), rgba(0,0,0,0.4) 72%)" }} />
      {conf.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 16, height: 26, borderRadius: 4, background: c.c, opacity: 0.7, transform: `rotate(${c.rot}deg)` }} />)}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 270, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK, transform: `scale(${0.85 + 0.15 * inK})` }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 104, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "5px #120C06", paintOrder: "stroke fill" }}>9-КҮН: СЕЙСЕНБІДЕ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 78, lineHeight: 1.05, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>ЕРАСЫЛ МЕН АРУЖАН НЕ ІСТЕЙДІ?</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 560, display: "flex", justifyContent: "center", opacity: inK }}><Bubble /></div>
      {IDEAS.map((t, i) => {
        const k = back((lf - 18 - i * 12) / 9);
        return (
          <div key={t} style={{ position: "absolute", left: 0, width: 1080, top: 820 + i * 110, display: "flex", justifyContent: "center", opacity: cl(k * 2) }}>
            <div style={{ transform: `scale(${0.4 + 0.6 * k}) rotate(${i % 2 ? 1.5 : -1.5}deg)`,
              background: "#FFFFFF", borderRadius: 40, padding: "14px 42px", fontFamily: MONT, fontWeight: 800, fontSize: 36, color: "#120C06", boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
              {t} <span style={{ color: "#E84368" }}>♥ {[1180, 1350, 940][i]}</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1160, height: 110, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 54, color: "#120C06", background: "#FFD84A", borderRadius: 60, padding: "14px 64px", boxShadow: "0 10px 0 #B88A10", transform: `scale(${(0.5 + 0.5 * eo(btn)) * pulse})`, opacity: btn }}>ПІКІРГЕ ЖАЗ ↓</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1290, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 31, color: "#FFFFFF", opacity: foot }}>ЕҢ КӨП ЛАЙК ЖИНАҒАН НҰСҚА — 9-КҮННІҢ БАСЫ →</div>
    </AbsoluteFill>
  );
};
