import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "./theme";
import { AUDIO, DURATION, FLASHES, FPS, WIPES, cs, sec, shotAt, shotStart } from "./timeline";
import { Grade, HOOK_END, Hook, ShotView } from "./scenes";
import { Dust, Flash, PaperBurst, PaperFall, PaperWipe } from "./papers";
import { BigWords, Captions } from "./captions";

const VOICES = ["s1", "m1", "j1", "m2", "m3", "m4", "m5", "m6", "j2", "m7", "m8", "j3"];

export const Qagaz: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  const sh06 = shotStart("sh06");
  const sh07 = shotStart("sh07");
  const sh19b = shotStart("sh19b");
  const sh20 = shotStart("sh20");
  const sh22 = shotStart("sh22");
  const fadeEnd = interpolate(f, [DURATION - 24, DURATION - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {f < HOOK_END ? <Hook f={f} /> : <ShotView shot={shot} f={f} />}
      {f >= HOOK_END ? <Grade /> : null}
      {/* пылинки в лучах (не в яме из бумаг) */}
      {f >= HOOK_END && !(f >= sh22 && f < shotStart("sh23")) ? <Dust f={f} opacity={shot.grade ? 0.4 : 1} /> : null}

      {/* столкновение — взрыв листов уже в видео V2; в следующем плане листы ещё долетают */}
      {f >= sh06 && f < sh07 ? <PaperBurst f={f} t0={sh06 / FPS - 0.35} x={560} y={700} n={10} power={0.7} seed="hit" life={2.4} /> : null}
      {f >= sh06 && f < sh07 ? <PaperFall f={f} t0={sh06 / FPS} /> : null}
      {/* «қағаздай шашылады» */}
      {f >= sh19b && f < sh20 ? <PaperBurst f={f} t0={sh19b / FPS + 0.05} x={540} y={980} n={22} power={1.25} seed="sha" life={2.6} /> : null}

      {WIPES.map((c) => (
        <PaperWipe key={c} f={f} cut={c} />
      ))}
      {FLASHES.map((a) => (
        <Flash key={a} f={f} at={a} />
      ))}

      <BigWords f={f} />
      <Captions f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeEnd, pointerEvents: "none" }} />

      {VOICES.map((id) => (
        <Sequence key={id} from={cs(id)} durationInFrames={sec(AUDIO[id].duration) + 6}>
          <Audio src={staticFile(AUDIO[id].file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const QagazComposition: React.FC = () => (
  <Composition id="Qagaz" component={Qagaz} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
