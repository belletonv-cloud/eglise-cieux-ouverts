# CLAUDE.md

Guide pour Claude Code dans ce dépôt. Pour ce que fait le site (périmètre, fonctionnalités), voir **[FEATURES.md](./FEATURES.md)** — à respecter et tenir à jour, pas à dupliquer ici. Ce fichier ne contient que ce qui est nécessaire à chaque session (commandes, pièges non déductibles du code) — le reste (historique, correctifs passés) est dans `git log`, pas ici.

## URLs & environnements

| Env | Branche | Firebase | URL |
|---|---|---|---|
| Production | `main` | `eglise-cieux-ouverts` | https://eglise-cieux-ouverts.pages.dev |
| Recette | `recette` | `eglise-cieux-ouverts-rec` (Spark gratuit) | https://recette.eglise-cieux-ouverts.pages.dev |

Déploiement auto : push sur `main`/`recette` → Cloudflare Pages build via `bash build.sh` (exporte les secrets Firebase recette si `CF_PAGES_BRANCH === "recette"`, puis `npm ci && npm run build`). `npm run deploy` en local existe mais nécessite `wrangler login` — le CI est plus fiable, ne pas l'utiliser sauf besoin explicite.

Le site public réel (cieuxouverts.bzh) n'est pas ce déploiement — domaine non attaché à ce projet Cloudflare Pages pour l'instant.

## Node.js

**Node 22 uniquement**, géré par Volta (`package.json` → `volta.node`). `volta run --node 22 <commande>` si l'environnement shell dérive vers une autre version.

## Commandes

```bash
npm run dev              # dev local
npm run build:e2e        # build utilisé par les tests (PW_TEST=1)
npx playwright test --config=playwright.unit.config.ts tests/schema-driven/   # tests unit/schema-driven
npx playwright test --config=playwright.config.ts                             # E2E complet
npx tsx scripts/add-block.ts monBloc      # générer le squelette d'un nouveau bloc
npx tsx scripts/generate-tests.ts         # régénérer tests/schema-driven/generated/
```

## Pièges non évidents

