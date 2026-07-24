import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'

// EventManager.vue (panneau "Gérer les événements") parle directement à
// l'API externe eglise-app (Worker + D1, cf. CLAUDE.md) — jamais mocké par
// resetMock(). On intercepte /api/church-events pour un test déterministe.
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Réunion de Prières 🙏',
    description: '',
    location: 'Morlaix',
    start_date: '2026-01-06',
    start_time: '19:00',
    end_date: null,
    end_time: null,
    repeat_period: 'week',
    emoji: null,
    image_url: null,
    link: null,
    ticket_url: null,
    status: 'active',
    exceptions: [],
  },
]

test.describe('EventManager — garde-fou modifications non enregistrées', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/church-events*', (route) => route.fulfill({ json: MOCK_EVENTS }))
    await loginAsAdmin(page)
    await page.locator('button[title="Gérer les événements"]').click()
    await expect(page.locator('.event-manager-overlay')).toBeVisible()
  })

  test('Echap sur un champ modifié demande confirmation et ne quitte pas le mode admin', async ({ page }) => {
    await page.locator('.event-row').first().click()
    const titleInput = page.locator('.event-form input[type="text"]').first()
    await expect(titleInput).toBeVisible()
    await titleInput.fill('Titre modifié')

    let dialogMessage = ''
    page.once('dialog', (d) => { dialogMessage = d.message(); d.dismiss() })
    await page.keyboard.press('Escape')
    await expect(page.locator('.event-form')).toBeVisible()
    expect(dialogMessage).toContain('non enregistrées')

    // Refuser l'abandon : le mode admin (toolbar) reste actif — la vraie
    // régression corrigée ici est qu'Echap ne doit PAS quitter tout le mode
    // admin (layouts/default.vue) pendant que cette modale est ouverte.
    await expect(page.locator('.admin-toolbar')).toBeVisible()
  })

  test('confirmer l\'abandon ferme le formulaire puis Echap ferme la modale sans quitter le mode admin', async ({ page }) => {
    await page.locator('.event-row').first().click()
    await page.locator('.event-form input[type="text"]').first().fill('Titre modifié')

    page.once('dialog', (d) => d.accept())
    await page.keyboard.press('Escape')
    await expect(page.locator('.event-form')).toHaveCount(0)
    await expect(page.locator('.event-manager-overlay')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.event-manager-overlay')).toHaveCount(0)
    await expect(page.locator('.admin-toolbar')).toBeVisible()
  })

  test('sans modification, Echap ferme directement sans demander confirmation', async ({ page }) => {
    let dialogShown = false
    page.on('dialog', (d) => { dialogShown = true; d.dismiss() })
    await page.keyboard.press('Escape')
    await expect(page.locator('.event-manager-overlay')).toHaveCount(0)
    expect(dialogShown).toBe(false)
    await expect(page.locator('.admin-toolbar')).toBeVisible()
  })
})
