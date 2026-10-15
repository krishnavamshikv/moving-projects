import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface HighlighterTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const HighlighterText: React.FC<HighlighterTextProps> = ({
  children,
  delay = 0,
  duration = 20,
  color = "#FFE600",
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0 6px",
        ...style,
      }}
    >
      {/* The Yellow Highlighter Layer */}
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: "10%",
          height: "85%",
          width: `${progress}%`,
          backgroundColor: color,
          zIndex: 1,
          opacity: 0.95,
          mixBlendMode: "multiply",
          borderRadius: 2,
        }}
      />
      {/* The Text Layer */}
      <span
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </span>
    </span>
  );
};
