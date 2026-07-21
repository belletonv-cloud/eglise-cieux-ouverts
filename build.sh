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

# package-lock.json est généré sur macOS et ne verrouille donc que le
# binding natif darwin-arm64 pour les paquets multi-plateformes
# (oxc-parser, esbuild, rollup). npm install seul ne suffit pas : avec
# un lockfile existant (même partiel), npm considère la résolution déjà
# satisfaite et ne va pas chercher les variantes de plateforme
# manquantes. On supprime donc le lockfile ici pour forcer une
# résolution fraîche sur la machine Linux de Cloudflare elle-même, qui
# récupère alors correctement le binding linux-x64-gnu (bug connu
# npm/cli#4828 — suggestion officielle de npm dans son propre message
# d'erreur : supprimer node_modules + package-lock.json puis réinstaller).
rm -f package-lock.json
rm -rf node_modules
npm install --no-audit --no-fund
npm run build
