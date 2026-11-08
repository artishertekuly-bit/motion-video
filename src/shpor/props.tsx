import React from "react";
import { random } from "remotion";
import { P } from "../qagaz2/art";

export const N = {
  night: "#141A2C",
  nightHi: "#232C48",
  moon: "#F4E9C8",
  board: "#24443A",
  wood: "#7A4A27",
  woodHi: "#9C6438",
  woodDk: "#4C2D17",
  red: "#B0412E",
  ink: "#2B3550",
};

// Крошечные строки текста (шпаргалка)
export const TinyLines: React.FC<{ x: number; y: number; w: number; h: number; rows: number; color?: string; seed?: string; reveal?: number }> = ({ x, y, w, h, rows, color = "#55627E", seed = "t", reveal = 1 }) => (
  <g>
    {new Array(rows).fill(0).map((_, i) => {
      const k = Math.max(0, Math.min(1, reveal * rows - i));
      const lw = (w - 6) * (0.55 + random(`${seed}${i}`) * 0.45) * k;
      return <rect key={i} x={x + 3} y={y + 4 + (i * (h - 8)) / rows} width={lw} height={Math.max(1.2, (h / rows) * 0.38)} rx={0.8} fill={color} opacity={0.8} />;
    })}
  </g>
);

// Лента-шпаргалка
export const Strip: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; reveal?: number; seed?: string; aged?: boolean }> = ({ x, y, w, h, rot = 0, reveal = 1, seed = "s", aged }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} fill="#000" opacity={0.2} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill={aged ? "#E8D3A0" : P.paper} stroke={aged ? "#B89A60" : P.paperDk} strokeWidth={1.5} />
    <TinyLines x={-w / 2} y={-h / 2} w={w} h={h} rows={Math.max(3, Math.round(h / 9))} reveal={reveal} seed={seed} color={aged ? "#7A6040" : "#55627E"} />
  </g>
);

// ---------- ночь: комната, лампа, часы ----------
export const WallClock: React.FC<{ x: number; y: number; r: number; min: number; sec?: number; face?: string }> = ({ x, y, r, min, sec, face = "#F3EAD6" }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 10} fill="#3A2A1A" />
    <circle r={r} fill={face} />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={-3} y={-r + 6} width={6} height={i % 3 === 0 ? 18 : 10} fill="#2B2018" transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-5} y={-r * 0.5} width={10} height={r * 0.55} rx={4} fill="#2B2018" transform={`rotate(${(min / 60) * 30 + 330})`} />
    <rect x={-3.5} y={-r * 0.8} width={7} height={r * 0.85} rx={3} fill="#2B2018" transform={`rotate(${min * 6})`} />
    {sec !== undefined ? <rect x={-1.5} y={-r * 0.88} width={3} height={r * 1.05} fill={N.red} transform={`rotate(${sec * 6})`} /> : null}
    <circle r={8} fill="#2B2018" />
  </g>
);

export const NightRoom: React.FC<{ min: number }> = ({ min }) => (
  <g>
    <rect width={1080} height={1920} fill={N.night} />
    <rect width={1080} height={1350} fill="url(#nightWall)" />
    <defs>
      <linearGradient id="nightWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#10142A" />
        <stop offset="1" stopColor={N.nightHi} />
      </linearGradient>
    </defs>
    {/* окно с луной */}
    <rect x={70} y={250} width={360} height={520} rx={8} fill="#2A3150" />
    <rect x={90} y={270} width={320} height={480} fill="#0B1024" />
    {new Array(22).fill(0).map((_, i) => (
      <circle key={i} cx={100 + random(`st${i}`) * 300} cy={280 + random(`sy${i}`) * 460} r={1.5 + random(`sr${i}`) * 2.5} fill="#FFFFFF" opacity={0.5 + random(`so${i}`) * 0.5} />
    ))}
    <circle cx={320} cy={380} r={52} fill={N.moon} />
    <circle cx={340} cy={366} r={46} fill="#0B1024" opacity={0.9} />
    <rect x={246} y={270} width={8} height={480} fill="#2A3150" />
    <rect x={90} y={506} width={320} height={8} fill="#2A3150" />
    <WallClock x={830} y={420} r={92} min={min} />
  </g>
);

