import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LightSweep } from "../components/LightSweep";
import { TitanXProps } from "../types";

export const Scene1Reveal: React.FC<TitanXProps> = ({
  productName,
  accentColor,
  goldAccent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth camera zoom
  const cameraZoom = interpolate(frame, [0, 210], [0.88, 1.08]);

  // Entrance spring for the 3D monogram
  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 28,
      mass: 1,
      stiffness: 80,
    },
  });

  const emblemScale = interpolate(entranceSpring, [0, 1], [0.6, 1]);
  const emblemOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dynamic 3D tilt tracking
  const rotateX = interpolate(frame, [0, 210], [18, -4]);
  const rotateY = interpolate(frame, [0, 210], [-25, 15]);

  // Typography tracking / letter-spacing expansion
  const letterSpacing = interpolate(frame, [0, 120], [0.4, 0.65], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene exit fade
  const sceneExit = interpolate(frame, [180, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneExit,
        transform: `scale(${cameraZoom})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Category Eyebrow */}
      <div
        style={{
          opacity: textOpacity,
          transform: `translateY(${interpolate(entranceSpring, [0, 1], [20, 0])}px)`,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color: goldAccent,
          marginBottom: 35,
          fontFamily: "system-ui, sans-serif",
          textShadow: `0 0 15px ${goldAccent}66`,
        }}
      >
        NEXT-GENERATION SILICON
      </div>

      {/* Centerpiece 3D Monogram Emblem */}
      <div
        style={{
          perspective: 1000,
          transformStyle: "preserve-3d",
          opacity: emblemOpacity,
          transform: `scale(${emblemScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          width: 320,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Rear glow halo */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)`,
            filter: "blur(40px)",
            transform: "translateZ(-50px)",
          }}
        />

        {/* 3D Monolithic Titanium Shield / Octagon */}
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 48,
            background: "linear-gradient(145deg, #2D323E 0%, #111318 60%, #0A0B0E 100%)",
            border: "2px solid rgba(226, 232, 240, 0.3)",
            boxShadow: `
              0 30px 70px rgba(0,0,0,0.9),
              inset 0 2px 3px rgba(255,255,255,0.4),
              0 0 35px rgba(245, 158, 11, 0.2)
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateZ(10px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Internal bevel sheen */}
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: 36,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
            }}
          />

          {/* Large Stylized 'X' */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
              background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 45%, #94A3B8 75%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.8))",
              transform: "translateZ(30px)",
              letterSpacing: "-0.05em",
            }}
          >
            X
          </div>

          <LightSweep startFrame={50} duration={45} color="rgba(255, 255, 255, 0.7)" />
        </div>
      </div>

      {/* Main Title Reveal */}
      <div
        style={{
          marginTop: 45,
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: `${letterSpacing}em`,
          color: "#FFFFFF",
          opacity: textOpacity,
          textShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
          textAlign: "center",
        }}
      >
        {productName}
      </div>

      {/* Sub-tagline */}
      <div
        style={{
          marginTop: 12,
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: "0.25em",
          color: accentColor,
          opacity: textOpacity * 0.7,
          fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase",
        }}
      >
        AN ARCHITECTURAL MASTERPIECE
      </div>
    </AbsoluteFill>
  );
};
