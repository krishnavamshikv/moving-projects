import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

interface VoxBackgroundProps {
  paperColor: string;
}

export const VoxBackground: React.FC<VoxBackgroundProps> = ({ paperColor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const currentSeconds = Math.floor(frame / fps);
  const formattedTime = `00:${currentSeconds.toString().padStart(2, "0")} / 01:00`;
  const progressPercent = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: paperColor,
        overflow: "hidden",
      }}
    >
      {/* Subtle paper grain / halftone texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(#18181A 0.75px, transparent 0.75px),
            radial-gradient(#18181A 0.75px, #F6F3EB 0.75px)
          `,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
          opacity: 0.05,
        }}
      />

      {/* Top Editorial Bar */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #18181A",
          paddingBottom: 10,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Bold Vox style black badge */}
          <div
            style={{
              backgroundColor: "#18181A",
              color: "#FFF",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.1em",
              padding: "4px 10px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            VOX
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.15em",
              color: "#18181A",
              textTransform: "uppercase",
            }}
          >
            THE EXPLAINER // HOW A.I. WORKS
          </span>
        </div>

        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "monospace",
            color: "#666",
          }}
        >
          {formattedTime}
        </div>
      </div>

      {/* Top Progress Line (Vox Yellow) */}
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 48,
          width: `calc((100% - 96px) * ${progressPercent / 100})`,
          height: 3,
          backgroundColor: "#FFE600",
          zIndex: 51,
        }}
      />

      {/* Editorial registration crosshairs in corners */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 48,
          fontSize: 12,
          fontFamily: "monospace",
          color: "#999",
          fontWeight: 700,
        }}
      >
        FIG. 2026 // ISSUE 01 // ARCHIVE DOC
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 48,
          fontSize: 12,
          fontFamily: "monospace",
          color: "#999",
          fontWeight: 700,
        }}
      >
        + 1080×1920 VERTICAL +
      </div>
    </AbsoluteFill>
  );
};
