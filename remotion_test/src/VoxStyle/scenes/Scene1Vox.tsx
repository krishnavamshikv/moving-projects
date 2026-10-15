import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene1Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 110 },
  });

  // Red marker cross-out at frame 95
  const redCrossProgress = interpolate(frame, [90, 115], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stamp appearance at frame 130
  const stampEntrance = spring({
    frame: frame - 120,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

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
      {/* Editorial Chapter Tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
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
            letterSpacing: "0.1em",
          }}
        >
          CHAPTER 01
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          The Illusion of Perception
        </span>
      </div>

      {/* Main Newspaper Headline Card */}
      <div
        style={{
          transform: `scale(${interpolate(cardEntrance, [0, 1], [0.92, 1])}) rotate(-1deg)`,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${inkColor}`,
          boxShadow: "10px 14px 0px rgba(0,0,0,0.15)",
          padding: "36px 40px",
          width: "92%",
          maxWidth: 920,
          position: "relative",
          marginBottom: 40,
        }}
      >
        {/* Masking tape on top-left and top-right */}
        <div
          style={{
            position: "absolute",
            top: -14,
            left: 30,
            width: 90,
            height: 26,
            backgroundColor: "rgba(230, 220, 190, 0.75)",
            transform: "rotate(-4deg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -14,
            right: 30,
            width: 90,
            height: 26,
            backgroundColor: "rgba(230, 220, 190, 0.75)",
            transform: "rotate(3deg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "#777",
            borderBottom: "1px solid #DDD",
            paddingBottom: 8,
            marginBottom: 16,
            letterSpacing: "0.15em",
          }}
        >
          THE SCIENTIFIC RECORD // VOL. 48
        </div>

        <h1
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.1,
            color: inkColor,
            margin: "0 0 20px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Does A.I. Have A{" "}
          <HighlighterText delay={15} duration={25} color={highlightColor}>
            Mind?
          </HighlighterText>
        </h1>

        <p
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 22,
            lineHeight: 1.45,
            color: "#333",
            margin: 0,
          }}
        >
          We talk to artificial intelligence like an organic consciousness.
          In reality, there is no one inside the machine.
        </p>

        {/* Big Red Slashed Crossout Overlay */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <line
            x1="40"
            y1="160"
            x2="520"
            y2="160"
            stroke={accentRed}
            strokeWidth="10"
            strokeDasharray="500"
            strokeDashoffset={500 - redCrossProgress * 5}
            strokeLinecap="round"
          />
        </svg>

        {/* Rubber Stamp: FALSE / NOT CONSCIOUS */}
        <div
          style={{
            position: "absolute",
            bottom: 25,
            right: 35,
            transform: `scale(${interpolate(stampEntrance, [0, 1], [2, 1])}) rotate(-12deg)`,
            opacity: interpolate(stampEntrance, [0, 1], [0, 1]),
            border: `5px solid ${accentRed}`,
            color: accentRed,
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: 24,
            padding: "8px 18px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            maskImage: "radial-gradient(circle, black 70%, transparent 100%)",
          }}
        >
          MYTH: DEBUNKED
        </div>
      </div>

      {/* The Evidence Card: Pure Matrix Mathematics */}
      <div
        style={{
          width: "92%",
          maxWidth: 920,
          backgroundColor: "#18181A",
          color: "#FFF",
          borderRadius: 4,
          padding: "26px 32px",
          boxShadow: "8px 10px 0px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: highlightColor,
              fontWeight: 800,
              letterSpacing: "0.15em",
              marginBottom: 6,
            }}
          >
            THE VERDICT:
          </div>
          <div
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            It is 100% High-Dimensional Math
          </div>
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            backgroundColor: "rgba(255, 230, 0, 0.15)",
            border: `1.5px solid ${highlightColor}`,
            color: highlightColor,
            padding: "8px 16px",
            borderRadius: 4,
          }}
        >
          y = f(W·x + b)
        </div>
      </div>
    </AbsoluteFill>
  );
};
