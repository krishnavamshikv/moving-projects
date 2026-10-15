import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MetricCounter } from "../components/MetricCounter";
import { SplineGraph } from "../components/SplineGraph";
import { TitanXProps } from "../types";

export const Scene3Performance: React.FC<TitanXProps> = ({
  coreCount,
  neuralEngineOps,
  latencyMs,
  goldAccent,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  const sceneFadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneFadeOut = interpolate(frame, [240, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cameraScale = interpolate(frame, [0, 270], [0.96, 1.02]);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneFadeIn * sceneFadeOut,
        transform: `scale(${cameraScale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 100px",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 35,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: goldAccent,
            fontFamily: "system-ui, sans-serif",
            textShadow: `0 0 12px ${goldAccent}66`,
          }}
        >
          BENCHMARK TELEMETRY
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 4,
          }}
        >
          Beyond Theoretical Limits.
        </div>
      </div>

      {/* Main Content Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 32,
          width: "100%",
          maxWidth: 1380,
          justifyContent: "center",
        }}
      >
        {/* Left Column: 3 Metric Counters Stacked */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: 380,
          }}
        >
          <MetricCounter
            label="COMPUTE CORES"
            value={coreCount}
            delay={10}
            goldAccent={goldAccent}
            accentColor={accentColor}
            subtext="+96% Multi-Threaded Scalability"
          />

          <MetricCounter
            label="NEURAL OPS"
            value={parseInt(neuralEngineOps, 10) || 450}
            suffix=" TOPS"
            delay={25}
            goldAccent={goldAccent}
            accentColor={accentColor}
            subtext="Real-time Generative Synthesis"
          />

          <MetricCounter
            label="PIPELINE LATENCY"
            value={latencyMs}
            suffix=" ms"
            decimals={2}
            delay={40}
            goldAccent={goldAccent}
            accentColor={accentColor}
            subtext="Deterministic Sub-Millisecond Dispatch"
          />
        </div>

        {/* Right Column: Animated Spline Benchmark Curve */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <SplineGraph delay={20} goldAccent={goldAccent} accentColor={accentColor} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
