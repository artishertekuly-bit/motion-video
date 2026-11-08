import React from "react";
import { CROUCH, KNEEL, Person, Pose, SEAT, STAND, mix, run, walk } from "../qagaz2/art";
import { CorridorSide, FLOOR } from "../qagaz2/sets";
import { WallClock } from "../shpor/props";
import { BigPhone, Kitchen } from "../ubt/props";
import { endIn, FPS, startIn, wordIn } from "./timeline";
import {
  BackpackTop,
  CallPhone,
  CoffeeTable,
  Crayons,
  Easel,
  ExhibitWall,
  FaceGlow,
  FL,
  HandPhone,
  HeldSheet,
  KidDrawing,
  Laptop,
  LivingRoom,
  Office,
  OfficeDesk,
  PaperBack,
  ShelfPhone,
  SofaArm,
  SofaBack,
  handAt,
  headAt,
  lapAt,
} from "./props";

export type SceneProps = { lf: number; len: number };
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const ez = (t: number) => {
  const k = cl(t);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const H = (pose: Pose, extra: Partial<Pose>): Pose => ({ ...pose, ...extra });
const ramp = (lf: number, a: number, b: number) => cl((lf - a) / Math.max(1, b - a));

// Камера: точка мира (cx, cy) попадает в (cx+dx, cy+dy) экрана, масштаб s
const Cam: React.FC<{ s: number; cx?: number; cy?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ s, cx = 540, cy = 960, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);

// ---------- общие позы ----------
const DAD_PHONE: Pose = H(SEAT, { head: 30, lean: 12, aFs: 72, aFe: 78, aBs: 62, aBe: 88 });
const RAISE: Pose = H(STAND, { aFs: 128, aFe: 12, aBs: 116, aBe: 22, head: -8 });
const SAD: Pose = H(STAND, { aFs: 14, aFe: 30, aBs: 6, aBe: 26, head: 20, lean: 4 });

// Папа на диване с телефоном (общий для 1 и 2)
const DX = 790;
const DS = 1.1;
const DadSofa: React.FC<{ lf: number; wave?: number; glow?: number }> = ({ lf, wave = 0, glow = 1 }) => {
  const pose = H(DAD_PHONE, { aBs: 62 + wave * 18, aBe: 88 - wave * 30, aFe: 78 + Math.sin(lf * 0.12) * 2 });
  const hand = handAt(pose, DX, FL, DS, -1);
  const head = headAt(pose, DX, FL, DS, -1);
  return (
    <g>
      <Person kind="young" x={DX} y={FL} s={DS} face={-1} pose={pose} shadow={0} />
      <HandPhone at={{ x: hand.x - 10, y: hand.y - 18 }} s={DS * 0.9} tilt={28} glow={glow} />
      <FaceGlow at={head} s={DS} k={glow} />
    </g>
  );
};

// ---------- 1: «Әке, қараңызшы!» — «Кейін, балам.» ----------
export const S01: React.FC<SceneProps> = ({ lf, len }) => {
  const t = lf / FPS;
  const runK = cl(t / 1.05);
  const bx = lerp(-140, 430, ez(runK));
  const raiseK = ramp(lf, 22, 36);
  const sadK = ramp(lf, wordIn("d1", 1, "sc01") + 8, wordIn("d1", 1, "sc01") + 26);
  const base = runK < 1 ? run(lf * 0.55, 1 - 0.6 * raiseK) : STAND;
  const pose = mix(mix(base, RAISE, raiseK), SAD, sadK);
  const hand = handAt(pose, bx, FL, 0.8, 1);
  const d0 = startIn("d1", "sc01");
  const wave = Math.max(0, Math.sin(cl((lf - d0) / 18) * Math.PI));
  return (
    <Cam s={lerp(1.0, 1.08, lf / len)} cx={600} cy={1300} dy={-170}>
      <LivingRoom />
      <SofaBack x={600} />
      <DadSofa lf={lf} wave={wave} />
      <SofaArm x={600} />
      <Person kind="boy" x={bx} y={FL} s={0.8} face={1} pose={pose} />
      <HeldSheet at={hand} s={0.8 + 0.25 * raiseK} rot={lerp(-8, 70, sadK)} up={1 - sadK} />
    </Cam>
  );
};

// ---------- 2: крупно — свет телефона, мальчик уходит ----------
export const S02: React.FC<SceneProps> = ({ lf, len }) => {
  const head = headAt(DAD_PHONE, DX, FL, DS, -1);
  const wk = ramp(lf, 6, 80);
  const bx = lerp(430, -220, wk);
  const pose = wk > 0 && wk < 1 ? H(walk(lf * 0.3, 0.6), { head: 22, aFs: 10, aFe: 20 }) : SAD;
  const hand = handAt(pose, bx, FL, 0.8, -1);
  const flick = 0.85 + 0.15 * Math.sin(lf * 0.7) * Math.sin(lf * 0.23);
  return (
    <Cam s={lerp(1.85, 2.0, lf / len)} cx={head.x} cy={head.y} dx={620 - head.x} dy={760 - head.y}>
      <LivingRoom />
      <SofaBack x={600} />
      <Person kind="boy" x={bx} y={FL} s={0.8} face={-1} pose={pose} opacity={0.95} />
      <HeldSheet at={hand} s={0.8} rot={80} up={0} />
      <DadSofa lf={lf} glow={flick} />
      <SofaArm x={600} />
    </Cam>
  );
};

// ---------- 3: утро, кухня — папа проходит с телефоном у уха ----------
const PHONE_EAR: Partial<Pose> = { aFs: 96, aFe: 124 };
export const S03: React.FC<SceneProps> = ({ lf, len }) => {
  const dxp = lerp(-180, 1180, lf / len);
  const dPose = H(walk(lf * 0.34, 0.9), PHONE_EAR);
  const dHand = handAt(dPose, dxp, 1660, 1.18, 1);
  const raiseK = ramp(lf, startIn("b2", "sc03") - 4, startIn("b2", "sc03") + 8);
  const dropK = ramp(lf, endIn("d2", "sc03") - 10, endIn("d2", "sc03") + 6);
  const bPose = mix(mix(H(SEAT, { head: 6 }), H(SEAT, { aFs: 124, aFe: 8, aBs: 112, aBe: 18, head: -10, lean: -2 }), raiseK), H(SEAT, { head: 22, aFs: 50, aFe: 50 }), dropK);
  const bHand = handAt(bPose, 250, FL, 0.82, 1);
  return (
    <Cam s={lerp(1.0, 1.05, lf / len)} cx={540} cy={1300} dx={-(dxp - 540) * 0.08} dy={-140}>
      <Kitchen />
      {/* табурет и столик */}
      <rect x={200} y={FL - 112} width={100} height={18} rx={6} fill="#6B4226" />
      <rect x={240} y={FL - 94} width={16} height={94} fill="#54311A" />
      <Person kind="boy" x={250} y={FL} s={0.82} face={1} pose={bPose} />
      <HeldSheet at={bHand} s={0.85} rot={lerp(-6, 60, dropK)} up={1 - dropK} />
      <rect x={330} y={FL - 190} width={300} height={20} rx={4} fill="#9C6438" />
      <rect x={350} y={FL - 170} width={16} height={170} fill="#7B4B28" />
      <rect x={594} y={FL - 170} width={16} height={170} fill="#7B4B28" />
      <rect x={430} y={FL - 214} width={60} height={26} rx={6} fill="#FFFFFF" />
      {/* папа на переднем плане */}
      <Person kind="young" x={dxp} y={1660} s={1.18} face={1} pose={dPose} shadow={0.22} />
      <HandPhone at={{ x: dHand.x - 4, y: dHand.y - 30 }} s={1.1} tilt={-12} glow={0.3} lit={0.4} />
    </Cam>
  );
};

// ---------- 4: ночь — ноутбук, Айбар в дверях ----------
export const S04: React.FC<SceneProps> = ({ lf, len }) => {
  const type = Math.sin(lf * 1.3);
  const pose = H(SEAT, { head: 20, lean: 10, aFs: 58 + type * 3, aFe: 52 + type * 4, aBs: 52 - type * 3, aBe: 58 });
  const lap = lapAt(pose, DX, FL, DS, -1);
  const head = headAt(pose, DX, FL, DS, -1);
  const hang = ramp(lf, endIn("d3", "sc04") - 6, endIn("d3", "sc04") + 14);
  const bPose = H(STAND, { head: lerp(0, 22, hang), aFs: 8, aBs: -6, aFe: 14, aBe: 14 });
  return (
    <Cam s={lerp(1.0, 1.06, lf / len)} cx={480} cy={1300} dy={-170}>
      <LivingRoom night={1} door={1} />
      {/* тёплый свет из двери на полу */}
      <path d={`M 0 ${FL} L 110 ${FL} L 420 1920 L 0 1920 Z`} fill="#FFE2A8" opacity={0.28} />
      <Person kind="boy" x={58} y={FL} s={0.8} face={1} pose={bPose} tint="dark" shadow={0} />
      <SofaBack x={600} />
      <Person kind="young" x={DX} y={FL} s={DS} face={-1} pose={pose} shadow={0} />
      <Laptop at={lap} s={DS} face={-1} />
      <FaceGlow at={head} s={DS} k={1} />
      <SofaArm x={600} />
    </Cam>
  );
};

// ---------- 5: рисунок складывается и уходит в рюкзак ----------
export const S05: React.FC<SceneProps> = ({ lf, len }) => {
  const fold = ez(ramp(lf, 12, 36));
  const sink = ez(ramp(lf, 46, Math.min(len - 6, 84)));
  const pw = 560;
  const ph = 740;
  const y = lerp(720, 1460, sink);
  const s = lerp(1, 0.78, sink);
  const sy = 1 - 2 * fold; // верхняя половина переворачивается вниз
  return (
    <Cam s={lerp(1.0, 1.05, lf / len)}>
      <rect width={1080} height={1920} fill="#33405E" />
      {new Array(10).fill(0).map((_, i) => (
        <rect key={i} y={i * 200} width={1080} height={8} fill="#2A3550" />
      ))}
      <BackpackTop open={1} />
      <defs>
        <clipPath id="kIntoBag">
          <rect x={0} y={0} width={1080} height={1205} />
        </clipPath>
      </defs>
      <g clipPath="url(#kIntoBag)">
        <g transform={`translate(540 ${y}) scale(${s})`}>
          {/* нижняя половина */}
          <g transform={`translate(0 ${ph / 4})`}>
            <PaperBack w={pw} h={ph / 2} />
          </g>
          {/* верхняя половина складывается */}
          <g transform={`scale(1 ${sy})`}>
            <g transform={`translate(0 ${-ph / 4})`}>
              <PaperBack w={pw} h={ph / 2} tint={sy < 0 ? "#E2D7C2" : "#EFE7D6"} />
            </g>
          </g>
          {/* детские руки по краям */}
          {[-1, 1].map((k) => (
            <g key={k} transform={`translate(${k * (pw / 2 + 6)} ${ph * 0.06})`}>
              <rect x={k > 0 ? 0 : -150} y={-40} width={150} height={80} rx={36} fill="#22325A" />
              <circle cx={k * 8} cy={0} r={40} fill="#E3B08A" />
            </g>
          ))}
        </g>
      </g>
      <rect width={1080} height={1920} fill="#0A0E28" opacity={0.25} />
    </Cam>
  );
};

// ---------- 6a: звонок на столе в офисе ----------
export const S06a: React.FC<SceneProps> = ({ lf, len }) => (
  <Cam s={lerp(1.0, 1.08, lf / len)} cy={900}>
    <CallPhone lf={lf} />
  </Cam>
);

// ---------- 6b: папа слушает апай и встаёт ----------
export const S06b: React.FC<SceneProps> = ({ lf, len }) => {
  const lift = ramp(lf, wordIn("t1", 2, "sc06b") - 4, wordIn("t1", 4, "sc06b"));
  const up = ez(ramp(lf, endIn("t1", "sc06b") - 6, endIn("t1", "sc06b") + 12));
  const seat = H(SEAT, { head: lerp(14, -6, lift), lean: lerp(10, -2, lift), ...PHONE_EAR });
  const stand = H(STAND, { ...PHONE_EAR, head: -4 });
  const pose = mix(seat, stand, up);
  const x = lerp(760, 820, up);
  const hand = handAt(pose, x, FL, 1.1, -1);
  return (
    <Cam s={lerp(1.0, 1.06, lf / len)} cx={600} cy={1300} dy={-170}>
      <Office />
      <WallClock x={250} y={560} r={70} min={0} />
      <OfficeDesk />
      {/* кресло */}
      <g opacity={1 - up * 0.0}>
        <rect x={730} y={FL - 150} width={130} height={22} rx={8} fill="#2B2E36" />
        <rect x={790} y={FL - 128} width={12} height={100} fill="#4A4E58" />
        <rect x={740} y={FL - 30} width={110} height={10} rx={5} fill="#4A4E58" />
        <rect x={840} y={FL - 330} width={26} height={190} rx={10} fill="#2B2E36" />
      </g>
      <Person kind="young" x={x} y={FL} s={1.1} face={-1} pose={pose} />
      <HandPhone at={{ x: hand.x + 6, y: hand.y - 26 }} s={1.0} tilt={10} glow={0.2} lit={0.6} />
    </Cam>
  );
};

// ---------- 7a: бежит по школьному коридору ----------
export const S07a: React.FC<SceneProps> = ({ lf }) => (
  <Cam s={1.0} cy={1200} dy={-120}>
    <CorridorSide sx={1800 + lf * 30} />
    <Person kind="young" x={470} y={FLOOR} s={1.06} face={1} pose={run(lf * 0.5, 0.9)} />
  </Cam>
);

// ---------- 7b: телефон поднимается к рисунку (вид из-за плеча) ----------
export const S07b: React.FC<SceneProps> = ({ lf, len }) => {
  const rise = eo(ramp(lf, 0, 20));
  const snap = Math.round(1.9 * FPS);
  const flash = lf >= snap ? cl(1 - (lf - snap) / 7) : 0;
  const shake = Math.sin(lf * 0.9) * 3 * (1 - rise * 0.5);
  return (
    <g>
      <Cam s={1.35} cx={560} cy={900} dy={-60}>
        <g filter="url(#kSoft)">
          <ExhibitWall />
          <Easel x={560} s={1.15} />
        </g>
      </Cam>
      <BigPhone y={lerp(1000, 0, rise) + shake} rot={-2} s={1.05} dark>
        <rect width={430} height={820} fill="#0C0D12" />
        <g transform="translate(215 410) scale(0.42)">
          <KidDrawing award />
        </g>
        {[1, 2].map((i) => (
          <g key={i}>
            <rect x={(430 / 3) * i} y={0} width={1.5} height={820} fill="#FFFFFF" opacity={0.35} />
            <rect x={0} y={(820 / 3) * i} width={430} height={1.5} fill="#FFFFFF" opacity={0.35} />
          </g>
        ))}
        <rect width={430} height={90} fill="#000" opacity={0.55} />
        <text x={215} y={60} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={26} fill="#FFD84A">
          ФОТО
        </text>
        <rect y={700} width={430} height={120} fill="#000" opacity={0.55} />
        <circle cx={215} cy={760} r={lf >= snap && lf < snap + 4 ? 34 : 40} fill="#FFFFFF" />
        <circle cx={215} cy={760} r={48} fill="none" stroke="#FFFFFF" strokeWidth={5} />
        <rect width={430} height={820} fill="#FFFFFF" opacity={flash * 0.9} />
      </BigPhone>
    </g>
  );
};

// ---------- 7c: сам рисунок — наезд на голову-телефон ----------
export const S07c: React.FC<SceneProps> = ({ lf, len }) => {
  const k = ez(ramp(lf, 4, len - 10));
  const DS2 = 1.12;
  const tx = 540 + 235 * DS2;
  const ty = 900 - 232 * DS2;
  const s = lerp(1.0, 2.25, k);
  return (
    <g>
      <rect width={1080} height={1920} fill="#2A2018" />
      <Cam s={s} cx={lerp(540, tx, k)} cy={lerp(900, ty, k)} dx={lerp(0, 540 - tx, k)} dy={lerp(0, 780 - ty, k)}>
        <g transform={`translate(540 900) scale(${DS2})`}>
          <KidDrawing award />
        </g>
      </Cam>
      <rect width={1080} height={1920} fill="url(#vign)" opacity={0.6 * k} />
    </g>
  );
};

// ---------- 7d / 9: у мольберта ----------
const EX = 860;
const BX = 690;
const DADX = 380;
export const S07d: React.FC<SceneProps> = ({ lf, len }) => {
  const low = ez(ramp(lf, 6, 40));
  const look = ramp(lf, startIn("b4", "sc07d") - 6, startIn("b4", "sc07d") + 14);
  const dPose = H(STAND, { aFs: lerp(104, 18, low), aFe: lerp(18, 26, low), head: lerp(-2, 14, look) });
  const hand = handAt(dPose, DADX, FLOOR, 1.08, 1);
  const bPose = H(STAND, { head: 18, aFs: 4, aBs: -2, aFe: 30, aBe: 30, lean: 2 });
  return (
    <Cam s={lerp(1.0, 1.06, lf / len)} cx={560} cy={1200} dy={-140}>
      <ExhibitWall />
      <Easel x={EX} />
      <Person kind="boy" x={BX} y={FLOOR} s={0.8} face={-1} pose={bPose} />
      <Person kind="young" x={DADX} y={FLOOR} s={1.08} face={1} pose={dPose} />
      <HandPhone at={{ x: hand.x, y: hand.y - 26 }} s={1.0} tilt={-6} glow={0.25 * (1 - low)} lit={1 - low * 0.6} />
    </Cam>
  );
};

export const S09: React.FC<SceneProps> = ({ lf, len }) => {
  const pocket = ez(ramp(lf, 0, 10));
  const kneel = ez(ramp(lf, 10, 30));
  const reach = ez(ramp(lf, 28, 44));
  const lift = ez(ramp(lf, wordIn("d4", 2, "sc09") - 4, wordIn("d4", 2, "sc09") + 10));
  const stand = H(STAND, { aFs: lerp(18, -12, pocket), aFe: lerp(26, 36, pocket), head: 14 });
  const kn = H(KNEEL, { head: 6, aFs: lerp(20, 76, reach), aFe: lerp(30, 8, reach), aBs: 10, aBe: 20 });
  const pose = mix(stand, kn, kneel);
  const x = lerp(DADX, 470, kneel);
  const hand = handAt(pose, x, FLOOR, 1.08, 1);
  const bPose = H(STAND, { head: lerp(18, -6, lift), aFs: 4, aBs: -2, aFe: 30, aBe: 30, lean: lerp(2, -2, lift) });
  return (
    <Cam s={lerp(1.06, 1.16, lf / len)} cx={600} cy={1200} dy={-140}>
      <ExhibitWall />
      <Easel x={EX} />
      <Person kind="boy" x={BX} y={FLOOR} s={0.8} face={-1} pose={bPose} />
      <Person kind="young" x={x} y={FLOOR} s={1.08} face={1} pose={pose} />
      {pocket < 1 ? <HandPhone at={{ x: hand.x, y: hand.y - 22 }} s={1.0} tilt={-6} glow={0} lit={0.3} /> : null}
    </Cam>
  );
};

// ---------- 10a: телефон один на полке ----------
export const S10a: React.FC<SceneProps> = ({ lf, len }) => {
  const on = ramp(lf, 28, 34) * (1 - ramp(lf, len - 22, len - 8));
  const count = lf < 46 ? 1 : lf < 62 ? 3 : lf < 78 ? 7 : 12;
  return (
    <Cam s={lerp(1.0, 1.07, lf / len)} cy={1150}>
      <g filter="url(#kSoft)">
        <LivingRoom night={0.35} frame={false} />
        <CoffeeTable x={560} />
        <Person kind="boy" x={380} y={FL} s={0.8} face={1} pose={H(CROUCH, { head: 26 })} shadow={0} />
        <Person kind="young" x={760} y={FL} s={1.05} face={-1} pose={H(KNEEL, { head: 26, lean: 16, aFs: 60, aFe: 40 })} shadow={0} />
      </g>
      <rect width={1080} height={1920} fill="#1A0E06" opacity={0.25} />
      <ShelfPhone lit={on} count={count} />
    </Cam>
  );
};

// ---------- 10b: рисуют вместе ----------
export const S10b: React.FC<SceneProps> = ({ lf, len }) => {
  const scrib = Math.sin(lf * 1.1);
  const bPose = H(CROUCH, { head: 26, aFs: 62 + scrib * 5, aFe: 30 + scrib * 6 });
  const dPose = H(KNEEL, { head: 24, lean: 18, aFs: 58 - scrib * 3, aFe: 36, aBs: 20, aBe: 30 });
  return (
    <Cam s={lerp(1.0, 1.08, lf / len)} cx={560} cy={1300} dy={-170}>
      <LivingRoom night={0.35} frame />
      <rect x={830} y={742} width={56} height={18} rx={4} fill="#1B1D25" />
      <Person kind="boy" x={360} y={FL} s={0.8} face={1} pose={bPose} />
      <Person kind="young" x={770} y={FL} s={1.05} face={-1} pose={dPose} />
      <CoffeeTable x={560} w={380} />
      <rect x={470} y={FL - 158} width={180} height={8} fill="#FBF6EA" />
      <Crayons x={600} y={FL - 168} s={0.6} />
    </Cam>
  );
};

// ---------- 11: новый рисунок ----------
export const S11: React.FC<SceneProps> = ({ lf, len }) => {
  const fix = eo(ramp(lf, 4, 22));
  const heart = eo(ramp(lf, 22, 32)) * (1 + 0.15 * Math.sin(cl((lf - 22) / 10) * Math.PI));
  return (
    <g>
      <rect width={1080} height={1920} fill="#2A2018" />
      <Cam s={lerp(1.0, 1.08, lf / len)} cx={540} cy={860}>
        <g transform="translate(540 860) scale(1.12)">
          <KidDrawing fixed={fix} heart={heart} />
        </g>
      </Cam>
    </g>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  sc01: S01,
  sc02: S02,
  sc03: S03,
  sc04: S04,
  sc05: S05,
  sc06a: S06a,
  sc06b: S06b,
  sc07a: S07a,
  sc07b: S07b,
  sc07c: S07c,
  sc07d: S07d,
  sc09: S09,
  sc10a: S10a,
  sc10b: S10b,
  sc11: S11,
};
