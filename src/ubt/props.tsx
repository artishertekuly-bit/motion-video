import React from "react";
import { random } from "remotion";
import { MONT, OSW } from "../qagaz/theme";
import { Person, Pose, STAND } from "../qagaz2/art";

export const U = {
  wall: "#5374AD",
  wallHi: "#6E90C8",
  wallDk: "#3D5A8E",
  floor: "#8A5A36",
  floorDk: "#5E3A20",
  bedWood: "#6B4226",
  blanket: "#E8823A",
  blanketDk: "#C2622A",
  pillow: "#F4F1EA",
  red: "#E2483D",
  green: "#2FB36B",
  yellow: "#FFD84A",
  navy: "#0E1630",
  screen: "#0F1220",
  phone: "#1A1C24",
};
export const FL = 1560; // пол в комнате
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// Текст в SVG одним вызовом
export const T: React.FC<{ x: number; y: number; s: number; c?: string; w?: number; a?: "start" | "middle" | "end"; f?: "m" | "o"; op?: number; stroke?: number; children: React.ReactNode; ls?: number }> = ({
  x,
  y,
  s,
  c = "#FFFFFF",
  w = 800,
  a = "middle",
  f = "m",
  op = 1,
  stroke = 0,
  children,
  ls = 0,
}) => (
  <text
    x={x}
    y={y}
    fontSize={s}
    fontWeight={w}
    fill={c}
    textAnchor={a}
    fontFamily={f === "m" ? MONT : OSW}
    opacity={op}
    letterSpacing={ls}
    stroke={stroke ? "#120C06" : undefined}
    strokeWidth={stroke || undefined}
    paintOrder="stroke fill"
    strokeLinejoin="round"
  >
    {children}
  </text>
);

