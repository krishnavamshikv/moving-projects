import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene1Hook: React.FC<HowAIWorksProps> = ({
  primaryColor,
  secondaryColor,
  highlightColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for main headline
  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  // Secondary transition: Brain transforming into Matrix Math around frame 120
  const mathTransform = interpolate(frame, [100, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera slow cinematic zoom
  const cameraZoom = interpolate(frame, [0, 270], [0.95, 1.05]);

  // Orbit rotation
  const orbitAngle = frame * 1.5;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${cameraZoom})`,
      }}
    >
      {/* Top Hook Eyebrow */}
      <div
        style={{
          transform: `translateY(${interpolate(entrance, [0, 1], [-30, 0])}px)`,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            background: "linear-gradient(90deg, #FF416C, #FF4B2B)",
            color: "#FFF",
            fontSize: 16,
            fontWeight: 900,
            padding: "4px 14px",
            borderRadius: 20,
            letterSpacing: "0.15em",
            fontFamily: "monospace",
          }}
        >
          DEMYSTIFIED
        </span>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 18,
            letterSpacing: "0.2em",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          THE ILLUSION OF THOUGHT
        </span>
      </div>

      {/* Main Title */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 50,
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          HOW AI
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 25px ${primaryColor}66)`,
            }}
          >
            ACTUALLY WORKS
          </span>
        </h1>
      </div>

      {/* Central Visual: Morphing Hologram (Synthetic Cortex to Vector Matrix) */}
      <div
        style={{
          position: "relative",
          width: 440,
          height: 440,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1000,
        }}
      >
        {/* Outer Orbit Ring 1 */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: `2px dashed ${primaryColor}44`,
            transform: `rotate(${orbitAngle}deg)`,
          }}
        />

        {/* Outer Orbit Ring 2 */}
        <div
          style={{
            position: "absolute",
            inset: 35,
            borderRadius: "50%",
            border: `1.5px solid ${secondaryColor}66`,
            transform: `rotate(${-orbitAngle * 0.8}deg)`,
          }}
        />

        {/* Central Glowing Core */}
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${primaryColor}33 0%, transparent 70%)`,
            filter: "blur(25px)",
          }}
        />

        {/* State A: Holographic Cortex / Brain Icon (Fades out when mathTransform is 1) */}
        <div
          style={{
            position: "absolute",
            opacity: 1 - mathTransform,
            transform: `scale(${1 - mathTransform * 0.2})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 0 20px ${primaryColor})`,
            }}
          >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
          </svg>
          <div
            style={{
              marginTop: 14,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: "rgba(255, 255, 255, 0.7)",
              fontFamily: "monospace",
            }}
          >
            HUMAN MIND? NO.
          </div>
        </div>

        {/* State B: Raw Matrix Math Grid (Fades in) */}
        <div
          style={{
            position: "absolute",
            opacity: mathTransform,
            transform: `scale(${0.8 + mathTransform * 0.2})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.85)",
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 0 35px ${primaryColor}55`,
            borderRadius: 24,
            padding: "24px 32px",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 800,
              color: primaryColor,
              marginBottom: 12,
              letterSpacing: "0.1em",
            }}
          >
            y = σ(W · x + b)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              fontFamily: "monospace",
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 4 }}>
              +0.841
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 4 }}>
              -0.312
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 4 }}>
              +0.985
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 4 }}>
              -0.124
            </div>
            <div style={{ background: "rgba(0,240,255,0.2)", color: primaryColor, padding: "4px 8px", borderRadius: 4 }}>
              +1.402
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 4 }}>
              -0.071
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: highlightColor,
              fontFamily: "monospace",
            }}
          >
            100% PURE MATH
          </div>
        </div>
      </div>

      {/* Comparison Callout Cards */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          gap: 20,
          width: "85%",
          maxWidth: 900,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "rgba(255, 75, 43, 0.08)",
            border: "1px solid rgba(255, 75, 43, 0.3)",
            borderRadius: 18,
            padding: "16px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: "#FF4B2B", fontWeight: 800, fontFamily: "monospace" }}>
            MYTH
          </div>
          <div style={{ fontSize: 20, color: "#FFF", fontWeight: 700, marginTop: 4 }}>
            Thinking Organism
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: "rgba(0, 240, 255, 0.08)",
            border: `1px solid ${primaryColor}66`,
            borderRadius: 18,
            padding: "16px 20px",
            textAlign: "center",
            boxShadow: `0 0 20px ${primaryColor}22`,
          }}
        >
          <div style={{ fontSize: 13, color: primaryColor, fontWeight: 800, fontFamily: "monospace" }}>
            REALITY
          </div>
          <div style={{ fontSize: 20, color: "#FFF", fontWeight: 700, marginTop: 4 }}>
            Statistical Matrix
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
