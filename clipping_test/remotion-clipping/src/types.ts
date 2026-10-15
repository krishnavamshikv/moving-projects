export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
  highlight?: boolean;
}

export interface ViralClipProps {
  videoSrc?: string;
  hookTitle?: string;
  hookSubtitle?: string;
  words?: WordTiming[];
  accentColor?: string;
  showProgressBar?: boolean;
  watermark?: string;
}