// стол с лампой — рисуется поверх ученика
export const NightDesk: React.FC<{ lamp?: number }> = ({ lamp = 1 }) => (
  <g>
    <defs>
      <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE4A8" stopOpacity="0.75" />
        <stop offset="1" stopColor="#FFD58A" stopOpacity="0.08" />
      </linearGradient>
    </defs>
    <rect x={-40} y={1330} width={1160} height={34} fill={N.woodHi} />
    <rect x={-40} y={1364} width={1160} height={1300} fill={N.woodDk} />
    <Strip x={300} y={1318} w={260} h={22} rot={-4} seed="d1" />
    <Strip x={520} y={1322} w={200} h={18} rot={6} seed="d2" />
    <Strip x={150} y={1324} w={180} h={16} rot={-10} seed="d3" />
    {/* лампа */}
    <g opacity={1}>
      <polygon points={`740,1010 600,1330 1000,1330 820,1010`} fill="url(#lampCone)" opacity={0.7 * lamp} />
      <ellipse cx={800} cy={1332} rx={240} ry={26} fill="#FFE4A8" opacity={0.55 * lamp} />
      <ellipse cx={900} cy={1330} rx={70} ry={14} fill="#2E2E34" />
      <path d="M 900 1326 L 880 1150 L 790 1030" stroke="#2E2E34" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 720 1000 L 840 1000 L 820 1050 L 740 1050 Z" fill="#3A3A42" transform="rotate(-8 780 1025)" />
    </g>
    <ellipse cx={540} cy={900} rx={700} ry={600} fill="#FFD58A" opacity={0.06 * lamp} filter="url(#blur20)" />
  </g>
);

// ---------- класс сбоку ----------
export const ClassSide: React.FC<{ door?: number; evening?: number; board?: boolean }> = ({ door = 0, evening = 0, board = true }) => (
  <g>
    <rect width={1080} height={1450} fill="url(#wallG)" />
    <rect y={0} width={1080} height={200} fill="#C3A574" />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={430 + i * 330} y={320} width={250} height={620} fill="#E3CFA0" />
        <rect x={446 + i * 330} y={336} width={218} height={588} fill={evening > 0 ? "#FFC27A" : P.sunHi} />
        <rect x={551 + i * 330} y={336} width={8} height={588} fill="#E3CFA0" />
        <rect x={446 + i * 330} y={600} width={218} height={8} fill="#E3CFA0" />
      </g>
    ))}
    <ellipse cx={720} cy={620} rx={520} ry={420} fill={evening > 0 ? "#FF9E4A" : P.sunHi} opacity={0.3 + evening * 0.15} filter="url(#blur20)" />
    {board ? (
      <g>
        <rect x={-60} y={420} width={300} height={430} fill="#5A3A1E" />
        <rect x={-44} y={436} width={268} height={398} fill={N.board} />
        <path d="M 20 520 Q 80 500 140 530 M 10 600 L 180 600 M 30 680 Q 90 650 170 690" stroke="#E8F0E6" strokeWidth={5} fill="none" opacity={0.6} />
      </g>
    ) : null}
    {/* дверь слева у доски */}
    <g>
      <rect x={250} y={830} width={160} height={620} fill="#3A2412" />
      <rect x={262} y={842} width={136} height={608} fill={door > 0 ? "#FFF0CC" : "#2A1A10"} />
      <rect x={262} y={842} width={136 * (1 - door * 0.85)} height={608} fill={P.wood} />
      <circle cx={262 + 136 * (1 - door * 0.85) - 18} cy={1160} r={8} fill={P.brass} />
      {door > 0 ? <ellipse cx={330} cy={1200} rx={220} ry={360} fill="#FFF0CC" opacity={0.35 * door} filter="url(#blur20)" /> : null}
    </g>
    <rect y={1130} width={1080} height={320} fill="url(#tealG)" />
    <rect x={250} y={1130} width={160} height={320} fill={door > 0 ? "#FFF0CC" : "#2A1A10"} />
    <rect x={262} y={1130} width={136 * (1 - door * 0.85)} height={320} fill={P.wood} />
    <rect y={1118} width={1080} height={14} fill={P.rail} />
    <rect y={1450} width={1080} height={1200} fill="url(#floorG)" />
    {evening > 0 ? <rect width={1080} height={1920} fill="#FF8A3A" opacity={0.12 * evening} style={{ mixBlendMode: "multiply" }} /> : null}
  </g>
);

