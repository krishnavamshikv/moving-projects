# Models & Custom Nodes — all open source

Everything below is fetched by `scripts/setup_runpod.sh` into a fresh pod. No
proprietary or non-commercial weights (FLUX-dev, etc.) are used.

## Checkpoints & VAE
| Model | File | Folder | License | Source |
|-------|------|--------|---------|--------|
| RealVisXL V5.0 (SDXL) | `RealVisXL_V5.0_fp16.safetensors` → saved as `RealVisXL_V5.0.safetensors` | `models/checkpoints/` | CreativeML OpenRAIL++-M | `SG161222/RealVisXL_V5.0` |
| SDXL VAE fp16-fix | `sdxl_vae.safetensors` | `models/vae/` | MIT | `madebyollin/sdxl-vae-fp16-fix` |

## Motion (AnimateDiff)
| Model | File | Folder | License | Source |
|-------|------|--------|---------|--------|
| AnimateDiff SDXL beta | `mm_sdxl_v10_beta.ckpt` | `models/animatediff_models/` | Apache-2.0 | `guoyww/animatediff` |
| AnimateDiff SD1.5 v3 (fallback) | `v3_sd15_mm.ckpt` | `models/animatediff_models/` | Apache-2.0 | `guoyww/animatediff` |

## Pose control
| Model | File | Folder | License | Source |
|-------|------|--------|---------|--------|
| ControlNet OpenPose SDXL | `OpenPoseXL2.safetensors` | `models/controlnet/` | OpenRAIL | `thibaud/controlnet-openpose-sdxl-1.0` |
| DWPose detector | `yolox_l.onnx` | `custom_nodes/comfyui_controlnet_aux/ckpts/yzd-v/DWPose/` | Apache-2.0 | `yzd-v/DWPose` |
| DWPose keypoints | `dw-ll_ucoco_384.onnx` | `custom_nodes/comfyui_controlnet_aux/ckpts/yzd-v/DWPose/` | Apache-2.0 | `yzd-v/DWPose` |

## Identity (IP-Adapter + InstantID)
| Model | File | Folder | License | Source |
|-------|------|--------|---------|--------|
| IP-Adapter plus-face SDXL | `ip-adapter-plus-face_sdxl_vit-h.safetensors` | `models/ipadapter/` | Apache-2.0 | `h94/IP-Adapter` |
| CLIP-ViT-H-14 encoder | `CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` | `models/clip_vision/` | MIT | `h94/IP-Adapter` |
| InstantID IP-adapter | `ip-adapter.bin` | `models/instantid/` | Apache-2.0 | `InstantX/InstantID` |
| InstantID ControlNet | `instantid_controlnet.safetensors` | `models/controlnet/` | Apache-2.0 | `InstantX/InstantID` |
| InsightFace antelopev2 | `*.onnx` (5 files) | `models/insightface/models/antelopev2/` | non-commercial research* | `DIAMONIK7777/antelopev2` |

\* **InsightFace antelopev2 is research/non-commercial.** It is only used to
extract face embeddings while building the character sheet (Phase 1). If you
need a fully commercial-clean stack, drop InstantID and rely on **IP-Adapter
plus-face only** for identity — the pipeline still works, with slightly softer
face lock. See "Commercial-clean mode" below.

## Post-processing
| Model | File | Folder | License | Source |
|-------|------|--------|---------|--------|
| face_yolov8m detector | `face_yolov8m.pt` | `models/ultralytics/bbox/` | AGPL-3.0 | `Bingsu/adetailer` |
| SAM ViT-B (optional) | `sam_vit_b_01ec64.pth` | `models/sams/` | Apache-2.0 | `ybelkada/segment-anything` |
| RIFE interpolation | auto-downloaded by ComfyUI-Frame-Interpolation on first run | — | MIT | Fannovel16 |
| 4x-UltraSharp upscaler | `4x-UltraSharp.pth` | `models/upscale_models/` | OSS (community) | `Kim2091/UltraSharp` |

## Custom nodes (git)
`ComfyUI-Manager`, `ComfyUI-AnimateDiff-Evolved`, `ComfyUI-Advanced-ControlNet`,
`ComfyUI-VideoHelperSuite`, `comfyui_controlnet_aux`, `ComfyUI_IPAdapter_plus`,
`ComfyUI_InstantID`, `ComfyUI-Impact-Pack`, `ComfyUI-Impact-Subpack`,
`ComfyUI-Frame-Interpolation`, `ComfyUI_UltimateSDUpscale`.

## Commercial-clean mode
For monetized/commercial reels, prefer this subset and skip AGPL/research items:
- Keep: RealVisXL, SDXL VAE, AnimateDiff, OpenPoseXL2, IP-Adapter plus-face, CLIP-ViT-H, DWPose, RIFE, 4x-UltraSharp.
- Drop: InstantID + antelopev2 (research), face_yolov8m (AGPL — use a different bbox detector or skip FaceDetailer).
- Note: RealVisXL is OpenRAIL++-M (use-based restrictions, commercial-OK). Verify each license against your use before publishing.
