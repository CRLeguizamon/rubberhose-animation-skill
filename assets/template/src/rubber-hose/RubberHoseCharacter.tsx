import React from "react";
import { clamp, hash, lerp, smooth, beatSignals } from "./beat";

export const INK = "#1a1410";
export const PAPER = "#f6ecd2";
export const GLOVE = "#fffaf0";
export const SHOE = "#e6b23a";
export const ACCENT = "#c2372b";

type P = { x: number; y: number };

/** Tubo "manguera de goma": curva en S sin codos ni rodillas. */
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

const Glove: React.FC<{ at: P; angle: number }> = ({ at, angle }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${angle})`}>
    <circle r="27" fill={GLOVE} stroke={INK} strokeWidth="7" />
    <circle cx="-17" cy="-15" r="10" fill={GLOVE} stroke={INK} strokeWidth="6" />
    <path d="M-8 -14 V-2 M2 -16 V-2 M12 -12 V-2" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </g>
);

const Shoe: React.FC<{ at: P; angle: number; flip: number }> = ({ at, angle, flip }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${angle}) scale(${flip} 1)`}>
    <ellipse cx="18" cy="8" rx="52" ry="24" fill={SHOE} stroke={INK} strokeWidth="8" />
    <path d="M-10 -4 Q10 -22 34 -8" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="38" cy="2" rx="14" ry="7" fill="#fff6d8" opacity="0.55" />
  </g>
);

export type CharacterProps = {
  frame: number;
  beatPos: number;
  /** Para sacar al personaje del baile en el "ta-da" final. */
  armsUp: number;
  /** 0 = sin salto (pose final), 1 = salto completo. */
  energy: number;
};

/**
 * Personaje original "Bombín": estilo rubber hose de los años 30.
 * Cuerpo de tintero, ojos de corte de pastel, guantes de cuatro dedos,
 * zapatos enormes y extremidades de manguera. Todo es función pura de (frame, beatPos).
 */
