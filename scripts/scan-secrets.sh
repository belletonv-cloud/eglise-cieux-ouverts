#!/usr/bin/env bash
#
# Recherche de secrets dans le dépôt.
#
# Pourquoi cette réécriture : la version précédente ne pouvait JAMAIS échouer.
# Elle initialisait `FAIL=0`, ne le modifiait nulle part, terminait chaque
# recherche par `|| true` et se terminait sur `exit $FAIL` — soit toujours 0.
# Branchée en CI comme son propre en-tête l'annonçait, elle laissait donc
# passer n'importe quelle clé privée sans rien bloquer.
#
# Le `|| true` n'était pas gratuit : les motifs d'origine cherchaient des NOMS
# de variables (`NUXT_FIREBASE_PRIVATE_KEY`, `NUXT_PUBLIC_FIREBASE_API_KEY`),
# qui apparaissent légitimement partout dans le code et la documentation. Un
# scanner qui échoue sur eux échoue toujours, donc on l'avait neutralisé.
#
# D'où la séparation en deux niveaux :
#   - BLOQUANT   : de la matière cryptographique réelle (clé privée PEM, JSON
#                  de compte de service, secret Mailjet) → sortie 1 ;
#   - SIGNALÉ    : ce qui est public par conception (clé d'API Firebase côté
#                  client) ou simplement identifiant (email du compte de
#                  service) → affiché, sortie 0.
#
# Usage :
#   bash scripts/scan-secrets.sh             # tous les fichiers suivis par git
#   bash scripts/scan-secrets.sh --staged    # seulement l'index (pre-commit)

set -uo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

MODE="${1:---tous}"

# Fichiers qui contiennent le marqueur de clé privée pour de bonnes raisons :
# gabarit d'environnement, motif du scanner lui-même, documentation, fixture de
# test. Y ajouter une entrée demande de vérifier que la valeur est bien factice.
ALLOWLIST=(
  ".env.example"
  ".githooks/pre-commit"
  "scripts/scan-secrets.sh"
  "SECURITY.md"
  "tests/unit/cle-privee-firebase.spec.ts"
)

est_autorise() {
  local fichier="$1"
  for a in "${ALLOWLIST[@]}"; do
    [ "$fichier" = "$a" ] && return 0
  done
  return 1
}

# Liste des fichiers à examiner, selon le mode. Boucle `read` plutôt que
# `mapfile` : macOS livre encore bash 3.2, qui ne connaît pas `mapfile`.
FICHIERS=()
if [ "$MODE" = "--staged" ]; then
  SOURCE_LISTE=$(git diff --cached --name-only --diff-filter=ACM)
else
  SOURCE_LISTE=$(git ls-files)
fi
while IFS= read -r ligne; do
  [ -n "$ligne" ] && FICHIERS+=("$ligne")
done <<< "$SOURCE_LISTE"

if [ "${#FICHIERS[@]}" -eq 0 ]; then
  echo "Aucun fichier à examiner."
  exit 0
fi

MOTIFS_BLOQUANTS=(
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  '"private_key"[[:space:]]*:[[:space:]]*"-----BEGIN'
  'NUXT_MAILJET_API_SECRET[[:space:]]*=[[:space:]]*.?[A-Za-z0-9]{20,}'
)

MOTIFS_SIGNALES=(
  'AIza[0-9A-Za-z_-]{35}'
  '[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com'
)

bloquants=0
signales=0

echo "Recherche de secrets (${#FICHIERS[@]} fichier(s))…"
echo

for fichier in "${FICHIERS[@]}"; do
  # Un fichier supprimé dans l'index n'existe plus sur le disque.
  [ -f "$fichier" ] || continue
  # Binaire : rien de lisible à y chercher.
  grep -Iq . "$fichier" 2>/dev/null || continue

  for motif in "${MOTIFS_BLOQUANTS[@]}"; do
    if grep -qE -- "$motif" "$fichier" 2>/dev/null; then
      if est_autorise "$fichier"; then
        continue
      fi
      # Les numéros de ligne suffisent : afficher la ligne reviendrait à
      # recopier le secret dans les journaux de CI.
      lignes=$(grep -nE -- "$motif" "$fichier" 2>/dev/null | cut -d: -f1 | tr '\n' ' ')
      echo "❌ BLOQUANT  $fichier (ligne(s) : $lignes) — motif « $motif »"
      bloquants=$((bloquants + 1))
    fi
  done

  for motif in "${MOTIFS_SIGNALES[@]}"; do
    if grep -qE -- "$motif" "$fichier" 2>/dev/null; then
      lignes=$(grep -nE -- "$motif" "$fichier" 2>/dev/null | cut -d: -f1 | tr '\n' ' ')
      echo "⚠️  signalé  $fichier (ligne(s) : $lignes) — motif « $motif »"
      signales=$((signales + 1))
    fi
  done
done

echo
if [ "$bloquants" -gt 0 ]; then
  echo "$bloquants occurrence(s) bloquante(s). Retirer le secret, puis le RÉVOQUER"
  echo "et le régénérer : ce qui a été écrit une fois dans un fichier suivi par git"
  echo "reste dans l'historique même après suppression."
  exit 1
fi

echo "Aucun secret bloquant. $signales occurrence(s) signalée(s) (publiques par"
echo "conception ou simples identifiants) — à connaître, pas à corriger."
exit 0
