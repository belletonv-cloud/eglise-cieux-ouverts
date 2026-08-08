import { test, expect } from '@playwright/test'
import { collectErrors } from './helpers/console'

// Viewport haut : la cible du drag doit être DANS le viewport pour que
// Sortable (elementFromPoint) détecte la position de dépôt
test.use({ viewport: { width: 1280, height: 1600 } })

async function dragHandleTo(
  page: import('@playwright/test').Page,
  handleIndex: number,
  targetIndex: number,
) {
  const h = await page.locator('.drag-handle').nth(handleIndex).boundingBox()
  const t = await page.locator('.block-wrapper').nth(targetIndex).boundingBox()
  if (!h || !t) throw new Error('bounding boxes introuvables')
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
  await page.mouse.down()
  // Petit mouvement initial pour armer le drag fallback de Sortable
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2 + 30, { steps: 5 })
  await page.mouse.move(t.x + 400, t.y + t.height / 2, { steps: 30 })
  await page.waitForTimeout(300)
  await page.mouse.up()
  await page.waitForTimeout(800)
}

test.describe('Drag & drop des blocs en mode admin', () => {
  test('réordonner un bloc par drag fonctionne et ne jette aucune erreur', async ({ page }) => {
    const errors = collectErrors(page)

    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await page.waitForTimeout(1500)

    const before = await page.$$eval('.block-wrapper', (els) =>
      els.map((e) => (e as HTMLElement).dataset.blockType),
    )
    expect(before.length).toBeGreaterThanOrEqual(3)

    await dragHandleTo(page, 0, 2)

    const after = await page.$$eval('.block-wrapper', (els) =>
      els.map((e) => (e as HTMLElement).dataset.blockType),
    )
    // Le premier bloc a bougé (le setter v-model applique la réorganisation)
    expect(after).not.toEqual(before)
    expect(after[0]).not.toBe(before[0])

    // Saisir la poignée n'a PAS ouvert la sidebar (pointerdown exclu)
    await expect(page.locator('.admin-sidebar-overlay')).toHaveCount(0)

    // Drag inverse pour stresser la réconciliation DOM/vdom
    await dragHandleTo(page, 2, 0)

    expect(errors, 'erreurs runtime pendant le drag').toEqual([])
  })

  test('la poignée de drag est visible dans le viewport (pas hors écran)', async ({ page }) => {
    await page.goto('/event-list?admin=true')
    await page.waitForSelector('.admin-toolbar', { timeout: 10000 })
    await page.waitForTimeout(1000)

    const box = await page.locator('.drag-handle').first().boundingBox()
    expect(box).not.toBeNull()
    // Ancien bug : left:-28px plaçait la poignée hors écran (x négatif),
    // rendant le drag inutilisable
    expect(box!.x).toBeGreaterThanOrEqual(0)
  })
})
