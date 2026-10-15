import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TIMED_SUBTITLES } from "../../HowAIWorks/voiceoverScript";

interface ManimSubtitlesProps {
  blueColor: string;
  yellowColor: string;
}

export const ManimSubtitles: React.FC<ManimSubtitlesProps> = ({
  blueColor,
  yellowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeSub = TIMED_SUBTITLES.find(
    (sub) => frame >= sub.startFrame && frame <= sub.endFrame
  );

  if (!activeSub) return null;

  const framesIntoSub = frame - activeSub.startFrame;
  const entrance = spring({
    frame: framesIntoSub,
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  const translateY = interpolate(entrance, [0, 1], [10, 0]);
  const opacity = interpolate(framesIntoSub, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const words = activeSub.text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 230,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          backgroundColor: "rgba(22, 24, 31, 0.92)",
          border: `1.5px solid ${blueColor}66`,
          borderRadius: 12,
          padding: "16px 28px",
          maxWidth: 960,
          textAlign: "center",
          boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.35,
            fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
            display: "inline-block",
            color: "#ECEFF4",
          }}
        >
          {words.map((w, index) => {
            const cleanWord = w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const isHighlight =
              activeSub.highlightWords?.some((hw) =>
                hw.toLowerCase().includes(cleanWord)
              ) ?? false;

            return (
              <span
                key={index}
                style={{
                  color: isHighlight ? yellowColor : "#ECEFF4",
                  textShadow: isHighlight
                    ? `0 0 10px ${yellowColor}88`
                    : "none",
                  marginRight: 8,
                  display: "inline-block",
                  fontStyle: isHighlight ? "italic" : "normal",
                  fontWeight: isHighlight ? 800 : 600,
                }}
              >
                {w}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
