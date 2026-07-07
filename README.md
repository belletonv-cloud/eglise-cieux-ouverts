# Eglise Cieux Ouverts – Admin Builder

Modern CMS & admin builder for [cieuxouverts.bzh](https://cieuxouverts.bzh), a French church website. Built with **Nuxt 3**, **Vue 3**, **Firebase**, and **Cloudflare Pages**.

**Table of contents:**
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture-overview)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#full-documentation)

## Features

- **🎨 Modern admin builder** (Wix-like) with live preview
- **🔧 Schema-driven blocks**: 17 block types with auto-generated editors
- **✏️ Drag-and-drop**: Reorder blocks instantly via `vue-draggable-plus`
- **↩️ Undo/Redo**: 50-entry history + Ctrl+Z / Ctrl+Shift+Z
- **☁️ Cloud sync**: Firestore auto-save (3s debounce) + manual save
- **📱 Responsive preview**: Desktop/Tablet/Mobile in editor
- **🎬 Scroll animations**: CSS `animation-timeline` (Safari fallback)
- **📄 Full SSR**: Works without JavaScript, graceful animation degradation

---

## Prérequis Node.js (auto-switch avec Volta)

Ce projet utilise [Volta](https://volta.sh) pour garantir que **toutes les commandes npm/yarn s'exécutent toujours dans la bonne version de Node** (ici : Node 22.x). C'est auto : aucun réglage manuel n'est requis.

**Étapes :**
1. Si tu n'as pas encore Volta :
   ```bash
   curl https://get.volta.sh | bash
   # (Relance ensuite ton terminal)
   ```
2. Reviens dans le dossier projet, et Volta sélectionne Node 22 automatiquement pour toutes les commandes :
   ```bash
   cd eglise-cieux-ouverts
   node -v   # ➔ v22.x.x
   npm run dev   # Toujours la bonne version Node utilisée !
   ```
3. (Optionnel) Mets Volta à jour avec : `volta update`

**Avantages :**
- Zéro configuration supplémentaire
- Plus d'erreur "Wrangler requires Node 22" ou bug build
- Compatible Windows, Mac, Linux

> Volta est préconfiguré via le champ `volta.node` dans `package.json` : tout le monde a la même version Node, CI/CD compris.

---

## Quick Start

### Prerequisites
- **Node 22.x** (managed by Volta – see README below)
- **Firebase project** with Firestore database
- **git**

### Installation

```bash
# Clone and install
git clone <repo>
cd eglise-cieux-ouverts
npm install

# Configure Firebase secrets (.env)
cp .env.example .env
# Edit .env with your Firebase credentials from console.firebase.google.com

# Start dev server
npm run dev
# ➔ http://localhost:3000
```

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production (SSR) |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | Full E2E test suite |
| `npm run test:e2e:quick` | Quick E2E (no rebuild) |
| `npm run test:admin` | Admin-specific tests |
| `npm run deploy` | Build & deploy to Cloudflare Pages |

## Architecture Overview

### Block System (Schema-Driven)
Content is composed of **blocks**, each with a schema that auto-generates editor fields. Types include:
- **Hero** — Landing section with image, title, CTA
- **Text** — Rich text with styling
- **Gallery** — Image carousel with lightbox
- **Contact** — Contact form with Firestore/email integration
- **Calendar** — Event calendar (4 views: month/week/cards/agenda)
- And more... (see `BLOCK_TYPES` in `utils/blockTypes.js`)

### Admin Editor Flow
1. **Edit** → Sidebar auto-generates form from block schema
2. **Preview** → Live preview updates with responsive preview (desktop/tablet/mobile)
3. **Save** → Firestore with auto-save (3s) or manual button
4. **Undo/Redo** → 50-entry history locally

### Firestore Collections
- `pages/{slug}` — Page blocks & metadata
- `menu/{slug}` — Navigation menu items
- `footer` — Shared footer block

## Development

### Project Structure
```
eglise-cieux-ouverts/
├── components/
│   ├── blocks/          # Block implementations
│   ├── editor/          # Editor/sidebar components
│   └── admin/           # Admin-only components
├── composables/         # Reusable state & logic
├── lib/blocks/          # Block registry & types
├── pages/               # Routes (including [slug].vue for dynamic pages)
├── server/api/          # Firestore CRUD endpoints
├── assets/css/          # Styles (animations, layouts)
├── tests/playwright/    # E2E & admin tests (30+)
└── plugins/             # Firebase init, etc.
```

### Adding a New Block Type
1. Define schema in `utils/blockTypes.js` (`BLOCK_TYPES`)
2. Create `components/blocks/BlockMyType.vue`
3. Auto-registers via component discovery
4. Add tests in `tests/playwright/`

See [CLAUDE.md](./CLAUDE.md) for detailed examples.

## Testing

Playwright test suite with 3 configurations:

```bash
npm run test:e2e        # All E2E tests (with build)
npm run test:e2e:quick  # E2E tests (no rebuild)
npm run test:admin      # Admin editor workflows
npm run test:unit       # Isolated component tests
```

**Test coverage:**
- ✅ Admin editor (drag, edit, save, undo/redo)
- ✅ Block rendering & animations
- ✅ Responsive layouts
- ✅ Firestore persistence
- ✅ Accessibility (A11y)
- ✅ Error pages & edge cases

Tests run in mock mode (`PW_TEST=1`) with Firestore fixtures.

## Deployment

### Cloudflare Pages
```bash
npm run deploy
```

- Builds with Nuxt (SSR)
- Deploys to Cloudflare Pages via Wrangler
- Auto-generates version timestamp (detects new deployments)
- Fails early if Firebase API key missing

### Environment Setup
Set in **Pages environment variables**:
- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- (Others optional, see `.env.example`)

## Full Documentation

See **[CLAUDE.md](./CLAUDE.md)** for:
- High-level architecture deep-dive
- Block system & schema definitions
- Firestore persistence patterns
- Admin editor internals (undo/redo, auto-save)
- Animation system (scroll-driven CSS + fallbacks)
- Testing patterns & examples
- Troubleshooting guide

## Contributing

1. Fork and create feature branch
2. Make changes; run tests (`npm run test:e2e`)
3. Commit with clear message
4. Push and create PR

## License

MIT