// ---------- спальня Ерасыла (вид сбоку) ----------
export const Room: React.FC<{ night?: number; desk?: boolean; poster?: boolean }> = ({ night = 0, desk = true, poster = true }) => (
  <g>
    <defs>
      <linearGradient id="uWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={U.wallDk} />
        <stop offset="0.5" stopColor={U.wall} />
        <stop offset="1" stopColor={U.wallHi} />
      </linearGradient>
      <linearGradient id="uSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8CC6EA" />
        <stop offset="1" stopColor="#DDF0F8" />
      </linearGradient>
    </defs>
    <rect width={1080} height={FL} fill="url(#uWall)" />
    {/* обои: мелкие полоски */}
    {new Array(18).fill(0).map((_, i) => (
      <rect key={i} x={i * 64 + 20} y={0} width={10} height={FL} fill="#FFFFFF" opacity={0.05} />
    ))}
    {/* окно */}
    <g transform="translate(600 520)">
      <rect x={-14} y={-14} width={328} height={378} rx={8} fill="#F2EEE6" />
      <rect width={300} height={350} fill={night > 0.5 ? "#141C3E" : "url(#uSky)"} />
      {night > 0.5 ? (
        <g>
          <circle cx={210} cy={90} r={38} fill="#F4E9C8" />
          <circle cx={226} cy={80} r={34} fill="#141C3E" />
          {[
            [60, 60],
            [120, 150],
            [250, 220],
            [80, 260],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="#FFFFFF" opacity={0.8} />
          ))}
        </g>
      ) : (
        <g>
          <ellipse cx={90} cy={110} rx={60} ry={22} fill="#FFFFFF" opacity={0.85} />
          <ellipse cx={210} cy={200} rx={70} ry={20} fill="#FFFFFF" opacity={0.7} />
          <rect x={0} y={270} width={300} height={80} fill="#9FB7C9" />
          {[10, 70, 150, 220].map((x, i) => (
            <rect key={i} x={x} y={250 - i * 12} width={56} height={120} fill="#B9C9D6" />
          ))}
        </g>
      )}
      <rect x={146} y={0} width={8} height={350} fill="#F2EEE6" />
      <rect x={0} y={170} width={300} height={8} fill="#F2EEE6" />
      {/* шторы */}
      <path d="M -40 -30 L 40 -30 Q 30 180 60 380 L -40 380 Z" fill="#E0703A" />
      <path d="M 260 -30 L 340 -30 L 340 380 L 240 380 Q 270 180 260 -30 Z" fill="#E0703A" />
      <rect x={-50} y={-44} width={400} height={16} rx={8} fill="#3A2A1A" />
    </g>
    {/* постер с геймпадом */}
    {poster ? (
      <g transform="translate(130 470) rotate(-3)">
        <rect width={250} height={330} fill="#1C1630" stroke="#F2EEE6" strokeWidth={8} />
        <rect x={20} y={20} width={210} height={200} fill="#5B2A86" />
        <circle cx={125} cy={120} r={70} fill="#F25C9A" opacity={0.6} />
        <rect x={60} y={95} width={130} height={56} rx={28} fill="#14121C" />
        <rect x={80} y={116} width={30} height={10} fill="#FFFFFF" />
        <rect x={90} y={106} width={10} height={30} fill="#FFFFFF" />
        <circle cx={158} cy={113} r={7} fill={U.yellow} />
        <circle cx={172} cy={128} r={7} fill={U.red} />
        <T x={125} y={272} s={44} f="o" w={700} c={U.yellow}>
          LEVEL UP
        </T>
      </g>
    ) : null}
    {/* пол */}
    <rect y={FL - 18} width={1080} height={18} fill="#F2EEE6" />
    <rect x={-300} y={FL} width={1680} height={900} fill={U.floor} />
    {new Array(6).fill(0).map((_, i) => (
      <rect key={i} y={FL + 30 + i * 60} width={1080} height={4} fill={U.floorDk} opacity={0.5} />
    ))}
    {/* кровать слева */}
    <g>
      <rect x={30} y={1130} width={56} height={FL - 1130} rx={10} fill={U.bedWood} />
      <rect x={30} y={1420} width={620} height={90} fill={U.bedWood} />
      <rect x={600} y={1300} width={44} height={FL - 1300} rx={8} fill={U.bedWood} />
      <rect x={86} y={1330} width={520} height={92} rx={14} fill="#EDE7DB" />
      <path d="M 300 1325 L 606 1325 L 612 1440 L 290 1440 Q 270 1380 300 1325 Z" fill={U.blanket} />
      <path d="M 300 1325 Q 270 1380 290 1440 L 330 1440 Q 310 1380 330 1325 Z" fill={U.blanketDk} />
      <ellipse cx={168} cy={1312} rx={90} ry={30} fill={U.pillow} />
    </g>
    {/* стол справа */}
    {desk ? (
      <g>
        <rect x={700} y={1250} width={370} height={22} rx={4} fill="#9C6438" />
        <rect x={716} y={1272} width={20} height={FL - 1272} fill="#7B4B28" />
        <rect x={1030} y={1272} width={20} height={FL - 1272} fill="#7B4B28" />
        <rect x={880} y={1272} width={170} height={120} fill="#86532E" />
        <rect x={950} y={1324} width={30} height={8} rx={4} fill="#3A2A1A" />
        {/* лампа */}
        <rect x={980} y={1236} width={70} height={14} rx={6} fill="#2B2B30" />
        <rect x={1010} y={1120} width={10} height={120} fill="#2B2B30" transform="rotate(14 1015 1240)" />
        <path d="M 960 1110 L 1040 1090 L 1050 1140 L 980 1160 Z" fill="#2B2B30" />
        {/* книги в целлофане */}
        <CellophaneBooks x={790} y={1250} s={0.42} />
      </g>
    ) : null}
    {night > 0 ? <rect width={1080} height={1920} fill="#060A22" opacity={0.62 * night} /> : null}
  </g>
);

