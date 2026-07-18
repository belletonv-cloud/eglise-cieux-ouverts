import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

// Même stratégie que admin-drag-blocks.spec.ts : viewport haut pour que la
// cible du drag soit dans le viewport (Sortable utilise elementFromPoint).
test.use({ viewport: { width: 1280, height: 1400 } })

async function dragHandleTo(
  page: import('@playwright/test').Page,
  handleSelector: string,
  itemSelector: string,
  handleIndex: number,
  targetIndex: number,
) {
  const h = await page.locator(handleSelector).nth(handleIndex).boundingBox()
  const t = await page.locator(itemSelector).nth(targetIndex).boundingBox()
  if (!h || !t) throw new Error('bounding boxes introuvables')
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
  await page.mouse.down()
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2 + 20, { steps: 5 })
  await page.mouse.move(t.x + t.width / 2, t.y + t.height - 5, { steps: 20 })
  await page.waitForTimeout(300)
  await page.mouse.up()
  await page.waitForTimeout(500)
}

test.describe('Drag & drop des éléments à l\'intérieur d\'un champ liste (FieldImages)', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('réordonner les images d\'une galerie textImage par drag met à jour le rendu', async ({ page }) => {
    await page.goto('/messages?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const block = page.locator('.block-textimage').first()
    await block.locator('..').click()
    await page.waitForTimeout(300)

    const addBtn = page.locator('.admin-sidebar button', { hasText: '+ Ajouter une image' })
    for (const url of ['/photos/A.jpg', '/photos/B.jpg', '/photos/C.jpg']) {
      await addBtn.click()
      const inputs = page.locator('.admin-sidebar .array-item input[placeholder="URL image"]')
      await inputs.last().fill(url)
      await page.waitForTimeout(150)
    }

    const inputsBefore = await page.locator('.admin-sidebar .array-item input[placeholder="URL image"]').evaluateAll((els) => (els as HTMLInputElement[]).map(e => e.value))
    expect(inputsBefore).toEqual(['/photos/A.jpg', '/photos/B.jpg', '/photos/C.jpg'])

    // Glisser le premier élément (A) en dernière position
    await dragHandleTo(page, '.admin-sidebar .array-drag-handle', '.admin-sidebar .array-item', 0, 2)

    const inputsAfter = await page.locator('.admin-sidebar .array-item input[placeholder="URL image"]').evaluateAll((els) => (els as HTMLInputElement[]).map(e => e.value))
    expect(inputsAfter).not.toEqual(inputsBefore)
    expect(inputsAfter[inputsAfter.length - 1]).toBe('/photos/A.jpg')

    // Le rendu public (mini-galerie sous l'image principale) reflète le nouvel ordre
    const thumbs = page.locator('.ti-gallery-thumb')
    await expect(thumbs).toHaveCount(3)
    const lastSrc = await thumbs.last().getAttribute('src')
    expect(lastSrc).toContain('A.jpg')
  })
})

test.describe('Drag & drop des éléments à l\'intérieur d\'un champ liste (FieldArray)', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('réordonner les activités par drag met à jour le rendu public', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const block = page.locator('.block-activities').first()
    await expect(block).toBeVisible({ timeout: 5000 })
    await block.locator('..').click()
    await page.waitForTimeout(300)

    // Le fixture mock de cette page a des props vides pour ce bloc — la
    // sidebar affiche désormais les valeurs par défaut du type de bloc
    // (comme le rendu public), donc les 3 activités par défaut sont déjà
    // présentes sans action préalable.
    const titlesBefore = await page.locator('.admin-sidebar .array-item input[placeholder="Titre"]').evaluateAll((els) => (els as HTMLInputElement[]).map(e => e.value))
    expect(titlesBefore).toEqual(['Rencontre du dimanche', 'Groupe de partage', 'Repas convivial'])

    await dragHandleTo(page, '.admin-sidebar .array-drag-handle', '.admin-sidebar .array-item', 0, titlesBefore.length - 1)

    const titlesAfter = await page.locator('.admin-sidebar .array-item input[placeholder="Titre"]').evaluateAll((els) => (els as HTMLInputElement[]).map(e => e.value))
    expect(titlesAfter).not.toEqual(titlesBefore)
    expect(titlesAfter[titlesAfter.length - 1]).toBe('Rencontre du dimanche')

    // Le rendu public (slides) reflète le nouvel ordre
    const slideTitles = await page.locator('.block-activities .overlay-title').allTextContents()
    expect(slideTitles[slideTitles.length - 1]).toBe('Rencontre du dimanche')
  })
})
