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
- **Tests** : Playwright (E2E)
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

- **Drag-and-drop** : mentionné dans le README mais pas implémenté
- **Persistance Firestore** : pas de sync automatique des blocs
- **Accent incohérent** : "Billetterie Évènements" vs "Événements"

## Conventions

- `npx nuxi dev` → développement local
- `npx nuxi build` → build statique
- Variables d'env dans `.env`
- Le dossier `app/` a été supprimé (stale scaffolding)
