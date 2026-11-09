import { MyComposition } from "./Composition";
import { Test3DComposition } from "./Test3D";
import { DeepfakeComposition } from "./deepfake";
import { QagazComposition } from "./qagaz";
import { Qagaz2Composition } from "./qagaz2";
import { ShporComposition } from "./shpor";
import { Ubt1Composition } from "./ubt";
import { KeyinComposition } from "./keyin";
import { BridgeTestComposition } from "./videos/bridgetest";
import { AralComposition } from "./videos/aral";
import { KorshiComposition } from "./videos/korshi";
import { Ubt2Composition } from "./videos/ubt2/Ubt2";
import { TundeComposition } from "./tunde";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Test3DComposition />
      <DeepfakeComposition />
      <QagazComposition />
      <Qagaz2Composition />
      <ShporComposition />
      <Ubt1Composition />
      <KeyinComposition />
      <BridgeTestComposition />
      <AralComposition />
      <KorshiComposition />
      <Ubt2Composition />
      <TundeComposition />
    </>
  );
};
