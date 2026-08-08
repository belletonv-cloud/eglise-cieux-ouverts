#!/usr/bin/env bash
#
# Recompresse SUR PLACE les images de public/.
#
# Pourquoi sur place : les URL d'images sont stockées telles quelles dans le
# contenu Firestore (props des blocs) et dans BLOCK_TYPES[...].defaults —
# renommer un fichier ou changer une extension casse silencieusement des pages
# de production. Le nom et le format restent donc identiques, seuls le poids et
# la définition changent.
#
# Ce que fait le script :
#   - réduit la plus grande dimension à MAX_DIM px (les photos d'origine
#     montaient à 5440 px pour un affichage de 1200 px au plus) ;
#   - JPEG : ré-encode en qualité JPEG_QUALITY, progressif, sans métadonnée ;
#   - PNG : recompression sans perte seulement (voir le commentaire dans la
#     branche `png)` pour pourquoi la quantification 256 couleurs est écartée) ;
#   - n'écrit un fichier que s'il est réellement plus petit qu'avant.
#
# Idempotent : relancé, il ne retouche rien (les fichiers déjà optimisés ne
# rétrécissent plus). Nécessite ImageMagick (`brew install imagemagick`).
#
# Usage :
#   bash scripts/optimize-images.sh            # optimise
#   DRY_RUN=1 bash scripts/optimize-images.sh  # simule, n'écrit rien

set -uo pipefail

MAX_DIM="${MAX_DIM:-2000}"
JPEG_QUALITY="${JPEG_QUALITY:-82}"
DRY_RUN="${DRY_RUN:-0}"

cd "$(dirname "$0")/.." || exit 1

if ! command -v magick >/dev/null 2>&1; then
  echo "❌ ImageMagick (magick) introuvable — brew install imagemagick" >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

total_before=0
total_after=0
changed=0

while IFS= read -r -d '' f; do
  before=$(stat -f%z "$f")
  total_before=$((total_before + before))
  ext="${f##*.}"
  lower_ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
  base="$(basename "$f")"

  case "$lower_ext" in
    jpg|jpeg)
      out="$TMP/out-$base"
      magick "$f" -auto-orient -strip -resize "${MAX_DIM}x${MAX_DIM}>" \
        -quality "$JPEG_QUALITY" -interlace Plane "$out" 2>/dev/null || { total_after=$((total_after + before)); continue; }
      ;;
    png)
      # PNG : redimensionnement + recompression sans perte uniquement.
      #
      # Une palette 256 couleurs (PNG8) diviserait le poids par 3 à 5, mais
      # deux essais l'ont écartée, tous deux invisibles pour le RMSE :
      #   - sur un logo détouré (logo-nav.png), PNG8 perd les alphas
      #     intermédiaires et le lissage des bords tombe en escalier ;
      #   - sur une image lisse (foule-croix.png, le ciel du hero), le
      #     tramage de quantification sème un grain visible dans le dégradé.
      # Aucune des images du site n'a ≤ 256 couleurs, donc aucune ne peut être
      # quantifiée sans perte : on s'en passe. Les PNG photographiques restent
      # lourds par nature — les convertir en JPEG demanderait de changer leur
      # extension, donc leur URL, or ces URL sont figées dans le contenu
      # Firestore et dans BLOCK_TYPES.
      out="$TMP/tc-$base"
      magick "$f" -auto-orient -strip -resize "${MAX_DIM}x${MAX_DIM}>" \
        -define png:compression-level=9 "$out" 2>/dev/null || { total_after=$((total_after + before)); continue; }
      ;;
    *)
      total_after=$((total_after + before))
      continue
      ;;
  esac

  after=$(stat -f%z "$out")
  # Marge de 2 % : ré-encoder pour gagner quelques octets ne vaut pas la perte
  # de qualité ni le bruit dans l'historique git.
  if [ "$after" -lt $((before * 98 / 100)) ]; then
    if [ "$DRY_RUN" = "1" ]; then
      echo "· $f  $((before/1024)) Ko → $((after/1024)) Ko"
    else
      cp "$out" "$f"
      echo "✓ $f  $((before/1024)) Ko → $((after/1024)) Ko"
    fi
    total_after=$((total_after + after))
    changed=$((changed + 1))
  else
    total_after=$((total_after + before))
  fi
done < <(find public -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

echo
echo "$changed fichier(s) optimisé(s) — $((total_before/1024/1024)) Mo → $((total_after/1024/1024)) Mo"
