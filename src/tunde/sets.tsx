import React from "react";
import { random } from "remotion";
import { MONT } from "../qagaz/theme";
import { MONO } from "../deepfake/theme";
import { CAVEAT } from "../keyin/props";
import { N } from "./fx";

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- школа снаружи ночью ----------
const WIN_COLS = [150, 265, 380, 600, 715, 830];
const WIN_ROWS = [820, 1040]; // 2-й и 1-й этаж (верх окна)
export const SchoolExt: React.FC<{ f: number; lit: number; patrol?: number }> = ({ f, lit, patrol = -1 }) => (
  <g>
    <rect width={1080} height={1920} fill="url(#tn-skyG)" />
    {new Array(70).fill(0).map((_, i) => (
      <circle key={i} cx={random(`st${i}`) * 1080} cy={random(`sy${i}`) * 760} r={0.8 + random(`sr${i}`) * 1.8} fill="#DDE6FF" opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(f * 0.05 + i))} />
    ))}
    <circle cx={830} cy={400} r={190} fill={N.moon} opacity={0.12} filter="url(#tn-blur40)" />
    <circle cx={830} cy={400} r={66} fill={N.moon} />
    <circle cx={808} cy={388} r={14} fill="#B9C6E6" opacity={0.6} />
    <circle cx={850} cy={420} r={9} fill="#B9C6E6" opacity={0.5} />
    {/* дальние деревья */}
    <path d="M 0 1180 Q 120 1090 240 1150 Q 380 1060 520 1140 Q 700 1070 860 1150 Q 980 1100 1080 1140 L 1080 1500 L 0 1500 Z" fill="#0A1222" />
    {/* здание */}
    <rect x={70} y={700} width={940} height={800} fill={N.wall} />
    <rect x={70} y={700} width={940} height={40} fill={N.wallDk} />
    <rect x={70} y={985} width={940} height={14} fill={N.wallDk} />
    <rect x={70} y={1205} width={940} height={14} fill={N.wallDk} />
    {WIN_ROWS.map((wy, r) =>
      WIN_COLS.map((wx, c) => {
        const isLit = r === 0 && c === 4;
        const pk = patrol >= 0 && r === 1 ? cl(1 - Math.abs(patrol - c) * 1.6) : 0;
        return (
          <g key={`${r}-${c}`}>
            <rect x={wx - 6} y={wy - 6} width={102} height={142} fill={N.wallDk} />
            <rect x={wx} y={wy} width={90} height={130} fill="#0C1426" />
            <path d={`M ${wx} ${wy + 130} L ${wx} ${wy} L ${wx + 50} ${wy}`} stroke="#33466E" strokeWidth={3} fill="none" opacity={0.5} />
            {isLit && lit > 0 ? (
              <>
                <rect x={wx} y={wy} width={90} height={130} fill={N.warm} opacity={lit} />
                <rect x={wx - 40} y={wy - 40} width={170} height={210} fill={N.warm} opacity={0.25 * lit} filter="url(#blur20)" />
              </>
            ) : null}
            {pk > 0 ? <circle cx={wx + 45} cy={wy + 75} r={34} fill="#FFF0C8" opacity={0.9 * pk} filter="url(#blur8)" /> : null}
            <rect x={wx + 43} y={wy} width={4} height={130} fill={N.wallDk} />
            <rect x={wx} y={wy + 50} width={90} height={4} fill={N.wallDk} />
          </g>
        );
      }),
    )}
    {/* вход */}
    <rect x={440} y={1250} width={200} height={250} fill="#0A0F1C" />
    <rect x={420} y={1230} width={240} height={26} fill={N.wallHi} />
    <rect x={470} y={1270} width={60} height={230} fill="#101A30" />
    <rect x={550} y={1270} width={60} height={230} fill="#101A30" />
    <circle cx={540} cy={1215} r={10} fill="#E8F1FF" />
    <circle cx={540} cy={1215} r={70} fill="#BFD3FF" opacity={0.18} filter="url(#blur20)" />
    <text x={540} y={765} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} letterSpacing="0.3em" fill="#8EA0C4">
      № 17 МЕКТЕП
    </text>
    {/* земля в снегу */}
    <rect y={1500} width={1080} height={420} fill="#202B44" />
    <path d="M 0 1500 Q 300 1530 540 1510 Q 800 1490 1080 1520 L 1080 1920 L 0 1920 Z" fill="#26324F" />
    <polygon points="460,1500 620,1500 760,1920 320,1920" fill="#1A2238" />
    {/* ограда и деревья */}
    {new Array(28).fill(0).map((_, i) => (
      <rect key={i} x={i * 40} y={1560} width={8} height={120} fill="#070B15" />
    ))}
    <rect y={1585} width={1080} height={7} fill="#070B15" />
    <rect y={1650} width={1080} height={7} fill="#070B15" />
    {[60, 1010].map((tx, i) => (
      <g key={i} transform={`translate(${tx} 1720) scale(${i ? -1 : 1} 1)`}>
        <path d="M -14 0 L -8 -620 L 8 -620 L 14 0 Z" fill="#05080F" />
        <path d="M 0 -380 Q 90 -470 160 -560 M 0 -470 Q -70 -560 -120 -660 M 0 -560 Q 60 -660 80 -760 M 2 -300 Q -80 -350 -150 -360" stroke="#05080F" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
    ))}
  </g>
);

