import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PiCreature } from "../components/PiCreature";
import { ThreeB1BProps } from "../types";

export const Scene1_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  // Write animation for the equation
  const writeProgress = interpolate(frame, [15, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      {/* Chapter Title */}
      <div
        style={{
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          fontSize: 22,
          color: blueColor,
          fontStyle: "italic",
          marginBottom: 20,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        Chapter 1: The Linear Algebra of Neural Nets
      </div>

      <h1
        style={{
          fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
          fontSize: 58,
          fontWeight: 700,
          color: chalkColor,
          textAlign: "center",
          lineHeight: 1.15,
          margin: "0 0 45px 0",
          letterSpacing: "-0.01em",
        }}
      >
        Not a Thinking Brain.
        <br />
        <span style={{ color: yellowColor, fontStyle: "italic" }}>
          A Geometric Function.
        </span>
      </h1>

      {/* Main Manim Equation Card */}
      <div
        style={{
          width: "92%",
          maxWidth: 900,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: `1.5px solid rgba(88, 196, 221, 0.35)`,
          borderRadius: 20,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          boxShadow: `0 20px 40px rgba(0,0,0,0.6), inset 0 0 25px rgba(88, 196, 221, 0.05)`,
        }}
      >
        {/* The Equation */}
        <div
          style={{
            fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
            fontSize: 56,
            color: chalkColor,
            marginBottom: 25,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: writeProgress,
          }}
        >
          <span style={{ color: blueColor }}>a</span>
          <span>=</span>
          <span style={{ color: yellowColor }}>σ</span>
          <span>(</span>
          <span style={{ color: "#83C5BE", fontWeight: 700 }}>W</span>
          <span style={{ color: "#FF6B8B" }}>x</span>
          <span>+</span>
          <span style={{ color: "#E59866" }}>b</span>
          <span>)</span>
        </div>

        {/* Matrix Expansion Diagram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "monospace",
            fontSize: 18,
            color: "rgba(236, 239, 244, 0.85)",
            borderTop: "1px dashed rgba(255, 255, 255, 0.15)",
            paddingTop: 24,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {/* Output Vector */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 36, color: blueColor }}>[</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 6px" }}>
              <span>a₁</span>
              <span>a₂</span>
              <span>a₃</span>
            </div>
            <span style={{ fontSize: 36, color: blueColor }}>]</span>
          </div>

          <span>=</span>
          <span style={{ color: yellowColor, fontSize: 24 }}>σ</span>

          {/* Weight Matrix */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 36, color: "#83C5BE" }}>[</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", padding: "0 6px" }}>
              <span>w₁₁</span>
              <span>w₁₂</span>
              <span>w₂₁</span>
              <span>w₂₂</span>
            </div>
            <span style={{ fontSize: 36, color: "#83C5BE" }}>]</span>
          </div>

          {/* Input Vector */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 36, color: "#FF6B8B" }}>[</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 6px" }}>
              <span>x₁</span>
              <span>x₂</span>
            </div>
            <span style={{ fontSize: 36, color: "#FF6B8B" }}>]</span>
          </div>
        </div>

        {/* Curly Braces labels */}
        <div
          style={{
            marginTop: 22,
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.6)",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          "A composite linear map followed by an element-wise activation."
        </div>
      </div>

      {/* Pi Creature Watching with Curiosity */}
      <div
        style={{
          marginTop: 35,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <PiCreature size={105} color={blueColor} lookX={0.3} lookY={-0.8} />
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 14,
            padding: "12px 20px",
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 18,
            color: chalkColor,
          }}
        >
          "It's just high-dimensional linear algebra!"
        </div>
      </div>
    </AbsoluteFill>
  );
};
