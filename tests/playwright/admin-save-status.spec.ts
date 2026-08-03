import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Symptôme signalé : après une sauvegarde réussie, le bandeau réaffiche
 * « ⚠ Modifications non sauvegardées », ce qui laisse croire que rien n'a
 * été enregistré.
 *
 * Le libellé « Sauvegardé » est effacé au bout de 2 s ; si un drapeau
 * « modifié » est resté allumé, l'avertissement réapparaît à ce moment-là.
 * On vérifie donc l'état APRÈS l'expiration de ce délai.
 */
test.beforeEach(async ({ request }) => {
  await resetMock(request)
})

test('après une sauvegarde réussie, l\'avertissement « non sauvegardées » ne revient pas', async ({ page }) => {
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click()

  const sidebar = page.locator('.admin-sidebar')
  await expect(sidebar).toBeVisible({ timeout: 5000 })
  await sidebar.locator('.anim-btn', { hasText: 'Zoom entrant' }).first().click()

  // L'avertissement doit apparaître tant que rien n'est sauvegardé
  await expect(page.locator('.admin-save-status.unsaved')).toBeVisible({ timeout: 3000 })

  await page.locator('.admin-btn', { hasText: 'Sauvegarder' }).first().click()

  // Confirmation explicite de la sauvegarde
  await expect(page.locator('.admin-save-status', { hasText: 'Sauvegardé' })).toBeVisible({ timeout: 8000 })

  // Le libellé « Sauvegardé » s'efface après 2 s : c'est là que le bug
  // se manifeste si un drapeau est resté allumé.
  await page.waitForTimeout(3500)

  const bandeau = page.locator('.admin-save-status.unsaved')
  const nb = await bandeau.count()
  if (nb > 0) console.log('BANDEAU APRÈS SAUVEGARDE :', await bandeau.first().textContent())
  await expect(bandeau).toHaveCount(0)
})
