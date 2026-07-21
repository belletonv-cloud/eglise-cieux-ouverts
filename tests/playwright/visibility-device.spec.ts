import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

/**
 * Visibilité par device : un bloc dont `visibility.<device>` vaut false doit
 * porter la classe `hide-<device>` (masquage réel via media query CSS,
 * assets/css/main.css). On vérifie les deux niveaux :
 * - le wrapper PageRenderer (`.block-wrapper`, déjà en place) ;
 * - la <section> interne du composant (fix BlockStats/BlockQuote/BlockFooter).
 * On seed le contenu via l'API mock (PW_TEST=1) puis on rend la page publique
 * en desktop : le bloc masqué "mobile" reste dans le DOM avec la classe, et
 * disparaît seulement sous un viewport mobile (≤ 480px).
 */

const HIDDEN_ON_MOBILE = { desktop: true, tablet: true, mobile: false }

async function seedPage(request: any, blocks: any[]) {
  const res = await request.put('/api/pages/accueil', { data: { blocks } })
  if (!res.ok()) throw new Error('seedPage failed: ' + res.status())
}

test.describe('Visibilité par device (classes hide-*)', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('bloc Stats masqué sur mobile : classe hide-mobile sur wrapper et section', async ({ page, request }) => {
    await seedPage(request, [
      {
        id: 'blk-stats-vis',
        type: 'stats',
        props: { title: 'Stats visibilité', animation: 'none' },
        visibility: HIDDEN_ON_MOBILE,
      },
    ])

    await page.goto('/')
    const section = page.locator('.block-stats')
    await expect(section).toHaveClass(/hide-mobile/)
    await expect(page.locator('.block-wrapper[data-block-id="blk-stats-vis"]')).toHaveClass(/hide-mobile/)

    // Desktop : visible ; viewport mobile : masqué par la media query
    await expect(section).toBeVisible()
    await page.setViewportSize({ width: 400, height: 800 })
    await expect(section).toBeHidden()
  })

  test('bloc Quote masqué sur mobile : classe hide-mobile sur wrapper et section', async ({ page, request }) => {
    await seedPage(request, [
      {
        id: 'blk-quote-vis',
        type: 'quote',
        props: { quote: 'Citation visibilité', animation: 'none' },
        visibility: HIDDEN_ON_MOBILE,
      },
    ])

    await page.goto('/')
    const section = page.locator('.block-quote')
    await expect(section).toHaveClass(/hide-mobile/)
    await expect(page.locator('.block-wrapper[data-block-id="blk-quote-vis"]')).toHaveClass(/hide-mobile/)

    await expect(section).toBeVisible()
    await page.setViewportSize({ width: 400, height: 800 })
    await expect(section).toBeHidden()
  })

  test('animation wrapper appliquée sur la section interne de Stats et Quote', async ({ page, request }) => {
    await seedPage(request, [
      { id: 'blk-stats-anim', type: 'stats', props: { title: 'Stats anim', animation: 'fadeIn' }, visibility: {} },
      { id: 'blk-quote-anim', type: 'quote', props: { quote: 'Quote anim', animation: 'slideUp' }, visibility: {} },
    ])

    await page.goto('/')
    await expect(page.locator('.block-stats')).toHaveClass(/block-anim-fadeIn/)
    await expect(page.locator('.block-quote')).toHaveClass(/block-anim-slideUp/)
  })

  test('footer masqué sur mobile : classe hide-mobile sur .site-footer', async ({ page, request }) => {
    // Le footer est rendu par layouts/default.vue (hors PageRenderer) : la
    // classe doit venir du composant BlockFooter lui-même. Sa visibilité
    // voyage dans les props sauvegardées (settings/footer).
    const res = await request.put('/api/footer', {
      data: { props: { title: 'Footer visibilité', visibility: HIDDEN_ON_MOBILE } },
    })
    if (!res.ok()) throw new Error('seed footer failed: ' + res.status())

    await page.goto('/')
    const footer = page.locator('footer.site-footer')
    // Les props du footer sont chargées côté client (loadFooterBlock au
    // mount du layout) — attendre que la classe apparaisse.
    await expect(footer).toHaveClass(/hide-mobile/, { timeout: 5000 })

    await page.setViewportSize({ width: 400, height: 800 })
    await expect(footer).toBeHidden()
  })
})
