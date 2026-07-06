# Hard Refresh Prevention & Mechanics

**tl;dr**: The app uses **SPA navigation** (Vue Router) + **iframe preview** + **smart deployment detection** to avoid hard refreshes except when absolutely necessary (new deployment).

---

## 1. Navigation Without Hard Refresh

### SPA Navigation (Client-Side Routing)

**File**: `layouts/default.vue` + Nuxt Router

All page navigation uses **client-side routing** (Vue Router), not full page reloads:

```ts
// When user clicks "Contact" link:
await page.click('text=Contact')
// → router.push('/contact') internally
// → URL changes to /contact
// → New page component renders
// → CSS transition animates (fade + slide, 250ms)
// → No hard refresh
```

**Mechanism**:
1. Nuxt/Vue Router intercepts link clicks
2. Fetches new page data (if needed) via API
3. Swaps component in DOM
4. CSS `pageTransition` animates old → new

**Key files**:
- `nuxt.config.ts`: `pageTransition: { name: 'page', mode: 'out-in' }`
- `assets/css/main.css`: `.page-enter-active`, `.page-leave-to` (fade + slide)
- `pages/[slug].vue`: Dynamic page route

---

## 2. Iframe Preview (Responsive)

### Desktop: Inline Rendering
- No iframe
- Page renders directly in layout
- Blocks are **editable** (drag, click)

### Tablet / Mobile: iframe Rendering
- `<iframe src="...?preview-inner=1&device=tablet">`
- Inner page loads at 768px / 375px width
- Parent ↔ iframe communication via `postMessage`

**Why iframe?**:
- Isolates responsive styles (no media query breakpoints interfering)
- Faithful preview of mobile layout
- Blocks still selectable (via postMessage)

### Dynamic Page Changes in Preview

**File**: `layouts/default.vue` line 108-151

When user changes page via dropdown in tablet/mobile mode:

```ts
watch(previewSlug, async (slug) => {
  // Fetch blocks for new page
  const res = await fetch(`/api/pages/${slug}`)
  const data = await res.json()
  enterAdmin(data.blocks || [], slug)
  // iframe automatically re-renders new page
  // iframe src changes: /contact?preview-inner=1&device=tablet
  // iframe loads new content WITHOUT reload of parent
})
```

**No hard refresh needed because**:
1. Parent stays at same URL
2. Only iframe src changes
3. Parent state updates
4. iframe loads fresh page content

---

## 3. Deployment Detection (version.txt)

### Why We Need This
When a new deployment happens:
- Old JS/CSS still in browser
- User might edit and save with old code
- New deployment could have schema changes
- **→ Force reload once to get new assets**

### How It Works

**File**: `plugins/deployment-check.client.ts`

1. **Build-time**: `nuxt.config.ts` writes `public/version.txt` with timestamp:
   ```ts
   writeFileSync('public/version.txt', Date.now().toString())
   ```

2. **Client startup**: Fetch and store version:
   ```ts
   fetchVersion() // → "1719089640000"
   ```

