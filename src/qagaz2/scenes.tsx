import React from "react";
import { random } from "remotion";
import { BOUND, COLLIDE, FPS, START, AUDIO, sec } from "../qagaz/timeline";
import { BOW, CROUCH, HUG, KNEEL, P, Person, Pose, ReachHand, SIT, STAND, Stack, Notebook, BackFigure, KidFront, mix, run, walk } from "./art";
import { Bell, ClassroomBG, ClockHands, CorridorPersp, CorridorSide, Desk, FloorTop, Pit, TopFigure } from "./sets";

export type SceneProps = { lf: number; len: number; f: number };

const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ez = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const H = (pose: Pose, extra: Partial<Pose>): Pose => ({ ...pose, ...extra });
// время слова реплики в кадрах относительно начала плана
const wordAt = (id: string, i: number, shot: string) => sec(START[id] + AUDIO[id].words[i].start) - sec(BOUND[shot]);

// Камера: масштаб вокруг точки (cx, cy)
const Cam: React.FC<{ s: number; cx?: number; cy?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ s, cx = 540, cy = 960, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);

// Разбросанные листы на полу (вид сбоку)
const FloorPapers: React.FC<{ x0: number; x1: number; y: number; n: number; seed: string }> = ({ x0, x1, y, n, seed }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const x = lerp(x0, x1, random(`${seed}x${i}`));
      const yy = y + random(`${seed}y${i}`) * 120;
      const w = 70 + random(`${seed}w${i}`) * 40;
      return (
        <g key={i} transform={`translate(${x} ${yy}) skewX(${(random(`${seed}k${i}`) - 0.5) * 50})`}>
          <ellipse cx={4} cy={6} rx={w * 0.6} ry={8} fill="#000" opacity={0.2} />
          <rect x={-w / 2} y={-6} width={w} height={11} rx={2} fill={i % 5 === 0 ? "#7FA7C9" : P.paper} stroke={P.paperDk} strokeWidth={1} />
        </g>
      );
    })}
  </g>
);

// ---------- крючок (контент полосы) ----------
export const HookScene: React.FC<SceneProps> = ({ lf }) => {
  const sx = 200 + lf * 16;
  return (
    <g>
      <CorridorSide sx={sx} />
      <Person kind="young" x={520} y={1660} s={1.32} pose={H(run(lf * 0.42, 0.85), HUG)} carry="stack" stackN={22} stackWobble={Math.sin(lf * 0.4) * 0.8} />
    </g>
  );
};

// ---------- 2: все бегут на урок ----------
export const S02: React.FC<SceneProps> = ({ lf }) => {
  const sx = 1500 + lf * 5;
  const kids = new Array(8).fill(0).map((_, i) => {
    const dir = random(`kd${i}`) > 0.35 ? 1 : -1;
    const sp = 9 + random(`ks${i}`) * 7;
    const y = 1540 + random(`ky${i}`) * 260;
    const s = 0.95 + (y - 1540) / 600;
    const x0 = dir > 0 ? -150 - random(`kx${i}`) * 600 : 1230 + random(`kx${i}`) * 600;
    return { i, dir, x: x0 + dir * sp * lf * 1.6, y, s, ph: lf * 0.5 + i };
  });
  const order = [...kids].sort((a, b) => a.y - b.y);
  return (
    <Cam s={1.02 + lf * 0.0006}>
      <CorridorSide sx={sx} />
      <Person kind="young" x={300 + lf * 3} y={1520} s={1.0} pose={H(walk(lf * 0.3, 1.2), HUG)} carry="stack" stackN={18} />
      {order.map((k) => (
        <Person key={k.i} kind="boy" x={k.x} y={k.y} s={k.s * 1.15} face={k.dir as 1 | -1} pose={run(k.ph, 0.9)} />
      ))}
    </Cam>
  );
};

// ---------- 3: звонок ----------
export const S03: React.FC<SceneProps> = ({ lf, len }) => (
  <Cam s={1 + (lf / len) * 0.08}>
    <Bell t={lf / FPS} ring={1} />
  </Cam>
);

