#!/bin/bash
set -e

echo "Building for branch: $CF_PAGES_BRANCH"

if [ "$CF_PAGES_BRANCH" = "recette" ]; then
  echo "→ Applying recette (preview) environment"
  export NUXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDMDdQ-Dfg-ScO5xCKytl52iHCnO4Qcu7Y"
  export NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="eglise-cieux-ouverts-rec.firebaseapp.com"
  export NUXT_PUBLIC_FIREBASE_PROJECT_ID="eglise-cieux-ouverts-rec"
  export NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="eglise-cieux-ouverts-rec.firebasestorage.app"
  export NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="32860980186"
  export NUXT_PUBLIC_FIREBASE_APP_ID="1:32860980186:web:ba5609bfd7a3e8484136e3"
  export NUXT_FIREBASE_PROJECT_ID="${NUXT_FIREBASE_PROJECT_ID:-eglise-cieux-ouverts-rec}"
  export NUXT_FIREBASE_CLIENT_EMAIL="${NUXT_FIREBASE_CLIENT_EMAIL:-firebase-adminsdk-fbsvc@eglise-cieux-ouverts-rec.iam.gserviceaccount.com}"
  # Lire depuis les variables d'environnement Cloudflare Pages (set dans le dashboard)
  # Si non défini, utiliser une valeur factice qui échouera gracieusement à l'exécution
  export NUXT_FIREBASE_PRIVATE_KEY="${NUXT_FIREBASE_PRIVATE_KEY:-dummy-key-set-in-cloudflare-dashboard}"
fi

# npm install (pas npm ci) : le lockfile est généré sur macOS et ne
# contient donc que le binding natif darwin-arm64 pour les paquets
# multi-plateformes (oxc-parser, esbuild, rollup) — npm ci refuse
# d'installer quoi que ce soit hors lockfile et échoue sur Linux avec
# "Cannot find native binding". npm install résout et installe le
# binding linux-x64-gnu manquant à la volée (bug connu npm/cli#4828).
npm install --no-audit --no-fund
npm run build
