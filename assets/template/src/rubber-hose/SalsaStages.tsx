import React from "react";
import { beatSignals, hash } from "./beat";
import { INK, PAPER, ACCENT, SHOE } from "./RubberHoseCharacter";

/**
 * Escena 1: El Caribe años 30 (Cuba y Puerto Rico)
 * Sol sonriente estilo rubber hose, palmeras de tronco curvo bailando al pulso, mar y malecón.
 */
export const CaribbeanStage: React.FC<{ frame: number; beatPos: number; floorY: number }> = ({
  frame,
  beatPos,
  floorY,
}) => {
  const { lift, theta } = beatSignals(beatPos);
  const sway = Math.sin(theta) * 26;
  const sunRot = frame * 0.55;
  const waveShift = (frame * 3.5) % 120;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="carib-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d59c" />
          <stop offset="55%" stopColor="#f8e8be" />
          <stop offset="100%" stopColor="#e8c284" />
        </linearGradient>
      </defs>

      <rect width="1080" height="1920" fill="url(#carib-sky)" />

      {/* Rayos de sol suaves */}
      <g transform={`translate(760 560) rotate(${sunRot})`} opacity="0.28">
        {Array.from({ length: 14 }, (_, i) => {
          const a0 = (i / 14) * Math.PI * 2;
          const a1 = a0 + Math.PI / 14;
          return (
            <path
              key={i}
              d={`M0 0 L${Math.cos(a0) * 1400} ${Math.sin(a0) * 1400} L${Math.cos(a1) * 1400} ${Math.sin(a1) * 1400} Z`}
              fill="#fff7dc"
            />
          );
        })}
      </g>

      {/* Sol sonriente con ojos de corte de pastel */}
      <g transform={`translate(760 ${560 - lift * 12})`}>
        <circle r="86" fill={SHOE} stroke={INK} strokeWidth="9" />
        {[-26, 26].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="-10" rx="14" ry="20" fill="#fff" stroke={INK} strokeWidth="5" />
            <ellipse cx={cx} cy="-6" rx="8" ry="13" fill={INK} />
            <path d={`M${cx} -6 L${cx + 8} -14 L${cx + 8} -6 Z`} fill="#fff" />
          </g>
        ))}
        <path d="M-32 22 Q0 54 32 22" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* Palmera izquierda bailando al ritmo */}
      <g>
        <path
          d={`M120 ${floorY} Q${160 + sway} ${floorY - 320} ${190 + sway * 1.4} ${floorY - 620}`}
          fill="none"
          stroke="#5c3b21"
          strokeWidth="36"
          strokeLinecap="round"
        />
        <path
          d={`M120 ${floorY} Q${160 + sway} ${floorY - 320} ${190 + sway * 1.4} ${floorY - 620}`}
          fill="none"
          stroke={INK}
          strokeWidth="8"
          strokeDasharray="12 24"
        />
        <g transform={`translate(${190 + sway * 1.4} ${floorY - 620}) rotate(${sway * 0.4})`}>
          {[-140, -90, -30, 35, 95].map((ang) => (
            <path
              key={ang}
              d="M0 0 Q70 -50 155 15 Q80 -10 0 14 Z"
              fill="#3e6b48"
              stroke={INK}
              strokeWidth="7"
              strokeLinejoin="round"
              transform={`rotate(${ang})`}
            />
          ))}
        </g>
      </g>

      {/* Palmera derecha */}
      <g>
        <path
          d={`M960 ${floorY} Q${910 - sway} ${floorY - 280} ${885 - sway * 1.3} ${floorY - 540}`}
          fill="none"
          stroke="#5c3b21"
          strokeWidth="32"
          strokeLinecap="round"
        />
        <g transform={`translate(${885 - sway * 1.3} ${floorY - 540}) rotate(${-sway * 0.4})`}>
          {[-150, -95, -25, 45, 110].map((ang) => (
            <path
              key={ang}
              d="M0 0 Q65 -45 140 14 Q70 -8 0 12 Z"
              fill="#3e6b48"
              stroke={INK}
              strokeWidth="7"
              strokeLinejoin="round"
              transform={`rotate(${ang})`}
            />
          ))}
        </g>
      </g>

      {/* Mar vintage con olas animadas */}
      <rect x="0" y={floorY - 110} width="1080" height="120" fill="#4f7c8a" stroke={INK} strokeWidth="7" />
      <path
        d={Array.from({ length: 12 }, (_, i) => {
          const x = i * 120 - waveShift;
          return `M${x} ${floorY - 75} Q${x + 30} ${floorY - 95} ${x + 60} ${floorY - 75} T${x + 120} ${floorY - 75}`;
        }).join(" ")}
        fill="none"
        stroke={PAPER}
        strokeWidth="6"
        opacity="0.7"
      />

      {/* Malecón / piso de madera tropical */}
      <rect x="0" y={floorY} width="1080" height={1920 - floorY} fill="#d6a563" />
      <rect x="0" y={floorY - 8} width="1080" height="10" fill={INK} />
      {[60, 130, 210, 300, 410].map((dy) => (
        <line key={dy} x1="0" y1={floorY + dy} x2="1080" y2={floorY + dy} stroke={INK} strokeWidth="4" opacity="0.45" />
      ))}
    </svg>
  );
};