// ---------- 4: спешит, смотрит на часы ----------
export const S04: React.FC<SceneProps> = ({ lf }) => {
  const look = cl((lf - 18) / 8) * (1 - cl((lf - 52) / 8));
  return (
    <Cam s={1.0}>
      <CorridorSide sx={3300 + lf * 11} />
      <Person
        kind="young"
        x={470}
        y={1760}
        s={1.62}
        pose={H(walk(lf * 0.42, 1.25), { aBs: 45, aBe: 80, aFs: lerp(55, 85, look), aFe: lerp(75, 120, look), head: lerp(4, 28, look) })}
        carry="stack"
        stackN={20}
        stackWobble={Math.sin(lf * 0.35) * 0.6}
      />
    </Cam>
  );
};

// ---------- 5: столкновение ----------
const Collision: React.FC<{ lf: number }> = ({ lf }) => {
  const c = sec(COLLIDE) - sec(BOUND.sh05); // кадр удара
  const tx = Math.min(lf, c) * 8.5 + 150 + Math.max(0, lf - c) * -1.5;
  const bx = 760 - Math.min(lf, c) * 13.5 + Math.max(0, lf - c) * 2;
  const fall = eo((lf - c) / 12);
  const tPose = lf < c ? H(walk(lf * 0.42, 1.2), HUG) : mix(H(walk(c * 0.42, 1.2), HUG), SIT, fall);
  const bPose = lf < c ? run(lf * 0.55, 1) : mix(run(c * 0.55, 1), KNEEL, fall);
  const tRot = lf < c ? 0 : -Math.sin(fall * Math.PI) * 35;
  const bRot = lf < c ? 0 : Math.sin(fall * Math.PI) * 28;
  const kick = lf >= c ? Math.exp(-(lf - c) / 5) : 0;
  return (
    <Cam s={1.0 + kick * 0.06} dx={Math.sin(lf * 2.3) * 14 * kick} dy={Math.cos(lf * 2.9) * 10 * kick}>
      <CorridorSide sx={5200} doorOpen={(i) => (i === 5 ? 1 : 0)} />
      {lf > c ? <FloorPapers x0={150} x1={900} y={1600} n={Math.min(16, Math.floor((lf - c) * 0.8))} seed="col" /> : null}
      <Person kind="young" x={tx} y={1680} s={1.3} pose={{ ...tPose, rot: tRot }} carry={lf < c ? "stack" : null} stackN={22} />
      <Person kind="boy" x={bx} y={1700} s={1.15} face={-1} pose={{ ...bPose, rot: bRot }} />
    </Cam>
  );
};
export const S05: React.FC<SceneProps> = ({ lf }) => <Collision lf={lf} />;

// ---------- 6: сверху, оба на полу ----------
const TOP_PAPERS = new Array(22).fill(0).map((_, i) => {
  const a = random(`tpa${i}`) * Math.PI * 2;
  const r = 200 + random(`tpr${i}`) * 560;
  return { x: 540 + Math.cos(a) * r * 0.9, y: 980 + Math.sin(a) * r * 1.2, r: random(`tpo${i}`) * 360, s: 0.8 + random(`tps${i}`) * 0.4 };
});
export const S06: React.FC<SceneProps> = ({ lf, len }) => (
  <Cam s={lerp(1.18, 1.0, eo(lf / len))}>
    <FloorTop papers={TOP_PAPERS} />
    <TopFigure x={420} y={940} s={1.15} rot={150} kind="young" />
    <TopFigure x={690} y={1010} s={0.85} rot={-30} kind="boy" />
  </Cam>
);

// ---------- 7: мальчик вскакивает и бежит в класс ----------
export const S07: React.FC<SceneProps> = ({ lf }) => {
  const up = eo(lf / 10);
  const runT = Math.max(0, lf - 10);
  const bx = 470 + runT * 9;
  const enter = cl((bx - 690) / 120);
  const bPose = lf < 10 ? mix(KNEEL, STAND, up) : run(runT * 0.55, 1);
  return (
    <Cam s={1.0}>
      <CorridorSide sx={5200} doorOpen={(i) => (i === 5 ? 1 : 0)} />
      <FloorPapers x0={150} x1={900} y={1600} n={16} seed="col" />
      <Person kind="young" x={330} y={1680} s={1.3} pose={H(SIT, { head: -6 + Math.sin(lf * 0.1) * 3 })} />
      <Person kind="boy" x={bx} y={lerp(1700, 1480, enter)} s={lerp(1.15, 0.9, enter)} pose={bPose} opacity={1 - cl((enter - 0.6) / 0.4)} />
    </Cam>
  );
};