// ---------- актовый зал ----------
export const Hall: React.FC<{ f: number; clock: number }> = ({ f, clock }) => {
  const letters = ["5", "0", "", "Ж", "Ы", "Л"];
  const cols = ["#E94F5A", "#F2B632", "", "#3E9BD6", "#5DBB63", "#E07AC0"];
  return (
    <g>
      <rect width={1080} height={1920} fill="#0A0D17" />
      <rect y={300} width={1080} height={1000} fill="#3B2A24" />
      <ellipse cx={540} cy={820} rx={620} ry={520} fill="#FFC77A" opacity={0.28} filter="url(#tn-blur40)" />
      {/* гирлянда «50 ЖЫЛ» */}
      <path d="M 120 470 Q 540 600 960 470" stroke="#C9A06A" strokeWidth={4} fill="none" />
      {letters.map((l, i) =>
        l ? (
          <g key={i} transform={`translate(${200 + i * 136} ${505 + Math.sin((i / 5) * Math.PI) * 52}) rotate(${Math.sin(f * 0.05 + i) * 3})`}>
            {i === 5 ? null : (
              <>
                <rect x={-52} y={0} width={104} height={124} rx={8} fill={cols[i]} />
                <text x={0} y={98} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={96} fill="#FFFFFF">
                  {l}
                </text>
              </>
            )}
          </g>
        ) : null,
      )}
      {/* часы */}
      <g transform="translate(170 380)">
        <circle r={56} fill="#F4EEE2" stroke="#2A1C14" strokeWidth={7} />
        <rect x={-3} y={-40} width={6} height={42} fill="#2A1C14" transform={`rotate(${clock * 360})`} />
        <rect x={-4} y={-28} width={8} height={30} fill="#2A1C14" transform={`rotate(${270 + clock * 30})`} />
        <circle r={6} fill="#2A1C14" />
      </g>
      {/* занавес */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? "translate(1080 0) scale(-1 1)" : undefined}>
          <path d="M 0 250 L 230 250 Q 170 800 210 1300 L 0 1300 Z" fill="#6E121C" />
          {[30, 80, 130, 175].map((x, i) => (
            <path key={i} d={`M ${x} 250 Q ${x - 20 + i * 4} 800 ${x + 10} 1300`} stroke="#8E1F2B" strokeWidth={16} fill="none" opacity={0.8} />
          ))}
        </g>
      ))}
      <rect y={230} width={1080} height={70} fill="#5A0E16" />
      {/* сцена */}
      <rect y={1300} width={1080} height={150} fill="#7A4A26" />
      {new Array(8).fill(0).map((_, i) => (
        <rect key={i} x={i * 140} y={1300} width={3} height={150} fill="#4F2D14" opacity={0.6} />
      ))}
      <rect y={1450} width={1080} height={470} fill="#0B0A10" />
      <rect y={1450} width={1080} height={18} fill="#3B2412" />
      {/* стремянка */}
      <g stroke="#B9BEC8" strokeWidth={9} strokeLinecap="round">
        <line x1={760} y1={1300} x2={820} y2={880} />
        <line x1={880} y1={1300} x2={820} y2={880} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={772 + i * 9} y1={1210 - i * 95} x2={868 - i * 9} y2={1210 - i * 95} />
        ))}
      </g>
    </g>
  );
};
export const HallLetterL: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-52} y={-124} width={104} height={124} rx={8} fill="#E07AC0" />
    <text x={0} y={-26} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={96} fill="#FFFFFF">
      Л
    </text>
  </g>
);

