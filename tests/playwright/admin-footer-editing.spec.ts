import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Édition du footer depuis la sidebar admin.
 *
 * Le footer vit hors PageRenderer (layouts/default.vue, settings/footer en
 * Firestore) : il a son propre chemin de sauvegarde (PUT /api/footer) et ne
 * supporte pas les éléments libres (pas de BlockExtraElementsCanvas).
 * Deux régressions réelles couvertes ici :
 * - le bouton « Sauvegarder » principal ignorait le footer (modifs perdues
 *   en silence, seul le bouton dédié en bas de sidebar sauvegardait) ;
 * - « ⇱ Déplacer » apparaissait sur les champs du footer mais ne faisait
 *   rien (promoteFieldToElement ne trouve pas le footer dans localBlocks).
 */

async function openFooterSidebar(page: import('@playwright/test').Page) {
  const footer = page.locator('.footer-editable-wrap')
  await footer.scrollIntoViewIfNeeded()
  await footer.click()
  await expect(page.locator('.admin-sidebar-header h3')).toHaveText('Footer')
}

test.describe('Édition du footer (sidebar admin)', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMock(request)
    await loginAsAdmin(page)
  })

  test('le bouton Sauvegarder principal persiste les modifs du footer', async ({ page }) => {
    await openFooterSidebar(page)

    const titreInput = page.locator('.auto-field .field-input').first()
    await titreInput.fill('Footer sauvegardé via bouton principal')

    await page.locator('button[title="Sauvegarder les modifications"]').click()
    await expect(page.locator('.admin-toolbar')).toContainText('Sauvegardé', { timeout: 5000 })

    const res = await page.request.get('/api/footer')
    const data = await res.json()
    expect(data.props?.title).toBe('Footer sauvegardé via bouton principal')
  })

  test('sauvegarder sans toucher le footer ne l\'écrit pas (préserve les defaults Firestore)', async ({ page }) => {
    // Modifier uniquement un bloc de page, pas le footer
    const block = page.locator('.block-wrapper').first()
    await block.click()
    await page.locator('.auto-field .field-input').first().fill('Titre page modifié')

    await page.locator('button[title="Sauvegarder les modifications"]').click()
    await expect(page.locator('.admin-toolbar')).toContainText('Sauvegardé', { timeout: 5000 })

    // settings/footer doit rester null : jamais figer les defaults d'un
    // footer non modifié (voir CLAUDE.md — régression déjà arrivée en prod).
    const res = await page.request.get('/api/footer')
    const data = await res.json()
    expect(data.props).toBeNull()
  })

  test('les champs du footer n\'affichent pas de bouton « Déplacer » (non supporté)', async ({ page }) => {
    await openFooterSidebar(page)

    // Les champs texte sont bien là, éditables, avec leurs contrôles police
    await expect(page.locator('.auto-field .field-input').first()).toBeVisible()
    await expect(page.locator('.field-font-picker').first()).toBeVisible()

    // Mais aucun bouton de promotion : le footer n'a pas de canvas d'éléments
    await expect(page.locator('.field-promote-btn')).toHaveCount(0)
  })

  test('police et taille par champ s\'appliquent au rendu du footer', async ({ page }) => {
    await openFooterSidebar(page)

    await page.locator('.field-font-picker').first().selectOption('Playfair Display')
    await page.locator('.field-size-input').first().fill('2')
    await page.locator('.field-size-input').first().dispatchEvent('change')

    const title = page.locator('footer.site-footer .footer-title')
    await expect(title).toHaveCSS('font-family', /Playfair Display/)
    await expect(title).toHaveCSS('font-size', '32px') // 2em × 16px
  })
})
