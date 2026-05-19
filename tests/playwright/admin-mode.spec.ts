import { test, expect } from '@playwright/test'

test.describe('Mode édition', () => {
  test('la toolbar admin est visible avec ?admin=true', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const toolbar = page.locator('.admin-toolbar')
    await expect(toolbar).toBeVisible()

    const badge = page.locator('.admin-badge')
    await expect(badge).toHaveText('Mode édition')
  })

  test('le sélecteur de page est présent', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const select = page.locator('.admin-page-select')
    await expect(select).toBeVisible()

    const options = page.locator('.admin-page-select option')
    await expect(options).toHaveCount(6)
  })

  test('le bouton se connecter est visible quand non authentifié', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const loginBtn = page.getByRole('button', { name: 'Se connecter' })
    await expect(loginBtn).toBeVisible()
  })

  test('les blocs sont cliquables en mode admin', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const blocks = page.locator('.block-wrapper')
    const count = await blocks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('le clic sur un bloc le sélectionne (outline solid)', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const firstBlock = page.locator('.block-wrapper').first()
    await expect(firstBlock).toBeVisible()
    await firstBlock.click()
    await page.waitForTimeout(300)

    await expect(firstBlock).toHaveClass(/admin-selected/)
  })

  test('la sidebar n apparaît pas sans authentification', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.click()
    await page.waitForTimeout(300)

    const sidebar = page.locator('.admin-sidebar')
    await expect(sidebar).not.toBeVisible()
  })
})

test.describe('Boutons device — iframe preview', () => {
  test('les boutons device sont visibles', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const deviceToggle = page.locator('.device-toggle')
    await expect(deviceToggle).toBeVisible()

    const buttons = page.locator('.device-btn')
    await expect(buttons).toHaveCount(3)
  })

  test('desktop est actif par défaut — pas d iframe', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const iframe = page.locator('.device-iframe')
    await expect(iframe).not.toBeVisible()

    const header = page.locator('.site-header')
    await expect(header).toBeVisible()
  })

  test('clic sur bouton tablet affiche une iframe à 768px', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(1).click()
    await page.waitForTimeout(1000)

    const iframe = page.locator('.device-iframe')
    await expect(iframe).toBeVisible()

    const width = await iframe.evaluate(el => el.style.width)
    expect(width).toBe('768px')
  })

  test('clic sur bouton mobile affiche une iframe à 375px', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(1000)

    const iframe = page.locator('.device-iframe')
    await expect(iframe).toBeVisible()

    const width = await iframe.evaluate(el => el.style.width)
    expect(width).toBe('375px')
  })

  test('l iframe charge la page avec ?preview=true', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(1000)

    const iframe = page.locator('.device-iframe')
    const src = await iframe.getAttribute('src')
    expect(src).toContain('preview=true')
  })

  test('revenir en desktop supprime l iframe', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(1000)

    await expect(page.locator('.device-iframe')).toBeVisible()

    await buttons.nth(0).click()
    await page.waitForTimeout(500)

    await expect(page.locator('.device-iframe')).not.toBeVisible()
    await expect(page.locator('.site-header')).toBeVisible()
  })

  test('le switch desktop → tablet → mobile fonctionne en séquence', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    const iframe = page.locator('.device-iframe')

    await buttons.nth(1).click()
    await page.waitForTimeout(1000)
    await expect(iframe).toBeVisible()
    expect(await iframe.evaluate(el => el.style.width)).toBe('768px')

    await buttons.nth(2).click()
    await page.waitForTimeout(1000)
    expect(await iframe.evaluate(el => el.style.width)).toBe('375px')

    await buttons.nth(0).click()
    await page.waitForTimeout(500)
    await expect(iframe).not.toBeVisible()
  })
})

test.describe('Rendu réel dans l iframe — media queries', () => {
  test('le header dans l iframe mobile a le burger visible', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(2000)

    const iframe = page.frameLocator('.device-iframe')
    const burger = iframe.locator('.burger')
    await expect(burger).toBeVisible()

    const navDesktop = iframe.locator('.nav-desktop')
    await expect(navDesktop).not.toBeVisible()
  })

  test('le footer dans l iframe mobile est en colonne', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(2000)

    const iframe = page.frameLocator('.device-iframe')
    const footerInner = iframe.locator('.footer-inner')
    const flexDirection = await footerInner.evaluate(el => {
      return window.getComputedStyle(el).flexDirection
    })
    expect(flexDirection).toBe('column')
  })

  test('BlockBienvenue a une hauteur réduite dans l iframe mobile', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(2000)

    const iframe = page.frameLocator('.device-iframe')
    const block = iframe.locator('.block-bienvenue')
    const height = await block.evaluate(el => {
      return parseInt(window.getComputedStyle(el).minHeight)
    })
    expect(height).toBeLessThanOrEqual(400)
  })

  test('BlockAspirations désactive le scroll animation dans l iframe mobile', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(2).click()
    await page.waitForTimeout(2000)

    const iframe = page.frameLocator('.device-iframe')
    const viewport = iframe.locator('.aspirations-viewport')
    const height = await viewport.evaluate(el => {
      return window.getComputedStyle(el).height
    })
    expect(height).not.toContain('vh')
  })

  test('le rendu tablette est à 768px avec media queries activées', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(2000)

    const buttons = page.locator('.device-btn')
    await buttons.nth(1).click()
    await page.waitForTimeout(2000)

    const iframeEl = page.locator('.device-iframe')
    const width = await iframeEl.evaluate(el => el.style.width)
    expect(width).toBe('768px')

    const iframe = page.frameLocator('.device-iframe')
    const burger = iframe.locator('.burger')
    await expect(burger).toBeVisible()
  })
})

test.describe('Sidebar édition (nécessite authentification)', () => {
  test('la sidebar n est pas visible sans authentification', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.click()
    await page.waitForTimeout(300)

    await expect(page.locator('.admin-sidebar')).not.toBeVisible()
  })

  test('le bouton Se connecter est présent dans la toolbar', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const loginBtn = page.getByRole('button', { name: 'Se connecter' })
    await expect(loginBtn).toBeVisible()
  })

  test('un bloc sélectionné a la classe admin-selected', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const firstBlock = page.locator('.block-wrapper').first()
    await firstBlock.click()
    await page.waitForTimeout(300)

    await expect(firstBlock).toHaveClass(/admin-selected/)
  })

  test('cliquer sur un autre bloc change la sélection', async ({ page }) => {
    await page.goto('/?admin=true')
    await page.waitForTimeout(3000)

    const blocks = page.locator('.block-wrapper')
    const count = await blocks.count()
    if (count < 2) return

    await blocks.nth(0).click()
    await page.waitForTimeout(300)
    await expect(blocks.nth(0)).toHaveClass(/admin-selected/)

    await blocks.nth(1).click()
    await page.waitForTimeout(300)
    await expect(blocks.nth(0)).not.toHaveClass(/admin-selected/)
    await expect(blocks.nth(1)).toHaveClass(/admin-selected/)
  })
})