// ---------- холл: главная дверь изнутри ----------
export const Lobby: React.FC<{ f: number; shake: number }> = ({ f, shake }) => (
  <g>
    <rect width={1080} height={1920} fill="#0D1220" />
    <rect y={1450} width={1080} height={470} fill="#111726" />
    {new Array(9).fill(0).map((_, i) => (
      <line key={i} x1={540 + (i - 4) * 70} y1={1450} x2={540 + (i - 4) * 260} y2={1920} stroke="#1E2538" strokeWidth={3} />
    ))}
    {[1530, 1640, 1790].map((y, i) => (
      <line key={i} x1={0} y1={y} x2={1080} y2={y} stroke="#1E2538" strokeWidth={3} />
    ))}
    <g transform={`translate(${shake} 0)`}>
      <rect x={210} y={480} width={660} height={980} fill="#070A12" />
      {[0, 1].map((i) => {
        const x = 236 + i * 310;
        return (
          <g key={i}>
            <rect x={x} y={506} width={298} height={944} fill="#2A2F3A" />
            <rect x={x + 26} y={536} width={246} height={600} fill="url(#tn-outside)" />
            <rect x={x + 26} y={1170} width={246} height={240} fill="#242934" />
            <rect x={i ? x + 18 : x + 254} y={1060} width={26} height={180} rx={10} fill="#8C93A2" />
          </g>
        );
      })}
      <rect x={530} y={1100} width={20} height={44} rx={4} fill="#C9A441" />
    </g>
    <defs>
      <linearGradient id="tn-outside" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A5A92" />
        <stop offset="1" stopColor="#152442" />
      </linearGradient>
    </defs>
  </g>
);
// стекло двери как маска (что видно снаружи)
export const LOBBY_GLASS = [
  { x: 262, y: 536, w: 246, h: 600 },
  { x: 572, y: 536, w: 246, h: 600 },
];

// ---------- доска: мел пишет сам ----------
export const Board: React.FC<{ f: number; write: number }> = ({ f, write }) => {
  const W0 = 160;
  const W1 = 920;
  const wx = lerp(W0, W1, write);
  const chalkY = 830 + Math.sin(write * 40) * 30;
  return (
    <g>
      <rect width={1080} height={1920} fill="#1A2233" />
      <rect y={1240} width={1080} height={680} fill="#141A28" />
      <rect x={90} y={500} width={900} height={620} fill="#3A2A1A" />
      <rect x={110} y={520} width={860} height={580} fill="#1C3A30" />
      {new Array(9).fill(0).map((_, i) => (
        <ellipse key={i} cx={150 + random(`sm${i}`) * 780} cy={560 + random(`smy${i}`) * 500} rx={60 + random(`smr${i}`) * 120} ry={20 + random(`smh${i}`) * 40} fill="#FFFFFF" opacity={0.035} />
      ))}
      <rect x={100} y={1100} width={880} height={24} fill="#4A3622" />
      <clipPath id="tn-chalkclip">
        <rect x={0} y={500} width={wx} height={620} />
      </clipPath>
      <text x={540} y={880} textAnchor="middle" fontFamily={CAVEAT} fontWeight={700} fontSize={176} fill="#EEF4EE" clipPath="url(#tn-chalkclip)" opacity={0.92} letterSpacing="0.02em">
        ОТЫРЫҢДАР
      </text>
      {write > 0 && write < 1 ? (
        <g>
          <g transform={`translate(${wx} ${chalkY}) rotate(-38)`}>
            <rect x={-8} y={-50} width={16} height={60} rx={4} fill="#F4F6F0" />
          </g>
          {[0, 1, 2, 3, 4].map((i) => {
            const t = ((f * 0.07 + i * 0.2) % 1 + 1) % 1;
            return <circle key={i} cx={wx + (random(`cd${i}`) - 0.5) * 30} cy={chalkY + t * 260} r={3} fill="#F4F6F0" opacity={0.6 * (1 - t)} />;
          })}
        </g>
      ) : null}
      {/* лунные полосы из окон */}
      {[0, 1].map((i) => (
        <polygon key={i} points={`${-200 + i * 380},380 ${-20 + i * 380},380 ${380 + i * 380},1240 ${200 + i * 380},1240`} fill="#AFC6FF" opacity={0.05} />
      ))}
    </g>
  );
};

