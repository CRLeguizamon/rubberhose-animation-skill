import React from "react";
import { beatSignals, clamp, hash } from "./beat";
import { ACCENT, GLOVE, INK, PAPER, SHOE } from "./RubberHoseCharacter";

type P = { x: number; y: number };

const hose = (from: P, to: P, bend: number): string => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const c1 = { x: from.x + dx * 0.33 + nx * bend, y: from.y + dy * 0.33 + ny * bend };
  const c2 = { x: from.x + dx * 0.68 - nx * bend * 0.85, y: from.y + dy * 0.68 - ny * bend * 0.85 };
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
};

const Shoe: React.FC<{ at: P; angle: number; flip: number; color?: string }> = ({
  at,
  angle,
  flip,
  color = SHOE,
}) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${angle}) scale(${flip} 1)`}>
    <ellipse cx="18" cy="8" rx="48" ry="22" fill={color} stroke={INK} strokeWidth="8" />
    <path d="M-10 -4 Q10 -20 32 -8" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="34" cy="2" rx="12" ry="6" fill="#fff6d8" opacity="0.5" />
  </g>
);

const Maraca: React.FC<{ at: P; angle: number }> = ({ at, angle }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${angle})`}>
    {/* Mango */}
    <rect x="-5" y="4" width="10" height="32" rx="4" fill="#8b5a2b" stroke={INK} strokeWidth="5" />
    {/* Cabeza de maraca */}
    <ellipse cx="0" cy="-16" rx="22" ry="26" fill={ACCENT} stroke={INK} strokeWidth="7" />
    <path d="M-21 -16 H21" stroke={SHOE} strokeWidth="7" />
    <circle cx="-8" cy="-24" r="4" fill={PAPER} opacity="0.7" />
    {/* Guante sosteniendo */}
    <circle cx="0" cy="18" r="18" fill={GLOVE} stroke={INK} strokeWidth="6" />
  </g>
);

/**
 * Personaje 1 (El Caribe): Músico con sombrero panamá, guayabera blanca y maracas.
 */
