import type { Caption } from "@remotion/captions";
import { clamp } from "./beat";

export type DuckingOptions = {
  /** Volumen de la música cuando la voz está hablando (default 0.13). */
  duckedVolume?: number;
  /** Volumen de la música durante pausas o transiciones sin voz (default 0.28). */
  openVolume?: number;
  /** Tiempo de ataque/recuperación en ms (default 220 ms). */
  rampMs?: number;
  /** Umbral de pausa mínima entre palabras para subir la música (default 340 ms). */
  pauseThresholdMs?: number;
};

/**
 * Calcula el volumen dinámico de la música (audio ducking / sidechain) a partir de captions.json.
 * Devuelve una función pura `(frame) => number` compatible con `<Audio volume={...} />` de Remotion.
 */
export function createVoiceDucking(
  captions: Caption[],
  fps: number,
  options: DuckingOptions = {}
): (frame: number) => number {
  const {
    duckedVolume = 0.13,
    openVolume = 0.28,
    rampMs = 220,
    pauseThresholdMs = 340,
  } = options;

  // Fusionar palabras cercanas en bloques continuos de habla
  const speechBlocks: { startMs: number; endMs: number }[] = [];
  for (const w of captions) {
    const startMs = Number(w.startMs ?? 0);
    const endMs = Number(w.endMs ?? startMs);
    const prev = speechBlocks[speechBlocks.length - 1];
    if (prev && startMs - prev.endMs <= pauseThresholdMs) {
      prev.endMs = Math.max(prev.endMs, endMs);
    } else {
      speechBlocks.push({ startMs, endMs });
    }
  }

  return (frame: number) => {
    const tMs = (frame / fps) * 1000;
    let duckStrength = 0;

    for (const blk of speechBlocks) {
      if (tMs >= blk.startMs && tMs <= blk.endMs) {
        duckStrength = 1;
        break;
      }
      if (tMs >= blk.startMs - rampMs && tMs < blk.startMs) {
        duckStrength = Math.max(duckStrength, clamp((tMs - (blk.startMs - rampMs)) / rampMs));
      } else if (tMs > blk.endMs && tMs <= blk.endMs + rampMs) {
        duckStrength = Math.max(duckStrength, clamp(1 - (tMs - blk.endMs) / rampMs));
      }
    }

    return openVolume - (openVolume - duckedVolume) * duckStrength;
  };
}
