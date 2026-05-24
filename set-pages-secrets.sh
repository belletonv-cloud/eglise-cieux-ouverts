#!/usr/bin/env bash
# Interactive script to set Cloudflare Pages secrets via wrangler
# Usage: bash set-pages-secrets.sh


set -euo pipefail

PROJECT_DEFAULT="eglise-cieux-ouverts"

command -v wrangler >/dev/null 2>&1 || {
  echo "wrangler is not installed or not in PATH. Install and authenticate (wrangler login) and retry." >&2
  exit 1
}

# If PROJECT env set, use it, otherwise prompt with default
PROJECT=${PROJECT:-}
if [ -z "$PROJECT" ]; then
  read -r -p "Project name [${PROJECT_DEFAULT}]: " PROJECT_INPUT
  PROJECT=${PROJECT_INPUT:-$PROJECT_DEFAULT}
fi

echo "Running for Pages project: $PROJECT"

# Helper: get value from env if present; otherwise prompt.
get_value() {
  local varname="$1"
  local prompt="$2"
  local secret=${3:-0}
  # If environment variable exists and non-empty, use it
  if [ -n "${!varname-}" ]; then
    printf '%s' "${!varname}"
    return 0
  fi
  if [ "$secret" -eq 1 ]; then
    read -r -s -p "$prompt: " val
    echo
  else
    read -r -p "$prompt: " val
  fi
  printf '%s' "$val"
}

put_secret() {
  local name="$1" value="$2"
  if [ -z "${value}" ]; then
    echo "Skipping ${name} (empty)"
    return 0
  fi
  printf "%s" "$value" | wrangler pages secret put "$name" --project-name="$PROJECT"
}

echo "Preparing secrets (using environment variables if present)."

NUXT_PUBLIC_FIREBASE_API_KEY=$(get_value NUXT_PUBLIC_FIREBASE_API_KEY "NUXT_PUBLIC_FIREBASE_API_KEY" 1)
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$(get_value NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN "NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
NUXT_PUBLIC_FIREBASE_PROJECT_ID=$(get_value NUXT_PUBLIC_FIREBASE_PROJECT_ID "NUXT_PUBLIC_FIREBASE_PROJECT_ID")
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$(get_value NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET "NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(get_value NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
NUXT_PUBLIC_FIREBASE_APP_ID=$(get_value NUXT_PUBLIC_FIREBASE_APP_ID "NUXT_PUBLIC_FIREBASE_APP_ID" 1)
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$(get_value NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID "NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)")

echo "Uploading secrets to Pages project: $PROJECT"

put_secret NUXT_PUBLIC_FIREBASE_API_KEY "$NUXT_PUBLIC_FIREBASE_API_KEY"
put_secret NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN "$NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
put_secret NUXT_PUBLIC_FIREBASE_PROJECT_ID "$NUXT_PUBLIC_FIREBASE_PROJECT_ID"
put_secret NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET "$NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
put_secret NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "$NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
put_secret NUXT_PUBLIC_FIREBASE_APP_ID "$NUXT_PUBLIC_FIREBASE_APP_ID"
put_secret NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID "$NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID"

echo "All done. Trigger a deployment in Pages (push main or 'Deploy latest commit')."
