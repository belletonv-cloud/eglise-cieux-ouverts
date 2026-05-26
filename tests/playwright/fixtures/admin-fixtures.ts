import { test as base } from '@playwright/test'
import { resetMock } from '../helpers/reset'
import { loginAsAdmin } from '../helpers/admin'
import { openBlockEditor, dragBlock, editBlockTitle } from '../helpers/blocks'
import { saveChanges } from '../helpers/ui'

export const test = base.extend({
  /**
   * Ouvre la page admin (avec ?admin=true), attend que la toolbar soit visible.
   */
  adminLogin: async ({ page }, use) => {
    await loginAsAdmin(page)
    await use(page)
  },

  /**
   * Reset tous les mocks/backend avant un test.
   */
  resetMock: async ({ request }, use) => {
    await resetMock(request)
    await use(async () => {})
  },

  /**
   * Édite un bloc par son id (ouvre l’éditeur, modifie le titre, sauvegarde).
   */
  editBlock: async ({ page }, use) => {
    await use(async (blockId: string, { title }: { title: string }) => {
      await openBlockEditor(page, blockId)
      await editBlockTitle(page, title)
      await saveChanges(page)
    })
  },

  /**
   * Déplace un bloc d’un index à un autre (drag & drop).
   */
  moveBlock: async ({ page }, use) => {
    await use(async (fromIdx: number, toIdx: number) => {
      await dragBlock(page, fromIdx, toIdx)
    })
  }
   // Ajoutez ici d’autres helpers DRY au format Playwright extend selon vos besoins
})

export { expect } from '@playwright/test'

