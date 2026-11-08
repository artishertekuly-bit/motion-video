import React from "react";
import { random } from "remotion";
import { P, Person, Pose, SEAT, STAND, mix, walk } from "../qagaz2/art";
import { DeskTop } from "../shpor/props";
import { wordIn } from "./timeline";
import {
  Achievement,
  Bench,
  BigPhone,
  Bubble,
  CellophaneBooks,
  ChatHeader,
  DustCloud,
  FL,
  GameScreen,
  Heart,
  HistoryBook,
  InputBar,
  Keyboard,
  Kitchen,
  LyingYerasyl,
  PSH,
  PSW,
  Room,
  ShoutLines,
  Stamp,
  Steam,
  Sticky,
  T,
  U,
  Wardrobe,
  Yard,
} from "./props";

export type SceneProps = { lf: number; len: number };
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const ez = (t: number) => {
  const x = cl(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const back = (t: number) => {
  const c = 1.9;
  const x = cl(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
const H = (pose: Pose, extra: Partial<Pose>): Pose => ({ ...pose, ...extra });

// Камера: точка (cx, cy) мира ставится в (sx, sy) экрана с масштабом s
const Cam: React.FC<{ s: number; cx?: number; cy?: number; sx?: number; sy?: number; rot?: number; children: React.ReactNode }> = ({ s, cx = 540, cy = 960, sx = 540, sy = 960, rot = 0, children }) => (
  <g transform={`translate(${sx} ${sy}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);
type Key = [number, number, number, number]; // [кадр, s, cx, cy]
const track = (lf: number, keys: Key[]) => {
  if (lf <= keys[0][0]) return { s: keys[0][1], cx: keys[0][2], cy: keys[0][3] };
  for (let i = 0; i + 1 < keys.length; i++) {
    const [a, s0, x0, y0] = keys[i];
    const [b, s1, x1, y1] = keys[i + 1];
    if (lf <= b) {
      const t = ez((lf - a) / (b - a));
      return { s: lerp(s0, s1, t), cx: lerp(x0, x1, t), cy: lerp(y0, y1, t) };
    }
  }
  const k = keys[keys.length - 1];
  return { s: k[1], cx: k[2], cy: k[3] };
};
const shakeAt = (lf: number, at: number, amp = 14, dur = 10) => (lf >= at && lf < at + dur ? Math.sin((lf - at) * 3.3) * amp * (1 - (lf - at) / dur) : 0);
const pop = (lf: number, at: number, d = 8) => back((lf - at) / d) * (lf >= at ? 1 : 0);

// «!» и «?» над головой
const Mark: React.FC<{ x: number; y: number; k: number; ch: string; c?: string; s?: number }> = ({ x, y, k, ch, c = U.yellow, s = 1 }) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * Math.min(1.1, k))}) rotate(${(1 - cl(k)) * -20})`} opacity={cl(k * 3)}>
      <T x={0} y={40} s={130} f="o" w={700} c={c} stroke={8}>
        {ch}
      </T>
    </g>
  ) : null;

// Речевой пузырь в мире
const SayBubble: React.FC<{ x: number; y: number; k: number; text: string; tail?: number; s?: number }> = ({ x, y, k, text, tail = -60, s = 1 }) => {
  if (k <= 0) return null;
  const w = text.length * 30 + 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.5 + 0.5 * Math.min(1.08, k))})`} opacity={cl(k * 3)}>
      <path d={`M ${tail - 20} 50 L ${tail * 1.8} 120 L ${tail + 30} 50 Z`} fill="#FFFFFF" stroke="#120C06" strokeWidth={6} strokeLinejoin="round" />
      <rect x={-w / 2} y={-60} width={w} height={116} rx={50} fill="#FFFFFF" stroke="#120C06" strokeWidth={6} />
      <rect x={tail - 16} y={44} width={44} height={14} fill="#FFFFFF" />
      <T x={0} y={18} s={56} c="#120C06">
        {text}
      </T>
    </g>
  );
};

// ---------- 1: крючок — лежит с телефоном, падает «30» ----------
export const S01: React.FC<SceneProps> = ({ lf, len }) => {
  const sh = shakeAt(lf, 4, 18, 12);
  return (
    <Cam s={lerp(1.5, 1.62, lf / len)} cx={330} cy={1290} sx={540 + sh} sy={1180}>
      <Room night={0.35} />
      <LyingYerasyl ph={lf * 0.12} />
    </Cam>
  );
};

// ---------- 2: «ертең бастаймын» — стикеры на стене ----------
const STICKS = [
  { x: 250, y: 930, rot: -8, text: "ЕРТЕҢ\nБАСТАЙМЫН", c: "#FFE066", w: 4 },
  { x: 470, y: 1030, rot: 6, text: "ДҮЙСЕНБІДЕН", c: "#9FE3B4", w: 5 },
  { x: 660, y: 1120, rot: 5, text: "1-ҚАҢТАРДАН", c: "#FFB3C7", w: 5 },
  { x: 470, y: 780, rot: -4, text: "ТУҒАН\nКҮННЕН КЕЙІН", c: "#A9D3FF", w: 6 },
];
export const S02: React.FC<SceneProps> = ({ lf }) => {
  const tag = pop(lf, wordIn("n2", 1, "sh02"));
  const c = track(lf, [
    [0, 1.25, 400, 1150],
    [120, 1.15, 400, 1100],
  ]);
  return (
    <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540} sy={1000}>
      <Room night={0.15} />
      {STICKS.map((st, i) => (
        <Sticky key={i} x={st.x} y={st.y} rot={st.rot} text={st.text} c={st.c} s={0.9} k={pop(lf, wordIn("n2", st.w, "sh02") - 4 + i * 5, 7)} />
      ))}
      <LyingYerasyl ph={lf * 0.12} />
      {/* бейдж-имя */}
      {tag > 0 ? (
        <g transform={`translate(150 1190) scale(${0.5 + 0.5 * Math.min(1.08, tag)})`} opacity={cl(tag * 3)}>
          <path d="M -16 40 L 0 70 L 16 40 Z" fill="#FFFFFF" />
          <rect x={-150} y={-46} width={300} height={90} rx={24} fill="#FFFFFF" stroke="#120C06" strokeWidth={5} />
          <T x={0} y={4} s={40} c="#120C06">
            ЕРАСЫЛ
          </T>
          <T x={0} y={34} s={22} w={700} c="#5A6278">
            11-сынып · 17 жас
          </T>
        </g>
      ) : null}
    </Cam>
  );
};

// фон для крупных планов предметов
const Glow: React.FC<{ c1?: string; c2?: string }> = ({ c1 = "#33508A", c2 = "#121A33" }) => (
  <g>
    <defs>
      <radialGradient id="uGlow" cx="0.5" cy="0.46" r="0.7">
        <stop offset="0" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#uGlow)" />
  </g>
);
const Rays: React.FC<{ lf: number; c?: string; op?: number; x?: number; y?: number }> = ({ lf, c = "#FFFFFF", op = 0.07, x = 540, y = 900 }) => (
  <g transform={`translate(${x} ${y}) rotate(${lf * 0.4})`}>
    {new Array(14).fill(0).map((_, i) => (
      <path key={i} d="M 0 0 L -90 -1500 L 90 -1500 Z" fill={c} opacity={op} transform={`rotate(${(i * 360) / 14})`} />
    ))}
  </g>
);

// ---------- 3a: экранное время 9 сағ ----------
export const S03a: React.FC<SceneProps> = ({ lf }) => {
  const k = eo(lf / 26);
  const hours = Math.min(9, Math.floor(k * 9.99));
  const mins = Math.floor(k * 12);
  const bars = [
    { t: "TikTok", v: 4.2, c: "#F2508A" },
    { t: "Ойын", v: 3.1, c: "#8A5AF0" },
    { t: "YouTube", v: 1.9, c: "#E2483D" },
  ];
  return (
    <g>
      <Glow />
      <Rays lf={lf} />
      <BigPhone y={lerp(60, 0, eo(lf / 10))} rot={-2}>
        <T x={PSW / 2} y={110} s={30} c="#5A6278">
          ЭКРАН УАҚЫТЫ · БҮГІН
        </T>
        <T x={PSW / 2} y={260} s={120} f="o" w={700} c="#141826">
          {hours} сағ
        </T>
        <T x={PSW / 2} y={320} s={40} c="#8A93A8">
          {mins} мин
        </T>
        {bars.map((b, i) => (
          <g key={i} transform={`translate(40 ${420 + i * 110})`}>
            <T x={0} y={0} s={28} a="start" c="#141826">
              {b.t}
            </T>
            <rect y={18} width={PSW - 80} height={34} rx={17} fill="#E3E6EE" />
            <rect y={18} width={(PSW - 80) * (b.v / 4.4) * eo((lf - 6 - i * 4) / 18)} height={34} rx={17} fill={b.c} />
          </g>
        ))}
        <rect x={40} y={760} width={PSW - 80} height={6} rx={3} fill="#E3E6EE" />
      </BigPhone>
    </g>
  );
};

// ---------- 3b: книги в целлофане, паук ----------
export const S03b: React.FC<SceneProps> = ({ lf, len }) => {
  const spider = eo(lf / 30) * 300;
  return (
    <Cam s={lerp(1.0, 1.08, lf / len)}>
      <rect width={1080} height={1920} fill={U.wallDk} />
      <rect y={1240} width={1080} height={680} fill="#9C6438" />
      <rect y={1240} width={1080} height={24} fill="#B87A48" />
      <CellophaneBooks x={540} y={1250} s={1.9} shine={0.5 + 0.5 * Math.sin(lf * 0.15)} />
      {/* блёстки */}
      {[0, 1, 2, 3].map((i) => {
        const t = ((lf + i * 13) % 40) / 40;
        const x = 260 + random(`sp${i}`) * 560;
        const y = 820 + random(`sq${i}`) * 380;
        return <path key={i} transform={`translate(${x} ${y}) scale(${Math.sin(t * Math.PI) * 1.4})`} d="M 0 -30 L 6 -6 L 30 0 L 6 6 L 0 30 L -6 6 L -30 0 L -6 -6 Z" fill="#FFFFFF" />;
      })}
      {/* паутина и паук */}
      <line x1={800} y1={0} x2={800} y2={500 + spider} stroke="#E8E2D6" strokeWidth={3} />
      <g transform={`translate(800 ${520 + spider}) rotate(${Math.sin(lf * 0.2) * 8})`}>
        {[-1, 1].map((d) =>
          [0, 1, 2, 3].map((j) => <path key={`${d}${j}`} d={`M 0 0 Q ${d * 30} ${-14 + j * 10} ${d * 46} ${4 + j * 12}`} stroke="#1A1410" strokeWidth={5} fill="none" />),
        )}
        <ellipse cx={0} cy={0} rx={22} ry={26} fill="#1A1410" />
        <circle cx={-7} cy={-8} r={5} fill="#FFFFFF" />
        <circle cx={7} cy={-8} r={5} fill="#FFFFFF" />
      </g>
      <Sticky x={250} y={760} rot={-10} text={"ЖАП-ЖАҢА"} c="#FFE066" k={pop(lf, 8)} />
    </Cam>
  );
};

// ---------- 3c: пробный ҰБТ — 47 ----------
export const S03c: React.FC<SceneProps> = ({ lf, len }) => {
  const at = wordIn("n3", 10, "sh03c");
  const st = cl((lf - at + 2) / 6);
  return (
    <Cam s={lerp(1.0, 1.06, lf / len)} sx={540 + shakeAt(lf, at + 4, 16)}>
      <DeskTop />
      <g transform="translate(540 1010) rotate(-4) scale(0.86)">
        <rect x={-380} y={-520} width={760} height={1000} fill="#000" opacity={0.25} transform="translate(16 20)" />
        <rect x={-380} y={-520} width={760} height={1000} rx={6} fill={P.paper} />
        <T x={0} y={-430} s={54} c="#2B3550">
          СЫНАҚ ҰБТ
        </T>
        <T x={-320} y={-350} s={32} a="start" w={700} c="#2B3550">
          Аты-жөні: Ерасыл
        </T>
        <rect x={-320} y={-320} width={640} height={4} fill="#2B3550" opacity={0.3} />
        {new Array(8).fill(0).map((_, i) => (
          <g key={i} transform={`translate(-320 ${-260 + i * 70})`}>
            <rect width={36} height={36} rx={6} fill="none" stroke="#2B3550" strokeWidth={4} />
            {random(`ok${i}`) > 0.65 ? <path d="M 6 18 L 16 28 L 32 6" stroke="#2F8A5B" strokeWidth={6} fill="none" /> : <path d="M 6 6 L 30 30 M 30 6 L 6 30" stroke="#C0392B" strokeWidth={6} />}
            <rect x={60} y={10} width={300 + random(`ln${i}`) * 200} height={14} rx={7} fill="#9AA2B8" opacity={0.6} />
          </g>
        ))}
        {/* оценка */}
        {st > 0 ? (
          <g transform={`translate(110 250) rotate(-10) scale(${1 + 1.8 * Math.pow(1 - st, 2)})`} opacity={cl(st * 3)}>
            <circle r={170} fill="none" stroke="#D62F26" strokeWidth={14} />
            <T x={-10} y={50} s={170} f="o" w={700} c="#D62F26">
              47
            </T>
            <T x={90} y={124} s={52} f="o" w={700} c="#D62F26">
              /140
            </T>
          </g>
        ) : null}
      </g>
    </Cam>
  );
};

// ---------- 4a: пишет Аружан — подскок ----------
export const S04a: React.FC<SceneProps> = ({ lf }) => {
  const at = wordIn("n4", 3, "sh04a");
  const j = lf >= at ? Math.max(0, Math.sin(cl((lf - at) / 10) * Math.PI)) : 0;
  const note = pop(lf, at - 3);
  const c = track(lf, [
    [0, 1.9, 220, 1200],
    [60, 2.05, 220, 1190],
  ]);
  return (
    <g>
      <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540} sy={960}>
        <Room night={0.35} />
        <LyingYerasyl ph={lf * 0.12} jolt={j} glow={1 + note} />
      </Cam>
      {/* уведомление над телефоном */}
      {note > 0 ? (
        <g transform={`translate(540 580) scale(${0.4 + 0.6 * Math.min(1.08, note)})`} opacity={cl(note * 3)}>
          <rect x={-380} y={-90} width={760} height={180} rx={40} fill="#FFFFFF" stroke="#120C06" strokeWidth={6} />
          <circle cx={-290} cy={0} r={56} fill="#F3C1D3" />
          <Heart x={-290} y={-4} s={1.2} />
          <T x={-200} y={-14} s={44} a="start" c="#120C06">
            Аружан
          </T>
          <T x={-200} y={44} s={32} w={700} a="start" c="#5A6278">
            жаңа хабарлама
          </T>
        </g>
      ) : null}
      <Mark x={210} y={930} k={pop(lf, at + 2)} ch="!" c={U.yellow} s={1.1} />
    </g>
  );
};

// ---------- 4b: флешбэк «5-СЫНЫП» ----------
const SchoolWall: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="url(#wallG)" />
    <rect y={1240} width={1080} height={320} fill="url(#tealG)" />
    <rect y={1236} width={1080} height={10} fill={P.rail} />
    <rect y={FL} width={1080} height={400} fill="url(#floorG)" />
    {[
      { x: 110, t: "5 «А»" },
      { x: 690, t: "5 «Ә»" },
    ].map((d, i) => (
      <g key={i}>
        <rect x={d.x - 14} y={760} width={308} height={FL - 760} fill={P.woodDk} />
        <rect x={d.x} y={774} width={280} height={FL - 774} fill={P.wood} />
        <rect x={d.x + 30} y={810} width={220} height={200} fill={P.sky} opacity={0.7} />
        <rect x={d.x + 240} y={1150} width={16} height={60} rx={8} fill={P.brass} />
        <rect x={d.x + 60} y={660} width={160} height={70} rx={10} fill="#FFFFFF" stroke={P.woodDk} strokeWidth={5} />
        <T x={d.x + 140} y={712} s={44} c="#2B3550">
          {d.t}
        </T>
      </g>
    ))}
  </g>
);
export const S04b: React.FC<SceneProps> = ({ lf, len }) => {
  const hearts = wordIn("n4", 12, "sh04b");
  const par = wordIn("n4", 13, "sh04b");
  const c = track(lf, [
    [0, 1.12, 540, 1180],
    [len, 1.0, 540, 1150],
  ]);
  const peek = eo((lf - 8) / 16);
  return (
    <g>
      <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540} sy={1060}>
        <SchoolWall />
        <Person kind="aruzhan" x={330} y={FL + 10} s={0.82} face={1} pose={H(STAND, { aFs: 14, aFe: 40, head: -4 })} carry="notebook" />
        <g transform={`translate(${lerp(90, 0, peek)} 0)`}>
          <Person kind="boy" x={720} y={FL + 10} s={0.78} face={-1} pose={H(STAND, { lean: 10, head: 12, aFs: 30, aFe: 50 })} />
        </g>
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (lf - hearts - i * 6) / 40;
          if (t <= 0 || t > 1) return null;
          return <Heart key={i} x={680 - t * 200 + Math.sin(t * 9 + i) * 30} y={1040 - t * 260} s={0.9 + i * 0.15} op={1 - t * 0.6} />;
        })}
        {/* «параллель» — стрелка между дверями */}
        {lf >= par - 3 ? (
          <g opacity={cl((lf - par + 3) / 6)}>
            <path d="M 420 620 Q 540 540 660 620" stroke="#E2483D" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M 660 620 L 628 590 M 660 620 L 622 630" stroke="#E2483D" strokeWidth={10} strokeLinecap="round" />
          </g>
        ) : null}
      </Cam>
      {/* сепия и рамка воспоминания */}
      <rect width={1080} height={1920} fill="#C8954A" opacity={0.2} />
      <rect x={20} y={470} width={1040} height={1300} rx={30} fill="none" stroke="#FFF6E2" strokeWidth={14} opacity={0.9} />
      <g transform="translate(220 500) rotate(-4)">
        <rect x={-150} y={-40} width={300} height={80} rx={12} fill="#FFF6E2" />
        <T x={0} y={18} s={46} c="#7A4A26">
          5-СЫНЫП
        </T>
      </g>
    </g>
  );
};

// ---------- 5: чат — её сообщение ----------
export const S05: React.FC<SceneProps> = ({ lf }) => {
  const msg = pop(lf, 10, 9);
  const q = wordIn("a1", 3, "sh05");
  const zoom = ez((lf - q) / 14);
  return (
    <g>
      <Glow c1="#5A3D7A" c2="#1A1230" />
      <Cam s={lerp(1.2, 1.36, zoom)} cx={540} cy={lerp(890, 780, zoom)} sy={960}>
        <BigPhone>
          <ChatHeader typing={lf < 10 ? 1 : 0} />
          <rect x={PSW / 2 - 50} y={160} width={100} height={36} rx={18} fill="#DDE1EA" />
          <T x={PSW / 2} y={186} s={20} w={700} c="#5A6278">
            Бүгін
          </T>
          <Bubble y={230} side={-1} lines={["Сәлем!"]} />
          <Bubble y={330} side={-1} lines={["Алматыға грантқа", "түсемін. Сен ше?"]} k={msg} time="21:47" />
          <InputBar y={PSH - 80} text="" />
        </BigPhone>
      </Cam>
    </g>
  );
};

// ---------- 6: встаёт — «АДАМ БОЛУҒА» → «неден бастау?» ----------
export const S06: React.FC<SceneProps> = ({ lf }) => {
  const up = wordIn("n5", 2, "sh06");
  const q = wordIn("n5", 4, "sh06");
  const rise = ez((lf - 4) / 16);
  const hero = ez((lf - up + 4) / 8) * (1 - ez((lf - q + 2) / 8));
  const scratch = ez((lf - q + 2) / 8);
  let pose = mix(H(SEAT, { aFs: 30, aFe: 30 }), STAND, rise);
  pose = mix(pose, H(STAND, { aFs: 168, aFe: 10, aBs: 160, aBe: 10, head: -12 }), hero);
  pose = mix(pose, H(STAND, { aFs: 150, aFe: 120, head: 8, lean: 2 }), scratch);
  const c = track(lf, [
    [0, 1.2, 560, 1160],
    [40, 1.32, 560, 1120],
  ]);
  return (
    <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540} sy={1040}>
      <Room />
      <g opacity={hero}>
        <Rays lf={lf} c={U.yellow} op={0.18} x={560} y={1060} />
      </g>
      <Person kind="teen" x={560} y={FL} s={1.0} face={1} pose={pose} />
      <Mark x={640} y={900} k={pop(lf, q + 2)} ch="?" s={0.9} />
      <Mark x={490} y={860} k={pop(lf, q + 8)} ch="?" s={0.7} c="#FFFFFF" />
    </Cam>
  );
};

// ---------- 7: осмотр стола (вид сверху) ----------
const Mug: React.FC<{ x: number; y: number; k: number; lf: number }> = ({ x, y, k, lf }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-60 + i * 40} cy={130 - i * 20} r={100} fill="none" stroke="#5E3A20" strokeWidth={6} opacity={0.35} />
    ))}
    <rect x={90} y={-30} width={70} height={60} rx={30} fill="none" stroke="#F2EEE6" strokeWidth={22} />
    <circle r={120} fill="#F2EEE6" />
    <circle r={100} fill="#6B3A1A" />
    {[
      [-30, -20, 26],
      [30, 30, 20],
      [10, -50, 14],
      [-40, 40, 16],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r * (0.6 + 0.4 * k)} fill="#7FA04A" />
    ))}
    {[0, 1].map((i) => {
      const a = lf * 0.18 + i * Math.PI;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * 170} ${Math.sin(a * 1.3) * 120 - 40})`}>
          <ellipse cx={-10} cy={-8} rx={12} ry={7} fill="#FFFFFF" opacity={0.7} />
          <ellipse cx={10} cy={-8} rx={12} ry={7} fill="#FFFFFF" opacity={0.7} />
          <circle r={9} fill="#1A1410" />
        </g>
      );
    })}
  </g>
);
const Samsa: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(14)`}>
    <path d="M -150 90 L 0 -140 L 150 90 Z" fill="#000" opacity={0.2} transform="translate(10 14)" />
    <path d="M -150 90 L 0 -140 L 60 -48 Q 10 -10 60 40 Q 100 70 150 90 Z" fill="#D9A04A" stroke="#A86E26" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -110 70 L 0 -100" stroke="#A86E26" strokeWidth={6} opacity={0.6} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={100 + random(`cr${i}`) * 90} cy={-30 + random(`cs${i}`) * 140} r={6 + random(`ct${i}`) * 6} fill="#D9A04A" />
    ))}
  </g>
);
const Charger: React.FC<{ x: number; y: number; rot: number; c: string; cable: string }> = ({ x, y, rot, c, cable }) => (
  <g>
    <path d={cable} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" />
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-40} y={-50} width={80} height={100} rx={14} fill={c} stroke="#2B2B30" strokeWidth={4} />
      <rect x={-20} y={-80} width={10} height={34} fill="#B9BDC6" />
      <rect x={10} y={-80} width={10} height={34} fill="#B9BDC6" />
    </g>
  </g>
);
export const S07: React.FC<SceneProps> = ({ lf }) => {
  const wTea = wordIn("n6", 4, "sh07");
  const wSam = wordIn("n6", 7, "sh07");
  const wCh = wordIn("n6", 10, "sh07");
  const wNo = wordIn("n6", 12, "sh07");
  const c = track(lf, [
    [0, 1.0, 540, 960],
    [wTea - 8, 1.0, 540, 960],
    [wTea + 6, 1.45, 330, 760],
    [wSam - 6, 1.45, 330, 760],
    [wSam + 6, 1.45, 760, 980],
    [wCh - 6, 1.45, 760, 980],
    [wCh + 6, 1.35, 520, 1180],
    [wNo - 8, 1.35, 520, 1180],
    [wNo + 4, 1.0, 540, 960],
  ]);
  const mag = cl(lf / 60);
  const magOn = lf < wTea - 4;
  return (
    <g>
      <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540 + shakeAt(lf, wNo + 2, 16)} sy={960}>
        <DeskTop />
        {/* мусор */}
        <g transform="translate(860 560) rotate(20)">
          <circle r={60} fill="#F2EEE6" />
          <path d="M -40 -20 L 30 -40 L 40 20 L -20 40 Z" fill="#DCD3C2" />
        </g>
        <g transform="translate(200 1300) rotate(-30)">
          <rect x={-90} y={-36} width={180} height={72} rx={36} fill="#2B2B30" />
          <circle cx={-50} cy={0} r={18} fill="#4A4A55" />
          <circle cx={50} cy={-8} r={9} fill={U.red} />
          <circle cx={66} cy={8} r={9} fill={U.yellow} />
        </g>
        <Mug x={330} y={760} k={cl((lf - wTea) / 20)} lf={lf} />
        <Samsa x={760} y={980} />
        <Charger x={380} y={1140} rot={-20} c="#F2EEE6" cable="M 380 1140 C 520 1000 600 1300 760 1180 S 900 1300 1000 1240" />
        <Charger x={560} y={1260} rot={10} c="#2B2B30" cable="M 560 1260 C 700 1160 520 1100 760 1180 S 880 1420 1040 1330" />
        <Charger x={700} y={1360} rot={34} c="#E2483D" cable="M 700 1360 C 600 1260 840 1220 760 1180 S 980 1120 1060 1200" />
        <Sticky x={420} y={600} rot={-6} s={0.75} text={"1 АЙЛЫҚ\nШАЙ"} k={pop(lf, wTea + 4)} />
        <Sticky x={850} y={830} rot={8} s={0.75} text={"½ САМСА"} c="#FFB3C7" k={pop(lf, wSam + 4)} />
        <Sticky x={640} y={1060} rot={-4} s={0.75} text={"×3"} c="#9FE3B4" k={pop(lf, wCh + 6)} />
      </Cam>
      {/* лупа «детектив» */}
      {magOn ? (
        <g transform={`translate(${lerp(260, 820, ez(mag))} ${900 + Math.sin(lf * 0.12) * 160})`}>
          <circle r={130} fill="#BFE0EF" opacity={0.25} />
          <circle r={130} fill="none" stroke="#2B2B30" strokeWidth={22} />
          <rect x={86} y={86} width={40} height={180} rx={18} fill="#6B4226" transform="rotate(-45 106 106)" />
        </g>
      ) : null}
      <Stamp x={540} y={960} k={cl((lf - wNo + 2) / 6)} text="КІТАП ЖОҚ" s={1.35} />
    </g>
  );
};

// ---------- 8: шкаф, пыль «Сіз кімсіз?» ----------
export const S08: React.FC<SceneProps> = ({ lf }) => {
  const wOpen = wordIn("n7", 2, "sh08");
  const wDust = wordIn("n7", 4, "sh08");
  const wWho = wordIn("n7", 6, "sh08");
  const open = ez((lf - wOpen) / 14);
  const dust = eo((lf - wDust + 2) / 14);
  const walkT = cl(lf / 36);
  const x = lerp(1000, 800, ez(walkT));
  const recoil = ez((lf - wDust) / 6);
  let pose: Pose = walkT < 1 ? walk(lf * 0.34, 0.8) : STAND;
  pose = mix(pose, H(STAND, { aFs: 60, aFe: 40 }), cl((lf - 34) / 8) * (1 - recoil));
  pose = mix(pose, H(STAND, { lean: -16, head: -14, aFs: 120, aFe: 60, aBs: 100, aBe: 60 }), recoil);
  return (
    <Cam s={1.0} cx={540} cy={1060} sx={540} sy={1000}>
      <Room desk={false} poster={false} />
      <Wardrobe x={400} y={FL} open={open} />
      <DustCloud x={400 + dust * 30} y={1080 - dust * 60} s={1.8} k={dust} blink={Math.floor(lf / 4) % 12 === 0} />
      {/* пылинки */}
      {dust > 0
        ? new Array(14).fill(0).map((_, i) => {
            const t = cl((lf - wDust - i) / 30);
            return <circle key={i} cx={400 + (random(`dx${i}`) - 0.3) * 700 * t} cy={1080 + (random(`dy${i}`) - 0.5) * 500 * t} r={8} fill="#CFC6B6" opacity={1 - t} />;
          })
        : null}
      <Person kind="teen" x={x} y={FL} s={1.0} face={-1} pose={pose} />
      <SayBubble x={430} y={700} k={pop(lf, wWho - 2)} text="Сіз кімсіз?" tail={-40} />
    </Cam>
  );
};

// ---------- 9: учебник скрипит, «ЖЕТІСТІК» ----------
export const S09: React.FC<SceneProps> = ({ lf, len }) => {
  const wOpen = wordIn("n8", 2, "sh09");
  const wCreak = wordIn("n8", 3, "sh09");
  const wFirst = wordIn("n8", 4, "sh09");
  const open = ez((lf - wOpen) / 26);
  const shake = lf > wOpen && lf < wOpen + 30 ? Math.sin(lf * 2.4) * 2.5 : 0;
  const puff = cl((lf - wCreak) / 24);
  const kr = pop(lf, wCreak - 2);
  return (
    <g>
      <Cam s={lerp(1.0, 1.08, lf / len)}>
        <DeskTop />
        <HistoryBook x={lerp(341, 540, open)} y={1000} s={1.3} open={open} shake={shake} />
        {puff > 0 && puff < 1
          ? new Array(10).fill(0).map((_, i) => (
              <circle key={i} cx={690 + (random(`pf${i}`) - 0.5) * 700 * puff} cy={760 - random(`pg${i}`) * 260 * puff} r={30 + 30 * puff} fill="#E8E0CF" opacity={0.7 * (1 - puff)} />
            ))
          : null}
      </Cam>
      {kr > 0 ? (
        <g transform={`translate(560 1330) rotate(-6) scale(${0.5 + 0.5 * Math.min(1.08, kr)})`} opacity={cl(kr * 3) * (1 - cl((lf - wFirst) / 6))}>
          <T x={0} y={0} s={110} f="o" w={700} c="#FFFFFF" stroke={10} ls={4}>
            СЫҚЫР-Р-Р!
          </T>
        </g>
      ) : null}
      <Achievement y={600} k={cl((lf - wFirst - 2) / 10)} title="ЖЕТІСТІК АШЫЛДЫ!" sub="Кітап ашты · 1-рет" />
    </g>
  );
};

// ---------- 10a: мама кричит из кухни ----------
export const S10a: React.FC<SceneProps> = ({ lf }) => {
  const at = wordIn("m1", 0, "sh10a");
  const sh = ez((lf - at + 2) / 5) * (1 - 0.5 * ez((lf - at - 14) / 10));
  const pose = mix(H(STAND, { aFs: 50, aFe: 60 }), H(STAND, { lean: 10, head: -10, aFs: 70, aFe: 30, aBs: 40, aBe: 90 }), sh);
  return (
    <Cam s={1.25} cx={480} cy={1150} sx={540} sy={1020}>
      <Kitchen />
      <Steam x={250} y={1130} lf={lf} />
      <Person kind="mom" x={430} y={FL} s={1.0} face={1} pose={pose} carry="pencil" />
      <ShoutLines x={500} y={1030} k={sh * (0.7 + 0.3 * Math.sin(lf * 0.8))} />
    </Cam>
  );
};

// ---------- 10b: «Иә!» — за столом, книга стоит ----------
const Chair: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 90} y={FL - 140} width={150} height={20} rx={6} fill="#3A3A40" />
    <rect x={x - 96} y={FL - 420} width={22} height={300} rx={8} fill="#3A3A40" />
    <rect x={x - 70} y={FL - 120} width={14} height={120} fill="#2B2B30" />
    <rect x={x + 30} y={FL - 120} width={14} height={120} fill="#2B2B30" />
  </g>
);
export const S10b: React.FC<SceneProps> = ({ lf }) => {
  const at = wordIn("e1", 0, "sh10b");
  const j = lf >= at - 2 ? Math.max(0, Math.sin(cl((lf - at + 2) / 9) * Math.PI)) : 0;
  return (
    <Cam s={1.35} cx={670} cy={1200} sx={540} sy={1020}>
      <Room />
      <Chair x={760} />
      <Person kind="teen" x={770} y={FL - j * 30} s={1.0} face={1} pose={H(SEAT, { aFs: 80, aFe: 30, aBs: 70, aBe: 40, head: -6 - j * 10 })} shadow={0} />
      {/* книга стоит «домиком», за ней светится телефон */}
      <ellipse cx={960} cy={1170} rx={90} ry={60} fill="#9FD3FF" opacity={0.45} filter="url(#blur8)" />
      <g transform="translate(960 1250)">
        <rect x={-80} y={-200} width={160} height={200} rx={6} fill="#B0412E" />
        <rect x={-70} y={-180} width={140} height={6} fill="#F2D27A" />
        <T x={0} y={-110} s={30} c="#F2D27A">
          ТАРИХ
        </T>
      </g>
      <Mark x={680} y={930} k={pop(lf, at)} ch="!" s={0.8} />
    </Cam>
  );
};

// ---------- 10c: за книгой — игра ----------
export const S10c: React.FC<SceneProps> = ({ lf, len }) => (
  <g>
    <DeskTop />
    <Cam s={lerp(1.0, 1.06, lf / len)}>
      {/* раскрытая книга вокруг телефона */}
      <g transform="translate(540 900) rotate(-3)">
        <rect x={-500} y={-470} width={1000} height={940} fill="#000" opacity={0.25} transform="translate(14 18)" />
        <rect x={-500} y={-470} width={500} height={940} fill="#F1EADA" />
        <rect x={0} y={-470} width={500} height={940} fill="#F7F2E7" />
        {new Array(18).fill(0).map((_, i) => (
          <g key={i}>
            <rect x={-460} y={-420 + i * 50} width={380 - (i % 3) * 40} height={10} rx={5} fill="#9A8E78" opacity={0.5} />
            <rect x={60} y={-420 + i * 50} width={380 - (i % 2) * 50} height={10} rx={5} fill="#9A8E78" opacity={0.5} />
          </g>
        ))}
        <rect x={-4} y={-470} width={8} height={940} fill="#C9BFA8" />
      </g>
      <BigPhone y={30} rot={4} s={0.9}>
        <GameScreen lf={lf} />
      </BigPhone>
    </Cam>
  </g>
);

// ---------- 11: двор, апалар на скамейке ----------
export const S11: React.FC<SceneProps> = ({ lf }) => {
  const wLook = wordIn("n10", 5, "sh11");
  const wSick = wordIn("n10", 7, "sh11");
  const walkT = cl(lf / 50);
  const yx = lerp(1180, 820, walkT);
  const yp: Pose = walkT < 1 ? H(walk(lf * 0.3, 0.7), { aFs: 70, aFe: 70, head: 18 }) : H(STAND, { aFs: 70, aFe: 70, head: 18 });
  const turn = lf >= wLook;
  const lean = ez((lf - wLook) / 8);
  const c = track(lf, [
    [0, 1.0, 540, 1250],
    [wSick - 10, 1.0, 540, 1250],
    [wSick + 6, 1.4, 360, 1240],
  ]);
  return (
    <Cam s={c.s} cx={c.cx} cy={c.cy} sx={540} sy={1060}>
      <Yard />
      <Bench x={330} y={1610} />
      <Person kind="apa" x={220} y={1610} s={1.0} face={1} pose={H(SEAT, { lean: 6, head: 8 + lean * 8, aFs: 40, aFe: 60 })} shadow={0} />
      <Person kind="apa2" x={460} y={1610} s={1.0} face={turn ? -1 : 1} pose={H(SEAT, { lean: 6, head: 8 + lean * 8, aFs: 40, aFe: 60 })} shadow={0} />
      <Person kind="teen" x={yx} y={1660} s={1.0} face={-1} pose={yp} carry="notebook" />
      {/* термометр-шутка */}
      {lf >= wSick ? (
        <g transform={`translate(340 1010) rotate(${Math.sin(lf * 0.3) * 6}) scale(${0.4 + 0.6 * Math.min(1.08, pop(lf, wSick))})`}>
          <rect x={-22} y={-140} width={44} height={200} rx={22} fill="#FFFFFF" stroke="#120C06" strokeWidth={5} />
          <circle cx={0} cy={80} r={40} fill="#E2483D" stroke="#120C06" strokeWidth={5} />
          <rect x={-9} y={-110} width={18} height={180} rx={9} fill="#E2483D" />
          <T x={80} y={-60} s={44} c="#E2483D" stroke={6}>
            39°
          </T>
        </g>
      ) : null}
      <Mark x={180} y={1020} k={pop(lf, wLook + 4)} ch="?" s={0.7} c="#FFFFFF" />
      <Mark x={520} y={1000} k={pop(lf, wLook + 8)} ch="!" s={0.7} />
    </Cam>
  );
};

// ---------- 12: пишет — стирает — «Мен де» ----------
const TYPING = [{ text: "Мен әлі бастаған жоқпын" }, { text: "Шынымды айтсам, мен" }];
export const S12: React.FC<SceneProps> = ({ lf }) => {
  const a0 = wordIn("n11", 2, "sh12");
  const d0 = wordIn("n11", 4, "sh12");
  const a1 = wordIn("n11", 5, "sh12");
  const d1 = wordIn("n11", 7, "sh12");
  const a2 = wordIn("n11", 8, "sh12");
  const send = wordIn("n11", 10, "sh12");
  const typed = (txt: string, from: number, to: number, del: number) => {
    if (lf < from) return null;
    const n = lf < del ? Math.floor(cl((lf - from) / (to - from)) * txt.length) : Math.max(0, txt.length - Math.floor((lf - del) * 3));
    return txt.slice(0, n);
  };
  const A = typed(TYPING[0].text, a0, d0 - 2, d0);
  const Bt = typed(TYPING[1].text, a1, d1 - 2, d1);
  const Cc = lf >= a2 && lf < send ? "Мен де".slice(0, Math.floor(cl((lf - a2) / 16) * 6)) : null;
  let text = "";
  let typingNow = false;
  if (Cc !== null) {
    text = Cc;
    typingNow = lf < a2 + 16;
  } else if (Bt !== null && lf < a2) {
    text = Bt;
    typingNow = lf < d1 - 2;
  } else if (A !== null && lf < a1) {
    text = A;
    typingNow = lf < d0 - 2;
  }
  const deleting = (lf >= d0 && lf < d0 + 10) || (lf >= d1 && lf < d1 + 10);
  const hit = typingNow || deleting ? Math.floor(random(`kb${Math.floor(lf / 2)}`) * 31) : -1;
  const sent = pop(lf, send, 8);
  const caret = Math.floor(lf / 8) % 2 === 0;
  return (
    <g>
      <Glow c1="#22305A" c2="#0A0E1E" />
      <Cam s={lerp(1.18, 1.22, cl(lf / 200))} cx={540} cy={890} sy={950}>
        <BigPhone dark>
          <ChatHeader dark />
          <Bubble y={160} side={-1} lines={["Алматыға грантқа", "түсемін. Сен ше?"]} dark time="21:47" />
          {sent > 0 ? <Bubble y={330} side={1} lines={["Мен де"]} k={sent} dark time="23:58" /> : null}
          <InputBar y={PSH - 360} text={sent > 0 ? "" : text} caret={caret && sent <= 0} dark />
          <Keyboard y={PSH - 280} hit={hit} dark />
        </BigPhone>
      </Cam>
      {deleting ? (
        <g transform="translate(860 560) rotate(8)">
          <T x={0} y={0} s={60} f="o" w={700} c={U.red} stroke={6}>
            ӨШІРУ
          </T>
        </g>
      ) : null}
    </g>
  );
};

// ---------- 13: ночь, «ӨТІРІК №1» ----------
export const S13: React.FC<SceneProps> = ({ lf, len }) => {
  const at = wordIn("n12", 6, "sh13");
  return (
    <g>
      <Cam s={lerp(1.5, 1.66, lf / len)} cx={330} cy={1290} sx={540 + shakeAt(lf, at + 4, 14)} sy={1180}>
        <Room night={1} />
        <LyingYerasyl ph={lf * 0.05} glow={0.7} kneeUp={0.4} />
      </Cam>
      <Stamp x={540} y={760} k={cl((lf - at + 2) / 6)} text="ӨТІРІК №1" s={1.2} rot={-8} />
    </g>
  );
};

// ---------- 14: голосование (фон; карточки — в HUD) ----------
export const S14: React.FC<SceneProps> = ({ lf }) => (
  <g>
    <rect width={1080} height={1920} fill="#0E1430" />
    <rect width={540} height={1920} fill="#3A1418" opacity={0.6} />
    <rect x={540} width={540} height={1920} fill="#0F3A26" opacity={0.6} />
    <Rays lf={lf} op={0.06} x={540} y={760} />
    {new Array(26).fill(0).map((_, i) => {
      const t = ((lf * (0.6 + random(`cf${i}`) * 0.8) + random(`cg${i}`) * 400) % 400) / 400;
      const x = random(`ch${i}`) * 1080;
      return <rect key={i} x={x + Math.sin(t * 12 + i) * 30} y={t * 2000 - 80} width={16} height={26} rx={4} fill={[U.yellow, U.red, U.green, "#FFFFFF"][i % 4]} opacity={0.75} transform={`rotate(${t * 720 + i * 40} ${x} ${t * 2000 - 80})`} />;
    })}
  </g>
);

export const SCENES: Record<string, React.FC<SceneProps>> = {
  sh01: S01,
  sh02: S02,
  sh03a: S03a,
  sh03b: S03b,
  sh03c: S03c,
  sh04a: S04a,
  sh04b: S04b,
  sh05: S05,
  sh06: S06,
  sh07: S07,
  sh08: S08,
  sh09: S09,
  sh10a: S10a,
  sh10b: S10b,
  sh10c: S10c,
  sh11: S11,
  sh12: S12,
  sh13: S13,
  sh14: S14,
};