// ---------- 8: дверь закрывается ----------
export const S08: React.FC<SceneProps> = ({ lf, len }) => {
  const close = ez(cl(lf / (len * 0.8)));
  return (
    <Cam s={1.85} cx={750} cy={1180}>
      <CorridorSide sx={5200} doorOpen={(i) => (i === 5 ? 1 - close : 0)} />
      {lf < 10 ? <rect x={800 - lf * 4} y={1040} width={50} height={130} rx={14} fill="#C7392E" opacity={1 - lf / 10} /> : null}
    </Cam>
  );
};

// ---------- 9: туфли мастера входят в кадр ----------
export const S09: React.FC<SceneProps> = ({ lf }) => {
  const mx = lerp(-260, 150, eo(lf / 30));
  return (
    <Cam s={1.25} cx={540} cy={1700}>
      <CorridorSide sx={5150} />
      <FloorPapers x0={250} x1={1000} y={1590} n={14} seed="s9" />
      <Person kind="young" x={650} y={1690} s={1.25} face={-1} pose={H(KNEEL, { aFs: 85 + Math.sin(lf * 0.3) * 10, aFe: 10, head: 30 })} />
      <defs>
        <clipPath id="legs9">
          <rect x={-400} y={1240} width={1600} height={800} />
        </clipPath>
      </defs>
      <g clipPath="url(#legs9)">
        <Person kind="master" x={mx} y={1860} s={2.0} pose={lf < 30 ? walk(lf * 0.32, 0.9) : STAND} />
      </g>
    </Cam>
  );
};

// ---------- 10: мастер с листом ----------
export const S10: React.FC<SceneProps> = ({ lf, len }) => {
  const lift = eo(lf / 18);
  return (
    <Cam s={lerp(1.0, 1.12, ez(lf / len))} cx={620} cy={1380}>
      <CorridorSide sx={5150} />
      <FloorPapers x0={180} x1={950} y={1590} n={14} seed="s10" />
      <Person kind="young" x={330} y={1690} s={1.25} pose={H(KNEEL, { head: 6, aFs: 40, aFe: 30 })} />
      <Person
        kind="master"
        x={700}
        y={1690}
        s={1.3}
        face={-1}
        pose={H(CROUCH, { aFs: lerp(40, 100, lift), aFe: lerp(30, 40, lift), head: lerp(30, 14, lift) })}
        carry="sheet"
        sheetGlow={lift}
      />
    </Cam>
  );
};

// ---------- 11: молодой не понимает ----------
export const S11: React.FC<SceneProps> = ({ lf }) => {
  const tilt = eo(lf / 14);
  return (
    <Cam s={1.0}>
      <CorridorSide sx={5000} />
      <Person kind="young" x={440} y={1980} s={2.15} pose={H(KNEEL, { ...HUG, head: lerp(4, -14, tilt), lean: lerp(8, -2, tilt) })} carry="stack" stackN={20} />
    </Cam>
  );
};

