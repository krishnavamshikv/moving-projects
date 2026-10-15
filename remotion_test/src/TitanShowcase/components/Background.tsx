import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  seed: number;
};

export const Background: React.FC<{
  accentColor?: string;
  goldAccent?: string;
}> = ({ accentColor = "#E2E8F0", goldAccent = "#F59E0B" }) => {
  const frame = useCurrentFrame();

  // Procedural deterministic particle field
  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 45; i++) {
      // Deterministic pseudo-randomness based on index
      const randX = ((i * 137.5) % 100);
      const randY = ((i * 224.3) % 100);
      const size = 1.5 + (i % 4) * 1.2;
      const speed = 0.008 + (i % 5) * 0.005;
      const opacity = 0.2 + (i % 6) * 0.12;
      list.push({ id: i, x: randX, y: randY, size, speed, opacity, seed: i });
    }
    return list;
  }, []);

  // Smooth atmospheric breathing
  const glowX = interpolate(
    Math.sin(frame * 0.015),
    [-1, 1],
    [40, 60]
  );
  const glowY = interpolate(
    Math.cos(frame * 0.012),
    [-1, 1],
    [35, 55]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060709",
        overflow: "hidden",
      }}
    >
      {/* Dynamic atmospheric radial spotlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(245, 158, 11, 0.08) 0%, rgba(226, 232, 240, 0.03) 40%, transparent 75%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top ambient rim glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "450px",
          background: "radial-gradient(ellipse at center, rgba(226, 232, 240, 0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* 3D Horizon Grid */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-10%",
          width: "120%",
          height: "600px",
          transform: "perspective(600px) rotateX(72deg)",
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.6) 30%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.6) 30%, transparent 85%)",
          pointerEvents: "none",
        }}
      />

      {/* Procedural Drifting Titanium Stardust */}
      {particles.map((p) => {
        const driftY = (p.y + Math.sin(frame * p.speed + p.seed) * 12 - frame * 0.04) % 100;
        const driftX = (p.x + Math.cos(frame * p.speed * 0.8 + p.seed) * 8) % 100;
        const normalizedY = driftY < 0 ? driftY + 100 : driftY;
        const normalizedX = driftX < 0 ? driftX + 100 : driftX;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${normalizedX}%`,
              top: `${normalizedY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: p.id % 4 === 0 ? goldAccent : accentColor,
              opacity: p.opacity * (0.6 + 0.4 * Math.sin(frame * 0.05 + p.seed)),
              boxShadow: `0 0 ${p.size * 3}px ${p.id % 4 === 0 ? "rgba(245, 158, 11, 0.4)" : "rgba(226, 232, 240, 0.3)"}`,
              pointerEvents: "none",
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
          />
        );
      })}

      {/* Vignette border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.85) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
