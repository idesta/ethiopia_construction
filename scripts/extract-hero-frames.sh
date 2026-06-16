#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# extract-hero-frames.sh
# ──────────────────────────────────────────────────────────────────────────
# Extracts evenly-spaced key frames from each motion video in
#   ~/Documents/Construction-Sites/Motion-NO-WATER-MARK/
# and converts them to lightweight WebP images suitable for the hero section.
#
# OUTPUT:  ./hero-frames/{video-name}/{frame-01..N}.webp
# UPLOAD:  Upload these WebP files via Admin → Company → Hero Scenes
#
# REQUIREMENTS: ffmpeg (with libwebp)
#   Install: sudo apt install ffmpeg
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SRC_DIR="$HOME/Documents/Construction-Sites/Motion-NO-WATER-MARK"
OUT_DIR="$(dirname "$0")/../hero-frames"

# ── Config ────────────────────────────────────────────────────────────────
FRAMES_PER_VIDEO=5        # frames per video (videos are ~4-5s, so 5 frames = ~1/s)
QUALITY=75                # WebP quality (80 = great, 60 = smaller/rougher)
MAX_WIDTH=600             # max width — keeps files tiny while looking good
OUTPUT_FORMAT="webp"      # "webp" or "png"

# ── Check prerequisites ───────────────────────────────────────────────────
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. Install it: sudo apt install ffmpeg"
  exit 1
fi

mkdir -p "$OUT_DIR"

# ── Process each video ────────────────────────────────────────────────────
VIDEOS=("$SRC_DIR"/*.mp4)
TOTAL=${#VIDEOS[@]}

if [ "$TOTAL" -eq 0 ]; then
  echo "No .mp4 files found in $SRC_DIR"
  exit 1
fi

echo "Found $TOTAL motion videos"
echo "Extracting $FRAMES_PER_VIDEO frames each → WebP (${MAX_WIDTH}px wide, quality ${QUALITY})"
echo "Output: $OUT_DIR"
echo "───────────────────────────────────────────────"

for VIDEO in "${VIDEOS[@]}"; do
  BASENAME=$(basename "$VIDEO" .mp4)
  FRAME_DIR="$OUT_DIR/$BASENAME"
  mkdir -p "$FRAME_DIR"

  # Clean up the label — strip common suffix patterns and tidy hyphens
  CLEAN_NAME=$(echo "$BASENAME" | sed 's/-motion-video//; s/-motion//; s/-\+/-/g; s/^-\+//; s/-\+$//')

  # Get video duration in seconds (as float)
  DURATION=$(ffprobe -v error -show_entries format=duration \
    -of csv=p=0 "$VIDEO" 2>/dev/null || echo "5.0")
  DURATION_INT=${DURATION%.*}

  echo "  [$CLEAN_NAME]  ${DURATION_INT}s → ${FRAMES_PER_VIDEO} frames"

  # Extract frames at evenly-spaced time offsets
  # We space them across [20%, 80%] of the video to avoid blank start/end frames
  for i in $(seq 0 $((FRAMES_PER_VIDEO - 1))); do
    # Linear interpolation from 20% to 80% of duration
    SEEK=$(echo "scale=3; $DURATION * (0.20 + 0.60 * $i / ($FRAMES_PER_VIDEO - 1))" | bc -l | sed 's/^\./0./')
    OUTFILE="$FRAME_DIR/$(printf "%s-%02d.%s" "$CLEAN_NAME" "$((i+1))" "$OUTPUT_FORMAT")"

    ffmpeg -y -v error -ss "$SEEK" -i "$VIDEO" \
      -vf "scale=${MAX_WIDTH}:-1:flags=lanczos" \
      -c:v libwebp -quality "$QUALITY" -preset picture \
      -frames:v 1 \
      "$OUTFILE"

    SIZE=$(stat --printf="%s" "$OUTFILE" 2>/dev/null || echo "0")
    SIZE_KB=$(( SIZE / 1024 ))
    echo "    → $(printf "%02d" $((i+1))): $(basename "$OUTFILE")  (${SIZE_KB}KB)"
  done

  echo ""
done

echo "═══════════════════════════════════════════════"
echo "✅ Done! $TOTAL videos → ${FRAMES_PER_VIDEO} frames each"
echo ""
echo "NEXT: Upload these WebP files via the admin panel:"
echo "  1. Go to Admin → Companies → [your company] → Hero Scenes"
echo "  2. Upload each WebP file"
echo "  3. They will automatically appear in the hero section"
echo ""
echo "TIP: If a frame doesn't look great, delete it from the admin"
echo "     and re-upload a different timestamp manually."
echo "═══════════════════════════════════════════════"
