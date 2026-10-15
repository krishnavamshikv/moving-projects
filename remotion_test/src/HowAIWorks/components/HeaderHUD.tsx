import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { VOICEOVER_SECTIONS } from "../voiceoverScript";

interface HeaderHUDProps {
  primaryColor: string;
  secondaryColor: string;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ primaryColor }) => {
  const frame = useCurrentFrame();

  // Find active chapter based on frame
  const activeSection =
    VOICEOVER_SECTIONS.find(
      (sec) => frame >= sec.startFrame && frame < sec.endFrame
    ) || VOICEOVER_SECTIONS[0];

  // Animated voiceover waveform equalizer bars
  const bars = [0.4, 0.8, 0.6, 0.95, 0.5, 0.85, 0.7, 0.3, 0.9, 0.65, 0.45, 0.8];

  return (
    <div
      style={{
        position: "absolute",
        top: 65,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      {/* Chapter Tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 14px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 20,
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: primaryColor,
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          {activeSection.chapter}
        </span>
      </div>

      {/* Simulated VO Audio Visualizer Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255, 255, 255, 0.6)",
            fontFamily: "monospace",
            marginRight: 6,
          }}
        >
          VOICE OVER
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 16 }}>
          {bars.map((weight, i) => {
            const h = interpolate(
              Math.sin(frame * 0.25 + i * 0.9) * weight,
              [-1, 1],
              [4, 18]
            );
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: `${h}px`,
                  backgroundColor: primaryColor,
                  borderRadius: 2,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
