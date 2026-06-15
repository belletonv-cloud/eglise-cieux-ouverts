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
- **Tests** : Playwright E2E (admin ✅, sanity ✅, aspirations ✅) + unit/schema-driven (261 tests ✅)
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

## Correctifs appliqués le 14/06/2026

### 1. Playwright admin tests — sélecteurs CSS corrigés
- Les tests admin utilisaient `.block-hero`, `.block-text-img`, `.block-spacer` comme sélecteurs, mais `PageRenderer.vue` n'ajoute pas de classe `.block-{type}` — il utilise `data-block-type`.
- **Fix**: Remplacer par `[data-block-type="hero"]` etc.
- Tests concernés : `admin-mock.spec.ts`, `admin-mock-fixtures.spec.ts`, `admin-autosave.spec.ts`, `admin-undo-redo.spec.ts`, `admin-animations.spec.ts`

### 2. `event-list.vue` — `useLazyFetch` → `useFetch`
- `useLazyFetch` ne sérialise pas les données dans le payload Nuxt → le client ne reçoit jamais les données mock, la page affiche toujours le fallback.
- **Fix**: Remplacer `useLazyFetch` par `await useFetch` pour bloquer le rendu SSR et sérialiser correctement les données.

### 3. `useBlockAnimation.js` — bug `isAdmin` non défini
- `shouldSkipTrigger(type)` référençait `isAdmin` comme variable libre sans qu'elle soit définie dans le scope → ReferenceError sur le client pour les blocs `SCROLL_DRIVEN_TYPES` en mode admin.
- **Fix**: Ajouter `isAdmin` comme paramètre : `shouldSkipTrigger(type, isAdmin)`, mettre à jour les 3 call sites.

### 4. Tests `aspirations.spec.ts` — Chromium scroll-driven
- Le test attendait la classe `triggered` sur les blocs `SCROLL_DRIVEN_TYPES` (rejoins, aspirations), mais Chromium supporte `animation-timeline: view()` → ces blocs utilisent l'animation CSS native, pas `triggered`.
- **Fix**: Remplacer par des assertions de visibilité. `bienvenue` (wrapper) conserve la vérification `triggered`.

### 5. Tests unitaires manquants
- `tests/unit/fields/FieldImage.spec.ts` et `FieldRichText.spec.ts` créés (10 tests, pattern static checks).
- `playwright.unit.config.ts` créé pour exécuter les tests unitaires et schema-driven (orphelins depuis la config principale).
- Script `test:unit` ajouté au `package.json`.

### 6. Généré tests automatisés (14/06/2026)
- `scripts/generate-tests.ts` — génère `tests/schema-driven/generated/generated-tests.spec.ts` (15 blocs, 6 sections, ~200 tests)
- `scripts/add-block.ts` — CLI pour générer un nouveau bloc (composant + test) avec validation
- Fix : échappement des apostrophes dans les labels + chemins relatifs corrects pour le sous-répertoire
- `tests/schema-driven/generated/` ajouté à `.gitignore`

### 7. Bloc YouTube dans page messages (14/06/2026)
- Le bloc `richText` avec iframe YouTube encodé en dur remplacé par un vrai bloc `youtube`
- Utilise `videoId: "wZebQj0gR98"`, fond gradient `DEFAULT_MESSAGES_GRADIENT`

### 8. `bienvenue` retiré de `SCROLL_DRIVEN_TYPES` (15/06/2026)
- `bienvenue` utilise `animations: "wrapper"` mais était listé dans `SCROLL_DRIVEN_TYPES` avec les vrais blocs scroll-driven
- Conséquence : l'IntersectionObserver ne l'observait pas, la classe `triggered` n'était jamais ajoutée, l'animation `portal` ne jouait pas
- Fix : retiré des tableaux `SCROLL_DRIVEN_TYPES` et `INTERNAL_TYPES`

### Compteurs tests (15/06/2026)
- **Playwright admin** : 113 tests (9 spec files) ✅ all passing
  - admin-mock (21), admin-mock-fixtures (6), admin-autosave (7), admin-undo-redo (4), admin-mode (4), admin-animations (26), aspirations (3), admin-exploration (4), event-list-fallback (?)
- **Schema-driven non-generated** : 118 tests (all-blocks, new-features, hero, text-image) ✅
- **Schema-driven generated** : 248 tests (15 blocks × 6 sections) ✅
- **Total** : 479 tests ✅

### 9. Final cleanup (15/06/2026)
- Missing imports fixed in BlockGallery (ref, computed), BlockFullWidthImage (computed), BlockSpacer (computed) — prevented runtime crashes
- Empty catch blocks (30+) replaced with console.warn across 7 files
- Unused imports removed from BlockAspirations, BlockRejoins, BlockNousRejoindre, BlockYoutube
- v-html XSS vectors sanitized with DOMPurify in BlockVision, BlockActivities
- showDragHandle test-specific code (window.__PW_TEST) removed from BlockHero
- console.debug calls removed from PageRenderer (9+)
- Generated tests fixed: selectors `.block-*` → `[data-block-type="*"]`, `.catch(() => {})` removed
- TypeScript: EventPopover fixed (Function → MouseEvent/PointerEvent types, CSSProperties)
- Playwright helper imports changed to type-only (admin.ts, blocks.ts, reset.ts, ui.ts)
- npm: swiper upgraded 11.2.10 → 12.2.0 (critical vuln fixed)
- Admin exploration test fixed (rejoins scroll-driven class assertion)
