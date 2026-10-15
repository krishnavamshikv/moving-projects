import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface ProgressBarProps {
  primaryColor: string;
  totalDurationSeconds?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  primaryColor,
  totalDurationSeconds = 60,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const progressPercent = (frame / durationInFrames) * 100;
  const currentSeconds = Math.min(
    Math.floor(frame / fps),
    totalDurationSeconds
  );
  const formattedCurrent = `00:${currentSeconds.toString().padStart(2, "0")}`;
  const formattedTotal = `01:00`;

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "monospace, monospace",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: primaryColor,
              boxShadow: `0 0 10px ${primaryColor}`,
            }}
          />
          <span style={{ color: "#FFF" }}>AI ARCHITECTURE BREAKDOWN</span>
        </div>
        <div>
          <span style={{ color: primaryColor }}>{formattedCurrent}</span>
          <span style={{ opacity: 0.4 }}> / {formattedTotal}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: "100%",
          height: 4,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${primaryColor}99, ${primaryColor})`,
            boxShadow: `0 0 8px ${primaryColor}`,
          }}
        />
      </div>
    </div>
  );
};