3. **Periodic checks** (throttled):
   - Every navigation: check version (60s throttle)
   - Tab becomes visible: check version (30s throttle)
   - Skip if in admin mode (don't interrupt edits)

4. **New deployment detected**:
   ```ts
   if (newVersion !== knownVersion) {
     window.location.reload() // Hard refresh ONLY here
   }
   ```

**Smart throttling**:
```ts
const now = Date.now()
if (now - lastCheckAt < throttleMs) return // Skip if checked recently
```

**Admin mode protection**:
```ts
if (isAdminMode.value) return // Don't reload mid-edit
```

---

## 4. bfcache Handling

### What is bfcache?
Browser's **Back/Forward Cache**: When user clicks back/forward, browser may restore a snapshot of the page instead of reloading it. This snapshot might be stale (from before a new deployment).

### Solution

**File**: `plugins/deployment-check.client.ts` line 41-45

```ts
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache, force reload
    window.location.reload()
  }
})
```

**Why**:
- `event.persisted = true` means browser restored from cache
- Snapshot is potentially old/stale
- Force reload gets new version from server

---

## 5. Admin Mode & Persistence

### Local Edits (No Hard Refresh Needed)
User can:
- **Edit blocks** → sidebar updates → preview updates immediately
- **Drag blocks** → reorder in real-time
- **Undo/Redo** → history stack restores state
- All WITHOUT reload

**State management**:
```ts
const localBlocks = ref([])    // Local copy (editable)
const undoStack = ref([])      // 50-entry history
const redoStack = ref([])      // Undo complement
```

### Auto-Save (3s Debounce)
When blocks change:
```ts
debounce(() => {
  // Save to Firestore (background)
  updatePageFirestore(slug, { blocks: localBlocks })
}, 3000)
```

**No hard refresh** — save happens in background, page keeps working.

### Manual Save
User clicks "Save" button:
1. Commits blocks to Firestore
2. Commits menu to Firestore
3. UI shows "Sauvegardé"
4. No reload

**Note**: If admin wants to see the changes reflected on the public page, they must navigate away and back (SPA navigation) or reload manually.

---

## 6. Responsive Overrides

### Device-Specific Props

When user edits in tablet mode:
1. Sidebar shows block props
2. Device buttons show active device (tablet)
3. Edits apply to `block.responsive.tablet`
4. Desktop props untouched

**File**: `composables/useAdmin.js` line 56-64

```ts
const sidebarBlock = computed(() => {
  const base = activeBlock.value
  if (!base) return base
  const device = previewDevice.value
  if (device && device !== 'desktop' && base.responsive?.[device]) {
    // Merge device overrides on top of base props
    return { ...base, props: { ...base.props, ...base.responsive[device] } }
  }
  return base
})
```

**No reload needed** — sidebar reactively updates as device changes.

---

## 7. iframe Communication (postMessage)

### Parent ↔ iframe Messaging

**From iframe** (inner preview):
```ts
// User clicks link inside iframe
e.preventDefault()
window.parent.postMessage({ type: 'navigate', slug: 'contact' }, '*')
```

**In parent**:
```ts
window.addEventListener('message', (e) => {
  if (e.data?.type === 'navigate') {
    onNavigatePreview(e.data.slug)  // Update dropdown
    // iframe src auto-updates, loads new page
  }
})
```

**Result**: No hard refresh, smooth navigation within preview.

---

## 8. Test Coverage

**New test suite**: `tests/playwright/no-hard-refresh.spec.ts`

Tests validate:
- ✅ SPA navigation (accueil → contact → agenda)
- ✅ Page transitions animate smoothly (not instant)
- ✅ Iframe preview updates (tablet/mobile)
- ✅ Iframe navigation (links inside iframe work)
- ✅ Admin edits (no reload on drag/undo/redo)
- ✅ Save button (no reload)
- ✅ Version check (detects deployment)
- ✅ bfcache restoration (back/forward reload)
- ✅ Responsive overrides (tablet props isolated from desktop)
- ✅ Page dropdown updates iframe

---

## 9. When Hard Refresh DOES Happen (Intentionally)

### Only in These Cases:

1. **New deployment detected** (version.txt changed)
   - Necessary to load new JS/CSS
   - Happens once, then page continues normally

2. **User manually refreshes** (Cmd+R, F5)
   - User choice, expected behavior

3. **bfcache restoration** (browser back/forward after deployment)
   - Ensures latest assets loaded

4. **Browser crashes or memory pressure** (out of scope)

### NOT triggered by:
- ❌ Changing pages
- ❌ Editing blocks
- ❌ Saving changes
- ❌ Switching devices
- ❌ Dragging blocks
- ❌ Undo/Redo

---

## 10. Debugging & Monitoring

### Check Console for Version Checks
```js
// In browser DevTools, watch for version fetches:
fetch('/version.txt')  // Should succeed
// Response: "1719089640000"
```

### Verify SPA Navigation
```js
// Before navigation
window.location.href  // "http://localhost:3000/accueil"

// After clicking "Contact" (no reload)
window.location.href  // "http://localhost:3000/contact"
// Same session, same scripts running
```

### Check Deployment Detection is Working
```js
// In nuxtApp
const versionCheck = window.__NUXT__?.hook?.('page:finish')
// Should be called on every page transition
// Should throttle version checks (60s between checks)
```

---

## Conclusion

**Église Cieux Ouverts** achieves seamless editing without hard refreshes through:

1. **SPA navigation** (Vue Router, not page reloads)
2. **Responsive iframe preview** (isolates mobile layouts)
3. **Smart deployment detection** (reload only on new version)
4. **Async persistence** (auto-save in background)
5. **Proper bfcache handling** (reload after browser cache restoration)
6. **Device-isolated state** (tablet edits don't affect desktop)

The result: **Fast, responsive admin experience** with hard refreshes only when necessary.
