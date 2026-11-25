import React from "react";
import { hash } from "./beat";
import { INK, PAPER, ACCENT } from "./RubberHoseCharacter";

/** Escenario sepia: rayos de sol, cortinas de teatro y piso ajedrezado. */
export const Stage: React.FC<{ frame: number; floorY: number }> = ({ frame, floorY }) => {
  const rays = Array.from({ length: 18 }, (_, i) => i);
  const rot = frame * 0.18;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="stage-bg" cx="50%" cy="46%" r="75%">
          <stop offset="0%" stopColor="#fbf2d6" />
          <stop offset="62%" stopColor="#e4cf9c" />
          <stop offset="100%" stopColor="#b8995e" />
        </radialGradient>
        <pattern id="checker" width="180" height="120" patternUnits="userSpaceOnUse">
          <rect width="180" height="120" fill={PAPER} />
          <rect width="90" height="60" fill={INK} />
          <rect x="90" y="60" width="90" height="60" fill={INK} />
        </pattern>
        <linearGradient id="curtain" x1="0" x2="1">
          <stop offset="0%" stopColor="#2a1b12" />
          <stop offset="50%" stopColor="#4a2f1f" />
          <stop offset="100%" stopColor="#2a1b12" />
        </linearGradient>
      </defs>

      <rect width="1080" height="1920" fill="url(#stage-bg)" />

      {/* Rayos de sol girando lentamente detrás del personaje */}
      <g transform={`translate(540 ${floorY - 520}) rotate(${rot})`} opacity="0.34">
        {rays.map((i) => {
          const a0 = (i / rays.length) * Math.PI * 2;
          const a1 = a0 + (Math.PI * 2) / rays.length / 2;
          const R = 1700;
          return (
            <path
              key={i}
              d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} L${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`}
              fill="#fff7dc"
            />
          );
        })}
      </g>

      {/* Piso ajedrezado */}
      <rect x="0" y={floorY} width="1080" height="240" fill="url(#checker)" />
      <rect x="0" y={floorY - 10} width="1080" height="12" fill={INK} />

      {/* Cortinas laterales con pliegues */}
      {[0, 1].map((side) => {
        const x = side === 0 ? 0 : 1080 - 96;
        return (
          <g key={side}>
            <rect x={x} y="0" width="96" height={floorY} fill="url(#curtain)" />
            {[18, 40, 62, 82].map((dx) => (
              <path key={dx} d={`M${x + dx} 0 V${floorY}`} stroke="#150d08" strokeWidth="3" opacity="0.6" />
            ))}
            <path
              d={`M${x} ${floorY - 6} ${[0, 1, 2, 3].map((k) => `Q${x + 12 + k * 24} ${floorY + 22} ${x + 24 + k * 24} ${floorY - 6}`).join(" ")} L${x + 96} ${floorY - 6}`}
              fill="#2a1b12"
            />
          </g>
        );
      })}
      {/* Cenefa superior */}
      <rect x="0" y="0" width="1080" height="64" fill="#2a1b12" />
      <rect x="0" y="64" width="1080" height="8" fill={ACCENT} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={40 + i * 76 + (hash(i) - 0.5) * 2} cy="32" r="9" fill="#e6b23a" />
      ))}
    </svg>
  );
};
