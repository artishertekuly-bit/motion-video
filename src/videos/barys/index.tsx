// «Қанат» — Барыс пен Бүркіт (vizavi-motion): 2D cast in code over baked watercolour layers. 1920x1080, 60 fps, 10 s.
import React from "react";
import { Composition } from "remotion";
import { Barys, BARYS_FRAMES, FPS } from "./Barys";

export const BarysComposition: React.FC = () => (
  <Composition id="Barys" component={Barys} durationInFrames={BARYS_FRAMES} fps={FPS} width={1920} height={1080} />
);
