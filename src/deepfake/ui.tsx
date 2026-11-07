import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { C, CHIP_Y, INTER, MONO, MONT } from "./theme";
import { AUDIO, ce, cs, rmsAt } from "./timeline";

// ---------- анимационные помощники ----------
export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.9, 0.4);
/** 0→1 за d кадров начиная с кадра a */
export const p = (f: number, a: number, d: number, easing = EASE) =>
  interpolate(f, [a, a + Math.max(1, d)], [0, 1], { ...CL, easing });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** видимость окна [a, b) с плавным входом/выходом */
export const win = (f: number, a: number, b: number, fi = 6, fo = 6) => Math.min(p(f, a, fi), 1 - p(f, b - fo, fo));
/** «мигающее» включение, как у интерфейса */
export const flick = (f: number, a: number) => {
  const k = f - a;
  if (k < 0) return 0;
  const seq = [1, 0.2, 0.9, 0.35, 1, 0.7, 1];
  return k < seq.length ? seq[k] : 1;
};
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
export const mixHex = (a: string, b: string, t: number) => {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((x >> s) & 255, (y >> s) & 255, t));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
};

// ---------- фон: звёздная пыль, город-точки, виньетка, зерно ----------
const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: random(`sx${i}`) * 1080,
  y: random(`sy${i}`) * 1250,
  r: 0.8 + random(`sr${i}`) * 1.6,
  ph: random(`sp${i}`) * 6.28,
}));

type Bld = { x: number; w: number; h: number; cols: number; rows: number; lit: boolean[] };
const BUILDINGS: Bld[] = (() => {
  const out: Bld[] = [];
  let x = -40;
  let i = 0;
  while (x < 1560) {
    const w = 70 + random(`bw${i}`) * 120;
    const h = 160 + random(`bh${i}`) * 430;
    const cols = Math.max(2, Math.floor((w - 16) / 22));
    const rows = Math.floor((h - 20) / 26);
    const lit = Array.from({ length: cols * rows }, (_, k) => random(`bl${i}-${k}`) < 0.2);
    out.push({ x, w, h, cols, rows, lit });
    x += w + 8 + random(`bg${i}`) * 26;
    i++;
  }
  return out;
})();

