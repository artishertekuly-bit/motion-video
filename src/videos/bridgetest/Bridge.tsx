// "The Bridge That Fell for a Song": our original 67 s short in the flat-characters-in-a-3D-toon-world style.
// One three.js world (world.ts) posed per frame from the story timeline (story.ts). Post chain (look-match pass):
//   InkPass (world ink lines, own pass) -> lens blur pre + main (thin-lens DOF per shot from dofAt) ->
//   [bloom (emissive only) + NEUTRAL tone mapping + colour grade] (one merged EffectPass), MSAA 4.
// Ink runs before the DOF so lines blur with what they belong to; bloom after the DOF so glows defocus with their
// source; the grade is display-referred, so it comes after tone mapping. Every pixel-sized parameter is specified at
// 1080x1920 and scaled with the output size, so stills at --scale 0.5 and the 1440x2560 final match.
// Place changes crossfade by stacking a second canvas for the fade frames; the hook ends on a 4-frame white flash.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit, SPEED } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from "./story";

export const BRIDGE_FRAMES = TOTAL;

/** A/B switches for test stills only (Remotion inputProps `{ post: { ink: false, ... } }`); everything is on by default. */
type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

/** Bloom for emissive sources only (depth.md 6.4). Its MIP chain always starts at 540x960 (half of 1080x1920),
 *  whatever the output size, so the glow keeps the same size relative to the frame (e-fold ~30 px at 1080p,
 *  ~1.5 % of the frame height) at 540, 1080 and 1440 widths. ADD blend: HDR-safe (SCREEN darkens values > 1). */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

// Release the kit hold only AFTER the render that mounts <ThreeCanvas/> has committed: its own delayRender is taken in a
// layout effect of that commit, so there is never a moment with no pending handle (the original released it right
// after setKit, and on a slow machine Remotion took the still before the canvas existed: background colour only).
const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("bridge kit"));
  useEffect(() => { loadKit().then(setKit); }, []);
  useEffect(() => { if (kit) continueRender(handle); }, [kit, handle]);
  return kit;
};

// ---------------- smoke-test diagnostics (bridgetest only) ----------------
// Collects console errors / warnings and per-frame WebGL facts, and prints them over the still, so a cloud run shows
// what happened without a GPU or a log viewer.
export const DIAG = { log: [] as string[], info: "", rendered: 0 };
if (typeof window !== "undefined" && !(window as unknown as { __diag?: boolean }).__diag) {
  (window as unknown as { __diag?: boolean }).__diag = true;
  for (const k of ["error", "warn"] as const) {
    const orig = console[k].bind(console);
    console[k] = (...a: unknown[]) => { DIAG.log.push(`${k}: ${a.map(String).join(" ").replace(/\s+/g, " ").slice(0, 150)}`); orig(...a); };
  }
  window.addEventListener("error", (e) => DIAG.log.push(`onerror: ${String(e.message).slice(0, 150)}`));
}
const Diag: React.FC = () => {
  const [, setN] = useState(0);
  const [h] = useState(() => delayRender("diag overlay", { timeoutInMilliseconds: 200000 }));
  useEffect(() => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      setN((n) => n + 1);
      if (DIAG.rendered > 0 || Date.now() - t0 > 150000) { clearInterval(iv); setTimeout(() => { setN((n) => n + 1); setTimeout(() => continueRender(h), 200); }, 300); }
    }, 250);
    return () => clearInterval(iv);
  }, [h]);
  const lines = [`rendered=${DIAG.rendered}`, DIAG.info, ...DIAG.log.filter((l) => !l.includes("404")).slice(-12)];
  return <div style={{ position: "absolute", left: 0, top: 0, right: 0, background: "rgba(0,0,0,0.72)", color: "#fff", font: "24px monospace", padding: 10, whiteSpace: "pre-wrap", wordBreak: "break-all", zIndex: 10 }}>{lines.join("\n")}</div>;
};
/** [Motion speed test] rs = render scale of the WebGL canvas (0.6667 = 720x1280, CSS-upscaled to 1080x1920); msaa; shadow map; fastLens = 32-tap blur */
type Speed = { rs?: number; msaa?: number; shadow?: number; fastLens?: boolean };
type TestProps = { raw?: boolean; diag?: boolean } & Speed;
/** reads WebGL facts right after the frame was drawn (priority 2 = after the composer); raw mode draws without post */
const FrameProbe: React.FC<{ raw: boolean }> = ({ raw }) => {
  const { gl, scene, camera } = useThree();
  useFrame(() => { gl.info.autoReset = false; gl.info.reset(); }, 0);
  useFrame(() => {
    if (raw) gl.render(scene, camera);
    const c = gl.getContext();
    gl.setRenderTarget(null);
    const px = new Uint8Array(4), w = c.drawingBufferWidth, hh = c.drawingBufferHeight;
    c.readPixels(Math.floor(w / 2), Math.floor(hh * 0.7), 1, 1, c.RGBA, c.UNSIGNED_BYTE, px);
    const ext = c.getExtension("WEBGL_debug_renderer_info");
    const ren = ext ? c.getParameter(ext.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER);
    DIAG.rendered++;
    DIAG.info = `raw=${raw} calls=${gl.info.render.calls} tris=${gl.info.render.triangles} progs=${gl.info.programs?.length} tex=${gl.info.memory.textures}`
      + ` buf=${w}x${hh} lost=${c.isContextLost()} px@0.7=${Array.from(px).join(",")} glerr=${c.getError()} maxTex=${gl.capabilities.maxTextureSize}\nGPU: ${String(ren).slice(0, 120)}`;
  }, 2);
  return null;
};

