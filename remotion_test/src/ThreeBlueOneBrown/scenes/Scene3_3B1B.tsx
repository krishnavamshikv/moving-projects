import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeB1BProps } from "../types";

export const Scene3_3B1B: React.FC<ThreeB1BProps> = ({
  blueColor,
  yellowColor,
  greenColor,
  pinkColor,
  chalkColor,
}) => {
  const frame = useCurrentFrame();

  // 4 layers
  const layers = [
    { label: "Layer 0 (Input)", x: 140, nodes: [130, 220, 310, 400] },
    { label: "Layer 1", x: 380, nodes: [100, 160, 220, 280, 340, 400] },
    { label: "Layer 2", x: 620, nodes: [100, 160, 220, 280, 340, 400] },
    { label: "Layer 3 (Output)", x: 860, nodes: [160, 265, 370] },
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
        Chapter 3: Layers of Weighted Connections
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
        The Architecture of a{" "}
        <span style={{ color: blueColor, fontStyle: "italic" }}>
          Neural Network
        </span>
      </h2>

      {/* 3B1B Neural Net Board */}
      <div
        style={{
          width: 960,
          height: 500,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: `1.5px solid rgba(88, 196, 221, 0.35)`,
          borderRadius: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Synapses L0 -> L1 */}
          {layers[0].nodes.map((y1, i) =>
            layers[1].nodes.map((y2, j) => {
              const isPositive = (i + j) % 2 === 0;
              const weightColor = isPositive ? blueColor : pinkColor;
              return (
                <line
                  key={`l0-${i}-${j}`}
                  x1={layers[0].x}
                  y1={y1}
                  x2={layers[1].x}
                  y2={y2}
                  stroke={weightColor}
                  strokeWidth={isPositive ? 1.8 : 1.2}
                  opacity={0.35}
                />
              );
            })
          )}

          {/* Synapses L1 -> L2 */}
          {layers[1].nodes.map((y1, i) =>
            layers[2].nodes.map((y2, j) => {
              const isPositive = (i * 2 + j) % 3 !== 0;
              const weightColor = isPositive ? greenColor : yellowColor;
              return (
                <line
                  key={`l1-${i}-${j}`}
                  x1={layers[1].x}
                  y1={y1}
                  x2={layers[2].x}
                  y2={y2}
                  stroke={weightColor}
                  strokeWidth={1.4}
                  opacity={0.3}
                />
              );
            })
          )}

          {/* Synapses L2 -> L3 */}
          {layers[2].nodes.map((y1, i) =>
            layers[3].nodes.map((y2, j) => {
              const isPositive = (i + j) % 2 === 1;
              const weightColor = isPositive ? blueColor : pinkColor;
              return (
                <line
                  key={`l2-${i}-${j}`}
                  x1={layers[2].x}
                  y1={y1}
                  x2={layers[3].x}
                  y2={y2}
                  stroke={weightColor}
                  strokeWidth={2}
                  opacity={0.4}
                />
              );
            })
          )}

          {/* Render 3B1B Neurons */}
          {layers.map((layer, lIdx) =>
            layer.nodes.map((y, nIdx) => {
              // Activation level (0 to 1 brightness)
              const act = (Math.sin(frame * 0.15 + lIdx + nIdx) + 1) / 2;
              const fillBrightness = Math.floor(act * 200 + 40);

              return (
                <g key={`node-${lIdx}-${nIdx}`}>
                  <circle
                    cx={layer.x}
                    cy={y}
                    r={12}
                    fill={`rgb(${fillBrightness}, ${fillBrightness}, ${fillBrightness})`}
                    stroke={chalkColor}
                    strokeWidth={2}
                  />
                  {act > 0.7 && (
                    <circle
                      cx={layer.x}
                      cy={y}
                      r={18}
                      fill="none"
                      stroke={blueColor}
                      strokeWidth={1.5}
                      opacity={0.6}
                    />
                  )}
                </g>
              );
            })
          )}
        </svg>

        {/* Legend for 3B1B Weight Colors */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 25,
            display: "flex",
            gap: 16,
            fontFamily: "'CMU Serif', serif",
            fontSize: 15,
            color: chalkColor,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 3, backgroundColor: blueColor }} />
            <span>Positive Weight (w &gt; 0)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 3, backgroundColor: pinkColor }} />
            <span>Negative Weight (w &lt; 0)</span>
          </div>
        </div>

        {/* Mathematical Equation at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 30,
            right: 30,
            backgroundColor: "rgba(10, 12, 18, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 12,
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'CMU Serif', 'Computer Modern', serif",
            fontSize: 22,
          }}
        >
          <div style={{ color: chalkColor }}>
            a_j^(l) = σ( ∑_k w_jk^(l) a_k^(l-1) + b_j^(l) )
          </div>
          <div style={{ color: yellowColor, fontSize: 18, fontStyle: "italic" }}>
            175 Billion Parameters
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