// Парта и стул сбоку (ученик смотрит влево — на доску)
export const DeskChair: React.FC<{ x: number; floor: number; s: number; items?: React.ReactNode; face?: 1 | -1 }> = ({ x, floor, s, items, face = -1 }) => {
  const dx = face * 230 * s; // парта перед учеником
  return (
    <g>
      {/* стул */}
      <rect x={x - 44 * s} y={floor - 132 * s} width={110 * s} height={14 * s} rx={4} fill={N.woodDk} />
      <rect x={x + (face < 0 ? 52 : -66) * s} y={floor - 330 * s} width={14 * s} height={200 * s} fill={N.woodDk} />
      <rect x={x - 40 * s} y={floor - 120 * s} width={10 * s} height={120 * s} fill="#2B2B30" />
      <rect x={x + 50 * s} y={floor - 120 * s} width={10 * s} height={120 * s} fill="#2B2B30" />
      {/* парта */}
      <g transform={`translate(${x + dx} 0)`}>
        <rect x={-170 * s} y={floor - 262 * s} width={340 * s} height={22 * s} rx={4} fill={N.woodHi} />
        <rect x={-150 * s} y={floor - 240 * s} width={300 * s} height={60 * s} fill={N.wood} />
        <rect x={-150 * s} y={floor - 180 * s} width={12 * s} height={180 * s} fill="#2B2B30" />
        <rect x={138 * s} y={floor - 180 * s} width={12 * s} height={180 * s} fill="#2B2B30" />
        <g transform={`translate(0 ${floor - 262 * s}) scale(${s})`}>{items}</g>
      </g>
    </g>
  );
};

// ---------- предметы крупно ----------
export const DeskTop: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill={N.wood} />
    {new Array(14).fill(0).map((_, i) => (
      <path key={i} d={`M -20 ${i * 150 + 40} Q 540 ${i * 150 + 40 + (random(`g${i}`) - 0.5) * 60} 1100 ${i * 150 + 40}`} stroke={N.woodDk} strokeWidth={3} fill="none" opacity={0.35} />
    ))}
    <ellipse cx={540} cy={900} rx={640} ry={760} fill="#FFE4A8" opacity={0.22} filter="url(#blur20)" />
  </g>
);

export const Burst: React.FC<{ x: number; y: number; k: number; color?: string }> = ({ x, y, k, color = P.sunHi }) => (
  <g transform={`translate(${x} ${y})`} opacity={1 - k}>
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={-6} y={-140 - k * 160} width={12} height={60} rx={6} fill={color} transform={`rotate(${i * 30})`} />
    ))}
  </g>
);

export const BigPen: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(540 900) rotate(-32) scale(${0.6 + 0.4 * k})`}>
    <rect x={-60} y={-460} width={120} height={880} rx={50} fill="#000" opacity={0.2} transform="translate(20 24)" />
    <rect x={-60} y={-460} width={120} height={880} rx={50} fill="#DDEFFF" fillOpacity={0.45} stroke="#9FC3E6" strokeWidth={6} />
    {/* свёрнутая шпаргалка внутри */}
    <rect x={-36} y={-380} width={72} height={700} rx={10} fill={P.paper} />
    <TinyLines x={-36} y={-380} w={72} h={700} rows={60} seed="pen" />
    <rect x={-60} y={-560} width={120} height={150} rx={40} fill="#2E5FA8" />
    <rect x={44} y={-560} width={20} height={300} rx={8} fill="#2E5FA8" />
    <path d="M -50 420 L 50 420 L 12 560 L -12 560 Z" fill="#C9D6E4" />
    <rect x={-60} y={-440} width={30} height={840} rx={14} fill="#FFFFFF" opacity={0.35} />
  </g>
);

export const BigBottle: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(540 960) scale(${0.6 + 0.4 * k})`}>
    <ellipse cx={20} cy={560} rx={240} ry={40} fill="#000" opacity={0.25} />
    <path d="M -90 -380 L 90 -380 L 110 -300 Q 220 -240 220 -120 L 220 480 Q 220 560 140 560 L -140 560 Q -220 560 -220 480 L -220 -120 Q -220 -240 -110 -300 Z" fill="#CFE9F7" fillOpacity={0.55} stroke="#8FC0DC" strokeWidth={6} />
    <path d="M -210 -40 L 210 -40 L 210 470 Q 210 545 140 548 L -140 548 Q -210 545 -210 470 Z" fill="#7FC4E8" opacity={0.55} />
    <rect x={-100} y={-470} width={200} height={100} rx={16} fill="#2E5FA8" />
    {/* этикетка со шпаргалкой */}
    <rect x={-222} y={20} width={444} height={300} fill="#F2F7FA" />
    <rect x={-222} y={20} width={444} height={56} fill="#2E86C1" />
    <TinyLines x={-200} y={90} w={400} h={220} rows={20} seed="btl" color="#3A4766" />
    <path d="M 160 20 L 222 20 L 222 90 Z" fill="#DCE6EC" />
    <rect x={-200} y={-260} width={36} height={700} rx={18} fill="#FFFFFF" opacity={0.3} />
  </g>
);

