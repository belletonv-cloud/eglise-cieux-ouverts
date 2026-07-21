import { test as base, expect } from '@playwright/test'
import { test as adminBase } from './admin-fixtures'

// Retourne l'état mock Firestore actuel
async function getSnapshotImpl(apiContext: import('@playwright/test').APIRequestContext) {
  const res = await apiContext.get('/api/mock-snapshot');
  return res.json();
}

export const test = adminBase.extend<{
  getSnapshot: () => Promise<any>
  expectOrder: (expectedOrder: string[]) => Promise<void>
  undo: () => Promise<void>
  redo: () => Promise<void>
  waitForAutosave: () => Promise<void>
}>({
  getSnapshot: async ({ request }, use) => {
    await use(() => getSnapshotImpl(request))
  },
  expectOrder: async ({ getSnapshot }, use) => {
    await use(async (expectedOrder: string[]) => {
      const snapshot = await getSnapshot()
      const ids = snapshot.blocks.map((b: any) => b.id)
      expect(ids).toEqual(expectedOrder)
    })
  },
  undo: async ({ page }, use) => {
    await use(async () => {
      await page.keyboard.press('Control+Z')
    })
  },
  redo: async ({ page }, use) => {
    await use(async () => {
      await page.keyboard.press('Control+Shift+Z')
    })
  },
  waitForAutosave: async ({ page }, use) => {
    await use(async () => {
      await page.locator('.auto-saved').waitFor({ state: 'visible', timeout: 3000 })
      await page.locator('.auto-saved').waitFor({ state: 'hidden', timeout: 3000 })
    })
  }
})

export { expect }
