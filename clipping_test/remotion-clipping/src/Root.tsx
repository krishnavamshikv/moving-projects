import React from "react";
import { Composition } from "remotion";
import { ViralClip } from "./ViralClip";
import { ViralClipProps } from "./types";

const defaultSampleWords = [
  { word: "THIS", startMs: 500, endMs: 850 },
  { word: "ONE", startMs: 850, endMs: 1100 },
  { word: "SECRET", startMs: 1100, endMs: 1600 },
  { word: "CHANGED", startMs: 1600, endMs: 2000 },
  { word: "EVERYTHING", startMs: 2000, endMs: 2600 },
  { word: "IN", startMs: 2600, endMs: 2800 },
  { word: "MY", startMs: 2800, endMs: 3100 },
  { word: "WORKFLOW", startMs: 3100, endMs: 3800 },
  { word: "COMPLETELY!", startMs: 3800, endMs: 4600 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ViralClip"
        component={ViralClip}
        durationInFrames={300} // Default 10s preview at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          hookTitle: "THE GAME CHANGER",
          hookSubtitle: "Watch what happens next 🚀",
          words: defaultSampleWords,
          accentColor: "#FFD700",
          showProgressBar: true,
          watermark: "@my_channel",
        } satisfies ViralClipProps}
      />
    </>
  );
};