// Стопка книг в целлофане (растёт вверх от y)
export const CellophaneBooks: React.FC<{ x: number; y: number; s: number; shine?: number }> = ({ x, y, s, shine = 0 }) => {
  const books = [
    { c: "#C0392B", t: "ТАРИХ", w: 300 },
    { c: "#2E6FB0", t: "МАТЕМАТИКА", w: 320 },
    { c: "#2F8A5B", t: "ОҚУ САУАТТЫЛЫҒЫ", w: 290 },
    { c: "#8A5AB0", t: "ФИЗИКА", w: 310 },
  ];
  let yy = 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {books.map((b, i) => {
        const h = 62;
        yy -= h;
        const off = (random(`bk${i}`) - 0.5) * 30;
        return (
          <g key={i} transform={`translate(${off} ${yy})`}>
            <rect x={-b.w / 2} y={0} width={b.w} height={h} rx={6} fill={b.c} />
            <rect x={-b.w / 2} y={h - 12} width={b.w} height={12} fill="#F2EEE6" />
            <T x={0} y={36} s={24} c="#FFFFFF">
              {b.t}
            </T>
          </g>
        );
      })}
      {/* целлофан */}
      <rect x={-180} y={yy - 10} width={360} height={-yy + 14} rx={16} fill="#DDF3FF" opacity={0.28} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${-150 + i * 70} ${yy} L ${-110 + i * 70 + shine * 20} ${-4}`} stroke="#FFFFFF" strokeWidth={6} opacity={0.35 + 0.4 * shine} strokeLinecap="round" />
      ))}
      <path d={`M -170 ${yy + 20} Q -120 ${yy + 60} -170 ${yy + 110}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.6} />
      <path d={`M 172 ${yy + 40} Q 130 ${yy + 90} 172 ${yy + 150}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.6} />
    </g>
  );
};

// Ерасыл лежит на кровати (rot −90: голова влево, грудь вверх) + телефон над лицом
export const LyingYerasyl: React.FC<{ s?: number; ph?: number; glow?: number; jolt?: number; kneeUp?: number; phone?: boolean }> = ({ s = 1, ph = 0, glow = 1, jolt = 0, kneeUp = 1, phone = true }) => {
  const fx = 612;
  const fy = 1330 - 44 * s - jolt * 50;
  const pose: Pose = { ...STAND, rot: -90, aFs: 70 + Math.sin(ph) * 2, aFe: 52, aBs: 64, aBe: 58, lBh: 38 * kneeUp, lBk: 70 * kneeUp, head: -6 };
  const hx = fx - 441 * s;
  const hy = fy - 183 * s;
  return (
    <g>
      <Person kind="teen" x={fx} y={fy} s={s} pose={pose} shadow={0} />
      {phone ? (
        <g transform={`translate(${hx} ${hy}) rotate(${12 + Math.sin(ph) * 2})`}>
          {/* свет от экрана на лицо */}
          <path d={`M -40 14 L 40 14 L 80 160 L -100 160 Z`} fill="#9FD3FF" opacity={0.22 * glow} filter="url(#blur8)" />
          <rect x={-46} y={-8} width={92} height={22} rx={6} fill={U.phone} />
          <rect x={-40} y={10} width={80} height={6} rx={3} fill="#A8DCFF" opacity={0.9 * glow} />
        </g>
      ) : null}
    </g>
  );
};

// Большой телефон в руке (крупно). Экран: x0=CX−SW/2, y0=CY−SH/2
export const PCX = 540;
export const PCY = 890;
export const PSW = 430;
export const PSH = 820;
export const BigPhone: React.FC<{ y?: number; rot?: number; s?: number; dark?: boolean; children: React.ReactNode }> = ({ y = 0, rot = 0, s = 1, dark = false, children }) => (
  <g transform={`translate(${PCX} ${PCY + y}) rotate(${rot}) scale(${s}) translate(${-PCX} ${-PCY})`}>
    <defs>
      <clipPath id="uScreen">
        <rect x={PCX - PSW / 2} y={PCY - PSH / 2} width={PSW} height={PSH} rx={40} />
      </clipPath>
    </defs>
    <rect x={PCX - PSW / 2 - 22 + 18} y={PCY - PSH / 2 - 22 + 24} width={PSW + 44} height={PSH + 44} rx={62} fill="#000" opacity={0.35} filter="url(#blur8)" />
    <rect x={PCX - PSW / 2 - 22} y={PCY - PSH / 2 - 22} width={PSW + 44} height={PSH + 44} rx={62} fill={U.phone} />
    <rect x={PCX - PSW / 2 - 22} y={PCY - PSH / 2 - 22} width={PSW + 44} height={PSH + 44} rx={62} fill="none" stroke="#3A3E4C" strokeWidth={4} />
    <g clipPath="url(#uScreen)">
      <rect x={PCX - PSW / 2} y={PCY - PSH / 2} width={PSW} height={PSH} fill={dark ? "#0D1018" : "#F2F3F7"} />
      <g transform={`translate(${PCX - PSW / 2} ${PCY - PSH / 2})`}>{children}</g>
    </g>
    <rect x={PCX - 50} y={PCY - PSH / 2 + 14} width={100} height={26} rx={13} fill="#000" />
    {/* рука снизу: ладонь и большой палец */}
    <path d={`M ${PCX - 250} 1420 Q ${PCX - 280} ${PCY + 260} ${PCX - 236} ${PCY + 200} L ${PCX - 200} ${PCY + 230} Q ${PCX - 200} ${PCY + 330} ${PCX - 150} 1420 Z`} fill="#D9A47E" />
    <path d={`M ${PCX + 236} ${PCY + 120} Q ${PCX + 290} ${PCY + 200} ${PCX + 270} 1420 L ${PCX + 150} 1420 Q ${PCX + 200} ${PCY + 320} ${PCX + 236} ${PCY + 120} Z`} fill="#CF9670" />
    <rect x={PCX + 214} y={PCY + 100} width={40} height={90} rx={20} fill="#D9A47E" />
  </g>
);

// Шапка чата с Аружан
export const ChatHeader: React.FC<{ dark?: boolean; typing?: number }> = ({ dark, typing = 0 }) => (
  <g>
    <rect width={PSW} height={130} fill={dark ? "#171B28" : "#FFFFFF"} />
    <circle cx={70} cy={84} r={32} fill="#F3C1D3" />
    <circle cx={70} cy={90} r={22} fill="#E8BC98" />
    <path d="M 46 84 Q 46 56 70 56 Q 94 56 94 84 Q 84 70 70 70 Q 56 70 46 84 Z" fill="#1E1410" />
    <path d="M 70 52 L 56 44 L 56 60 Z M 70 52 L 84 44 L 84 60 Z" fill="#FFFFFF" />
    <T x={120} y={82} s={30} a="start" c={dark ? "#FFFFFF" : "#141826"}>
      Аружан
    </T>
    <T x={120} y={112} s={20} w={700} a="start" c={typing > 0 ? "#2FB36B" : "#8A93A8"}>
      {typing > 0 ? "жазып жатыр..." : "желіде"}
    </T>
    <rect y={129} width={PSW} height={2} fill="#000" opacity={0.1} />
  </g>
);

// Пузырь сообщения. side: −1 — её (слева), 1 — его (справа)
export const Bubble: React.FC<{ y: number; side: 1 | -1; lines: string[]; k?: number; dark?: boolean; time?: string }> = ({ y, side, lines, k = 1, dark, time }) => {
  const w = Math.max(...lines.map((l) => l.length)) * 17 + 50;
  const h = lines.length * 40 + 30;
  const x = side < 0 ? 22 : PSW - 22 - w;
  const kk = cl(k);
  return (
    <g transform={`translate(${x + (side < 0 ? 0 : w)} ${y + h}) scale(${0.6 + 0.4 * kk}) translate(${-(side < 0 ? 0 : w)} ${-h})`} opacity={kk}>
      <rect width={w} height={h} rx={26} fill={side < 0 ? (dark ? "#2A3044" : "#FFFFFF") : "#3B7BF6"} />
      {lines.map((l, i) => (
        <T key={i} x={24} y={48 + i * 40} s={28} w={700} a="start" c={side < 0 ? (dark ? "#FFFFFF" : "#141826") : "#FFFFFF"}>
          {l}
        </T>
      ))}
      {time ? (
        <T x={w - 16} y={h + 26} s={18} w={700} a="end" c="#8A93A8">
          {time}
        </T>
      ) : null}
    </g>
  );
};

// Клавиатура телефона (нажатая клавиша подсвечивается)
export const Keyboard: React.FC<{ y: number; hit?: number; dark?: boolean }> = ({ y, hit = -1, dark }) => {
  const rows = [11, 11, 9];
  return (
    <g transform={`translate(0 ${y})`}>
      <rect width={PSW} height={280} fill={dark ? "#1C2030" : "#D5D8E0"} />
      {rows.map((n, r) =>
        new Array(n).fill(0).map((_, i) => {
          const kw = (PSW - 20) / 11;
          const x = 10 + (11 - n) * kw * 0.5 + i * kw;
          const idx = r * 11 + i;
          return <rect key={`${r}-${i}`} x={x + 2} y={14 + r * 62} width={kw - 4} height={52} rx={8} fill={idx === hit ? "#7FA7FF" : dark ? "#3A4058" : "#FFFFFF"} />;
        }),
      )}
      <rect x={90} y={204} width={250} height={52} rx={8} fill={dark ? "#3A4058" : "#FFFFFF"} />
    </g>
  );
};

// Поле ввода
export const InputBar: React.FC<{ y: number; text: string; caret?: boolean; dark?: boolean }> = ({ y, text, caret, dark }) => (
  <g transform={`translate(0 ${y})`}>
    <rect width={PSW} height={80} fill={dark ? "#171B28" : "#FFFFFF"} />
    <rect x={16} y={12} width={PSW - 100} height={56} rx={28} fill={dark ? "#262B3C" : "#EEF0F5"} />
    <T x={40} y={50} s={24} w={700} a="start" c={text ? (dark ? "#FFFFFF" : "#141826") : "#8A93A8"}>
      {(text || "Хабарлама...") + (caret ? "|" : "")}
    </T>
    <circle cx={PSW - 44} cy={40} r={28} fill="#3B7BF6" />
    <path d={`M ${PSW - 56} 28 L ${PSW - 28} 40 L ${PSW - 56} 52 L ${PSW - 50} 40 Z`} fill="#FFFFFF" />
  </g>
);

// Тикток-подобная игра на экране
export const GameScreen: React.FC<{ lf: number }> = ({ lf }) => {
  const jump = Math.abs(Math.sin(lf * 0.22)) * 120;
  return (
    <g>
      <rect width={PSW} height={PSH} fill="#6FC3FF" />
      <rect y={PSH - 220} width={PSW} height={220} fill="#3DB45A" />
      <rect y={PSH - 220} width={PSW} height={20} fill="#2C8E45" />
      {[0, 1, 2, 3].map((i) => {
        const x = ((i * 160 - lf * 9) % 640) + 640;
        return <rect key={i} x={(x % 640) - 80} y={PSH - 300 - (i % 2) * 90} width={110} height={36} rx={8} fill="#C9782F" />;
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = (((i * 110 - lf * 9) % 550) + 550) % 550;
        return <circle key={i} cx={x - 40} cy={PSH - 380 - (i % 3) * 40} r={16} fill={U.yellow} stroke="#C99A1A" strokeWidth={4} />;
      })}
      <g transform={`translate(150 ${PSH - 220 - jump})`}>
        <rect x={-30} y={-80} width={60} height={80} rx={14} fill={U.red} />
        <circle cx={0} cy={-104} r={28} fill="#F2C9A0" />
        <rect x={-30} y={-134} width={60} height={20} rx={8} fill={U.red} />
      </g>
      <rect x={16} y={60} width={150} height={50} rx={14} fill="#000" opacity={0.35} />
      <T x={90} y={95} s={28} c={U.yellow}>
        ★ {1240 + Math.floor(lf * 7)}
      </T>
      <rect x={PSW - 176} y={60} width={160} height={50} rx={14} fill="#000" opacity={0.35} />
      <T x={PSW - 96} y={95} s={26} c="#FFFFFF">
        LEVEL 47
      </T>
    </g>
  );
};

// Значок «будильник»
export const AlarmIcon: React.FC<{ x: number; y: number; s: number; shake?: number }> = ({ x, y, s, shake = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${shake * 10}) scale(${s})`}>
    <circle cx={-52} cy={-56} r={26} fill="#F2EEE6" />
    <circle cx={52} cy={-56} r={26} fill="#F2EEE6" />
    <circle r={76} fill="#F2EEE6" />
    <circle r={62} fill="#FFFFFF" />
    <rect x={-4} y={-46} width={8} height={48} rx={4} fill="#141826" />
    <rect x={-4} y={-4} width={8} height={40} rx={4} fill="#141826" transform="rotate(180)" />
    <circle r={8} fill="#141826" />
    <rect x={-40} y={66} width={14} height={26} rx={6} fill="#F2EEE6" transform="rotate(25 -33 66)" />
    <rect x={26} y={66} width={14} height={26} rx={6} fill="#F2EEE6" transform="rotate(-25 33 66)" />
  </g>
);