// ---------- лестница сбоку ----------
export const Stairs: React.FC<{ f: number }> = () => (
  <g>
    <rect width={1080} height={1920} fill="#111829" />
    <rect x={700} y={360} width={200} height={300} fill="#22345A" />
    <rect x={700} y={360} width={200} height={300} fill="#9DB6EE" opacity={0.18} />
    <rect x={796} y={360} width={8} height={300} fill="#111829" />
    <polygon points="700,660 900,660 1080,1300 640,1300" fill="#9DB6EE" opacity={0.05} />
    {new Array(10).fill(0).map((_, i) => {
      const x = 330 + i * 80;
      const y = 1450 - (i + 1) * 62;
      return (
        <g key={i}>
          <rect x={x} y={y} width={1080 - x} height={62} fill={i % 2 ? "#1C2538" : "#1A2234"} />
          <rect x={x} y={y} width={1080 - x} height={6} fill="#2A3550" />
        </g>
      );
    })}
    <line x1={330} y1={1180} x2={1080} y2={600} stroke="#3A4560" strokeWidth={10} />
    {new Array(10).fill(0).map((_, i) => (
      <line key={i} x1={370 + i * 80} y1={1450 - (i + 1) * 62} x2={370 + i * 80} y2={1150 - i * 62} stroke="#2E3850" strokeWidth={5} />
    ))}
    <rect y={1450} width={1080} height={470} fill="#0E1422" />
  </g>
);

// ---------- потолок снизу: лампа качается, пыль ----------
export const Ceiling: React.FC<{ f: number; hits: number[] }> = ({ f, hits }) => {
  let swing = 0;
  for (const h of hits) if (f >= h) swing += Math.exp(-(f - h) / 26) * Math.sin((f - h) * 0.22) * 9;
  return (
    <g>
      <rect width={1080} height={1920} fill="#151B2A" />
      {new Array(6).fill(0).map((_, i) => (
        <line key={i} x1={0} y1={200 + i * 300} x2={1080} y2={150 + i * 300} stroke="#1F2738" strokeWidth={4} />
      ))}
      <path d="M 120 300 L 260 420 L 240 560 L 380 700 M 700 1200 L 820 1100 L 900 1180" stroke="#0A0E18" strokeWidth={4} fill="none" />
      <g transform={`rotate(${swing} 540 0)`}>
        <line x1={540} y1={0} x2={540} y2={760} stroke="#0C0F18" strokeWidth={6} />
        <path d="M 440 760 L 640 760 L 600 880 L 480 880 Z" fill="#2A3142" />
        <ellipse cx={540} cy={880} rx={60} ry={14} fill="#7D8597" />
      </g>
      {hits.map((h, i) =>
        f >= h
          ? new Array(14).fill(0).map((_, k) => {
              const t = (f - h) / 30;
              const x0 = 200 + random(`dx${i}-${k}`) * 680;
              const y = 120 + random(`dy${i}-${k}`) * 300 + t * t * 900 + t * 160;
              if (y > 1950) return null;
              return <circle key={`${i}-${k}`} cx={x0 + Math.sin(t * 3 + k) * 12} cy={y} r={2 + random(`dr${i}-${k}`) * 3.5} fill="#C9CFDB" opacity={0.7 * cl(1 - t / 2.2)} />;
            })
          : null,
      )}
    </g>
  );
};

// ---------- пролёт вверх: пусто ----------
export const StairsUp: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={1080} height={1920} fill="#05070D" />
    {new Array(14).fill(0).map((_, i) => {
      const k = i / 14;
      const w = lerp(1300, 260, Math.pow(k, 0.7));
      const y = lerp(1920, 560, Math.pow(k, 0.8));
      return <rect key={i} x={540 - w / 2} y={y} width={w} height={lerp(70, 10, k)} fill={i % 2 ? "#141B2B" : "#111726"} opacity={1 - k * 0.6} />;
    })}
    <rect x={420} y={330} width={240} height={230} fill="#000" />
    <rect x={420} y={330} width={240} height={230} fill="none" stroke="#1C2436" strokeWidth={8} />
    <polygon points="200,1920 430,560 446,560 260,1920" fill="#232C42" />
    <polygon points="880,1920 650,560 634,560 820,1920" fill="#232C42" />
    <ellipse cx={540} cy={1200} rx={520} ry={300} fill="#9DB6EE" opacity={0.04 + 0.01 * Math.sin(f * 0.1)} filter="url(#tn-blur40)" />
  </g>
);

