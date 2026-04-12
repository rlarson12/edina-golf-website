#!/bin/bash
# Pre-deploy gate for edinaboysgolf.com
# Rejects oversized images and large dist bundles
# Run automatically via npm build hook or manually before deploy

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE_DIR="$REPO_ROOT/public/images"
DIST_DIR="$REPO_ROOT/dist"
MAX_IMAGE_KB=500
MAX_DIST_MB=25
ERRORS=0

echo "🔍 Pre-deploy check..."

# 1. Check for non-WebP images (except SVG which is ok)
echo ""
echo "=== Image Format Check ==="
NON_WEBP=$(find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.JPG" -o -name "*.JPEG" -o -name "*.PNG" -o -name "*.heic" -o -name "*.HEIC" \) 2>/dev/null)
if [ -n "$NON_WEBP" ]; then
    echo "❌ Non-WebP images found (must convert to .webp first):"
    echo "$NON_WEBP" | while read f; do
        echo "   $(basename "$f") ($(du -h "$f" | cut -f1))"
    done
    ERRORS=$((ERRORS + 1))
else
    echo "✅ All images are WebP or SVG"
fi

# 2. Check for oversized images
echo ""
echo "=== Image Size Check (max ${MAX_IMAGE_KB}KB) ==="
OVERSIZED=$(find "$IMAGE_DIR" -type f \( -name "*.webp" -o -name "*.svg" \) -size +${MAX_IMAGE_KB}k 2>/dev/null)
if [ -n "$OVERSIZED" ]; then
    echo "⚠️  Oversized images (>${MAX_IMAGE_KB}KB):"
    echo "$OVERSIZED" | while read f; do
        echo "   $(basename "$f") ($(du -h "$f" | cut -f1))"
    done
    # Warning, not blocking — some hero images may legitimately be larger
    echo "   (warning only — compress if possible)"
else
    echo "✅ All images under ${MAX_IMAGE_KB}KB"
fi

# 3. Check dist size if it exists
if [ -d "$DIST_DIR" ]; then
    echo ""
    echo "=== Dist Size Check (max ${MAX_DIST_MB}MB) ==="
    DIST_SIZE_KB=$(du -sk "$DIST_DIR" | cut -f1)
    DIST_SIZE_MB=$((DIST_SIZE_KB / 1024))
    if [ "$DIST_SIZE_MB" -gt "$MAX_DIST_MB" ]; then
        echo "❌ Dist is ${DIST_SIZE_MB}MB (max ${MAX_DIST_MB}MB)"
        echo "   Largest files:"
        find "$DIST_DIR" -type f -exec du -h {} \; | sort -rh | head -5
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Dist is ${DIST_SIZE_MB}MB"
    fi
    
    # 4. Check for .original or backup files in dist
    BACKUPS=$(find "$DIST_DIR" -name "*.original" -o -name "*.bak" 2>/dev/null)
    if [ -n "$BACKUPS" ]; then
        echo "❌ Backup files found in dist (should not be deployed):"
        echo "$BACKUPS"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 5. Check JS bundle size
if [ -d "$DIST_DIR/assets" ]; then
    echo ""
    echo "=== JS Bundle Check ==="
    LARGE_JS=$(find "$DIST_DIR/assets" -name "*.js" -size +500k 2>/dev/null)
    if [ -n "$LARGE_JS" ]; then
        echo "⚠️  Large JS bundles (>500KB):"
        echo "$LARGE_JS" | while read f; do
            echo "   $(basename "$f") ($(du -h "$f" | cut -f1))"
        done
    else
        echo "✅ JS bundles under 500KB"
    fi
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
    echo "❌ PRE-DEPLOY CHECK FAILED ($ERRORS errors)"
    echo "Fix the issues above before deploying."
    exit 1
else
    echo "✅ PRE-DEPLOY CHECK PASSED"
    exit 0
fi
