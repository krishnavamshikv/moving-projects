import { z } from "zod";

export const titanXSchema = z.object({
  productName: z.string(),
  productTagline: z.string(),
  coreCount: z.number(),
  neuralEngineOps: z.string(),
  latencyMs: z.number(),
  efficiencyGain: z.string(),
  accentColor: z.string(),
  goldAccent: z.string(),
});

export type TitanXProps = z.infer<typeof titanXSchema>;

export const defaultTitanXProps: TitanXProps = {
  productName: "TITAN X",
  productTagline: "Pro Performance. Redefined.",
  coreCount: 128,
  neuralEngineOps: "450 TOPS",
  latencyMs: 0.18,
  efficiencyGain: "12.4x",
  accentColor: "#E2E8F0",
  goldAccent: "#F59E0B",
};
