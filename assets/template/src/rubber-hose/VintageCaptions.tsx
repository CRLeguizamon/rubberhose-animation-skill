import React, { useMemo } from "react";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { PAPER, SHOE } from "./RubberHoseCharacter";

export type CaptionPosition = "top" | "bottom";

export type VintageCaptionsProps = {
  captions: Caption[];
  /** Si es false, exporta video limpio (ideal cuando subes el .srt nativo). */
  showCaptions?: boolean;
  /** "bottom" (zona segura inferior <= 1520) o "top" (zona segura ~38% superior). */
  captionPosition?: CaptionPosition;
  highlightColor?: string;
};

/**
 * Subtítulos vintage estables en zona segura 9:16 (left: 70, right: 150, bottom <= 1520).
 * Peso y tamaño fijos: la palabra activa SOLO cambia de color (cero saltos).
 */
export const VintageCaptions: React.FC<VintageCaptionsProps> = ({
  captions,
  showCaptions = true,
  captionPosition = "bottom",
  highlightColor = SHOE,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isHorizontal = width > height;
  const currentMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1250 }),
    [captions]
  );

  if (!showCaptions) return null;

  const activePage = pages.find(
    (p) => currentMs >= p.startMs && currentMs <= p.startMs + p.durationMs
  );
  if (!activePage) return null;

  const isTop = captionPosition === "top";

  return (
    <div
      style={{
        position: "absolute",
        left: isHorizontal ? 160 : 70,
        right: isHorizontal ? 160 : 150,
        top: isTop ? (isHorizontal ? 120 : 690) : isHorizontal ? undefined : 1380,
        bottom: !isTop && isHorizontal ? 76 : undefined,
        height: 136,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <div
        style={{
          padding: "14px 26px",
          borderRadius: 16,
          background: "rgba(26, 20, 16, 0.9)",
          border: `3px solid ${highlightColor}`,
          boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 12,
          rowGap: 4,
        }}
      >
        {activePage.tokens.map((tok, idx) => {
          const active = currentMs >= tok.fromMs && currentMs < tok.toMs;
          return (
            <span
              key={`${tok.fromMs}-${idx}`}
              style={{
                fontSize: isHorizontal ? 36 : 38,
                fontWeight: 800,
                fontFamily: "system-ui, sans-serif",
                color: active ? highlightColor : PAPER,
              }}
            >
              {tok.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
