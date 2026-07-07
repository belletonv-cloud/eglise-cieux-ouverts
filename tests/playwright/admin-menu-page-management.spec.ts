import { test, expect } from './fixtures/admin-fixtures'

test.describe('Gestion des pages depuis le menu', () => {
  test('supprimer la page actuellement affichée redirige vers l\'accueil et la retire du sélecteur', async ({ page, adminLogin }) => {
    // Auto-accepte tous les confirm()/alert() de la session (fermeture avec
    // modifications non sauvegardées, confirmation de suppression, etc.)
    page.on('dialog', (dialog) => dialog.accept())

    await page.goto('/?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })

    // Ouvre la gestion du menu : en desktop admin, cliquer un lien de nav
    // ouvre l'éditeur de menu au lieu de naviguer (le burger mobile est
    // masqué en CSS à cette largeur)
    await page.locator('.nav-desktop a, nav a').first().click()
    await page.waitForSelector('.menu-editor-panel', { timeout: 5000 })

    // Crée une page de test
    await page.locator('.btn-add-page').click()
    await page.locator('.admin-mgr-input').fill('Page Test Suppression E2E')
    await page.getByRole('button', { name: 'Créer la page' }).click()

    // La création navigue automatiquement vers la nouvelle page
    await page.waitForURL('**/page-test-suppression-e2e**', { timeout: 5000 })

    // Elle apparaît dans le sélecteur de pages admin
    await expect(page.locator('.admin-page-select option', { hasText: 'Page Test Suppression E2E' })).toHaveCount(1)

    // La création ferme la modale mais laisse le panneau de gestion du menu
    // ouvert : on le ferme avant de le rouvrir pour ne pas bloquer les clics
    await page.locator('.menu-editor-header button', { hasText: '✕' }).click()
    await page.waitForSelector('.menu-editor-panel', { state: 'detached', timeout: 3000 })

    // Rouvre le menu et supprime la page pendant qu'on la visite
    await page.locator('.nav-desktop a, nav a').first().click()
    await page.waitForSelector('.menu-editor-panel', { timeout: 5000 })

    const item = page.locator('.menu-editor-item', { hasText: 'Page Test Suppression E2E' })
    await item.locator('.btn-mini', { hasText: '🗑' }).click()

    // On est redirigé vers l'accueil, pas laissé sur la page supprimée
    await page.waitForURL((url) => url.pathname === '/', { timeout: 5000 })

    // La page a disparu du sélecteur immédiatement (pas besoin de recharger)
    await expect(page.locator('.admin-page-select option', { hasText: 'Page Test Suppression E2E' })).toHaveCount(0)
  })

  // Les slugs accueil/contact/messages/event-list/agenda/photos ont chacun
  // leur propre fichier pages/*.vue avec du vrai contenu Firestore. Sans
  // cette protection, créer une page custom avec un de ces titres
  // écraserait silencieusement (setFirestoreDoc) le document réel de la
  // page statique — pas juste un doublon inatteignable, une vraie perte de
  // contenu en production.
  for (const slug of ['accueil', 'contact', 'messages', 'event-list', 'agenda', 'photos']) {
    test(`création d'une page custom avec le slug réservé "${slug}" est refusée`, async ({ page }) => {
      const res = await page.request.post('/api/pages', { data: { slug, title: slug } })
      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.message).toBe('Ce slug est réservé')
    })

    test(`suppression de la page réservée "${slug}" est refusée`, async ({ page }) => {
      const res = await page.request.delete(`/api/pages/${slug}`)
      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.message).toBe('Impossible de supprimer cette page')
    })
  }
})
