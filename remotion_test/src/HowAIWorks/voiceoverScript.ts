import { TimedSubtitle } from "./types";

export interface ScriptSection {
  id: number;
  chapter: string;
  timecode: string;
  startFrame: number;
  endFrame: number;
  durationSeconds: number;
  voScript: string;
  directorNotes: string;
}

export const VOICEOVER_SECTIONS: ScriptSection[] = [
  {
    id: 1,
    chapter: "01 // THE ILLUSION",
    timecode: "00:00 - 00:09",
    startFrame: 0,
    endFrame: 270,
    durationSeconds: 9.0,
    voScript:
      "You talk to AI like it's a thinking mind. But behind your screen, it isn't conscious. It's pure mathematics.",
    directorNotes:
      "Tone: Provocative hook, deliberate and clear. Emphasize 'thinking mind' and punch 'pure mathematics'.",
  },
  {
    id: 2,
    chapter: "02 // TOKENS & EMBEDDINGS",
    timecode: "00:09 - 00:19",
    startFrame: 270,
    endFrame: 570,
    durationSeconds: 10.0,
    voScript:
      "Computers can't read words. So AI chops text into tokens, mapping every single concept into coordinates in a massive number space.",
    directorNotes:
      "Tone: Explanatory and rapid. Emphasize 'tokens' and 'coordinates in a massive number space'.",
  },
  {
    id: 3,
    chapter: "03 // NEURAL ARCHITECTURE",
    timecode: "00:19 - 00:30",
    startFrame: 570,
    endFrame: 900,
    durationSeconds: 11.0,
    voScript:
      "These numbers race through neural networks—billions of simulated connections that multiply and weigh signals to detect hidden patterns.",
    directorNotes:
      "Tone: Energetic, building momentum. Stress 'billions of simulated connections' and 'hidden patterns'.",
  },
  {
    id: 4,
    chapter: "04 // TRAINING & LOSS",
    timecode: "00:30 - 00:41",
    startFrame: 900,
    endFrame: 1230,
    durationSeconds: 11.0,
    voScript:
      "How does it learn? Trillions of trials. Every mistake triggers gradient descent, adjusting billions of dials until errors drop to zero.",
    directorNotes:
      "Tone: Crisp question and confident resolution. Emphasize 'Trillions of trials', 'gradient descent', and 'zero'.",
  },
  {
    id: 5,
    chapter: "05 // PROBABILITY ENGINE",
    timecode: "00:41 - 00:51",
    startFrame: 1230,
    endFrame: 1530,
    durationSeconds: 10.0,
    voScript:
      "When generating answers, it doesn't search the web. It calculates probabilities, predicting the single most likely next token, word by word.",
    directorNotes:
      "Tone: Revelatory. Demystify the process. Emphasize 'probabilities' and 'word by word'.",
  },
  {
    id: 6,
    chapter: "06 // THE GEOMETRY OF MIND",
    timecode: "00:51 - 01:00",
    startFrame: 1530,
    endFrame: 1800,
    durationSeconds: 9.0,
    voScript:
      "AI isn't human intelligence. It's the geometry of human language, decoded through math. That's the real power of AI.",
    directorNotes:
      "Tone: Inspiring, climactic and memorable takeaway. Punch 'geometry of human language' and the final sentence.",
  },
];

export const TIMED_SUBTITLES: TimedSubtitle[] = [
  // Scene 1: 0 - 270
  {
    startFrame: 10,
    endFrame: 90,
    text: "You talk to AI like it's a thinking mind.",
    highlightWords: ["AI", "thinking", "mind"],
  },
  {
    startFrame: 95,
    endFrame: 180,
    text: "But behind your screen, it isn't conscious.",
    highlightWords: ["screen,", "isn't", "conscious."],
  },
  {
    startFrame: 185,
    endFrame: 265,
    text: "It is pure mathematics.",
    highlightWords: ["pure", "mathematics."],
  },

  // Scene 2: 270 - 570
  {
    startFrame: 275,
    endFrame: 360,
    text: "Computers cannot read words.",
    highlightWords: ["cannot", "read", "words."],
  },
  {
    startFrame: 365,
    endFrame: 465,
    text: "So AI chops text into TOKENS...",
    highlightWords: ["chops", "TOKENS..."],
  },
  {
    startFrame: 470,
    endFrame: 565,
    text: "Mapping concepts into a massive number space.",
    highlightWords: ["coordinates", "massive", "number", "space."],
  },

  // Scene 3: 570 - 900
  {
    startFrame: 575,
    endFrame: 675,
    text: "These numbers race through neural networks...",
    highlightWords: ["race", "neural", "networks..."],
  },
  {
    startFrame: 680,
    endFrame: 785,
    text: "Billions of simulated synapses and connections...",
    highlightWords: ["Billions", "synapses", "connections..."],
  },
  {
    startFrame: 790,
    endFrame: 895,
    text: "Multiplying signals to detect hidden patterns.",
    highlightWords: ["Multiplying", "hidden", "patterns."],
  },

  // Scene 4: 900 - 1230
  {
    startFrame: 905,
    endFrame: 985,
    text: "How does it learn? Trillions of trials.",
    highlightWords: ["learn?", "Trillions", "trials."],
  },
  {
    startFrame: 990,
    endFrame: 1105,
    text: "Every error triggers gradient descent...",
    highlightWords: ["error", "gradient", "descent..."],
  },
  {
    startFrame: 1110,
    endFrame: 1225,
    text: "Tuning billions of dials until error hits zero.",
    highlightWords: ["billions", "dials", "zero."],
  },

  // Scene 5: 1230 - 1530
  {
    startFrame: 1235,
    endFrame: 1320,
    text: "When responding, it does not search Google.",
    highlightWords: ["not", "search", "Google."],
  },
  {
    startFrame: 1325,
    endFrame: 1420,
    text: "It calculates mathematical probabilities...",
    highlightWords: ["calculates", "probabilities..."],
  },
  {
    startFrame: 1425,
    endFrame: 1525,
    text: "Predicting the next most likely token, word by word.",
    highlightWords: ["Predicting", "next", "token,", "word", "by", "word."],
  },

  // Scene 6: 1530 - 1800
  {
    startFrame: 1535,
    endFrame: 1620,
    text: "AI is not human intelligence.",
    highlightWords: ["not", "human", "intelligence."],
  },
  {
    startFrame: 1625,
    endFrame: 1715,
    text: "It is the GEOMETRY of human knowledge...",
    highlightWords: ["GEOMETRY", "human", "knowledge..."],
  },
  {
    startFrame: 1720,
    endFrame: 1795,
    text: "Decoded through mathematics.",
    highlightWords: ["Decoded", "mathematics."],
  },
];
