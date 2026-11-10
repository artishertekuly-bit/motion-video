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
import { Ubt3Composition } from "./videos/ubt3/Ubt3";
import { TundeComposition } from "./tunde";
import { MugalimComposition } from "./videos/mugalim/Mugalim";
import { Mg1Composition } from "./videos/mg1/Mg1";
import { Mg2Composition } from "./videos/mg2/Mg2";

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
      <Ubt3Composition />
      <TundeComposition />
      <MugalimComposition />
      <Mg1Composition />
      <Mg2Composition />
    </>
  );
};
