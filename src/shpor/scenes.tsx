import React from "react";
import { random } from "remotion";
import { P, Person, Pose, SEAT, STAND, KidFront, mix, walk } from "../qagaz2/art";
import { ClassroomBG, Desk } from "../qagaz2/sets";
import { FPS, wordIn } from "./timeline";
import {
  BigBottle,
  BigPen,
  BigSole,
  BigWatch,
  Bulb,
  Burst,
  ClassSide,
  DeskChair,
  DeskTop,
  DrawerTop,
  N,
  NightDesk,
  NightRoom,
  Phone,
  QSheet,
  SadCloud,
  Strip,
  WallClock,
} from "./props";

export type SceneProps = { lf: number; len: number };
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const ez = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const H = (pose: Pose, extra: Partial<Pose>): Pose => ({ ...pose, ...extra });

const Cam: React.FC<{ s: number; cx?: number; cy?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ s, cx = 540, cy = 960, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);

// Ерасыл за партой (крупно): стул x=640, пол 1700, масштаб 1.25, смотрит влево (доска слева)
const EX = 640;
const EF = 1700;
const ES = 1.25;
const deskTopY = EF - 262 * ES;
const deskX = EX - 230 * ES;

// ---------- 1: ночь, лампа ----------
export const HookScene: React.FC<SceneProps> = ({ lf, len }) => {
  const write = Math.sin(lf * 0.9);
  return (
    <g transform="translate(0 -170)">
      <NightRoom min={47 + (lf / len) * 12} />
      <Person kind="teen" x={380} y={1640} s={1.3} pose={H(SEAT, { head: 22, lean: 14, aFs: 64 + write * 6, aFe: 34 + write * 6 })} carry="pencil" shadow={0} />
      <NightDesk />
    </g>
  );
};
export const S01: React.FC<SceneProps> = (p) => <HookScene {...p} />;

// ---------- 2: крупно — пишет крошечные буквы ----------
export const S02: React.FC<SceneProps> = ({ lf, len }) => {
  const r = cl(lf / (len * 0.95));
  const px = lerp(160, 920, r);
  return (
    <Cam s={lerp(1.05, 1.0, lf / len)}>
      <DeskTop />
      <Strip x={540} y={960} w={860} h={150} reveal={r} seed="main" rot={-3} />
      <Strip x={420} y={1200} w={520} h={70} seed="b1" rot={7} />
      <Strip x={640} y={700} w={440} h={60} seed="b2" rot={-9} />
      {/* рука с карандашом */}
      <g transform={`translate(${px} ${960 - (px - 540) * 0.05 + Math.sin(lf * 1.3) * 6}) rotate(-30)`}>
        <rect x={-14} y={-260} width={28} height={250} rx={6} fill="#F2B632" />
        <path d="M -14 -10 L 14 -10 L 0 30 Z" fill="#E9C9A0" />
        <ellipse cx={30} cy={-150} rx={70} ry={110} fill="#E3B08A" />
        <rect x={-10} y={-480} width={120} height={300} rx={50} fill="#2E3E66" transform="rotate(10)" />
      </g>
    </Cam>
  );
};

// ---------- 3a–d: где спрятаны шпаргалки ----------
const Reveal: React.FC<{ lf: number; children: (k: number) => React.ReactNode }> = ({ lf, children }) => {
  const k = eo(lf / 7);
  return (
    <g>
      <DeskTop />
      <Burst x={540} y={960} k={cl(lf / 14)} />
      {children(k)}
    </g>
  );
};
export const S03a: React.FC<SceneProps> = ({ lf }) => <Reveal lf={lf}>{(k) => <BigPen k={k} />}</Reveal>;
export const S03b: React.FC<SceneProps> = ({ lf }) => <Reveal lf={lf}>{(k) => <BigBottle k={k} />}</Reveal>;
export const S03c: React.FC<SceneProps> = ({ lf }) => <Reveal lf={lf}>{(k) => <BigWatch k={k} />}</Reveal>;
export const S03d: React.FC<SceneProps> = ({ lf }) => <Reveal lf={lf}>{(k) => <BigSole k={k} />}</Reveal>;