// Значок телефона в корзинке «маме»
export const PhoneIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-54} y={-96} width={108} height={192} rx={20} fill="#1A1C24" stroke="#F2EEE6" strokeWidth={8} />
    <rect x={-42} y={-78} width={84} height={150} rx={8} fill="#5A8CFF" />
    <path d="M -86 40 L 86 40 L 70 110 L -70 110 Z" fill="#C98A4A" />
    {[-50, -16, 18, 52].map((dx, i) => (
      <rect key={i} x={dx - 4} y={46} width={8} height={58} fill="#A06A34" />
    ))}
  </g>
);

// Сердечко
export const Heart: React.FC<{ x: number; y: number; s: number; c?: string; op?: number }> = ({ x, y, s, c = "#F2508A", op = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 30 C -50 -4 -34 -44 0 -20 C 34 -44 50 -4 0 30 Z" fill={c} opacity={op} />
);

// Облако пыли с глазами
export const DustCloud: React.FC<{ x: number; y: number; s: number; k: number; blink?: boolean }> = ({ x, y, s, k, blink }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.3 + 0.7 * k)})`} opacity={cl(k * 2)}>
    {[
      [-90, 10, 80],
      [0, -30, 100],
      [95, 5, 85],
      [-40, 60, 70],
      [50, 60, 75],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#BDB3A2" : "#CFC6B6"} />
    ))}
    {/* глаза */}
    <ellipse cx={-30} cy={-6} rx={14} ry={blink ? 2 : 18} fill="#FFFFFF" />
    <ellipse cx={34} cy={-6} rx={14} ry={blink ? 2 : 18} fill="#FFFFFF" />
    {!blink ? (
      <>
        <circle cx={-26} cy={-2} r={7} fill="#1A1410" />
        <circle cx={38} cy={-2} r={7} fill="#1A1410" />
      </>
    ) : null}
    <path d="M -50 -34 L -12 -26 M 54 -34 L 16 -26" stroke="#5A5246" strokeWidth={6} strokeLinecap="round" />
  </g>
);

// Штамп (красная печать)
export const Stamp: React.FC<{ x: number; y: number; k: number; text: string; s?: number; rot?: number; c?: string }> = ({ x, y, k, text, s = 1, rot = -12, c = U.red }) => {
  if (k <= 0) return null;
  const sc = 1 + 1.6 * Math.pow(1 - cl(k), 2);
  const w = text.length * 52 + 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sc})`} opacity={cl(k * 3)}>
      <rect x={-w / 2} y={-70} width={w} height={140} rx={18} fill="#FFF8EC" fillOpacity={0.88} stroke={c} strokeWidth={12} />
      <rect x={-w / 2 + 14} y={-56} width={w - 28} height={112} rx={10} fill="none" stroke={c} strokeWidth={4} />
      <T x={0} y={28} s={84} f="o" w={700} c={c}>
        {text}
      </T>
    </g>
  );
};

