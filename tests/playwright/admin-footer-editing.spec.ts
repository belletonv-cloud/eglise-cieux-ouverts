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

  test('les champs Horaires et Adresse n\'injectent pas de HTML', async ({ page }) => {
    // Régression : ces deux champs étaient rendus par `v-html` sur une chaîne
    // construite par concaténation, sans le moindre échappement. Tout HTML
    // saisi dans la sidebar était injecté tel quel sur TOUTES les pages, le
    // footer étant global. La mise en gras de la partie après « | » doit
    // rester (rendu inchangé), mais le balisage saisi doit s'afficher en texte.
    await openFooterSidebar(page)

    const horaire = page.locator('.auto-field', { hasText: 'Horaire' }).locator('.field-input').first()
    await horaire.fill('<img src=x onerror="window.__xss=1"> | <b>10H</b>')

    const ligne = page.locator('footer.site-footer .footer-info p').first()
    await expect(ligne).toContainText('<img src=x')
    await expect(ligne).toContainText('<b>10H</b>')
    await expect(ligne.locator('img')).toHaveCount(0)
    await expect(ligne.locator('b')).toHaveCount(0)
    // La mise en gras structurelle, elle, doit rester.
    await expect(ligne.locator('strong')).toHaveCount(1)
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined()
  })
})
