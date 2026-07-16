import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

// Viewport large : le canvas doit être entièrement visible pour que les
// coordonnées de drag/resize (page.mouse) tombent dans le bon élément.
test.use({ viewport: { width: 1280, height: 1400 } })

function collectErrors(page: import('@playwright/test').Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('Hydration')) errors.push('console.error: ' + msg.text())
  })
  return errors
}

async function selectHeroBlock(page: import('@playwright/test').Page) {
  await page.locator('.block-wrapper[data-block-id="bloc-hero"]').click()
  await page.waitForTimeout(300)
}

test.describe('Éléments additionnels (canvas libre) — panneau sidebar', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('un bloc sans extraElements ne rend aucun .bee-el (non-régression)', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await page.waitForTimeout(500)

    await expect(page.locator('.bee-el')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('ajouter un élément de chaque type les fait apparaître dans la sidebar et sur le canvas', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await expect(page.locator('.field-elements')).toBeVisible()

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.array-add-btn', { hasText: '+ Image' }).click()
    await page.locator('.array-add-btn', { hasText: '+ Bouton' }).click()

    await expect(page.locator('.field-elements .array-item')).toHaveCount(3)
    await expect(page.locator('.bee-el')).toHaveCount(3)

    expect(errors).toEqual([])
  })

  test('éditer le contenu met à jour le rendu du canvas en direct', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.field-elements .field-textarea').fill('Texte de test canvas')
    await expect(page.locator('.bee-text')).toHaveText('Texte de test canvas')

    await page.locator('.array-add-btn', { hasText: '+ Image' }).click()
    const imageInputs = page.locator('.field-elements .array-item').nth(1).locator('.field-input')
    await imageInputs.first().fill('/logo.png')
    await expect(page.locator('.bee-image')).toHaveAttribute('src', '/logo.png')

    await page.locator('.array-add-btn', { hasText: '+ Bouton' }).click()
    const buttonInputs = page.locator('.field-elements .array-item').nth(2).locator('.field-input')
    await buttonInputs.first().fill('Cliquez ici')
    await expect(page.locator('.bee-button')).toHaveText('Cliquez ici')
  })

  test('cliquer un élément dans la sidebar le sélectionne sur le canvas (et inversement)', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.array-add-btn', { hasText: '+ Image' }).click()

    // Sélection depuis la sidebar → le canvas montre l'élément actif (poignées).
    // On clique le header (pas le body de l'item : la textarea/les inputs ont
    // @click.stop pour ne pas déclencher la sélection en éditant du contenu).
    await page.locator('.field-elements .array-item').first().locator('.array-item-header').click()
    await expect(page.locator('.field-elements .array-item').first()).toHaveClass(/array-item-selected/)
    await expect(page.locator('.bee-el').first()).toHaveClass(/active/)

    // Sélection depuis le canvas (clic direct) → la sidebar suit
    await page.locator('.bee-el').nth(1).click()
    await expect(page.locator('.field-elements .array-item').nth(1)).toHaveClass(/array-item-selected/)
  })

  test('déplacer un élément à la souris met à jour sa position (%) et persiste', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.field-elements .field-textarea').fill('Élément déplaçable')

    const el = page.locator('.bee-el').first()
    await el.click() // sélectionne pour activer le drag
    await page.waitForTimeout(200)

    const before = await el.boundingBox()
    if (!before) throw new Error('bounding box introuvable')

    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + before.width / 2 + 100, before.y + before.height / 2 + 50, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(300)

    const after = await el.boundingBox()
    if (!after) throw new Error('bounding box introuvable après drag')
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(50)
    expect(Math.abs(after.y - before.y)).toBeGreaterThan(20)

    // Sauvegarde puis vérification de la persistance via l'API
    await page.locator('button[title="Sauvegarder les modifications"], button:has-text("Sauvegarder")').first().click()
    await page.waitForTimeout(500)

    const res = await page.request.get('/api/pages/accueil')
    const data = await res.json()
    const hero = (data.blocks || []).find((b: any) => b.id === 'bloc-hero')
    expect(hero?.props?.extraElements?.length).toBe(1)
    expect(hero.props.extraElements[0].xPct).toBeGreaterThan(10) // défaut était 10

    expect(errors).toEqual([])
  })

  test('redimensionner un élément avec une poignée met à jour largeur/hauteur (%)', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()

    const el = page.locator('.bee-el').first()
    await el.click()
    await page.waitForTimeout(200)

    const before = await el.boundingBox()
    if (!before) throw new Error('bounding box introuvable')

    const handle = el.locator('.handle-br')
    const handleBox = await handle.boundingBox()
    if (!handleBox) throw new Error('poignée introuvable')

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(handleBox.x + 80, handleBox.y + 40, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(300)

    const after = await el.boundingBox()
    if (!after) throw new Error('bounding box introuvable après resize')
    expect(after.width).toBeGreaterThan(before.width)
    expect(after.height).toBeGreaterThan(before.height)
  })

  test('supprimer un élément le retire de la sidebar et du canvas', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.array-add-btn', { hasText: '+ Image' }).click()
    await expect(page.locator('.bee-el')).toHaveCount(2)

    await page.locator('.field-elements .array-item-del').first().click()
    await expect(page.locator('.field-elements .array-item')).toHaveCount(1)
    await expect(page.locator('.bee-el')).toHaveCount(1)

    await page.locator('.field-elements .array-item-del').first().click()
    await expect(page.locator('.field-elements .array-item')).toHaveCount(0)
    await expect(page.locator('.bee-el')).toHaveCount(0)
  })

  test('le canvas se superpose sur le contenu du bloc (pas une zone séparée en dessous)', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()

    const heroWrapper = page.locator('.block-wrapper[data-block-id="bloc-hero"]')
    const heroBox = await heroWrapper.boundingBox()
    const canvasBox = await page.locator('.bee-canvas').boundingBox()
    if (!heroBox || !canvasBox) throw new Error('bounding box introuvable')

    // Le canvas occupe exactement la même zone que le bloc — aucune bande
    // supplémentaire ajoutée après le contenu du bloc.
    expect(canvasBox.y).toBeCloseTo(heroBox.y, 0)
    expect(canvasBox.height).toBeCloseTo(heroBox.height, 0)
  })

  test('un clic sur une zone vide du canvas atteint le contenu du bloc en dessous (pointer-events)', async ({ page }) => {
    // Testé sur le rendu PUBLIC : en admin, le backdrop plein écran de la
    // sidebar (.admin-sidebar-overlay, z-index 9998) couvrirait toute la
    // page dès qu'un bloc est sélectionné, ce qui fausserait ce test —
    // ce backdrop est un comportement préexistant indépendant du canvas.
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)
    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('button[title="Sauvegarder les modifications"], button:has-text("Sauvegarder")').first().click()
    await page.waitForTimeout(500)

    await page.goto('/accueil')
    await page.waitForTimeout(500)

    // Un point du canvas loin de l'élément (60%/70%) doit résoudre vers le
    // contenu du bloc (l'image de fond du Hero), pas vers .bee-canvas
    // lui-même (pointer-events: none sur la zone vide).
    const topElement = await page.evaluate(() => {
      const canvas = document.querySelector('.bee-canvas') as HTMLElement
      const rect = canvas.getBoundingClientRect()
      const el = document.elementFromPoint(rect.left + rect.width * 0.6, rect.top + rect.height * 0.7)
      return el?.className
    })
    expect(topElement).not.toContain('bee-canvas')
  })

  test('interagir avec un élément du canvas ne re-sélectionne pas son bloc (ne coupe pas un drag/resize en cours)', async ({ page }) => {
    // Bug réel : docPointerHandler/docClickHandler/wrapperClick sélectionnaient
    // le bloc sur TOUT clic dans .block-wrapper, y compris sur les poignées
    // VueDraggableResizable — rouvrant/re-render la sidebar en pleine saisie
    // d'une poignée et avalant le drag, exactement le bug déjà connu et
    // corrigé pour .drag-handle (Sortable). Ce test vérifie que cliquer sur
    // un élément du canvas d'un bloc NE change PAS le bloc actuellement
    // sélectionné (le canvas gère sa propre sélection d'élément séparément).
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)
    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()

    // On sélectionne un AUTRE bloc — editingBlockId pointe maintenant vers lui.
    // Comportement préexistant de la sidebar (indépendant du canvas) : tant
    // qu'elle est ouverte, son backdrop plein écran (.admin-sidebar-overlay)
    // intercepte tout clic ailleurs sur la page — il faut donc cliquer le
    // backdrop explicitement pour fermer la sidebar du Hero avant de
    // pouvoir sélectionner Bienvenue (Playwright cible le locator demandé
    // et attend qu'il devienne cliquable, il ne clique jamais l'obstruction
    // à sa place comme le ferait un utilisateur réel).
    await page.locator('.admin-sidebar-overlay').click()
    await page.waitForTimeout(200)
    await page.locator('.block-wrapper[data-block-id="bloc-bienvenue"]').click()
    await page.waitForTimeout(200)
    await expect(page.locator('.block-wrapper.admin-selected')).toHaveAttribute('data-block-id', 'bloc-bienvenue')

    // Cliquer sur l'élément du Hero (bloc non sélectionné) ne doit PAS
    // ramener la sélection sur le Hero
    await page.locator('.bee-el').first().click()
    await page.waitForTimeout(200)
    await expect(page.locator('.block-wrapper.admin-selected')).toHaveAttribute('data-block-id', 'bloc-bienvenue')
  })

  test('persistance après rechargement : le rendu public statique reflète position/taille/contenu', async ({ page }) => {
    await page.goto('/accueil?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await selectHeroBlock(page)

    await page.locator('.array-add-btn', { hasText: '+ Texte' }).click()
    await page.locator('.field-elements .field-textarea').fill('Persisté après reload')

    await page.locator('button[title="Sauvegarder les modifications"], button:has-text("Sauvegarder")').first().click()
    await page.waitForTimeout(500)

    await page.goto('/accueil')
    await page.waitForTimeout(500)

    const bee = page.locator('.bee-el').first()
    await expect(bee).toHaveText('Persisté après reload')
    const style = await bee.getAttribute('style')
    expect(style).toContain('position:absolute')
    expect(style).toContain('%')
  })
})