export const Background: React.FC<{ f: number; tint: string; tintAmt: number; city?: number; dark?: number }> = ({
  f,
  tint,
  tintAmt,
  city = 1,
  dark = 0,
}) => {
  const drift = -(f * 0.14) % 400;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 32%, ${C.bg2} 0%, ${C.bg} 62%, #04060B 100%)`,
        }}
      />
      {/* цветной «туман» настроения */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 55% at 50% 100%, ${rgba(tint, 0.42 * tintAmt)} 0%, ${rgba(tint, 0.1 * tintAmt)} 45%, transparent 75%)`,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${rgba(tint, 0.14 * tintAmt)} 0%, transparent 70%)` }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#C9D6FF"
            opacity={(0.1 + 0.3 * (0.5 + 0.5 * Math.sin(f * 0.05 + s.ph))) * (1 - dark)}
          />
        ))}
      </svg>
      {city > 0 && (
        <svg
          width={1080}
          height={680}
          viewBox="0 0 1080 680"
          style={{ position: "absolute", left: 0, top: 1240, opacity: city * (1 - dark) }}
        >
          <defs>
            <linearGradient id="cityfade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.4" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <mask id="citymask">
              <rect x={0} y={0} width={1080} height={680} fill="url(#cityfade)" />
            </mask>
          </defs>
          <g mask="url(#citymask)">
          <g transform={`translate(${drift},0)`}>
            {BUILDINGS.map((b, i) => {
              const top = 680 - b.h;
              return (
                <g key={i}>
                  <rect x={b.x} y={top} width={b.w} height={b.h} fill="#0A0F1C" />
                  {b.lit.map((on, k) => {
                    const c = k % b.cols;
                    const r = Math.floor(k / b.cols);
                    const blink = random(`bk${i}-${k}-${Math.floor(f / 40)}`) < 0.025;
                    if (!(on !== blink)) return null;
                    return (
                      <rect
                        key={k}
                        x={b.x + 10 + c * 22}
                        y={top + 14 + r * 26}
                        width={8}
                        height={10}
                        fill={mixHex("#E2A43C", tint, 0.25 * tintAmt)}
                        opacity={0.35 + 0.45 * random(`bo${i}-${k}`)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
          </g>
        </svg>
      )}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.7) 100%)" }}
      />
      {dark > 0 && <AbsoluteFill style={{ background: "#000", opacity: dark }} />}
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ f: number; amount?: number }> = ({ f, amount = 0.07 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={f % 24} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain)" opacity={amount} />
  </svg>
);

// ---------- тайм-код вверху ----------
const SCRAMBLE = "0123456789?#%";
export const TimeChip: React.FC<{ f: number; text: string; changedAt: number; opacity: number; color?: string }> = ({
  f,
  text,
  changedAt,
  opacity,
  color = C.amber,
}) => {
  const k = f - changedAt;
  const glitching = k >= 0 && k < 9;
  const shown = glitching
    ? text
        .split("")
        .map((ch, i) => (/[0-9?]/.test(ch) && random(`tc${f}${i}`) < 0.6 ? SCRAMBLE[Math.floor(random(`tcs${f}${i}`) * SCRAMBLE.length)] : ch))
        .join("")
    : text;
  return (
    <div
      style={{
        position: "absolute",
        top: CHIP_Y,
        left: 540,
        transform: `translateX(-50%) translateX(${glitching ? (random(`tj${f}`) - 0.5) * 10 : 0}px)`,
        opacity,
        padding: "8px 24px",
        border: `1.5px solid ${rgba(color, 0.45)}`,
        background: "rgba(8,10,18,0.86)",
        borderRadius: 6,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 31,
        letterSpacing: "0.07em",
        color,
        whiteSpace: "pre",
        textShadow: glitching ? `3px 0 ${rgba(C.red, 0.8)}, -3px 0 ${rgba(C.cyan, 0.8)}` : `0 0 14px ${rgba(color, 0.5)}`,
      }}
    >
      {shown}
    </div>
  );
};

// ---------- значки ----------
export const Glyph: React.FC<{ kind: string; color: string; size?: number }> = ({ kind, color, size = 22 }) => {
  const s = size;
  if (kind === "ok")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "x")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M5 5l14 14M19 5L5 19" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      </svg>
    );
  if (kind === "lock")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <rect x={4.5} y={10.5} width={15} height={11} rx={2.5} fill="none" stroke={color} strokeWidth={2.6} />
        <path d="M8 10.5V7.5a4 4 0 018 0v3" fill="none" stroke={color} strokeWidth={2.6} />
      </svg>
    );
  if (kind === "phone")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M6.6 3.5l3 3.2-1.8 2.4a12 12 0 006.1 6.1l2.4-1.8 3.2 3-1.6 3.1c-7.3-.4-13.4-6.5-13.8-13.8z"
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: s, color, lineHeight: 1 }}>{kind}</span>
  );
};