export const BigWatch: React.FC<{ k: number }> = ({ k }) => (
  <g transform={`translate(540 960) rotate(-12) scale(${0.6 + 0.4 * k})`}>
    <rect x={-640} y={-150} width={1280} height={300} rx={150} fill="#E0AE86" />
    <rect x={-640} y={-150} width={1280} height={90} rx={45} fill="#EBC09C" opacity={0.6} />
    <rect x={-90} y={-170} width={180} height={340} fill="#1E1E24" />
    {/* записка под ремешком */}
    <g transform="translate(110 -30) rotate(8)">
      <rect x={0} y={-70} width={230} height={140} fill={P.paper} stroke={P.paperDk} strokeWidth={3} />
      <TinyLines x={6} y={-64} w={220} h={128} rows={12} seed="wt" />
    </g>
    <rect x={-120} y={-200} width={60} height={400} fill="#1E1E24" />
    <circle r={160} fill="#2B2B33" />
    <circle r={140} fill="#F4F1EA" />
    <rect x={-5} y={-110} width={10} height={115} rx={4} fill="#2B2018" transform="rotate(20)" />
    <rect x={-4} y={-80} width={8} height={85} rx={4} fill="#2B2018" transform="rotate(130)" />
    <circle r={10} fill={N.red} />
  </g>
);

export const BigSole: React.FC<{ k: number; erase?: number }> = ({ k, erase = 0 }) => (
  <g transform={`translate(540 960) rotate(8) scale(${0.6 + 0.4 * k})`}>
    <path d="M -160 -600 Q 120 -640 170 -420 Q 210 -200 150 40 Q 120 200 150 380 Q 170 600 0 620 Q -170 620 -170 420 Q -170 200 -200 0 Q -260 -380 -160 -600 Z" fill="#3B3B42" />
    <path d="M -140 -560 Q 100 -600 140 -410 Q 180 -200 125 30 Q 95 200 125 370 Q 140 570 0 585 Q -140 585 -142 410 Q -142 200 -170 0 Q -220 -360 -140 -560 Z" fill="#55555E" />
    {new Array(9).fill(0).map((_, i) => (
      <rect key={i} x={-130} y={-480 + i * 120} width={250} height={14} rx={7} fill="#47474F" />
    ))}
    {/* надпись на подошве */}
    <g opacity={1 - erase}>
      <TinyLines x={-120} y={-420} w={240} h={420} rows={16} color="#F4F1EA" seed="sole" />
    </g>
  </g>
);

