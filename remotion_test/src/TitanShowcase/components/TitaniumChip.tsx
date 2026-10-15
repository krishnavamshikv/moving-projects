import React from "react";
import { useCurrentFrame } from "remotion";

export const TitaniumChip: React.FC<{
  rotateX?: number;
  rotateY?: number;
  scale?: number;
  accentColor?: string;
  goldAccent?: string;
  glowIntensity?: number;
}> = ({
  rotateX = 18,
  rotateY = -22,
  scale = 1,
  accentColor = "#E2E8F0",
  goldAccent = "#F59E0B",
  glowIntensity = 1,
}) => {
  const frame = useCurrentFrame();

  // Dynamic light reflection angle based on 3D tilt
  const lightSheenOffset = (rotateY * 4 + rotateX * 2) % 360;

  // Pulse for the neural core clusters
  const pulse = Math.sin(frame * 0.1) * 0.2 + 0.8;

  return (
    <div
      style={{
        width: 520,
        height: 520,
        perspective: 1200,
        transformStyle: "preserve-3d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 3D Chip Container */}
      <div
        style={{
          width: 460,
          height: 460,
          transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          position: "relative",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {/* Shadow layer cast below chip */}
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: 36,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 20%, transparent 75%)",
            transform: "translateZ(-80px) translateY(70px) scale(0.95)",
            filter: "blur(35px)",
          }}
        />

        {/* Base Substrate (Dark Matte Carbon PCB) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            backgroundColor: "#0B0D12",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 25px 60px rgba(0, 0, 0, 0.9),
              0 0 35px rgba(245, 158, 11, ${0.12 * glowIntensity})
            `,
            transform: "translateZ(0px)",
          }}
        >
          {/* Subtle PCB Micro-traces background */}
          <svg
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.18,
              borderRadius: 28,
            }}
          >
            <pattern id="pcb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={accentColor}
                strokeWidth="0.75"
              />
              <circle cx="20" cy="20" r="1.5" fill={accentColor} />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pcb-grid)" />
          </svg>
        </div>

        {/* Middle Heatspreader: Brushed Titanium Frame */}
        <div
          style={{
            position: "absolute",
            inset: 22,
            borderRadius: 22,
            background: `linear-gradient(
              ${135 + lightSheenOffset}deg,
              #2A2E38 0%,
              #171920 40%,
              #343A46 65%,
              #12141A 100%
            )`,
            border: "2px solid rgba(226, 232, 240, 0.25)",
            boxShadow: `
              inset 0 1px 2px rgba(255, 255, 255, 0.4),
              inset 0 -2px 4px rgba(0, 0, 0, 0.8),
              0 10px 25px rgba(0, 0, 0, 0.6)
            `,
            transform: "translateZ(18px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 24,
          }}
        >
          {/* Header laser mark */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "rgba(226, 232, 240, 0.5)",
              fontFamily: "monospace",
            }}
          >
            <span>TITAN // SYSTEM 01</span>
            <span style={{ color: goldAccent, opacity: 0.85 }}>REV 4.2</span>
          </div>

          {/* Inner Silicon Die: Obsidian Core & Neural Matrix */}
          <div
            style={{
              width: 250,
              height: 250,
              borderRadius: 16,
              background: "#050608",
              border: `1.5px solid ${goldAccent}`,
              boxShadow: `
                inset 0 0 30px rgba(0, 0, 0, 0.95),
                0 0 25px rgba(245, 158, 11, ${0.35 * pulse * glowIntensity})
              `,
              transform: "translateZ(26px)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Animated circuit gold bus traces */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 250 250"
              style={{ position: "absolute", inset: 0 }}
            >
              {/* Gold circuit paths */}
              <path
                d="M 20 20 L 80 20 L 105 45 L 105 105"
                fill="none"
                stroke={goldAccent}
                strokeWidth="1.2"
                strokeDasharray="6 4"
                strokeDashoffset={-frame * 0.8}
                opacity={0.7}
              />
              <path
                d="M 230 20 L 170 20 L 145 45 L 145 105"
                fill="none"
                stroke={goldAccent}
                strokeWidth="1.2"
                strokeDasharray="6 4"
                strokeDashoffset={frame * 0.8}
                opacity={0.7}
              />
              <path
                d="M 20 230 L 80 230 L 105 205 L 105 145"
                fill="none"
                stroke={goldAccent}
                strokeWidth="1.2"
                strokeDasharray="6 4"
                strokeDashoffset={frame * 0.8}
                opacity={0.7}
              />
              <path
                d="M 230 230 L 170 230 L 145 205 L 145 145"
                fill="none"
                stroke={goldAccent}
                strokeWidth="1.2"
                strokeDasharray="6 4"
                strokeDashoffset={-frame * 0.8}
                opacity={0.7}
              />
            </svg>

            {/* Neural Compute Core Matrix */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 7,
                padding: 14,
                zIndex: 2,
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => {
                const nodePulse = Math.sin(frame * 0.15 + i * 0.7) * 0.5 + 0.5;
                return (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      backgroundColor: "rgba(18, 22, 32, 0.9)",
                      border: `1px solid rgba(245, 158, 11, ${0.2 + nodePulse * 0.5})`,
                      boxShadow: `0 0 10px rgba(245, 158, 11, ${nodePulse * 0.4 * glowIntensity})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: goldAccent,
                        opacity: nodePulse,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Glowing Center Core Monogram */}
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: "#FFFFFF",
                textShadow: `0 0 15px ${goldAccent}`,
                backgroundColor: "rgba(6, 8, 12, 0.85)",
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              TITAN
            </div>
          </div>

          {/* Footer laser specs */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "rgba(226, 232, 240, 0.4)",
              fontFamily: "monospace",
            }}
          >
            <span>3NM NANO-ARCH</span>
            <span>128-CORE COMPUTE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
