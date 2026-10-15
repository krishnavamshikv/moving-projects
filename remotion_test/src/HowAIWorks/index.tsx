import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BackgroundGrid } from "./components/BackgroundGrid";
import { Captions } from "./components/Captions";
import { HeaderHUD } from "./components/HeaderHUD";
import { ProgressBar } from "./components/ProgressBar";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Tokens } from "./scenes/Scene2Tokens";
import { Scene3NeuralNet } from "./scenes/Scene3NeuralNet";
import { Scene4Training } from "./scenes/Scene4Training";
import { Scene5Prediction } from "./scenes/Scene5Prediction";
import { Scene6Outro } from "./scenes/Scene6Outro";
import { defaultHowAIWorksProps, HowAIWorksProps } from "./types";

export const HowAIWorks: React.FC<HowAIWorksProps> = (props) => {
  const mergedProps = { ...defaultHowAIWorksProps, ...props };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: mergedProps.backgroundColor,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Constant Cybernetic Atmospheric Background */}
      <BackgroundGrid
        primaryColor={mergedProps.primaryColor}
        secondaryColor={mergedProps.secondaryColor}
      />

      {/* Global Persistent Header HUD & Audio Waveform Visualizer */}
      <HeaderHUD
        primaryColor={mergedProps.primaryColor}
        secondaryColor={mergedProps.secondaryColor}
      />

      {/* Top 60-Second Video Timeline Progress Bar */}
      <ProgressBar primaryColor={mergedProps.primaryColor} totalDurationSeconds={60} />

      {/* --- SCENE SEQUENCES (Total: 1800 frames / 60 seconds @ 30 FPS) --- */}

      {/* Act 1: The Illusion - Mind vs Math (0:00 - 0:09) */}
      <Sequence durationInFrames={270} name="01 - The Illusion">
        <Scene1Hook {...mergedProps} />
      </Sequence>

      {/* Act 2: Tokens & Vector Embeddings (0:09 - 0:19) */}
      <Sequence from={270} durationInFrames={300} name="02 - Tokens & Embeddings">
        <Scene2Tokens {...mergedProps} />
      </Sequence>

      {/* Act 3: Neural Network & Synaptic Weights (0:19 - 0:30) */}
      <Sequence from={570} durationInFrames={330} name="03 - Neural Network">
        <Scene3NeuralNet {...mergedProps} />
      </Sequence>

      {/* Act 4: Training & Gradient Descent (0:30 - 0:41) */}
      <Sequence from={900} durationInFrames={330} name="04 - Training & Loss">
        <Scene4Training {...mergedProps} />
      </Sequence>

      {/* Act 5: Next-Token Probability Engine (0:41 - 0:51) */}
      <Sequence from={1230} durationInFrames={300} name="05 - Next-Token Prediction">
        <Scene5Prediction {...mergedProps} />
      </Sequence>

      {/* Act 6: Language Geometry & Climax Outro (0:51 - 1:00) */}
      <Sequence from={1530} durationInFrames={270} name="06 - Geometry & Outro">
        <Scene6Outro {...mergedProps} />
      </Sequence>

      {/* Frame-accurate Kinetic Subtitles / VO Captions */}
      <Captions
        primaryColor={mergedProps.primaryColor}
        highlightColor={mergedProps.highlightColor}
      />

      {/* Synchronized Master Voiceover Audio */}
      <Audio src={staticFile("audio/voiceover_full.mp3")} volume={1} />
    </AbsoluteFill>
  );
};
