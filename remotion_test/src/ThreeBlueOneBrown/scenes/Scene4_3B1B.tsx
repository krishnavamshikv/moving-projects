import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ThreeB1BProps } from "../types";

export const Scene4_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  greenColor,
  pinkColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, 300], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Rolling ball down the cost curve
  const ballX = interpolate(progress, [0, 1], [120, 680]);
  const ballNorm = interpolate(ballX, [120, 680], [0, 1]);
  const ballY = 60 + 200 * Math.exp(-ballNorm * 3.8);

  const costValue = (4.82 * Math.exp(-progress * 4.5) + 0.02).toFixed(3);

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
        Chapter 4: Gradient Descent on the Cost Surface
      </div>

      <h2
        style={{
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          fontSize: 52,
          fontWeight: 700,
          color: chalkColor,
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 30px 0",
        }}
      >
        Minimizing the{" "}
        <span style={{ color: yellowColor, fontStyle: "italic" }}>
          Cost Function C(W)
        </span>
      </h2>

      {/* The Calculus Cost Curve Canvas */}
      <div
        style={{
          width: 960,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: `1.5px solid rgba(88, 196, 221, 0.35)`,
          borderRadius: 20,
          padding: "26px 30px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* SVG Calculus Curve */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 310,
            backgroundColor: "rgba(10, 12, 18, 0.7)",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Coordinate grid lines */}
            {[70, 140, 210, 280].map((y, i) => (
              <line key={i} x1="50" y1={y} x2="880" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            ))}

            {/* The Cost Curve C(w) */}
            <path
              d="M 80 50 Q 240 260, 480 260 T 880 260"
              fill="none"
              stroke={blueColor}
              strokeWidth="3.5"
            />

            {/* Optimization Path Trace */}
            <path
              d="M 80 50 Q 240 260, 480 260 T 880 260"
              fill="none"
              stroke={yellowColor}
              strokeWidth="4"
              strokeDasharray="1000"
              strokeDashoffset={interpolate(progress, [0, 1], [1000, 200])}
            />

            {/* Tangent vector arrow at current ball position */}
            <line
              x1={ballX}
              y1={ballY}
              x2={ballX + 45}
              y2={ballY + 12}
              stroke={pinkColor}
              strokeWidth="3"
            />

            {/* The Rolling Ball */}
            <circle cx={ballX} cy={ballY} r={11} fill={yellowColor} stroke="#FFF" strokeWidth="2.5" />
          </svg>

          {/* Math Labels on Calculus Canvas */}
          <div style={{ position: "absolute", top: 18, left: 24, fontFamily: "'CMU Serif', serif", fontSize: 20, color: blueColor }}>
            C(W) : Cost / Loss Surface
          </div>

          <div style={{ position: "absolute", top: ballY - 30, left: ballX + 25, fontFamily: "'CMU Serif', serif", fontSize: 18, color: pinkColor, fontStyle: "italic" }}>
            -∇C(W)
          </div>

          <div style={{ position: "absolute", bottom: 16, right: 30, fontFamily: "'CMU Serif', serif", fontSize: 20, color: greenColor }}>
            Global Minimum C ≈ 0 ✓
          </div>
        </div>

        {/* Gradient Descent Equation Banner */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 12,
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 24,
          }}
        >
          <div style={{ color: chalkColor }}>
            W_(t+1) = W_t - η · ∇C(W)
          </div>
          <div style={{ color: yellowColor, fontSize: 20, fontStyle: "italic" }}>
            Current Cost: {costValue}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