export const Phone: React.FC<{ x: number; y: number; s?: number; k?: number }> = ({ x, y, s = 1, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * k)})`} opacity={k}>
    <rect x={-34} y={-10} width={68} height={12} rx={4} fill="#1A1A20" />
    <rect x={-28} y={-8} width={56} height={6} rx={2} fill="#3A4A6A" />
  </g>
);

// Экзаменационный лист (вид сверху)
export const QSheet: React.FC<{ answer: number; lines?: number }> = ({ answer, lines = 0 }) => (
  <g transform="translate(540 960) rotate(-3)">
    <rect x={-400} y={-560} width={800} height={1120} fill="#000" opacity={0.25} transform="translate(16 20)" />
    <rect x={-400} y={-560} width={800} height={1120} rx={6} fill={P.paper} />
    <text x={0} y={-460} textAnchor="middle" fontSize={56} fontWeight={800} fill="#2B3550" fontFamily="Montserrat, sans-serif">
      ЕМТИХАН
    </text>
    <rect x={-330} y={-430} width={660} height={4} fill="#2B3550" opacity={0.4} />
    <text x={-330} y={-350} fontSize={40} fontWeight={700} fill="#2B3550" fontFamily="Montserrat, sans-serif">
      1-сұрақ:
    </text>
    <text x={-330} y={-290} fontSize={36} fill="#2B3550" fontFamily="Montserrat, sans-serif">
      Абай Құнанбайұлы
    </text>
    <text x={-330} y={-240} fontSize={36} fill="#2B3550" fontFamily="Montserrat, sans-serif">
      қай жылы туған?
    </text>
    <rect x={-330} y={-150} width={660} height={3} fill="#9DB0C8" />
    {answer > 0 ? (
      <text x={-310} y={-170} fontSize={84} fontWeight={800} fill="#1F5FA8" fontFamily="Montserrat, sans-serif" opacity={Math.min(1, answer * 1.4)} style={{ fontStyle: "italic" }}>
        {"1845".slice(0, Math.max(1, Math.ceil(answer * 4)))}
      </text>
    ) : null}
    {new Array(8).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={-330} y={-40 + i * 70} width={660} height={3} fill="#9DB0C8" />
        {lines > 0 ? <TinyLines x={-330} y={-80 + i * 70} w={660 * Math.max(0, Math.min(1, lines * 8 - i))} h={36} rows={2} color="#1F5FA8" seed={`ans${i}`} /> : null}
      </g>
    ))}
  </g>
);

export const Bulb: React.FC<{ x: number; y: number; s: number; on: number }> = ({ x, y, s, on }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-20} r={120} fill={P.sunHi} opacity={0.45 * on} filter="url(#blur20)" />
    <path d="M -50 10 Q -70 -40 -50 -80 Q 0 -140 50 -80 Q 70 -40 50 10 L 30 40 L -30 40 Z" fill={on > 0.5 ? "#FFE58A" : "#E8E2CF"} stroke="#8A7A50" strokeWidth={4} />
    <rect x={-30} y={40} width={60} height={34} rx={6} fill="#8E8E96" />
    <path d="M -16 0 L -6 -40 L 6 -40 L 16 0" stroke="#B8860B" strokeWidth={4} fill="none" />
    {on > 0.5
      ? new Array(8).fill(0).map((_, i) => <rect key={i} x={-4} y={-190} width={8} height={40} rx={4} fill="#FFE58A" transform={`rotate(${i * 45} 0 -40)`} />)
      : null}
  </g>
);

// Ящик стола со старой шпаргалкой (вид сверху)
export const DrawerTop: React.FC<{ open: number; unroll: number }> = ({ open, unroll }) => (
  <g>
    <rect width={1080} height={1920} fill="#2A1A0E" />
    <g transform={`translate(0 ${-200 + open * 200})`}>
      <rect x={120} y={300} width={840} height={1300} fill={N.woodDk} />
      <rect x={150} y={330} width={780} height={1240} fill="#3A2414" />
      <rect x={100} y={1560} width={880} height={120} rx={8} fill={N.wood} />
      <rect x={480} y={1600} width={120} height={30} rx={14} fill={P.brass} />
      {/* старые вещи */}
      <rect x={220} y={420} width={260} height={180} fill="#8A6A4A" transform="rotate(-6 350 510)" />
      <rect x={640} y={1180} width={220} height={60} rx={20} fill="#6E2E2A" transform="rotate(14 750 1210)" />
      {/* свёрнутая шпаргалка 1994 года */}
      <g transform="translate(540 900)">
        <rect x={-60} y={-260 * unroll - 40} width={120} height={300 * unroll + 80} fill="#E8D3A0" stroke="#B89A60" strokeWidth={3} />
        <TinyLines x={-56} y={-260 * unroll - 34} w={112} h={300 * unroll + 70} rows={Math.round(10 + 30 * unroll)} color="#7A6040" seed="old" />
        <ellipse cx={0} cy={60} rx={70} ry={26} fill="#D8C08A" />
        <rect x={-74} y={44} width={148} height={14} fill={N.red} />
        <text x={0} y={-260 * unroll - 60} textAnchor="middle" fontSize={36} fontWeight={700} fill="#E8D3A0" fontFamily="Montserrat, sans-serif" opacity={unroll}>
          1994
        </text>
      </g>
    </g>
    <ellipse cx={540} cy={800} rx={520} ry={600} fill="#FFC27A" opacity={0.2} filter="url(#blur20)" />
  </g>
);

// Дождевое облачко над головой («біттім»)
export const SadCloud: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={110} ry={56} fill="#6E7584" />
    <ellipse cx={-70} cy={14} rx={60} ry={42} fill="#6E7584" />
    <ellipse cx={70} cy={16} rx={64} ry={40} fill="#6E7584" />
    {new Array(6).fill(0).map((_, i) => {
      const ph = ((t * 1.4 + i / 6) % 1 + 1) % 1;
      return <rect key={i} x={-80 + i * 32} y={50 + ph * 160} width={6} height={26} rx={3} fill="#9FC3E6" opacity={1 - ph} />;
    })}
  </g>
);
