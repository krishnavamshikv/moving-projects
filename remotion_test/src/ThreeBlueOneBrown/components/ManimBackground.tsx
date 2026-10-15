import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

interface ManimBackgroundProps {
  backgroundColor: string;
  blueColor: string;
}

export const ManimBackground: React.FC<ManimBackgroundProps> = ({
  backgroundColor,
  blueColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const currentSeconds = Math.floor(frame / fps);
  const formattedTime = `00:${currentSeconds.toString().padStart(2, "0")} / 01:00`;
  const progressPercent = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        overflow: "hidden",
      }}
    >
      {/* Subtle Mathematical Coordinate Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top Manim Status Bar */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          zIndex: 50,
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          paddingBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: blueColor,
              letterSpacing: "0.05em",
            }}
          >
            3Blue1Brown
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: 16 }}>|</span>
          <span
            style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.8)",
              fontStyle: "italic",
            }}
          >
            How Artificial Neural Networks Work
          </span>
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          {formattedTime}
        </div>
      </div>

      {/* Top Smooth Progress Line */}
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 48,
          width: `calc((100% - 96px) * ${progressPercent / 100})`,
          height: 3,
          backgroundColor: blueColor,
          boxShadow: `0 0 10px ${blueColor}`,
          zIndex: 51,
        }}
      />
    </AbsoluteFill>
  );
};
