// «Барыс ағай» Анонс: «ЖИ Видео Курсы (Телеграм)»
// Composition in the flat-characters-in-a-3D-toon-world style.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, Composition, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
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
import { SeriesTag, TelegramBadge, EndCard } from "./overlay";
import { Sound } from "./sound";

const makeBloom = () => {
  const b = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 0.5,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.2,
    mipmapBlur: true,
    levels: 6,
    radius: 0.6,
  });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(),
  fpt = new THREE.Vector3();

const caveat = loadCaveat("normal", { weights: ["700"], subsets: ["cyrillic", "cyrillic-ext", "latin"] });
const mont = loadMontserrat("normal", { weights: ["600", "700", "800", "900"], subsets: ["cyrillic", "cyrillic-ext", "latin"] });

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("mg4 kit"));
  useEffect(() => {
    Promise.all([caveat.waitUntilDone(), mont.waitUntilDone()])
      .catch(() => undefined)
      .then(loadKit)
      .then(setKit);
  }, []);
  useEffect(() => {
    if (kit) continueRender(handle);
  }, [kit, handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const fx = useMemo(
    () => ({
      ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
      lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
      bloom: makeBloom(),
      tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    }),
    [camera, scene]
  );
  useEffect(() => () => fx.ink.dispose(), [fx]);

  const post = useMemo(
    () => (
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
    ),
    [fx]
  );
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f));
  else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  const lt = SHOTS[id - 1].light;
  fx.grade.target = gradeFor(lt);
  fx.grade.strength = GRADE_STRENGTH[lt];
  return (
    <>
      <primitive object={world.root} />
      {post}
    </>
  );
};

export const Mg4: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  const activeLayers = layersAt(f);

  return (
    <AbsoluteFill style={{ background: "#0e1117" }}>
      {f < CARD_AT && kit && (
        <AbsoluteFill>
          {activeLayers.map(({ id, alpha }) => (
            <div
              key={id}
              style={{
                position: "absolute",
                inset: 0,
                opacity: alpha,
                pointerEvents: "none",
              }}
            >
              <ThreeCanvas
                width={1080}
                height={1920}
                style={{ width: "100%", height: "100%" }}
                camera={{ fov: 40, near: 0.1, far: 80, position: [0, 1.4, 0] }}
                gl={{
                  antialias: true,
                  toneMapping: THREE.NoToneMapping,
                  powerPreference: "high-performance",
                }}
              >
                <Inner id={id} kit={kit} />
              </ThreeCanvas>
            </div>
          ))}
        </AbsoluteFill>
      )}

      {/* DOM Overlays */}
      <SeriesTag f={f} />
      <TelegramBadge f={f} />
      <Captions f={f} />
      <EndCard f={f} />

      {/* Sound & Dialogue */}
      <Sound />
      {(["u1", "t1", "t2", "t3", "t4", "u2", "t5"] as const).map((id) => (
        <Sequence key={id} from={cs(id)} durationInFrames={sec(AUDIO[id].duration) + 2}>
          <Audio src={staticFile(AUDIO[id].file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const Mg4Composition: React.FC = () => (
  <Composition
    id="Mg4"
    component={Mg4}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
