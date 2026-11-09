// «Мұғалім» — character portfolio of the snow-leopard teacher in the cartoon-3d-short style: frames 0-3 are 3D classroom
// stills (flat cast card in a painted, inked three.js room; post chain ink -> lens blur -> bloom -> NEUTRAL tone map ->
// grade, MSAA 4 at full 1080x1920), frames 4-5 are flat model sheets. Render as stills: --frames 0,1,2,3,4,5.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Composition, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { SHOTS, dofAt, layersAt, is3D, TOTAL, FPS } from "./story";
import { FacesPage, TurnPage, HeroOverlay, PageTag, mont } from "./sheets";

const caveat = loadCaveat("normal", { weights: ["700"], subsets: ["cyrillic", "cyrillic-ext", "latin"] });

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

// fonts first (the chalkboard texture writes with Caveat), then the kit; release the hold only after the render that
// mounts <ThreeCanvas/> committed ([Motion patch] from the template)
const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("mugalim kit"));
  useEffect(() => {
    Promise.all([caveat.waitUntilDone(), mont.waitUntilDone()]).catch(() => undefined).then(loadKit).then(setKit);
  }, []);
  useEffect(() => { if (kit) continueRender(handle); }, [kit, handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
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
    <EffectComposer multisampling={4}>
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
  const target = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light === "golden" ? "golden" : "day");
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const ShotView: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => (
  <AbsoluteFill>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 200 }}>
      <Inner id={id} kit={kit} />
    </ThreeCanvas>
  </AbsoluteFill>
);

const Picture: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  return <>{layersAt(f).map((l) => <ShotView key="base" id={l.id} kit={kit} />)}</>;
};

export const Mugalim: React.FC = () => {
  const f = useCurrentFrame();
  if (!is3D(f)) return f === 4 ? <FacesPage /> : <TurnPage />;
  return (
    <AbsoluteFill style={{ background: "#e9e4d8" }}>
      <Picture />
      {f === 0 ? <HeroOverlay /> : <PageTag f={f} />}
    </AbsoluteFill>
  );
};

export const MugalimComposition: React.FC = () => <Composition id="Mugalim" component={Mugalim} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />;