/**
 * Escena 2: Nueva York, años 70 (El Barrio / Salsa Club)
 * Skyline vintage con ventanas parpadeando al ritmo, luna sonriente, letrero y piso ajedrezado.
 */
export const NewYorkStage: React.FC<{ frame: number; beatPos: number; floorY: number }> = ({
  frame,
  beatPos,
  floorY,
}) => {
  const { lift } = beatSignals(beatPos);
  const pulse = Math.floor(beatPos);
  const buildings = [
    { x: 0, w: 170, h: 660 },
    { x: 155, w: 190, h: 780 },
    { x: 330, w: 165, h: 580 },
    { x: 485, w: 200, h: 830 },
    { x: 675, w: 175, h: 640 },
    { x: 835, w: 245, h: 740 },
  ];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="ny-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2236" />
          <stop offset="65%" stopColor="#2e354d" />
          <stop offset="100%" stopColor="#4c3e4f" />
        </linearGradient>
        <pattern id="ny-checker" width="180" height="120" patternUnits="userSpaceOnUse">
          <rect width="180" height="120" fill={PAPER} />
          <rect width="90" height="60" fill={INK} />
          <rect x="90" y="60" width="90" height="60" fill={INK} />
        </pattern>
      </defs>

      <rect width="1080" height="1920" fill="url(#ny-sky)" />

      {/* Reflectores de club bailando en el cielo */}
      <path
        d={`M220 ${floorY} L${140 + Math.sin(frame * 0.08) * 140} 0 L${320 + Math.sin(frame * 0.08) * 140} 0 Z`}
        fill={SHOE}
        opacity="0.14"
      />
      <path
        d={`M840 ${floorY} L${680 - Math.sin(frame * 0.08) * 140} 0 L${860 - Math.sin(frame * 0.08) * 140} 0 Z`}
        fill="#f2d599"
        opacity="0.14"
      />

      {/* Luna creciente sonriente */}
      <g transform={`translate(820 ${500 - lift * 10})`}>
        <circle r="66" fill={PAPER} stroke={INK} strokeWidth="8" />
        <circle cx="24" cy="-10" r="54" fill="#252c42" />
      </g>

      {/* Skyline de Nueva York */}
      {buildings.map((b, bi) => {
        const by = floorY - b.h;
        return (
          <g key={bi}>
            <rect x={b.x} y={by} width={b.w} height={b.h} fill="#181620" stroke={INK} strokeWidth="7" />
            {Array.from({ length: Math.floor((b.h - 140) / 72) }, (_, row) =>
              Array.from({ length: 3 }, (_, col) => {
                const lit = hash(bi * 31 + row * 7 + col * 3 + Math.floor(pulse / 2)) > 0.42;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={b.x + 24 + col * 46}
                    y={by + 44 + row * 72}
                    width="26"
                    height="38"
                    rx="4"
                    fill={lit ? SHOE : "#2a2736"}
                    stroke={INK}
                    strokeWidth="3"
                    opacity={lit ? 0.9 : 0.7}
                  />
                );
              })
            )}
          </g>
        );
      })}

      {/* Letrero luminoso SALSA CLUB sobre el edificio izquierdo (100% visible) */}
      <g transform={`translate(250 ${floorY - 790}) rotate(-4)`}>
        <rect x="-155" y="-36" width="310" height="70" rx="12" fill={ACCENT} stroke={INK} strokeWidth="7" />
        <rect x="-143" y="-26" width="286" height="50" rx="7" fill="none" stroke={SHOE} strokeWidth="4" strokeDasharray="10 10" />
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fill={PAPER}
          fontFamily="serif"
          fontWeight="900"
          fontSize="34"
          letterSpacing="3"
        >
          SALSA CLUB
        </text>
      </g>

      {/* Acera / piso ajedrezado */}
      <rect x="0" y={floorY} width="1080" height={1920 - floorY} fill="url(#ny-checker)" />
      <rect x="0" y={floorY - 10} width="1080" height="12" fill={INK} />
    </svg>
  );
};
