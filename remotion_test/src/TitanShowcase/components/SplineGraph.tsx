import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SplineGraph: React.FC<{
  delay?: number;
  goldAccent?: string;
  accentColor?: string;
}> = ({ delay = 0, goldAccent = "#F59E0B", accentColor = "#E2E8F0" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drawProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 26,
      mass: 0.9,
      stiffness: 90,
    },
  });

  const cardOpacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Curve path coordinates (Width: 640, Height: 240)
  const pathD = "M 40 200 C 140 195, 220 180, 320 130 C 420 80, 500 45, 600 25";
  const areaD = "M 40 200 C 140 195, 220 180, 320 130 C 420 80, 500 45, 600 25 L 600 210 L 40 210 Z";

  // Comparison baseline curve
  const baselineD = "M 40 200 C 160 190, 300 175, 420 160 C 500 150, 560 145, 600 140";

  const totalLength = 700;
  const strokeOffset = interpolate(drawProgress, [0, 1], [totalLength, 0]);

  // Marker point at end of curve
  const markerScale = spring({
    frame: frame - delay - 30,
    fps,
    config: { damping: 15 },
  });

  return (
    <div
      style={{
        opacity: cardOpacity,
        background: "rgba(12, 15, 22, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 24,
        padding: "24px 32px",
        border: "1px solid rgba(226, 232, 240, 0.12)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        width: 680,
      }}
    >
      {/* Graph Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(226, 232, 240, 0.5)",
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            PERFORMANCE / WATT
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "system-ui, sans-serif",
              marginTop: 2,
            }}
          >
            Compute Scaling Efficiency
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, fontSize: 11, fontWeight: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: goldAccent }}>
            <span style={{ width: 10, height: 3, backgroundColor: goldAccent, borderRadius: 2 }} />
            TITAN X
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(226, 232, 240, 0.4)" }}>
            <span style={{ width: 10, height: 2, backgroundColor: "rgba(226, 232, 240, 0.4)", borderRadius: 2 }} />
            PRIOR GEN
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: "relative", width: "100%", height: 210 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 640 220"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="titanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={goldAccent} stopOpacity="0.3" />
              <stop offset="70%" stopColor={goldAccent} stopOpacity="0.05" />
              <stop offset="100%" stopColor={goldAccent} stopOpacity="0" />
            </linearGradient>

            <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="70%" stopColor={goldAccent} />
              <stop offset="100%" stopColor="#FFF" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="40" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="40" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="40" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="40" y1="200" x2="600" y2="200" stroke="rgba(255,255,255,0.12)" />

          {/* Baseline previous gen path */}
          <path
            d={baselineD}
            fill="none"
            stroke="rgba(226, 232, 240, 0.3)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          {/* Area glow underneath Titan curve */}
          <path
            d={areaD}
            fill="url(#titanGradient)"
            opacity={drawProgress}
          />

          {/* Primary Titan curve with dynamic stroke-dashoffset */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGrad)"
            strokeWidth="4"
            strokeDasharray={totalLength}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            filter={`drop-shadow(0px 0px 8px ${goldAccent})`}
          />

          {/* End Callout Marker */}
          {markerScale > 0.05 && (
            <g transform={`translate(600, 25) scale(${markerScale})`}>
              <circle r="7" fill={goldAccent} />
              <circle r="14" fill="none" stroke={goldAccent} strokeWidth="1.5" opacity="0.6" />
              {/* Floating pill badge */}
              <rect
                x="-45"
                y="-38"
                width="90"
                height="24"
                rx="12"
                fill="#0F121A"
                stroke={goldAccent}
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="-22"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
              >
                +380% PEAK
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