- **Footer sans sauvegarde explicite** : `settings/footer` peut être `null` en Firestore indéfiniment — le site tourne alors sur `BLOCK_TYPES.footer.defaults` (`utils/blockTypes.js`). Ne jamais neutraliser ces defaults sans vérifier d'abord si le vrai footer a été explicitement sauvegardé (sinon régression silencieuse en prod, déjà arrivée une fois).
- **`normalizeBlock()`** (`lib/blocks/renderer.ts`) réapplique `BLOCK_TYPES[type].defaults` à CHAQUE rendu (pas seulement à la création) pour tout prop vide/absent — donc changer un default de type peut changer l'affichage de contenu déjà existant si ce contenu n'a jamais explicitement écrasé ce champ.
- **`HARDCODED_SLUGS`** (`accueil`, `contact`, `messages`, `event-list`, `agenda`, `photos`) sont protégés en création/suppression (`POST`/`DELETE /api/pages/:slug`) mais PAS en écriture (`PUT`) — c'est le chemin d'édition normal de leur contenu réel.
- **Sauvegarde et changement de page** : `saveToServer()` (`AdminToolbar.vue`) doit vérifier `localBlocksPage === props.pageSlug` avant d'écrire — sans ce garde-fou, une sauvegarde différée (debounce 3s) déclenchée après un changement de page écrit le contenu de l'ancienne page sur le slug de la nouvelle (déjà arrivé, a écrasé la page d'accueil réelle).
- **`auth.onAuthStateChanged`** existe déjà nativement sur le SDK Firebase (méthode du prototype, compat v8) — ne jamais le réassigner : la fonction libre `onAuthStateChanged(auth, callback)` délègue en interne à `auth.onAuthStateChanged(callback)`, donc l'écraser crée une récursion infinie (`RangeError: Maximum call stack size exceeded`, déjà constaté en prod).
- **Tout listener `onAuthStateChanged` doit être désabonné (`onUnmounted`)** — `pages/admin.vue` en avait un jamais désabonné, resté actif après navigation, corrompant l'état interne de Vue (`Cannot destructure property of null` en cascade, plus aucune interaction possible jusqu'à hard refresh). Non reproductible avec l'auth mock habituelle (`?admin=true` + `enterAdmin([])` direct) — seulement en passant réellement par `/admin` (connexion Google réelle, ou `plugins/auth-mock.client.ts` en test). Corrigé, mais si un futur composant ajoute son propre listener d'auth, vérifier le cleanup.
- **`layouts/default.vue` est persistant** (ne remonte pas entre navigations de page) et réagit à `route.query.admin` via son propre watcher, indépendamment de toute page enfant qui naviguerait suite à sa propre résolution d'auth — après une connexion réussie, préférer `window.location.href` (rechargement complet) à `navigateTo()` pour éviter une course entre le swap de page et les `v-if` du layout qui basculent en parallèle (déjà arrivé, cause du bug ci-dessus).
- **Événements = backend séparé** (Worker `eglise-app` + D1, pas Firestore). Ne jamais créer d'endpoint/collection Firestore parallèle pour les événements — un système parallèle non connecté au site public a déjà été tenté et annulé.
- **`d1 migrations apply` sur `eglise-db`** (repo `eglise-app`) : ne jamais lancer, la table de suivi est désynchronisée. Toujours `d1 execute --file` ciblé.
- **`routes/index.js` du repo `eglise-app`** doit utiliser `import` (pas `export … from`) pour les routes qu'il combine en `routes0`/`routes2`/`routes3` — un réexport ne crée pas de liaison locale, ça a bloqué le déploiement du Worker pendant un moment sans erreur visible avant `wrangler deploy`.
- **`<component :is>` pour les blocs** : cassait l'hydratation SSR — `BlockRenderer.vue` utilise une chaîne `v-if`/`v-else-if` explicite à la place.
- **Cache Cloudflare** (`public/_headers`) : HTML en `no-cache`, assets `/_nuxt/*` en cache long. Sans ça, un déploiement peut servir un ancien HTML référençant un bundle JS qui n'existe plus.
- **`window.addEventListener('pageshow', ...)`** (`plugins/deployment-check.client.ts`) doit exclure `isAdminMode` comme les deux autres listeners du même fichier — sinon un reload forcé au retour de bfcache (changement d'onglet) écrase silencieusement les modifications admin non sauvegardées.
- **Shell cwd** : dérive fréquemment hors du dossier projet entre commandes (observé plusieurs fois vers un tout autre dépôt) — toujours `cd` explicitement et vérifier `pwd` en tête de chaque commande, ne jamais supposer que le répertoire précédent a persisté.
- **Ne jamais lire/exposer les credentials `.env` (service account Firestore, clés privées)** directement (cat, grep de valeurs, scripts qui les chargent pour appeler l'API Firestore en direct) — action bloquée par le garde-fou de sécurité et à juste titre : pour toute opération nécessitant une authentification réelle en prod, passer par l'API applicative existante avec un token utilisateur (ex: token du navigateur de l'utilisateur, jamais collé en clair dans une commande shell — utiliser un fichier de config `curl -K` si besoin), ou demander à l'utilisateur d'agir lui-même depuis l'admin.
- **Intégration eglise-app (authentification inter-apps)** : les deux apps (`eglise-cieux-ouverts` + `eglise-app` Worker) partagent **deux projets Firebase distincts** mais acceptent mutuellement leurs tokens `Bearer` (voir `src/auth.js` eglise-app, lignes 130-136). Le site envoie son token Firebase `eglise-cieux-ouverts` au Worker ; le Worker le valide (iss/aud check) et retourne les données. **Jamais** créer de clé secrète partagée ou de token servicé inter-apps — la validation mutuelle est déjà garantie par Firebase keyring public (JWKS). Les endpoints sont proxifiés via `server/api/members.get.ts` (lit le Bearer du client, le passe à eglise-app, cache rien en local — chaque appel est frais depuis le Worker).
- **Configuration contexte (settings)** : `GET/PUT /api/settings` (*eglise-cieux-ouverts* seulement, pas synchronisé vers eglise-app) stocke la config applicative simple (email de destination du formulaire contact). Stockée en Firestore `settings/config` (document), pas en mock RAM partagé comme les commentaires/contacts — donc persist l'admin à travers redéploiement et changements d'env (contrairement aux pages qui peuvent être écrasées accidentellement, settings est très volumineux une fois, jamais reécrit par la suite).

## Tests

- `tests/schema-driven/` (config `playwright.unit.config.ts`) : intégrité de schema, rendu SSR/admin/responsive/a11y, génériques par bloc + specs dédiées
- `tests/playwright/` (config `playwright.config.ts`) : E2E, parcours admin, auth, navigation
- `PW_TEST=1` : toutes les I/O Firestore passent par `server/utils/firestore-mock.js` (RAM). `resetMock(request)` dans `beforeEach` — le mock est partagé entre workers parallèles.
- Helpers : `tests/playwright/helpers/{admin,blocks,reset}.ts`

## Ajouter un bloc

1. `npx tsx scripts/add-block.ts monBloc` → génère composant + test + snippet de schema
2. Copier le schema affiché dans `utils/blockTypes.js` (`BLOCK_TYPES`)
3. `PageRenderer.vue`/`BlockRenderer.vue` découvrent les composants `Block*.vue` automatiquement (`import.meta.glob`) — pas d'enregistrement manuel
4. Pour chaque champ `text`/`textarea`/`richtext` visuel du schema : ajouter la prop `fieldFonts: { type: Object, default: () => ({}) }` et appliquer `:style="fieldFontStyle(fieldFonts, 'monChamp')"` sur l'élément qui l'affiche (voir `utils/fonts.js` et n'importe quel `Block*.vue` existant) — sinon le sélecteur de police apparaît dans la sidebar mais ne fait rien.

## Autres docs

`PRE-DEPLOYMENT-CHECKLIST.md`, `REFRESH-MECHANICS.md`, `SECURITY.md` — consulter au besoin, pas chargées par défaut.
