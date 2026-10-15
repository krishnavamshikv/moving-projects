import { z } from "zod";

export const voxSchema = z.object({
  highlightColor: z.string().default("#FFE600"), // Iconic Vox Yellow
  accentRed: z.string().default("#E53935"), // Red marker ink
  paperColor: z.string().default("#F6F3EB"), // Warm archival newsprint
  inkColor: z.string().default("#18181A"), // Newsprint ink
  darkCardColor: z.string().default("#1F2128"), // Dark card
});

export type VoxProps = z.infer<typeof voxSchema>;

export const defaultVoxProps: VoxProps = {
  highlightColor: "#FFE600",
  accentRed: "#E53935",
  paperColor: "#F6F3EB",
  inkColor: "#18181A",
  darkCardColor: "#1F2128",
};
