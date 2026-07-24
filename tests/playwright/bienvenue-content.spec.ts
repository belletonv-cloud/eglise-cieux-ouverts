import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * BlockBienvenue.vue ignorait ses props title/subtitle (texte "BIENVENUE"
 * et sous-titre codés en dur dans le template, malgré un schema qui
 * prétendait les rendre éditables). Ces tests vérifient que :
 * 1. Sans override (bloc par défaut du mock, props: {}), le rendu reste
 *    identique à l'ancien texte en dur — aucune régression visuelle.
 * 2. Éditer Titre/Sous-titre dans la sidebar admin change réellement le
 *    texte affiché (la vraie régression corrigée).
 */

test.describe('Bloc Bienvenue — title/subtitle réellement branchés', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('sans override : retombe sur BLOCK_TYPES.bienvenue.defaults (via normalizeBlock)', async ({ page }) => {
    // Le mock seed 'accueil' a bienvenue avec props:{} — PageRenderer.vue
    // appelle normalizeBlock() sur CHAQUE rendu (pas juste à la création),
    // qui réinjecte BLOCK_TYPES.bienvenue.defaults pour tout champ vide.
    // Un bloc réel avec un subtitle explicite et non-vide en Firestore
    // conserverait sa valeur (normalizeBlock ne remplace que "" /null
    // /undefined) ; ce test documente le comportement pour un bloc vide.
    await page.goto('/')
    const portal = page.locator('.hero-bienvenue-portal')
    await expect(portal).toBeVisible({ timeout: 5000 })
    await expect(portal).toHaveAttribute('aria-label', 'BIENVENUE')

    const letters = portal.locator('.hero-bienvenue-char')
    await expect(letters).toHaveCount(9) // B-I-E-N-V-E-N-U-E

    await expect(page.locator('.hero-subtitle')).toHaveText('à votre église')
  })

  test('éditer Titre/Sous-titre dans la sidebar change le rendu', async ({ page }) => {
    await loginAsAdmin(page)

    const bienvenueBlock = page.locator('.block-wrapper[data-block-type="bienvenue"]')
    await bienvenueBlock.click()
    await page.waitForSelector('.sidebar-autoeditor', { timeout: 3000 })

    // hasText fait un match par sous-chaîne insensible à la casse : "Titre"
    // matcherait aussi "Sous-titre". Regex ancrée pour une correspondance
    // exacte du label.
    // .locator('input') seul matcherait aussi l'input numérique de taille de
    // police (le champ Titre est "fontable") — cibler .field-input (valeur
    // texte) précisément.
    const titleInput = page.locator('.auto-field', { has: page.locator('.field-label', { hasText: /^Titre$/ }) }).locator('.field-input')
    const subtitleInput = page.locator('.auto-field', { has: page.locator('.field-label', { hasText: /^Sous-titre$/ }) }).locator('.field-input')

    await titleInput.fill('SALUT')
    await subtitleInput.fill('à notre communauté')
    // Sortir du champ pour déclencher la mise à jour réactive
    await page.locator('body').click({ position: { x: 10, y: 10 } })

    const portal = bienvenueBlock.locator('.hero-bienvenue-portal')
    await expect(portal).toHaveAttribute('aria-label', 'SALUT', { timeout: 3000 })

    const letters = portal.locator('.hero-bienvenue-char')
    await expect(letters).toHaveCount(5) // S-A-L-U-T
    await expect(letters.nth(0)).toHaveText('S')
    await expect(letters.nth(4)).toHaveText('T')

    await expect(bienvenueBlock.locator('.hero-subtitle')).toHaveText('à notre communauté')
  })
})
