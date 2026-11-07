import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { C, H, W } from "./theme";
import { FPS } from "./timeline";

// Один лист бумаги (2D-слой в 3D-пространстве CSS)
export const Sheet: React.FC<{ w: number; style?: React.CSSProperties; seed: number; lines?: boolean }> = ({ w, style, seed, lines = true }) => {
  const h = w * 1.38;
  const shade = 0.06 + random(`${seed}-sh`) * 0.08;
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        borderRadius: 3,
        background: `linear-gradient(${120 + random(`${seed}-a`) * 90}deg, rgba(255,255,255,0.0), rgba(120,90,50,${shade})), ${
          lines
            ? `repeating-linear-gradient(180deg, transparent 0, transparent ${w * 0.075}px, ${C.line} ${w * 0.075}px, ${C.line} ${w * 0.075 + 1.5}px), `
            : ""
        }${C.paper}`,
        backgroundOrigin: "content-box",
        padding: `${w * 0.14}px ${w * 0.1}px`,
        boxSizing: "border-box",
        boxShadow: "0 10px 26px rgba(30,18,6,0.35), inset 0 0 0 1px rgba(0,0,0,0.05)",
        backfaceVisibility: "visible",
        ...style,
      }}
    />
  );
};

type Particle = {
  seed: number;
  t0: number; // секунда появления
  p: [number, number, number]; // старт, px (z — к камере положительный)
  v: [number, number, number]; // скорость, px/с
  g: number; // «гравитация» по y, px/с²
  k: number; // сопротивление воздуха
  sway: number; // амплитуда покачивания, px
  rot: [number, number, number]; // скорость вращения, град/с
  w: number;
  life: number;
};

const posAt = (pa: Particle, tau: number) => {
  const e = (1 - Math.exp(-pa.k * tau)) / pa.k;
  const x = pa.p[0] + pa.v[0] * e + pa.sway * Math.sin(tau * 2.6 + pa.seed);
  const y = pa.p[1] + (pa.v[1] - pa.g / pa.k) * e + (pa.g / pa.k) * tau;
  const z = pa.p[2] + pa.v[2] * e;
  return [x, y, z] as const;
};

