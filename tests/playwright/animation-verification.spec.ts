import { test, expect } from "@playwright/test"

function selectBlock(page: import("@playwright/test").Page, type: string) {
  return test.step(`select block ${type}`, async () => {
    const closeBtn = page.locator(".admin-sidebar .admin-close-btn")
    if ((await closeBtn.count()) > 0) await closeBtn.click()
    await page.waitForTimeout(200)
    const wrapper = page.locator(`.block-wrapper[data-block-type="${type}"]`)
    await wrapper.scrollIntoViewIfNeeded()
    await wrapper.click({ force: true })
    await page.waitForTimeout(400)
    await expect(page.locator(".admin-sidebar")).toBeVisible()
  })
}

function animBtn(page: import("@playwright/test").Page, label: string) {
  return page
    .locator(".admin-sidebar .auto-editor .auto-field")
    .filter({ hasText: /Animation/i })
    .locator(".anim-btn")
    .filter({ hasText: label })
}

test.describe("Animations — vérification complète", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?admin=true")
    await page.waitForLoadState("networkidle")
    await expect(page.locator(".admin-toolbar")).toBeVisible({ timeout: 15000 })
    await expect(page.locator(".block-wrapper")).toHaveCount(8, { timeout: 15000 })
  })

  // ── 1. Changer l'animation sur chaque bloc qui a le champ ──
  for (const btype of ["bienvenue", "vision", "contact"]) {
    test(`Block ${btype} — cycle animations (Apparition → Glisse haut → Aucune)`, async ({
      page,
    }) => {
      await selectBlock(page, btype)

      await animBtn(page, "Apparition").click()
      await page.waitForTimeout(150)
      const w1 = page.locator(`.block-wrapper[data-block-type="${btype}"]`)
      await expect(w1).toHaveClass(/block-anim-fadeIn/)

      await animBtn(page, "Glisse haut").click()
      await page.waitForTimeout(150)
      await expect(w1).toHaveClass(/block-anim-slideUp/)

      await animBtn(page, "Aucune").click()
      await page.waitForTimeout(150)
      const cls = await w1.getAttribute("class")
      expect(cls).not.toMatch(/block-anim-/)
    })
  }

  // ── 2. Rejoins — keyframes CSS vériﬁés ──
  test("Rejoins — animation-name + view-timeline + stagger", async ({ page }) => {
    await page.locator('.block-wrapper[data-block-type="rejoins"]').scrollIntoViewIfNeeded()

    const section = page.locator(".block-rejoins")
    const tlName = await section.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("view-timeline-name"),
    )
    expect(tlName).toContain("rejoins")

    const textEl = page.locator(".rejoins-text-container")
    const textAnim = await textEl.evaluate((el) => getComputedStyle(el).animationName)
    expect(textAnim).toContain("text-from-left")

    const horaires = page.locator(".rejoins-horaire")
    const count = await horaires.count()
    expect(count).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < count; i++) {
      const name = await horaires.nth(i).evaluate((el) => getComputedStyle(el).animationName)
      expect(name).toContain("horaires-from-below")
    }
  })

  // ── 3. Hero — pas d'animation ──
  test("Hero — pas de champ animation", async ({ page }) => {
    await selectBlock(page, "hero")
    await expect(
      page.locator(".admin-sidebar .auto-editor .auto-field").filter({ hasText: /Animation/i }),
    ).toHaveCount(0)
  })

  // ── 4. Aspirations — cercles présents ──
  test("Aspirations — cercles dans le DOM", async ({ page }) => {
    await page.locator('.block-wrapper[data-block-type="aspirations"]').scrollIntoViewIfNeeded()
    expect(await page.locator(".circle").count()).toBeGreaterThan(0)
  })

  // ── 5. Toutes les animations disponibles sur vision ──
  test("Vision — cycle complet (tous les boutons)", async ({ page }) => {
    await selectBlock(page, "vision")
    for (const label of ["Apparition", "Glisse haut", "Glisse gauche", "Portail 3D", "Aucune"]) {
      const btn = animBtn(page, label)
      if ((await btn.count()) > 0) await btn.click()
      await page.waitForTimeout(100)
    }
    await expect(animBtn(page, "Aucune")).toHaveClass(/active/)
  })
})
