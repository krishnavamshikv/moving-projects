import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene6Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const cards = [
    { num: "01", label: "TOKENS", desc: "Text sliced to numbers" },
    { num: "02", label: "VECTORS", desc: "Coordinates in space" },
    { num: "03", label: "WEIGHTS", desc: "Synaptic signal filters" },
    { num: "04", label: "PROBABILITY", desc: "Next word prediction" },
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
          marginBottom: 16,
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
          CONCLUSION
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          The Geometry of Human Knowledge
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
          transform: `scale(${interpolate(entrance, [0, 1], [0.94, 1])})`,
        }}
      >
        Language Decoded As{" "}
        <HighlighterText delay={10} duration={20} color={highlightColor}>
          Geometry
        </HighlighterText>
      </h2>

      {/* 4 Investigative Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          width: "92%",
          maxWidth: 960,
          marginBottom: 35,
        }}
      >
        {cards.map((c, i) => {
          const cardSpring = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 15, stiffness: 140 },
          });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${interpolate(cardSpring, [0, 1], [0.85, 1])}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
                backgroundColor: "#FFFFFF",
                border: "2px solid #18181A",
                boxShadow: "6px 8px 0px rgba(0,0,0,0.1)",
                padding: "20px 24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ backgroundColor: highlightColor, color: "#18181A", fontFamily: "monospace", fontSize: 13, fontWeight: 900, padding: "2px 6px" }}>
                  STEP {c.num}
                </span>
                <span style={{ color: accentRed, fontWeight: 900, fontSize: 16 }}>●</span>
              </div>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 24, fontWeight: 900, color: inkColor }}>
                {c.label}
              </div>
              <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 15, color: "#555", marginTop: 4 }}>
                {c.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature Vox Editorial Closer Box */}
      <div
        style={{
          backgroundColor: "#18181A",
          color: "#FFF",
          borderRadius: 4,
          padding: "20px 36px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          boxShadow: "8px 10px 0px #FFE600",
        }}
      >
        <div
          style={{
            backgroundColor: highlightColor,
            color: "#18181A",
            fontWeight: 900,
            fontSize: 18,
            padding: "6px 12px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          VOX
        </div>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700 }}>
          Follow For More Deep Dive Explainers
        </div>
      </div>
    </AbsoluteFill>
  );
};