// ---------- класс: ученики за партами ----------
const KIDS = [
  { x: 470, kind: "teen" as const, seed: 1 },
  { x: 820, kind: "boy" as const, seed: 2 },
];
const Row: React.FC<{ floor: number; s: number; phones?: number[]; skip?: number }> = ({ floor, s, phones = [], skip = -1 }) => (
  <g>
    {KIDS.map((k, i) =>
      i === skip ? null : (
        <g key={i}>
          <DeskChair x={k.x} floor={floor} s={s} items={phones[i] !== undefined ? <Phone x={-40} y={0} s={1.4} k={phones[i]} /> : null} />
          <Person kind={k.kind === "boy" ? "teen" : "teen"} x={k.x} y={floor} s={s} face={-1} pose={H(SEAT, { head: 4 + i * 3 })} shadow={0} />
        </g>
      ),
    )}
  </g>
);

// ---------- 4a: утро, в дверях Гүлнар апай ----------
export const S04a: React.FC<SceneProps> = ({ lf, len }) => {
  const door = eo(lf / 12);
  const walkT = cl((lf - 10) / (len - 14));
  const tx = lerp(330, 560, ez(walkT));
  const sil = 1 - cl((walkT - 0.35) / 0.3);
  const glint = Math.max(0, Math.sin(cl((lf - 18) / 14) * Math.PI));
  const pose = walkT > 0 && walkT < 1 ? walk(lf * 0.32, 0.8) : STAND;
  return (
    <Cam s={1.0} dy={-200}>
      <ClassSide door={door} />
      <Row floor={1700} s={1.0} />
      <Person kind="teacher" x={tx} y={lerp(1460, 1690, ez(walkT))} s={lerp(1.0, 1.3, ez(walkT))} pose={H(pose, { aFs: 30, aFe: 60 })} carry="notebook" opacity={1 - sil} glint={glint} />
      <Person kind="teacher" x={tx} y={lerp(1460, 1690, ez(walkT))} s={lerp(1.0, 1.3, ez(walkT))} pose={H(pose, { aFs: 30, aFe: 60 })} carry="notebook" tint="dark" opacity={sil} glint={glint} />
    </Cam>
  );
};

// ---------- 4b: «бүркіт көз» — лучи-прожекторы из очков ----------
const ROWS = [
  { y: 1000, s: 0.62, xs: [250, 540, 830] },
  { y: 1220, s: 0.8, xs: [180, 540, 900] },
  { y: 1500, s: 1.0, xs: [130, 540, 950] },
];
export const S04b: React.FC<SceneProps> = ({ lf }) => {
  const a = Math.sin(lf * 0.09) * 30;
  const b = Math.sin(lf * 0.09 + 1.6) * 30;
  const beamX = (ang: number) => 540 + Math.tan((ang * Math.PI) / 180) * 1500;
  const under = (x: number, ang: number) => Math.abs(x - beamX(ang) * 0.75 - 135) < 170;
  return (
    <g>
      <ClassroomBG />
      {ROWS.map((row, r) =>
        row.xs.map((x, c) => {
          const scared = under(x, a) || under(x, b) ? -0.14 : 0;
          return (
            <g key={`${r}-${c}`}>
              <KidFront x={x - 60 * row.s} y={row.y} s={row.s * 1.1} rise={scared} seed={r * 10 + c} />
              <KidFront x={x + 60 * row.s} y={row.y} s={row.s * 1.1} rise={scared} seed={r * 10 + c + 5} />
              <Desk x={x} y={row.y} s={row.s} />
            </g>
          );
        }),
      )}
      <rect width={1080} height={1920} fill="#0A0806" opacity={0.45} />
      {[a, b].map((ang, i) => (
        <g key={i} transform={`rotate(${ang} 540 230)`}>
          <polygon points="510,230 570,230 760,1920 320,1920" fill="#FFF6D8" opacity={0.32} style={{ mixBlendMode: "screen" }} />
        </g>
      ))}
      <g transform="translate(540 230)">
        <circle r={60 + 10 * Math.sin(lf * 0.4)} fill="#FFFFFF" opacity={0.5} filter="url(#blur8)" />
        <path d="M 0 -70 L 10 -10 L 70 0 L 10 10 L 0 70 L -10 10 L -70 0 L -10 -10 Z" fill="#FFFFFF" />
      </g>
    </g>
  );
};

