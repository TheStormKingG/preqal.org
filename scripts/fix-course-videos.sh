#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Remove the NotebookLM watermark from all 9 e-course videos and re-upload.
#
# - Downloads each video from the public ecourse-videos bucket
# - ffmpeg `delogo` interpolates away the watermark region (bottom-right,
#   1280x720 sources) — no cropping, no content loss
# - Re-encodes with the M1 hardware encoder (h264_videotoolbox), audio copied
# - Re-uploads in place (x-upsert) using SUPABASE_SERVICE_KEY from .env.secrets
#
# Usage:  nohup bash scripts/fix-course-videos.sh > /tmp/videofix.log 2>&1 &
# ─────────────────────────────────────────────────────────────────────────────
set -u
export PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH

REPO="$(cd "$(dirname "$0")/.." && pwd)"
source "$REPO/.env.secrets"

BASE="https://gndcjmxxgtnoidxgcdnx.supabase.co"
BUCKET_PUB="$BASE/storage/v1/object/public/ecourse-videos"
BUCKET_UP="$BASE/storage/v1/object/ecourse-videos"
WORK="/tmp/preqal-vids"
mkdir -p "$WORK/out"
cd "$WORK"

NAMES="ms-really quality-iso-simplified process-thinking risk-based-thinking documentation-works people-drive-quality monitoring-measurement audits-capa continual-improvement"

for N in $NAMES; do
  echo "[$(date +%H:%M:%S)] ▶ $N: downloading…"
  curl -sf -o "$N.mp4" "$BUCKET_PUB/$N.mp4" || { echo "[$N] DOWNLOAD FAILED"; continue; }

  echo "[$(date +%H:%M:%S)]   $N: removing watermark…"
  # libx264 crf: slide-style content compresses to near-original size with
  # clean quality (videotoolbox forced ~80MB files vs ~16MB originals)
  ffmpeg -y -v error -i "$N.mp4" \
    -vf "delogo=x=1090:y=645:w=185:h=70" \
    -c:v libx264 -preset fast -crf 22 -c:a copy -movflags +faststart \
    "out/$N.mp4" || { echo "[$N] FFMPEG FAILED"; continue; }

  echo "[$(date +%H:%M:%S)]   $N: uploading ($(du -h "out/$N.mp4" | cut -f1 | tr -d ' '))…"
  HTTP=$(curl -s -o /tmp/upload-resp.json -w "%{http_code}" -X POST "$BUCKET_UP/$N.mp4" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "x-upsert: true" \
    -H "Content-Type: video/mp4" \
    --data-binary @"out/$N.mp4")
  if [ "$HTTP" = "200" ]; then
    echo "[$(date +%H:%M:%S)] ✔ $N uploaded"
    rm -f "$N.mp4"
  else
    echo "[$N] UPLOAD FAILED HTTP $HTTP: $(cat /tmp/upload-resp.json)"
  fi
done

echo "ALL COMPLETE"
