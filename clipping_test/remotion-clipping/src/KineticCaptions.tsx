import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WordTiming } from "./types";

interface KineticCaptionsProps {
  words: WordTiming[];
  accentColor?: string;
  fontSize?: number;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  words = [],
  accentColor = "#FFD700",
  fontSize = 58,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  if (!words || words.length === 0) {
    return null;
  }

  // Find the index of the active word
  const activeIndex = words.findIndex(
    (w) => currentMs >= w.startMs && currentMs <= w.endMs
  );

  // If no word is strictly active, find the closest upcoming or recent word
  let currentIndex = activeIndex;
  if (currentIndex === -1) {
    currentIndex = words.findIndex((w) => w.startMs > currentMs);
    if (currentIndex === -1) {
      // Past the end of all words
      currentIndex = words.length - 1;
    } else if (currentIndex > 0) {
      currentIndex = currentIndex - 1;
    }
  }

  // Chunk words into small visual phrases (e.g., 3-4 words centered around current)
  const windowSize = 3;
  const chunkStart = Math.max(0, Math.floor(currentIndex / windowSize) * windowSize);
  const chunkEnd = Math.min(words.length, chunkStart + windowSize);
  const visibleWords = words.slice(chunkStart, chunkEnd);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 420, // Prime eye-level vertical position for 9:16 Shorts/Reels
        left: 30,
        right: 30,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        zIndex: 55,
      }}
    >
      {visibleWords.map((item, idx) => {
        const globalIdx = chunkStart + idx;
        const isActive = globalIdx === activeIndex;

        // Bounce spring on word activation
        const wordSpring = spring({
          frame: Math.max(0, frame - Math.floor((item.startMs / 1000) * fps)),
          fps,
          config: { damping: 10, stiffness: 220 },
        });

        const scale = isActive
          ? interpolate(wordSpring, [0, 1], [0.9, 1.15])
          : 1.0;

        const color = isActive ? accentColor : "#FFFFFF";

        return (
          <span
            key={`${item.word}-${item.startMs}-${globalIdx}`}
            style={{
              fontFamily: "Inter, Montserrat, sans-serif",
              fontSize,
              fontWeight: 900,
              textTransform: "uppercase",
              color,
              transform: `scale(${scale})`,
              display: "inline-block",
              letterSpacing: "-0.01em",
              textShadow:
                "0 4px 12px rgba(0, 0, 0, 0.95), 0 0 4px #000, 2px 2px 0 #000, -2px -2px 0 #000",
              filter: isActive
                ? `drop-shadow(0 0 12px ${accentColor}88)`
                : "drop-shadow(0 4px 8px rgba(0,0,0,0.8))",
              transition: "color 0.1s ease",
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
