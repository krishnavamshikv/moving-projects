import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene2Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokenPills = [
    { word: "Arti-", id: "34185", tag: "PREFIX" },
    { word: "ficial", id: "10982", tag: "STEM" },
    { word: "Intel-", id: "18402", tag: "STEM" },
    { word: "ligence", id: "9321", tag: "SUFFIX" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 45px",
      }}
    >
      {/* Chapter Tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            backgroundColor: inkColor,
            color: "#FFF",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 800,
            padding: "4px 10px",
          }}
        >
          CHAPTER 02
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          Tokens & Vector Space
        </span>
      </div>

      <h2
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: 54,
          fontWeight: 900,
          color: inkColor,
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 35px 0",
        }}
      >
        How Computers{" "}
        <HighlighterText delay={10} duration={20} color={highlightColor}>
          "Read"
        </HighlighterText>{" "}
        Language
      </h2>

      {/* Sliced Word Cutouts (Paper slips with dashed scissor lines) */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 35,
          width: "92%",
          maxWidth: 920,
          justifyContent: "center",
        }}
      >
        {tokenPills.map((tok, i) => {
          const pop = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])}) translateY(${interpolate(pop, [0, 1], [20, 0])}px) rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                backgroundColor: "#FFF",
                border: "2px solid #18181A",
                borderStyle: "dashed",
                padding: "16px 20px",
                textAlign: "center",
                boxShadow: "4px 6px 0px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: inkColor,
                }}
              >
                "{tok.word}"
              </div>
              <div
                style={{
                  backgroundColor: highlightColor,
                  color: "#18181A",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 6px",
                  marginTop: 6,
                }}
              >
                ID #{tok.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* The Millimeter Coordinate Map Card */}
      <div
        style={{
          width: "92%",
          maxWidth: 920,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${inkColor}`,
          boxShadow: "10px 14px 0px rgba(0,0,0,0.15)",
          padding: "26px 32px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #DDD",
            paddingBottom: 10,
            marginBottom: 16,
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span>FIG 2.3 // VECTOR EMBEDDING COORDINATE SYSTEM</span>
          <span style={{ color: accentRed }}>1,536 DIMENSIONS</span>
        </div>

        {/* Blueprint-style Vector Chart */}
        <div
          style={{
            height: 220,
            backgroundColor: "#FBF9F4",
            border: "1px solid #DDD",
            position: "relative",
            overflow: "hidden",
            backgroundImage: `
              linear-gradient(to right, #E8E5DD 1px, transparent 1px),
              linear-gradient(to bottom, #E8E5DD 1px, transparent 1px)
            `,
            backgroundSize: "25px 25px",
          }}
        >
          {/* Axis labels */}
          <span style={{ position: "absolute", top: 10, left: 15, fontFamily: "monospace", fontSize: 12, color: "#888" }}>
            Y-AXIS (SEMANTIC CONTEXT) ↑
          </span>
          <span style={{ position: "absolute", bottom: 10, right: 15, fontFamily: "monospace", fontSize: 12, color: "#888" }}>
            X-AXIS (GRAMMAR ROLE) →
          </span>

          {/* Point: KING */}
          <div style={{ position: "absolute", top: 50, left: 160, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, backgroundColor: inkColor, borderRadius: "50%" }} />
            <span style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 900 }}>"KING"</span>
          </div>

          {/* Point: QUEEN */}
          <div style={{ position: "absolute", top: 60, left: 450, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, backgroundColor: accentRed, borderRadius: "50%" }} />
            <span style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 900, color: accentRed }}>"QUEEN"</span>
          </div>

          {/* Vector connection arrow */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <line x1="170" y1="57" x2="450" y2="67" stroke={accentRed} strokeWidth="2.5" strokeDasharray="5 5" />
          </svg>

          {/* Red marker annotation note */}
          <div
            style={{
              position: "absolute",
              bottom: 25,
              left: 40,
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              fontSize: 18,
              color: "#333",
              backgroundColor: "rgba(255, 230, 0, 0.4)",
              padding: "4px 12px",
            }}
          >
            "King - Man + Woman = Queen" (Distance: 0.94)
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 13,
            color: "#666",
          }}
        >
          <span>Vector: [ +0.824, -0.419, +0.103, ... ]</span>
          <span style={{ fontWeight: 800, color: inkColor }}>NUMERICAL GEOMETRY</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
