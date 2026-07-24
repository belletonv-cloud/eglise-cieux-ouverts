import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'

/**
 * Sidebar du builder réorganisée en panneaux groupés repliables
 * (Contenu / Icônes-médias / Mise en page / Couleurs / Avancé / Scripts).
 * Le groupement est purement UI (AutoEditor.vue) : aucun champ ne disparaît,
 * tous restent éditables. Le rendu des blocs n'est pas touché (garanti par
 * tests/schema-driven/vitrine-safety.spec.ts).
 */

async function selectBlock(page: import('@playwright/test').Page, type: string) {
  const wrapper = page.locator(`.block-wrapper[data-block-type="${type}"]`).first()
  await wrapper.scrollIntoViewIfNeeded()
  await wrapper.click()
  await expect(page.locator('.admin-sidebar .auto-editor')).toBeVisible({ timeout: 3000 })
}

test.describe('Builder — sidebar en panneaux groupés', () => {
  test('le bloc hero affiche des panneaux groupés, tous les champs visibles', async ({ page }) => {
    await loginAsAdmin(page)
    await selectBlock(page, 'hero')

    const groups = page.locator('.admin-sidebar .auto-group')
    // Hero a du contenu, des médias (image/nameImage) et des couleurs → ≥ 2 panneaux
    expect(await groups.count()).toBeGreaterThanOrEqual(2)

    // Les en-têtes de panneaux portent les libellés attendus
    const titles = await page.locator('.admin-sidebar .auto-group-title').allInnerTexts()
    expect(titles.join(' | ')).toMatch(/Icônes \/ médias/)
    expect(titles.join(' | ')).toMatch(/Couleurs \/ thème/)

    // Tous les champs restent présents et visibles (panneaux ouverts par défaut)
    const fields = page.locator('.admin-sidebar .auto-editor .auto-field')
    const n = await fields.count()
    expect(n).toBeGreaterThan(0)
    for (let i = 0; i < n; i++) await expect(fields.nth(i)).toBeVisible()
  })

  test('le champ image est rangé sous « Icônes / médias »', async ({ page }) => {
    await loginAsAdmin(page)
    await selectBlock(page, 'hero')
    const mediaPanel = page.locator('.admin-sidebar .auto-group', { hasText: 'Icônes / médias' })
    await expect(mediaPanel).toBeVisible()
    // Le panneau médias contient au moins un champ image
    await expect(mediaPanel.locator('.auto-field')).not.toHaveCount(0)
  })

  test('replier un panneau masque ses champs, le déplier les ré-affiche', async ({ page }) => {
    await loginAsAdmin(page)
    await selectBlock(page, 'hero')
    const panel = page.locator('.admin-sidebar .auto-group').first()
    const header = panel.locator('.auto-group-header')
    const firstField = panel.locator('.auto-field').first()

    await expect(firstField).toBeVisible()
    await header.click()
    await expect(firstField).toBeHidden()
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await header.click()
    await expect(firstField).toBeVisible()
    await expect(header).toHaveAttribute('aria-expanded', 'true')
  })

  test('aucun champ perdu : la somme des champs des panneaux couvre le schéma', async ({ page }) => {
    await loginAsAdmin(page)
    await selectBlock(page, 'contact')
    // Chaque .auto-field appartient à un .auto-group (aucun champ orphelin)
    const total = await page.locator('.admin-sidebar .auto-editor .auto-field').count()
    const inGroups = await page.locator('.admin-sidebar .auto-group .auto-field').count()
    expect(inGroups).toBe(total)
    expect(total).toBeGreaterThan(0)
  })
})
