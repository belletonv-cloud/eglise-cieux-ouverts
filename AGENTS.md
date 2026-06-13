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
- ⚠️ **Ne pas utiliser `npm run deploy` localement** — le CI fait le déploiement automatiquement. La commande existe mais nécessite `wrangler login` (et le CI est plus fiable).

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

## Node.js — version unique

**Node 22 uniquement.** Plus de jonglage entre versions.

Tout fonctionne sur Node 22 : `nuxt dev`, `nuxt build`, les tests Playwright, le déploiement Wrangler/Cloudflare.

| Fichier | Version | Rôle |
|---|---|---|
| `package.json` → `volta.node` | `22.22.3` | Volta auto-switch |
| `.nvmrc` | `22` | `nvm use` |
| `.node-version` | `22` | nodenv/fnm |

### Commandes

```bash
npm run dev       # dev local
npm run test:e2e  # build + tests Playwright
# Déploiement : push sur main → Cloudflare Pages auto-deploy
```

Si votre manager de version ne switch pas automatiquement vers Node 22 :
```bash
nvm use 22
# ou
volta pin node@22
```

## ✅ Fonctionnalités clés

- **Drag-and-drop** : réordonnancement des blocs via `vue-draggable-plus` (admin mode)
- **Undo/Redo** : historique local 50 entrées, boutons toolbar + Ctrl+Z / Ctrl+Shift+Z
- **Persistance Firestore** : auto-save avec debounce 3s, sauvegarde manuelle
- **Fallback animations Safari** : détection `animation-timeline` + IntersectionObserver
- **Transitions de page** : opacity + translateY configurées dans Nuxt

## ⚠️ Points d'attention

- **Images Wix externes** : certaines images utilisent encore `static.wixstatic.com` (dépendance externe)
- **Bloc Vidéo manquant** : pas encore de type `hero.video` ou embed YouTube dédié
- **Tests admin** : nécessitent mock Firebase (non fait)
- **Anim CSS du hero** : `BlockHero.vue` utilise une `transition` (pas `@keyframes`) déclenchée après `onMounted` via `.hero-visible` → évite le rejeu d'animation après hydratation
- **Menu mobile scroll** : quand ouvert, le `body` est figé avec `position: fixed` + `touchAction: none` + restauration du scrollY à la fermeture
- **Menu bg image** : configurable dans le MenuEditor, persistant dans Firestore (`settings/menu.menuBgImage`)
- **Auth admin** : la toolbar d'admin (AdminToolbar) gère l'auth via Firebase `onAuthStateChanged`. `?admin=true` active le mode admin quelles que soient les permissions — la toolbar se charge d'afficher "Se connecter" si pas authentifié. Page `/admin` = page de login dédiée avec redirection vers `/?admin=true` après connexion.
- **Nitro preset** : utiliser `cloudflare-pages` (pas `cloudflare-worker`). Le build sort dans `dist/` avec `_worker.js/` à l'intérieur. `wrangler.jsonc` doit pointer `pages_build_output_dir` vers `./dist`. Node 22 requis pour Wrangler 4.x.

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

### Fallback /event-list (SPA + SSR)
- `pages/event-list.vue` utilise `useLazyFetch` (pas `await useAsyncData`) pour éviter le blocage SPA
- Le fallback `getDefaultBilletteriePage()` s'affiche immédiatement si `blocks` est vide
- Même comportement en SSR et en navigation SPA (clic lien)
- Test E2E : `tests/playwright/event-list-fallback.spec.ts` (3 scénarios)

### Playwright — serveur de test sans Wrangler
- `playwright.config.ts` utilise `node .output/server/index.mjs` (standalone, pas de Wrangler)
- Fonctionne sur Node 22 (standardisé)
- Actif uniquement avec `PW_TEST=1` (preset `node-server`)

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

