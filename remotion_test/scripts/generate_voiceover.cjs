const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const sections = [
  {
    id: 1,
    name: "scene1",
    text: "You talk to AI like it's a thinking mind. But behind your screen, it isn't conscious. It is pure mathematics.",
    startSec: 0.5,
  },
  {
    id: 2,
    name: "scene2",
    text: "Computers cannot read words. So AI chops text into tokens, mapping every single concept into coordinates in a massive number space.",
    startSec: 9.3,
  },
  {
    id: 3,
    name: "scene3",
    text: "These numbers race through neural networks—billions of simulated connections that multiply and weigh signals to detect hidden patterns.",
    startSec: 19.3,
  },
  {
    id: 4,
    name: "scene4",
    text: "How does it learn? Trillions of trials. Every mistake triggers gradient descent, adjusting billions of dials until errors drop to zero.",
    startSec: 30.3,
  },
  {
    id: 5,
    name: "scene5",
    text: "When generating answers, it doesn't search the web. It calculates probabilities, predicting the single most likely next token, word by word.",
    startSec: 41.3,
  },
  {
    id: 6,
    name: "scene6",
    text: "AI isn't human intelligence. It is the geometry of human knowledge, decoded through math. That's the real power of AI.",
    startSec: 51.3,
  },
];

async function main() {
  const publicAudioDir = path.resolve(__dirname, "../public/audio");
  const tempDir = path.resolve(__dirname, "../temp_audio");
  fs.mkdirSync(publicAudioDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const tts = new MsEdgeTTS();
  console.log("Setting up MsEdgeTTS with en-US-ChristopherNeural...");
  await tts.setMetadata(
    "en-US-ChristopherNeural",
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  );

  const generatedFiles = [];

  for (const sec of sections) {
    console.log(`Generating Audio for Section ${sec.id} (${sec.name})...`);
    const rawResult = await tts.toFile(tempDir, sec.text, {
      rate: "+5%", // Punchy pacing for short-form
      pitch: "+0Hz",
    });

    const targetFile = path.join(publicAudioDir, `${sec.name}.mp3`);
    fs.copyFileSync(rawResult.audioFilePath, targetFile);
    console.log(`Saved: ${targetFile}`);

    // Get duration of this clip using ffprobe
    const durationStr = execSync(
      `ffprobe -i "${targetFile}" -show_entries format=duration -v quiet -of csv="p=0"`
    )
      .toString()
      .trim();
    const duration = parseFloat(durationStr);
    console.log(`  Duration: ${duration.toFixed(2)}s`);

    generatedFiles.push({
      ...sec,
      filePath: targetFile,
      duration,
    });
  }

  // Create an aligned master 60s track using ffmpeg
  // Each audio starts at exactly sec.startSec
  console.log("Creating synchronized 60-second master track...");
  let filterInputs = "";
  let filterComplex = "";
  for (let i = 0; i < generatedFiles.length; i++) {
    filterInputs += ` -i "${generatedFiles[i].filePath}"`;
    const delayMs = Math.round(generatedFiles[i].startSec * 1000);
    filterComplex += `[${i}:a]adelay=${delayMs}|${delayMs}[a${i}];`;
  }
  const mixInputs = generatedFiles.map((_, i) => `[a${i}]`).join("");
  filterComplex += `${mixInputs}amix=inputs=${generatedFiles.length}:dropout_transition=0,volume=1.8[aout]`;

  const masterOut = path.join(publicAudioDir, "voiceover_full.mp3");
  const ffmpegCmd = `ffmpeg -y ${filterInputs} -filter_complex "${filterComplex}" -map "[aout]" -t 60 -b:a 192k "${masterOut}"`;
  execSync(ffmpegCmd);
  console.log(`Master voiceover created: ${masterOut}`);

  // Clean up temp
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("Done!");
}

main().catch((err) => {
  console.error("Error generating voiceover:", err);
  process.exit(1);
});
