import { test as base } from '@playwright/test'

export const test = base.extend({
  adminLogin: async ({ page }, use) => {
    await page.goto('/event-list?admin=true')
    await use(page)
  },
  resetMock: async ({ request }, use) => {
    await use(async () => {
      await request.post('/api/reset-mock')
    })
  },
  getSnapshot: async ({ page }, use) => {
    async function getSnapshotFn() {
      const res = await page.request.get('/api/pages/event-list')
      return await res.json()
    }
    await use(getSnapshotFn)
  },
  expectOrder: async ({ page }, use) => {
    async function expectOrderFn(expectedIds) {
      const ids = await page.locator('.block-draggable').evaluateAll(els =>
        els.map(el => el.getAttribute('data-block-id'))
      )
      expect(ids).toEqual(expectedIds)
    }
    await use(expectOrderFn)
  },
  moveBlock: async ({ page }, use) => {
    async function moveBlockFn(fromIdx, toIdx) {
      const blocks = page.locator('.block-draggable');
      const from = await blocks.nth(fromIdx).getAttribute('data-block-id');
      const to = await blocks.nth(toIdx).getAttribute('data-block-id');
      await blocks.nth(fromIdx).locator('.block-draggable-handle').dragTo(blocks.nth(toIdx));
      return { from, to };
    }
    await use(moveBlockFn)
  },
  editBlock: async ({ page }, use) => {
    async function editBlockFn(blockId, { title }) {
      // Sélectionne le bloc
      await page.locator(`.block-draggable[data-block-id="${blockId}"]`).click()
      // Change le champ titre dans sidebar autoeditor
      const editor = page.locator('.sidebar-autoeditor')
      if (await editor.locator('input[placeholder="Titre"], input[placeholder="title"]').count()) {
        await editor.locator('input[placeholder="Titre"], input[placeholder="title"]').fill(title)
      } else {
        // Surcharge fallback simple
        await editor.locator('input[type="text"]').first().fill(title)
      }
      // Sort du field pour trigger la sauvegarde
      await page.locator('body').click({ position: { x: 10, y: 10 } })
    }
    await use(editBlockFn)
  },
  undo: async ({ page }, use) => {
    async function undoFn() {
      await page.keyboard.press('Control+Z')
    }
    await use(undoFn)
  },
  redo: async ({ page }, use) => {
    async function redoFn() {
      await page.keyboard.press('Control+Shift+Z')
    }
    await use(redoFn)
  },
  waitForAutosave: async ({ page }, use) => {
    async function waitForAutosaveFn() {
      // Attend le feedback visuel (classe ou texte)
      await page.waitForSelector('.auto-saved', { timeout: 4000 })
      await page.locator('.auto-saved').waitFor({state: 'visible'})
    }
    await use(waitForAutosaveFn)
  },
})