// Наклейка-стикер
export const Sticky: React.FC<{ x: number; y: number; k: number; text: string; rot?: number; c?: string; s?: number }> = ({ x, y, k, text, rot = 0, c = "#FFE066", s = 1 }) => {
  if (k <= 0) return null;
  const sc = 0.4 + 0.6 * Math.min(1.08, cl(k * 1.2));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sc})`} opacity={cl(k * 3)}>
      <rect x={-118} y={-78} width={236} height={156} fill="#000" opacity={0.22} transform="translate(8 10)" />
      <rect x={-118} y={-78} width={236} height={156} fill={c} />
      <rect x={-118} y={-78} width={236} height={26} fill="#000" opacity={0.06} />
      {text.split("\n").map((l, i, arr) => (
        <T key={i} x={0} y={18 + (i - (arr.length - 1) / 2) * 42} s={34} c="#2B2018">
          {l}
        </T>
      ))}
    </g>
  );
};

// Панельный дом во дворе
export const Yard: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="uYardSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7DB9E8" />
        <stop offset="1" stopColor="#D8EEF7" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#uYardSky)" />
    {/* дом */}
    <rect x={-40} y={300} width={1160} height={1100} fill="#D9D2C3" />
    {new Array(8).fill(0).map((_, r) =>
      new Array(7).fill(0).map((_, c) => (
        <g key={`${r}-${c}`}>
          <rect x={20 + c * 155} y={350 + r * 130} width={90} height={80} fill={random(`w${r}${c}`) > 0.7 ? "#F3D58A" : "#6E8BA6"} />
          <rect x={20 + c * 155} y={430 + r * 130} width={90} height={8} fill="#B8AFA0" />
          {random(`bal${r}${c}`) > 0.75 ? <rect x={10 + c * 155} y={410 + r * 130} width={110} height={34} fill="#C9C0AF" /> : null}
        </g>
      )),
    )}
    {new Array(8).fill(0).map((_, i) => (
      <rect key={i} x={-40} y={300 + i * 130 + 120} width={1160} height={3} fill="#B8AFA0" />
    ))}
    {/* подъезд */}
    <rect x={460} y={1210} width={160} height={190} fill="#6B4E3A" />
    <rect x={440} y={1190} width={200} height={22} fill="#9A938A" />
    {/* земля, деревья */}
    <rect x={-300} y={1400} width={1680} height={1200} fill="#9FBF6A" />
    <rect x={-300} y={1400} width={1680} height={24} fill="#8AA85A" />
    <rect x={-300} y={1560} width={1680} height={120} fill="#B9B2A6" />
    <g transform="translate(900 1400)">
      <rect x={-14} y={-260} width={28} height={260} fill="#6B4A2A" />
      <circle cx={0} cy={-300} r={120} fill="#5E9E48" />
      <circle cx={-70} cy={-240} r={80} fill="#6FB257" />
      <circle cx={70} cy={-230} r={84} fill="#4F8C3C" />
    </g>
  </g>
);

// Скамейка
export const Bench: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-170} width={400} height={18} rx={6} fill="#7B4B28" />
    <rect x={-200} y={-146} width={400} height={18} rx={6} fill="#86532E" />
    <rect x={-210} y={-124} width={420} height={22} rx={6} fill="#9C6438" />
    <rect x={-180} y={-102} width={16} height={102} fill="#3A3A40" />
    <rect x={164} y={-102} width={16} height={102} fill="#3A3A40" />
  </g>
);

// Кухня (вид сбоку)
export const Kitchen: React.FC = () => (
  <g>
    <rect width={1080} height={FL} fill="#E8D9B8" />
    {new Array(12).fill(0).map((_, r) =>
      new Array(9).fill(0).map((_, c) => (
        <rect key={`${r}-${c}`} x={c * 124 + (r % 2) * 62 - 40} y={1000 + r * 44} width={118} height={40} fill={(r + c) % 3 === 0 ? "#D6E6E2" : "#E6F0EE"} opacity={r < 6 ? 1 : 0} />
      )),
    )}
    {/* шкафчики */}
    <rect x={40} y={560} width={520} height={260} rx={10} fill="#3F7F6F" />
    <rect x={300} y={560} width={6} height={260} fill="#2C5E52" />
    <rect x={270} y={680} width={12} height={40} rx={6} fill="#E8D9B8" />
    <rect x={324} y={680} width={12} height={40} rx={6} fill="#E8D9B8" />
    {/* плита и кастрюля */}
    <rect x={60} y={1260} width={480} height={FL - 1260} fill="#F2EEE6" />
    <rect x={60} y={1240} width={480} height={26} fill="#C9C3B8" />
    <rect x={90} y={1300} width={420} height={200} rx={10} fill="#2B2B30" opacity={0.85} />
    <rect x={150} y={1150} width={200} height={92} rx={14} fill="#B0412E" />
    <rect x={136} y={1140} width={228} height={20} rx={8} fill="#8E2F20" />
    {/* окно */}
    <g transform="translate(680 560)">
      <rect x={-12} y={-12} width={304} height={344} fill="#F2EEE6" />
      <rect width={280} height={320} fill="#BFE0EF" />
      <rect x={136} width={8} height={320} fill="#F2EEE6" />
    </g>
    {/* дверь в коридор справа */}
    <rect x={930} y={900} width={150} height={FL - 900} fill="#8A5A3A" />
    <rect y={FL} width={1080} height={1920 - FL} fill="#B98A5A" />
    {new Array(5).fill(0).map((_, i) => (
      <rect key={i} x={i * 240 - (i % 2) * 120} y={FL} width={4} height={360} fill="#9A6E44" />
    ))}
  </g>
);

// Пар из кастрюли
export const Steam: React.FC<{ x: number; y: number; lf: number }> = ({ x, y, lf }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = ((lf + i * 20) % 60) / 60;
      return <circle key={i} cx={x + Math.sin(t * 6 + i) * 20 + (i - 1) * 40} cy={y - t * 220} r={20 + t * 30} fill="#FFFFFF" opacity={0.45 * (1 - t)} filter="url(#blur8)" />;
    })}
  </g>
);

// Шкаф (вид спереди), двери открываются
export const Wardrobe: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => {
  const dw = 210;
  const k = Math.cos(cl(open) * Math.PI * 0.46);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-dw - 20} y={-900} width={dw * 2 + 40} height={900} rx={10} fill="#6B4226" />
      <rect x={-dw} y={-880} width={dw * 2} height={860} fill="#2A1A10" />
      {/* полки с книгами внутри */}
      {[-640, -400, -160].map((sy, i) => (
        <g key={i}>
          <rect x={-dw} y={sy} width={dw * 2} height={14} fill="#4A2E18" />
          {new Array(9).fill(0).map((_, j) => (
            <rect key={j} x={-dw + 14 + j * 44} y={sy - 130 + (j % 3) * 8} width={36} height={130 - (j % 3) * 8} fill={["#C0392B", "#2E6FB0", "#2F8A5B", "#C9A23A", "#8A5AB0"][(i * 3 + j) % 5]} opacity={0.85} />
          ))}
        </g>
      ))}
      {/* паутина */}
      <path d={`M ${-dw} -880 L ${-dw + 90} -880 M ${-dw} -880 L ${-dw} -790 M ${-dw} -880 L ${-dw + 70} -810 M ${-dw + 40} -880 Q ${-dw + 30} -840 ${-dw} -830 M ${-dw + 76} -880 Q ${-dw + 56} -820 ${-dw} -800`} stroke="#E8E2D6" strokeWidth={3} fill="none" opacity={0.8} />
      {/* двери */}
      <g transform={`translate(${-dw} 0) scale(${k} 1)`}>
        <rect x={0} y={-880} width={dw} height={860} fill="#8A5A36" stroke="#5E3A20" strokeWidth={6} />
        <rect x={dw - 30} y={-480} width={12} height={70} rx={6} fill="#D9A441" />
      </g>
      <g transform={`translate(${dw} 0) scale(${-k} 1)`}>
        <rect x={0} y={-880} width={dw} height={860} fill="#8A5A36" stroke="#5E3A20" strokeWidth={6} />
        <rect x={dw - 30} y={-480} width={12} height={70} rx={6} fill="#D9A441" />
      </g>
    </g>
  );
};

// Учебник истории (вид спереди), раскрывается
export const HistoryBook: React.FC<{ x: number; y: number; s: number; open: number; shake?: number }> = ({ x, y, s, open, shake = 0 }) => {
  const k = Math.cos(cl(open) * Math.PI);
  const cover = (
    <g transform={`scale(${k} 1)`}>
      <rect x={0} y={-206} width={306} height={412} rx={8} fill={k > 0 ? "#B0412E" : "#8E2F20"} />
      {k > 0 ? (
        <g>
          <rect x={30} y={-170} width={246} height={6} fill="#F2D27A" />
          <T x={153} y={-90} s={40} c="#F2D27A">
            ҚАЗАҚСТАН
          </T>
          <T x={153} y={-40} s={40} c="#F2D27A">
            ТАРИХЫ
          </T>
          <circle cx={153} cy={70} r={60} fill="none" stroke="#F2D27A" strokeWidth={6} />
          <path d="M 153 20 L 166 58 L 205 58 L 174 82 L 186 120 L 153 96 L 120 120 L 132 82 L 101 58 L 140 58 Z" fill="#F2D27A" />
          <T x={153} y={180} s={26} c="#F2D27A">
            11-сынып
          </T>
        </g>
      ) : null}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${shake})`}>
      <rect x={-300} y={-200} width={600} height={400} fill="#000" opacity={0.25} transform="translate(14 18)" />
      {k <= 0 ? cover : null}
      <rect x={0} y={-200} width={300} height={400} fill="#F7F2E7" />
      {new Array(9).fill(0).map((_, i) => (
        <rect key={i} x={30} y={-160 + i * 38} width={220 - (i % 3) * 30} height={8} rx={4} fill="#9A8E78" opacity={0.6} />
      ))}
      {k <= 0 ? (
        <g opacity={cl(-k * 3)}>
          <rect x={-300} y={-200} width={300} height={400} fill="#F1EADA" />
          {new Array(9).fill(0).map((_, i) => (
            <rect key={i} x={-270} y={-160 + i * 38} width={220 - (i % 2) * 40} height={8} rx={4} fill="#9A8E78" opacity={0.6} />
          ))}
        </g>
      ) : null}
      <rect x={-3} y={-200} width={6} height={400} fill="#C9BFA8" />
      {k > 0 ? cover : null}
    </g>
  );
};

