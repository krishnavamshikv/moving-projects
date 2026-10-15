import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface BackgroundGridProps {
  primaryColor: string;
  secondaryColor: string;
}

export const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  primaryColor,
  secondaryColor,
}) => {
  const frame = useCurrentFrame();

  // Gentle floating movement for background ambient orbs
  const orb1Y = Math.sin(frame * 0.02) * 40;
  const orb1X = Math.cos(frame * 0.015) * 30;

  const orb2Y = Math.cos(frame * 0.018) * 50;
  const orb2X = Math.sin(frame * 0.022) * 35;

  // Subtle grid pulse
  const gridOpacity = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.08, 0.14]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07090E",
        overflow: "hidden",
      }}
    >
      {/* Deep atmospheric radial gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 20%, #0F172A 0%, #07090E 70%),
            radial-gradient(circle at 50% 80%, #0B1120 0%, #07090E 80%)
          `,
        }}
      />

      {/* Floating Ambient Glow 1 (Cyan) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: `calc(50% - 250px + ${orb1X}px)`,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}1F 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
          transform: `translateY(${orb1Y}px)`,
        }}
      />

      {/* Floating Ambient Glow 2 (Violet) */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: `calc(50% - 300px + ${orb2X}px)`,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${secondaryColor}1F 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
          transform: `translateY(${orb2Y}px)`,
        }}
      />

      {/* Tech Grid Lines (Vertical & Horizontal) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 50%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 50%, transparent 95%)",
        }}
      />

      {/* Vignette border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
