import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TitaniumChip } from "../components/TitaniumChip";
import { LightSweep } from "../components/LightSweep";
import { TitanXProps } from "../types";

export const Scene2Architecture: React.FC<TitanXProps> = ({
  accentColor,
  goldAccent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera drift
  const cameraX = interpolate(frame, [0, 270], [-30, 30]);
  const sceneFadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneFadeOut = interpolate(frame, [240, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3D Chip rotation angles
  const chipRotateX = interpolate(frame, [0, 270], [24, 10]);
  const chipRotateY = interpolate(frame, [0, 270], [-35, 12]);
  const chipScale = interpolate(
    spring({ frame, fps, config: { damping: 20 } }),
    [0, 1],
    [0.75, 1.05]
  );

  // Staggered spec card springs
  const card1Spring = spring({ frame: frame - 25, fps, config: { damping: 22 } });
  const card2Spring = spring({ frame: frame - 45, fps, config: { damping: 22 } });
  const card3Spring = spring({ frame: frame - 65, fps, config: { damping: 22 } });

  const specs = [
    {
      title: "NANOMETER ARCHITECTURE",
      value: "3nm Extreme Litho",
      detail: "145 Billion High-Density Transistors",
      springVal: card1Spring,
      delay: 25,
    },
    {
      title: "NEURAL MATRIX ARRAY",
      value: "32-Core Tensor Core",
      detail: "Hardware-accelerated Matrix Math Engine",
      springVal: card2Spring,
      delay: 45,
    },
    {
      title: "UNIFIED MEMORY BUS",
      value: "800 GB/s",
      detail: "Zero-copy CPU/GPU/NPU Shared Cache",
      springVal: card3Spring,
      delay: 65,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity: sceneFadeIn * sceneFadeOut,
        transform: `translateX(${cameraX}px)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 140px",
      }}
    >
      {/* Left side: 3D Titanium Chip Die */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -50,
            left: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: goldAccent,
            fontFamily: "monospace",
          }}
        >
          // HARDWARE TELEMETRY
        </div>

        <TitaniumChip
          rotateX={chipRotateX}
          rotateY={chipRotateY}
          scale={chipScale}
          goldAccent={goldAccent}
          accentColor={accentColor}
          glowIntensity={1.3}
        />
      </div>

      {/* Right side: Staggered Glass Spec Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          width: 500,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(226, 232, 240, 0.5)",
            fontFamily: "system-ui, sans-serif",
            marginBottom: 4,
          }}
        >
          ARCHITECTURAL SPECIFICATIONS
        </div>

        {specs.map((s, idx) => {
          const cardX = interpolate(s.springVal, [0, 1], [60, 0]);
          const cardAlpha = interpolate(s.springVal, [0, 1], [0, 1]);

          return (
            <div
              key={idx}
              style={{
                opacity: cardAlpha,
                transform: `translateX(${cardX}px)`,
                background: "rgba(15, 18, 26, 0.72)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 20,
                padding: "20px 26px",
                border: "1px solid rgba(226, 232, 240, 0.14)",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: goldAccent,
                  fontFamily: "monospace",
                }}
              >
                <span>{s.title}</span>
                <span style={{ opacity: 0.6 }}>[0{idx + 1}]</span>
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.02em",
                  marginTop: 6,
                }}
              >
                {s.value}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "rgba(226, 232, 240, 0.5)",
                  fontFamily: "system-ui, sans-serif",
                  marginTop: 4,
                }}
              >
                {s.detail}
              </div>

              <LightSweep startFrame={s.delay + 15} duration={35} color="rgba(255, 255, 255, 0.5)" />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
