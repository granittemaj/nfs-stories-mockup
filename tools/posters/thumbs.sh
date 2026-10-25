#!/bin/sh
# Small copies of the wide frames (800px) for tiles and thumbnails on the hub.
cd "$(dirname "$0")/../../assets/img/posters" || exit 1
for f in *-wide.webp; do cwebp -quiet -q 74 -resize 800 0 "$f" -o "${f%-wide.webp}-thumb.webp"; done
