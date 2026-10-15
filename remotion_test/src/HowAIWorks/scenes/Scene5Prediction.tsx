import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene5Prediction: React.FC<HowAIWorksProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Probability candidates
  const candidates = [
    { token: "blue", prob: 84.6, isWinner: true },
    { token: "dark", prob: 9.8, isWinner: false },
    { token: "clear", prob: 4.1, isWinner: false },
    { token: "falling", prob: 1.5, isWinner: false },
  ];

  // Token locking animation
  const tokenLock = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

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
            background: "rgba(0, 240, 255, 0.15)",
            border: `1px solid ${primaryColor}`,
            borderRadius: 16,
            color: primaryColor,
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          STEP 04
        </div>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            fontSize: 16,
          }}
        >
          INFERENCE ENGINE
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
        Next-Token{" "}
        <span
          style={{
            color: primaryColor,
            textShadow: `0 0 25px ${primaryColor}88`,
          }}
        >
          Probability
        </span>
      </h2>

      {/* Main Autocomplete Console Card */}
      <div
        style={{
          width: 960,
          background: "rgba(10, 14, 23, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          padding: "32px 36px",
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${primaryColor}22`,
        }}
      >
        {/* Prompt Input Line */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 30,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.4)",
              fontWeight: 800,
            }}
          >
            PROMPT:
          </span>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#FFF",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            "The sky looks exceptionally{" "}
            <span
              style={{
                display: "inline-block",
                transform: `scale(${interpolate(tokenLock, [0, 1], [0.8, 1])})`,
                opacity: interpolate(tokenLock, [0, 1], [0, 1]),
                color: primaryColor,
                backgroundColor: "rgba(0, 240, 255, 0.15)",
                border: `1.5px solid ${primaryColor}`,
                padding: "2px 12px",
                borderRadius: 8,
                fontWeight: 900,
                textShadow: `0 0 12px ${primaryColor}`,
              }}
            >
              blue
            </span>
            <span
              style={{
                opacity: Math.sin(frame * 0.2) > 0 ? 1 : 0,
                color: primaryColor,
                marginLeft: 4,
              }}
            >
              |
            </span>
            "
          </div>
        </div>

        {/* Softmax Probability Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            SOFTMAX DISTRIBUTION: P(w_t | w_{"<t"})
          </span>
          <span style={{ color: primaryColor, fontWeight: 800 }}>
            SAMPLING: GREEDY TOP-P
          </span>
        </div>

        {/* Probability Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {candidates.map((cand, idx) => {
            const barWidth = interpolate(
              frame,
              [10 + idx * 5, 50 + idx * 5],
              [0, cand.prob],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {/* Candidate Token Label */}
                <div
                  style={{
                    width: 140,
                    fontFamily: "monospace",
                    fontSize: 20,
                    fontWeight: cand.isWinner ? 900 : 600,
                    color: cand.isWinner ? "#FFF" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  "{cand.token}"
                </div>

                {/* Progress Bar Container */}
                <div
                  style={{
                    flex: 1,
                    height: 38,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 10,
                    overflow: "hidden",
                    position: "relative",
                    border: cand.isWinner
                      ? `1px solid ${primaryColor}88`
                      : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      background: cand.isWinner
                        ? `linear-gradient(90deg, ${primaryColor}99, ${primaryColor})`
                        : "rgba(255, 255, 255, 0.2)",
                      borderRadius: 8,
                      boxShadow: cand.isWinner
                        ? `0 0 15px ${primaryColor}66`
                        : "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: 16,
                      color: cand.isWinner ? "#FFF" : "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {cand.prob.toFixed(1)}%
                  </div>
                </div>

                {/* Checkmark or Status */}
                <div
                  style={{
                    width: 40,
                    textAlign: "center",
                    color: cand.isWinner ? accentColor : "transparent",
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  ✓
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info pill */}
        <div
          style={{
            marginTop: 26,
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: 12,
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <span>AUTONOMOUS RECURSIVE GENERATION</span>
          <span style={{ color: secondaryColor }}>GENERATION SPEED: 85 TOKENS/SEC</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