const Inner: React.FC<{ id: number; kit: Kit; raw?: boolean; sp: Speed }> = ({ id, kit, raw = false, sp }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2, fast: !!sp.fastLens }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }), // film grain, OFF by default (inputProps post.grain): the reference measures no grain and it quadruples the file size
  }), [camera, scene, sp.fastLens]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  // @react-three/postprocessing must stay at 3.0.4: from 3.2 the composer is created in an effect, one render late,
  // and Remotion draws each frame exactly once (frameloop "never"), so the post chain never ran (blank stills).
  // Its children are typed as Element | Element[] (no nulls), hence the list.
  const post = useMemo(() => {
    const kids: React.JSX.Element[] = [];
    if (on.ink) kids.push(<primitive key="ink" object={fx.ink} dispose={null} />);
    if (on.lens && on.pre) kids.push(<primitive key="lensPre" object={fx.lens.pre} dispose={null} />);
    if (on.lens) kids.push(<primitive key="lens" object={fx.lens.main} dispose={null} />);
    if (on.bloom) kids.push(<primitive key="bloom" object={fx.bloom} dispose={null} />);
    kids.push(<primitive key="tone" object={fx.tone} dispose={null} />);
    if (on.grade) kids.push(<primitive key="grade" object={fx.grade} dispose={null} />);
    if (on.grain) kids.push(<primitive key="grain" object={fx.grain} dispose={null} />);
    return <EffectComposer multisampling={sp.msaa ?? 4}>{kids}</EffectComposer>;
  }, [fx, on, sp.msaa]);
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  // thin-lens focus: distance along the view axis to the shot's focus point (default: the camera's look target)
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light);
  fx.grain.seed = f; // deterministic per frame
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {raw ? null : post}
      <FrameProbe raw={raw} />
    </>
  );
};

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size (R3F clamps dpr to >= 1 by default) */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; kit: Kit; alpha: number; raw?: boolean; sp: Speed }> = ({ id, kit, alpha, raw, sp }) => {
  const rs = sp.rs ?? 1;
  const w = Math.round(1080 * rs), h = Math.round(1920 * rs);
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${1080 / w})`, transformOrigin: "0 0" }}>
        <ThreeCanvas width={w} height={h} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
          camera={{ fov: 40, near: 0.2, far: 1500 }}>
          <Inner id={id} kit={kit} raw={raw} sp={sp} />
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};

export const BridgeShort: React.FC<TestProps> = ({ raw = false, diag = false, ...sp }) => {
  const f = useCurrentFrame();
  if (sp.shadow) SPEED.shadow = sp.shadow;
  const kit = useKit();
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {kit ? layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} raw={raw} sp={sp} />) : null}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {diag ? <Diag /> : null}
    </AbsoluteFill>
  );
};
