# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Église Cieux Ouverts** is a modern admin builder (Wix-like) for a church website, built with **Nuxt 3**, **Vue 3**, and **Firebase/Firestore**. It features:

- **Schema-driven block system**: 13+ block types (Hero, Text, Gallery, Events, etc.) with auto-generated editors
- **Live editing**: Drag-and-drop reordering, undo/redo (50-entry history), auto-save with debounce
- **Responsive preview**: Desktop/Tablet/Mobile preview in a split pane
- **Cloud persistence**: Firestore with auto-save (3s debounce) + manual save
- **Scroll-driven animations**: CSS `animation-timeline` (Safari fallback via IntersectionObserver)
- **No-JS fallback**: Full SSR, animations degrade gracefully without JavaScript
- **Deployment**: Cloudflare Pages

## Quick Start

### Node Version (auto-managed by Volta)
This project uses **Node 22.x** via Volta. No manual version switching needed:
```bash
cd eglise-cieux-ouverts
npm run dev  # Volta auto-selects Node 22
```

### Installation & Setup
```bash
npm install

# Set up Firebase secrets in .env:
# PUBLIC_FIREBASE_API_KEY=XXX
# PUBLIC_FIREBASE_AUTH_DOMAIN=XXX
# PUBLIC_FIREBASE_PROJECT_ID=XXX
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | Run full E2E test suite (builds first) |
| `npm run test:e2e:quick` | Run E2E tests without rebuild |
| `npm run test:admin` | Run admin-specific tests (`playwright.admin.config.ts`) |
| `npm run test:unit` | Run unit tests (`playwright.unit.config.ts`) |
| `npm run deploy` | Build and deploy to Cloudflare Pages |
| `npm run preview:local` | Run production server locally on port 3001 |

### Test Debugging
```bash
# Run a specific test file
npx playwright test tests/playwright/admin-mode.spec.ts

# Run with UI (interactive)
npx playwright test --ui

# Run a single test by name
npx playwright test -g "should enter admin mode"

# View HTML report
npx playwright show-report
```

## Architecture

### 1. Block System (Schema-Driven)

All content is composed of **blocks**, each with:
- **Type**: One of ~13 types (Hero, Aspirations, Contact, Gallery, etc.)
- **Props**: Content (text, images, links, etc.)
- **Design**: Colors, spacing, fonts (auto-generated editor fields)
- **Responsive overrides**: Device-specific props (desktop/tablet/mobile)

**Key files:**
- `lib/blocks/types.ts` — Block type definitions and schema
- `lib/blocks/renderer.ts` — Maps block type → Vue component
- `lib/blocks/component-registry.ts` — Auto-discovers block components
- `components/blocks/Block*.vue` — Individual block components (13 total)

**Example block structure:**
```json
{
  "id": "block-hero-1",
  "type": "hero",
  "props": {
    "title": "Welcome",
    "subtitle": "To our church",
    "image": "/images/hero.jpg"
  },
  "design": {
    "bgColor": "#064886"
  },
  "responsive": {
    "tablet": { "title": "Short title" },
    "mobile": { "subtitle": "" }
  }
}
```

### 2. Page Rendering

**Dynamic pages** (`pages/[slug].vue`):
1. Fetch page blocks from Firestore (or mock data in test mode)
2. Render each block via `BlockRenderer.vue`
3. In admin mode, enable editing via sidebar
4. Auto-save changes on 3s debounce

**Key composables:**
- `useAdmin()` — Admin state (isAdminMode, editingBlockId, undo/redo, unsavedChanges)
- `useBlockAnimation()` — Scroll-driven animations (IntersectionObserver fallback)
- `useChurchEvents()` — Church events calendar data
- `useMenuEditor()` — Menu item CRUD (Firestore sync)

### 3. Admin Editor

**Sidebar Editor** (`components/editor/AutoEditor.vue`):
- Auto-generates form fields based on block schema
- Supports text, rich text, color, image, select, toggle, etc.
- Device-responsive controls (desktop/tablet/mobile)
- Real-time validation

**Toolbar Actions:**
- Save (commits blocks + menu to Firestore)
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Device preview toggle
- Admin mode toggle

**Drag-and-drop:**
- Powered by `vue-draggable-plus`
- Reorder blocks within a page
- Updates local state; saved on manual save

### 4. Firestore Persistence

**Collections:**
- `pages/{pageSlug}` — Page blocks, metadata
- `menu/{menuSlug}` — Menu items (site navigation)
- `footer` — Shared footer block

**Auto-save mechanism** (useAdmin.js):
```js
// On block change:
debounce(() => {
  // Commit to Firestore
  updatePageFirestore(slug, { blocks: localBlocks })
}, 3000)
```

**Manual save:**
- Toolbar "Save" button
- Saves both blocks and menu in one atomic operation
- Triggers `savePageAndMenu()` → `updatePageFirestore()` + `updateMenuFirestore()`

### 5. Animations

**Scroll-driven (CSS `animation-timeline`):**
- Only on desktop; mobile disables for perf
- Fallback: IntersectionObserver + `will-change: transform`
- Safari uses IntersectionObserver (no `animation-timeline` support)

**Page transitions:**
- Nuxt `pageTransition` in nuxt.config.ts
- CSS in `assets/css/main.css` (fade + slide)

**Block animations:**
- IntersectionObserver triggers on block visibility
- Custom animation per block type (e.g., BlockBienvenue fan-out, BlockAspirations sticky scroll)

### 6. Responsive Design

**Device preview in admin:**
- Desktop (full width)
- Tablet (768px)
- Mobile (375px)

**Editor behavior:**
- Edit base props for all devices
- Override per-device via responsive toggle
- Preview updates immediately

**CSS:**
- Media queries for layout shifts (tablet/mobile)
- `height: auto` instead of `position: sticky` on mobile (Aspirations section)

### 7. Testing Strategy

**Playwright configs:**
- `playwright.config.ts` — E2E (public pages)
- `playwright.admin.config.ts` — Admin editor workflows
- `playwright.unit.config.ts` — Isolated component tests

**Test structure** (`tests/playwright/`):
- `admin-*.spec.ts` — Admin editor tests (30+ tests)
- `sanity.spec.ts` — Build smoke tests
- `animation-*.spec.ts` — Scroll/animation verification
- `accessibility.spec.ts` — A11y checks
- `responsive-*.spec.ts` — Responsive layout tests

**Key test patterns:**
```ts
// Admin mode: edit and save
await page.goto('/admin')
await page.click('[data-edit-block-id="block-hero-1"]')
await page.fill('input[name="title"]', 'New Title')
await page.click('[data-save-button]')

