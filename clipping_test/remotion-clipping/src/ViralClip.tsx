import React from "react";
import { AbsoluteFill, OffthreadVideo } from "remotion";
import { HookTitle } from "./HookTitle";
import { KineticCaptions } from "./KineticCaptions";
import { ProgressBar } from "./ProgressBar";
import { ViralClipProps } from "./types";

export const ViralClip: React.FC<ViralClipProps> = ({
  videoSrc,
  hookTitle = "VIRAL MOMENT OF THE DAY",
  hookSubtitle = "Watch till the end 🔥",
  words = [],
  accentColor = "#FFD700",
  showProgressBar = true,
  watermark = "@clipping_channel",
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Background 9:16 Video (Rendered from DaVinci Resolve) */}
      {videoSrc ? (
        <OffthreadVideo
          src={videoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at center, #1e1e2f 0%, #0d0d15 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 36,
              fontFamily: "sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            [ 9:16 Video Canvas Placeholder ]
          </div>
        </AbsoluteFill>
      )}

      {/* Top Hook Title Card (First 3s) */}
      {hookTitle && (
        <HookTitle
          title={hookTitle}
          subtitle={hookSubtitle}
          accentColor={accentColor}
          durationInFrames={90}
        />
      )}

      {/* Word-by-word Kinetic Captions */}
      {words && words.length > 0 && (
        <KineticCaptions words={words} accentColor={accentColor} />
      )}

      {/* Subtle Brand Watermark */}
      {watermark && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.4)",
            letterSpacing: "0.05em",
            textTransform: "lowercase",
            zIndex: 40,
          }}
        >
          {watermark}
        </div>
      )}

      {/* Bottom Retention Progress Bar */}
      {showProgressBar && <ProgressBar color={accentColor} height={8} />}
    </AbsoluteFill>
  );
};
