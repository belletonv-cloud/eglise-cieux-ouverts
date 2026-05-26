# Église Cieux Ouverts — Site public

Site web de l'église avec éditeur de pages drag-and-drop (type Wix).
Déployé sur Cloudflare Pages.

## URLs

- **Production** : https://eglise-cieux-ouverts.pages.dev
- **App de gestion** : https://eglise-app.pages.dev
- **GitHub** : https://github.com/belletonv-cloud/eglise-cieux-ouverts

## Stack

- **Framework** : Nuxt 3 (SSR, déploiement static via Nitro/Cloudflare Pages)
- **Frontend** : Vue 3 + Pinia (stores) + Nuxt Layouts
- **Backend/DB** : Firebase Firestore (persistance cloud)
- **Auth** : Firebase Auth (admin)
- **UI** : CSS personnalisé (assets/css/main.css), polices Nunito/Playfair Display
- **Tests** : Playwright (E2E) — sanity ✅, aspirations ❌, admin-mock ❌ (voir `tests/playwright/STATUT_E2E_ADMIN.md`)
- **Déploiement** : Cloudflare Pages (via `wrangler`)

## Déploiement (CI/CD)

- **Branche** : `main`
- **Push sur main** → Cloudflare Pages déploie automatiquement
- **Build** : `nuxt build` (Nitro preset `cloudflare-pages`)
- Vérifier que la branche est bien `main` (pas `master`)

## Structure

- `pages/` — Pages publiques (index, agenda, contact, photos, billetterie, messages)
- `components/` — Composants Vue réutilisables
- `layouts/` — Layouts Nuxt
- `server/` — API endpoints Nuxt
- `stores/` — Stores Pinia
- `composables/` — Composables Vue
- `plugins/` — Plugins Nuxt
- `assets/` — CSS, images, polices
- `public/` — Assets statiques (favicons, logos, images)
- `tests/` — Tests

## ⚠️ Problèmes connus

