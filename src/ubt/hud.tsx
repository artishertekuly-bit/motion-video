import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { MONT, OSW } from "../qagaz/theme";
import { FPS, sec, shotStart, ws } from "./timeline";
import { AlarmIcon, PhoneIcon } from "./props";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const back = (t: number) => {
  const c = 1.9;
  const x = cl(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

// Табло как в игре: ҰБТ-ға 30 · БАЛЛ 47/140 · ТЕЛЕФОН 9 сағ
const BOX_Y = 316;
const BOX_H = 124;
const BOX_W = 276;
const BOX_X = [60, 357, 654];
export const BOX1 = { x: BOX_X[0] + BOX_W / 2, y: BOX_Y + 78 };
const FLY_AT = 2.3; // «30» улетает в табло
const FLY_DUR = 0.5;
const SHOW = sec(FLY_AT + 0.25);
const HIDE = shotStart("sh14");
const PULSES: { box: number; at: number }[] = [
  { box: 2, at: ws("n3", 1) },
  { box: 1, at: ws("n3", 10) },
  { box: 0, at: ws("n5", 0) },
  { box: 0, at: ws("n12", 0) },
];

const Box: React.FC<{ i: number; f: number; label: string; value: string; color: string }> = ({ i, f, label, value, color }) => {
  const k = back((f - SHOW - i * 4) / 9);
  const pulse = PULSES.filter((p) => p.box === i).reduce((a, p) => Math.max(a, Math.max(0, 1 - Math.abs(f - p.at - 3) / 8)), 0);
  return (
    <div
      style={{
        position: "absolute",
        left: BOX_X[i],
        top: BOX_Y,
        width: BOX_W,
        height: BOX_H,
        borderRadius: 26,
        background: "rgba(10,14,32,0.84)",
        border: `4px solid ${pulse > 0.05 ? color : "rgba(255,255,255,0.85)"}`,
        boxShadow: `0 8px 0 rgba(0,0,0,0.35), 0 0 ${40 * pulse}px ${color}`,
        transform: `scale(${(0.2 + 0.8 * k) * (1 + 0.12 * pulse)})`,
        opacity: cl(k * 2),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 25, letterSpacing: 2, color: "#A9BCE6" }}>{label}</div>
      <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 60, lineHeight: 1, color, marginTop: 4, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
};

export const Hud: React.FC<{ f: number }> = ({ f }) => {
  if (f < SHOW - 2 || f >= HIDE) return null;
  const rib = eo((f - SHOW) / 8);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60, width: 870, top: 252, height: 50, display: "flex", justifyContent: "center", opacity: rib, transform: `translateY(${(1 - rib) * -30}px)` }}>
        <div
          style={{
            background: "#FFD84A",
            color: "#120C06",
            borderRadius: 25,
            padding: "0 28px",
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 30,
            lineHeight: "50px",
            letterSpacing: 1,
            boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          1-КҮН · ҰБТ-ҒА 30 КҮН ҚАЛДЫ
        </div>
      </div>
      <Box i={0} f={f} label="ҰБТ-ҒА" value="30 КҮН" color="#FFD84A" />
      <Box i={1} f={f} label="БАЛЛ" value="47/140" color="#FF5A4E" />
      <Box i={2} f={f} label="ТЕЛЕФОН" value="9 САҒ" color="#FF9F3A" />
    </AbsoluteFill>
  );
};

// Крючок: огромное «30» падает штампом, потом улетает в табло
export const Big30: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  if (t > FLY_AT + FLY_DUR + 0.05) return null;
  const slam = cl((f - 1) / 6);
  const sc = 1 + 2.2 * Math.pow(1 - slam, 2);
  const fly = eo((t - FLY_AT) / FLY_DUR);
  const cx = interpolate(fly, [0, 1], [540, BOX1.x]);
  const cy = interpolate(fly, [0, 1], [700, BOX1.y]);
  const s = interpolate(fly, [0, 1], [1, 0.2]);
  const shake = f > 6 && f < 16 ? Math.sin(f * 3.1) * (16 - f) * 1.6 : 0;
  const sub = eo((f - ws("n1", 2) + 2) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: cx - 400 + shake,
          top: cy - 260,
          width: 800,
          height: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${sc * s})`,
          opacity: slam > 0 ? 1 - fly * 0.2 : 0,
        }}
      >
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 380, lineHeight: 0.9, color: "#FFD84A", WebkitTextStroke: "10px #120C06", paintOrder: "stroke fill", textShadow: "0 16px 0 rgba(0,0,0,0.5)" }}>30</div>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 86, lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill", marginTop: -6, opacity: 1 - fly }}>КҮН</div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 48,
            color: "#120C06",
            background: "#FFFFFF",
            borderRadius: 16,
            padding: "4px 22px",
            marginTop: 18,
            opacity: sub * (1 - fly),
            transform: `scale(${0.6 + 0.4 * sub})`,
          }}
        >
          ҰБТ-ҒА ДЕЙІН
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Финальная карточка: два варианта, «БІР СӨЗ ЖАЗ», «ДАУЫС БЕР»
export const VoteCard: React.FC<{ f: number }> = ({ f }) => {
  const st = shotStart("sh14");
  if (f < st) return null;
  const lf = f - st;
  const inK = eo(lf / 10);
  const hlA = cl((f - ws("n13", 4) + 3) / 6) * (1 - cl((f - ws("n13", 8)) / 6));
  const hlB = cl((f - ws("n13", 9) + 3) / 6) * (1 - cl((f - ws("n13", 13)) / 6));
  const btn = cl((f - ws("n13", 13) + 3) / 6);
  const pulse = btn > 0 ? 1 + 0.06 * Math.sin((f - ws("n13", 13)) * 0.35) : 1;
  const day2 = cl((f - ws("n13", 17) + 3) / 8);
  const side = (hl: number, left: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 450,
    height: 620,
    width: 430,
    left: left ? 60 : 510,
    borderRadius: 40,
    background: left ? "linear-gradient(180deg,#F05A4A,#B8322A)" : "linear-gradient(180deg,#3CCB7E,#1E8A4E)",
    border: `6px solid ${hl > 0.1 ? "#FFFFFF" : "rgba(255,255,255,0.35)"}`,
    boxShadow: `0 14px 0 rgba(0,0,0,0.35), 0 0 ${60 * hl}px rgba(255,255,255,0.8)`,
    transform: `translateX(${(1 - inK) * (left ? -500 : 500)}px) scale(${1 + 0.06 * hl})`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
    overflow: "hidden",
  });
  const big: React.CSSProperties = { fontFamily: OSW, fontWeight: 700, fontSize: 84, lineHeight: 1, color: "#FFFFFF", textShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" };
  const small: React.CSSProperties = { fontFamily: MONT, fontWeight: 800, fontSize: 34, lineHeight: 1.15, color: "#FFFFFF", textAlign: "center", marginTop: 12 };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 60, width: 870, top: 280, height: 130, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#A9BCE6", letterSpacing: 3 }}>ЕРТЕҢ НЕ БОЛАДЫ?</div>
        <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: "#FFD84A", WebkitTextStroke: "4px #120C06", paintOrder: "stroke fill" }}>БІР СӨЗ ЖАЗ</div>
      </div>
      <div style={side(hlA, true)}>
        <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ marginBottom: 10 }}>
          <PhoneIcon x={0} y={-10} s={1.1} />
        </svg>
        <div style={big}>ТЕЛЕФОН</div>
        <div style={small}>анасына
          <br />
          тапсыру
        </div>
      </div>
      <div style={side(hlB, false)}>
        <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ marginBottom: 10 }}>
          <AlarmIcon x={0} y={0} s={1.25} shake={hlB > 0.1 ? Math.sin(f * 1.7) : 0} />
        </svg>
        <div style={big}>ТАҢҒЫ 6:00</div>
        <div style={small}>ерте
          <br />
          тұру
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1100, height: 120, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 800,
            fontSize: 54,
            color: "#120C06",
            background: "#FFD84A",
            borderRadius: 60,
            padding: "14px 64px",
            boxShadow: "0 10px 0 #B88A10",
            transform: `scale(${(0.5 + 0.5 * eo(btn)) * pulse})`,
            opacity: btn,
          }}
        >
          ДАУЫС БЕР ↓
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, width: 870, top: 1240, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 34, color: "#FFFFFF", opacity: day2 }}>
        2-КҮН СЕНІҢ ТАҢДАУЫҢНАН БАСТАЛАДЫ →
      </div>
    </AbsoluteFill>
  );
};