// ---------- 5a: телефоны на парты ----------
export const S05a: React.FC<SceneProps> = ({ lf }) => {
  const ph = [eo((lf - 12) / 6), eo((lf - 22) / 6)];
  return (
    <Cam s={1.0} dy={-200}>
      <ClassSide />
      <Person kind="teacher" x={140} y={1690} s={1.3} pose={H(STAND, { aFs: lerp(10, 120, eo(lf / 12)), aFe: 20, head: -4 })} />
      <Row floor={1700} s={1.0} phones={ph} />
    </Cam>
  );
};

// ---------- 5b: «уақыт басталды» ----------
export const S05b: React.FC<SceneProps> = ({ lf }) => (
  <g>
    <rect width={1080} height={1920} fill="url(#wallG)" />
    <WallClock x={540} y={900} r={380} min={0} sec={lf * 0.6} />
    <ellipse cx={540} cy={900} rx={520} ry={520} fill="#FFFFFF" opacity={0.08} filter="url(#blur20)" />
  </g>
);

// ---------- 6a–c: попытки и взгляд апай ----------
const Beam: React.FC<{ k: number }> = ({ k }) =>
  k > 0 ? (
    <g opacity={k}>
      <polygon points={`-40,980 -40,1060 ${EX + 60},1150 ${EX + 60},1320`} fill="#FFF6D8" opacity={0.55} style={{ mixBlendMode: "screen" }} />
      <g transform="translate(20 1020)">
        <path d="M 0 -60 L 9 -9 L 60 0 L 9 9 L 0 60 L -9 9 L -60 0 L -9 -9 Z" fill="#FFFFFF" />
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={EX - 40 + i * 34} y={1080 - (i === 1 ? 30 : 0)} width={10} height={44} rx={5} fill="#2B2018" transform={`rotate(${(i - 1) * 20} ${EX - 35 + i * 34} 1100)`} />
      ))}
    </g>
  ) : null;

const Attempt: React.FC<{ lf: number; hit: number; item: "pen" | "bottle" }> = ({ lf, hit, item }) => {
  const reach = cl(lf / 16) * (lf < hit ? 1 : 1 - cl((lf - hit) / 4));
  const k = lf >= hit ? 1 - cl((lf - hit - 14) / 8) : 0;
  return (
    <Cam s={1.55} cx={560} cy={1360} dy={-261}>
      <ClassSide board={false} />
      <DeskChair
        x={EX}
        floor={EF}
        s={ES}
        items={
          item === "pen" ? (
            <rect x={-30} y={-12} width={90} height={12} rx={6} fill="#2E5FA8" />
          ) : (
            <g transform="translate(20 0)">
              <rect x={-20} y={-90} width={40} height={90} rx={12} fill="#CFE9F7" stroke="#8FC0DC" strokeWidth={3} />
              <rect x={-12} y={-104} width={24} height={16} rx={4} fill="#2E5FA8" />
              <rect x={-20} y={-60} width={40} height={30} fill="#2E86C1" />
            </g>
          )
        }
      />
      <Person kind="teen" x={EX} y={EF} s={ES} face={-1} pose={H(SEAT, { aFs: lerp(55, 95, reach), aFe: lerp(40, 5, reach), head: lf >= hit ? -12 : 10, lean: lerp(6, 20, reach) })} shadow={0} />
      <Beam k={k} />
    </Cam>
  );
};
export const S06a: React.FC<SceneProps> = ({ lf }) => <Attempt lf={lf} hit={wordIn("n4", 5, "sc06a")} item="pen" />;
export const S06b: React.FC<SceneProps> = ({ lf }) => <Attempt lf={lf} hit={wordIn("n4", 9, "sc06b")} item="bottle" />;

