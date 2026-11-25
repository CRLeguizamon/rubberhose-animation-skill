import React from "react";
import { beatPosition, beatSignals, hash, onTwos, type DanceConfig } from "./beat";
import { ACCENT, GLOVE, INK, PAPER, SHOE } from "./RubberHoseCharacter";

export type HatType = "bowler" | "panama" | "fedora" | "chef" | "beret" | "crown" | "none";
export type OutfitType = "inkwell" | "guayabera" | "suit" | "striped" | "apron";
export type PropType = "none" | "maracas" | "cane" | "coffee" | "book";
export type ExpressionType = "happy" | "curious" | "surprised" | "cool";
export type MoveStyle = "charleston" | "jazz-hands" | "groove" | "walk";

export type ModularCharacterProps = {
  /** Frame global (el personaje se anima automáticamente "on twos" a 12 fps). */
  frame: number;
  danceCfg: DanceConfig;
  hat?: HatType;
  outfit?: OutfitType;
  prop?: PropType;
  expression?: ExpressionType;
  move?: MoveStyle;
  skinColor?: string;
  accentColor?: string;
  shoeColor?: string;
  /** Desactivar "on twos" si se necesita 24 fps suaves. Default: true. */
  animateOnTwos?: boolean;
};

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

/**
 * Creador modular de personajes rubber hose (años 30) animado "on twos" (12 fps) sin lip-sync.
 * Combina sombreros, ropa, accesorios en mano, expresiones y pasos de baile.
 */
