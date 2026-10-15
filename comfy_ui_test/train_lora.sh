#!/usr/bin/env bash
# =============================================================================
# train_lora_flux.sh — train the FLUX.1-dev character LoRA (kruthika) with
# ostris/ai-toolkit on a fresh ephemeral pod. Uses an isolated
# --system-site-packages venv so training deps can't downgrade ComfyUI's torch.
#
# Prereqs:
#   - setup_runpod.sh already run (ai-toolkit cloned; FLUX files downloaded).
#   - HF_TOKEN exported AND the FLUX.1-dev license accepted on HuggingFace
#     (https://huggingface.co/black-forest-labs/FLUX.1-dev) — the trainer pulls
#     the full model from HF by name.
#
# Dataset layout (FLAT — AI-Toolkit does NOT use Kohya repeat-folders):
#   /workspace/dataset/kruthika/*.png  (+ matching *.txt captions)
#
# Usage:
#   export HF_TOKEN=hf_xxx
#   bash scripts/train_lora_flux.sh
#   DATASET=/workspace/dataset/kruthika bash scripts/train_lora_flux.sh
# =============================================================================
set -euo pipefail

log()  { printf '\033[1;36m[train-flux]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n'  "$*"; }
die()  { printf '\033[1;31m[err]\033[0m %s\n'   "$*"; exit 1; }

# ---- Paths -------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
BASE_DIR="${BASE_DIR:-/workspace}"
[ -d "$BASE_DIR" ] || BASE_DIR="$HOME"

COMFY_DIR="${COMFY_DIR:-$BASE_DIR/runpod-slim/ComfyUI}"
AITOOLKIT="${AITOOLKIT:-$BASE_DIR/ai-toolkit}"
CONFIG="${CONFIG:-$REPO_DIR/configs/flux_lora_aitoolkit.yaml}"
DATASET="${DATASET:-$BASE_DIR/dataset/kruthika}"
VENV="${VENV:-$BASE_DIR/.venv-train-flux}"
TRAIN_OUT="${TRAIN_OUT:-$BASE_DIR/output}"          # matches training_folder in the yaml
OUT_DIR="$COMFY_DIR/models/loras"
export HF_HOME="${HF_HOME:-$BASE_DIR/.hf}"          # keep the ~24GB HF cache on the big disk

PYTHON="${PYTHON:-$(command -v python || command -v python3 || true)}"
[ -n "$PYTHON" ] || die "No python/python3 on PATH"

# ---- Sanity checks -----------------------------------------------------------
[ -d "$AITOOLKIT/.git" ] || die "ai-toolkit not found at $AITOOLKIT (run setup_runpod.sh first)"
[ -f "$CONFIG" ]         || die "config not found: $CONFIG"
[ -n "${HF_TOKEN:-}" ]   || warn "HF_TOKEN not set — FLUX.1-dev is gated; training will fail to fetch the base model."

[ -d "$DATASET" ] || die "Dataset folder not found: $DATASET"
IMG_COUNT=$(find "$DATASET" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) | wc -l)
CAP_COUNT=$(find "$DATASET" -maxdepth 1 -type f -iname '*.txt' | wc -l)
if [ "$IMG_COUNT" -eq 0 ]; then
  die "No images under $DATASET
     Expected a FLAT folder: $DATASET/*.png (+ matching *.txt captions).
     (AI-Toolkit does NOT use Kohya '20_kruthika' repeat-folders.)"
fi
log "dataset: $IMG_COUNT images, $CAP_COUNT captions in $DATASET"
[ "$IMG_COUNT" -ge 10 ] || warn "only $IMG_COUNT images — 15-25 recommended for a stable identity"
[ "$CAP_COUNT" -ge 1 ]  || warn "no .txt captions found — every image will use just the trigger word"

# ---- Isolated training venv (reuses pod torch, adds ai-toolkit deps) ---------
if [ ! -d "$VENV" ]; then
  log "creating training venv (system-site-packages) at $VENV"
  "$PYTHON" -m venv --system-site-packages "$VENV"
fi
# shellcheck disable=SC1091
source "$VENV/bin/activate"

log "installing ai-toolkit deps into the isolated venv"
pip install -q --upgrade pip || warn "pip self-upgrade skipped"
# Install from INSIDE the ai-toolkit dir so its relative "-r requirements_base.txt"
# include resolves. Any torch reinstall is contained to this venv (ComfyUI is untouched).
( cd "$AITOOLKIT" && pip install -q -r requirements.txt ) \
  || warn "ai-toolkit reqs install had issues — check the log above"

# ---- Train -------------------------------------------------------------------
mkdir -p "$TRAIN_OUT" "$OUT_DIR"
log "starting FLUX.1-dev LoRA training  (config: $CONFIG)"
log "base model streams from HF into $HF_HOME on first run (~24GB)"
cd "$AITOOLKIT"
"$PYTHON" run.py "$CONFIG"

# ---- Publish the finished LoRA into ComfyUI ----------------------------------
# ai-toolkit writes: $TRAIN_OUT/kruthika_flux/kruthika_flux.safetensors (+ step checkpoints)
FINAL="$TRAIN_OUT/kruthika_flux/kruthika_flux.safetensors"
if [ -f "$FINAL" ]; then
  cp -f "$FINAL" "$OUT_DIR/kruthika_flux.safetensors"
  log "installed -> $OUT_DIR/kruthika_flux.safetensors"
else
  warn "final LoRA not found at $FINAL — picking the latest checkpoint instead"
  LATEST=$(ls -t "$TRAIN_OUT/kruthika_flux/"*.safetensors 2>/dev/null | head -1 || true)
  [ -n "$LATEST" ] && cp -f "$LATEST" "$OUT_DIR/kruthika_flux.safetensors" \
    && log "installed latest checkpoint -> $OUT_DIR/kruthika_flux.safetensors" \
    || warn "no .safetensors produced — check the training log above"
fi

log "Step checkpoints (compare + pick best) are in: $TRAIN_OUT/kruthika_flux/"
log "Copy kruthika_flux.safetensors OFF-pod to reuse next rental (no persistent storage)."
log "Drop it into workflow 05/06 LoraLoader on the canvas."
