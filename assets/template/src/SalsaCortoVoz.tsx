import React, { useMemo } from "react";
import { Caption } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Rye";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import captionsJson from "./data/captions-salsa-corto.json";
import { createVoiceDucking } from "./rubber-hose/audioDucking";
import { beatPosition, onTwos, type DanceConfig } from "./rubber-hose/beat";
import { CameraRig } from "./rubber-hose/CameraRig";
import { INK, PAPER, SHOE } from "./rubber-hose/RubberHoseCharacter";
import { MaracasPlayer, TrumpetPlayer, VintageCar } from "./rubber-hose/SalsaCast";
import { CaribbeanStage, NewYorkStage } from "./rubber-hose/SalsaStages";
import { VintageCaptions, type CaptionPosition } from "./rubber-hose/VintageCaptions";
import { VintageFilm } from "./rubber-hose/VintageFilm";

const { fontFamily: RYE } = loadFont();

const CAPTIONS = captionsJson as Caption[];
export const SALSA_CORTO_CFG: DanceConfig = { bpm: 120, fps: 24, bars: 4 };
const SPLIT_FRAME = 100; // 4.17s -> justo al empezar "y explotó..."
const FLOOR_Y = 1280;
const CHAR_W = 740;
const CHAR_SCALE = CHAR_W / 600;
const CHAR_TOP = FLOOR_Y + 20 - 690 * CHAR_SCALE;

export type SalsaCortoVozProps = {
  /** false exporta video limpio para usar junto al archivo .srt nativo. */
  showCaptions?: boolean;
  captionPosition?: CaptionPosition;
};

export const SalsaCortoVoz: React.FC<SalsaCortoVozProps> = ({
  showCaptions = true,
  captionPosition = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps } = SALSA_CORTO_CFG;
  const beatPosSmooth = beatPosition(frame, SALSA_CORTO_CFG);
  // Personajes animados "on twos" (12 fps sobre 24 fps de cámara/fondo/película)
  const charFrame = onTwos(frame);
  const beatPosTwos = beatPosition(charFrame, SALSA_CORTO_CFG);
  const isScene2 = frame >= SPLIT_FRAME;

  // Audio ducking automático: baja la música al hablar y sube en pausas/transiciones
  const musicVolume = useMemo(
    () =>
      createVoiceDucking(CAPTIONS, fps, {
        duckedVolume: 0.14,
        openVolume: 0.3,
        rampMs: 220,
      }),
    [fps]
  );

  // Transición Iris Wipe en el corte entre Caribe y Nueva York
  const irisDist = Math.abs(frame - SPLIT_FRAME);
  const irisRadius =
    irisDist < 7
      ? interpolate(irisDist, [0, 7], [0, 1300], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 2000;

  // Autos vintage en el plano medio
  const habanaCarX = interpolate(frame, [0, SPLIT_FRAME], [-180, 1180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nyTaxiX = interpolate(frame, [SPLIT_FRAME, 196], [1220, -180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boilSeed = Math.floor(frame / 2) % 9;
  const localF = isScene2 ? frame - SPLIT_FRAME : frame;
  const sceneDur = isScene2 ? 96 : SPLIT_FRAME;
  const cardIn = interpolate(localF, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* Voz clonada ElevenLabs v4 + música procedural con ducking automático */}
      <Audio src={staticFile("audio/voz-salsa-corto.mp3")} volume={1} />
      <Audio src={staticFile("audio/salsa-vintage.wav")} volume={musicVolume} />

      {/* SFX procedurales generados con earshot */}
      <Sequence from={2} durationInFrames={16}>
        <Audio src={staticFile("audio/sfx/pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={SPLIT_FRAME - 6} durationInFrames={20}>
        <Audio src={staticFile("audio/sfx/whoosh.wav")} volume={0.45} />
      </Sequence>
      <Sequence from={SPLIT_FRAME + 2} durationInFrames={16}>
        <Audio src={staticFile("audio/sfx/pop.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={168} durationInFrames={28}>
        <Audio src={staticFile("audio/sfx/chime.wav")} volume={0.28} />
      </Sequence>

      {/* Cámara viva de 3 planos con parallax y push-in suave a 24 fps */}
      <CameraRig
        localFrame={localF}
        sceneDuration={sceneDur}
        globalFrame={frame}
        zoomFrom={1.0}
        zoomTo={1.045}
        panX={isScene2 ? -24 : 24}
        farLayer={
          isScene2 ? (
            <NewYorkStage frame={frame} beatPos={beatPosSmooth} floorY={FLOOR_Y} />
          ) : (
            <CaribbeanStage frame={frame} beatPos={beatPosSmooth} floorY={FLOOR_Y} />
          )
        }
        midLayer={
          <svg
            viewBox="0 0 1080 1920"
            width="1080"
            height="1920"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {isScene2 ? (
              <VintageCar x={nyTaxiX} y={FLOOR_Y - 34} beatPos={beatPosSmooth} variant="ny-taxi" flip />
            ) : (
              <VintageCar x={habanaCarX} y={FLOOR_Y - 34} beatPos={beatPosSmooth} variant="habana" />
            )}
          </svg>
        }
        foreLayer={
          <svg
            viewBox="0 0 600 800"
            width={CHAR_W}
            height={CHAR_W * (800 / 600)}
            style={{
              position: "absolute",
              left: (1080 - CHAR_W) / 2 - (isScene2 ? 55 : 20),
              top: CHAR_TOP,
              overflow: "visible",
            }}
          >
            <defs>
              <filter id="cast-boil" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed={boilSeed} result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter="url(#cast-boil)">
              {isScene2 ? (
                <TrumpetPlayer frame={charFrame} beatPos={beatPosTwos} />
              ) : (
                <MaracasPlayer frame={charFrame} beatPos={beatPosTwos} />
              )}
            </g>
          </svg>
        }
      />

      {/* Cartel de lugar fijo dentro de la zona segura */}
      <div
        style={{
          position: "absolute",
          top: 265,
          left: 80,
          right: 160,
          textAlign: "center",
          opacity: cardIn,
          transform: `scale(${0.92 + 0.08 * cardIn})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "14px 30px",
            background: PAPER,
            border: `7px double ${INK}`,
            boxShadow: `6px 6px 0 ${INK}`,
            transform: isScene2 ? "rotate(1.5deg)" : "rotate(-1.8deg)",
          }}
        >
          <div style={{ fontFamily: RYE, fontSize: 40, color: INK, lineHeight: 1.12 }}>
            {isScene2 ? "Nueva York · Años 70" : "El Caribe · Cuba y P. Rico"}
          </div>
        </div>
      </div>

      {/* Subtítulos estables opcionales (o desactivables cuando subes .srt) */}
      <VintageCaptions
        captions={CAPTIONS}
        showCaptions={showCaptions}
        captionPosition={captionPosition}
        highlightColor={SHOE}
      />

      {/* Iris Wipe */}
      {irisRadius < 1300 && (
        <svg
          viewBox="0 0 1080 1920"
          width="1080"
          height="1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <mask id="corto-iris">
              <rect width="1080" height="1920" fill="white" />
              <circle cx="520" cy="960" r={irisRadius} fill="black" />
            </mask>
          </defs>
          <rect width="1080" height="1920" fill={INK} mask="url(#corto-iris)" />
        </svg>
      )}

      <VintageFilm frame={frame} />
    </AbsoluteFill>
  );
};
