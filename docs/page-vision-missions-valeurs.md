# Page « Vision, missions et valeurs »

Page reconstruite intégralement via l'admin du site (exercice éditeur réel, serveur mock),
d'après le poster fourni — respect strict palette/icônes/hiérarchie/majuscules :

- Bleu profond `#1A4C8B` (icônes, titres, fond Valeurs)
- Bleu moyen `#3D6FB3` (non utilisé directement — réservé transitions/séparateurs)
- Blanc `#FFFFFF`, gris clair `#F2F2F2` (cartes), rouge accent `#C62828` (non utilisé ici,
  aucun pictogramme cœur n'appelait le rouge dans les icônes retenues)

## Structure (3 blocs `richText`)

| Section | Fond | Contenu |
|---|---|---|
| **Notre vision** | `#E8F0FA` | Icône flamme (rond bleu `#1A4C8B`), titre `NOTRE VISION`, phrase exacte en majuscules |
| **Nos missions** | `#FFFFFF` | Grille 2×2, cartes `#F2F2F2`, ombre `rgba(0,0,0,0.08)`, hover `scale(1.02)`. Icônes **exactes** : cœur entre deux mains / croix / cœur sur une main / deux personnes + bulle |
| **Nos valeurs** | `#1A4C8B` | Titre blanc `NOS VALEURS`, 7 valeurs séparées par des tirets longs (—) |

Tous les ronds d'icône sont strictement homogènes : 72px de diamètre, icône SVG 43px
(≈60% du rond), fond `#1A4C8B`, `stroke="#FFFFFF"` outline sans remplissage.
Padding des sections : 96–100px (respect de la fourchette 80–120px demandée).

## Piège rencontré et corrigé

Le CSS global `h1, h2, h3 { font-family: var(--font-heading) }` (Playfair Display serif)
cible directement les titres et **gagne toujours sur l'héritage**, même si le conteneur
parent du HTML collé déclare un `font-family` différent — peu importe la spécificité du
sélecteur parent. Il faut poser `font-family` **explicitement sur le sélecteur du titre
lui-même** (`h2`, `h3`) dans le HTML custom. Documenté dans `CLAUDE.md`.

## Recréer la page sur un environnement réel

1. Admin → bouton **📄 Pages** → **Créer une page** → titre « Vision, missions et valeurs »
2. Ajouter 3 blocs **Texte riche → Bloc vierge** ; coller le contenu exact (HTML + couleur de
   fond + padding) depuis [`page-vision-missions-valeurs.json`](./page-vision-missions-valeurs.json)
   (`blocks[n].props.content`, `.backgroundColor`, `.padding`).
3. Sauvegarder (le bouton principal suffit).

Alternative rapide (admin connecté, via l'API du site) :
`PUT /api/pages/vision-missions-et-valeurs` avec le JSON exporté (`{ blocks: [...] }`).
