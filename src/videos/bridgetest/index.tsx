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
  </>
);
