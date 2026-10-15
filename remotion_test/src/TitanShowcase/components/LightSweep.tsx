import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const LightSweep: React.FC<{
  startFrame?: number;
  duration?: number;
  color?: string;
  width?: number;
}> = ({
  startFrame = 0,
  duration = 60,
  color = "rgba(255, 255, 255, 0.8)",
  width = 300,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, duration],
    [-0.3, 1.3],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = interpolate(
    progress,
    [-0.3, 0.1, 0.9, 1.3],
    [0, 1, 1, 0]
  );

  if (frame < startFrame || frame > startFrame + duration) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: `${progress * 100}%`,
          width: `${width}px`,
          height: "200%",
          transform: "rotate(25deg)",
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          filter: "blur(20px)",
        }}
      />
      {/* Intense center core line */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: `${progress * 100 + 5}%`,
          width: "6px",
          height: "200%",
          transform: "rotate(25deg)",
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 0 25px 8px rgba(255, 255, 255, 0.8)",
        }}
      />
    </div>
  );
};
