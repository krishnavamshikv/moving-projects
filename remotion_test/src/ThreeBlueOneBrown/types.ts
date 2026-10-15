import { z } from "zod";

export const threeB1BSchema = z.object({
  backgroundColor: z.string().default("#16181F"), // 3B1B Matte Chalkboard
  blueColor: z.string().default("#58C4DD"), // 3B1B Signature Blue
  yellowColor: z.string().default("#FFFF00"), // 3B1B Math Yellow
  greenColor: z.string().default("#83C5BE"), // 3B1B Green
  pinkColor: z.string().default("#FF6B8B"), // 3B1B Pink
  chalkColor: z.string().default("#ECEFF4"), // Crisp Chalk White
});

export type ThreeB1BProps = z.infer<typeof threeB1BSchema>;

export const defaultThreeB1BProps: ThreeB1BProps = {
  backgroundColor: "#16181F",
  blueColor: "#58C4DD",
  yellowColor: "#FFFF00",
  greenColor: "#83C5BE",
  pinkColor: "#FF6B8B",
  chalkColor: "#ECEFF4",
};
