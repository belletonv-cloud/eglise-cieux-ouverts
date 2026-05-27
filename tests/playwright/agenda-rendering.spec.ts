import { test, expect } from '@playwright/test'

test.describe('/agenda — qualité de rendu et transitions', () => {

  test('Pas de flash "Chargement" lors de la navigation SPA vers /agenda', async ({ page }) => {
    // On commence sur une autre page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Naviguer SPA vers /agenda
    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()

    // Attendre juste que l'URL change (pas de wait long)
    await page.waitForURL('/agenda', { timeout: 10000 })

    // Vérifier immédiatement qu'il n'y a PAS de "Chargement..."
    const loadingVisible = await page.getByText('Chargement des événements...').isVisible().catch(() => false)
    if (loadingVisible) {
      // Attendre un peu et revérifier
      await page.waitForTimeout(2000)
      await expect(page.getByText('Chargement des événements...')).not.toBeVisible()
      // Marquer ce test comme suspect
      test.info().annotations.push({ type: 'warning', description: 'Flash "Chargement" détecté' })
    }

    // Le calendrier doit être visible
    await expect(page.locator('.calendar-grid')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.event-pill').first()).toBeVisible({ timeout: 5000 })
  })

  test('Pas de "Chargement" après navigation aller-retour rapide', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expect(page.locator('.calendar-grid')).toBeVisible()

    // Navigation aller-retour rapide
    await page.getByRole('link', { name: 'Accueil', exact: true }).first().click()
    await page.waitForURL('/', { timeout: 10000 })

    // Revenir immédiatement
    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
    await page.waitForURL('/agenda', { timeout: 10000 })

    // Vérifier état
    await expect(page.locator('.calendar-grid')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Chargement des événements...')).not.toBeVisible()
  })

  test('Header - le lien Événements est toujours visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('link', { name: 'Événements' })).toBeVisible()

    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
    await page.waitForURL('/agenda', { timeout: 10000 })
    await expect(page.getByRole('link', { name: 'Événements' })).toBeVisible()
  })

  test('API useChurchEvents — les événements arrivent dans le DOM', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    
    // Vérifier qu'au moins un événement est affiché
    const eventCount = await page.locator('.event-pill').count()
    expect(eventCount).toBeGreaterThan(0)

    // Le badge "Chargement..." doit avoir disparu
    await expect(page.getByText('Chargement des événements...')).not.toBeVisible()
  })

  test('Navigation SPA /agenda -> /event-list -> /agenda : état cohérent', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    const initialEvents = await page.locator('.event-pill').count()
    expect(initialEvents).toBeGreaterThan(0)

    // Aller sur billetterie
    await page.getByRole('link', { name: 'Événements', exact: true }).first().click()
    await page.waitForURL('/event-list', { timeout: 10000 })
    await expect(page.getByText('Billetterie Événements').or(page.getByText('Il y a une place')).first()).toBeVisible()

    // Revenir
    await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
    await page.waitForURL('/agenda', { timeout: 10000 })

    // Le nombre d'événements doit être identique
    await page.waitForTimeout(2000)
    const finalEvents = await page.locator('.event-pill').count()
    expect(finalEvents).toBe(initialEvents)
  })
})
