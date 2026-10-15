import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene2Tokens: React.FC<HowAIWorksProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene relative frame
  const relFrame = frame;

  // Step 1: Words splitting into tokens
  const tokenSplit = spring({
    frame: relFrame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // Step 2: Vector embedding conversion
  const embedProgress = interpolate(relFrame, [90, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tokens = [
    { text: "Artificial", id: 34185, vector: "[+0.82, -0.19, +0.64]" },
    { text: "Intel-", id: 18402, vector: "[+0.75, +0.43, -0.28]" },
    { text: "ligence", id: 9321, vector: "[+0.69, +0.38, -0.15]" },
  ];

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
      {/* Category Eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "4px 12px",
            background: "rgba(0, 240, 255, 0.15)",
            border: `1px solid ${primaryColor}`,
            borderRadius: 16,
            color: primaryColor,
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          STEP 01
        </div>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            fontSize: 16,
          }}
        >
          TOKENIZATION & EMBEDDINGS
        </span>
      </div>

      {/* Main Title */}
      <h2
        style={{
          fontSize: 54,
          fontWeight: 900,
          color: "#FFF",
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 45px 0",
        }}
      >
        Words Become{" "}
        <span
          style={{
            color: primaryColor,
            textShadow: `0 0 25px ${primaryColor}88`,
          }}
        >
          Numbers
        </span>
      </h2>

      {/* The Word Slicing Visualization */}
      <div
        style={{
          display: "flex",
          gap: interpolate(tokenSplit, [0, 1], [4, 16]),
          marginBottom: 40,
        }}
      >
        {tokens.map((tok, i) => {
          const delay = i * 6;
          const pop = spring({
            frame: relFrame - delay,
            fps,
            config: { damping: 14, stiffness: 140 },
          });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])}) translateY(${interpolate(pop, [0, 1], [20, 0])}px)`,
                opacity: interpolate(pop, [0, 1], [0, 1]),
                background: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                border: `1.5px solid ${i === 0 ? primaryColor : secondaryColor}`,
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: `0 10px 25px rgba(0,0,0,0.6), 0 0 20px ${i === 0 ? primaryColor : secondaryColor}33`,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontFamily: "monospace",
                }}
              >
                "{tok.text}"
              </span>
              <span
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rgba(255, 255, 255, 0.5)",
                  fontFamily: "monospace",
                }}
              >
                ID: {tok.id}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vector Embedding Coordinate Space Card */}
      <div
        style={{
          width: "90%",
          maxWidth: 900,
          background: "rgba(10, 14, 23, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 15,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.1em",
            }}
          >
            HIGH-DIMENSIONAL VECTOR SPACE
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            1536 DIMENSIONS
          </span>
        </div>

        {/* Dynamic 2D/3D Vector Scatter Representation */}
        <div
          style={{
            height: 240,
            background: "radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(10, 14, 23, 0.8) 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Grid lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Word vector node 1: "KING" */}
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 100,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }} />
            <span style={{ color: "#FFF", fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>KING</span>
          </div>

          {/* Word vector node 2: "QUEEN" */}
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 280,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: secondaryColor, boxShadow: `0 0 10px ${secondaryColor}` }} />
            <span style={{ color: "#FFF", fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>QUEEN</span>
          </div>

          {/* Vector relationship line */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line
              x1="112"
              y1="56"
              x2="280"
              y2="66"
              stroke={primaryColor}
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          </svg>

          {/* Embedding Formula callout */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: 20,
              right: 20,
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "monospace",
              fontSize: 14,
              color: primaryColor,
            }}
          >
            <span>KING - MAN + WOMAN ≈ QUEEN</span>
            <span style={{ color: accentColor, fontWeight: 800 }}>SIMILARITY: 0.94</span>
          </div>
        </div>

        {/* Vector coordinates stream */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.6)",
            opacity: interpolate(embedProgress, [0, 1], [0.4, 1]),
          }}
        >
          <span>V(token) = [ +0.8241, -0.4192, +0.1034, ... ]</span>
          <span style={{ color: primaryColor }}>FLOATING-POINT TENSOR</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
