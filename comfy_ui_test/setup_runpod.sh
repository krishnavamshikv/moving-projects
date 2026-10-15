#!/usr/bin/env bash
# =============================================================================
# setup_runpod.sh — idempotent bootstrap for a FRESH, EPHEMERAL cloud GPU pod
# Builds a complete ComfyUI install for the AI-influencer dance-reel pipeline.
# All models are OPEN SOURCE. Re-runnable: existing repos/files are skipped.
#
# Usage:
#   bash setup_runpod.sh            # full build + launch ComfyUI
#   NO_LAUNCH=1 bash setup_runpod.sh   # build only, don't start server
#   COMFY_DIR=/workspace/ComfyUI bash setup_runpod.sh
#
# Optional env:
#   HF_TOKEN   HuggingFace token (only needed if you hit gated/limited files)
#   CIVITAI_TOKEN  token for civitai.com downloads (upscaler)
# =============================================================================
set -euo pipefail

# ---- Paths -------------------------------------------------------------------
BASE_DIR="${BASE_DIR:-/workspace}"
[ -d "$BASE_DIR" ] || BASE_DIR="$HOME"
COMFY_DIR="${COMFY_DIR:-$BASE_DIR/runpod-slim/ComfyUI}"
PORT="${PORT:-8188}"
export HF_HOME="${HF_HOME:-$BASE_DIR/.hf}"   # keep HF cache on the big pod disk

log()  { printf '\033[1;36m[setup]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n'  "$*"; }

# ---- Interpreter: pods often ship python3 but no `python` --------------------
PYTHON="${PYTHON:-$(command -v python || command -v python3 || true)}"
[ -n "$PYTHON" ] || { echo "No python/python3 on PATH"; exit 1; }
PIP() { "$PYTHON" -m pip "$@"; }
log "using interpreter: $PYTHON ($("$PYTHON" --version 2>&1))"

