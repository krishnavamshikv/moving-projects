import React from "react";
import { useCurrentFrame } from "remotion";

interface PiCreatureProps {
  size?: number;
  color?: string;
  lookX?: number; // -1 to 1
  lookY?: number; // -1 to 1
  style?: React.CSSProperties;
}

export const PiCreature: React.FC<PiCreatureProps> = ({
  size = 120,
  color = "#58C4DD",
  lookX = 0,
  lookY = -0.5,
  style,
}) => {
  const frame = useCurrentFrame();

  // Gentle breathing/bouncing motion
  const bounceY = Math.sin(frame * 0.1) * 3;

  // Blinking: every 90 frames, blink for 4 frames
  const isBlinking = frame % 90 > 85;

  const pupilOffsetX = lookX * 5;
  const pupilOffsetY = lookY * 4;

  return (
    <div
      style={{
        display: "inline-block",
        transform: `translateY(${bounceY}px)`,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pi Body / Legs */}
        <path
          d="M20 32 C30 32, 70 32, 85 30 C88 30, 88 38, 80 38 C68 38, 66 50, 68 85 C69 88, 62 88, 60 85 C56 50, 55 42, 45 42 C40 42, 38 60, 36 85 C35 88, 28 88, 27 85 C25 50, 22 36, 15 36 C12 36, 12 32, 20 32 Z"
          fill={color}
          stroke="#ECEFF4"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Eyes (Left Eye) */}
        {isBlinking ? (
          <line x1="38" y1="36" x2="48" y2="36" stroke="#ECEFF4" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <g>
            <circle cx="44" cy="35" r="7.5" fill="#FFFFFF" stroke="#16181F" strokeWidth="1.5" />
            <circle cx={44 + pupilOffsetX} cy={35 + pupilOffsetY} r="3" fill="#16181F" />
          </g>
        )}

        {/* Eyes (Right Eye) */}
        {isBlinking ? (
          <line x1="56" y1="36" x2="66" y2="36" stroke="#ECEFF4" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <g>
            <circle cx="60" cy="35" r="7.5" fill="#FFFFFF" stroke="#16181F" strokeWidth="1.5" />
            <circle cx={60 + pupilOffsetX} cy={35 + pupilOffsetY} r="3" fill="#16181F" />
          </g>
        )}
      </svg>
    </div>
  );
};
