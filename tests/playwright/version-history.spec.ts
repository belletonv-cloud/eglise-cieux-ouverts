import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Historique des versions : une version est créée à chaque sauvegarde qui
 * change les blocs, et un bouton "Restaurer" permet de revenir en arrière.
 * Jusqu'ici entièrement non testé (aucune branche mock sur ces endpoints).
 */

test.describe('Historique des versions', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('sauvegarder deux fois crée une version, restaurer revient à l\'état précédent', async ({ page }) => {
    await loginAsAdmin(page)

    const heroBlock = page.locator('.block-wrapper[data-block-type="hero"]')
    await heroBlock.click()

    const titleInput = page
      .locator('.admin-sidebar .auto-editor .auto-field')
      .filter({ hasText: /Titre/i })
      .locator('input.field-input')
      .first()
    await expect(titleInput).toBeVisible({ timeout: 3000 })

    // Première valeur + sauvegarde
    await titleInput.fill('Titre version 1')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.locator('.admin-toolbar')).toContainText(/enregistré|sauvegard/i, { timeout: 5000 })

    // Deuxième valeur + sauvegarde (doit snapshotter "Titre version 1" comme version)
    await titleInput.fill('Titre version 2')
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page.locator('.admin-toolbar')).toContainText(/enregistré|sauvegard/i, { timeout: 5000 })

    await page.locator('.admin-btn-secondary', { hasText: 'Versions' }).click()
    // Chaque sauvegarde qui change les blocs crée une version — 2 saves = 2
    // versions (la 1ère snapshotte l'état initial, la 2e "Titre version 1").
    await expect(page.locator('.version-item')).toHaveCount(2, { timeout: 3000 })
    await expect(page.locator('.version-restore-btn').first()).toBeVisible()

    // La version la plus récente (en tête de liste) contient "Titre version 1"
    await page.locator('.version-restore-btn').first().click()
    await expect(page.locator('.version-modal-overlay')).toHaveCount(0, { timeout: 3000 })

    await expect(titleInput).toHaveValue('Titre version 1', { timeout: 3000 })
  })
})

test.describe('API /api/pages/:slug/versions', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('GET renvoie une liste vide sans erreur quand rien n\'a été sauvegardé', async ({ request }) => {
    const res = await request.get('/api/pages/accueil/versions')
    expect(res.ok()).toBe(true)
    const { versions } = await res.json()
    expect(versions).toEqual([])
  })

  test('cycle complet : PUT change les blocs → version créée → restore → delete', async ({ request }) => {
    const first = await request.get('/api/pages/accueil')
    const { blocks: initialBlocks } = await first.json()

    const changed = initialBlocks.map((b: any, i: number) => i === 0 ? { ...b, props: { ...b.props, title: 'Modifié' } } : b)
    const saved = await request.put('/api/pages/accueil', { data: { blocks: changed } })
    expect(saved.ok()).toBe(true)

    const changed2 = changed.map((b: any, i: number) => i === 0 ? { ...b, props: { ...b.props, title: 'Modifié encore' } } : b)
    const saved2 = await request.put('/api/pages/accueil', { data: { blocks: changed2 } })
    expect(saved2.ok()).toBe(true)

    const list = await request.get('/api/pages/accueil/versions')
    const { versions } = await list.json()
    // 2 PUT changeant les blocs = 2 versions (état initial, puis "Modifié")
    expect(versions.length).toBe(2)

    const restored = await request.put(`/api/pages/accueil/versions/${versions[0].id}`)
    expect(restored.ok()).toBe(true)
    const { blocks: restoredBlocks } = await restored.json()
    expect(restoredBlocks[0].props.title).toBe('Modifié')

    const deleted = await request.delete(`/api/pages/accueil/versions/${versions[0].id}`)
    expect(deleted.ok()).toBe(true)
  })
})