// ---------- HUD-ярлык ----------
export const HudTag: React.FC<{
  f: number;
  at: number;
  out?: number;
  x: number;
  y: number;
  color: string;
  title: string;
  sub?: string;
  icon?: string;
  align?: "left" | "center" | "right";
  scale?: number;
  titleSize?: number;
}> = ({ f, at, out, x, y, color, title, sub, icon = "!", align = "left", scale = 1, titleSize = 32 }) => {
  if (f < at) return null;
  const o = flick(f, at) * (out !== undefined ? 1 - p(f, out, 6) : 1);
  if (o <= 0) return null;
  const wipe = p(f, at, 9);
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateX(${tx}) scale(${scale * lerp(0.94, 1, wipe)})`,
        transformOrigin: align === "right" ? "right center" : align === "center" ? "center" : "left center",
        opacity: o,
        clipPath: `inset(-30px ${(1 - wipe) * 100}% -30px -30px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "11px 22px 11px 13px",
          border: `2px solid ${color}`,
          borderRadius: 12,
          background: `linear-gradient(180deg, ${rgba(color, 0.17)}, ${rgba(color, 0.05)}), linear-gradient(rgba(7,10,18,0.9), rgba(7,10,18,0.9))`,
          boxShadow: `0 0 24px ${rgba(color, 0.45)}, inset 0 0 14px ${rgba(color, 0.16)}`,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            border: `2px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Glyph kind={icon} color={color} size={icon.length === 1 ? 22 : 24} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              fontFamily: MONT,
              fontWeight: 800,
              fontSize: titleSize,
              color: C.white,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 17,
                color,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Пунктирная «нить» от ярлыка к точке */
export const Wire: React.FC<{
  f: number;
  at: number;
  out?: number;
  from: [number, number];
  to: [number, number];
  color: string;
  dot?: boolean;
}> = ({ f, at, out, from, to, color, dot = true }) => {
  if (f < at) return null;
  const k = p(f, at, 10);
  const o = out !== undefined ? 1 - p(f, out, 6) : 1;
  const x = lerp(from[0], to[0], k);
  const y = lerp(from[1], to[1], k);
  const pulse = (f - at) % 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={2.4} strokeDasharray="7 7" opacity={0.85} />
      {dot && k > 0.98 && (
        <>
          <circle cx={to[0]} cy={to[1]} r={7} fill={color} />
          <circle cx={to[0]} cy={to[1]} r={7 + pulse * 0.8} fill="none" stroke={color} strokeWidth={2} opacity={1 - pulse / 30} />
        </>
      )}
    </svg>
  );
};

// ---------- телефон ----------
export const Phone: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  glow: string;
  glowAmt?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  opacity?: number;
  clock?: string;
  battery?: number;
  children?: React.ReactNode;
}> = ({ x = 540, y, w = 600, h = 960, glow, glowAmt = 1, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, clock = "21:30", battery = 0.62, children }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y,
      width: w,
      height: h,
      opacity,
      transform: `perspective(1900px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 80,
        background: "linear-gradient(160deg,#1B2232 0%,#0B0F18 60%,#141A28 100%)",
        border: "2px solid rgba(255,255,255,0.10)",
        boxShadow: `0 0 0 3px ${rgba(glow, 0.6 * glowAmt)}, 0 0 50px ${rgba(glow, 0.5 * glowAmt)}, 0 0 150px ${rgba(glow, 0.28 * glowAmt)}, 0 50px 90px rgba(0,0,0,0.65)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 14,
        borderRadius: 66,
        overflow: "hidden",
        background: "linear-gradient(180deg,#0D1320 0%,#090C15 100%)",
        boxShadow: `inset 0 0 60px ${rgba(glow, 0.12 * glowAmt)}`,
      }}
    >
      {/* статус-бар */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70 }}>
        <div style={{ position: "absolute", left: 46, top: 22, fontFamily: INTER, fontWeight: 600, fontSize: 25, color: "rgba(255,255,255,0.88)" }}>
          {clock}
        </div>
        <div style={{ position: "absolute", left: "50%", top: 16, width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: "#000" }} />
        <div style={{ position: "absolute", right: 44, top: 26, display: "flex", alignItems: "flex-end", gap: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 5, height: 7 + i * 4, borderRadius: 1.5, background: i < 3 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }} />
          ))}
          <div style={{ marginLeft: 8, width: 38, height: 19, borderRadius: 5, border: "2px solid rgba(255,255,255,0.55)", padding: 2, boxSizing: "border-box" }}>
            <div style={{ width: `${battery * 100}%`, height: "100%", borderRadius: 2, background: battery < 0.2 ? C.red : "rgba(255,255,255,0.85)" }} />
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

export const ChatHeader: React.FC<{ avatar: string; name: string; sub: string; ring: string; subColor?: string; glitch?: number; f?: number }> = ({
  avatar,
  name,
  sub,
  ring,
  subColor,
  glitch = 0,
  f = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 70,
      height: 112,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "0 30px",
      borderBottom: "1.5px solid rgba(255,255,255,0.07)",
    }}
  >
    <div style={{ fontFamily: INTER, fontSize: 40, color: C.blue, fontWeight: 400, marginRight: 2 }}>‹</div>
    <div
      style={{
        width: 74,
        height: 74,
        borderRadius: 37,
        border: `2.5px solid ${ring}`,
        background: rgba(ring, 0.18),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONT,
        fontWeight: 900,
        fontSize: 34,
        color: C.white,
        boxShadow: `0 0 18px ${rgba(ring, 0.4)}`,
        transform: glitch ? `translateX(${(random(`ag${f}`) - 0.5) * 14 * glitch}px)` : undefined,
        textShadow: glitch ? `4px 0 ${rgba(C.red, 0.9)}, -4px 0 ${rgba(C.cyan, 0.9)}` : undefined,
      }}
    >
      {avatar}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 31, color: C.white }}>{name}</div>
      <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 21, color: subColor ?? "rgba(255,255,255,0.45)" }}>{sub}</div>
    </div>
  </div>
);

/** Статичная «форма» голосового сообщения из громкости реплики */
const barsOf = (cue: string, n: number) => {
  const r = AUDIO[cue].rms;
  const max = Math.max(...r, 0.0001);
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor((i / n) * r.length);
    const b = Math.max(a + 1, Math.floor(((i + 1) / n) * r.length));
    let m = 0;
    for (let k = a; k < b; k++) m = Math.max(m, r[k] ?? 0);
    return 0.14 + 0.86 * (m / max);
  });
};

export const VoiceBubble: React.FC<{
  f: number;
  cue: string;
  fake?: boolean;
  warm?: boolean;
  width?: number;
  label?: string;
}> = ({ f, cue, fake = false, warm = false, width = 470, label }) => {
  const N = 30;
  const bars = barsOf(cue, N);
  const a = cs(cue);
  const b = ce(cue);
  const prog = interpolate(f, [a, b], [0, 1], CL);
  const playing = f >= a && f < b;
  const tone = fake ? C.red : warm ? C.warm : C.white;
  const secs = Math.round(AUDIO[cue].duration);
  return (
    <div
      style={{
        width,
        padding: "18px 22px",
        borderRadius: 30,
        borderTopLeftRadius: 10,
        background: fake ? "rgba(255,59,71,0.13)" : warm ? "rgba(255,180,107,0.14)" : "rgba(255,255,255,0.08)",
        border: `1.5px solid ${fake ? rgba(C.red, 0.45) : warm ? rgba(C.warm, 0.45) : "rgba(255,255,255,0.10)"}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          background: tone,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: playing ? `0 0 20px ${rgba(tone, 0.6)}` : undefined,
        }}
      >
        {playing ? (
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 7, height: 22, borderRadius: 2, background: "#0B0F18" }} />
            <div style={{ width: 7, height: 22, borderRadius: 2, background: "#0B0F18" }} />
          </div>
        ) : (
          <div style={{ width: 0, height: 0, marginLeft: 5, borderLeft: "19px solid #0B0F18", borderTop: "12px solid transparent", borderBottom: "12px solid transparent" }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 58 }}>
          {bars.map((v, i) => {
            const played = i / N < prog;
            const jit = fake && playing ? 0.65 + 0.7 * random(`vb${cue}${f}${i}`) : 1;
            const hh = Math.min(1, v * jit) * 54;
            return (
              <div
                key={i}
                style={{
                  width: 5,
                  height: Math.max(5, hh),
                  borderRadius: 3,
                  background: played ? tone : "rgba(255,255,255,0.32)",
                  boxShadow: fake && played ? `2px 0 0 ${rgba(C.cyan, 0.55)}, -2px 0 0 ${rgba("#FF00AA", 0.5)}` : undefined,
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
          {label ?? `0:0${Math.min(9, secs)}`}
        </div>
      </div>
    </div>
  );
};

export const TextBubble: React.FC<{ text: string; out?: boolean; time?: string; color?: string; size?: number }> = ({
  text,
  out = false,
  time,
  color,
  size = 31,
}) => (
  <div
    style={{
      maxWidth: 470,
      padding: "18px 24px 14px",
      borderRadius: 30,
      borderTopRightRadius: out ? 10 : 30,
      borderTopLeftRadius: out ? 30 : 10,
      background: color ?? (out ? C.blue : "rgba(255,255,255,0.09)"),
      fontFamily: INTER,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.25,
      color: C.white,
      boxSizing: "border-box",
    }}
  >
    {text}
    {time && (
      <div style={{ fontFamily: MONO, fontSize: 16, color: "rgba(255,255,255,0.55)", textAlign: "right", marginTop: 4 }}>{time}</div>
    )}
  </div>
);

export const TypingDots: React.FC<{ f: number; color?: string }> = ({ f, color = "rgba(255,255,255,0.75)" }) => (
  <div style={{ display: "inline-flex", gap: 9, padding: "22px 26px", borderRadius: 30, borderTopLeftRadius: 10, background: "rgba(255,255,255,0.09)" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 13,
          height: 13,
          borderRadius: 7,
          background: color,
          transform: `translateY(${Math.sin(f * 0.32 - i * 0.9) * 5}px)`,
          opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f * 0.32 - i * 0.9)),
        }}
      />
    ))}
  </div>
);

