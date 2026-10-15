import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene3NeuralNet: React.FC<HowAIWorksProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  // Pulse wave propagating through layers
  const pulsePhase = (frame * 0.1) % (Math.PI * 2);

  // Layers specification: X coordinates and node count (nicely centered vertically)
  const layers = [
    { label: "INPUT", x: 140, nodes: [130, 220, 310, 400] },
    { label: "HIDDEN 1", x: 380, nodes: [100, 160, 220, 280, 340, 400] },
    { label: "HIDDEN 2", x: 620, nodes: [100, 160, 220, 280, 340, 400] },
    { label: "OUTPUT", x: 860, nodes: [160, 265, 370] },
  ];

  // Parameter counter
  const paramCount = Math.floor(
    interpolate(frame, [0, 250], [10, 175], {
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 30px",
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
            background: "rgba(139, 92, 246, 0.15)",
            border: `1px solid ${secondaryColor}`,
            borderRadius: 16,
            color: secondaryColor,
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          STEP 02
        </div>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            fontSize: 16,
          }}
        >
          THE NEURAL NETWORK
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
        Billions of{" "}
        <span
          style={{
            color: secondaryColor,
            textShadow: `0 0 25px ${secondaryColor}88`,
          }}
        >
          Weights & Synapses
        </span>
      </h2>

      {/* Interactive Network Diagram */}
      <div
        style={{
          width: 980,
          height: 520,
          background: "rgba(10, 14, 23, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${secondaryColor}22`,
        }}
      >
        {/* SVG Synaptic Connections */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Layer 0 to Layer 1 connections */}
          {layers[0].nodes.map((y1, i) =>
            layers[1].nodes.map((y2, j) => {
              const activePulse = (Math.sin(pulsePhase - (i + j) * 0.4) + 1) / 2;
              return (
                <line
                  key={`l0-l1-${i}-${j}`}
                  x1={layers[0].x}
                  y1={y1}
                  x2={layers[1].x}
                  y2={y2}
                  stroke={activePulse > 0.6 ? primaryColor : "rgba(255,255,255,0.06)"}
                  strokeWidth={activePulse > 0.6 ? 2.5 : 1}
                  opacity={activePulse > 0.6 ? 0.8 : 0.25}
                />
              );
            })
          )}

          {/* Layer 1 to Layer 2 connections */}
          {layers[1].nodes.map((y1, i) =>
            layers[2].nodes.map((y2, j) => {
              const activePulse = (Math.sin(pulsePhase - 1.2 - (i + j) * 0.4) + 1) / 2;
              return (
                <line
                  key={`l1-l2-${i}-${j}`}
                  x1={layers[1].x}
                  y1={y1}
                  x2={layers[2].x}
                  y2={y2}
                  stroke={activePulse > 0.6 ? secondaryColor : "rgba(255,255,255,0.06)"}
                  strokeWidth={activePulse > 0.6 ? 2.5 : 1}
                  opacity={activePulse > 0.6 ? 0.8 : 0.25}
                />
              );
            })
          )}

          {/* Layer 2 to Layer 3 connections */}
          {layers[2].nodes.map((y1, i) =>
            layers[3].nodes.map((y2, j) => {
              const activePulse = (Math.sin(pulsePhase - 2.4 - (i + j) * 0.4) + 1) / 2;
              return (
                <line
                  key={`l2-l3-${i}-${j}`}
                  x1={layers[2].x}
                  y1={y1}
                  x2={layers[3].x}
                  y2={y2}
                  stroke={activePulse > 0.6 ? accentColor : "rgba(255,255,255,0.06)"}
                  strokeWidth={activePulse > 0.6 ? 2.5 : 1}
                  opacity={activePulse > 0.6 ? 0.8 : 0.25}
                />
              );
            })
          )}

          {/* Render Neurons (Nodes) */}
          {layers.map((layer, lIdx) =>
            layer.nodes.map((y, nIdx) => {
              const isPulsing =
                Math.sin(pulsePhase - lIdx * 1.2 - nIdx * 0.4) > 0.4;
              const nodeColor =
                lIdx === 0
                  ? primaryColor
                  : lIdx === 3
                  ? accentColor
                  : secondaryColor;

              return (
                <g key={`node-${lIdx}-${nIdx}`}>
                  <circle
                    cx={layer.x}
                    cy={y}
                    r={isPulsing ? 14 : 10}
                    fill="#0F172A"
                    stroke={nodeColor}
                    strokeWidth={isPulsing ? 3 : 2}
                  />
                  {isPulsing && (
                    <circle
                      cx={layer.x}
                      cy={y}
                      r={22}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  )}
                </g>
              );
            })
          )}
        </svg>

        {/* Layer Header Labels */}
        {layers.map((l, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 24,
              left: l.x,
              transform: "translateX(-50%)",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255, 255, 255, 0.6)",
              letterSpacing: "0.15em",
            }}
          >
            {l.label}
          </div>
        ))}

        {/* Live Weight Multiplying Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 30,
            right: 30,
            background: "rgba(0, 0, 0, 0.7)",
            borderRadius: 14,
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 15,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: secondaryColor }}>ACTIVATION:</span>
            <span style={{ color: "#FFF" }}>ReLU( W·x + b )</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>PARAMETERS:</span>
            <span style={{ color: accentColor, fontWeight: 900 }}>
              {paramCount} BILLION
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
