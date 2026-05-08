#!/usr/bin/env sh
# Optional launcher: runs the AppImage with APPIMAGE_EXTRACT_AND_RUN=1 (no FUSE mount).
# Usage: place next to the downloaded .AppImage, then:
#   chmod +x linux-extract-and-run.sh && ./linux-extract-and-run.sh
# Or pass the AppImage path: ./linux-extract-and-run.sh /path/to/pipecraft-…AppImage

set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
IMG=""
if [ "${1-}" ] && [ -f "${1}" ]; then
  IMG=$1
  shift
else
  for f in "$DIR"/pipecraft-*-linux-*.AppImage "$DIR"/pipecraft-*.AppImage; do
    if [ -f "$f" ]; then
      IMG=$f
      break
    fi
  done
fi
if [ -z "$IMG" ] || [ ! -f "$IMG" ]; then
  echo "No pipecraft .AppImage found. Download it next to this script or pass its path as the first argument." >&2
  exit 1
fi
export APPIMAGE_EXTRACT_AND_RUN=1
exec "$IMG" "$@"
