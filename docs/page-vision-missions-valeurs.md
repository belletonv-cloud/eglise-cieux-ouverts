# Page « Vision, missions et valeurs »

Page construite entièrement via l'admin du site (exercice éditeur réel, serveur mock),
d'après le poster : palette #1A4C8B / #3D6FB3 / #C62828 / #F2F2F2 / #4A4A4A.

## Structure (3 blocs)

| Section | Bloc | Réglages clés |
|---|---|---|
| Notre vision | `vision` | label `NOTRE VISION`, fond `#E8F0FA`, texte `#1A4C8B` |
| Nos missions | `richText` | 4 cartes 2×2 (icônes SVG outline, hover scale 1.02), fond blanc |
| Nos valeurs | `richText` | grille 3×3, 7 valeurs, fond `#1A4C8B`, icônes blanches |

Le HTML des deux sections richText embarque un `<style>` préfixé (`.vmv-…`)
pour ne pas fuir sur le reste de la page. Icônes : SVG inline `stroke:currentColor`.

## Recréer la page sur un environnement réel

1. Admin → bouton **📄 Pages** → **Créer une page** → titre « Vision, missions et valeurs »
2. Ajouter les 3 blocs ci-dessus ; le contenu exact (props complets, HTML des richText)
   est dans [`page-vision-missions-valeurs.json`](./page-vision-missions-valeurs.json)
   (copier `blocks[n].props.content` dans le champ « Contenu HTML » de chaque bloc).
3. Sauvegarder (le bouton principal suffit).

Alternative rapide (admin connecté, via l'API du site) :
`PUT /api/pages/vision-missions-et-valeurs` avec le JSON exporté (`{ blocks: [...] }`).
