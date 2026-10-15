import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HowAIWorksProps } from "../types";

export const Scene6Outro: React.FC<HowAIWorksProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const rotation = frame * 0.8;
  const pulse = (Math.sin(frame * 0.08) + 1) / 2;

  // Pipeline summary step tags
  const pipelineSteps = [
    { label: "1. TOKENS", color: primaryColor },
    { label: "2. VECTORS", color: secondaryColor },
    { label: "3. WEIGHTS", color: "#F59E0B" },
    { label: "4. PROBABILITY", color: accentColor },
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
      {/* Category Eyebrow */}
      <div
        style={{
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "4px 14px",
            background: "linear-gradient(90deg, #10B981, #00F0FF)",
            borderRadius: 20,
            color: "#000",
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          THE BIG PICTURE
        </div>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            fontSize: 16,
          }}
        >
          LANGUAGE GEOMETRY
        </span>
      </div>

      {/* Main Climactic Title */}
      <h2
        style={{
          fontSize: 60,
          fontWeight: 900,
          color: "#FFF",
          textAlign: "center",
          lineHeight: 1.1,
          margin: "0 0 35px 0",
          transform: `scale(${interpolate(entrance, [0, 1], [0.92, 1])})`,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        Math Decoding{" "}
        <br />
        <span
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 30px ${primaryColor}77)`,
          }}
        >
          Human Knowledge
        </span>
      </h2>

      {/* Central Climax Sphere Emblem */}
      <div
        style={{
          position: "relative",
          width: 360,
          height: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 35,
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${primaryColor}44 0%, transparent 70%)`,
            filter: "blur(35px)",
            transform: `scale(${1 + pulse * 0.15})`,
          }}
        />

        {/* Orbit Ring A */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: `2px solid ${primaryColor}55`,
            transform: `rotate(${rotation}deg)`,
          }}
        />

        {/* Orbit Ring B */}
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: "50%",
            border: `2px dashed ${secondaryColor}77`,
            transform: `rotate(${-rotation * 1.2}deg)`,
          }}
        />

        {/* Center Orb */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #1E293B 0%, #0F172A 70%, #020617 100%)",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            boxShadow: `0 20px 50px rgba(0,0,0,0.9), inset 0 0 20px ${primaryColor}33`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: primaryColor,
              letterSpacing: "0.2em",
              fontFamily: "monospace",
            }}
          >
            ARCHITECTURE
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginTop: 4,
            }}
          >
            SOLVED
          </div>
        </div>
      </div>

      {/* 4 Pipeline Step Pills */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 900,
          marginBottom: 35,
        }}
      >
        {pipelineSteps.map((step, idx) => {
          const pillSpring = spring({
            frame: frame - idx * 6,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          return (
            <div
              key={idx}
              style={{
                transform: `scale(${interpolate(pillSpring, [0, 1], [0.8, 1])})`,
                opacity: interpolate(pillSpring, [0, 1], [0, 1]),
                background: "rgba(15, 23, 42, 0.8)",
                border: `1.5px solid ${step.color}88`,
                borderRadius: 14,
                padding: "10px 18px",
                fontFamily: "monospace",
                fontSize: 15,
                fontWeight: 800,
                color: step.color,
                boxShadow: `0 4px 15px rgba(0,0,0,0.5)`,
              }}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 20,
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: `0 10px 30px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#FFF",
            letterSpacing: "0.05em",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          FOLLOW FOR MORE AI DEEP DIVES
        </span>
      </div>
    </AbsoluteFill>
  );
};
