import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene4Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 300], [0, 1], {
    extrapolateRight: "clamp",
  });

  const stampEntrance = spring({
    frame: frame - 180,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  const lossValue = (4.82 * Math.exp(-progress * 4.5) + 0.02).toFixed(3);

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
          CHAPTER 04
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          Trial, Error & Gradient Descent
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
        Trillions of Trials{" "}
        <HighlighterText delay={10} duration={20} color={highlightColor}>
          To Learn
        </HighlighterText>
      </h2>

      {/* Lab Graph Paper Card */}
      <div
        style={{
          width: "92%",
          maxWidth: 960,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${inkColor}`,
          boxShadow: "10px 14px 0px rgba(0,0,0,0.15)",
          padding: "24px 28px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #DDD",
            paddingBottom: 8,
            marginBottom: 16,
            fontFamily: "monospace",
            fontSize: 13,
            color: "#666",
          }}
        >
          <span>LAB REPORT // LOSS OPTIMIZATION OVER 100,000 STEPS</span>
          <span style={{ color: accentRed, fontWeight: 800 }}>ALGORITHM: GRADIENT DESCENT</span>
        </div>

        {/* The Graph Canvas */}
        <div
          style={{
            height: 280,
            backgroundColor: "#F9F8F5",
            border: "1px solid #DDD",
            position: "relative",
            overflow: "hidden",
            backgroundImage: `
              linear-gradient(to right, #EBE7DD 1px, transparent 1px),
              linear-gradient(to bottom, #EBE7DD 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        >
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* The Decay Loss Curve */}
            <path
              d="M 50 40 Q 200 240, 480 240 T 850 240"
              fill="none"
              stroke="#DDD"
              strokeWidth="4"
            />
            <path
              d="M 50 40 Q 200 240, 480 240 T 850 240"
              fill="none"
              stroke={accentRed}
              strokeWidth="5"
              strokeDasharray="1000"
              strokeDashoffset={interpolate(progress, [0, 1], [1000, 150])}
            />
          </svg>

          {/* Graph labels */}
          <span style={{ position: "absolute", top: 12, left: 16, fontFamily: "monospace", fontSize: 13, color: accentRed, fontWeight: 800 }}>
            INITIAL HIGH ERROR (LOSS = 4.82)
          </span>

          <span style={{ position: "absolute", bottom: 12, right: 24, fontFamily: "monospace", fontSize: 13, color: "#18181A", fontWeight: 800 }}>
            NEAR-ZERO ERROR (CONVERGED) ✓
          </span>
        </div>

        {/* Rubber Stamp: OPTIMIZED */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 40,
            transform: `scale(${interpolate(stampEntrance, [0, 1], [2, 1])}) rotate(10deg)`,
            opacity: interpolate(stampEntrance, [0, 1], [0, 1]),
            border: `4px solid ${accentRed}`,
            color: accentRed,
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: 22,
            padding: "6px 16px",
            letterSpacing: "0.2em",
          }}
        >
          OPTIMIZATION: PASSED
        </div>

        {/* Metric Cards at the bottom */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginTop: 18,
          }}
        >
          <div style={{ backgroundColor: "#F6F3EB", border: "1px solid #18181A", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>CALCULATED LOSS</div>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 900, color: accentRed, marginTop: 4 }}>
              {lossValue}
            </div>
          </div>

          <div style={{ backgroundColor: "#F6F3EB", border: "1px solid #18181A", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>TRAINING TOKENS</div>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 900, color: inkColor, marginTop: 4 }}>
              15.8 Trillion
            </div>
          </div>

          <div style={{ backgroundColor: "#F6F3EB", border: "1px solid #18181A", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>PARAMETER DIALS</div>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 900, color: inkColor, marginTop: 4 }}>
              175 Billion
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