/** Большая «живая» волна голоса (история громкости, симметрично) */
export const LiveWave: React.FC<{
  f: number;
  cue: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
  color: string;
  bars?: number;
  jag?: boolean;
  opacity?: number;
  idle?: number;
}> = ({ f, cue, cx, cy, width, height, color, bars = 46, jag = false, opacity = 1, idle = 0.04 }) => {
  const step = width / bars;
  const vals = Array.from({ length: bars }, (_, i) => {
    const d = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2);
    const lag = Math.round(d * 10);
    let v = rmsAt(cue, f - lag);
    v = Math.max(idle * (0.6 + 0.4 * Math.sin(f * 0.2 + i)), v * (1 - d * 0.55));
    if (jag) v *= 0.55 + 0.9 * random(`lw${cue}${f}${i}`);
    return Math.min(1, v);
  });
  const layer = (dx: number, col: string, op: number) => (
    <g transform={`translate(${dx},0)`} opacity={op}>
      {vals.map((v, i) => {
        const hh = Math.max(6, v * height);
        return <rect key={i} x={cx - width / 2 + i * step + step * 0.2} y={cy - hh / 2} width={step * 0.6} height={hh} rx={step * 0.3} fill={col} />;
      })}
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {jag && layer(-5, C.cyan, 0.45)}
      {jag && layer(5, "#FF00AA", 0.45)}
      {layer(0, color, 1)}
    </svg>
  );
};

