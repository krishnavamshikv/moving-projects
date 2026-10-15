import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface ProgressBarProps {
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  color = "#FFD700",
  height = 8,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24, // Above standard TikTok caption bottom margin
        left: 20,
        right: 20,
        height,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: height / 2,
        overflow: "hidden",
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: height / 2,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
};