### BlockRenderer (centralise le rendu des blocs)
- Fichier : `components/BlockRenderer.vue`
- Utilise des `import` statiques explicites (pas d'auto-import Nuxt) pour éviter les différences de référence SSR/CSR
- Chaîne `v-if`/`v-else-if` sur `btype` (computed depuis `props.block.type`)
- `sprops` via `clean()` (remplace thenable/promise par null) pour éviter `[object Promise]` dans le DOM
- Passe `:block-id`, `:visibility`, `:is-triggered`, `:is-admin` à chaque bloc enfant
- PageRenderer appelle `<BlockRenderer :block="block" :is-triggered="..." :is-admin="..." />`
- **Ne pas utiliser `<component :is>` pour les blocs** — cassait l'hydratation SSR

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

## TODO — reste à faire

### 1. Footer éditable ✅ (remplacé par BlockFooter)
- `SiteFooter.vue` supprimé, remplacé par `BlockFooter.vue` (composant bloc standard)
- Footer géré comme les autres blocs : schéma dans `BLOCK_TYPES`, édité via AutoEditor
- Stocké dans `settings/footer`, chargé dans `default.vue` et rendu via `<BlockFooter>`
- Bouton "📋 Footer" dans la toolbar admin → sidebar AutoEditor

### 2. Feedback undo/redo et auto-save ✅
- Historique avec labels : `pushHistory(label)` stocke `{ label, blocks }` → tooltips "Annuler : Modification du bloc X"
- `unsaved` ref : passe à `true` à chaque modification, `false` après auto-save réussie
- Affichage "⚠ Modifications non sauvegardées" (jaune) entre la modif et l'auto-save
- Boutons undo/redo : tooltip dynamique avec le label de l'action suivante
- `markSaved()` appelé après sauvegarde réussie (auto + manuelle)

### 3. Design Wix-like ✅
- `FieldDesign.vue` : section "Design" repliable dans AutoEditor après les champs schema
- Champs : police (Nunito, Playfair, Georgia...), taille, épaisseur, alignement, couleur texte, fond, padding
- Design mergé dans `mergeDesignDefaults()` appliqué à chaque bloc
- `BlockFooter.vue` utilise les props design (fontSize, textColor, etc.)
- Tous les blocs reçoivent les props design via `BLOCK_TYPES` defaults

### 4. BlockAspirations — animation des ronds cassée par Vue scoped CSS (résolu)

**Root cause** : `getCircleStyle()` mettait `animationName` en style inline (`animation-name: circle-0`). Vue 3 scoped CSS renomme les `@keyframes` avec un hash (`@keyframes circle-0-bfe4cc88`). L'`animation-name` inline référençait le nom non hashé → aucune animation → chaque rond restait centré sur sa ligne.

**Fix** (commit `bfbfbc5`) : Remplacer les 6 keyframes par index par un seul `@keyframes circle-move` utilisant `var(--circle-offset, 0rem)`. `animation-name: circle-move` est défini dans le CSS scopé (Vue le hashe correctement), et l'offset par cercle passe via la propriété CSS `--circle-offset` inline (non affectée par le scoping).

**Les 3 invariants dans `BlockAspirations.vue`** (si ça re-régresse) :
1. `getCircleStyle()` doit définir `--circle-offset` (PAS `animationName`)
2. `.circle` dans `@supports` doit avoir `animation-name: circle-move` (dans le CSS scopé)
3. `@keyframes circle-move` doit utiliser `translateY(calc(-50% - var(--circle-offset, 0rem)))`

### 5. SSR — pas de bugs de duplication héros (résolu)
- **Root cause**: `<component :is>` avec résolution dynamique (même via `BLOCK_COMPONENTS` map statique) crée des références de composant différentes entre SSR et client → Vue hydrate en 2 pass → **chaque wrapper a 2 enfants**.
- **Fix**: `BlockRenderer.vue` utilise une chaîne `v-if`/`v-else-if` avec des imports statiques explicites. Plus de `<component :is>`.
- SSR (vérifié) : les 2 `data-block-id="bloc-hero"` sont sur **2 éléments différents** (div wrapper + section). 1 seule section hero.
- **Règles**:
  - `BlockRenderer` doit utiliser `import X from '~/components/blocks/BlockX.vue'` (pas d'auto-import Nuxt)
  - `v-if="btype === 'hero'"` (pas `block.type` directement — utiliser computed)
  - `v-bind="sprops"` avec `sprops` via `clean()` (supprime les thenable/promise)
  - Toujours passer `:block-id`, `:visibility`, `:is-triggered`, `:is-admin` aux enfants
  - Ne JAMAIS utiliser `<component :is>` pour les blocs — toujours des composants directs

### 6. BlockRejoins — parallax scroll-driven avec stagger (résolu)

**Feature**: En scrollant vers le bas : "Rejoins-nous" glisse de la gauche (translateX), puis les horaires montent du bas (translateY) avec un décalage (9h30 puis 10h). En scrollant vers le haut : horaires disparaissent en premier (inverse).

**État actuel** (commit `71c8eb9`, mode désiré) :

- **Named timeline** : `<section>` a `view-timeline: --rejoins` ; les enfants utilisent `animation-timeline: --rejoins` (même pattern que `bienvenue`).
- **Keyframes** :
  - `text-from-left` : `translateX(-120px)→0` sur `0%→40%` du cover
  - `horaires-from-below` : `translateY(60px)→0` sur `30%→60%` du cover
- **Stagger** : chaque `.rejoins-horaire` reçoit `--item-delay: Ns` inline, utilisé comme `animation-delay: var(--item-delay, 0s)` → 9h30 avant 10h.
- **`@supports`** : pas de `!important`, pas d'override de base. L'animation contrôle opacity+transform naturellement.
- **Admin mode** : `rejoins` est dans `SCROLL_DRIVEN_TYPES` + `shouldSkipTrigger()` → le navigateur scroll-driven joue normalement dans le preview admin. Safari non-supportant reçoit `triggered` class.
- **Fallback Safari** (non scroll-driven) : `.triggered .rejoins-text-container, .triggered .rejoins-horaire { opacity: 1; transform: none; }` inchangé.

**Historique des changements techniques** :
1. `57e72b8` — Première implémentation scroll-driven (text-glide/translateY, !important, rejoins dans SCROLL_DRIVEN_TYPES)
2. `e643f4e` — Retiré `rejoins` de SCROLL_DRIVEN_TYPES (admin cassé par !important)
3. `41c1a1a` — Nommé view-timeline `--rejoins`, plus de !important, rejoins remis dans SCROLL_DRIVEN_TYPES
4. `71c8eb9` — Ranges élargis (text 0-40%, horaires 30-60%) + stagger animation-delay

**Invariants** :
1. `SCROLL_DRIVEN_TYPES` doit contenir `"rejoins"` (admin scroll-driven natif)
2. `shouldSkipTrigger()` protège rejoins comme les autres scroll-driven
3. Pas de `!important` sur `opacity`/`transform` dans `@supports` — ça bloque les keyframes
4. Le stagger repose sur `--item-delay` inline + `animation-delay: var(--item-delay, 0s)` dans `@supports`
5. Fallback `.triggered` intact pour Safari non-supportant
