import { test, expect } from '@playwright/test'

test.describe('Navigation /agenda : intégrité du rendu après navigation', () => {

  async function expectAgendaIntact(page) {
    // Vérifie les éléments structurels de la page agenda
    await expect(page.getByRole('heading', { name: 'Agenda', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Retrouvez tous les événements à venir')).toBeVisible()
    // Le calendrier doit être présent
    await expect(page.locator('.calendar-grid')).toBeVisible()
    // Les événements doivent être visibles (le mock ne les supprime pas)
    await expect(page.locator('.event-pill').first()).toBeVisible({ timeout: 10000 })
    // Pas de "Chargement..." visible
    await expect(page.getByText('Chargement des événements...')).not.toBeVisible()
    // Pas de double titre
    const titles = await page.locator('h1.agenda-title').count()
    expect(titles).toBe(1)
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Agenda/)
  }

  async function navigateAndWait(page, role, name) {
    await page.getByRole(role, { name, exact: true }).first().click()
    // On attend que l'URL change ET que la transition soit terminée
    await page.waitForTimeout(1000)
  }

  test('SSR /agenda -> chargement initial OK', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)
  })

  test('SSR /agenda -> / -> /agenda (menu nav aller-retour)', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Accueil')
    await expect(page).toHaveURL('/')

    await navigateAndWait(page, 'link', 'Agenda')
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })

  test('/agenda -> /event-list -> /agenda (va-et-vient avec billetterie)', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Événements')
    await expect(page).toHaveURL(/event-list/)

    await navigateAndWait(page, 'link', 'Agenda')
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })

  test('/agenda -> /messages -> /agenda', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Messages')
    await expect(page).toHaveURL(/messages/)

    await navigateAndWait(page, 'link', 'Agenda')
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })

  test('/agenda -> /contact -> /agenda', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Contact')
    await expect(page).toHaveURL(/contact/)

    await navigateAndWait(page, 'link', 'Agenda')
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })

  test('/agenda -> / -> browser back -> /agenda', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Accueil')
    await expect(page).toHaveURL('/')

    await page.goBack({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })
  
  test('/agenda -> /event-list -> browser back -> /agenda', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Événements')
    await expect(page).toHaveURL(/event-list/)

    await page.goBack({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/agenda/)
    await expectAgendaIntact(page)
  })

  test('/agenda vue cartes -> / -> /agenda (conservation vue mois)', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    // Changer en vue cartes
    await page.getByRole('button', { name: 'Cartes' }).click()
    await page.waitForTimeout(300)
    await expect(page.locator('.event-card').first()).toBeVisible({ timeout: 5000 })

    // Aller ailleurs puis revenir
    await navigateAndWait(page, 'link', 'Accueil')
    await expect(page).toHaveURL('/')

    await navigateAndWait(page, 'link', 'Agenda')
    await expect(page).toHaveURL(/agenda/)

    // La vue devrait être revenue à 'month' (par défaut)
    await expect(page.locator('.calendar-grid')).toBeVisible()
  })

  test('Pas de leak du contenu agenda sur les autres pages', async ({ page }) => {
    await page.goto('/agenda', { waitUntil: 'networkidle' })
    await expectAgendaIntact(page)

    await navigateAndWait(page, 'link', 'Accueil')
    await expect(page).toHaveURL('/')
    // Vérifier que le calendrier n'apparaît PAS sur l'accueil
    await expect(page.locator('.calendar-grid')).not.toBeVisible()
    await expect(page.locator('.event-pill')).not.toBeVisible()
    await expect(page.locator('h1.agenda-title')).not.toBeVisible()
    await expect(page.getByText('Retrouvez tous les événements à venir')).not.toBeVisible()
  })

})
