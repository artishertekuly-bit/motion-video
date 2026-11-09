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
const PHONE0 = ws("n3b", 2); // «телефон — мұздатқышқа» — 9 САҒ -> 0 САҒ
const PULSES: { box: number; at: number }[] = [{ box: 2, at: PHONE0 }, { box: 0, at: ws("n11b", 0) }];

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

const Bubble: React.FC = () => (
  <svg width={300} height={250} viewBox="-150 -125 300 250">
    <path d="M -120 -90 Q -120 -110 -100 -110 L 100 -110 Q 120 -110 120 -90 L 120 40 Q 120 60 100 60 L -10 60 L -60 110 L -50 60 L -100 60 Q -120 60 -120 40 Z" fill="#F4F1EA" stroke="#120C06" strokeWidth={10} strokeLinejoin="round" />
    {[-55, 0, 55].map((x) => <circle key={x} cx={x} cy={-25} r={16} fill="#120C06" />)}
  </svg>
);
const IDEAS = ["таңғы жүгіру?", "Аружанмен бірге оқу?", "тағы бір күн телефонсыз?"];

/** final card (frames >= CARD_AT): «3-КҮНДІ ҚАЛАЙ ӨТКІЗЕМІЗ?» — ideas in the comments, the most liked one starts Day 3 */
export const VoteCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh17");
  if (f < st) return null;
  const lf = f - st, inK = eo(lf / 10);
  const btn = cl((f - ws("n12b", 4) + 3) / 6);
  const pulse = btn > 0 ? 1 + 0.06 * Math.sin((f - ws("n12b", 4)) * 0.35) : 1;
  const foot = cl((f - ws("n12b", 6) + 3) / 8);
  const conf = Array.from({ length: 26 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
    const tt = ((lf * (0.6 + r(1) * 0.8) + r(2) * 400) % 400) / 400;
    return { x: r(3) * 1080, y: tt * 2000 - 80, rot: tt * 720 + i * 40, c: ["#FFD84A", "#E2483D", "#2FB36B", "#FFFFFF"][i % 4] };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg,#24305e 0%,#3a2a66 55%,#1a2040 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(255,216,74,0.18), rgba(0,0,0,0.4) 72%)" }} />
      {conf.map((c, i) => <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 16, height: 26, borderRadius: 4, background: c.c, opacity: 0.7, transform: `rotate(${c.rot}deg)` }} />)}
      <div style={{ position: "absolute", left: 60, width: 870, top: 280, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK, transform: `scale(${0.85 + 0.15 * inK})` }}>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 120, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "5px #120C06", paintOrder: "stroke fill" }}>3-КҮНДІ</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>ҚАЛАЙ ӨТКІЗЕМІЗ?</div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 560, display: "flex", justifyContent: "center", opacity: inK }}><Bubble /></div>
      {IDEAS.map((t, i) => {
        const k = back((lf - 18 - i * 12) / 9);
        return (
          <div key={t} style={{ position: "absolute", left: i % 2 ? 230 : 110, top: 830 + i * 100, opacity: cl(k * 2), transform: `scale(${0.4 + 0.6 * k}) rotate(${i % 2 ? 2 : -2}deg)`,
            background: "#FFFFFF", borderRadius: 40, padding: "14px 34px", fontFamily: MONT, fontWeight: 800, fontSize: 40, color: "#120C06", boxShadow: "0 8px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
            {t} <span style={{ color: "#E2483D" }}>♥ {[312, 287, 254][i]}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 60, width: 870, top: 1140, height: 110, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 54, color: "#120C06", background: "#FFD84A", borderRadius: 60, padding: "14px 64px", boxShadow: "0 10px 0 #B88A10", transform: `scale(${(0.5 + 0.5 * eo(btn)) * pulse})`, opacity: btn }}>ПІКІРГЕ ЖАЗ ↓</div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1262, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 31, color: "#FFFFFF", opacity: foot }}>ЕҢ КӨП ЛАЙК ЖИНАҒАН ИДЕЯ — 3-КҮННІҢ БАСЫ →</div>
    </AbsoluteFill>
  );
};