const Swarm: React.FC<{ f: number; parts: Particle[]; blur?: number }> = ({ f, parts, blur = 0 }) => {
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: "50% 50%", overflow: "hidden", pointerEvents: "none" }}>
      {parts.map((pa, i) => {
        const tau = t - pa.t0;
        if (tau < 0 || tau > pa.life) return null;
        const [x, y, z] = posAt(pa, tau);
        if (z > 1300) return null;
        const op = Math.min(1, tau / 0.08) * interpolate(tau, [pa.life - 0.3, pa.life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const near = Math.max(0, z - 300) / 1000;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformStyle: "preserve-3d",
              transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${pa.rot[0] * tau + pa.seed * 40}deg) rotateY(${pa.rot[1] * tau}deg) rotateZ(${pa.rot[2] * tau + pa.seed * 25}deg)`,
              opacity: op,
              filter: blur + near * 6 > 0.3 ? `blur(${(blur + near * 6).toFixed(1)}px)` : undefined,
            }}
          >
            <Sheet w={pa.w} seed={pa.seed} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const R = (seed: string, a: number, b: number) => a + random(seed) * (b - a);

// Листы летят из полосы-кадра прямо в зрителя (крючок)
export const PapersToCamera: React.FC<{ f: number; t0: number; n?: number; cx?: number; cy?: number }> = ({ f, t0, n = 14, cx = W / 2, cy = H / 2 }) => {
  const parts: Particle[] = React.useMemo(
    () =>
      new Array(n).fill(0).map((_, i) => ({
        seed: i + 1,
        t0: t0 + i * 0.11 + R(`tc-t${i}`, 0, 0.06),
        p: [cx + R(`tc-x${i}`, -160, 160), cy + R(`tc-y${i}`, -20, 80), -500],
        v: [R(`tc-vx${i}`, -1100, 1100), R(`tc-vy${i}`, -150, 450), R(`tc-vz${i}`, 1100, 1700)],
        g: 260,
        k: 0.9,
        sway: R(`tc-s${i}`, 10, 40),
        rot: [R(`tc-r0${i}`, -260, 260), R(`tc-r1${i}`, -200, 200), R(`tc-r2${i}`, -160, 160)],
        w: R(`tc-w${i}`, 150, 230),
        life: 2.4,
      })),
    [n, t0, cx, cy],
  );
  return <Swarm f={f} parts={parts} />;
};

// Взрыв листов из точки (столкновение, «шашылады»)
export const PaperBurst: React.FC<{ f: number; t0: number; x: number; y: number; n?: number; power?: number; seed?: string; life?: number }> = ({
  f,
  t0,
  x,
  y,
  n = 16,
  power = 1,
  seed = "b",
  life = 3.2,
}) => {
  const parts: Particle[] = React.useMemo(
    () =>
      new Array(n).fill(0).map((_, i) => {
        const a = R(`${seed}-a${i}`, -Math.PI * 0.95, -Math.PI * 0.05); // вверх и в стороны
        const sp = R(`${seed}-sp${i}`, 500, 1300) * power;
        return {
          seed: i + 7,
          t0: t0 + R(`${seed}-t${i}`, 0, 0.08),
          p: [x + R(`${seed}-x${i}`, -60, 60), y + R(`${seed}-y${i}`, -40, 40), R(`${seed}-z${i}`, -150, 150)],
          v: [Math.cos(a) * sp, Math.sin(a) * sp, R(`${seed}-vz${i}`, -300, 600) * power],
          g: 900,
          k: 2.2,
          sway: R(`${seed}-s${i}`, 20, 70),
          rot: [R(`${seed}-r0${i}`, -320, 320), R(`${seed}-r1${i}`, -240, 240), R(`${seed}-r2${i}`, -200, 200)],
          w: R(`${seed}-w${i}`, 110, 190),
          life,
        };
      }),
    [n, t0, x, y, power, seed, life],
  );
  return <Swarm f={f} parts={parts} />;
};

// Медленно падающие листы (после столкновения)
export const PaperFall: React.FC<{ f: number; t0: number; n?: number; seed?: string }> = ({ f, t0, n = 7, seed = "fall" }) => {
  const parts: Particle[] = React.useMemo(
    () =>
      new Array(n).fill(0).map((_, i) => ({
        seed: i + 31,
        t0: t0 + R(`${seed}-t${i}`, -0.4, 0.6),
        p: [R(`${seed}-x${i}`, 80, W - 80), R(`${seed}-y${i}`, -260, 500), R(`${seed}-z${i}`, -200, 350)],
        v: [R(`${seed}-vx${i}`, -60, 60), 0, 0],
        g: 160,
        k: 1.4,
        sway: R(`${seed}-s${i}`, 40, 110),
        rot: [R(`${seed}-r0${i}`, -90, 90), R(`${seed}-r1${i}`, -70, 70), R(`${seed}-r2${i}`, -60, 60)],
        w: R(`${seed}-w${i}`, 120, 200),
        life: 4,
      })),
    [n, t0, seed],
  );
  return <Swarm f={f} parts={parts} />;
};

// Огромный лист пролетает через кадр и прячет склейку
export const PaperWipe: React.FC<{ f: number; cut: number; dur?: number }> = ({ f, cut, dur = 14 }) => {
  const p = (f - (cut - dur / 2)) / dur;
  if (p < 0 || p > 1) return null;
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const x = interpolate(e, [0, 1], [W * 1.7, -W * 0.7]);
  const y = interpolate(e, [0, 1], [H * 0.62, H * 0.38]);
  return (
    <AbsoluteFill style={{ perspective: 1600, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate3d(${x}px, ${y}px, 0) rotateZ(${interpolate(e, [0, 1], [-16, 8])}deg) rotateY(${interpolate(e, [0, 1], [24, -18])}deg)` }}>
        <Sheet w={1900} seed={99} />
      </div>
    </AbsoluteFill>
  );
};

// Пылинки в солнечных лучах
export const Dust: React.FC<{ f: number; n?: number; opacity?: number }> = ({ f, n = 38, opacity = 1 }) => {
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "screen" }}>
      {new Array(n).fill(0).map((_, i) => {
        const x0 = R(`d-x${i}`, 0, W);
        const y0 = R(`d-y${i}`, 0, H);
        const sp = R(`d-s${i}`, 6, 22);
        const x = (x0 + Math.sin(t * 0.4 + i) * 30 + t * sp * 0.6) % W;
        const y = (y0 - t * sp + H * 4) % H;
        const r = R(`d-r${i}`, 1.5, 4.5);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * R(`d-w${i}`, 0.6, 1.6) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: "rgba(255,226,170,0.9)",
              boxShadow: `0 0 ${r * 3}px rgba(255,210,140,0.8)`,
              opacity: tw * 0.55,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Короткая вспышка (удар, «взрыв» листов)
export const Flash: React.FC<{ f: number; at: number; amount?: number }> = ({ f, at, amount = 0.45 }) => {
  const d = f - at;
  if (d < -1 || d > 8) return null;
  const o = d < 0 ? amount * 0.5 : amount * Math.exp(-d / 2.5);
  return <AbsoluteFill style={{ background: "#FFF4DE", opacity: o, pointerEvents: "none" }} />;
};
