import React from "react";
import { Easing, interpolate, random } from "remotion";
import { BackFigure, CROUCH, Person, Pose, STAND, walk } from "../qagaz2/art";
import { Bell, CorridorPersp, CorridorSide, FLOOR } from "../qagaz2/sets";
import { handAt } from "../keyin/props";
import { MONO } from "../deepfake/theme";
import { MONT } from "../qagaz/theme";
import { Lit, N, Snow } from "./fx";
import {
  BackDoor,
  Board,
  BoardText,
  Ceiling,
  DeskFront,
  Flashlight,
  Hall,
  HallLetterL,
  HandleDoor,
  LOBBY_GLASS,
  Lobby,
  Memorial,
  SchoolExt,
  Stairs,
  StairsUp,
  TeacherDesk,
  TeacherRoom,
  UnderDesks,
} from "./sets";
import { STEP_HITS, STEPS_AT, endIn, sec, shotStart, startIn, wordIn } from "./timeline";

type SP = { lf: number; len: number };
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const p = (f: number, a: number, d: number, e = Easing.bezier(0.33, 0, 0.2, 1)) => interpolate(f, [a, a + Math.max(1, d)], [0, 1], { ...CL, easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hand = (lf: number, amp = 1) => ({ x: Math.sin(lf * 0.11) * 7 * amp + Math.sin(lf * 0.37) * 3 * amp, y: Math.cos(lf * 0.09) * 6 * amp, r: Math.sin(lf * 0.07) * 1.2 * amp });
const Cam: React.FC<{ s?: number; ox?: number; oy?: number; x?: number; y?: number; r?: number; children: React.ReactNode }> = ({ s = 1, ox = 540, oy = 960, x = 0, y = 0, r = 0, children }) => (
  <g transform={`translate(${x} ${y}) translate(${ox} ${oy}) rotate(${r}) scale(${s}) translate(${-ox} ${-oy})`}>{children}</g>
);
// проекция коридора CorridorPersp (значения по умолчанию)
const PR = (X: number, Y: number, z: number, camZ = 0): [number, number] => {
  const d = Math.max(0.05, z - camZ);
  return [540 + (X * 720) / d, 800 + (Y * 720) / d];
};

const LOOK_UP: Pose = { ...STAND, head: -30, lean: -6, aFs: 10, aBs: -6 };

// ---------- 01: запись — коридор, потом звонок ----------
const Sc01a: React.FC<SP> = ({ lf }) => {
  const h = hand(lf, 1.4);
  return (
    <g filter="url(#tn-nv)">
      <Cam s={1.06} x={h.x} y={h.y} r={h.r}>
        <CorridorPersp camZ={0.25 + lf * 0.004} glow={0.6} />
      </Cam>
    </g>
  );
};
const Sc01b: React.FC<SP> = ({ lf }) => {
  const h = hand(lf, 2);
  return (
    <g filter="url(#tn-nv)">
      <Cam s={1.05 + lf * 0.0016} x={h.x} y={h.y} r={h.r} oy={940}>
        <Bell t={lf / 30} ring={1} />
      </Cam>
    </g>
  );
};

// ---------- 02: школа снаружи, горит одно окно ----------
const Sc02: React.FC<SP> = ({ lf, len }) => (
  <g>
    <Cam s={1 + 0.1 * (lf / len)} ox={760} oy={900}>
      <SchoolExt f={lf} lit={1} />
    </Cam>
    <Snow f={lf} n={60} opacity={0.7} />
    <g opacity={p(lf, 6, 10)}>
      <rect x={330} y={262} width={420} height={60} rx={6} fill="rgba(8,10,18,0.8)" stroke="rgba(255,201,120,0.45)" strokeWidth={2} />
      <text x={540} y={304} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} letterSpacing="0.08em" fill={N.warm}>
        9-СЫНЫП · 21:40
      </text>
    </g>
  </g>
);

// ---------- 03: актовый зал ----------
const Balloons: React.FC<{ at: { x: number; y: number }; f: number }> = ({ at, f }) => (
  <g>
    {[
      [-40, -300, "#E94F5A"],
      [20, -350, "#F2B632"],
      [-90, -360, "#3E9BD6"],
      [-20, -420, "#5DBB63"],
    ].map(([dx, dy, c], i) => {
      const bx = at.x + (dx as number) + Math.sin(f * 0.05 + i) * 8;
      const by = at.y + (dy as number) + Math.cos(f * 0.06 + i) * 6;
      return (
        <g key={i}>
          <line x1={at.x} y1={at.y} x2={bx} y2={by + 46} stroke="#DDD" strokeWidth={2} />
          <ellipse cx={bx} cy={by} rx={40} ry={48} fill={c as string} />
          <ellipse cx={bx - 12} cy={by - 16} rx={9} ry={14} fill="#FFF" opacity={0.45} />
        </g>
      );
    })}
  </g>
);
const Sc03: React.FC<SP> = ({ lf, len }) => {
  const late = p(lf, wordIn("n1", 10, "sc03") - 4, 22, Easing.inOut(Easing.cubic));
  const clock = lerp(0.83, 1.55, late);
  const dPose: Pose = { ...STAND, aFs: 165 + Math.sin(lf * 0.1) * 4, aFe: 14, aBs: 150, aBe: 26, head: -16 };
  const dHand = handAt(dPose, 820, 1020, 0.82, -1);
  const mPose: Pose = { ...STAND, aFs: 118, aFe: 18, head: -10 };
  const mHand = handAt(mPose, 300, 1300, 0.9, 1);
  return (
    <Cam s={1.04 - 0.04 * (lf / len)}>
      <Hall f={lf} clock={clock} />
      <ellipse cx={540} cy={1320} rx={520} ry={60} fill="#FFD9A0" opacity={0.18} filter="url(#blur20)" />
      <Person kind="boy" x={820} y={1020} s={0.82} face={-1} pose={dPose} />
      <HallLetterL x={dHand.x} y={dHand.y + 30} />
      <Balloons at={mHand} f={lf} />
      <Person kind="aruzhan" x={300} y={1300} s={0.9} face={1} pose={mPose} />
      <Person kind="teen" x={540} y={1300} s={0.9} face={1} pose={{ ...STAND, aFs: 68, aFe: 34, aBs: 58, aBe: 44, head: -8 }} carry="stack" stackN={7} />
    </Cam>
  );
};

// ---------- 04: дверь заперли снаружи ----------
const Sc04: React.FC<SP> = ({ lf }) => {
  const lockAt = wordIn("n2", 6, "sc04");
  const away = p(lf, lockAt + 10, 40);
  const kids = p(lf, wordIn("n2", 7, "sc04") - 4, 22, Easing.out(Easing.cubic));
  const pushT = lf - (wordIn("n2", 7, "sc04") + 20);
  const shake = pushT > 0 && pushT < 18 ? Math.sin(pushT * 2.4) * 6 * (1 - pushT / 18) : 0;
  const ax = lerp(560, 120, away);
  return (
    <g>
      <Lobby f={lf} shake={shake} />
      <clipPath id="tn-glass">
        {LOBBY_GLASS.map((g, i) => (
          <rect key={i} x={g.x + shake} y={g.y} width={g.w} height={g.h} />
        ))}
      </clipPath>
      <g clipPath="url(#tn-glass)">
        <Snow f={lf} n={40} opacity={0.8} />
        <g filter="url(#tn-sil)">
          <Person kind="apa" x={ax} y={1560} s={1.25} face={away > 0 ? -1 : 1} pose={away > 0 ? walk(lf * 0.35, 0.8) : { ...STAND, aFs: 70, aFe: 30 }} />
        </g>
      </g>
      {lf >= lockAt && lf < lockAt + 8 ? <circle cx={540} cy={1122} r={40 + (lf - lockAt) * 6} fill="none" stroke={N.warm} strokeWidth={4} opacity={1 - (lf - lockAt) / 8} /> : null}
      {kids > 0 ? (
        <g opacity={kids}>
          {[
            [380, 0],
            [560, 0.5],
            [740, 1],
          ].map(([x, d], i) => (
            <g key={i} filter="url(#tn-moon)">
              <BackFigure x={x + (1 - kids) * (200 + i * 60)} y={lerp(2050, 1720, kids) + d * 10} h={lerp(1100, 820, kids)} kind={(["teen", "boy", "aruzhan"] as const)[i]} ph={lf * 0.6 * (1 - kids) + i} rim={0.15} />
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
};

// ---------- 05: телефон «Желі жоқ» ----------
const Sc05: React.FC<SP> = ({ lf }) => {
  const r = Math.sin(lf * 0.9) * 0.7 + Math.sin(lf * 0.31) * 0.6;
  return (
    <g>
      <g filter="url(#tn-night)" opacity={0.7}>
        <CorridorPersp camZ={1.2} glow={0.2} />
      </g>
      <rect width={1080} height={1920} fill="#04060C" opacity={0.55} />
      <circle cx={540} cy={860} r={460} fill="#6FA4FF" opacity={0.16} filter="url(#tn-blur40)" />
      <g transform={`rotate(${r} 540 900)`}>
        {/* пальцы сзади */}
        <rect x={250} y={760} width={90} height={70} rx={34} fill="#B88262" />
        <rect x={250} y={860} width={90} height={70} rx={34} fill="#B88262" />
        <rect x={290} y={360} width={500} height={1000} rx={70} fill="#111520" stroke="#2A3142" strokeWidth={4} />
        <rect x={306} y={376} width={468} height={968} rx={58} fill="url(#tn-screen)" />
        <rect x={470} y={392} width={140} height={34} rx={17} fill="#000" />
        <text x={540} y={640} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={150} fill="#EAF1FF">
          22:41
        </text>
        <text x={540} y={700} textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize={30} fill="#9DB3DA">
          сенбі
        </text>
        <g transform="translate(540 880)">
          <rect x={-190} y={-60} width={380} height={120} rx={60} fill="rgba(255,75,75,0.16)" stroke={N.red} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-168 + i * 18} y={10 - i * 14} width={12} height={14 + i * 14} rx={3} fill="#5C6783" />
          ))}
          <path d="M -178 -26 L -100 26 M -100 -26 L -178 26" stroke={N.red} strokeWidth={7} strokeLinecap="round" />
          <text x={58} y={16} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={46} fill="#FFFFFF">
            Желі жоқ
          </text>
        </g>
        <text x={540} y={1010} textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize={28} fill="#9DB3DA">
          тек SOS қоңыраулары
        </text>
        <text x={720} y={420} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={24} fill={N.red}>
          9%
        </text>
        <rect x={730} y={403} width={30} height={16} rx={3} fill="none" stroke="#9DB3DA" strokeWidth={2} />
        <rect x={733} y={406} width={4} height={10} fill={N.red} />
        {/* большой палец спереди */}
        <rect x={720} y={930} width={130} height={86} rx={42} fill="#C99272" transform="rotate(-24 780 970)" />
      </g>
      <defs>
        <linearGradient id="tn-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B3160" />
          <stop offset="1" stopColor="#0B1430" />
        </linearGradient>
      </defs>
    </g>
  );
};

// ---------- 06: 1 — мел пишет сам ----------
const Sc06: React.FC<SP> = ({ lf, len }) => {
  const a = wordIn("n3", 3, "sc06");
  const write = p(lf, a, 76, Easing.linear);
  const wx = lerp(160, 920, write);
  return (
    <g>
      <Cam s={1 + 0.05 * (lf / len)} oy={820}>
        <Lit id="b6" beams={[{ x: 560, y: 1650, tx: lerp(380, wx, Math.min(1, write * 1.2)), ty: 840, w: 300, k: 0.9 }]}>
          <Board f={lf} write={write} />
        </Lit>
        <BoardText write={write} />
      </Cam>
      {[
        [300, "teen"],
        [560, "aruzhan"],
        [820, "boy"],
      ].map(([x, k], i) => (
        <g key={i} filter="url(#tn-sil)">
          <BackFigure x={(x as number) + Math.sin(lf * 0.05 + i) * 3} y={2440} h={900} kind={k as "teen"} ph={0} rim={0} />
        </g>
      ))}
    </g>
  );
};

// ---------- 07: 2 — шаги наверху ----------
const Sc07a: React.FC<SP> = ({ lf }) => {
  const hp = handAt({ ...LOOK_UP, aFs: 150, aFe: 10 }, 250, 1450, 0.9, 1);
  return (
    <Cam s={1.02 + lf * 0.0008}>
      <Lit id="b7" beams={[{ x: hp.x, y: hp.y, tx: 860, ty: 560, w: 200, k: 0.8 }]} night="tn-moon">
        <Stairs f={lf} />
        <Person kind="teen" x={120} y={1450} s={0.9} face={1} pose={{ ...LOOK_UP, head: -26 }} />
        <Person kind="boy" x={380} y={1450} s={0.86} face={1} pose={{ ...LOOK_UP, head: -34, aFs: 30, aFe: 60 }} />
        <Person kind="aruzhan" x={250} y={1450} s={0.9} face={1} pose={{ ...LOOK_UP, aFs: 150, aFe: 10 }} />
      </Lit>
    </Cam>
  );
};
const Sc07b: React.FC<SP> = ({ lf }) => {
  const s0 = sec(STEPS_AT()) - shotStart("sc07b");
  const hits = STEP_HITS.map((h) => s0 + sec(h));
  return (
    <Cam s={1.02}>
      <Ceiling f={lf} hits={hits} />
    </Cam>
  );
};
const Sc07c: React.FC<SP> = ({ lf, len }) => (
  <Cam s={1 + 0.07 * (lf / len)} oy={600}>
    <StairsUp f={lf} />
  </Cam>
);

// ---------- 08: 3 — звонок; запись: свет мигает, девочка ближе ----------
const Sc08a: React.FC<SP> = ({ lf, len }) => (
  <g filter="url(#tn-moon)">
    <Cam s={1.08 + 0.05 * (lf / len)} oy={940}>
      <Bell t={lf / 30} ring={0.08 * p(lf, len - 10, 10)} />
    </Cam>
  </g>
);
export const FLICK = (lf: number, f0: number) => {
  // 1 — свет есть, 0 — темно; ghost: где стоит девочка (z) в этот момент
  const k = lf - f0;
  if (k < 0) return { on: 1, z: 0 };
  const seq: [number, number, number][] = [
    [0, 3, 0],
    [3, 10, 11.5],
    [10, 14, 0],
    [14, 21, 6.5],
    [21, 24, 0],
    [24, 31, 3.3],
    [31, 9999, 0],
  ];
  for (const [a, b, z] of seq) if (k >= a && k < b) return { on: z > 0 || k < 3 ? (z > 0 ? 1 : 0) : 0, z };
  return { on: 0, z: 0 };
};
const Sc08b: React.FC<SP> = ({ lf, len }) => {
  const f0 = endIn("n5", "sc08b") + 6;
  const fl = FLICK(lf, f0);
  const dark = lf >= f0 + 31;
  const beamT = p(lf, f0 + 40, len - f0 - 40, Easing.in(Easing.quad));
  const h = hand(lf, 1.6);
  const ghost = fl.z > 0 ? (() => {
    const [gx, gy] = PR(0.15, 1.55, fl.z, 0.3);
    const s = (1.45 * 720) / (fl.z - 0.3) / 540;
    return { gx, gy, s };
  })() : null;
  const [bx, by] = PR(-0.1, 0.2, lerp(15, 6, beamT), 0.3);
  return (
    <g>
      <g filter="url(#tn-nv)">
        <Cam s={1.06} x={h.x} y={h.y} r={h.r}>
          <g opacity={dark ? 0 : fl.on ? 0.55 : 0.08}>
            <CorridorPersp camZ={0.3} glow={0.3} />
          </g>
          {dark ? <rect width={1080} height={1920} fill="#000" /> : null}
          {beamT > 0 ? (
            <g>
              <circle cx={bx} cy={by} r={lerp(10, 34, beamT)} fill="#FFFFFF" />
              <circle cx={bx} cy={by} r={lerp(60, 180, beamT)} fill="#FFFFFF" opacity={0.35} filter="url(#blur20)" />
              <polygon points={`${bx},${by} ${bx - 160 - beamT * 200},${1920} ${bx + 160 + beamT * 200},${1920}`} fill="#FFFFFF" opacity={0.07 + 0.06 * beamT} />
            </g>
          ) : null}
        </Cam>
      </g>
      {ghost ? (
        <Cam s={1.06} x={h.x} y={h.y} r={h.r}>
          <ellipse cx={ghost.gx} cy={ghost.gy - 270 * ghost.s} rx={220 * ghost.s} ry={360 * ghost.s} fill="#C8FFD4" opacity={0.18} filter="url(#blur20)" />
          <g filter="url(#tn-ghostnv)">
            <Person kind="girl90" x={ghost.gx} y={ghost.gy} s={ghost.s} face={-1} pose={{ ...STAND, head: 14, aFs: -2, aBs: 2, aFe: 4, aBe: 4 }} shadow={0} />
          </g>
        </Cam>
      ) : null}
    </g>
  );
};

// ---------- 09: бег ----------
const Sc09: React.FC<SP> = ({ lf }) => {
  const sh = Math.sin(lf * 1.3) * 26 + (random(`rn${lf}`) - 0.5) * 30;
  return (
    <g filter="url(#tn-nv)">
      <Cam s={1.25} r={-9 + Math.sin(lf * 0.6) * 5} x={sh} y={Math.cos(lf * 1.1) * 24}>
        <CorridorSide sx={1200 + lf * 60} light={0.2} />
      </Cam>
    </g>
  );
};

// ---------- 10: под партами, ручка, дверь ----------
const Sc10a: React.FC<SP> = ({ lf }) => {
  const br = (i: number) => Math.sin(lf * 0.5 + i * 1.7) * 5;
  return (
    <Cam s={1.03}>
      <g filter="url(#tn-moon)">
        <UnderDesks f={lf} />
        <Person kind="boy" x={170} y={1520} s={1.1} face={1} pose={{ ...CROUCH, drop: 130 + br(0) }} />
        <Person kind="aruzhan" x={400} y={1520} s={1.1} face={1} pose={{ ...CROUCH, drop: 130 + br(1), head: 30 }} />
        <Person kind="teen" x={790} y={1520} s={1.1} face={1} pose={{ ...CROUCH, drop: 130 + br(2), head: 8 }} />
      </g>
      <g filter="url(#tn-sil)">
        <DeskFront x={250} y={720} s={1.3} />
        <DeskFront x={870} y={720} s={1.3} />
      </g>
    </Cam>
  );
};
const Sc10b: React.FC<SP> = ({ lf }) => (
  <Cam s={1.05 + lf * 0.001} oy={1000}>
    <g filter="url(#tn-moon)">
      <HandleDoor f={lf} turn={p(lf, 8, 40, Easing.inOut(Easing.quad))} light={p(lf, 0, 20)} />
    </g>
    <HandleDoorGlow lf={lf} />
  </Cam>
);
const HandleDoorGlow: React.FC<{ lf: number }> = ({ lf }) => (
  <ellipse cx={540 + Math.sin(lf * 0.08) * 200} cy={1600} rx={300} ry={40} fill={N.beam} opacity={0.35 * p(lf, 0, 20)} filter="url(#blur20)" style={{ mixBlendMode: "screen" }} />
);
const Sc10c: React.FC<SP> = ({ lf, len }) => {
  const open = p(lf, 0, 26, Easing.out(Easing.cubic));
  const sweep = p(lf, 8, len - 8, Easing.inOut(Easing.quad));
  const leafW = lerp(230, 40, open);
  return (
    <g>
      <Lit id="b10" beams={open > 0.2 ? [{ x: 880, y: 1000, tx: lerp(820, 160, sweep), ty: lerp(1380, 1250, sweep), w: 260, k: open }] : []}>
        <rect width={1080} height={1920} fill="#2C2A33" />
        <rect y={1450} width={1080} height={470} fill="#5A3A22" />
        <rect x={0} y={760} width={720} height={150} fill="#2F6B66" />
        {/* дверной проём справа */}
        <rect x={760} y={640} width={250} height={810} fill="#0A0A10" />
        <rect x={760} y={640} width={250} height={810} fill="#B8CCF0" opacity={0.25 * open} />
        <polygon points={`760,640 ${760 + leafW},${640 + (1 - open) * 0 + open * 50} ${760 + leafW},${1450 - open * 50} 760,1450`} fill="#7B4B28" />
        {/* парты */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={60 + i * 230} y={1240 + i * 30} width={200} height={26} fill="#9C6438" />
            <rect x={70 + i * 230} y={1266 + i * 30} width={14} height={180} fill="#54311A" />
            <rect x={240 + i * 230} y={1266 + i * 30} width={14} height={180} fill="#54311A" />
          </g>
        ))}
      </Lit>
      <g filter="url(#tn-sil)">
        <BackFigure x={200} y={2250} h={760} kind="aruzhan" ph={0} rim={0} />
        <BackFigure x={430} y={2300} h={800} kind="boy" ph={0} rim={0} />
      </g>
    </g>
  );
};

// ---------- 11: сторож в дверях ----------
const WPOSE: Pose = { ...STAND, aFs: 62, aFe: 8, aBs: -6, head: 8, lean: 4 };
const Sc11: React.FC<SP> = ({ lf, len }) => {
  const lower = p(lf, startIn("a1", "sc11") + 30, 40);
  const pose: Pose = { ...WPOSE, aFs: lerp(62, 40, lower) };
  const hp = handAt(pose, 560, 1460, 1.12, -1);
  const rot = 180 + lerp(28, 42, lower);
  const rad = (rot * Math.PI) / 180;
  const hx = hp.x + Math.cos(rad) * 134 * 0.8;
  const hy = hp.y + Math.sin(rad) * 134 * 0.8;
  return (
    <Cam s={1.06 - 0.04 * (lf / len)} oy={1000}>
      <Lit id="b11" beams={[{ x: hx, y: hy, tx: lerp(120, 200, lower), ty: lerp(1350, 1700, lower), w: 330, k: 1 }]}>
        <rect width={1080} height={1920} fill="#2A2630" />
        <rect y={1460} width={1080} height={460} fill="#5A3A22" />
        <rect x={300} y={500} width={480} height={960} fill="#3A4E78" />
        <rect x={300} y={500} width={480} height={960} fill="#A9C2F0" opacity={0.25} />
        <rect x={280} y={480} width={520} height={20} fill="#54311A" />
        <rect x={280} y={480} width={20} height={980} fill="#54311A" />
        <rect x={780} y={480} width={20} height={980} fill="#54311A" />
        <Person kind="master" x={560} y={1460} s={1.12} face={-1} pose={pose} />
        <Flashlight x={hp.x} y={hp.y} rot={rot} s={0.8} on={1} />
      </Lit>
      <circle cx={hx} cy={hy} r={150} fill="#FFF6DC" opacity={0.55} filter="url(#tn-blur40)" style={{ mixBlendMode: "screen" }} />
    </Cam>
  );
};

// ---------- 12: задняя дверь, фонарь в руки ----------
const Sc12a: React.FC<SP> = ({ lf, len }) => {
  const k = lf / len;
  return (
    <g>
      <Cam s={1.02}>
        <BackDoor f={lf} open={1} />
        <g filter="url(#tn-sil)">
          <Person kind="master" x={480} y={1500} s={0.85} face={1} pose={{ ...STAND, aFs: 20, aFe: 30 }} />
        </g>
        <g filter="url(#tn-moon)">
          {(["teen", "aruzhan", "boy"] as const).map((kind, i) => (
            <Person key={kind} kind={kind} x={lerp(560 + i * 110, 900 + i * 110, k)} y={1700 + i * 18} s={0.8} face={1} pose={walk(lf * 0.32 + i * 1.3, 0.9)} />
          ))}
        </g>
      </Cam>
      <Snow f={lf} n={70} opacity={0.8} wind={1} />
    </g>
  );
};
const Sc12b: React.FC<SP> = ({ lf }) => {
  const give = p(lf, 10, 30, Easing.inOut(Easing.cubic));
  const fx = lerp(430, 640, give);
  const oldOut = p(lf, 44, 20);
  return (
    <g>
      <rect width={1080} height={1920} fill="#0B0A10" />
      <ellipse cx={300} cy={900} rx={520} ry={700} fill={N.warm} opacity={0.35} filter="url(#tn-blur40)" />
      {/* рука старика */}
      <g transform={`translate(${lerp(0, -200, oldOut)} 0)`}>
        <rect x={-120} y={960} width={430} height={150} rx={50} fill="#5E3F27" />
        <ellipse cx={330} cy={1035} rx={90} ry={70} fill="#B98060" />
      </g>
      <Flashlight x={fx} y={1010} rot={-8} s={1.7} />
      {/* рука Дамира */}
      <g transform={`translate(${lerp(260, 0, give)} 0)`}>
        <rect x={760} y={1010} width={420} height={140} rx={48} fill="#22325A" />
        <ellipse cx={740} cy={1060} rx={84} ry={64} fill="#E3B08A" opacity={give > 0.6 ? 1 : 0.95} />
      </g>
      <Snow f={lf} n={30} opacity={0.6} />
    </g>
  );
};

// ---------- 13: «Түнде мектеп — басқалардікі» — дверь закрывается ----------
const Sc13: React.FC<SP> = ({ lf }) => {
  const close = p(lf, endIn("a2", "sc13") + 4, 30, Easing.inOut(Easing.cubic));
  const w = 480 * (1 - close);
  return (
    <g>
      <rect width={1080} height={1920} fill={N.wall} />
      <rect x={290} y={360} width={500} height={1110} fill="#090608" />
      <rect x={300} y={380} width={w} height={1080} fill={N.warm} />
      <clipPath id="tn-door13">
        <rect x={300} y={380} width={w} height={1080} />
      </clipPath>
      <g clipPath="url(#tn-door13)">
        <rect x={300} y={380} width={480} height={1080} fill="#FFE2A8" opacity={0.35} />
        <g filter="url(#tn-sil)">
          <Person kind="master" x={520} y={1460} s={1.35} face={1} pose={{ ...STAND, head: 6, aFs: 8 }} />
        </g>
      </g>
      <rect x={300 + w} y={380} width={480 - w} height={1080} fill="#2A1D14" />
      <polygon points={`300,1470 ${300 + w},1470 ${360 + w * 1.6},1920 240,1920`} fill={N.warm} opacity={0.2} />
      <rect y={1470} width={1080} height={450} fill="#1E283F" opacity={0.85} />
      <Snow f={lf} n={60} opacity={0.75} wind={0.8} />
    </g>
  );
};

// ---------- 14: утро ----------
const Sc14: React.FC<SP> = ({ lf }) => (
  <g>
    <CorridorSide sx={400 + lf * 5} light={1} />
    {(["teen", "aruzhan", "boy"] as const).map((kind, i) => (
      <Person key={kind} kind={kind} x={200 + i * 150 + lf * 2.2} y={FLOOR + 10} s={0.95} face={1} pose={walk(lf * 0.3 + i * 1.1, 0.8)} />
    ))}
  </g>
);

// ---------- 15: учительская ----------
const Sc15: React.FC<SP> = ({ lf }) => {
  const turn = lf >= 6;
  return (
    <Cam s={1.02 + lf * 0.0006}>
      <TeacherRoom />
      <TeacherDesk x={780} />
      <Person kind="teacher" x={780} y={1450} s={0.95} face={turn ? -1 : 1} pose={{ ...STAND, head: turn ? -4 : 10, lean: turn ? -3 : 6, aFs: 30, aFe: 40 }} />
      <Person kind="teen" x={170} y={1460} s={0.92} face={1} pose={STAND} />
      <Person kind="aruzhan" x={310} y={1460} s={0.92} face={1} pose={{ ...STAND, head: 6 }} />
      <Person kind="boy" x={450} y={1460} s={0.92} face={1} pose={{ ...STAND, aFs: 40, aFe: 70 }} />
    </Cam>
  );
};

// ---------- 16: фото с чёрной лентой ----------
const Sc16: React.FC<SP> = ({ lf, len }) => {
  const pose: Pose = { ...STAND, aFs: 70, aFe: 60, head: 4 };
  const hp = handAt(pose, 540, 1330, 1.7, 1);
  return (
    <Cam s={1 + 0.09 * p(lf, 0, len, Easing.linear)} oy={760}>
      <Memorial>
        <rect x={258} y={278} width={564} height={704} fill="#8F8777" />
        <Person kind="master" x={540} y={1330} s={1.7} face={1} pose={pose} shadow={0} />
        <Flashlight x={hp.x} y={hp.y} rot={-20} s={1.2} />
      </Memorial>
    </Cam>
  );
};

// ---------- 17: фонарь включается сам ----------
const Sc17: React.FC<SP> = ({ lf }) => {
  const on = lf >= 30 ? 1 : 0;
  const fl = lf >= 30 && lf < 40 ? (lf % 3 === 0 ? 0.3 : 1) : on;
  return (
    <g>
      <g filter="url(#tn-blur3)">
        <CorridorSide sx={900} light={1} />
      </g>
      <rect width={1080} height={1920} fill="#0B0A10" opacity={0.35 * on} />
      {on ? <polygon points={`420,960 -200,560 -200,1500`} fill="#FFF6DC" opacity={0.3 * fl} filter="url(#tn-blur3)" /> : null}
      <rect x={560} y={1030} width={600} height={170} rx={60} fill="#22325A" transform="rotate(-12 560 1030)" />
      <Flashlight x={520} y={1000} rot={192} s={2.2} on={fl} />
      <ellipse cx={590} cy={1050} rx={110} ry={86} fill="#E3B08A" />
    </g>
  );
};

// ---------- 18: школа ночью, фонарь ходит от окна к окну ----------
const Sc18: React.FC<SP> = ({ lf, len }) => (
  <g>
    <Cam s={1.08 - 0.06 * (lf / len)} oy={1000}>
      <SchoolExt f={lf} lit={0} patrol={lerp(-0.4, 5.6, lf / len)} />
    </Cam>
    <Snow f={lf} n={70} opacity={0.7} />
  </g>
);

export const SCENES: Record<string, React.FC<SP>> = {
  sc01a: Sc01a,
  sc01b: Sc01b,
  sc02: Sc02,
  sc03: Sc03,
  sc04: Sc04,
  sc05: Sc05,
  sc06: Sc06,
  sc07a: Sc07a,
  sc07b: Sc07b,
  sc07c: Sc07c,
  sc08a: Sc08a,
  sc08b: Sc08b,
  sc09: Sc09,
  sc10a: Sc10a,
  sc10b: Sc10b,
  sc10c: Sc10c,
  sc11: Sc11,
  sc12a: Sc12a,
  sc12b: Sc12b,
  sc13: Sc13,
  sc14: Sc14,
  sc15: Sc15,
  sc16: Sc16,
  sc17: Sc17,
  sc18: Sc18,
};