export const MaracasPlayer: React.FC<{ frame: number; beatPos: number }> = ({ frame, beatPos }) => {
  const { b, lift, squash, theta } = beatSignals(beatPos);
  const L = lift * 26;
  const GROUND = 690;
  const sw = Math.sin(theta);
  const cw = Math.cos(theta);

  const hipL: P = { x: 270, y: 545 - L };
  const hipR: P = { x: 330, y: 545 - L };
  const shL: P = { x: 234, y: 390 - L };
  const shR: P = { x: 366, y: 390 - L };
  const headY = 252 - L * 1.15 + squash * 7;

  // Manos sacudiendo las maracas arriba/abajo al ritmo
  const handL: P = { x: shL.x - 82 + 24 * cw, y: shL.y - 36 + 52 * sw };
  const handR: P = { x: shR.x + 82 - 24 * cw, y: shR.y - 36 - 52 * sw };
  const kickL = Math.max(0, sw);
  const kickR = Math.max(0, -sw);
  const footL: P = { x: 248 - 54 * kickL, y: GROUND - 46 * kickL };
  const footR: P = { x: 352 + 54 * kickR, y: GROUND - 46 * kickR };

  const blink = hash(Math.floor(frame / 32) * 4.3) > 0.72 && frame % 32 < 3;
  const open = clamp(0.3 + 0.7 * Math.sin(Math.PI * b));

  return (
    <g>
      <ellipse cx="300" cy={GROUND + 26} rx={142 - lift * 20} ry="18" fill={INK} opacity={0.22} />

      {/* Piernas con pantalón oscuro */}
      <path d={hose(hipL, footL, 20 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d={hose(hipR, footR, -20 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      <Shoe at={{ x: footL.x - 16, y: footL.y + 4 }} angle={-22 * kickL} flip={-1} color="#f5e6c4" />
      <Shoe at={{ x: footR.x + 16, y: footR.y + 4 }} angle={22 * kickR} flip={1} color="#f5e6c4" />

      {/* Guayabera caribeña con alforzas y botones */}
      <g transform={`translate(300 ${545 - L}) scale(${1 + squash * 0.07} ${1 - squash * 0.06}) translate(-300 ${-(545 - L)})`}>
        <ellipse cx="300" cy={448 - L} rx="82" ry="102" fill={PAPER} stroke={INK} strokeWidth="10" />
        <line x1="274" y1={368 - L} x2="274" y2={530 - L} stroke={INK} strokeWidth="4" opacity="0.35" />
        <line x1="326" y1={368 - L} x2="326" y2={530 - L} stroke={INK} strokeWidth="4" opacity="0.35" />
        <circle cx="300" cy={425 - L} r="6" fill={INK} />
        <circle cx="300" cy={458 - L} r="6" fill={INK} />
        <circle cx="300" cy={491 - L} r="6" fill={INK} />
        {/* Pañuelo rojo al cuello */}
        <path d={`M255 ${365 - L} Q300 ${392 - L} 345 ${365 - L} L300 ${404 - L} Z`} fill={ACCENT} stroke={INK} strokeWidth="6" />
      </g>

      {/* Brazos + maracas */}
      <path d={hose(shL, handL, 34 * sw)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d={hose(shR, handR, -34 * sw)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      <Maraca at={handL} angle={-28 + sw * 26} />
      <Maraca at={handR} angle={28 - sw * 26} />

      {/* Cabeza + sombrero panamá */}
      <g transform={`rotate(${sw * 6} 300 ${352 - L})`}>
        <circle cx="300" cy={headY + 4} r="88" fill="#f3d6b3" stroke={INK} strokeWidth="10" />
        {/* Sombrero panamá de paja con cinta roja */}
        <ellipse cx="300" cy={headY - 56} rx="126" ry="22" fill="#ebd296" stroke={INK} strokeWidth="8" />
        <path d={`M226 ${headY - 58} Q236 ${headY - 134} 300 ${headY - 122} Q364 ${headY - 134} 374 ${headY - 58} Z`} fill="#ebd296" stroke={INK} strokeWidth="8" />
        <path d={`M228 ${headY - 68} Q300 ${headY - 52} 372 ${headY - 68}`} stroke={ACCENT} strokeWidth="12" fill="none" />

        {/* Ojos de corte de pastel */}
        {[270, 330].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={headY + 4} rx="21" ry={blink ? 4 : 28} fill="#fff" stroke={INK} strokeWidth="6" />
            {!blink && (
              <>
                <ellipse cx={cx + sw * 6} cy={headY + 8} rx="11" ry="17" fill={INK} />
                <path d={`M${cx + sw * 6} ${headY + 8} L${cx + sw * 6 + 11} ${headY - 4} L${cx + sw * 6 + 11} ${headY + 8} Z`} fill="#fff" />
              </>
            )}
          </g>
        ))}

        {/* Bigote alegre + boca cantando */}
        <path d={`M264 ${headY + 34} Q282 ${headY + 22} 300 ${headY + 34} Q318 ${headY + 22} 336 ${headY + 34}`} stroke={INK} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path
          d={`M262 ${headY + 42} Q300 ${headY + 56 + 34 * open} 338 ${headY + 42} Z`}
          fill="#3a1410"
          stroke={INK}
          strokeWidth="6"
        />
      </g>
    </g>
  );
};

/**
 * Personaje 2 (Nueva York, años 70): Trompetista con traje, fedora, gafas y trompeta dorada.
 */
export const TrumpetPlayer: React.FC<{ frame: number; beatPos: number }> = ({ beatPos }) => {
  const { lift, squash, theta } = beatSignals(beatPos);
  const L = lift * 24;
  const GROUND = 690;
  const sw = Math.sin(theta);

  const hipL: P = { x: 266, y: 545 - L };
  const hipR: P = { x: 326, y: 545 - L };
  const shL: P = { x: 244, y: 392 - L };
  const shR: P = { x: 348, y: 392 - L };
  const headY = 256 - L * 1.12 + squash * 7;

  // Manos sosteniendo la trompeta apuntando arriba a la derecha
  const handL: P = { x: 392, y: headY + 34 - lift * 8 };
  const handR: P = { x: 438, y: headY + 18 - lift * 12 };
  const kickL = Math.max(0, sw);
  const kickR = Math.max(0, -sw);
  const footL: P = { x: 242 - 44 * kickL, y: GROUND - 38 * kickL };
  const footR: P = { x: 346 + 48 * kickR, y: GROUND - 38 * kickR };

  return (
    <g>
      <ellipse cx="298" cy={GROUND + 26} rx={145 - lift * 20} ry="18" fill={INK} opacity={0.32} />

      {/* Piernas */}
      <path d={hose(hipL, footL, 18 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d={hose(hipR, footR, -18 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      <Shoe at={{ x: footL.x - 16, y: footL.y + 4 }} angle={-18 * kickL} flip={-1} color="#ffffff" />
      <Shoe at={{ x: footR.x + 16, y: footR.y + 4 }} angle={18 * kickR} flip={1} color="#ffffff" />

      {/* Traje oscuro años 70 con solapa y corbata roja */}
      <g transform={`translate(296 ${545 - L}) scale(${1 + squash * 0.06} ${1 - squash * 0.05}) translate(-296 ${-(545 - L)})`}>
        <ellipse cx="296" cy={448 - L} rx="82" ry="102" fill="#23293d" stroke={INK} strokeWidth="10" />
        <path d={`M264 ${360 - L} L296 ${446 - L} L328 ${360 - L} Z`} fill={PAPER} stroke={INK} strokeWidth="6" />
        <path d={`M290 ${374 - L} L296 ${444 - L} L302 ${374 - L} Z`} fill={ACCENT} stroke={INK} strokeWidth="4" />
      </g>

      {/* Cabeza inclinada hacia atrás tocando */}
      <g transform={`rotate(${-8 + sw * 4} 296 ${350 - L})`}>
        <circle cx="296" cy={headY + 4} r="84" fill="#d9a173" stroke={INK} strokeWidth="10" />
        {/* Sombrero fedora vintage */}
        <ellipse cx="296" cy={headY - 54} rx="112" ry="18" fill="#1d2233" stroke={INK} strokeWidth="8" />
        <path d={`M226 ${headY - 56} Q240 ${headY - 134} 296 ${headY - 124} Q352 ${headY - 134} 366 ${headY - 56} Z`} fill="#1d2233" stroke={INK} strokeWidth="8" />
        <path d={`M230 ${headY - 64} Q296 ${headY - 50} 362 ${headY - 64}`} stroke={SHOE} strokeWidth="9" fill="none" />

        {/* Gafas oscuras cool + brillo */}
        <rect x="242" y={headY - 14} width="54" height="32" rx="10" fill={INK} stroke={SHOE} strokeWidth="4" />
        <rect x="304" y={headY - 14} width="54" height="32" rx="10" fill={INK} stroke={SHOE} strokeWidth="4" />
        <line x1="296" y1={headY} x2="304" y2={headY} stroke={SHOE} strokeWidth="5" />
        <line x1="252" y1={headY - 4} x2="266" y2={headY - 8} stroke="#fff" strokeWidth="4" opacity="0.65" />
        <line x1="314" y1={headY - 4} x2="328" y2={headY - 8} stroke="#fff" strokeWidth="4" opacity="0.65" />

        {/* Mejilla inflada soplando la trompeta */}
        <circle cx="332" cy={headY + 38} r={18 + lift * 5} fill="#e6b084" stroke={INK} strokeWidth="6" />
      </g>

      {/* Trompeta dorada + ondas de sonido al pulso */}
      <g transform={`translate(348 ${headY + 34}) rotate(${-18 - lift * 5})`}>
        <rect x="0" y="-7" width="132" height="14" rx="6" fill={SHOE} stroke={INK} strokeWidth="6" />
        {/* Pistones */}
        {[48, 64, 80].map((px) => (
          <rect key={px} x={px} y="-22" width="10" height="16" rx="3" fill="#fff2b2" stroke={INK} strokeWidth="4" />
        ))}
        {/* Campana */}
        <path d="M126 -8 L178 -42 L178 42 L126 8 Z" fill={SHOE} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
        <ellipse cx="178" cy="0" rx="11" ry="42" fill="#8f5b12" stroke={INK} strokeWidth="6" />
        {/* Ondas musicales saliendo de la campana */}
        <path
          d={`M${198 + lift * 14} -26 Q${218 + lift * 14} 0 ${198 + lift * 14} 26`}
          fill="none"
          stroke={PAPER}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={0.45 + lift * 0.55}
        />
        <path
          d={`M${220 + lift * 22} -44 Q${248 + lift * 22} 0 ${220 + lift * 22} 44`}
          fill="none"
          stroke={SHOE}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={lift * 0.85}
        />
      </g>

      {/* Brazos + guantes sosteniendo la trompeta */}
      <path d={hose(shL, handL, 28)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d={hose(shR, handR, -22)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      <circle cx={handL.x} cy={handL.y} r="19" fill={GLOVE} stroke={INK} strokeWidth="6" />
      <circle cx={handR.x} cy={handR.y} r="19" fill={GLOVE} stroke={INK} strokeWidth="6" />
    </g>
  );
};

/**
 * Auto vintage estilo rubber hose (clásico turquesa de La Habana o taxi amarillo de NY)
 * rebotando al ritmo con ojos en el parabrisas y humo musical por el escape.
 */
export const VintageCar: React.FC<{
  x: number;
  y: number;
  beatPos: number;
  variant: "habana" | "ny-taxi";
  flip?: boolean;
}> = ({ x, y, beatPos, variant, flip = false }) => {
  const { lift, squash } = beatSignals(beatPos);
  const bodyColor = variant === "habana" ? "#4eb3a8" : "#f2c12e";
  const roofColor = variant === "habana" ? PAPER : "#f2c12e";
  const bounceY = -lift * 10;

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      {/* Sombra */}
      <ellipse cx="0" cy="46" rx="126" ry="14" fill={INK} opacity="0.28" />

      {/* Humo musical saliendo del escape */}
      <g opacity={0.5 + lift * 0.45}>
        <circle cx={-136 - lift * 18} cy={14 - lift * 14} r="12" fill={PAPER} stroke={INK} strokeWidth="4" />
        <circle cx={-166 - lift * 28} cy={-4 - lift * 22} r="17" fill={PAPER} stroke={INK} strokeWidth="4" />
      </g>

      {/* Carrocería con squash & stretch */}
      <g transform={`translate(0 ${bounceY}) scale(${1 + squash * 0.04} ${1 - squash * 0.04})`}>
        {/* Techo */}
        <path
          d="M-68 -14 Q-52 -74 8 -74 Q64 -74 82 -14 Z"
          fill={roofColor}
          stroke={INK}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {/* Parabrisas con ojos cartoon */}
        <path d="M-48 -18 Q-36 -58 10 -58 Q50 -58 64 -18 Z" fill="#d9eef2" stroke={INK} strokeWidth="6" />
        {[-6, 30].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy="-34" rx="11" ry="14" fill="#fff" stroke={INK} strokeWidth="4" />
            <ellipse cx={ex + 3} cy="-33" rx="6" ry="9" fill={INK} />
          </g>
        ))}

        {/* Cuerpo principal */}
        <path
          d="M-118 22 Q-122 -14 -82 -18 L92 -18 Q128 -14 128 22 L124 34 H-118 Z"
          fill={bodyColor}
          stroke={INK}
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Franja ajedrezada si es taxi NY, o cromo si es clásico Habana */}
        {variant === "ny-taxi" ? (
          <g>
            {[-78, -50, -22, 6, 34, 62].map((cx) => (
              <rect key={cx} x={cx} y="2" width="14" height="12" fill={INK} />
            ))}
            {/* Cartelito TAXI en el techo */}
            <rect x="-24" y="-92" width="54" height="20" rx="5" fill={PAPER} stroke={INK} strokeWidth="5" />
          </g>
        ) : (
          <path d="M-104 4 H112" stroke={PAPER} strokeWidth="7" strokeLinecap="round" />
        )}

        {/* Faro delantero */}
        <ellipse cx="124" cy="4" rx="10" ry="14" fill="#fff7b8" stroke={INK} strokeWidth="5" />
      </g>

      {/* Ruedas */}
      {[-68, 68].map((wx) => (
        <g key={wx} transform={`translate(${wx} 32)`}>
          <circle r="26" fill={INK} />
          <circle r="13" fill={PAPER} stroke={INK} strokeWidth="4" />
          <circle r="5" fill={ACCENT} />
        </g>
      ))}
    </g>
  );
};