export const RubberHoseCharacter: React.FC<CharacterProps> = ({
  frame,
  beatPos,
  armsUp,
  energy,
}) => {
  const { b, lift, squash, theta } = beatSignals(beatPos);
  const L = lift * 26 * energy; // altura del salto del cuerpo
  const sq = squash * energy;
  const GROUND = 690;

  // Cuerpo y cabeza
  const hipL: P = { x: 270, y: 545 - L };
  const hipR: P = { x: 330, y: 545 - L };
  const shL: P = { x: 232, y: 385 - L };
  const shR: P = { x: 368, y: 385 - L };
  const headTilt = Math.sin(theta) * 6 * energy;
  const headY = 248 - L * 1.15 + sq * 8;

  // Brazos: Charleston balanceando, o manos arriba (jazz hands)
  const sw = Math.sin(theta);
  const cw = Math.cos(theta);
  const charL: P = { x: shL.x - 70 + 40 * cw, y: shL.y + 95 + 50 * sw };
  const charR: P = { x: shR.x + 70 - 40 * cw, y: shR.y + 95 - 50 * sw };
  const upL: P = { x: shL.x - 78 + 20 * Math.sin(2 * theta), y: shL.y - 150 + 22 * Math.cos(2 * theta) };
  const upR: P = { x: shR.x + 78 + 20 * Math.sin(2 * theta + Math.PI), y: shR.y - 150 + 22 * Math.cos(2 * theta + Math.PI) };
  const handL: P = { x: lerp(charL.x, upL.x, armsUp), y: lerp(charL.y, upL.y, armsUp) };
  const handR: P = { x: lerp(charR.x, upR.x, armsUp), y: lerp(charR.y, upR.y, armsUp) };
  const armBend = 38 * Math.sin(theta + 1);

  // Piernas: patada Charleston alternada
  const kickL = Math.max(0, sw);
  const kickR = Math.max(0, -sw);
  const footL: P = { x: 246 - 62 * kickL * energy, y: GROUND - 54 * kickL * energy };
  const footR: P = { x: 354 + 62 * kickR * energy, y: GROUND - 54 * kickR * energy };
  const legBend = 22 * Math.sin(theta);

  // Ojos: pupilas miran de lado a lado; parpadeo con hash determinista
  const blinkSlot = Math.floor(frame / 36);
  const blinking = hash(blinkSlot * 3.7) > 0.72 && frame % 36 < 3;
  const eyeRy = blinking ? 4 : 31;
  const lookX = Math.sin(theta * 0.5) * 7;

  // Boca: se abre en cada pulso (canta al ritmo)
  const open = clamp(0.25 + 0.75 * Math.sin(Math.PI * b)) * energy + (1 - energy) * 0.7;
  const mouthY = 292;
  const mouth = `M252 ${mouthY} Q300 ${mouthY + 18 + 52 * open} 348 ${mouthY} Q300 ${mouthY - 6} 252 ${mouthY} Z`;

  return (
    <g>
      {/* Sombra en el piso */}
      <ellipse cx="300" cy={GROUND + 28} rx={150 - lift * 24 * energy} ry="20" fill={INK} opacity={0.22 - lift * 0.08 * energy} />

      {/* Piernas (detrás del cuerpo) */}
      <path d={hose(hipL, footL, legBend)} stroke={INK} strokeWidth="27" strokeLinecap="round" fill="none" />
      <path d={hose(hipR, footR, -legBend)} stroke={INK} strokeWidth="27" strokeLinecap="round" fill="none" />
      <Shoe at={{ x: footL.x - 18, y: footL.y + 4 }} angle={-24 * kickL * energy} flip={-1} />
      <Shoe at={{ x: footR.x + 18, y: footR.y + 4 }} angle={24 * kickR * energy} flip={1} />

      {/* Cuerpo (tintero) con squash & stretch */}
      <g transform={`translate(300 ${545 - L}) scale(${1 + sq * 0.07} ${1 - sq * 0.06}) translate(-300 ${-(545 - L)})`}>
        <ellipse cx="300" cy={440 - L} rx="82" ry="104" fill={INK} />
        <ellipse cx="300" cy={470 - L} rx="40" ry="58" fill={PAPER} opacity="0.92" />
        <circle cx="300" cy={452 - L} r="7" fill={INK} />
        <circle cx="300" cy={486 - L} r="7" fill={INK} />
      </g>

      {/* Brazos */}
      <path d={hose(shL, handL, armBend)} stroke={INK} strokeWidth="23" strokeLinecap="round" fill="none" />
      <path d={hose(shR, handR, -armBend)} stroke={INK} strokeWidth="23" strokeLinecap="round" fill="none" />
      <Glove at={handL} angle={-20 + sw * 14 + armsUp * 20} />
      <Glove at={handR} angle={20 - sw * 14 - armsUp * 20} />

      {/* Cabeza */}
      <g transform={`rotate(${headTilt} 300 ${352 - L})`}>
        {/* Moño */}
        <path d={`M300 ${352 - L} L252 ${334 - L} L254 ${372 - L} Z M300 ${352 - L} L348 ${334 - L} L346 ${372 - L} Z`} fill={ACCENT} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <circle cx="300" cy={352 - L} r="11" fill={ACCENT} stroke={INK} strokeWidth="5" />

        <circle cx="300" cy={headY + 4} r="94" fill={PAPER} stroke={INK} strokeWidth="11" />
        {/* Sombrero bombín */}
        <path d={`M214 ${headY - 52} Q214 ${headY - 148} 300 ${headY - 148} Q386 ${headY - 148} 386 ${headY - 52} Z`} fill={INK} />
        <ellipse cx="300" cy={headY - 52} rx="112" ry="17" fill={INK} />
        <path d={`M216 ${headY - 64} Q300 ${headY - 46} 384 ${headY - 64}`} stroke={PAPER} strokeWidth="9" fill="none" />

        {/* Ojos de corte de pastel */}
        {[268, 332].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={headY + 4} rx="23" ry={eyeRy} fill="#fff" stroke={INK} strokeWidth="6" />
            {!blinking && (
              <>
                <ellipse cx={cx + lookX} cy={headY + 8} rx="12" ry="19" fill={INK} />
                <path d={`M${cx + lookX} ${headY + 8} L${cx + lookX + 12} ${headY - 6} L${cx + lookX + 12} ${headY + 8} Z`} fill="#fff" />
              </>
            )}
          </g>
        ))}

        {/* Nariz y boca */}
        <ellipse cx="300" cy={headY + 36} rx="17" ry="12" fill={INK} />
        <g transform={`translate(0 ${headY - 252})`}>
          <path d={mouth} fill="#3a1410" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
          {open > 0.45 && <ellipse cx="300" cy={mouthY + 12 + 15 * open} rx="20" ry={6 + 6 * open} fill={ACCENT} />}
        </g>
        {/* Mejillas */}
        <circle cx="236" cy={headY + 40} r="9" fill={ACCENT} opacity="0.28" />
        <circle cx="364" cy={headY + 40} r="9" fill={ACCENT} opacity="0.28" />
      </g>
    </g>
  );
};

export { smooth };
