import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene5Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();

  const candidates = [
    { word: "blue", pct: 84.6, selected: true },
    { word: "dark", pct: 9.8, selected: false },
    { word: "clear", pct: 4.1, selected: false },
    { word: "falling", pct: 1.5, selected: false },
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
          CHAPTER 05
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          The Probability Engine
        </span>
      </div>

      <h2
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: 52,
          fontWeight: 900,
          color: inkColor,
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 30px 0",
        }}
      >
        Calculating Odds,{" "}
        <HighlighterText delay={10} duration={20} color={highlightColor}>
          Word by Word
        </HighlighterText>
      </h2>

      {/* Index Card Autocomplete Console */}
      <div
        style={{
          width: "92%",
          maxWidth: 960,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${inkColor}`,
          boxShadow: "10px 14px 0px rgba(0,0,0,0.15)",
          padding: "28px 32px",
          position: "relative",
        }}
      >
        {/* Typewriter Prompt Field */}
        <div
          style={{
            border: "2px solid #18181A",
            backgroundColor: "#FBF9F4",
            padding: "16px 20px",
            marginBottom: 24,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 24,
            fontWeight: 800,
            color: "#18181A",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#999", fontSize: 16 }}>INPUT:</span>
          <span>"The sky looks exceptionally </span>
          <span
            style={{
              backgroundColor: highlightColor,
              padding: "2px 8px",
              border: "1px solid #18181A",
            }}
          >
            blue
          </span>
          <span style={{ opacity: Math.sin(frame * 0.25) > 0 ? 1 : 0 }}>|</span>
          <span>"</span>
        </div>

        {/* Statistical Odds Table */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 800,
              color: "#555",
              marginBottom: 12,
              letterSpacing: "0.1em",
            }}
          >
            DISTRIBUTION OF NEXT-TOKEN PROBABILITIES:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {candidates.map((cand, i) => {
              const barW = interpolate(
                frame,
                [10 + i * 6, 40 + i * 6],
                [0, cand.pct],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              );

              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 120,
                      fontFamily: "'Georgia', serif",
                      fontSize: 22,
                      fontWeight: cand.selected ? 900 : 600,
                      color: cand.selected ? inkColor : "#666",
                    }}
                  >
                    "{cand.word}"
                  </div>

                  {/* Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: 32,
                      backgroundColor: "#F0EDE5",
                      border: "1px solid #DDD",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barW}%`,
                        backgroundColor: cand.selected ? highlightColor : "#BBB",
                        borderRight: cand.selected ? "2px solid #18181A" : "none",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 5,
                        fontFamily: "monospace",
                        fontSize: 15,
                        fontWeight: 800,
                        color: cand.selected ? "#18181A" : "#666",
                      }}
                    >
                      {cand.pct}%
                    </span>
                  </div>

                  <div style={{ width: 30, color: accentRed, fontWeight: 900, fontSize: 20 }}>
                    {cand.selected ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editorial Footnote Banner */}
        <div
          style={{
            marginTop: 20,
            borderTop: "2px solid #18181A",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 13,
            color: "#444",
          }}
        >
          <span>KEY TAKEAWAY:</span>
          <span style={{ fontWeight: 800, color: inkColor }}>
            NOT WEB SEARCH // PURE RECURSIVE PROBABILITY
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
