import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LightSweep } from "../components/LightSweep";
import { TitanXProps } from "../types";

export const Scene4Finale: React.FC<TitanXProps> = ({
  productName,
  productTagline,
  goldAccent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 24,
      mass: 0.9,
      stiffness: 85,
    },
  });

  const sceneFadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const emblemScale = interpolate(entranceSpring, [0, 1], [0.75, 1]);
  const emblemTilt = interpolate(frame, [0, 210], [-6, 6]);

  const tracking = interpolate(frame, [0, 150], [0.35, 0.55], {
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneFadeIn,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Central Dramatic Halo Flare */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(245, 158, 11, 0.22) 0%, rgba(226, 232, 240, 0.06) 40%, transparent 75%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating 3D Emblem Monogram */}
      <div
        style={{
          perspective: 800,
          transformStyle: "preserve-3d",
          transform: `scale(${emblemScale}) rotateY(${emblemTilt}deg)`,
          marginBottom: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "linear-gradient(135deg, #2E3442 0%, #11141B 60%, #07090C 100%)",
            border: "2px solid rgba(226, 232, 240, 0.35)",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.4),
              0 0 40px rgba(245, 158, 11, 0.3)
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
              background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.9))",
            }}
          >
            X
          </span>
          <LightSweep startFrame={40} duration={40} color="rgba(255, 255, 255, 0.8)" />
        </div>
      </div>

      {/* Hero Title with Metallic Gradient Fill */}
      <div style={{ position: "relative", overflow: "hidden", padding: "10px 40px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 92,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: `${tracking}em`,
            background: "linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 55%, #64748B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 20px 40px rgba(0, 0, 0, 0.9)",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {productName}
        </h1>

        {/* Global Optical Sweep across typography */}
        <LightSweep startFrame={45} duration={55} color="rgba(245, 158, 11, 0.6)" width={350} />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 8,
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "0.22em",
          color: "rgba(226, 232, 240, 0.85)",
          textTransform: "uppercase",
          fontFamily: "system-ui, sans-serif",
          textShadow: "0 4px 15px rgba(0, 0, 0, 0.8)",
        }}
      >
        {productTagline}
      </div>

      {/* Bottom Technical Lineage Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          opacity: taglineOpacity,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: "rgba(226, 232, 240, 0.4)",
          fontFamily: "monospace",
        }}
      >
        <span>CRAFTED IN CODE</span>
        <span style={{ color: goldAccent }}>•</span>
        <span>REMOTION ENGINE</span>
        <span style={{ color: goldAccent }}>•</span>
        <span>60 FPS KEYNOTE</span>
      </div>
    </AbsoluteFill>
  );
};
