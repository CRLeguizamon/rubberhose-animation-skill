import React from "react";
import { interpolate } from "remotion";
import { hash } from "./beat";

export type CameraRigProps = {
  /** Frame actual dentro de la escena (0..sceneDuration). */
  localFrame: number;
  /** Duración total de la escena en frames (para calcular push-in y paneo). */
  sceneDuration: number;
  /** Frame global (para temblor de proyector continuo entre escenas). */
  globalFrame: number;
  /** Escala inicial -> final (ej. 1.00 -> 1.05 push-in suave). */
  zoomFrom?: number;
  zoomTo?: number;
  /** Paneo horizontal total en px para el plano medio (fondo va a 0.4x, primer plano a 1.25x). */
  panX?: number;
  /** Capas en 3 planos de profundidad (far, mid, fore). */
  farLayer: React.ReactNode;
  midLayer?: React.ReactNode;
  foreLayer: React.ReactNode;
};

/**
 * Cámara cinematográfica de 3 planos con parallax y temblor vintage (gate weave).
 * Corre a 24 fps suaves mientras los personajes dentro de `foreLayer` se animan "on twos" (12 fps).
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  localFrame,
  sceneDuration,
  globalFrame,
  zoomFrom = 1.0,
  zoomTo = 1.045,
  panX = 24,
  farLayer,
  midLayer,
  foreLayer,
}) => {
  const prog = interpolate(localFrame, [0, Math.max(1, sceneDuration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(prog, [0, 1], [zoomFrom, zoomTo]);
  const basePan = interpolate(prog, [0, 1], [-panX / 2, panX / 2]);
  const weaveX = (hash(globalFrame * 1.31) - 0.5) * 4;
  const weaveY = (hash(globalFrame * 2.17) - 0.5) * 4;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${weaveX}px, ${weaveY}px) scale(${scale})`,
        transformOrigin: "50% 52%",
      }}
    >
      {/* Plano lejano (0.4x parallax) */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${basePan * 0.4}px)` }}>
        {farLayer}
      </div>

      {/* Plano medio: autos, árboles, props (0.85x parallax) */}
      {midLayer && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${basePan * 0.85}px)` }}>
          {midLayer}
        </div>
      )}

      {/* Primer plano: personaje y acción principal (1.15x parallax) */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${basePan * 1.15}px)` }}>
        {foreLayer}
      </div>
    </div>
  );
};
