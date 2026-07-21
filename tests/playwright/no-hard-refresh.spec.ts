import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { openBlockEditor, editBlockTitle } from './helpers/blocks'
import { resetMock } from './helpers/reset'

/**
 * Vérifie qu'aucun hard refresh n'est nécessaire pendant l'usage normal.
 * Technique : on pose un marqueur sur window avant l'action ; s'il survit,
 * c'est qu'il n'y a pas eu de rechargement complet de la page.
 */

async function setSpaMarker(page) {
  await page.evaluate(() => { (window as any).__spaMarker = 'alive' })
}

async function expectNoReload(page) {
  const marker = await page.evaluate(() => (window as any).__spaMarker)
  expect(marker).toBe('alive')
}

test.describe('Pas de hard refresh nécessaire', () => {
  test('navigation publique / → /contact → /agenda sans rechargement', async ({ page }) => {
    await page.goto('/')
    await setSpaMarker(page)

    await page.getByRole('link', { name: 'Contact', exact: true }).first().click()
    await page.waitForURL('**/contact')
    await expectNoReload(page)

    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
    await page.waitForURL('**/agenda')
    await expectNoReload(page)
  })

  test('version.txt est servi et contient un timestamp (détection de déploiement)', async ({ page }) => {
    const res = await page.request.get('/version.txt')
    expect(res.ok()).toBe(true)
    const body = (await res.text()).trim()
    expect(body).toMatch(/^\d{13}$/)
  })

  test('édition + auto-save en admin sans rechargement', async ({ page, request }) => {
    await resetMock(request)
    await loginAsAdmin(page)
    await setSpaMarker(page)

    const firstBlockId = await page.locator('.block-wrapper').first().getAttribute('data-block-id')
    expect(firstBlockId).toBeTruthy()
    await openBlockEditor(page, firstBlockId!)
    await editBlockTitle(page, 'Titre sans reload')

    // L'auto-save (feedback .auto-saved) ne doit pas provoquer de reload
    await page.waitForSelector('.auto-saved', { timeout: 6000 })
    await expectNoReload(page)
  })

  test('changement de device desktop → tablette sans rechargement du parent', async ({ page, request }) => {
    await resetMock(request)
    await loginAsAdmin(page)
    await setSpaMarker(page)

    await page.locator('button[title="Tablet"]').click()
    await expect(page.locator('.device-iframe')).toBeVisible({ timeout: 6000 })
    await expectNoReload(page)

    await page.locator('button[title="Desktop"]').click()
    await expect(page.locator('.device-iframe')).toBeHidden({ timeout: 6000 })
    await expectNoReload(page)
  })

  test('pas de débordement horizontal sur mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const overflowX = await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth - window.innerWidth, 0)
    )
    expect(overflowX).toBeLessThan(20)
  })
})
