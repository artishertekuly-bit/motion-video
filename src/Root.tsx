import { MyComposition } from "./Composition";
import { Test3DComposition } from "./Test3D";
import { DeepfakeComposition } from "./deepfake";
import { QagazComposition } from "./qagaz";
import { Qagaz2Composition } from "./qagaz2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Test3DComposition />
      <DeepfakeComposition />
      <QagazComposition />
      <Qagaz2Composition />
    </>
  );
};
