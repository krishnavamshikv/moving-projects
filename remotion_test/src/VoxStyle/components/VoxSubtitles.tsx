import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TIMED_SUBTITLES } from "../../HowAIWorks/voiceoverScript";

interface VoxSubtitlesProps {
  highlightColor: string;
}

export const VoxSubtitles: React.FC<VoxSubtitlesProps> = ({ highlightColor }) => {
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

  const translateY = interpolate(entrance, [0, 1], [12, 0]);
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
          backgroundColor: "#18181A",
          border: "2px solid #18181A",
          boxShadow: "0 15px 35px rgba(0,0,0,0.25), 4px 4px 0px #FFE600",
          borderRadius: 8,
          padding: "16px 28px",
          maxWidth: 960,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1.35,
            fontFamily: "'Helvetica Neue', -apple-system, sans-serif",
            display: "inline-block",
            color: "#FFF",
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
                  backgroundColor: isHighlight ? highlightColor : "transparent",
                  color: isHighlight ? "#18181A" : "#FFFFFF",
                  padding: isHighlight ? "2px 8px" : "0",
                  borderRadius: isHighlight ? 4 : 0,
                  marginRight: 8,
                  display: "inline-block",
                  fontWeight: isHighlight ? 900 : 700,
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
