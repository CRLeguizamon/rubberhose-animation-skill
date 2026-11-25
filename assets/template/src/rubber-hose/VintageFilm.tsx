import React from "react";
import { hash } from "./beat";

/**
 * Efecto de película antigua, 100% determinista por frame:
 * grano, rayones verticales, parpadeo del proyector, viñeta y tinte sepia.
 */
export const VintageFilm: React.FC<{ frame: number }> = ({ frame }) => {
  const grainSeed = frame % 12;
  const flicker = 0.035 * hash(frame * 1.7);

  // Rayones: aparecen de forma esporádica y cambian cada frame
  const scratches = [0, 1, 2].map((k) => {
    const on = hash(frame * 5.1 + k * 31) > 0.62;
    return on ? { x: hash(frame * 2.3 + k * 17) * 1080, w: 1 + hash(frame + k) * 2 } : null;
  });

  // Motas de polvo
  const specks = Array.from({ length: 5 }, (_, k) => ({
    x: hash(frame * 3.3 + k * 9) * 1080,
    y: hash(frame * 4.1 + k * 13) * 1920,
    r: 1.5 + hash(frame + k * 5) * 3,
    on: hash(frame * 7.7 + k) > 0.5,
  }));

  return (
    <>
      {/* Grano */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.22 }}>
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={grainSeed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#film-grain)" />
      </svg>

      {/* Rayones y polvo */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {scratches.map(
          (s, i) => s && <rect key={i} x={s.x} y="0" width={s.w} height="1920" fill="#fff8e6" opacity="0.5" />
        )}
        {specks.map((s, i) => s.on && <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#1a1410" opacity="0.55" />)}
      </svg>

      {/* Tinte sepia + parpadeo del proyector + viñeta */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(122, 78, 28, 0.10)", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(255, 244, 214, ${flicker})` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 48%, rgba(30,16,6,0.55) 100%)",
        }}
      />
    </>
  );
};
