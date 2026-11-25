import React from "react";
import { loadFont } from "@remotion/google-fonts/Rye";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import beatsJson from "./data/beats.json";
import { RubberHoseCharacter, INK, PAPER, ACCENT } from "./rubber-hose/RubberHoseCharacter";
import { Stage } from "./rubber-hose/Stage";
import { VintageFilm } from "./rubber-hose/VintageFilm";
import { beatPosition, hash, type DanceConfig } from "./rubber-hose/beat";

const { fontFamily: RYE } = loadFont();

export const DANCE_CFG: DanceConfig = { bpm: beatsJson.bpm, fps: 24, bars: beatsJson.bars };
const MUSIC_SEC = beatsJson.musicSec;

// Zona segura de Reels / TikTok / Shorts (lienzo 1080x1920): y 250 a 1520, derecha libre 150
const FLOOR_Y = 1330;
const CHAR_W = 860;
const CHAR_SCALE = CHAR_W / 600;
const CHAR_TOP = FLOOR_Y + 20 - 690 * CHAR_SCALE;

export const DanceBombin: React.FC = () => {
  const frame = useCurrentFrame();
  const beatPos = beatPosition(frame, DANCE_CFG);
  const t = frame / DANCE_CFG.fps;

  // Coreografía por compases: Charleston, manos arriba (jazz hands) en los compases 3, 6 y 8
  const barF = beatPos / 4;
  const armsUp = interpolate(
    barF,
    [0, 2, 2.15, 2.85, 3, 5, 5.15, 5.85, 6, 7, 7.15, 9],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // Final "ta-da": el salto se calma y el personaje se queda con las manos arriba
  const energy = interpolate(t, [MUSIC_SEC, MUSIC_SEC + 0.35], [1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Temblor de proyector (gate weave) y línea "hirviendo" (cambia cada 2 frames)
  const weaveX = (hash(frame * 1.31) - 0.5) * 5;
  const weaveY = (hash(frame * 2.17) - 0.5) * 5;
  const boilSeed = Math.floor(frame / 2) % 9;

  // Notas musicales que suben desde el piso, una por pulso
  const k0 = Math.floor(beatPos);
  const notes = [0, 1, 2, 3, 4, 5].map((i) => {
    const k = k0 - i;
    if (k < 0 || k * (60 / DANCE_CFG.bpm) > MUSIC_SEC) return null;
    const age = beatPos - k;
    return {
      k,
      x: 170 + hash(k * 7.3) * 640 + Math.sin(age * 2.2 + k) * 18,
      y: 1260 - age * 150,
      o: Math.min(1, age * 3) * Math.max(0, 1 - age / 3.4),
      g: k % 2 ? "♪" : "♫",
      s: 56 + hash(k * 3.1) * 28,
    };
  });

  const titleIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Audio src={staticFile("audio/ragtime.wav")} volume={0.9} />

      <div style={{ position: "absolute", inset: 0, transform: `translate(${weaveX}px, ${weaveY}px)` }}>
        <Stage frame={frame} floorY={FLOOR_Y} />

        {/* Título de cartel vintage dentro de la zona segura */}
        <div
          style={{
            position: "absolute",
            top: 270,
            left: 130,
            right: 220,
            textAlign: "center",
            opacity: titleIn,
            transform: `scale(${0.9 + 0.1 * titleIn})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "16px 34px",
              background: PAPER,
              border: `7px double ${INK}`,
              boxShadow: `7px 7px 0 ${INK}`,
              transform: "rotate(-2deg)",
            }}
          >
            <div style={{ fontFamily: RYE, fontSize: 52, color: INK, lineHeight: 1.1 }}>Baile del bombín</div>
            <div style={{ fontFamily: RYE, fontSize: 24, color: ACCENT, marginTop: 8 }}>Estilo rubber hose · 1930</div>
          </div>
        </div>

        {/* Notas flotantes */}
        {notes.map(
          (n) =>
            n && (
              <div
                key={n.k}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  fontSize: n.s,
                  color: INK,
                  opacity: n.o * 0.85,
                  fontFamily: "serif",
                  fontWeight: 700,
                }}
              >
                {n.g}
              </div>
            )
        )}

        {/* Personaje con línea "hirviendo" */}
        <svg
          viewBox="0 0 600 800"
          width={CHAR_W}
          height={CHAR_W * (800 / 600)}
          style={{ position: "absolute", left: (1080 - CHAR_W) / 2 - 20, top: CHAR_TOP, overflow: "visible" }}
        >
          <defs>
            <filter id="boil" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed={boilSeed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g filter="url(#boil)">
            <RubberHoseCharacter frame={frame} beatPos={beatPos} armsUp={armsUp} energy={energy} />
          </g>
        </svg>
      </div>

      <VintageFilm frame={frame} />
    </AbsoluteFill>
  );
};
