#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="${1:-.}"
PUBLIC="$PROJECT_ROOT/public"
SRC="$PUBLIC/src"
DIST="$PUBLIC/dist"

mkdir -p "$SRC" "$DIST"
for f in sdk.js oko-widget.js oko-operator.js oko-loader.js; do
  if [ -f "$PUBLIC/$f" ]; then
    cp -f "$PUBLIC/$f" "$SRC/$f"
    echo "[OK] Copied $PUBLIC/$f -> $SRC/$f"
  else
    echo "[skip] $PUBLIC/$f not found"
  fi
done

echo "Done. Edit files in public/src/*.js; build to public/dist/"
