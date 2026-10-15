# AI Influencer — Consistent Avatar (Image Generation Phase)

Fully open-source pipeline to build a **synthetic, consistent AI influencer** ("kruthika")
and generate stills of her on demand:
1. **Free text-to-image** — prompt like *"kruthika sitting in a car"* → same face **and** body.
2. **Reference reproduction** — give a reference photo → *how kruthika would look in that
   dress / pose / background*.

Identity is locked by training a **character LoRA on FLUX.1-dev**. Built for **ephemeral cloud
GPUs** (RunPod, 48GB) — nothing persists on the pod; `setup_runpod.sh` rebuilds everything each
rental, and you copy the trained LoRA off-pod to reuse it.

> Phase-2 (a 9:16 dance reel via AnimateDiff) is deferred — those workflows live in
> `workflows/ui/01–03` and are not part of the current image phase.

Full design & rationale: `~/.claude/plans/scalable-growing-dove.md`.

## Folder structure
```
assets/
  kruthika_closeup.jpeg        Real seed — close-up (InstantID face reference for wf 04)
  kruthika_fullbody.jpeg       Real seed — full body (drop straight into the dataset)
configs/
  bootstrap_prompts.md         Prompt + caption list to expand 1 seed -> 18-25 dataset images
  flux_lora_aitoolkit.yaml     FLUX.1-dev LoRA training config (AI-Toolkit, tuned for 48GB)
scripts/
  setup_runpod.sh              Bootstrap a fresh pod: ComfyUI + nodes + all models (SDXL + FLUX)
  train_lora_flux.sh           Train the FLUX LoRA -> models/loras/kruthika_flux.safetensors
  assemble.sh                  (phase-2) stitch dance segments -> 9:16 + music
workflows/                      Drag-drop (litegraph) workflows for the ComfyUI canvas
  04_dataset_bootstrap.ui.json   FLUX + PuLID: face ref -> many consistent shots (dataset)
  05_txt2img_avatar.ui.json      FLUX + kruthika LoRA: free-prompt avatar
  06_reference_reproduce.ui.json FLUX + LoRA + ControlNet(pose) + img2img: reference reproduction
  07_reference_facedetailer.ui.json FLUX + FaceDetailer + YOLO: 100% outfit & background preservation
  08_dance_reel_twopass.ui.json  SDXL + AnimateDiff + OpenPose + FaceDetailer: two-pass dance reel
  01-03_*.ui.json                Legacy / baseline pipeline modules
MODELS.md                        Every model: license, source, target folder
```

## Pipeline
```
assets/kruthika_closeup.jpeg
   │  [wf 04]  FLUX + PuLID + bootstrap_prompts.md  (face-locked, varied framing/outfits)
   ▼
18-25 curated images  ->  /workspace/dataset/kruthika/*.png (+ *.txt captions)   [FLAT folder]
   │  [train_lora_flux.sh]  AI-Toolkit, FLUX.1-dev, ~2000 steps
   ▼
models/loras/kruthika_flux.safetensors   ← locked identity
   ├─ [wf 05]  free prompt        -> "kruthika sitting in a car"
   └─ [wf 06]  reference + pose    -> "kruthika in that dress/pose/background"
```
Dataset gen and training both run on **FLUX.1-dev** — no domain gap, no cloud content filter.

## Run order (LoRA training)
See the numbered checklist you're following; in short:
1. **Rent a 48GB pod**, `export HF_TOKEN=hf_...` (accept the FLUX.1-dev license first), then
   `bash scripts/setup_runpod.sh`. Expose port 8188.
2. **Upload** `assets/kruthika_closeup.jpeg` + `kruthika_fullbody.jpeg` to `ComfyUI/input/`.
3. **Generate the dataset** — drag `workflows/ui/04_dataset_bootstrap.ui.json` onto the canvas,
   run each prompt from `configs/bootstrap_prompts.md`, curate ~18-25 keepers.
4. **Caption + stage** — one `.txt` per image (trigger + only what varies), put images + captions
   in `/workspace/dataset/kruthika/` (flat).
5. **Train** — `export HF_TOKEN=...; bash scripts/train_lora_flux.sh`. Output lands in
   `models/loras/kruthika_flux.safetensors`. **Copy it off-pod.**
6. **Use it** — drag `05` (free prompt) or `06` (reference reproduce); both already point at
   `kruthika_flux.safetensors`.

## FLUX gotchas (baked into wf 05/06)
- **KSampler cfg = 1.0 always** — strength lives in the **FluxGuidance** node (~3.5).
- **No real negative prompt** — the empty CLIPTextEncode is just a required stub.
- Uses **EmptySD3LatentImage** (16-channel), sampler **euler / simple**.
- wf 06: `SetUnionControlNetType` must read **openpose**; KSampler **denoise** (0.55–0.80) is the
  fidelity↔identity knob.

## Notes
- **Gated model:** FLUX.1-dev needs `HF_TOKEN` + license acceptance. `SKIP_FLUX=1` skips its
  ~35GB of downloads if you only need the SDXL bootstrap.
- **Node name drift:** if a workflow fails to load, run `comfyui-inventory` and match the node
  `class_type` to the installed version (expected once per major bump).
- **Licensing:** FLUX.1-dev is **non-commercial** (buy a BFL license before monetizing).
  InstantID/antelopev2 = research-only, face_yolov8m = AGPL — see `MODELS.md`. Publish with an
  "AI-generated" disclosure.
