import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

/**
 * Garde-fou anti-écrasement : ne jamais sauvegarder un contenu qu'on n'a pas
 * réussi à LIRE.
 *
 * Quand GET /api/pages/:slug échoue, chaque page se rabat sur ses valeurs par
 * défaut. C'est le bon comportement pour un visiteur, mais en mode admin ces
 * defaults deviennent le contenu de travail : l'auto-save (3 s après la
 * moindre modification) les écrivait alors par-dessus la vraie page en
 * Firestore. Une lecture ratée suivie d'une écriture réussie suffisait à
 * remplacer le contenu réel par le modèle — scénario tout à fait atteignable,
 * une coupure passagère en lecture n'empêchant pas l'écriture de passer.
 *
 * Même principe que la règle du footer (CLAUDE.md) : ne jamais sauvegarder ce
 * qui n'a pas été explicitement chargé.
 *
 * Mise en scène : on arrive sur /contact puis on navigue vers l'accueil en
 * SPA. C'est indispensable — `page.route` n'intercepte que les requêtes du
 * NAVIGATEUR, jamais le `$fetch` interne d'un `useAsyncData` exécuté au SSR.
 * En navigation client, ce même `useAsyncData` s'exécute dans la page et passe
 * bien par l'interception. Le chemin de code testé est identique à celui d'un
 * rendu serveur dont Firestore serait tombé.
 */

function interceptePageAccueil(page: import('@playwright/test').Page, ecritures: string[], couperLecture: boolean) {
  return page.route('**/api/pages/accueil', async (route) => {
    const methode = route.request().method()
    if (methode === 'GET' && couperLecture) return route.abort('failed')
    if (methode === 'PUT') {
      ecritures.push('PUT')
      return route.fulfill({ json: { ok: true } })
    }
    return route.continue()
  })
}

async function allerSurAccueilEnSPA(page: import('@playwright/test').Page) {
  await page.goto('/contact?admin=true')
  await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
  // Sélecteur de page de la barre admin : c'est le vrai chemin de navigation
  // d'un administrateur, et il conserve `admin=true` (navigateToPage). Un lien
  // du menu du site, lui, perdrait le mode édition.
  await page.locator('.admin-page-select').selectOption('accueil')
  await expect(page).toHaveURL(/admin=true/, { timeout: 10000 })
  await page.waitForTimeout(1500)
}

async function editerLePremierBloc(page: import('@playwright/test').Page) {
  await page.locator('.block-wrapper').first().click({ force: true })
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
  await page.locator('.admin-sidebar .auto-field .field-input').first().fill('Modification de test')
}

test.describe('Sauvegarde refusée quand le contenu n\'a pas pu être chargé', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('une lecture ratée bloque l\'auto-save', async ({ page }) => {
    const ecritures: string[] = []
    await interceptePageAccueil(page, ecritures, true)

    await allerSurAccueilEnSPA(page)
    await editerLePremierBloc(page)

    // Auto-save : débounce de 3 s. On attend largement au-delà.
    await page.waitForTimeout(6000)

    expect(ecritures).toEqual([])
    // L'admin doit comprendre pourquoi rien ne part, sinon il continue
    // d'éditer en croyant que c'est sauvegardé.
    await expect(page.locator('.admin-toolbar')).toContainText('contenu non chargé')
  })

  test('un clic explicite sur Sauvegarder est refusé et explique pourquoi', async ({ page }) => {
    const ecritures: string[] = []
    await interceptePageAccueil(page, ecritures, true)

    await allerSurAccueilEnSPA(page)
    await editerLePremierBloc(page)

    await page.locator('button[title="Sauvegarder les modifications"]').click()
    await expect(page.locator('.toast-error')).toContainText('écraserait', { timeout: 5000 })
    expect(ecritures).toEqual([])
  })

  test('contrôle : quand la lecture réussit, la sauvegarde part normalement', async ({ page }) => {
    // Sans ce test, le correctif pourrait se résumer à « ne plus jamais
    // sauvegarder », ce qui passerait les deux tests précédents.
    const ecritures: string[] = []
    await interceptePageAccueil(page, ecritures, false)

    await allerSurAccueilEnSPA(page)
    await editerLePremierBloc(page)

    await page.locator('button[title="Sauvegarder les modifications"]').click()
    await expect(page.locator('.admin-toolbar')).toContainText('Sauvegardé', { timeout: 10000 })
    expect(ecritures).toEqual(['PUT'])
  })
})
