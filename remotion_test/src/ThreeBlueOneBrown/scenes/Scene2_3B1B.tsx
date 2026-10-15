import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeB1BProps } from "../types";

export const Scene2_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  greenColor,
  pinkColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const arrowProgress = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      {/* Chapter Title */}
      <div
        style={{
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          fontSize: 22,
          color: blueColor,
          fontStyle: "italic",
          marginBottom: 16,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        Chapter 2: Words as Vectors in ℝⁿ
      </div>

      <h2
        style={{
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          fontSize: 54,
          fontWeight: 700,
          color: chalkColor,
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 35px 0",
        }}
      >
        Mapping Meaning Into{" "}
        <span style={{ color: yellowColor, fontStyle: "italic" }}>
          Vector Space
        </span>
      </h2>

      {/* Coordinate Canvas with Vector Arrows */}
      <div
        style={{
          width: "92%",
          maxWidth: 900,
          height: 480,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: `1.5px solid rgba(88, 196, 221, 0.35)`,
          borderRadius: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 20px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Coordinate Axes */}
          <line x1="80" y1="420" x2="820" y2="420" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="120" y1="440" x2="120" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

          {/* Basis Vectors */}
          {/* Vector: KING */}
          <line
            x1="120"
            y1="420"
            x2={120 + 260 * arrowProgress}
            y2={420 - 240 * arrowProgress}
            stroke={blueColor}
            strokeWidth="3.5"
          />
          <circle cx="380" cy="180" r="7" fill={blueColor} />

          {/* Vector: QUEEN */}
          <line
            x1="120"
            y1="420"
            x2={120 + 520 * arrowProgress}
            y2={420 - 270 * arrowProgress}
            stroke={pinkColor}
            strokeWidth="3.5"
          />
          <circle cx="640" cy="150" r="7" fill={pinkColor} />

          {/* Difference vector arrow between King and Queen */}
          <line
            x1="380"
            y1="180"
            x2={380 + 260 * arrowProgress}
            y2={180 - 30 * arrowProgress}
            stroke={yellowColor}
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Math Labels on Vector Canvas */}
        <div style={{ position: "absolute", top: 150, left: 260, fontFamily: "'CMU Serif', serif", fontSize: 24, color: blueColor }}>
          v⃗_King
        </div>

        <div style={{ position: "absolute", top: 110, left: 630, fontFamily: "'CMU Serif', serif", fontSize: 24, color: pinkColor }}>
          v⃗_Queen
        </div>

        <div style={{ position: "absolute", top: 155, left: 450, fontFamily: "'CMU Serif', serif", fontSize: 18, color: yellowColor, fontStyle: "italic" }}>
          + (v⃗_Woman - v⃗_Man)
        </div>

        {/* Bottom Formula Banner in 3B1B style */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 30,
            right: 30,
            backgroundColor: "rgba(10, 12, 18, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 12,
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 22,
          }}
        >
          <div style={{ color: chalkColor }}>
            v⃗_King - v⃗_Man + v⃗_Woman ≈ v⃗_Queen
          </div>
          <div style={{ color: greenColor, fontSize: 18, fontStyle: "italic" }}>
            v⃗ ∈ ℝ¹⁵³⁶
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