// ---------- печать «штамп» ----------
export const Stamp: React.FC<{ f: number; at: number; text: string; color: string; x: number; y: number; rot?: number; size?: number }> = ({
  f,
  at,
  text,
  color,
  x,
  y,
  rot = -9,
  size = 92,
}) => {
  if (f < at) return null;
  const k = p(f, at, 6, EASE_IN);
  const shake = f - at < 10 ? (random(`st${f}`) - 0.5) * 12 * (1 - (f - at) / 10) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) translate(${shake}px,${shake * 0.6}px) rotate(${rot}deg) scale(${lerp(2.3, 1, k)})`,
        opacity: k,
        padding: "10px 34px",
        border: `7px solid ${color}`,
        borderRadius: 14,
        fontFamily: MONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "0.04em",
        color,
        background: "rgba(10,4,6,0.55)",
        boxShadow: `0 0 40px ${rgba(color, 0.5)}, inset 0 0 26px ${rgba(color, 0.25)}`,
        textShadow: `0 0 22px ${rgba(color, 0.6)}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ---------- глитч-обёртка (RGB-расслоение на склейках) ----------
export const Glitch: React.FC<{ f: number; amount: number; id: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  f,
  amount,
  id,
  children,
  style,
}) => {
  if (amount < 0.02) return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
  const d = 16 * amount * (random(`gd${f}`) > 0.5 ? 1 : -1);
  const jx = (random(`gx${f}`) - 0.5) * 36 * amount;
  const bands = [0, 1, 2].map((i) => ({ y: random(`gb${f}${i}`) * 1920, h: 6 + random(`gh${f}${i}`) * 50, o: random(`go${f}${i}`) }));
  return (
    <AbsoluteFill style={style}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={d} dy={0} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-d} dy={0} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id}) brightness(${1 + 0.5 * amount})`, transform: `translateX(${jx}px)` }}>{children}</AbsoluteFill>
      {bands.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: b.y,
            height: b.h,
            background: i % 2 ? rgba(C.cyan, 0.16 * amount) : rgba(C.red, 0.16 * amount),
            transform: `translateX(${(b.o - 0.5) * 80 * amount}px)`,
            mixBlendMode: "screen",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Фигурка человека (иконка) */
export const Person: React.FC<{ x: number; y: number; s?: number; color: string; opacity?: number }> = ({ x, y, s = 1, color, opacity = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <circle cx={0} cy={-22} r={13} fill={color} />
    <path d="M-24 22 C-24 0 -14 -6 0 -6 C14 -6 24 0 24 22 Z" fill={color} />
  </g>
);

/** Замок (большой) */
export const BigLock: React.FC<{ cx: number; cy: number; draw: number; fill: number; color?: string; scale?: number }> = ({
  cx,
  cy,
  draw,
  fill,
  color = C.amber,
  scale = 1,
}) => {
  const len = 1400;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <g transform={`translate(${cx},${cy}) scale(${scale})`}>
        <circle r={250} fill={rgba(color, 0.08 * fill)} />
        <path
          d="M-95 -40 V-120 A95 95 0 0 1 95 -120 V-40"
          fill="none"
          stroke={color}
          strokeWidth={26}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
        <rect
          x={-150}
          y={-50}
          width={300}
          height={230}
          rx={36}
          fill={rgba(color, 0.18 * fill)}
          stroke={color}
          strokeWidth={14}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
          style={{ filter: `drop-shadow(0 0 ${30 * fill}px ${rgba(color, 0.7)})` }}
        />
        <circle cy={45} r={24} fill={color} opacity={fill} />
        <rect x={-9} y={50} width={18} height={60} rx={8} fill={color} opacity={fill} />
      </g>
    </svg>
  );
};