export const S06c: React.FC<SceneProps> = ({ lf }) => {
  const appear = wordIn("n4", 15, "sc06c");
  const bend = cl(lf / 12) * (lf < appear ? 1 : 1 - cl((lf - appear - 4) / 6));
  const tk = eo((lf - appear + 6) / 8);
  return (
    <Cam s={1.3} cx={600} cy={1300} dy={-262}>
      <ClassSide board={false} />
      <DeskChair x={EX} floor={EF} s={ES} />
      <Person kind="teen" x={EX} y={EF} s={ES} face={-1} pose={H(SEAT, { lean: lerp(6, 48, bend), head: lerp(10, 36, bend) - (lf > appear + 6 ? 30 : 0), aFs: lerp(55, -5, bend), aFe: lerp(40, 10, bend) })} shadow={0} />
      <Person kind="teacher" x={lerp(1250, 880, tk)} y={EF + 10} s={1.4} face={-1} pose={H(STAND, { head: 24, aBs: -20, aFs: -10, lean: 6 })} glint={tk > 0.9 ? 0.8 + 0.2 * Math.sin(lf * 0.5) : 0} />
    </Cam>
  );
};

// ---------- 7: «Біттім...» ----------
export const S07: React.FC<SceneProps> = ({ lf }) => {
  const down = eo(lf / 12);
  return (
    <Cam s={1.55} cx={560} cy={1360} dy={-261}>
      <ClassSide board={false} />
      <DeskChair x={EX} floor={EF} s={ES} />
      <Person kind="teen" x={EX} y={EF} s={ES} face={-1} pose={H(SEAT, { lean: lerp(6, 46, down), head: lerp(10, 40, down), aFs: lerp(55, 85, down), aFe: lerp(40, 70, down) })} shadow={0} />
      <g opacity={down}>
        <SadCloud x={EX - 60} y={1010 - Math.sin(lf * 0.15) * 6} t={lf / FPS} />
      </g>
    </Cam>
  );
};

// ---------- 8a: вопрос на листе ----------
export const S08a: React.FC<SceneProps> = ({ lf, len }) => {
  const hit = wordIn("n5", 5, "sc08a");
  return (
    <Cam s={lerp(1.0, 1.12, ez(lf / len))} cy={800}>
      <DeskTop />
      <QSheet answer={0} />
      {lf >= hit ? <Burst x={540} y={720} k={cl((lf - hit) / 14)} color="#FFE58A" /> : null}
    </Cam>
  );
};

// ---------- 8b: озарение ----------
const ORIGINS = [
  { x: deskX - 20, y: deskTopY - 10 },
  { x: deskX + 60, y: deskTopY - 40 },
  { x: EX - 160, y: 1420 },
  { x: EX - 40, y: EF - 10 },
];
export const S08b: React.FC<SceneProps> = ({ lf, len }) => {
  const on = wordIn("b2", 2, "sc08b");
  const head = { x: EX - 10, y: 1232 };
  return (
    <Cam s={1.35} cx={600} cy={1250} dy={-326}>
      <ClassSide board={false} />
      <DeskChair x={EX} floor={EF} s={ES} />
      <Person kind="teen" x={EX} y={EF} s={ES} face={-1} pose={H(SEAT, { head: -14, lean: -4, aFs: 30, aFe: 60 })} shadow={0} />
      {ORIGINS.map((o, i) => {
        const t0 = 2 + i * 5;
        const k = ez(cl((lf - t0) / (len * 0.55)));
        if (k <= 0 || k >= 1) return null;
        const cx = lerp(o.x, head.x, 0.5) - 260 + i * 120;
        const cy = Math.min(o.y, head.y) - 300;
        const x = (1 - k) * (1 - k) * o.x + 2 * (1 - k) * k * cx + k * k * head.x;
        const y = (1 - k) * (1 - k) * o.y + 2 * (1 - k) * k * cy + k * k * head.y;
        return <Strip key={i} x={x} y={y} w={lerp(140, 40, k)} h={lerp(26, 8, k)} rot={k * 540 + i * 40} seed={`f${i}`} />;
      })}
      <Bulb x={head.x} y={head.y - 190} s={0.9} on={lf >= on ? 1 : 0} />
    </Cam>
  );
};

