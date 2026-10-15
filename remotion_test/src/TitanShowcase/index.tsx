import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./components/Background";
import { Scene1Reveal } from "./scenes/Scene1Reveal";
import { Scene2Architecture } from "./scenes/Scene2Architecture";
import { Scene3Performance } from "./scenes/Scene3Performance";
import { Scene4Finale } from "./scenes/Scene4Finale";
import { defaultTitanXProps, TitanXProps } from "./types";

export const TitanShowcase: React.FC<TitanXProps> = (props) => {
  const mergedProps = { ...defaultTitanXProps, ...props };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", fontFamily: "system-ui, sans-serif" }}>
      {/* Continuous atmospheric background & particle field */}
      <Background
        accentColor={mergedProps.accentColor}
        goldAccent={mergedProps.goldAccent}
      />

      {/* Act 1: Atmospheric 3D Reveal (0s - 3.5s) */}
      <Sequence durationInFrames={210} name="Scene 1: Reveal">
        <Scene1Reveal {...mergedProps} />
      </Sequence>

      {/* Act 2: 3D Hardware Architecture (3.1s - 7.6s) */}
      <Sequence from={185} durationInFrames={275} name="Scene 2: Architecture">
        <Scene2Architecture {...mergedProps} />
      </Sequence>

      {/* Act 3: Hyper-Performance Metrics & Spline Curve (7.2s - 11.8s) */}
      <Sequence from={435} durationInFrames={275} name="Scene 3: Performance">
        <Scene3Performance {...mergedProps} />
      </Sequence>

      {/* Act 4: Grand Finale Outro (11.4s - 15.0s) */}
      <Sequence from={685} durationInFrames={215} name="Scene 4: Finale">
        <Scene4Finale {...mergedProps} />
      </Sequence>
    </AbsoluteFill>
  );
};
