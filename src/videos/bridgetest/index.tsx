// Smoke test of the cartoon-3d-short skill template ("The Bridge That Fell for a Song" copy):
// checks that the three.js scene renders in the cloud (GitHub Actions, --gl=swangle, no GPU) and how long it takes.
// BridgeTest = full post chain, BridgeTestRaw = plain three.js render (no post); both print a diagnostics strip.
import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./Bridge";

export const BridgeTestComposition: React.FC = () => (
  <>
    <Composition id="BridgeTest" component={BridgeShort} defaultProps={{ raw: false, diag: true }}
      durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BridgeTestRaw" component={BridgeShort} defaultProps={{ raw: true, diag: true }}
      durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    {/* [Motion speed test] cheaper frames: 720x1280 canvas upscaled, MSAA 2 / 0, shadow 2048, 32-tap blur */}
    <Composition id="BridgeFast" component={BridgeShort} defaultProps={{ raw: false, diag: false, rs: 0.6667, msaa: 2, shadow: 2048, fastLens: true }}
      durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BridgeFast0" component={BridgeShort} defaultProps={{ raw: false, diag: false, rs: 0.6667, msaa: 0, shadow: 2048, fastLens: true }}
      durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