- **Drag-and-drop** : implémenté via `vue-draggable-plus` dans `PageRenderer.vue` (admin mode seulement)
- **Persistance Firestore** : auto-save avec debounce 3s dans `AdminToolbar.vue` (quand l'utilisateur est connecté)
- **Accent incohérent** : corrigé ("Événements" partout sauf `useChurchEvents.js` qui conserve `evenements` pour les noms de variables)

## WIX-like Architecture Schema-Driven

### Architecture
```
lib/blocks/types.ts            → Types TS (BlockSchema, FieldSchema, etc.)
lib/blocks/registry.ts         → Registry central des blocs + validation
lib/blocks/editor-auto.ts      → Utilitaires d'édition auto-générée
lib/blocks/renderer.ts         → Utilitaires de rendu (normalisation, filtrage, animations)

components/editor/AutoEditor.vue        → Éditeur auto-généré depuis le schema
components/editor/fields/*.vue           → 11 composants de champ (un par type)
components/editor/AdminBlockPreview.vue  → Miniature pour la palette d'ajout

tests/schema-driven/all-blocks.spec.ts   → Runner dynamique (scanne tous les blocs)
tests/schema-driven/hero.spec.ts         → Tests complets BlockHero
tests/schema-driven/text-image.spec.ts   → Tests complets BlockTextImage
tests/schema-driven/schema-test-helper.ts → Helpers de test réutilisables

scripts/add-block.ts                     → CLI pour générer un nouveau bloc
scripts/generate-tests.ts                → Générateur de tests depuis les schemas
```

### Principe : Schema-Driven
Chaque bloc = une entrée dans `BLOCK_TYPES` avec :
- `type` : identifiant unique kebab-case
- `label` : nom affiché
- `icon` : emoji
- `category` : `'content' | 'layout' | 'media' | 'hero'`
- `animations` : `'wrapper' | 'internal' | 'none'` (détermine si le wrapper anime le bloc)
- `defaults` : valeurs par défaut de toutes les props
- `schema` : tableau de champs, chaque champ = `{ key, label, type, min?, max?, options?, placeholder? }`

Types de champ supportés : `text | textarea | richtext | number | color | boolean | select | animation | image | array | images`

### BlockRegistry validation
Le `BlockRegistry` valide automatiquement à l'enregistrement :
- Type unique
- Category valide
- Animation strategy valide
- Tous les champs ont des labels
- Tous les champs ont des defaults
- Les types de champs sont valides
- Les champs `select` ont des options
- Les champs `number` ont min/max
- Pas de clés dupliquées

### Animation strategy (schema-driven)
| Strategy | Comportement | Blocs concernés |
|---|---|---|
| `wrapper` | Animation gérée par PageRenderer (wrapper + IntersectionObserver) | hero, bienvenue, textImage, etc. |
| `internal` | Le bloc gère sa propre animation (scroll-driven CSS) | aspirations, nousRejoindre |
| `none` | Pas d'animation | spacer |

### Ajouter un nouveau bloc (3 étapes)
```bash
# Étape 1 : Générer le squelette
npx tsx scripts/add-block.ts monBloc

# Cela crée :
#   components/blocks/BlockMonBloc.vue
#   tests/schema-driven/mon-bloc.spec.ts
#   + affiche le snippet schema à copier

# Étape 2 : Copier le schema dans utils/blockTypes.js
#   (inclure category + animations)

# Étape 3 : Enregistrer dans PageRenderer.vue
#   import BlockMonBloc from '~/components/blocks/BlockMonBloc.vue'
#   Ajouter 'monBloc': BlockMonBloc, dans COMPONENTS

# Étape 4 : Enregistrer dans lib/blocks/renderer.ts
#   Ajouter dans getBlockComponentName() la map des composants
```

### Tests
- `npx playwright test` → exécute tous les tests (playwright + schema-driven)
- `npx playwright test tests/schema-driven/` → exécute les tests schema-driven uniquement
- `all-blocks.spec.ts` teste TOUS les blocs dynamiquement en 9 sections :
  1. Schema integrity (types uniques, labels, defaults, contraintes)
  2. Admin rendering (sélection, classes d'animation, sidebar)
  3. SSR sans JavaScript (toutes les pages, pas de 500)
  4. Hydration (pas d'erreurs console)
  5. Animation system (classes CSS, événement replay, pre-trigger admin)
  6. Responsive device preview (iframe 768px, 375px)
  7. Admin mode UI integrity (Escape, toolbar, classes)
  8. Accessibility basics (headings, alt attributes, lang="fr")
  9. Cross-block integration (types de champs, catégories)
- Les helpers dans `schema-test-helper.ts` fournissent `editField`, `toggleField`, `selectField`, `selectAnimation`
- `validateSchema()` valide les champs, types, defaults, unicité
- Les tests doivent marcher sans authentification Firebase

### AutoEditor (remplace la sidebar inline)
`AutoEditor.vue` prend un `schema` + `modelValue` en entrée et génère automatiquement :
- `FieldText.vue` pour type 'text' (avec placeholder)
- `FieldColor.vue` pour type 'color'
- `FieldNumber.vue` pour type 'number' (range slider)
- etc. (11 types supportés)

**AdminToolbar.vue utilise AutoEditor** dans sa sidebar d'édition.

### Centralisation du rendu
Toutes les fonctions de rendu sont centralisées dans `lib/blocks/renderer.ts` :
- `normalizeBlock()` → normalise les props (flatten props.props, merge defaults)
- `filterByVisibility()` → filtre par device (desktop/tablet/mobile)
- `getAnimClass()` → classe CSS d'animation (utilise animation strategy)
- `shouldUseTrigger()` → si le bloc utilise le trigger IntersectionObserver

`PageRenderer.vue` appelle ces fonctions au lieu de les dupliquer.

## Nouvelles fonctionnalités (ajoutées en mai 2026)

### Undo/Redo
- Implémenté dans `composables/useAdmin.js` via piles `undoStack`/`redoStack` (50 entrées max)
- `pushHistory()` est appelée automatiquement dans chaque fonction de modification (`updateBlock`, `moveBlock`, `removeBlock`, `addBlock`, `reorderBlocks`, `setBlocks`)
- Exposé via `undo()`, `redo()`, `canUndo()`, `canRedo()`
- Raccourcis clavier : Ctrl+Z (undo), Ctrl+Shift+Z (redo)
- Boutons dans `AdminToolbar.vue` (barre admin en haut)

### Drag-and-drop (admin mode)
- Utilise `vue-draggable-plus` (v0.6.1, import `VueDraggable`)
- Actif seulement quand `isAdmin && isMounted` dans `PageRenderer.vue`
- Drag handle (⠿) visible au survol du bloc en admin
- Ghost class `.block-ghost` pendant le drag (opacité réduite + contour bleu)
- Animation de 200ms entre positions
- V-model lié à `sortableBlocks` computed (getter=visibleBlocks, setter=reorderBlocks)

### Auto-save Firestore
- Debounce 3s dans `AdminToolbar.vue` (watch deep sur `localBlocks`)
- Appelle Firestore `setDoc` sur `pages/{pageSlug}` avec les blocs
- Affichage "Auto-sauvegardé" pendant 2s après save
- Désactivé si utilisateur non connecté

### Safari animation fallback
- Détection via `CSS.supports('animation-timeline: view()')` dans `useBlockAnimation.js`
- Fallback IntersectionObserver universel si non supporté
- Classes `.triggered` ajoutées quand le bloc entre dans le viewport
- Même comportement que le scroll-driven natif (opacity + translateY)

### Transitions de page
- Configurées dans `nuxt.config.ts` : `pageTransition: { name: 'page', mode: 'out-in' }`
- CSS dans `assets/css/main.css` : `.page-enter-active`, `.page-leave-active`, etc.
- Opacity + translateY sur 300ms ease

### Conventions de test
- Toujours tester : validité du schema (types, champs, defaults), rendu SSR, rendu admin, sélection
- Utiliser `validateSchema()` dans les tests de chaque bloc
- Vérifier SSR sans JavaScript explicitement
- Vérifier l'absence d'erreurs console avec JavaScript
- Les tests de sidebar nécessitent auth — ne pas les forcer sans Firebase mock

### Scripts CLI
```bash
# Ajouter un nouveau bloc
npx tsx scripts/add-block.ts monBloc
# → génère composant + tests + instructions schema

# Générer des tests automatisés pour tous les blocs
npx tsx scripts/generate-tests.ts
# → génère tests/schema-driven/generated/generated-tests.spec.ts
```
