import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'
import { resetMock } from '../helpers/reset'
import { loginAsAdmin } from '../helpers/admin'
import { openBlockEditor, dragBlock, editBlockTitle } from '../helpers/blocks'
import { saveChanges } from '../helpers/ui'

export const test = base.extend<{
  adminLogin: Page
  resetMock: () => Promise<void>
  editBlock: (blockId: string, opts: { title: string }) => Promise<void>
  moveBlock: (fromIdx: number, toIdx: number) => Promise<void>
}>({
  adminLogin: async ({ page }, use) => {
    await loginAsAdmin(page)
    await use(page)
  },

  resetMock: async ({ request }, use) => {
    await resetMock(request)
    await use(async () => {})
  },

  editBlock: async ({ page }, use) => {
    await use(async (blockId: string, { title }: { title: string }) => {
      await openBlockEditor(page, blockId)
      await editBlockTitle(page, title)
      await saveChanges(page)
    })
  },

  moveBlock: async ({ page }, use) => {
    await use(async (fromIdx: number, toIdx: number) => {
      await dragBlock(page, fromIdx, toIdx)
    })
  }
})

export { expect } from '@playwright/test'

