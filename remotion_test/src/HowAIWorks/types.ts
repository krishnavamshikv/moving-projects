import { z } from "zod";

export const howAIWorksSchema = z.object({
  primaryColor: z.string().default("#00F0FF"), // Electric Cyan
  secondaryColor: z.string().default("#8B5CF6"), // Cyber Violet
  accentColor: z.string().default("#10B981"), // Neural Green
  highlightColor: z.string().default("#F59E0B"), // Amber Alert
  backgroundColor: z.string().default("#080A10"), // Deep Obsidian Void
});

export type HowAIWorksProps = z.infer<typeof howAIWorksSchema>;

export const defaultHowAIWorksProps: HowAIWorksProps = {
  primaryColor: "#00F0FF",
  secondaryColor: "#8B5CF6",
  accentColor: "#10B981",
  highlightColor: "#F59E0B",
  backgroundColor: "#080A10",
};

export interface TimedSubtitle {
  startFrame: number;
  endFrame: number;
  text: string;
  highlightWords?: string[];
}