// Public preview
await page.goto('/')
await expect(page.locator('h1')).toContainText('New Title')
```

**Test environment:**
- `PW_TEST=1` env var enables mock fixtures
- Mock Firestore in `tests/playwright/fixtures/`
- Nuxt serves on localhost:3001 during test

## Key Files

| Path | Purpose |
|------|---------|
| `nuxt.config.ts` | Build config, Firebase env, Nitro preset (Cloudflare vs node-server) |
| `lib/blocks/*` | Block registry, types, renderer |
| `components/blocks/Block*.vue` | 13 block type components |
| `composables/useAdmin.js` | Admin state + undo/redo |
| `composables/useBlockAnimation.js` | Scroll animations |
| `pages/[slug].vue` | Dynamic page route + admin editor |
| `server/api/pages/*` | Firestore page CRUD endpoints |
| `tests/playwright/*` | E2E test suite |

## Development Patterns

### Adding a New Block Type

1. Define schema in `lib/blocks/types.ts`:
   ```ts
   MyBlock: {
     label: 'My Block',
     defaults: { title: 'Hello', bgColor: '#fff' },
     schema: [
       { name: 'title', type: 'text', label: 'Title' },
       { name: 'bgColor', type: 'color', label: 'Background' }
     ]
   }
   ```

2. Create component `components/blocks/BlockMyBlock.vue`

3. Auto-register (component-registry.ts discovers `Block*.vue` files)

4. Add tests in `tests/playwright/blocks-*.spec.ts`

### Testing Block Rendering

```ts
test('BlockMyBlock renders title', async ({ page }) => {
  // Load page with block via fixture
  const snapshot = await page.evaluate(() => {
    return window.__FIXTURES__.pages.home.blocks
  })
  
  // Edit in admin
  await page.click('[data-edit-block-id="block-my-1"]')
  await page.fill('input[name="title"]', 'Updated')
  
  // Verify render
  await expect(page.locator('text=Updated')).toBeVisible()
})
```

### Debugging Admin State

Open browser console during admin edit:
```js
// Check current blocks state
window.__NUXT__?.$root?.$data?.localBlocks

// Check undo/redo stacks
window.__NUXT__?.$root?.$data?.undoStack
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NUXT_PUBLIC_FIREBASE_API_KEY` | Firebase public key | `AIzaSy...` |
| `NUXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project | `eglise-cieux-ouverts` |
| `PW_TEST` | Enable mock mode (Playwright) | `1` |
| `NITRO_PORT` | Server port (preview/test) | `3001` |
| `NUXT_PUBLIC_API_URL` | Contact form endpoint | `https://...` |
| `CF_PAGES_BRANCH` | Deployment branch (auto) | `production` |

## Deployment

**Cloudflare Pages:**
```bash
npm run deploy
```

- Builds with `nuxt build` (SSR)
- Deploys to Cloudflare Pages via `wrangler pages deploy`
- Version timestamp written to `public/version.txt` (detects new deployments)
- Fails early if Firebase API key is missing

**Version check** (in client plugin):
- Periodically fetches `version.txt`
- If new version detected, shows "Refresh" prompt
- Auto-reload on page focus if new deployment

## Known Constraints

1. **Safari animations**: CSS `animation-timeline` not supported; uses IntersectionObserver fallback
2. **External images**: Some images loaded from static.wixstatic.com (legacy)
3. **No offline mode**: Firestore persistence requires connectivity
4. **Admin-only features**: Edit mode only accessible to authenticated users (Google Sign-In)

## Git & Branches

- Main branch: `main`
- Active development: feature branches
- Recent commits focus on bug fixes (animations, SSR hydration, admin stability)
- `AGENTS.md` contains AI-generated notes on codebase

## Useful Commands for Development

```bash
# Dev with hot reload
npm run dev

# Build and test locally
npm run build:e2e
npm run test:e2e:quick

# Debug a failing test
npx playwright test tests/playwright/admin-mode.spec.ts --debug

# Check build size
npm run build && du -sh .output

# Reset mock data (in test mode)
curl http://localhost:3001/api/reset-mock
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing NUXT_PUBLIC_FIREBASE_API_KEY" | Set env vars before `npm run build` |
| Tests timeout on CI | Increase timeout in playwright.config.ts |
| Admin mode not saving | Check browser console for Firestore errors; verify `.env` |
| Animations not smooth | Disable on mobile or use `will-change: transform` |
| Node version mismatch | Run `npm install` again (Volta auto-selects Node 22) |
