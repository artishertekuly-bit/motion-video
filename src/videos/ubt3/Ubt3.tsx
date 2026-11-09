// «30 КҮН: ЕРАСЫЛ ҰБТ-ға» — 3-күн, in the flat-characters-in-a-3D-toon-world style (cartoon-3d-short template).
// One three.js world (world.ts) posed per frame from story.ts; post chain from the bridge short: ink -> lens blur pre +
// main -> bloom -> NEUTRAL tone map -> grade, MSAA 2 (CPU cloud renderer). The WebGL canvas renders at 720x1280 and is
// CSS-upscaled (RS) to save cloud minutes; HUD, captions and cards stay sharp DOM at 1080x1920. From CARD_AT on there is
// no WebGL at all: the VS screen and the comment card are DOM. Voices + SFX are <Audio>.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Composition, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { SHOTS, layersAt, dofAt } from "./story";
import { AUDIO, CARD_AT, FPS, TOTAL, cs, sec } from "./timeline";
import { Captions } from "./captions";
import { Big28, Frost, Hud, VsScreen, VoteCard } from "./overlay";
import { Sound } from "./sound";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

// release the kit hold only after the render that mounts <ThreeCanvas/> committed ([Motion patch] from the template)
const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("ubt3 kit"));
  useEffect(() => { loadKit().then(setKit); }, []);
  useEffect(() => { if (kit) continueRender(handle); }, [kit, handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  // @react-three/postprocessing stays at 3.0.4 (composer built in useMemo; Remotion draws each frame once)
  const post = useMemo(() => (
    <EffectComposer multisampling={2}>
      {[
        <primitive key="ink" object={fx.ink} dispose={null} />,
        <primitive key="lensPre" object={fx.lens.pre} dispose={null} />,
        <primitive key="lens" object={fx.lens.main} dispose={null} />,
        <primitive key="bloom" object={fx.bloom} dispose={null} />,
        <primitive key="tone" object={fx.tone} dispose={null} />,
        <primitive key="grade" object={fx.grade} dispose={null} />,
      ]}
    </EffectComposer>
  ), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  const lt = SHOTS[id - 1].light;
  gradeFor(fx.grade, lt === "golden" ? "golden" : "day");
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** render scale of the WebGL canvas: 0.6667 = 720x1280, CSS-upscaled to 1080x1920 (about half the cloud time) */
const RS = 0.6667;
const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => {
  const w = Math.round(1080 * RS), h = Math.round(1920 * RS);
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${1080 / w})`, transformOrigin: "0 0" }}>
        <ThreeCanvas width={w} height={h} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
          camera={{ fov: 40, near: 0.05, far: 200 }}>
          <Inner id={id} kit={kit} />
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};

const VOICES = Object.keys(AUDIO).filter((k) => k !== "_sfx");

const Picture: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  return <>{layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} />)}</>;
};

export const Ubt3: React.FC = () => {
  const f = useCurrentFrame();
  const fadeEnd = Math.max(0, Math.min(1, (f - (TOTAL - 18)) / 16));
  return (
    <AbsoluteFill style={{ background: "#e9e4d8" }}>
      {f < CARD_AT ? <Picture /> : null}
      <Frost f={f} />
      <Big28 f={f} />
      <Hud f={f} />
      <VsScreen f={f} />
      <VoteCard f={f} />
      <Captions f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeEnd, pointerEvents: "none" }} />
      {VOICES.map((id) => (
        <Sequence key={id} from={cs(id)} durationInFrames={sec(AUDIO[id].duration) + 6}>
          <Audio src={staticFile(AUDIO[id].file)} />
        </Sequence>
      ))}
      <Sound />
    </AbsoluteFill>
  );
};

export const Ubt3Composition: React.FC = () => <Composition id="Ubt3" component={Ubt3} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />;
