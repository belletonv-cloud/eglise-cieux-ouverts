import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/** Tableau des tâches côté interface admin (Kanban). */
test.describe('Tableau des tâches', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  async function ouvrirTableau(page: any) {
    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Tâches' }).click()
    await expect(page.locator('.taches-modal')).toBeVisible({ timeout: 5000 })
  }

  test('le tableau s\'ouvre avec ses trois colonnes', async ({ page }) => {
    await ouvrirTableau(page)
    for (const libelle of ['À faire', 'En cours', 'Fait']) {
      await expect(page.locator('.taches-colonne h3', { hasText: libelle })).toBeVisible()
    }
  })

  test('ajouter une tâche la fait apparaître dans « À faire », libre', async ({ page }) => {
    await ouvrirTableau(page)

    await page.locator('.taches-input').fill('Installer la sono')
    await page.locator('.taches-select').selectOption('service')
    await page.locator('.taches-btn', { hasText: 'Ajouter' }).click()

    const carte = page.locator('.taches-carte', { hasText: 'Installer la sono' })
    await expect(carte).toBeVisible({ timeout: 5000 })
    await expect(carte.locator('.taches-libre')).toHaveText('Libre')
    await expect(carte.locator('.taches-source')).toHaveText('Service')
  })

  test('prendre une tâche l\'affiche comme mienne et propose de la libérer', async ({ page }) => {
    await ouvrirTableau(page)
    await page.locator('.taches-input').fill('Ranger la salle')
    await page.locator('.taches-btn', { hasText: 'Ajouter' }).click()

    const carte = page.locator('.taches-carte', { hasText: 'Ranger la salle' })
    await expect(carte).toBeVisible({ timeout: 5000 })

    await carte.locator('button', { hasText: 'Je prends' }).click()
    await expect(carte.locator('.taches-titulaire')).toContainText('Tu as pris cette tâche', { timeout: 5000 })
    await expect(carte.locator('button', { hasText: 'Libérer' })).toBeVisible()
  })

  test('une tâche prise par quelqu\'un d\'autre est verrouillée', async ({ page, request }) => {
    // Tâche créée puis prise par une autre personne via l'API
    await request.post('/api/admin/users', {
      headers: { Authorization: 'Bearer mock-test-token' },
      data: { email: 'beatrice@tests.fr', role: 'planning' },
    })
    const creation = await request.post('/api/taches', {
      headers: { Authorization: 'Bearer mock-test-token' },
      data: { titre: 'Déjà prise ailleurs', source: 'projet' },
    })
    const { tache } = await creation.json()
    await request.post(`/api/taches/${tache.id}/prendre`, {
      headers: { Authorization: 'Bearer mock-test-token:beatrice@tests.fr' },
    })

    await ouvrirTableau(page)
    const carte = page.locator('.taches-carte', { hasText: 'Déjà prise ailleurs' })
    await expect(carte).toBeVisible({ timeout: 5000 })
    await expect(carte.locator('.taches-titulaire')).toContainText('beatrice@tests.fr')
    // Aucun bouton « Je prends » ne doit être proposé
    await expect(carte.locator('button', { hasText: 'Je prends' })).toHaveCount(0)
  })

  test('le filtre par source restreint les cartes affichées', async ({ page }) => {
    await ouvrirTableau(page)

    await page.locator('.taches-input').fill('Tâche de service')
    await page.locator('.taches-select').selectOption('service')
    await page.locator('.taches-btn', { hasText: 'Ajouter' }).click()
    await expect(page.locator('.taches-carte', { hasText: 'Tâche de service' })).toBeVisible({ timeout: 5000 })

    await page.locator('.taches-input').fill('Tâche de site')
    await page.locator('.taches-select').selectOption('site')
    await page.locator('.taches-btn', { hasText: 'Ajouter' }).click()
    await expect(page.locator('.taches-carte', { hasText: 'Tâche de site' })).toBeVisible({ timeout: 5000 })

    await page.locator('.taches-filtre', { hasText: 'Service' }).click()
    await expect(page.locator('.taches-carte', { hasText: 'Tâche de service' })).toBeVisible()
    await expect(page.locator('.taches-carte', { hasText: 'Tâche de site' })).toHaveCount(0)
  })
})
