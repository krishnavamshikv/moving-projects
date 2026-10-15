import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ManimBackground } from "./components/ManimBackground";
import { ManimSubtitles } from "./components/ManimSubtitles";
import { Scene1_3B1B } from "./scenes/Scene1_3B1B";
import { Scene2_3B1B } from "./scenes/Scene2_3B1B";
import { Scene3_3B1B } from "./scenes/Scene3_3B1B";
import { Scene4_3B1B } from "./scenes/Scene4_3B1B";
import { Scene5_3B1B } from "./scenes/Scene5_3B1B";
import { Scene6_3B1B } from "./scenes/Scene6_3B1B";
import { defaultThreeB1BProps, ThreeB1BProps } from "./types";

export const HowAIWorks3B1B: React.FC<ThreeB1BProps> = (props) => {
  const mergedProps = { ...defaultThreeB1BProps, ...props };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: mergedProps.backgroundColor,
        fontFamily: "'CMU Serif', 'Computer Modern', 'Times New Roman', serif",
      }}
    >
      {/* Matte Chalkboard Background with Coordinate Grid */}
      <ManimBackground
        backgroundColor={mergedProps.backgroundColor}
        blueColor={mergedProps.blueColor}
      />

      {/* Act 1: The Illusion / Linear Algebra (0:00 - 0:09) */}
      <Sequence durationInFrames={270} name="01 - 3B1B Linear Algebra">
        <Scene1_3B1B {...mergedProps} />
      </Sequence>

      {/* Act 2: Words as Vectors in Rn (0:09 - 0:19) */}
      <Sequence from={270} durationInFrames={300} name="02 - 3B1B Vectors">
        <Scene2_3B1B {...mergedProps} />
      </Sequence>

      {/* Act 3: Layers of Synaptic Weights (0:19 - 0:30) */}
      <Sequence from={570} durationInFrames={330} name="03 - 3B1B Neural Layers">
        <Scene3_3B1B {...mergedProps} />
      </Sequence>

      {/* Act 4: Gradient Descent on Cost Surface (0:30 - 0:41) */}
      <Sequence from={900} durationInFrames={330} name="04 - 3B1B Gradient Descent">
        <Scene4_3B1B {...mergedProps} />
      </Sequence>

      {/* Act 5: Softmax & Probability (0:41 - 0:51) */}
      <Sequence from={1230} durationInFrames={300} name="05 - 3B1B Softmax">
        <Scene5_3B1B {...mergedProps} />
      </Sequence>

      {/* Act 6: Language Geometry & Conclusion (0:51 - 1:00) */}
      <Sequence from={1530} durationInFrames={270} name="06 - 3B1B Conclusion">
        <Scene6_3B1B {...mergedProps} />
      </Sequence>

      {/* Manim Mathematical Chalkboard Subtitles */}
      <ManimSubtitles
        blueColor={mergedProps.blueColor}
        yellowColor={mergedProps.yellowColor}
      />

      {/* Synchronized Master Voiceover Audio */}
      <Audio src={staticFile("audio/voiceover_full.mp3")} volume={1} />
    </AbsoluteFill>
  );
};
