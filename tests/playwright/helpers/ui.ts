import { Page } from '@playwright/test'

/**
 * Attend que l'indicateur auto-sauvegarde apparaisse après un changement
 */
export async function saveChanges(page: Page): Promise<void> {
  await page.waitForSelector('.auto-saved', { timeout: 4000 })
  await page.locator('.auto-saved').waitFor({ state: 'visible', timeout: 3000 })
}

/**
 * Attend qu'une modale (ou un sélecteur) soit visible
 */
export async function waitForModal(page: Page, selector = '.modal'): Promise<void> {
  await page.waitForSelector(selector, { timeout: 3000 })
}
