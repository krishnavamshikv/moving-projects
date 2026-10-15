import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene4Training: React.FC<HowAIWorksProps> = ({
  primaryColor,
  accentColor,
  highlightColor,
}) => {
  const frame = useCurrentFrame();

  // Progress of training across this scene (0 to 1)
  const trainingProgress = interpolate(frame, [0, 300], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Animated metrics
  const lossValue = (
    4.82 * Math.exp(-trainingProgress * 4.5) + 0.02
  ).toFixed(3);

  const accuracy = (
    interpolate(trainingProgress, [0, 1], [14.2, 99.4])
  ).toFixed(1);

  const tokensRead = (
    interpolate(trainingProgress, [0, 1], [0.1, 15.8])
  ).toFixed(1);

  // Ball rolling down the gradient descent curve
  // Curve points: x from 80 to 720, y following exponential decay
  const ballX = interpolate(trainingProgress, [0, 1], [100, 700]);
  const ballNormalized = interpolate(ballX, [100, 700], [0, 1]);
  const ballY = 80 + 220 * Math.exp(-ballNormalized * 3.5);

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
      {/* Category Eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: "4px 12px",
            background: "rgba(245, 158, 11, 0.15)",
            border: `1px solid ${highlightColor}`,
            borderRadius: 16,
            color: highlightColor,
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          STEP 03
        </div>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            fontSize: 16,
          }}
        >
          OPTIMIZATION & TRAINING
        </span>
      </div>

      <h2
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: "#FFF",
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 35px 0",
        }}
      >
        Learning via{" "}
        <span
          style={{
            color: highlightColor,
            textShadow: `0 0 25px ${highlightColor}88`,
          }}
        >
          Gradient Descent
        </span>
      </h2>

      {/* Main Gradient Descent Valley Visualization */}
      <div
        style={{
          width: 960,
          background: "rgba(10, 14, 23, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          padding: "24px 28px",
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${highlightColor}22`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            ERROR FUNCTION: L(w) → MINIMUM
          </span>
          <span style={{ color: accentColor, fontWeight: 800 }}>
            BACKPROPAGATION ACTIVE
          </span>
        </div>

        {/* SVG Curve Canvas */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 320,
            background: "radial-gradient(ellipse at 50% 80%, rgba(30, 41, 59, 0.5) 0%, rgba(10, 14, 23, 0.9) 100%)",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <svg style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
            {/* Grid horizontal markers */}
            {[80, 160, 240].map((y, idx) => (
              <line
                key={idx}
                x1="40"
                y1={y}
                x2="880"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {/* The Gradient Curve */}
            <path
              d="M 60 70 Q 220 300, 480 300 T 880 300"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="3"
            />

            {/* Traced Gradient Descent Path */}
            <path
              d="M 60 70 Q 220 300, 480 300 T 880 300"
              fill="none"
              stroke={highlightColor}
              strokeWidth="4"
              strokeDasharray="1000"
              strokeDashoffset={interpolate(trainingProgress, [0, 1], [1000, 150])}
              style={{
                filter: `drop-shadow(0 0 8px ${highlightColor})`,
              }}
            />

            {/* The Rolling Optimization Point */}
            <circle
              cx={ballX}
              cy={ballY}
              r={12}
              fill={primaryColor}
              stroke="#FFF"
              strokeWidth="3"
              style={{
                filter: `drop-shadow(0 0 15px ${primaryColor})`,
              }}
            />
          </svg>

          {/* Valley Goal Label */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 60,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "monospace",
              fontSize: 13,
              color: accentColor,
            }}
          >
            <span>OPTIMAL MINIMUM REACHED</span>
            <span>✓</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              TRAINING LOSS
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: highlightColor, marginTop: 4 }}>
              {lossValue}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              TOKENS PROCESSED
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: primaryColor, marginTop: 4 }}>
              {tokensRead}T
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              MODEL ACCURACY
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: accentColor, marginTop: 4 }}>
              {accuracy}%
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