// ---------- класс снизу: под партами ----------
export const UnderDesks: React.FC<{ f: number }> = () => (
  <g>
    <rect width={1080} height={1920} fill="#0E1322" />
    {[0, 1].map((i) => (
      <polygon key={i} points={`${150 + i * 420},1500 ${400 + i * 420},1500 ${520 + i * 420},1920 ${210 + i * 420},1920`} fill="#9DB6EE" opacity={0.07} />
    ))}
    <rect y={1500} width={1080} height={420} fill="#121828" />
    <rect y={1500} width={1080} height={420} fill="#000" opacity={0.25} />
  </g>
);
export const DeskFront: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-40} width={520} height={46} fill="#2A1C14" />
    <rect x={-260} y={-60} width={520} height={22} fill="#3C281A" />
    <rect x={-240} y={6} width={22} height={560} fill="#1B120C" />
    <rect x={218} y={6} width={22} height={560} fill="#1B120C" />
    <rect x={-240} y={300} width={480} height={14} fill="#1B120C" />
  </g>
);

// ---------- дверь класса крупно: ручка ----------
export const HandleDoor: React.FC<{ f: number; turn: number; light: number }> = ({ f, turn, light }) => (
  <g>
    <rect width={1080} height={1920} fill="#2A1D14" />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={i * 95} y={0} width={4} height={1920} fill="#1E140D" opacity={0.6} />
    ))}
    <rect x={120} y={260} width={840} height={560} rx={10} fill="none" stroke="#1E140D" strokeWidth={10} />
    <rect x={0} y={1600} width={1080} height={320} fill="#0A0806" />
    <rect x={0} y={1590} width={1080} height={14} fill={N.beam} opacity={0.6 * light * (0.85 + 0.15 * Math.sin(f * 0.5))} />
    <ellipse cx={540 + Math.sin(f * 0.08) * 200} cy={1600} rx={260} ry={30} fill={N.beam} opacity={0.5 * light} filter="url(#blur20)" />
    <g transform={`translate(620 1000)`}>
      <rect x={-70} y={-110} width={140} height={260} rx={22} fill="#7E848F" />
      <rect x={-56} y={-96} width={112} height={232} rx={16} fill="#9AA1AD" />
      <circle cx={0} cy={90} r={16} fill="#2A2F38" />
      <g transform={`rotate(${-turn * 38})`}>
        <circle r={44} fill="#B9C0CC" />
        <rect x={-330} y={-24} width={340} height={48} rx={24} fill="#C9CFDA" />
        <rect x={-330} y={-24} width={340} height={14} rx={7} fill="#EEF2F8" opacity={0.6} />
      </g>
    </g>
  </g>
);

// ---------- фонарь (старый, металлический, с красной полоской) ----------
export const Flashlight: React.FC<{ x: number; y: number; rot?: number; s?: number; on?: number }> = ({ x, y, rot = 0, s = 1, on = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-30} width={210} height={60} rx={14} fill="#5E646E" />
    <rect x={-150} y={-30} width={210} height={18} rx={9} fill="#9BA2AE" opacity={0.7} />
    <rect x={-60} y={-31} width={26} height={62} fill="#C0392B" />
    <rect x={-120} y={-40} width={30} height={14} rx={4} fill="#2E3238" />
    <path d="M 60 -30 L 120 -52 L 120 52 L 60 30 Z" fill="#6E7580" />
    <rect x={116} y={-54} width={18} height={108} rx={6} fill="#8C939E" />
    <ellipse cx={134} cy={0} rx={8} ry={46} fill={on > 0 ? "#FFF8DC" : "#B8C2CE"} />
    {on > 0 ? <circle cx={140} cy={0} r={70} fill="#FFF4D0" opacity={0.75 * on} filter="url(#blur20)" /> : null}
  </g>
);

