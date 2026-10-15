#!/usr/bin/env node
/**
 * Automated Remotion CLI Renderer for DaVinci Resolve Clipping Pipeline
 *
 * Usage:
 *   node render.mjs --input clip_meta.json --output out/final_viral_clip.mp4
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
let inputJsonPath = null;
let outputPath = "out/final_viral_clip.mp4";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--input" && args[i + 1]) {
    inputJsonPath = args[i + 1];
    i++;
  } else if (args[i] === "--output" && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  }
}

let props = {};
if (inputJsonPath && fs.existsSync(inputJsonPath)) {
  props = JSON.parse(fs.readFileSync(inputJsonPath, "utf8"));
  console.log(`Loaded props from: ${inputJsonPath}`);
} else {
  console.log("No input JSON specified, using default props.");
}

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const propsJsonString = JSON.stringify(props);

console.log(`Rendering 9:16 vertical viral clip to: ${outputPath}`);
const remotionArgs = [
  "remotion",
  "render",
  "src/index.ts",
  "ViralClip",
  outputPath,
  `--props=${propsJsonString}`,
];

const child = spawn("npx", remotionArgs, {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  if (code === 0) {
    console.log(`\n✅ Render completed successfully: ${outputPath}`);
  } else {
    console.error(`\n❌ Render failed with exit code: ${code}`);
    process.exit(code || 1);
  }
});
