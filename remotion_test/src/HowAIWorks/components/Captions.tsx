import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TIMED_SUBTITLES } from "../voiceoverScript";

interface CaptionsProps {
  primaryColor: string;
  highlightColor: string;
}

export const Captions: React.FC<CaptionsProps> = ({
  primaryColor,
  highlightColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active subtitle
  const activeSub = TIMED_SUBTITLES.find(
    (sub) => frame >= sub.startFrame && frame <= sub.endFrame
  );

  if (!activeSub) return null;

  const framesIntoSub = frame - activeSub.startFrame;
  const subEntrance = spring({
    frame: framesIntoSub,
    fps,
    config: {
      damping: 24,
      stiffness: 160,
    },
  });

  const scale = interpolate(subEntrance, [0, 1], [0.94, 1]);
  const translateY = interpolate(subEntrance, [0, 1], [15, 0]);
  const opacity = interpolate(framesIntoSub, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const words = activeSub.text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 240, // 9:16 vertical safe zone
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          backgroundColor: "rgba(10, 14, 23, 0.82)",
          border: `1px solid ${primaryColor}33`,
          backdropFilter: "blur(16px)",
          borderRadius: 24,
          padding: "16px 28px",
          maxWidth: 960,
          textAlign: "center",
          boxShadow: `0 20px 40px rgba(0,0,0,0.7), 0 0 30px ${primaryColor}22`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            fontFamily: "system-ui, -apple-system, sans-serif",
            display: "inline-block",
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
                  color: isHighlight ? highlightColor : "#FFFFFF",
                  textShadow: isHighlight
                    ? `0 0 16px ${highlightColor}99`
                    : "0 2px 4px rgba(0,0,0,0.5)",
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
