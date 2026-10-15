import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HighlighterText } from "../components/HighlighterText";
import { VoxProps } from "../types";

export const Scene3Vox: React.FC<VoxProps> = ({
  highlightColor,
  accentRed,
  inkColor,
}) => {
  const frame = useCurrentFrame();

  const layers = [
    { label: "INPUT LAYER", x: 120, nodes: [120, 210, 300, 390] },
    { label: "HIDDEN LAYER 1", x: 360, nodes: [90, 150, 210, 270, 330, 390] },
    { label: "HIDDEN LAYER 2", x: 600, nodes: [90, 150, 210, 270, 330, 390] },
    { label: "OUTPUT LAYER", x: 840, nodes: [150, 255, 360] },
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
          CHAPTER 03
        </span>
        <span
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#444",
          }}
        >
          The Deep Neural Schematic
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
        Inside The{" "}
        <HighlighterText delay={10} duration={20} color={highlightColor}>
          Neural Network
        </HighlighterText>
      </h2>

      {/* The Architectural Schematic Card */}
      <div
        style={{
          width: "92%",
          maxWidth: 960,
          height: 490,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${inkColor}`,
          boxShadow: "10px 14px 0px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Schematic Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, #F0EDE5 1px, transparent 1px),
              linear-gradient(to bottom, #F0EDE5 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Layer 0 to 1 connections */}
          {layers[0].nodes.map((y1, i) =>
            layers[1].nodes.map((y2, j) => (
              <line
                key={`l0-${i}-${j}`}
                x1={layers[0].x}
                y1={y1}
                x2={layers[1].x}
                y2={y2}
                stroke="#18181A"
                strokeWidth={(i + j) % 2 === 0 ? 1.5 : 0.8}
                opacity={0.35}
              />
            ))
          )}

          {/* Layer 1 to 2 connections */}
          {layers[1].nodes.map((y1, i) =>
            layers[2].nodes.map((y2, j) => (
              <line
                key={`l1-${i}-${j}`}
                x1={layers[1].x}
                y1={y1}
                x2={layers[2].x}
                y2={y2}
                stroke="#18181A"
                strokeWidth={1}
                opacity={0.25}
              />
            ))
          )}

          {/* Layer 2 to 3 connections */}
          {layers[2].nodes.map((y1, i) =>
            layers[3].nodes.map((y2, j) => (
              <line
                key={`l2-${i}-${j}`}
                x1={layers[2].x}
                y1={y1}
                x2={layers[3].x}
                y2={y2}
                stroke={accentRed}
                strokeWidth={1.5}
                opacity={0.5}
              />
            ))
          )}

          {/* Nodes */}
          {layers.map((layer, lIdx) =>
            layer.nodes.map((y, nIdx) => (
              <g key={`n-${lIdx}-${nIdx}`}>
                <circle
                  cx={layer.x}
                  cy={y}
                  r={9}
                  fill="#FFFFFF"
                  stroke={lIdx === 3 ? accentRed : "#18181A"}
                  strokeWidth="2.5"
                />
                {(lIdx + nIdx) % 3 === 0 && (
                  <circle
                    cx={layer.x}
                    cy={y}
                    r={4}
                    fill={
                      lIdx === 3
                        ? accentRed
                        : Math.sin(frame * 0.2 + lIdx + nIdx) > 0
                        ? highlightColor
                        : "#FFFFFF"
                    }
                  />
                )}
              </g>
            ))
          )}
        </svg>

        {/* Layer Titles */}
        {layers.map((l, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: 18,
              left: l.x,
              transform: "translateX(-50%)",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 800,
              color: "#666",
            }}
          >
            {l.label}
          </div>
        ))}

        {/* Vox Editorial Card at the bottom of the schematic */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 24,
            right: 24,
            backgroundColor: "#18181A",
            color: "#FFF",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ backgroundColor: highlightColor, color: "#000", fontFamily: "monospace", fontSize: 12, fontWeight: 900, padding: "2px 6px" }}>
              DIAGRAM 3B
            </span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: 18 }}>
              Multi-Layer Signal Filtering
            </span>
          </div>

          <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: highlightColor }}>
            175,000,000,000 SYNAPSE WEIGHTS
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
