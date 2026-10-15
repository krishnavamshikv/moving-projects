#!/usr/bin/env bash
# =============================================================================
# assemble.sh — stitch validated dance segments into a final 9:16 reel + music
# Runs LOCALLY (needs ffmpeg). Concatenates clips, crops to vertical 1080x1920,
# muxes the reference video's audio, normalizes loudness, exports H.264.
#
# Usage:
#   scripts/assemble.sh <segments_dir> <reference_audio_or_video> [out.mp4]
# Example:
#   scripts/assemble.sh projects/reel01/02_validated projects/reel01/reference_dance.mp4 \
#                       projects/reel01/04_final/reel_v1.mp4
#
# Segments are concatenated in natural sort order of *.mp4 in <segments_dir>.
# =============================================================================
set -euo pipefail

SEG_DIR="${1:?segments dir required}"
REF_AUDIO="${2:?reference audio/video required (its audio track is used)}"
OUT="${3:-reel_final.mp4}"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install: sudo apt install ffmpeg"; exit 1; }
mkdir -p "$(dirname "$OUT")"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
LIST="$TMP/list.txt"; : > "$LIST"

# Build concat list in natural order
shopt -s nullglob
mapfile -t CLIPS < <(printf '%s\n' "$SEG_DIR"/*.mp4 | sort -V)
[ "${#CLIPS[@]}" -gt 0 ] || { echo "No .mp4 segments in $SEG_DIR"; exit 1; }
echo "Segments (${#CLIPS[@]}):"; printf '  %s\n' "${CLIPS[@]}"
for c in "${CLIPS[@]}"; do echo "file '$(readlink -f "$c")'" >> "$LIST"; done

# 1) Concatenate + normalize every segment to vertical 1080x1920 (re-encode for safety)
echo "[1/3] concat + crop to 9:16 ..."
ffmpeg -y -f concat -safe 0 -i "$LIST" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
  -r 30 -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -an \
  "$TMP/video_only.mp4"

# 2) Mux the reference music, trimmed to the video length
echo "[2/3] mux reference audio ..."
ffmpeg -y -i "$TMP/video_only.mp4" -i "$REF_AUDIO" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  "$TMP/with_audio.mp4"

# 3) Loudness normalize -> final
echo "[3/3] loudnorm -> $OUT"
ffmpeg -y -i "$TMP/with_audio.mp4" -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -c:v copy -c:a aac -b:a 192k "$OUT"

echo "Done: $OUT"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate \
  -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1 "$OUT" 2>/dev/null || true
