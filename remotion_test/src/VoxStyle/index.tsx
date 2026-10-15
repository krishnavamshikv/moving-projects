import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { VoxBackground } from "./components/VoxBackground";
import { VoxSubtitles } from "./components/VoxSubtitles";
import { Scene1Vox } from "./scenes/Scene1Vox";
import { Scene2Vox } from "./scenes/Scene2Vox";
import { Scene3Vox } from "./scenes/Scene3Vox";
import { Scene4Vox } from "./scenes/Scene4Vox";
import { Scene5Vox } from "./scenes/Scene5Vox";
import { Scene6Vox } from "./scenes/Scene6Vox";
import { defaultVoxProps, VoxProps } from "./types";

export const HowAIWorksVox: React.FC<VoxProps> = (props) => {
  const mergedProps = { ...defaultVoxProps, ...props };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: mergedProps.paperColor,
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Archival Newspaper Background Texture & Header */}
      <VoxBackground paperColor={mergedProps.paperColor} />

      {/* Act 1: The Illusion (0:00 - 0:09) */}
      <Sequence durationInFrames={270} name="01 - Vox The Illusion">
        <Scene1Vox {...mergedProps} />
      </Sequence>

      {/* Act 2: Tokens & Embeddings (0:09 - 0:19) */}
      <Sequence from={270} durationInFrames={300} name="02 - Vox Tokens">
        <Scene2Vox {...mergedProps} />
      </Sequence>

      {/* Act 3: Neural Architecture (0:19 - 0:30) */}
      <Sequence from={570} durationInFrames={330} name="03 - Vox Neural Blueprint">
        <Scene3Vox {...mergedProps} />
      </Sequence>

      {/* Act 4: Training & Loss (0:30 - 0:41) */}
      <Sequence from={900} durationInFrames={330} name="04 - Vox Gradient Descent">
        <Scene4Vox {...mergedProps} />
      </Sequence>

      {/* Act 5: Next-Token Probability (0:41 - 0:51) */}
      <Sequence from={1230} durationInFrames={300} name="05 - Vox Autocomplete">
        <Scene5Vox {...mergedProps} />
      </Sequence>

      {/* Act 6: Outro (0:51 - 1:00) */}
      <Sequence from={1530} durationInFrames={270} name="06 - Vox Conclusion">
        <Scene6Vox {...mergedProps} />
      </Sequence>

      {/* Vox Editorial Highlighter Subtitles */}
      <VoxSubtitles highlightColor={mergedProps.highlightColor} />

      {/* Synchronized Master Voiceover Audio */}
      <Audio src={staticFile("audio/voiceover_full.mp3")} volume={1} />
    </AbsoluteFill>
  );
};