// ---------- 9a: пишет быстро ----------
export const S09a: React.FC<SceneProps> = ({ lf, len }) => {
  const ans = cl(lf / 12);
  const lines = cl((lf - 10) / (len - 14));
  const row = Math.min(7, Math.floor(lines * 8));
  const px = 210 + ((lines * 8) % 1) * 660;
  return (
    <g>
      <DeskTop />
      <QSheet answer={ans} lines={lines} />
      {new Array(6).fill(0).map((_, i) => (
        <rect key={i} x={-200 + ((lf * 60 + i * 260) % 1500)} y={300 + i * 260} width={220} height={6} rx={3} fill="#FFFFFF" opacity={0.25} />
      ))}
      <g transform={`translate(${lf < 12 ? 300 + ans * 200 : px} ${lf < 12 ? 760 : 900 + row * 70 - 80 + Math.sin(lf * 2) * 5}) rotate(-30)`}>
        <rect x={-12} y={-240} width={24} height={230} rx={6} fill="#F2B632" />
        <path d="M -12 -10 L 12 -10 L 0 26 Z" fill="#E9C9A0" />
        <ellipse cx={26} cy={-140} rx={60} ry={96} fill="#E3B08A" />
      </g>
    </g>
  );
};

// ---------- 9b: «үш рет көшірген… басында» ----------
export const S09b: React.FC<SceneProps> = ({ lf, len }) => {
  const fly = ez(cl((lf - len * 0.5) / (len * 0.45)));
  return (
    <g>
      <rect width={1080} height={1920} fill="#1C1408" />
      <ellipse cx={540} cy={900} rx={700} ry={800} fill="#4A3418" opacity={0.6} filter="url(#blur20)" />
      {/* Ерасыл крупно в профиль; в голове загорается свет */}
      <Person kind="teen" x={800} y={2330} s={3.0} face={-1} pose={H(STAND, { head: -6 })} shadow={0} />
      <circle cx={790} cy={830} r={110 + 40 * fly} fill="#FFD58A" opacity={0.55 * fly} filter="url(#blur20)" />
      {[0, 1, 2].map((i) => {
        const t0 = 4 + i * 8;
        const r = cl((lf - t0) / 14);
        const x = lerp(400, 790, fly);
        const y = lerp(1180 + i * 170, 830 + (i - 1) * 30, fly);
        const s = lerp(1, 0.15, fly);
        return (
          <g key={i} opacity={r > 0 ? 1 : 0}>
            <text x={lerp(90, 600, fly)} y={1205 + i * 170} fontSize={90} fontWeight={800} fill={P.amber} fontFamily="Montserrat, sans-serif" opacity={1 - fly}>
              {i + 1}
            </text>
            <g transform={`translate(${x} ${y}) scale(${s})`}>
              <Strip x={0} y={0} w={620} h={90} reveal={r} seed={`x${i}`} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

// ---------- 10: сдаёт работу ----------
const TeacherDesk: React.FC = () => (
  <g>
    <rect x={150} y={1420} width={480} height={30} rx={4} fill={N.woodHi} />
    <rect x={170} y={1450} width={440} height={250} fill={N.wood} />
    <rect x={190} y={1470} width={400} height={80} rx={6} fill={N.woodDk} />
    <rect x={360} y={1500} width={60} height={14} rx={6} fill={P.brass} />
    <rect x={200} y={1395} width={130} height={26} rx={3} fill={P.paper} />
  </g>
);
export const S10a: React.FC<SceneProps> = ({ lf, len }) => {
  const w = ez(cl(lf / (len * 0.55)));
  const give = cl((lf - len * 0.55) / 10);
  return (
    <Cam s={1.25} cx={540} cy={1300} dy={-166}>
      <ClassSide board={false} />
      <Person kind="teacher" x={240} y={1690} s={1.3} pose={H(STAND, { aFs: 30 + 50 * give, aFe: 30, head: 4 })} />
      <TeacherDesk />
      <Person kind="teen" x={lerp(1150, 760, w)} y={1700} s={1.25} face={-1} pose={w < 1 ? H(walk(lf * 0.38, 0.9), { aFs: 40, aFe: 40 }) : H(STAND, { aFs: 40 + 45 * give, aFe: 30 - 20 * give })} carry="sheet" />
    </Cam>
  );
};

export const S10b: React.FC<SceneProps> = ({ lf }) => {
  const lean = eo(lf / 10);
  const jump = lf > 12 ? Math.max(0, Math.sin(cl((lf - 12) / 10) * Math.PI)) : 0;
  const look = cl((lf - 26) / 8);
  return (
    <Cam s={1.35} cx={560} cy={1260} dy={-158}>
      <ClassSide board={false} />
      <Person kind="teacher" x={300} y={1690} s={1.3} pose={H(STAND, { lean: 16 * lean, head: 22 * lean, aFs: 20, aFe: 40 })} />
      <TeacherDesk />
      <Person kind="teen" x={720} y={1700 - jump * 70} s={1.25} face={-1} pose={H(STAND, { aFs: jump * 120, aBs: jump * 110, aFe: 10, aBe: 10, head: lerp(0, 40, look), lean: lerp(0, 10, look) })} />
      {jump > 0.2
        ? [0, 1, 2].map((i) => <rect key={i} x={700 + (i - 1) * 50} y={1010 - jump * 70 - (i === 1 ? 26 : 0)} width={12} height={50} rx={6} fill="#2B2018" transform={`rotate(${(i - 1) * 24} ${706 + (i - 1) * 50} 1040)`} />)
        : null}
    </Cam>
  );
};

// ---------- 10c: ластик стирает подошву ----------
export const S10c: React.FC<SceneProps> = ({ lf, len }) => {
  const e = cl(lf / (len * 0.8));
  return (
    <g>
      <DeskTop />
      <BigSole k={1} erase={e} />
      <g transform={`translate(${540 + Math.sin(lf * 0.9) * 140} ${800 + e * 260}) rotate(-20)`}>
        <rect x={-110} y={-60} width={220} height={120} rx={20} fill="#E8889A" />
        <rect x={-110} y={-60} width={220} height={40} rx={18} fill="#3A6FB5" />
      </g>
      {new Array(5).fill(0).map((_, i) => (
        <circle key={i} cx={540 + random(`cr${i}${Math.floor(lf / 3)}`) * 300 - 150} cy={900 + random(`cy${i}${Math.floor(lf / 3)}`) * 200} r={6} fill="#E8889A" opacity={0.7} />
      ))}
    </g>
  );
};

// ---------- 11a: вечер, апай открывает ящик ----------
export const S11a: React.FC<SceneProps> = ({ lf, len }) => {
  const open = eo(cl((lf - len * 0.4) / 14));
  return (
    <Cam s={lerp(1.15, 1.25, lf / len)} cx={560} cy={1340} dy={-330}>
      <ClassSide evening={1} board />
      <DeskChair x={420} floor={1700} s={1.2} face={1} items={<rect x={-80} y={-14} width={130} height={14} fill={P.paper} />} />
      <rect x={420 + 276 - 150 + open * 120} y={1700 - 262 * 1.2 + 26} width={300} height={56} fill={N.woodHi} stroke={N.woodDk} strokeWidth={4} />
      <Person kind="teacher" x={420} y={1700} s={1.2} face={1} pose={H(SEAT, { head: lerp(6, 34, open), aFs: lerp(40, 75, open), aFe: 20 })} shadow={0} />
    </Cam>
  );
};

// ---------- 11b: старая шпаргалка и школьница 90-х ----------
export const S11b: React.FC<SceneProps> = ({ lf }) => (
  <g>
    <DrawerTop open={eo(lf / 10)} unroll={eo((lf - 8) / 30)} />
    <g opacity={cl((lf - 14) / 16) * 0.95}>
      <ellipse cx={820} cy={1560} rx={260} ry={360} fill="#FFC27A" opacity={0.25} filter="url(#blur20)" />
      <Person kind="girl90" x={800} y={1900} s={1.3} face={-1} pose={H(SEAT, { head: 22, lean: 14, aFs: 64 + Math.sin(lf * 0.9) * 6, aFe: 34 })} carry="pencil" tint="ghost" shadow={0} />
    </g>
  </g>
);

// ---------- 12: финал — «ЖАЗҒАН — ҰМЫТПАЙДЫ» ----------
export const S12: React.FC<SceneProps> = ({ lf }) => {
  const un = eo(lf / 18);
  const l1 = "ЖАЗҒАН —";
  const l2 = "ҰМЫТПАЙДЫ";
  const n = Math.floor(cl((lf - 14) / 34) * (l1.length + l2.length));
  return (
    <g>
      <rect width={1080} height={1920} fill="#1E140B" />
      <ellipse cx={540} cy={860} rx={620} ry={600} fill="#5A3A1E" opacity={0.7} filter="url(#blur20)" />
      <g transform="translate(540 860) rotate(-3)">
        <rect x={-460 * un + 10} y={-200 + 14} width={920 * un} height={400} fill="#000" opacity={0.3} />
        <rect x={-460 * un} y={-200} width={920 * un} height={400} rx={4} fill={P.paper} />
        <TinyLinesBg un={un} />
        <text x={0} y={-30} textAnchor="middle" fontSize={130} fontWeight={700} fill={N.ink} fontFamily="Oswald, sans-serif">
          {l1.slice(0, Math.min(n, l1.length))}
        </text>
        <text x={0} y={140} textAnchor="middle" fontSize={130} fontWeight={700} fill={N.red} fontFamily="Oswald, sans-serif">
          {l2.slice(0, Math.max(0, n - l1.length))}
        </text>
      </g>
    </g>
  );
};
const TinyLinesBg: React.FC<{ un: number }> = ({ un }) => (
  <g opacity={0.25}>
    {new Array(9).fill(0).map((_, i) => (
      <rect key={i} x={-430 * un} y={-180 + i * 42} width={860 * un} height={2} fill="#9DB0C8" />
    ))}
  </g>
);

export const SCENES: Record<string, React.FC<SceneProps>> = {
  sc01: S01,
  sc02: S02,
  sc03a: S03a,
  sc03b: S03b,
  sc03c: S03c,
  sc03d: S03d,
  sc04a: S04a,
  sc04b: S04b,
  sc05a: S05a,
  sc05b: S05b,
  sc06a: S06a,
  sc06b: S06b,
  sc06c: S06c,
  sc07: S07,
  sc08a: S08a,
  sc08b: S08b,
  sc09a: S09a,
  sc09b: S09b,
  sc10a: S10a,
  sc10b: S10b,
  sc10c: S10c,
  sc11a: S11a,
  sc11b: S11b,
  sc12: S12,
};
export { mix };
