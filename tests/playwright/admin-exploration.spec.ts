import { test, expect } from "@playwright/test"

const PAGE_BLOCKS = [
  { type: "hero", strategy: "none" },
  { type: "bienvenue", strategy: "wrapper", animDefault: "Portail 3D" },
  { type: "rejoins", strategy: "internal" },
  { type: "aspirations", strategy: "internal" },
  { type: "vision", strategy: "wrapper", animDefault: "Aucune" },
  { type: "activities", strategy: "wrapper", animDefault: "Apparition" },
  { type: "nousRejoindre", strategy: "internal" },
  { type: "contact", strategy: "wrapper", animDefault: "Apparition" },
]

const WRAPPER_ANIM = ["bienvenue", "vision", "activities", "contact"]

const ANIM_BY_LABEL: Record<string, string> = {
  "Apparition": "block-anim-fadeIn",
  "Glisse haut": "block-anim-slideUp",
  "Glisse gauche": "block-anim-slideLeft",
}

async function closeSidebar(page: import("@playwright/test").Page) {
  const closeBtn = page.locator(".admin-sidebar .admin-close-btn")
  if ((await closeBtn.count()) > 0) {
    await closeBtn.click()
    await page.waitForTimeout(300)
  }
  await expect(page.locator(".admin-sidebar-overlay")).not.toBeVisible({ timeout: 3000 })
}

async function selectBlock(page: import("@playwright/test").Page, type: string) {
  // Ensure no sidebar overlay is blocking
  await closeSidebar(page)
  const wrapper = page.locator(`.block-wrapper[data-block-type="${type}"]`)
  await wrapper.scrollIntoViewIfNeeded()
  await wrapper.click({ force: true })
  await page.waitForTimeout(500)
  await expect(page.locator(".admin-sidebar")).toBeVisible({ timeout: 3000 })
  await expect(wrapper).toHaveClass(/admin-selected/)
}

test.describe("Admin exploration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?admin=true")
    await page.waitForLoadState("networkidle")
    await expect(page.locator(".admin-toolbar")).toBeVisible({ timeout: 15000 })
    await expect(page.locator(".block-wrapper")).toHaveCount(PAGE_BLOCKS.length, {
      timeout: 15000,
    })
  })

  test("Parcours complet — sélection + édition de tous les blocs", async ({ page }) => {
    // 1. Vérifier que chaque bloc s'ouvre dans la sidebar
    for (const { type } of PAGE_BLOCKS) {
      await selectBlock(page, type)
      const header = page.locator(".admin-sidebar-header h3")
      await expect(header).not.toBeEmpty()
      const fields = page.locator(".admin-sidebar .auto-editor .auto-field")
      expect(await fields.count()).toBeGreaterThan(0)
    }

    // 2. Changer l'animation des blocs wrapper
    for (const btype of WRAPPER_ANIM) {
      await selectBlock(page, btype)
      const animField = page
        .locator(".admin-sidebar .auto-editor .auto-field")
        .filter({ hasText: /Animation/i })

      for (const [label, css] of Object.entries(ANIM_BY_LABEL)) {
        const btn = animField.locator(".anim-btn").filter({ hasText: label })
        if ((await btn.count()) === 0) continue
        await btn.click()
        await page.waitForTimeout(150)
        const wrapper = page.locator(`.block-wrapper[data-block-type="${btype}"]`)
        if (css) {
          await expect(wrapper).toHaveClass(new RegExp(css))
        }
      }
    }

    // 3. Vérifier que les blocs internes n'ont pas d'animation wrapper
    for (const { type } of PAGE_BLOCKS.filter((b) => b.strategy === "internal")) {
      await selectBlock(page, type)
      const wrapper = page.locator(`.block-wrapper[data-block-type="${type}"]`)
      const cls = await wrapper.getAttribute("class")
      expect(cls).not.toMatch(/block-anim-/)
    }

    // 4. Vérifier que hero n'a pas de champ animation
    await selectBlock(page, "hero")
    const animField = page
      .locator(".admin-sidebar .auto-editor .auto-field")
      .filter({ hasText: /Animation/i })
    await expect(animField).toHaveCount(0)

    // 5. Éditer un champ texte du hero
    const heroInput = page
      .locator(".admin-sidebar .auto-editor .auto-field")
      .filter({ hasText: /Titre/i })
      .locator("input.field-input")
      .first()
    if ((await heroInput.count()) > 0) {
      await heroInput.fill("Test exploration admin")
      await expect(heroInput).toHaveValue("Test exploration admin")
    }

    // 6. Rejoins — sélectionné et visible
    await selectBlock(page, "rejoins")
    const rejWrapper = page.locator('.block-wrapper[data-block-type="rejoins"]')
    await expect(rejWrapper).toBeVisible()

    // 7. Horaires éditable
    const horaireFields = page
      .locator(".admin-sidebar .auto-editor .auto-field")
      .filter({ hasText: /Heure|Horaire/i })
    expect(await horaireFields.count()).toBeGreaterThan(0)
  })

  test("Undo/Redo — boutons présents dans la toolbar", async ({ page }) => {
    const buttons = page.locator(".admin-toolbar .admin-icon-btn")
    expect(await buttons.count()).toBeGreaterThanOrEqual(2)
  })

  test("Footer — bouton accessible dans la toolbar", async ({ page }) => {
    const footerBtn = page
      .locator(".admin-toolbar button")
      .filter({ hasText: /Footer/i })
    if ((await footerBtn.count()) > 0) {
      await footerBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator(".admin-sidebar")).toBeVisible()
    }
  })

  test("Aucune erreur console en naviguant dans l'admin", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })

    for (const { type } of PAGE_BLOCKS) {
      await selectBlock(page, type)
    }

    const filtered = errors.filter(
      (e) =>
        !e.includes("Failed to load document") &&
        !e.includes("auth/") &&
        !e.includes("Firebase") &&
        !e.includes("favicon"),
    )
    expect(filtered).toEqual([])
  })
})
