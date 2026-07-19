# Page « Vision, missions et valeurs »

Reconstruite intégralement avec les **blocs natifs de l'éditeur** (aucun HTML custom
collé cette fois) : blocs, tableaux, couleurs, icônes — uniquement les outils
disponibles dans la sidebar admin. Contenu fidèle au document fourni, adapté au
système de design du site (pas une reproduction pixel-perfect d'un poster).

## Structure (3 blocs)

| Section | Bloc | Réglages |
|---|---|---|
| **Notre vision** | `vision` (natif) | label `NOTRE VISION`, citation en majuscules, fond `#E8F0FA`, texte `#1A4C8B` |
| **Nos missions** | `iconGrid` (nouveau bloc natif) | 4 cartes, 2 colonnes, fond `#FFFFFF`, cartes `#F2F2F2`, icônes blanches sur rond `#1A4C8B` |
| **Nos valeurs** | `iconGrid` (même bloc, autre config) | 7 items, 1 colonne, fond `#1A4C8B`, cartes transparentes (même couleur que le fond), texte blanc |

## Nouveau bloc natif : `iconGrid` (« Grille à icônes »)

Aucun bloc existant ne permettait une grille de cartes avec icône dans un rond coloré
(`activities` est un carousel photo avec modale, `aspirations` est une section à
scroll-cascade de 300vh — tous deux inadaptés). Plutôt que de contourner via du HTML
collé, un **vrai bloc réutilisable** a été ajouté au système (`components/blocks/BlockIconGrid.vue`,
schema dans `utils/blockTypes.js`), disponible pour toute page future :

- `items[]` (tableau) : icône (URL image — accepte les data-URI SVG), titre, description
- `columns` (nombre, 1 à 4) — même convention que `gallery`/`equipe`
- `backgroundColor`, `cardBackgroundColor`, `iconBackgroundColor`, `titleColor`, `textColor`
- `animation` (wrapper, comme les autres blocs `content`)

Les 4 icônes des missions (cœur entre deux mains, croix, cœur sur une main, deux
personnes + bulle) sont des SVG outline blancs encodés en data-URI base64, utilisés
comme n'importe quelle image via le champ natif « Icône (URL image) ».

## Bug corrigé en marge

Un champ `Colonnes` de type `select` (options `["2","3","4"]`) ne permettait pas de
choisir 1 colonne pour la liste de valeurs — la valeur s'appliquait silencieusement à
rien (aucune option "1" n'existait). Remplacé par `type: "number", min: 1, max: 4`,
la convention déjà utilisée par `gallery`/`equipe` — cohérent avec le reste du site.

## Recréer la page

1. Admin → bouton **📄 Pages** → **Créer une page** → titre « Vision, missions et valeurs »
2. **+ Bloc** → **Vision (citation)** → remplir label/citation/couleurs
3. **+ Bloc** → **Grille à icônes** → titre « NOS MISSIONS » (les 4 cartes par défaut
   sont déjà les bonnes icônes/couleurs)
4. **+ Bloc** → **Grille à icônes** → titre « NOS VALEURS », colonnes = 1, fond/cartes
   = `#1A4C8B`, titres = `#FFFFFF`, remplacer les 4 items par défaut par les 7 valeurs
   (vider le champ icône de chacun)
5. Sauvegarder

Contenu exact exporté dans [`page-vision-missions-valeurs.json`](./page-vision-missions-valeurs.json).