// Достижение в стиле игры
export const Achievement: React.FC<{ y: number; k: number; title: string; sub: string }> = ({ y, k, title, sub }) => {
  if (k <= 0) return null;
  const sl = cl(k * 1.4);
  return (
    <g transform={`translate(${540 + (1 - sl) * 900} ${y})`}>
      <rect x={-400} y={-80} width={800} height={160} rx={30} fill="#141826" opacity={0.92} stroke={U.yellow} strokeWidth={6} />
      <circle cx={-310} cy={0} r={52} fill={U.yellow} />
      <path d="M -336 -30 L -284 -30 L -288 4 Q -310 26 -332 4 Z" fill="#B88A10" />
      <rect x={-318} y={8} width={16} height={18} fill="#B88A10" />
      <rect x={-330} y={24} width={40} height={10} rx={4} fill="#B88A10" />
      <T x={-230} y={-14} s={30} a="start" c={U.yellow}>
        {title}
      </T>
      <T x={-230} y={36} s={34} a="start" c="#FFFFFF">
        {sub}
      </T>
    </g>
  );
};

// Просто линии-«крик» у рта
export const ShoutLines: React.FC<{ x: number; y: number; k: number; dir?: 1 | -1 }> = ({ x, y, k, dir = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={k}>
    {[-30, 0, 30].map((a, i) => (
      <rect key={i} x={20 + k * 20} y={-6} width={60 + k * 30} height={12} rx={6} fill="#FFFFFF" transform={`rotate(${a})`} stroke="#120C06" strokeWidth={3} />
    ))}
  </g>
);
