import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile } from "remotion";
import { C, H, OSW, W } from "./theme";
import { COLLIDE, FPS, Shot, sec, shotStart } from "./timeline";
import { PapersToCamera } from "./papers";

const lerp = (a: [number, number] | undefined, t: number) => (a ? a[0] + (a[1] - a[0]) * t : 0);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

const IMG_ASPECT = 2752 / 1536; // высота/ширина кадров Flow
const COVER_SCALE = Math.max(1, (W * IMG_ASPECT) / H); // картинка при «cover» чуть выше кадра

export const Frame: React.FC<{ img: string; video?: string; style?: React.CSSProperties }> = ({ img, video, style }) =>
  video ? (
    <OffthreadVideo src={staticFile(video)} muted style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
  ) : (
    <Img src={staticFile(`qagaz/img/${img}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
  );

// Один план: картинка (или видео) + движение камеры
export const ShotView: React.FC<{ shot: Shot; f: number }> = ({ shot, f }) => {
  const raw = (f - shot.from) / Math.max(1, shot.to - shot.from);
  const t = Math.max(0, Math.min(1, raw));
  const e = shot.cam.ease === "inout" ? easeInOut(t) : shot.cam.ease === "out" ? easeOut(t) : t;
  let s = lerp(shot.cam.s, e);
  let x = lerp(shot.cam.x, e);
  let y = lerp(shot.cam.y, e);
  if (shot.cam.shake) {
    x += Math.sin(f * 2.7) * 0.35 * shot.cam.shake;
    y += Math.cos(f * 3.1) * 0.25 * shot.cam.shake;
  }
  // удар при столкновении: толчок камеры
  if (shot.id === "sh05") {
    const d = f - sec(COLLIDE);
    if (d >= 0) {
      const k = Math.exp(-d / 5);
      s += 0.07 * k;
      x += Math.sin(d * 2.2) * 1.2 * k;
      y += Math.cos(d * 2.9) * 0.9 * k;
    }
  }
  const lim = ((s * COVER_SCALE - 1) / 2) * 100 - 0.3;
  x = clamp(x, Math.max(0, ((s - 1) / 2) * 100 - 0.3));
  y = clamp(y, Math.max(0, lim));
  const filter = shot.grade === "replay" ? "saturate(0.35) sepia(0.28) contrast(1.06) brightness(0.9)" : undefined;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${x}%, ${y}%) scale(${s})`, filter }}>
        <Frame img={shot.img} video={shot.video} />
      </AbsoluteFill>
      {shot.grade === "replay" ? <ReplayLook f={f} /> : null}
    </AbsoluteFill>
  );
};

const ReplayLook: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,6,2,0.65) 100%)" }} />
    <AbsoluteFill
      style={{
        opacity: 0.12,
        background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent ${3 + (f % 2)}px)`,
      }}
    />
  </AbsoluteFill>
);

// Тёплая виньетка поверх всех планов
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(14,8,2,0.5) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(8,5,2,0.42) 100%)" }} />
  </AbsoluteFill>
);

// ---------- крючок: полоса-кадр на чёрном, листы вылетают из неё ----------
export const HOOK_END = shotStart("sh02");
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const open = easeInOut(interpolate(t, [1.75, 2.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const bandH = interpolate(open, [0, 1], [680, H]);
  const top = (H - bandH) / 2 - interpolate(open, [0, 1], [70, 0]);
  const bottom = H - top - bandH;
  const ring = t < 0.9 ? Math.sin(f * 2.4) * 3 * (1 - t / 0.9) : 0; // дрожь от звонка
  const s = interpolate(t, [0, 2.6], [1.16, 1.08]);
  const word = (at: number) => {
    const k = interpolate(t, [at, at + 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: k * (1 - open), transform: `scale(${1.25 - 0.25 * k})` };
  };
  const titleStyle: React.CSSProperties = {
    fontFamily: OSW,
    fontWeight: 700,
    fontSize: 150,
    lineHeight: 1,
    color: C.white,
    letterSpacing: 2,
    textShadow: "0 6px 28px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)",
    whiteSpace: "nowrap",
  };
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <AbsoluteFill style={{ clipPath: `inset(${top}px 0px ${bottom}px 0px)` }}>
        <AbsoluteFill style={{ transform: `translate(${ring}px, -4%) scale(${s})` }}>
          <Frame img="01" />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.18)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingRight: 40, gap: 6, transform: `translateY(${top - 550}px)` }}>
        <div style={{ ...titleStyle, ...word(0.15) }}>ҚАҒАЗ ПА,</div>
        <div style={{ ...titleStyle, color: C.amber, ...word(0.7) }}>ОҚУШЫ МА?</div>
      </AbsoluteFill>
      {/* листы поверх полосы — «ломают» рамку */}
      <PapersToCamera f={f} t0={0.25} cx={W / 2 - 20} cy={H / 2 - 40} />
    </AbsoluteFill>
  );
};
