import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PiCreature } from "../components/PiCreature";
import { ThreeB1BProps } from "../types";

export const Scene5_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  greenColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();

  const candidates = [
    { word: "blue", prob: 0.846, label: "84.6%", active: true },
    { word: "dark", prob: 0.098, label: "9.8%", active: false },
    { word: "clear", prob: 0.041, label: "4.1%", active: false },
    { word: "falling", prob: 0.015, label: "1.5%", active: false },
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
        Chapter 5: Softmax & Probability Distributions
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
        Predicting The Next Token via{" "}
        <span style={{ color: blueColor, fontStyle: "italic" }}>
          Softmax
        </span>
      </h2>

      {/* Probability Board */}
      <div
        style={{
          width: 960,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: `1.5px solid rgba(88, 196, 221, 0.35)`,
          borderRadius: 20,
          padding: "30px 36px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Softmax Formula Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 32,
            color: chalkColor,
            borderBottom: "1px dashed rgba(255, 255, 255, 0.15)",
            paddingBottom: 20,
            marginBottom: 24,
          }}
        >
          <span>P(w_i) = </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: blueColor }}>e^(z_i)</span>
            <div style={{ width: 120, height: 2, backgroundColor: chalkColor }} />
            <span style={{ color: yellowColor, fontSize: 24 }}>∑_j e^(z_j)</span>
          </div>
        </div>

        {/* Probability Distribution Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {candidates.map((cand, i) => {
            const barW = interpolate(
              frame,
              [10 + i * 5, 45 + i * 5],
              [0, cand.prob * 100],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 130,
                    fontFamily: "'CMU Serif', serif",
                    fontSize: 24,
                    color: cand.active ? yellowColor : chalkColor,
                    fontStyle: "italic",
                  }}
                >
                  "{cand.word}"
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    flex: 1,
                    height: 36,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 8,
                    overflow: "hidden",
                    border: cand.active ? `1.5px solid ${blueColor}` : "1px solid rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barW}%`,
                      backgroundColor: cand.active ? blueColor : "rgba(255, 255, 255, 0.2)",
                      borderRadius: 6,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 6,
                      fontFamily: "monospace",
                      fontSize: 16,
                      fontWeight: 800,
                      color: cand.active ? "#FFF" : "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {cand.label}
                  </span>
                </div>

                <div style={{ width: 30, color: greenColor, fontSize: 22, fontWeight: 900 }}>
                  {cand.active ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pi Creature Observation */}
      <div
        style={{
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <PiCreature size={95} color={blueColor} lookX={0.2} lookY={-0.6} />
        <div
          style={{
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.8)",
            fontStyle: "italic",
          }}
        >
          "The model samples from this normalized exponential probability distribution."
        </div>
      </div>
    </AbsoluteFill>
  );
};
