import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Sélecteur de blocs à 2 étapes : les types avec `templates` (richText,
 * textImage) proposent un choix de modèles pré-remplis avant l'ajout ; les
 * types sans `templates` (la grande majorité, dont les nouveaux stats/quote)
 * s'ajoutent en un clic, comportement inchangé.
 */

test.describe('Sélecteur de blocs — modèles', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMock(request)
    await loginAsAdmin(page)
    await page.locator('.admin-btn-add-block').click()
    await page.waitForSelector('.block-picker-grid', { timeout: 4000 })
  })

  test('cliquer sur richText ouvre le choix de modèles avec les 4 options', async ({ page }) => {
    await page.locator('.block-picker-card', { hasText: 'Texte riche' }).click()

    await expect(page.getByText('Choisir un modèle')).toBeVisible({ timeout: 3000 })
    const templateCards = page.locator('.block-picker-grid .block-picker-card')
    await expect(templateCards).toHaveCount(4)
    await expect(page.getByText('Vierge')).toBeVisible()
    await expect(page.getByText('Annonce')).toBeVisible()
    await expect(page.getByText('Témoignage')).toBeVisible()
    await expect(page.getByText('Article')).toBeVisible()
  })

  test('choisir un modèle insère un bloc avec le contenu du modèle', async ({ page }) => {
    await page.locator('.block-picker-card', { hasText: 'Texte riche' }).click()
    await page.locator('.block-picker-card', { hasText: 'Annonce' }).click()

    // La modale se ferme et un nouveau bloc richText apparaît avec le
    // contenu du modèle "Annonce" — preuve que overrideProps a bien
    // traversé finalizeAddBlock -> addBlock -> createBlock.
    await expect(page.getByText('Choisir un modèle')).toBeHidden({ timeout: 3000 })
    const newBlock = page.locator('.block-wrapper[data-block-type="richText"]').last()
    await expect(newBlock).toBeVisible()
    await expect(newBlock).toContainText("Titre de l'annonce")
  })

  test('le bouton retour revient à la liste des types de blocs', async ({ page }) => {
    await page.locator('.block-picker-card', { hasText: 'Texte riche' }).click()
    await expect(page.getByText('Choisir un modèle')).toBeVisible({ timeout: 3000 })

    await page.locator('.block-picker-back').click()

    await expect(page.getByText('Choisir un modèle')).toBeHidden()
    await expect(page.getByText('Ajouter un bloc')).toBeVisible()
    await expect(page.locator('.block-picker-card', { hasText: 'Texte riche' })).toBeVisible()
  })

  test('textImage propose aussi un choix de modèles', async ({ page }) => {
    await page.locator('.block-picker-card', { hasText: 'Texte + Image' }).click()

    await expect(page.getByText('Choisir un modèle')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Présentation d\'un ministère')).toBeVisible()
    await expect(page.getByText('Mise en avant d\'un événement')).toBeVisible()
  })

  test('un type sans modèles (stats) s\'ajoute directement sans écran intermédiaire', async ({ page }) => {
    await page.locator('.block-picker-card', { hasText: 'Chiffres clés' }).click()

    // Pas de 2e modale : le bloc est ajouté immédiatement, comme avant.
    await expect(page.getByText('Choisir un modèle')).toHaveCount(0)
    await expect(page.getByText('Ajouter un bloc')).toHaveCount(0)
    const newBlock = page.locator('.block-wrapper[data-block-type="stats"]').last()
    await expect(newBlock).toBeVisible({ timeout: 3000 })
  })
})