// ---------- задняя дверь снаружи ----------
export const BackDoor: React.FC<{ f: number; open: number }> = ({ open }) => (
  <g>
    <rect width={1080} height={1920} fill="url(#tn-skyG)" />
    <rect x={0} y={200} width={760} height={1300} fill={N.wall} />
    <rect x={0} y={200} width={760} height={30} fill={N.wallDk} />
    {[0, 1].map((r) =>
      [0, 1].map((c) => <rect key={`${r}${c}`} x={80 + c * 330} y={330 + r * 330} width={150} height={200} fill="#0C1426" stroke={N.wallDk} strokeWidth={10} />),
    )}
    <rect x={360} y={1000} width={250} height={500} fill="#0A0806" />
    <rect x={360} y={1000} width={250 * open} height={500} fill={N.warm} />
    <rect x={360} y={1000} width={250 * open} height={500} fill="#FFE2A8" opacity={0.4} />
    <polygon points={`360,1500 ${360 + 250 * open},1500 ${520 + 420 * open},1920 ${200},1920`} fill={N.warm} opacity={0.22 * open} />
    <rect x={330} y={970} width={310} height={30} fill={N.wallHi} />
    <rect y={1500} width={1080} height={420} fill="#26324F" />
    <rect x={320} y={1500} width={330} height={36} fill="#3A4562" />
    <rect x={300} y={1536} width={370} height={36} fill="#34405C" />
  </g>
);

// ---------- утро: учительская ----------
export const TeacherRoom: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#EAD8B4" />
    <rect y={0} width={1080} height={200} fill="#D6BF92" />
    <rect x={620} y={360} width={360} height={520} fill="#E3CFA0" />
    <rect x={640} y={380} width={320} height={480} fill="#FFF1CF" />
    <rect x={796} y={380} width={8} height={480} fill="#E3CFA0" />
    <ellipse cx={780} cy={620} rx={420} ry={360} fill="#FFF1CF" opacity={0.45} filter="url(#blur20)" />
    <rect x={90} y={420} width={300} height={360} fill="#8A5A3A" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={110 + c * 70} y={440 + r * 112} width={52} height={92} fill={["#C0392B", "#2E6FB0", "#5DBB63", "#F2B632"][(r + c) % 4]} />),
    )}
    <rect y={900} width={1080} height={180} fill="#2F6B66" />
    <rect y={890} width={1080} height={12} fill="#1B3F3C" />
    <rect y={1080} width={1080} height={840} fill="url(#floorG)" />
  </g>
);
export const TeacherDesk: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-210} y={1215} width={420} height={36} fill="#9C6438" />
    <rect x={-190} y={1251} width={380} height={200} fill="#7B4B28" />
    <rect x={-120} y={1180} width={110} height={36} rx={3} fill="#F7F2E7" />
    <rect x={20} y={1150} width={70} height={66} rx={8} fill="#2E6FB0" />
  </g>
);

// ---------- фото памяти с чёрной лентой ----------
export const Memorial: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect width={1080} height={1920} fill="#E7D2A9" />
    <rect y={1130} width={1080} height={790} fill="url(#tealG)" />
    <rect y={1118} width={1080} height={16} fill="#1B3F3C" />
    <rect x={190} y={300} width={700} height={900} fill="#3A2412" />
    <rect x={220} y={330} width={640} height={840} fill="#C9C2B4" />
    <rect x={220} y={330} width={640} height={840} fill="#8C8577" opacity={0.25} />
    <clipPath id="tn-photo">
      <rect x={220} y={330} width={640} height={840} />
    </clipPath>
    <g clipPath="url(#tn-photo)" filter="url(#tn-sepia)">
      {children}
    </g>
    <polygon points="760,300 890,300 890,430 760,300" fill="#111" />
    <polygon points="690,300 760,300 890,430 890,500" fill="#111" />
    <rect x={300} y={1230} width={480} height={160} rx={10} fill="#C9A441" />
    <text x={540} y={1290} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={44} fill="#3A2412">
      СӘКЕН АТА
    </text>
    <text x={540} y={1336} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill="#3A2412" letterSpacing="0.08em">
      МЕКТЕП КҮЗЕТШІСІ
    </text>
    <text x={540} y={1374} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill="#3A2412">
      1979 — 2016
    </text>
    <defs>
      <filter id="tn-sepia" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </g>
);
