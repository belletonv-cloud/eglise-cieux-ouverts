import { Page } from '@playwright/test'

/**
 * Ouvre la sidebar d’édition pour un bloc en fonction de son id
 */
export async function openBlockEditor(page: Page, blockId: string): Promise<void> {
  await page.locator(`.block-wrapper[data-block-id="${blockId}"]`).click()
  await page.waitForSelector('.sidebar-autoeditor', { timeout: 2000 })
}

/**
 * Effectue un drag & drop d’un bloc de l’index fromIndex vers toIndex via le handle
 */
export async function dragBlock(page: Page, fromIndex: number, toIndex: number): Promise<void> {
  const blocks = page.locator('.block-draggable')
  const from = blocks.nth(fromIndex).locator('.block-draggable-handle')
  const to = blocks.nth(toIndex)
  await from.dragTo(to)
}

/**
 * Remplit le champ "Titre" dans la sidebar de bloc et sort du focus pour trigger la sauvegarde
 */
export async function editBlockTitle(page: Page, title: string): Promise<void> {
  const editor = page.locator('.sidebar-autoeditor')
  if (await editor.locator('input[placeholder="Titre"]').count()) {
    await editor.locator('input[placeholder="Titre"]').fill(title)
  } else {
    await editor.locator('input[type="text"]').first().fill(title)
  }
  // Sortir du champ pour déclencher la sauvegarde auto
  await page.locator('body').click({ position: { x: 10, y: 10 } })
}
