import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MetricCounter: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
  goldAccent?: string;
  accentColor?: string;
  subtext?: string;
}> = ({
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  delay = 0,
  goldAccent = "#F59E0B",
  accentColor = "#E2E8F0",
  subtext,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 24,
      mass: 0.8,
      stiffness: 120,
    },
  });

  const displayVal = interpolate(progress, [0, 1], [0, value]);
  const formattedVal = decimals > 0 ? displayVal.toFixed(decimals) : Math.floor(displayVal);

  const cardOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardTranslateY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardTranslateY}px)`,
        background: "rgba(15, 18, 26, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid rgba(226, 232, 240, 0.12)",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        display: "flex",
        flexDirection: "column",
        minWidth: 240,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top subtle highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />

      {/* Label and status ring */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(226, 232, 240, 0.65)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: goldAccent,
            boxShadow: `0 0 8px ${goldAccent}`,
          }}
        />
      </div>

      {/* Main Counter Value */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.03em",
          color: "#FFFFFF",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ color: goldAccent, marginRight: 2 }}>{prefix}</span>
        {formattedVal}
        <span
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: accentColor,
            marginLeft: 4,
            opacity: 0.8,
          }}
        >
          {suffix}
        </span>
      </div>

      {subtext && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "rgba(226, 232, 240, 0.45)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};
