import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/** Vue frise (Gantt) du tableau des tâches. */
const ADMIN = { Authorization: 'Bearer mock-test-token' }

async function creer(request: any, titre: string, champs: Record<string, unknown> = {}) {
  const res = await request.post('/api/taches', { headers: ADMIN, data: { titre, source: 'projet', ...champs } })
  expect(res.ok()).toBe(true)
  const { tache } = await res.json()
  // debut/fin ne sont posés qu'ensuite : la création les accepte, mais on
  // passe par le PUT pour couvrir le chemin réellement utilisé par l'UI.
  if (champs.debut || champs.fin) {
    await request.put(`/api/taches/${tache.id}`, {
      headers: ADMIN,
      data: { debut: champs.debut, fin: champs.fin },
    })
  }
  return tache
}

async function ouvrirFrise(page: any) {
  await loginAsAdmin(page)
  await page.locator('.admin-btn-secondary', { hasText: 'Tâches' }).click()
  await expect(page.locator('.taches-modal')).toBeVisible({ timeout: 5000 })
  await page.locator('.taches-vue', { hasText: 'Frise' }).click()
}

test.describe('Frise des tâches', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('sans tâche datée, la frise explique quoi faire', async ({ page, request }) => {
    await creer(request, 'Tâche sans dates')
    await ouvrirFrise(page)
    await expect(page.locator('.gantt')).toContainText('Aucune tâche datée', { timeout: 5000 })
  })

  test('une tâche datée apparaît comme une barre sur la frise', async ({ page, request }) => {
    await creer(request, 'Chantier peinture', { debut: '2026-09-01', fin: '2026-09-10' })
    await ouvrirFrise(page)

    const ligne = page.locator('.gantt-ligne', { hasText: 'Chantier peinture' })
    await expect(ligne).toBeVisible({ timeout: 5000 })
    await expect(ligne.locator('.gantt-barre')).toBeVisible()
  })

  test('une tâche plus tardive est placée plus à droite qu\'une tâche précoce', async ({ page, request }) => {
    await creer(request, 'Tache precoce', { debut: '2026-09-01', fin: '2026-09-03' })
    await creer(request, 'Tache tardive', { debut: '2026-09-20', fin: '2026-09-25' })
    await ouvrirFrise(page)

    const precoce = page.locator('.gantt-ligne', { hasText: 'Tache precoce' }).locator('.gantt-barre')
    const tardive = page.locator('.gantt-ligne', { hasText: 'Tache tardive' }).locator('.gantt-barre')
    await expect(precoce).toBeVisible({ timeout: 5000 })

    const boitePrecoce = await precoce.boundingBox()
    const boiteTardive = await tardive.boundingBox()
    expect(boitePrecoce!.x).toBeLessThan(boiteTardive!.x)

    // Et la tâche de 6 jours est plus large que celle de 3 jours
    expect(boiteTardive!.width).toBeGreaterThan(boitePrecoce!.width)
  })

  test('les tâches sans dates restent listées plutôt que disparaître', async ({ page, request }) => {
    await creer(request, 'Tache datee', { debut: '2026-09-01', fin: '2026-09-05' })
    await creer(request, 'Tache orpheline')
    await ouvrirFrise(page)

    await expect(page.locator('.gantt-sans-dates')).toContainText('Tache orpheline', { timeout: 5000 })
  })

  test('la barre porte le nom de la personne qui a pris la tâche', async ({ page, request }) => {
    const t = await creer(request, 'Tache assignee', { debut: '2026-09-01', fin: '2026-09-05' })
    await request.post(`/api/taches/${t.id}/prendre`, { headers: ADMIN })
    await ouvrirFrise(page)

    const barre = page.locator('.gantt-ligne', { hasText: 'Tache assignee' }).locator('.gantt-barre')
    await expect(barre).toBeVisible({ timeout: 5000 })
    await expect(barre.locator('.gantt-etiquette')).toHaveText('ci-admin')
  })

  test('modifier une date depuis le tableau la reporte sur la frise', async ({ page, request }) => {
    await creer(request, 'Tache a dater')

    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Tâches' }).click()
    const carte = page.locator('.taches-carte', { hasText: 'Tache a dater' })
    await expect(carte).toBeVisible({ timeout: 5000 })

    const champs = carte.locator('.taches-date-input')
    await champs.nth(0).fill('2026-10-05')
    await champs.nth(1).fill('2026-10-12')

    await page.locator('.taches-vue', { hasText: 'Frise' }).click()
    const ligne = page.locator('.gantt-ligne', { hasText: 'Tache a dater' })
    await expect(ligne).toBeVisible({ timeout: 5000 })
    await expect(ligne.locator('.gantt-barre')).toBeVisible()
  })
})