// ---------- 11b: «жоспарлар, есептер…» — стопка растёт ----------
const LABELS = ["ЖОСПАР", "ЕСЕП", "ЖОСПАР", "ЕСЕП", "ТІЗІМ", "ЕСЕП", "ЖОСПАР", "АНЫҚТАМА"];
export const S11b: React.FC<SceneProps> = ({ lf, len }) => {
  const n = 18 + Math.floor(cl(lf / (len * 0.85)) * 26);
  return (
    <g>
      <rect width={1080} height={1920} fill="#2A1A0F" />
      <ellipse cx={540} cy={900} rx={700} ry={900} fill="#5A3A1E" opacity={0.7} filter="url(#blur20)" />
      <Person kind="young" x={400} y={1840} s={1.55} pose={H(KNEEL, { ...HUG, head: -4 })} carry="stack" stackN={n} stackWobble={Math.sin(lf * 0.25) * cl(lf / len) * 2.2} />
      {LABELS.map((lab, i) => {
        const t0 = 6 + i * (len - 16) / LABELS.length;
        const k = cl((lf - t0) / 9);
        if (k <= 0 || k >= 1) return null;
        const x = lerp(900 + (i % 2) * 120, 520, eo(k));
        const y = lerp(300 + (i % 3) * 120, 1140 - (18 + i * 3) * 7.6 * 1.55 * 0.5, eo(k));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${lerp(-25 + i * 9, 0, k)})`}>
            <rect x={-110} y={-70} width={220} height={140} rx={6} fill={P.paper} stroke={P.paperDk} strokeWidth={3} />
            <text x={0} y={14} textAnchor="middle" fontSize={40} fontWeight={800} fill="#B0412E" fontFamily="Montserrat, sans-serif">
              {lab}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ---------- 12: поднимаются ----------
export const S12: React.FC<SceneProps> = ({ lf, len }) => {
  const up = ez(cl((lf - 6) / (len * 0.7)));
  return (
    <Cam s={1.0}>
      <CorridorSide sx={5150} />
      <FloorPapers x0={180} x1={950} y={1590} n={Math.round(lerp(10, 3, up))} seed="s12" />
      <Person kind="young" x={360} y={1690} s={1.25} pose={mix(H(KNEEL, HUG), H(STAND, HUG), up)} carry="stack" stackN={24} />
      <Person kind="master" x={700} y={1690} s={1.3} face={-1} pose={mix(H(CROUCH, { aFs: 60 }), H(STAND, { aFs: 10 }), up)} carry="notebook" />
    </Cam>
  );
};

// ---------- 13: идут рядом ----------
export const S13: React.FC<SceneProps> = ({ lf }) => {
  const g = Math.sin(lf * 0.18);
  return (
    <Cam s={1.0}>
      <CorridorSide sx={6000 + lf * 7} />
      <Person kind="young" x={640} y={1600} s={1.18} pose={H(walk(lf * 0.3), HUG)} carry="stack" stackN={24} />
      <Person kind="master" x={400} y={1720} s={1.36} pose={H(walk(lf * 0.3 + 0.6), { aFs: 45 + g * 15, aFe: 60 + g * 20, head: -4 })} carry="notebook" />
    </Cam>
  );
};

// ---------- 14a: «ол бала сабағына асықты» ----------
export const S14a: React.FC<SceneProps> = ({ lf }) => {
  const bx = 120 + lf * 11;
  const enter = cl((bx - 690) / 120);
  return (
    <g>
      <Cam s={1.0}>
        <CorridorSide sx={5200} doorOpen={(i) => (i === 5 ? 1 - cl((lf - 50) / 10) : 0)} />
        <Person kind="boy" x={bx} y={lerp(1700, 1480, enter)} s={lerp(1.15, 0.9, enter)} pose={run(lf * 0.55)} opacity={1 - cl((enter - 0.6) / 0.4)} />
      </Cam>
    </g>
  );
};

// ---------- класс ----------
const ROWS = [
  { y: 1000, s: 0.62, xs: [250, 540, 830] },
  { y: 1220, s: 0.8, xs: [180, 540, 900] },
  { y: 1500, s: 1.0, xs: [130, 540, 950] },
];
const Classroom: React.FC<{ rise: (r: number, c: number) => number; t: number; teacher?: number }> = ({ rise, t, teacher = -1 }) => (
  <g>
    <ClassroomBG />
    <ClockHands t={t} />
    {ROWS.map((row, r) =>
      row.xs.map((x, c) => (
        <g key={`${r}-${c}`}>
          <KidFront x={x - 60 * row.s} y={row.y} s={row.s * 1.1} rise={rise(r, c)} seed={r * 10 + c} />
          <KidFront x={x + 60 * row.s} y={row.y} s={row.s * 1.1} rise={rise(r, c)} seed={r * 10 + c + 5} />
          <Desk x={x} y={row.y} s={row.s} />
        </g>
      )),
    )}
    {teacher >= 0 ? <BackFigure x={lerp(-160, 230, eo(teacher))} y={2050} h={1500} kind="master" ph={teacher * 8} rim={0.8} /> : null}
  </g>
);

export const S14: React.FC<SceneProps> = ({ lf, len }) => (
  <g>
    <Cam s={lerp(1.0, 1.08, ez(lf / len))}>
      <Classroom rise={() => 0} t={lf / FPS} />
      {/* пустой учительский стол на переднем плане */}
      <g transform="translate(540 1820)">
        <rect x={-560} y={-60} width={1120} height={60} fill={P.woodHi} />
        <rect x={-560} y={0} width={1120} height={200} fill={P.woodDk} />
      </g>
    </Cam>
  </g>
);

// ---------- 15: идут к свету — ШЕБЕРЛІК ----------
export const S15: React.FC<SceneProps> = ({ lf }) => {
  const camZ = lf * 0.004;
  const zM = 2.6 + lf * 0.01;
  const zY = 2.75 + lf * 0.01;
  const F = 720;
  const proj = (X: number, z: number) => {
    const d = z - camZ;
    return { x: 540 + (X * F) / d, y: 800 + (1.55 * F) / d, h: (1.18 * F) / d };
  };
  const m = proj(-0.32, zM);
  const y = proj(0.3, zY);
  return (
    <g>
      <CorridorPersp camZ={camZ} />
      <BackFigure x={y.x} y={y.y} h={y.h} kind="young" ph={lf * 0.3} />
      <BackFigure x={m.x} y={m.y} h={m.h} kind="master" ph={lf * 0.3 + 1.5} />
    </g>
  );
};

// ---------- 16: стопка против блокнота ----------
export const S16: React.FC<SceneProps> = ({ lf, len }) => {
  const k = eo(lf / 20);
  return (
    <g>
      <rect width={1080} height={1920} fill="#24170D" />
      <rect x={540} y={0} width={540} height={1920} fill="#2E1E10" />
      <ellipse cx={810} cy={950} rx={360} ry={420} fill={P.sun} opacity={0.22 + 0.1 * Math.sin(lf * 0.15)} filter="url(#blur20)" />
      <rect x={536} y={260} width={8} height={1300} fill={P.amber} opacity={0.5 * k} />
      <g transform={`translate(270 1560) scale(${1.25})`}>
        <Stack n={Math.round(20 + 50 * k)} w={170} wobble={Math.sin(lf * 0.22) * 1.6 * k} seed={7} />
      </g>
      <g transform={`translate(790 1020) scale(${3.2 * (0.8 + 0.2 * k)})`}>
        <Notebook />
      </g>
    </g>
  );
};

// ---------- 16b: взгляд мастера ----------
export const S16b: React.FC<SceneProps> = ({ lf, len }) => {
  const turn = eo(lf / 16);
  const glow = cl((lf - 10) / 20);
  return (
    <Cam s={lerp(1.05, 1.12, lf / len)} cx={540} cy={1200}>
      <CorridorSide sx={6400} />
      <ellipse cx={540} cy={1000} rx={300} ry={140} fill={P.sunHi} opacity={0.35 * glow} filter="url(#blur20)" />
      <Person kind="young" x={700} y={1660} s={1.3} face={-1} pose={H(STAND, { ...HUG, head: 4 })} carry="stack" stackN={24} />
      <Person kind="master" x={360} y={1680} s={1.36} pose={H(STAND, { head: lerp(10, -6, turn), aFs: 30 * turn, aFe: 50 * turn })} carry="notebook" />
    </Cam>
  );
};

// ---------- 17: дети встают — АБЫРОЙ ----------
export const S17: React.FC<SceneProps> = ({ lf }) => (
  <Classroom rise={(r, c) => eo((lf - 6 - (2 - r) * 5 - c * 2) / 10)} t={lf / FPS + 3} teacher={cl(lf / 24)} />
);

// ---------- 18: уважение — по крупице от каждого ----------
export const S18: React.FC<SceneProps> = ({ lf, len }) => (
  <g>
    <Cam s={1.12} cy={900}>
      <Classroom rise={() => 1} t={lf / FPS + 5} />
    </Cam>
    {new Array(26).fill(0).map((_, i) => {
      const r = Math.floor(random(`mr${i}`) * 3);
      const c = Math.floor(random(`mc${i}`) * 3);
      const x0 = ROWS[r].xs[c] + (random(`mx${i}`) - 0.5) * 120;
      const y0 = ROWS[r].y - 260 * ROWS[r].s;
      const t0 = random(`mt${i}`) * len * 0.6;
      const k = cl((lf - t0) / 26);
      if (k <= 0) return null;
      const x = lerp(x0, 540, ez(k));
      const y = lerp(y0, 330, ez(k));
      return <circle key={i} cx={x} cy={y} r={10 + 6 * (1 - k)} fill={P.sunHi} opacity={0.9 * (1 - k * 0.3)} />;
    })}
    <circle cx={540} cy={330} r={30 + lf * 0.9} fill={P.sun} opacity={0.45} filter="url(#blur20)" />
  </g>
);

// ---------- 18b: «күн сайын, аздап-аздап» — кирпичик к кирпичику ----------
const Bricks: React.FC<{ n: number; x: number; y: number; fade?: number }> = ({ n, x, y, fade = 1 }) => (
  <g opacity={fade}>
    {new Array(n).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={x - 110 + (i % 2) * 14} y={y - (i + 1) * 74} width={220} height={66} rx={8} fill={P.amber} />
        <rect x={x - 110 + (i % 2) * 14} y={y - (i + 1) * 74} width={220} height={16} rx={6} fill={P.sunHi} opacity={0.8} />
      </g>
    ))}
    <ellipse cx={x} cy={y - n * 37} rx={200} ry={n * 50 + 60} fill={P.sun} opacity={0.25} filter="url(#blur20)" />
  </g>
);
export const S18b: React.FC<SceneProps> = ({ lf, len }) => {
  const n = Math.min(8, 1 + Math.floor((lf / len) * 9));
  return (
    <g>
      <rect width={1080} height={1920} fill="#2A1A0F" />
      <ellipse cx={540} cy={1000} rx={700} ry={900} fill="#5A3A1E" opacity={0.6} filter="url(#blur20)" />
      <rect y={1660} width={1080} height={260} fill={P.floorDk} />
      <Person kind="master" x={330} y={1700} s={1.4} pose={H(STAND, { head: -4, aFs: 25, aFe: 40 })} carry="notebook" />
      <Bricks n={n} x={760} y={1700} />
    </g>
  );
};

// ---------- 19a: повтор столкновения (медленно, ч/б) ----------
export const S19a: React.FC<SceneProps> = ({ lf }) => (
  <g>
    <Collision lf={8 + lf * 0.5} />
  </g>
);

// ---------- 19b: «шашылады» — кирпичи рассыпаются ----------
export const S19b: React.FC<SceneProps> = ({ lf }) => {
  const k = cl(lf / 6);
  return (
    <g>
      <rect width={1080} height={1920} fill="#1E140B" />
      <rect y={1660} width={1080} height={260} fill={P.floorDk} />
      <Person kind="master" x={330} y={1700} s={1.4} pose={H(STAND, { head: 8 })} carry="notebook" />
      <Bricks n={8} x={760} y={1700} fade={1 - k} />
    </g>
  );
};

// ---------- 20, 23, 24: у двери класса ----------
const DOOR_SX = 7430; // дверь №37 на x≈600…840
export const S20: React.FC<SceneProps> = ({ lf }) => (
  <Cam s={1.08} cx={540} cy={1300}>
    <CorridorSide sx={DOOR_SX} />
    <Person kind="master" x={260} y={1690} s={1.36} pose={H(STAND, { head: 4 })} carry="notebook" />
    <Person kind="young" x={500} y={1660} s={1.3} face={-1} pose={H(STAND, { ...HUG, head: lerp(6, -8, eo(lf / 20)) })} carry="stack" stackN={24} />
  </Cam>
);

export const S23: React.FC<SceneProps> = ({ lf }) => (
  <Cam s={1.15} cx={420} cy={1300}>
    <CorridorSide sx={DOOR_SX} />
    <Person kind="master" x={260} y={1690} s={1.36} pose={H(STAND, { head: 2 })} carry="notebook" />
    <Person kind="young" x={500} y={1660} s={1.3} face={-1} pose={mix(H(STAND, HUG), H(BOW, HUG), eo(lf / 14))} carry="stack" stackN={24} />
  </Cam>
);

export const S24: React.FC<SceneProps> = ({ lf, len }) => {
  const go = Math.max(0, lf - 4);
  const yx = 500 + go * 7;
  const enter = cl((yx - 600) / 110);
  const close = cl((lf - len * 0.72) / 10);
  return (
    <Cam s={1.08} cx={540} cy={1300}>
      <CorridorSide sx={DOOR_SX} doorOpen={(i) => (i === 7 ? Math.min(cl(lf / 6), 1 - close) : 0)} />
      <Person kind="master" x={260} y={1690} s={1.36} pose={H(STAND, { head: 0 })} carry="notebook" />
      {enter < 1 ? (
        <Person kind="young" x={yx} y={lerp(1660, 1470, enter)} s={lerp(1.3, 1.05, enter)} pose={H(walk(go * 0.4, 1.1), HUG)} carry="stack" stackN={24} opacity={1 - cl((enter - 0.55) / 0.45)} />
      ) : null}
    </Cam>
  );
};

// ---------- 21: мастер вспоминает ----------
export const S21: React.FC<SceneProps> = ({ lf, len }) => {
  const gx = lerp(-120, 1200, lf / len);
  return (
    <g>
      <g filter="url(#blur6)">
        <CorridorPersp vx={380} camZ={0.2} />
      </g>
      <Person kind="young" x={gx} y={1380} s={0.62} pose={H(run(lf * 0.45, 0.8), HUG)} carry="stack" stackN={20} tint="ghost" shadow={0} opacity={0.75} />
      <Cam s={lerp(1.0, 1.06, lf / len)} cx={700} cy={1200}>
        <Person kind="master" x={760} y={2860} s={3.1} face={-1} pose={H(STAND, { head: lerp(-2, 6, lf / len) })} shadow={0} />
      </Cam>
    </g>
  );
};

// ---------- 22: яма из бумаг — ШҰҢҚЫР ----------
export const S22: React.FC<SceneProps> = ({ lf, len }) => {
  const k = ez(cl(lf / (len * 0.85)));
  const s = lerp(2.8, 1.0, k);
  return (
    <g>
      <Cam s={s} cx={540} cy={1060}>
        <Pit cx={540} cy={1060} />
        {/* крошечный учитель на дне, смотрит вверх */}
        <g transform="translate(540 1066) scale(0.11)">
          <ellipse cx={0} cy={30} rx={110} ry={50} fill="#000" opacity={0.5} />
          <ellipse cx={0} cy={0} rx={92} ry={52} fill="#A9CBEA" />
          <circle cx={0} cy={-8} r={42} fill="#1B1A20" />
          <rect x={60} y={-60} width={90} height={110} fill={P.paper} />
        </g>
      </Cam>
      <ellipse cx={540} cy={-60} rx={700} ry={360} fill={P.sunHi} opacity={0.5} filter="url(#blur20)" />
      <ReachHand x={lerp(700, 610, k)} y={lerp(-40, 560, eo(cl((lf - 12) / 40)))} s={1.1} rot={-8} />
    </g>
  );
};

// ---------- 25: пустой коридор, 4 листа ----------
export const S25: React.FC<SceneProps> = ({ lf }) => <CorridorPersp camZ={lf * 0.0035} papersOnFloor={4} />;

export const SCENES: Record<string, React.FC<SceneProps>> = {
  sh02: S02,
  sh03: S03,
  sh04: S04,
  sh05: S05,
  sh06: S06,
  sh07: S07,
  sh08: S08,
  sh09: S09,
  sh10: S10,
  sh11: S11,
  sh11b: S11b,
  sh12: S12,
  sh13: S13,
  sh14a: S14a,
  sh14: S14,
  sh15: S15,
  sh16: S16,
  sh16b: S16b,
  sh17: S17,
  sh18: S18,
  sh18b: S18b,
  sh19a: S19a,
  sh19b: S19b,
  sh20: S20,
  sh21: S21,
  sh22: S22,
  sh23: S23,
  sh24: S24,
  sh25: S25,
};

export { wordAt };
