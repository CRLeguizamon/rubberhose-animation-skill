/** Utilidades deterministas de ritmo, "on twos" (12 fps sobre 24 fps) y azar para animación vintage. */

export type DanceConfig = {
  bpm: number;
  fps: number;
  bars: number;
};

/** Hash determinista [0,1) — nunca Math.random() en Remotion. */
export const hash = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));

export const smooth = (v: number): number => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Animación clásica "on twos" (12 fps reales dentro de un canvas a 24 fps):
 * el personaje actualiza su pose cada 2 frames mientras la cámara, el parallax y el grano corren a 24 fps.
 */
export const onTwos = (frame: number): number => Math.floor(frame / 2) * 2;

/** Posición en pulsos (beats) para un frame dado. */
export const beatPosition = (frame: number, cfg: DanceConfig): number =>
  (frame / cfg.fps) * (cfg.bpm / 60);

/**
 * Señales de ritmo listas para animar:
 * - lift: 0 en el pulso, 1 a mitad del pulso (salto)
 * - squash: 1 justo en el pulso, cae rápido (aplastamiento al caer)
 * - theta: fase que alterna cada pulso (π por pulso)
 */
export const beatSignals = (beatPos: number) => {
  const b = beatPos - Math.floor(beatPos);
  return {
    b,
    lift: Math.sin(Math.PI * b),
    squash: Math.pow(1 - b, 4),
    theta: beatPos * Math.PI,
  };
};