export const ModularCharacter: React.FC<ModularCharacterProps> = ({
  frame,
  danceCfg,
  hat = "bowler",
  outfit = "inkwell",
  prop = "none",
  expression = "happy",
  move = "charleston",
  skinColor = PAPER,
  accentColor = ACCENT,
  shoeColor = SHOE,
  animateOnTwos = true,
}) => {
  const f = animateOnTwos ? onTwos(frame) : frame;
  const beatPos = beatPosition(f, danceCfg);
  const { lift, squash, theta } = beatSignals(beatPos);

  const GROUND = 690;
  const L = lift * (move === "groove" ? 18 : 26);
  const sw = Math.sin(theta);
  const cw = Math.cos(theta);

  const hipL: P = { x: 270, y: 545 - L };
  const hipR: P = { x: 330, y: 545 - L };
  const shL: P = { x: 234, y: 388 - L };
  const shR: P = { x: 366, y: 388 - L };
  const headY = 250 - L * 1.15 + squash * 7;

  // Brazos según estilo de movimiento
  const handL: P =
    move === "jazz-hands"
      ? { x: shL.x - 76 + 18 * Math.sin(2 * theta), y: shL.y - 140 + 18 * Math.cos(2 * theta) }
      : prop === "maracas"
        ? { x: shL.x - 82 + 20 * cw, y: shL.y - 34 + 48 * sw }
        : { x: shL.x - 68 + 34 * cw, y: shL.y + 88 + 44 * sw };

  const handR: P =
    move === "jazz-hands"
      ? { x: shR.x + 76 + 18 * Math.sin(2 * theta + Math.PI), y: shR.y - 140 + 18 * Math.cos(2 * theta + Math.PI) }
      : prop === "maracas"
        ? { x: shR.x + 82 - 20 * cw, y: shR.y - 34 - 48 * sw }
        : prop === "coffee" || prop === "book"
          ? { x: shR.x + 74, y: shR.y + 20 - lift * 12 }
          : { x: shR.x + 68 - 34 * cw, y: shR.y + 88 - 44 * sw };

  // Piernas
  const kickL = Math.max(0, sw);
  const kickR = Math.max(0, -sw);
  const stepAmp = move === "groove" ? 28 : 54;
  const footL: P = { x: 248 - stepAmp * kickL, y: GROUND - 44 * kickL };
  const footR: P = { x: 352 + stepAmp * kickR, y: GROUND - 44 * kickR };

  const blink = hash(Math.floor(f / 34) * 3.9) > 0.72 && f % 34 < 3;
  const lookX = Math.sin(theta * 0.5) * 6;

  return (
    <g>
      <ellipse cx="300" cy={GROUND + 26} rx={146 - lift * 22} ry="18" fill={INK} opacity={0.24} />

      {/* Piernas y zapatos */}
      <path d={hose(hipL, footL, 20 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d={hose(hipR, footR, -20 * sw)} stroke={INK} strokeWidth="26" strokeLinecap="round" fill="none" />
      {[
        { at: { x: footL.x - 16, y: footL.y + 4 }, ang: -22 * kickL, flip: -1 },
        { at: { x: footR.x + 16, y: footR.y + 4 }, ang: 22 * kickR, flip: 1 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.at.x} ${s.at.y}) rotate(${s.ang}) scale(${s.flip} 1)`}>
          <ellipse cx="18" cy="8" rx="48" ry="22" fill={shoeColor} stroke={INK} strokeWidth="8" />
          <path d="M-10 -4 Q10 -20 32 -8" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}

      {/* Torso según outfit */}
      <g transform={`translate(300 ${545 - L}) scale(${1 + squash * 0.07} ${1 - squash * 0.06}) translate(-300 ${-(545 - L)})`}>
        {outfit === "inkwell" && (
          <>
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill={INK} />
            <ellipse cx="300" cy={472 - L} rx="40" ry="56" fill={PAPER} opacity="0.92" />
            <circle cx="300" cy={454 - L} r="7" fill={INK} />
            <circle cx="300" cy={486 - L} r="7" fill={INK} />
          </>
        )}
        {outfit === "guayabera" && (
          <>
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill={PAPER} stroke={INK} strokeWidth="10" />
            <line x1="274" y1={368 - L} x2="274" y2={528 - L} stroke={INK} strokeWidth="4" opacity="0.35" />
            <line x1="326" y1={368 - L} x2="326" y2={528 - L} stroke={INK} strokeWidth="4" opacity="0.35" />
            <path d={`M256 ${365 - L} Q300 ${392 - L} 344 ${365 - L} L300 ${404 - L} Z`} fill={accentColor} stroke={INK} strokeWidth="6" />
          </>
        )}
        {outfit === "suit" && (
          <>
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill="#23293d" stroke={INK} strokeWidth="10" />
            <path d={`M268 ${360 - L} L300 ${446 - L} L332 ${360 - L} Z`} fill={PAPER} stroke={INK} strokeWidth="6" />
            <path d={`M294 ${374 - L} L300 ${444 - L} L306 ${374 - L} Z`} fill={accentColor} stroke={INK} strokeWidth="4" />
          </>
        )}
        {outfit === "striped" && (
          <>
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill={PAPER} stroke={INK} strokeWidth="10" />
            {[-48, -16, 16, 48].map((dy) => (
              <line key={dy} x1="230" y1={446 - L + dy} x2="370" y2={446 - L + dy} stroke={accentColor} strokeWidth="12" />
            ))}
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill="none" stroke={INK} strokeWidth="10" />
          </>
        )}
        {outfit === "apron" && (
          <>
            <ellipse cx="300" cy={446 - L} rx="82" ry="102" fill={INK} />
            <rect x="252" y={400 - L} width="96" height="126" rx="18" fill={PAPER} stroke={INK} strokeWidth="8" />
            <rect x="274" y={462 - L} width="52" height="32" rx="6" fill="none" stroke={INK} strokeWidth="5" />
          </>
        )}
      </g>

      {/* Brazos + guantes + props */}
      <path d={hose(shL, handL, 34 * sw)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d={hose(shR, handR, -34 * sw)} stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />

      {prop === "maracas" ? (
        [
          { at: handL, ang: -26 + sw * 24 },
          { at: handR, ang: 26 - sw * 24 },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.at.x} ${m.at.y}) rotate(${m.ang})`}>
            <rect x="-5" y="4" width="10" height="30" rx="4" fill="#8b5a2b" stroke={INK} strokeWidth="5" />
            <ellipse cx="0" cy="-16" rx="20" ry="24" fill={accentColor} stroke={INK} strokeWidth="7" />
            <path d="M-19 -16 H19" stroke={SHOE} strokeWidth="6" />
            <circle cx="0" cy="18" r="17" fill={GLOVE} stroke={INK} strokeWidth="6" />
          </g>
        ))
      ) : (
        <>
          <circle cx={handL.x} cy={handL.y} r="24" fill={GLOVE} stroke={INK} strokeWidth="7" />
          <circle cx={handR.x} cy={handR.y} r="24" fill={GLOVE} stroke={INK} strokeWidth="7" />
          {prop === "cane" && (
            <path
              d={`M${handR.x} ${handR.y} L${handR.x + 18} ${GROUND + 10} M${handR.x - 16} ${handR.y - 16} Q${handR.x} ${handR.y - 34} ${handR.x + 12} ${handR.y - 8}`}
              stroke="#6b4423"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {prop === "coffee" && (
            <g transform={`translate(${handR.x + 6} ${handR.y - 26})`}>
              <rect x="-18" y="-14" width="36" height="36" rx="6" fill={PAPER} stroke={INK} strokeWidth="6" />
              <path d="M18 -6 Q32 4 18 14" fill="none" stroke={INK} strokeWidth="6" />
              <path d={`M-6 -26 Q0 -38 -6 -48 M8 -24 Q14 -36 8 -46`} stroke={PAPER} strokeWidth="4" fill="none" opacity="0.7" />
            </g>
          )}
          {prop === "book" && (
            <g transform={`translate(${handR.x + 8} ${handR.y - 22}) rotate(-10)`}>
              <rect x="-24" y="-22" width="48" height="54" rx="5" fill={accentColor} stroke={INK} strokeWidth="6" />
              <line x1="-14" y1="-22" x2="-14" y2="32" stroke={SHOE} strokeWidth="6" />
            </g>
          )}
        </>
      )}

      {/* Cabeza + expresión + sombrero */}
      <g transform={`rotate(${sw * 5} 300 ${352 - L})`}>
        {outfit === "inkwell" && (
          <>
            <path d={`M300 ${352 - L} L254 ${334 - L} L256 ${370 - L} Z M300 ${352 - L} L346 ${334 - L} L344 ${370 - L} Z`} fill={accentColor} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
            <circle cx="300" cy={352 - L} r="10" fill={accentColor} stroke={INK} strokeWidth="5" />
          </>
        )}

        <circle cx="300" cy={headY + 4} r="88" fill={skinColor} stroke={INK} strokeWidth="10" />

        {/* Sombreros combinables */}
        {hat === "bowler" && (
          <>
            <path d={`M218 ${headY - 50} Q218 ${headY - 140} 300 ${headY - 140} Q382 ${headY - 140} 382 ${headY - 50} Z`} fill={INK} />
            <ellipse cx="300" cy={headY - 50} rx="108" ry="16" fill={INK} />
            <path d={`M220 ${headY - 62} Q300 ${headY - 46} 380 ${headY - 62}`} stroke={PAPER} strokeWidth="9" fill="none" />
          </>
        )}
        {hat === "panama" && (
          <>
            <ellipse cx="300" cy={headY - 54} rx="122" ry="20" fill="#ebd296" stroke={INK} strokeWidth="8" />
            <path d={`M228 ${headY - 56} Q238 ${headY - 130} 300 ${headY - 118} Q362 ${headY - 130} 372 ${headY - 56} Z`} fill="#ebd296" stroke={INK} strokeWidth="8" />
            <path d={`M230 ${headY - 66} Q300 ${headY - 50} 370 ${headY - 66}`} stroke={accentColor} strokeWidth="11" fill="none" />
          </>
        )}
        {hat === "fedora" && (
          <>
            <ellipse cx="300" cy={headY - 54} rx="112" ry="18" fill="#1d2233" stroke={INK} strokeWidth="8" />
            <path d={`M230 ${headY - 56} Q244 ${headY - 132} 300 ${headY - 122} Q356 ${headY - 132} 370 ${headY - 56} Z`} fill="#1d2233" stroke={INK} strokeWidth="8" />
            <path d={`M234 ${headY - 64} Q300 ${headY - 50} 366 ${headY - 64}`} stroke={SHOE} strokeWidth="9" fill="none" />
          </>
        )}
        {hat === "chef" && (
          <path
            d={`M236 ${headY - 56} C210 ${headY - 96} 230 ${headY - 146} 274 ${headY - 136} C288 ${headY - 160} 314 ${headY - 160} 326 ${headY - 136} C370 ${headY - 146} 390 ${headY - 96} 364 ${headY - 56} Z`}
            fill="#ffffff"
            stroke={INK}
            strokeWidth="8"
            strokeLinejoin="round"
          />
        )}
        {hat === "beret" && (
          <>
            <ellipse cx="308" cy={headY - 72} rx="86" ry="30" fill={accentColor} stroke={INK} strokeWidth="8" transform={`rotate(-12 308 ${headY - 72})`} />
            <path d={`M300 ${headY - 102} L306 ${headY - 118}`} stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </>
        )}
        {hat === "crown" && (
          <path
            d={`M244 ${headY - 58} L236 ${headY - 120} L274 ${headY - 92} L300 ${headY - 132} L326 ${headY - 92} L364 ${headY - 120} L356 ${headY - 58} Z`}
            fill={SHOE}
            stroke={INK}
            strokeWidth="8"
            strokeLinejoin="round"
          />
        )}

        {/* Ojos o gafas */}
        {expression === "cool" ? (
          <>
            <rect x="246" y={headY - 14} width="50" height="30" rx="9" fill={INK} stroke={SHOE} strokeWidth="4" />
            <rect x="304" y={headY - 14} width="50" height="30" rx="9" fill={INK} stroke={SHOE} strokeWidth="4" />
            <line x1="296" y1={headY} x2="304" y2={headY} stroke={SHOE} strokeWidth="5" />
          </>
        ) : (
          [270, 330].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={headY + 4} rx="21" ry={blink ? 4 : 28} fill="#fff" stroke={INK} strokeWidth="6" />
              {!blink && (
                <>
                  <ellipse cx={cx + lookX} cy={headY + 8} rx="11" ry="17" fill={INK} />
                  <path d={`M${cx + lookX} ${headY + 8} L${cx + lookX + 11} ${headY - 4} L${cx + lookX + 11} ${headY + 8} Z`} fill="#fff" />
                </>
              )}
            </g>
          ))
        )}

        {/* Nariz y expresión fija (sin lip-sync) */}
        <ellipse cx="300" cy={headY + 34} rx="15" ry="10" fill={INK} />
        {expression === "surprised" ? (
          <ellipse cx="300" cy={headY + 58} rx="16" ry="20" fill="#3a1410" stroke={INK} strokeWidth="6" />
        ) : expression === "curious" ? (
          <path d={`M274 ${headY + 56} Q300 ${headY + 48} 326 ${headY + 58}`} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        ) : (
          <path d={`M264 ${headY + 48} Q300 ${headY + 82} 336 ${headY + 48}`} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};
