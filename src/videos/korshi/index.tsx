// «Көршінің баласы» — 3D cartoon dialogue short (cartoon-3d-short skill). Cheaper frames for the GPU-less cloud:
// 720x1280 WebGL canvas upscaled to 1080x1920, MSAA 2, 2048 shadow map, 32-tap lens blur.
import React from "react";
import { Composition } from "remotion";
import { KorshiShort, KORSHI_FRAMES } from "./Korshi";

export const KorshiComposition: React.FC = () => (
  <Composition id="Korshi" component={KorshiShort} defaultProps={{ raw: false, rs: 0.6667, msaa: 2, shadow: 2048, fastLens: true }}
    durationInFrames={KORSHI_FRAMES} fps={30} width={1080} height={1920} />
);