# ---- Download helper: skip if file already exists ----------------------------
# dl <url> <dest_path>
dl() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -f "$dest" ] && [ "$(stat -c%s "$dest" 2>/dev/null || echo 0)" -gt 100000 ]; then
    log "exists, skip: $(basename "$dest")"; return 0
  fi
  log "download: $(basename "$dest")"

  # HuggingFace files -> use huggingface_hub (handles CDN redirect, resume, auth).
  if [[ "$url" =~ ^https://huggingface\.co/(.+)/resolve/([^/]+)/(.+)$ ]]; then
    local repo="${BASH_REMATCH[1]}" rev="${BASH_REMATCH[2]}" path="${BASH_REMATCH[3]}"
    if "$PYTHON" - "$repo" "$rev" "$path" "$dest" "$HF_HOME" <<'PY'
import sys, os, shutil
from huggingface_hub import hf_hub_download
repo, rev, path, dest, hf_home = sys.argv[1:6]
scratch = os.path.join(hf_home, "dl_tmp")
os.makedirs(scratch, exist_ok=True)
# Download the real file into scratch (same filesystem as dest), then move — no 2x cache copy.
p = hf_hub_download(repo_id=repo, filename=path, revision=rev, local_dir=scratch)
os.makedirs(os.path.dirname(dest), exist_ok=True)
shutil.move(p, dest)
print("ok")
PY
    then return 0; else warn "HF download failed: $repo/$path"; rm -f "$dest"; return 1; fi
  fi

  # Everything else (civitai, etc.) -> curl with retries + real error surfaced.
  [[ "$url" == *"civitai.com"* && -n "${CIVITAI_TOKEN:-}" ]] && url="${url}?token=${CIVITAI_TOKEN}"
  if ! curl -fL --retry 4 --retry-delay 3 -C - -o "$dest" "$url"; then
    warn "FAILED (curl): $url"; rm -f "$dest"; return 1
  fi
}

# ---- Git clone helper: pull if present, clone if not -------------------------
# clone_node <git_url>
clone_node() {
  local url="$1" name; name="$(basename "$url" .git)"
  local dir="$COMFY_DIR/custom_nodes/$name"
  if [ -d "$dir/.git" ]; then
    log "node up-to-date: $name"; git -C "$dir" pull --ff-only -q || true
  else
    log "clone node: $name"; git clone --depth 1 -q "$url" "$dir"
  fi
  if [ -f "$dir/requirements.txt" ]; then
    PIP install -q -r "$dir/requirements.txt" || warn "reqs failed for $name (continuing)"
  fi
}

# =============================================================================
# 1. ComfyUI core
# =============================================================================
if [ ! -d "$COMFY_DIR/.git" ]; then
  log "cloning ComfyUI into $COMFY_DIR"
  git clone --depth 1 -q https://github.com/comfyanonymous/ComfyUI "$COMFY_DIR"
else
  # Only pull if this branch has an upstream (pod templates often ship a detached/untracked copy)
  if git -C "$COMFY_DIR" rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1; then
    log "ComfyUI present, pulling"; git -C "$COMFY_DIR" pull --ff-only -q || true
  else
    log "ComfyUI present (no upstream tracking) — using as-is"
  fi
fi

log "installing python deps (torch is preinstalled on most GPU pods)"
PIP install -q --upgrade pip || warn "pip self-upgrade skipped"
PIP install -q -r "$COMFY_DIR/requirements.txt"
# huggingface_hub gives us a faster/resumable downloader if present
PIP install -q "huggingface_hub[cli]" || true

# =============================================================================
# 2. Custom nodes
# =============================================================================
clone_node https://github.com/ltdrdata/ComfyUI-Manager
clone_node https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
clone_node https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet
clone_node https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
clone_node https://github.com/Fannovel16/comfyui_controlnet_aux
clone_node https://github.com/cubiq/ComfyUI_IPAdapter_plus
clone_node https://github.com/cubiq/ComfyUI_InstantID
clone_node https://github.com/ltdrdata/ComfyUI-Impact-Pack
clone_node https://github.com/ltdrdata/ComfyUI-Impact-Subpack
clone_node https://github.com/Fannovel16/ComfyUI-Frame-Interpolation
clone_node https://github.com/ssitu/ComfyUI_UltimateSDUpscale
clone_node https://github.com/pythongosssss/ComfyUI-WD14-Tagger   # auto-caption the LoRA dataset
clone_node https://github.com/sipie800/ComfyUI-PuLID-Flux-Enhanced   # FLUX face-lock for dataset gen (wf 04)

# =============================================================================
# 3. Models  (all open source — see MODELS.md for licenses/sources)
# =============================================================================
M="$COMFY_DIR/models"
HF="https://huggingface.co"

# --- SDXL base checkpoint: RealVisXL V5.0 (photoreal, OSS) --------------------
dl "$HF/SG161222/RealVisXL_V5.0/resolve/main/RealVisXL_V5.0_fp16.safetensors" \
   "$M/checkpoints/RealVisXL_V5.0.safetensors"

# --- SDXL VAE (fp16-fix) -----------------------------------------------------
dl "$HF/madebyollin/sdxl-vae-fp16-fix/resolve/main/sdxl_vae.safetensors" \
   "$M/vae/sdxl_vae.safetensors"

# --- AnimateDiff SDXL motion module ------------------------------------------
dl "$HF/guoyww/animatediff/resolve/main/mm_sdxl_v10_beta.ckpt" \
   "$M/animatediff_models/mm_sdxl_v10_beta.ckpt"
# SD1.5 fallback motion module (used only if we drop to the SD1.5 pipeline)
dl "$HF/guoyww/animatediff/resolve/main/v3_sd15_mm.ckpt" \
   "$M/animatediff_models/v3_sd15_mm.ckpt"

# --- ControlNet OpenPose for SDXL --------------------------------------------
dl "$HF/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors" \
   "$M/controlnet/OpenPoseXL2.safetensors"

# --- IP-Adapter (SDXL, plus-face + general) + CLIP vision encoder ------------
dl "$HF/h94/IP-Adapter/resolve/main/sdxl_models/ip-adapter-plus-face_sdxl_vit-h.safetensors" \
   "$M/ipadapter/ip-adapter-plus-face_sdxl_vit-h.safetensors"
# General plus adapter (whole look/outfit, not face-only) — powers the "PLUS (high strength)" preset
dl "$HF/h94/IP-Adapter/resolve/main/sdxl_models/ip-adapter-plus_sdxl_vit-h.safetensors" \
   "$M/ipadapter/ip-adapter-plus_sdxl_vit-h.safetensors"
dl "$HF/h94/IP-Adapter/resolve/main/models/image_encoder/model.safetensors" \
   "$M/clip_vision/CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"

# --- InstantID (identity lock for the character sheet) -----------------------
dl "$HF/InstantX/InstantID/resolve/main/ip-adapter.bin" \
   "$M/instantid/ip-adapter.bin"
dl "$HF/InstantX/InstantID/resolve/main/ControlNetModel/diffusion_pytorch_model.safetensors" \
   "$M/controlnet/instantid_controlnet.safetensors"
# InsightFace antelopev2 (required by InstantID)
dl "$HF/DIAMONIK7777/antelopev2/resolve/main/1k3d68.onnx"        "$M/insightface/models/antelopev2/1k3d68.onnx"
dl "$HF/DIAMONIK7777/antelopev2/resolve/main/2d106det.onnx"      "$M/insightface/models/antelopev2/2d106det.onnx"
dl "$HF/DIAMONIK7777/antelopev2/resolve/main/genderage.onnx"     "$M/insightface/models/antelopev2/genderage.onnx"
dl "$HF/DIAMONIK7777/antelopev2/resolve/main/glintr100.onnx"     "$M/insightface/models/antelopev2/glintr100.onnx"
dl "$HF/DIAMONIK7777/antelopev2/resolve/main/scrfd_10g_bnkps.onnx" "$M/insightface/models/antelopev2/scrfd_10g_bnkps.onnx"

# --- DWPose preprocessor weights (for comfyui_controlnet_aux) ----------------
AUX_CKPT="$COMFY_DIR/custom_nodes/comfyui_controlnet_aux/ckpts"
dl "$HF/yzd-v/DWPose/resolve/main/yolox_l.onnx"          "$AUX_CKPT/yzd-v/DWPose/yolox_l.onnx"
dl "$HF/yzd-v/DWPose/resolve/main/dw-ll_ucoco_384.onnx"  "$AUX_CKPT/yzd-v/DWPose/dw-ll_ucoco_384.onnx"

# --- FaceDetailer face detector (Impact/Subpack) -----------------------------
dl "$HF/Bingsu/adetailer/resolve/main/face_yolov8m.pt" \
   "$M/ultralytics/bbox/face_yolov8m.pt"
dl "$HF/ybelkada/segment-anything/resolve/main/checkpoints/sam_vit_b_01ec64.pth" \
   "$M/sams/sam_vit_b_01ec64.pth" || true

# --- Upscaler: 4x-UltraSharp (OSS, HF mirror) --------------------------------
dl "$HF/Kim2091/UltraSharp/resolve/main/4x-UltraSharp.pth" \
   "$M/upscale_models/4x-UltraSharp.pth" || \
warn "Upscaler download failed — optional, skip or fetch 4x-UltraSharp manually."

# =============================================================================
# 3-FLUX. FLUX.1-dev — character LoRA base + inference (wf 05/06) --------------
#   GATED: accept the license at https://huggingface.co/black-forest-labs/FLUX.1-dev
#   and `export HF_TOKEN=hf_...` before running, or the dev + VAE files will 403.
# =============================================================================
if [ "${SKIP_FLUX:-0}" = "1" ]; then
  log "SKIP_FLUX=1 — skipping FLUX downloads (~35GB)."
else
  [ -n "${HF_TOKEN:-}" ] || warn "HF_TOKEN not set — FLUX.1-dev is gated and will fail to download."
  # Transformer (the actual image model) -> models/unet (UNETLoader / Load Diffusion Model)
  dl "$HF/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors" \
     "$M/unet/flux1-dev.safetensors" \
    || warn "FLUX dev download failed — set HF_TOKEN and accept the license (gated repo)."
  # FLUX VAE (its own autoencoder, NOT the SDXL one)
  dl "$HF/black-forest-labs/FLUX.1-dev/resolve/main/ae.safetensors" \
     "$M/vae/ae.safetensors" \
    || warn "FLUX VAE download failed — gated, needs HF_TOKEN + license acceptance."
  # Text encoders (ungated mirror) — CLIP-L + T5-XXL
  dl "$HF/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors" \
     "$M/clip/clip_l.safetensors"
  dl "$HF/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp16.safetensors" \
     "$M/clip/t5xxl_fp16.safetensors"
  # FLUX ControlNet Union Pro (pose/depth/canny in one) — powers wf06 pose reproduction
  dl "$HF/Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro/resolve/main/diffusion_pytorch_model.safetensors" \
     "$M/controlnet/flux_controlnet_union_pro.safetensors" \
    || warn "FLUX ControlNet Union download failed — wf06 pose control needs it."
  # PuLID-Flux identity weights — face-consistent dataset generation (wf 04).
  # (EVA-CLIP + facexlib weights auto-download on first node run; antelopev2 already fetched above.)
  dl "$HF/guozinan/PuLID/resolve/main/pulid_flux_v0.9.1.safetensors" \
     "$M/pulid/pulid_flux_v0.9.1.safetensors" \
    || warn "PuLID-Flux weights download failed — wf 04 dataset gen needs it."
fi

log "model + node install complete."

# =============================================================================
# 3b. LoRA trainer — AI-Toolkit (FLUX.1-dev). Cloned only; train_lora_flux.sh
#     installs its deps into an isolated venv so they can't downgrade ComfyUI.
# =============================================================================
AITOOLKIT="${AITOOLKIT:-$BASE_DIR/ai-toolkit}"
if [ -d "$AITOOLKIT/.git" ]; then
  log "ai-toolkit present: $AITOOLKIT"
  git -C "$AITOOLKIT" pull --ff-only -q || true
  git -C "$AITOOLKIT" submodule update --init --recursive -q || true
else
  log "clone ai-toolkit (FLUX LoRA trainer) into $AITOOLKIT"
  git clone --depth 1 -q https://github.com/ostris/ai-toolkit "$AITOOLKIT"
  git -C "$AITOOLKIT" submodule update --init --recursive -q || true
fi

# =============================================================================
# 4. Launch
# =============================================================================
if [ "${NO_LAUNCH:-0}" = "1" ]; then
  log "NO_LAUNCH=1 set — build finished, not starting server."
  log "To start:  $PYTHON $COMFY_DIR/main.py --listen 0.0.0.0 --port $PORT"
  exit 0
fi

log "starting ComfyUI on 0.0.0.0:$PORT  (expose/tunnel this port, then set COMFYUI_URL)"
cd "$COMFY_DIR"
exec "$PYTHON" main.py --listen 0.0.0.0 --port "$PORT"
