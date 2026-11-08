// Smoke test of the cartoon-3d-short skill template ("The Bridge That Fell for a Song", untouched copy):
// checks that the three.js scene renders in the cloud (GitHub Actions, --gl=swangle, no GPU) and how long it takes.
import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./Bridge";

export const BridgeTestComposition: React.FC = () => (
  <Composition id="BridgeTest" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
);
