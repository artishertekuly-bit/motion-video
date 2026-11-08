// DOM overlays over the 3D picture: «29» hook slam, game HUD, the ӨТІРІК №2 stamp and the vote card (no WebGL there).
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT, OSW } from "../../qagaz/theme";
import { CARD_AT, FPS, sec, shotStart, ws } from "./timeline";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => { const c = 1.9, x = cl(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

const BOX_Y = 316, BOX_H = 124, BOX_W = 276, BOX_X = [60, 357, 654];
const BOX1 = { x: BOX_X[0] + BOX_W / 2, y: BOX_Y + 78 };
const FLY_AT = 2.2, FLY_DUR = 0.5;
const SHOW = sec(FLY_AT + 0.25);
const PHONE0 = ws("n2", 3); // «телефон» — 9 САҒ -> 0 САҒ
const PULSES: { box: number; at: number }[] = [{ box: 2, at: PHONE0 }, { box: 0, at: ws("n11", 0) }];

const Box: React.FC<{ i: number; f: number; label: string; value: string; color: string }> = ({ i, f, label, value, color }) => {
  const k = back((f - SHOW - i * 4) / 9);
  const pulse = PULSES.filter((p) => p.box === i).reduce((a, p) => Math.max(a, Math.max(0, 1 - Math.abs(f - p.at - 3) / 8)), 0);
  return (
    <div style={{
      position: "absolute", left: BOX_X[i], top: BOX_Y, width: BOX_W, height: BOX_H, borderRadius: 26, background: "rgba(10,14,32,0.84)",
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
  const zero = f >= PHONE0 + 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60, width: 870, top: 252, height: 50, display: "flex", justifyContent: "center", opacity: rib, transform: `translateY(${(1 - rib) * -30}px)` }}>
        <div style={{ background: "#FFD84A", color: "#120C06", borderRadius: 25, padding: "0 28px", fontFamily: MONT, fontWeight: 800, fontSize: 30, lineHeight: "50px", letterSpacing: 1, boxShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
          2-КҮН · ҰБТ-ҒА 29 КҮН ҚАЛДЫ
        </div>
      </div>
      <Box i={0} f={f} label="ҰБТ-ҒА" value="29 КҮН" color="#FFD84A" />
      <Box i={1} f={f} label="БАЛЛ" value="47/140" color="#FF5A4E" />
      <Box i={2} f={f} label="ТЕЛЕФОН" value={zero ? "0 САҒ" : "9 САҒ"} color={zero ? "#4CD98A" : "#FF9F3A"} />
    </AbsoluteFill>
  );
};

export const Big29: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  if (t > FLY_AT + FLY_DUR + 0.05) return null;
  const slam = cl((f - 1) / 6), sc = 1 + 2.2 * Math.pow(1 - slam, 2), fly = eo((t - FLY_AT) / FLY_DUR);
  const cx = interpolate(fly, [0, 1], [540, BOX1.x]), cy = interpolate(fly, [0, 1], [720, BOX1.y]), s = interpolate(fly, [0, 1], [1, 0.2]);
  const shake = f > 6 && f < 16 ? Math.sin(f * 3.1) * (16 - f) * 1.6 : 0;
  const sub = eo((f - ws("n1", 2) + 2) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - 400 + shake, top: cy - 260, width: 800, height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${sc * s})`, opacity: slam > 0 ? 1 - fly * 0.2 : 0 }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 380, lineHeight: 0.9, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 16px 0 rgba(0,0,0,0.5)" }}>29</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 86, lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", marginTop: -6, opacity: 1 - fly }}>КҮН</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 48, color: "#120C06", background: "#FFFFFF", borderRadius: 16, padding: "4px 22px", marginTop: 18, opacity: sub * (1 - fly), transform: `scale(${0.6 + 0.4 * sub})` }}>ҰБТ-ҒА ДЕЙІН</div>
      </div>
    </AbsoluteFill>
  );
};

/** red rubber stamp, slams in at frame `at` */
export const Stamp: React.FC<{ f: number; at: number; until: number; text: string; y?: number }> = ({ f, at, until, text, y = 760 }) => {
  if (f < at || f >= until) return null;
  const k = cl((f - at) / 6), sc = 1 + 1.6 * Math.pow(1 - k, 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 90, width: 900, top: y - 110, height: 220, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `rotate(-8deg) scale(${sc})`, opacity: cl(k * 3), border: "12px solid #E2483D", borderRadius: 22, padding: "6px 40px", background: "rgba(255,248,236,0.88)", fontFamily: OSW, fontWeight: 700, fontSize: 120, color: "#E2483D", letterSpacing: 4, whiteSpace: "nowrap", boxShadow: "inset 0 0 0 5px rgba(226,72,61,0.6)" }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Check: React.FC = () => (
  <svg width={260} height={260} viewBox="-130 -130 260 260">
    <circle r={110} fill="#F4F1EA" stroke="#120C06" strokeWidth={10} />
    <path d="M -55 0 L -15 42 L 60 -45" stroke="#1E8A4E" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Nose: React.FC = () => (
  <svg width={260} height={260} viewBox="-130 -130 260 260">
    <circle cx={-40} cy={0} r={78} fill="#F1C9A3" stroke="#120C06" strokeWidth={10} />
    <path d="M 20 -12 L 125 -4 Q 132 4 125 12 L 22 18 Z" fill="#E8A87C" stroke="#120C06" strokeWidth={9} strokeLinejoin="round" />
    <circle cx={-60} cy={-18} r={9} fill="#120C06" /><circle cx={-20} cy={-18} r={9} fill="#120C06" />
    <path d="M -70 30 Q -40 48 -10 30" stroke="#120C06" strokeWidth={8} fill="none" strokeLinecap="round" />
  </svg>
);

/** final card (frames >= CARD_AT): ШЫНДЫҚ vs ӨТІРІК, «БІР СӨЗ ЖАЗ», «ДАУЫС БЕР» */
export const VoteCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh17");
  if (f < st) return null;
  const lf = f - st, inK = eo(lf / 10);
  const hlA = cl((f - ws("n12", 7) + 3) / 6) * (1 - cl((f - ws("n12", 10)) / 6));
  const hlB = cl((f - ws("n12", 11) + 3) / 6) * (1 - cl((f - ws("n12", 14)) / 6));
  const btn = cl((f - ws("n12", 14) + 3) / 6);
  const pulse = btn > 0 ? 1 + 0.06 * Math.sin((f - ws("n12", 14)) * 0.35) : 1;
  const day3 = cl((f - ws("n12", 18) + 3) / 8);
  const side = (hl: number, left: boolean): React.CSSProperties => ({
    position: "absolute", top: 450, height: 620, width: 430, left: left ? 60 : 510, borderRadius: 40,
    background: left ? "linear-gradient(180deg,#3CCB7E,#1E8A4E)" : "linear-gradient(180deg,#F05A4A,#B8322A)",
    border: `6px solid ${hl > 0.1 ? "#FFFFFF" : "rgba(255,255,255,0.35)"}`, boxShadow: `0 14px 0 rgba(0,0,0,0.35), 0 0 ${60 * hl}px rgba(255,255,255,0.8)`,
    transform: `translateX(${(1 - inK) * (left ? -500 : 500)}px) scale(${1 + 0.06 * hl})`,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 40, overflow: "hidden",
  });
  const big: React.CSSProperties = { fontFamily: OSW, fontWeight: 700, fontSize: 84, lineHeight: 1, color: "#FFFFFF", textShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" };
  const small: React.CSSProperties = { fontFamily: MONT, fontWeight: 800, fontSize: 32, lineHeight: 1.15, color: "#FFFFFF", textAlign: "center", marginTop: 12 };
  const conf = Array.from({ length: 26 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
    const tt = ((lf * (0.6 + r(1) * 0.8) + r(2) * 400) % 400) / 400;
    return { x: r(3) * 1080, y: tt * 2000 - 80, rot: tt * 720 + i * 40, c: ["#FFD84A", "#E2483D", "#2FB36B", "#FFFFFF"][i % 4] };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(90deg,#123a26 0%,#123a26 50%,#3a1418 50%,#3a1418 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.10), rgba(0,0,0,0.45) 75%)" }} />
      {conf.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 16, height: 26, borderRadius: 4, background: c.c, opacity: 0.75, transform: `rotate(${c.rot}deg)` }} />)}
      <div style={{ position: "absolute", left: 60, width: 870, top: 280, height: 130, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#A9BCE6", letterSpacing: 3 }}>АРУЖАНҒА НЕ АЙТАДЫ?</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: "#FFD84A", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill" }}>БІР СӨЗ ЖАЗ</div>
      </div>
      <div style={side(hlA, true)}><div style={{ marginBottom: 10 }}><Check /></div><div style={big}>ШЫНДЫҚ</div><div style={small}>«мен әлі<br />дайын емеспін»</div></div>
      <div style={side(hlB, false)}><div style={{ marginBottom: 10 }}><Nose /></div><div style={big}>ӨТІРІК</div><div style={small}>«мен күнде<br />оқимын»</div></div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1100, height: 120, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 54, color: "#120C06", background: "#FFD84A", borderRadius: 60, padding: "14px 64px", boxShadow: "0 10px 0 #B88A10", transform: `scale(${(0.5 + 0.5 * eo(btn)) * pulse})`, opacity: btn }}>ДАУЫС БЕР ↓</div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1240, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#FFFFFF", opacity: day3 }}>3-КҮН СЕНІҢ ТАҢДАУЫҢНАН БАСТАЛАДЫ →</div>
    </AbsoluteFill>
  );
};
