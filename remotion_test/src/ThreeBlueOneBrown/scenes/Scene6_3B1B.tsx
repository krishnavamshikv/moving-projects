import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PiCreature } from "../components/PiCreature";
import { ThreeB1BProps } from "../types";

export const Scene6_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  greenColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const pipeline = [
    { num: "1", title: "Tokens", formula: "w ∈ V" },
    { num: "2", title: "Embedding", formula: "v⃗ ∈ ℝⁿ" },
    { num: "3", title: "Weights", formula: "a = σ(Wx + b)" },
    { num: "4", title: "Softmax", formula: "P(w_i) ∝ e^(z_i)" },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 35px",
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
        }}
      >
        Conclusion: The Geometric Landscape of Language
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
          transform: `scale(${interpolate(entrance, [0, 1], [0.94, 1])})`,
        }}
      >
        Language Decoded As{" "}
        <span style={{ color: yellowColor, fontStyle: "italic" }}>
          Pure Geometry
        </span>
      </h2>

      {/* 4 Pipeline Math Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          width: 960,
          marginBottom: 35,
        }}
      >
        {pipeline.map((p, i) => {
          const pSpring = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${interpolate(pSpring, [0, 1], [0.85, 1])}) translateY(${interpolate(pSpring, [0, 1], [20, 0])}px)`,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: `1.5px solid rgba(88, 196, 221, 0.3)`,
                borderRadius: 16,
                padding: "20px 24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: yellowColor, fontFamily: "monospace", fontSize: 14, fontWeight: 800 }}>
                  STEP 0{p.num}
                </span>
                <span style={{ color: greenColor, fontSize: 16 }}>●</span>
              </div>
              <div
                style={{
                  fontFamily: "'CMU Serif', 'Computer Modern', serif",
                  fontSize: 26,
                  color: chalkColor,
                  fontWeight: 700,
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontFamily: "'CMU Serif', monospace",
                  fontSize: 18,
                  color: blueColor,
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                {p.formula}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature 3B1B Outro Pill with Pi Creature */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          backgroundColor: "rgba(22, 24, 31, 0.9)",
          border: `1.5px solid ${blueColor}`,
          borderRadius: 24,
          padding: "16px 36px",
          boxShadow: `0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(88, 196, 221, 0.2)`,
        }}
      >
        <PiCreature size={65} color={blueColor} lookX={0} lookY={-0.3} />
        <div>
          <div
            style={{
              fontFamily: "'CMU Serif', 'Computer Modern', serif",
              fontSize: 24,
              fontWeight: 700,
              color: blueColor,
            }}
          >
            3Blue1Brown
          </div>
          <div
            style={{
              fontFamily: "'CMU Serif', serif",
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.7)",
              fontStyle: "italic",
            }}
          >
            Mathematics of Deep Learning
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
