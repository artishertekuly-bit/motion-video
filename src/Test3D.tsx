// Тестовая 3D-сцена: проверка, что three.js рендерится на этом компьютере.
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rotation = interpolate(frame, [0, 60], [0, Math.PI]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f1a" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <pointLight position={[-4, -2, 3]} intensity={30} color="#4f7cff" />
        <mesh rotation={[rotation * 0.6, rotation, 0]}>
          <torusKnotGeometry args={[1, 0.32, 220, 32]} />
          <meshStandardMaterial color="#ff6a3d" metalness={0.6} roughness={0.25} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const Test3DComposition = () => (
  <Composition
    id="Test3D"
    component={Scene}
    durationInFrames={60}
    fps={30}
    width={1280}
    height={720}
  />
);
