import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface HookTitleProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  durationInFrames?: number;
}

export const HookTitle: React.FC<HookTitleProps> = ({
  title,
  subtitle,
  accentColor = "#FFD700",
  durationInFrames = 90, // Display for first 3 seconds at 30fps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame > durationInFrames) {
    return null;
  }

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 150,
      mass: 0.8,
    },
  });

  // Exit fade out during the last 15 frames
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const translateY = interpolate(entrance, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 140, // Safe area below standard top UI of Reels/TikTok
        left: 40,
        right: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        opacity: exitOpacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          background: "rgba(10, 10, 15, 0.88)",
          backdropFilter: "blur(16px)",
          border: `2px solid ${accentColor}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${accentColor}44`,
          borderRadius: 24,
          padding: "24px 36px",
          textAlign: "center",
          maxWidth: 920,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, Montserrat, sans-serif",
            fontSize: 48,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            lineHeight: 1.2,
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <div
            style={{
              marginTop: 10,
              fontFamily: "Inter, sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.02em",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
