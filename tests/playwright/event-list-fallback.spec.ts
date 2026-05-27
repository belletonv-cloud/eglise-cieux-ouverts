import { test, expect } from '@playwright/test'

test.describe('Fallback Billetterie sur /event-list', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.get('/api/test/set-mock?slug=event-list&empty=true')
  })

  test('SSR : le fallback s\'affiche sur chargement direct de /event-list', async ({ page }) => {
    await page.goto('/event-list', { waitUntil: 'networkidle' })
    await expect(page.getByText('Billetterie Événements')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Aucun événement pour le moment')).toBeVisible({ timeout: 5000 })
  })

  test('SPA : le fallback s\'affiche après navigation depuis /agenda', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expect(page.locator('body')).toBeAttached()

    await page.goto('/event-list', { waitUntil: 'networkidle' })

    await expect(page.getByText('Billetterie Événements')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Aucun événement pour le moment')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Revenez bientôt pour de nouvelles dates')).toBeVisible({ timeout: 5000 })
  })

  test('SPA : le fallback s\'affiche via clic lien navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    await page.getByRole('link', { name: 'Événements' }).first().click()
    await page.waitForURL('**/event-list')

    await expect(page.getByText('Billetterie Événements')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Aucun événement pour le moment')).toBeVisible({ timeout: 5000 })
  })

})
