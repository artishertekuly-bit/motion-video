// «Арал: кемелер шөлде» — 3D cartoon short (cartoon-3d-short skill). Cheaper frames for the GPU-less cloud:
// 720x1280 WebGL canvas upscaled to 1080x1920, MSAA 2, 2048 shadow map, 32-tap lens blur (BridgeFast test: ~10 s/frame).
import React from "react";
import { Composition } from "remotion";
import { AralShort, ARAL_FRAMES } from "./Aral";

export const AralComposition: React.FC = () => (
  <Composition id="Aral" component={AralShort} defaultProps={{ raw: false, rs: 0.6667, msaa: 2, shadow: 2048, fastLens: true }}
    durationInFrames={ARAL_FRAMES} fps={30} width={1080} height={1920} />
);
