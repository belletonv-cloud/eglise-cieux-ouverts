---
applyTo: '**'
---

# Statut Playwright E2E admin – 26/05/2026

## Correctifs appliqués pour que les tests admin puissent tourner

### Session précédente (25/05)
- 💡 Résolu : `TypeError: (0 , _global.expect) is not a function` ➔ export `{ expect }` ajouté dans `admin-fixtures.ts`
- ✅ Tous les imports Playwright normalisés

### Session en cours (26/05)
- 🛠️ `playwright.config.ts` : `PW_TEST=1` ajouté à la commande `nuxi preview` pour activer le mode test
- 🛠️ `nuxt.config.ts` : `TEST_ENV` déplacé dans `runtimeConfig.public` pour être accessible côté client
- 🛠️ `plugins/auth-mock.client.ts` : utilisation de `config.public.TEST_ENV` + ajout `onAuthStateChanged` mock
- ❌ **admin-mock.spec.ts encore rouge** — `.admin-toolbar` introuvable. Cause probable : le build `/event-list` avec `?admin=true` retourne une 404 dans le navigateur Playwright (pourtant curl → 200). Nécessite investigation supplémentaire.

## Tests actuellement
| Test | Statut |
|------|--------|
| `sanity.spec.ts` | ✅ |
| `debug-env.spec.ts` | ✅ |
| `aspirations.spec.ts` | ❌ (préexistant, fonctionnel) |
| `admin-mock.spec.ts` | ❌ (`.admin-toolbar` non trouvé) |
| `admin-mock-fixtures.spec.ts` | ❌ (même cause) |
| `admin-mode.spec.ts` | ❌ |
| `admin-autosave.spec.ts` | ❌ |
| `admin-undo-redo.spec.ts` | ❌ |
| `admin-animations.spec.ts` | ❌ |
| `admin-mock.spec.ts` | ❌ |

## Problème persistant (admin-mock)
- `npx playwright test` lance le `webServer` avec `PW_TEST=1 npx nuxi preview` sur port 3001
- Le build `.output/` doit être fait avec `PW_TEST=1` (preset `node-server`)
- `sanity.spec.ts` passe ✅
- `admin-mock.spec.ts` navigue vers `/event-list?admin=true` mais reçoit une page 404
- Pourtant `curl http://localhost:3001/event-list?admin=true` retourne 200 ✅
- Hypothèse : redirect ou middleware côté client qui envoie vers 404

## Tâches pour reprise (avec GPT-4.1 / 5 Mini)
1. Debugger pourquoi Playwright voit une 404 sur `/event-list?admin=true` (alors que curl 200)
   - Activer `page.on('console')` + `page.on('request')` / `page.on('response')` dans le test
   - Utiliser `page.pause()` pour inspecter en mode headful
   - Vérifier les network headers et les éventuelles redirections Nuxt
2. Si 404 résolue, vérifier que `auth-mock.client.ts` s'active bien (config.public.TEST_ENV)
3. Si auth fonctionne, vérifier les assertions sur les blocs (hero, text-img, spacer)
4. Ensuite traiter les autres tests admin un par un

## Pour build + test en local
```bash
# 1. Build avec PW_TEST=1
PW_TEST=1 npm run build

# 2. Lancer le test (Playwright démarre le preview automatiquement)
npx playwright test tests/playwright/admin-mock.spec.ts

# Alternative : preview manuelle
PW_TEST=1 NITRO_PORT=3001 NITRO_HOST=0.0.0.0 npx nuxi preview
npx playwright test tests/playwright/admin-mock.spec.ts
```
