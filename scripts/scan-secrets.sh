#!/usr/bin/env bash
# Quick repository secret scanner used by CI / local pre-commit hook.
# Non-destructive: only searches for known patterns and prints results.

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

echo "Scanning repository for probable secrets..."

# Patterns to search for (private keys, firebase API keys, service account fields)
PATTERNS=(
  "-----BEGIN PRIVATE KEY-----"
  "AIza[0-9A-Za-z_-]\{35\}"
  "NUXT_FIREBASE_PRIVATE_KEY"
  "NUXT_PUBLIC_FIREBASE_API_KEY"
  "private_key\s*:\s*\""
  "client_email\"\s*:\s*\".*@.*\""
)

FAIL=0
for p in "${PATTERNS[@]}"; do
  echo "- Searching for pattern: $p"
  # Use rg if available (fast), fallback to grep
  if command -v rg >/dev/null 2>&1; then
    rg -n --hidden --glob '!node_modules' --glob '!.git' --glob '!dist' --glob '!.output' --glob '!.wrangler' --threads 6 "$p" "$ROOT_DIR" || true
  else
    # POSIX fallback
    grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.output --exclude-dir=.wrangler -E "$p" "$ROOT_DIR" || true
  fi
done

echo "Scan finished. Note: generated build artifacts (dist, .output, .wrangler) often contain expanded config — check locally but don't commit them."

exit $FAIL
