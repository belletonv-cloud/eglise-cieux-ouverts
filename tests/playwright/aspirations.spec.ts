import { test, expect } from "@playwright/test";

test.describe("Aspirations animation", () => {
  test("SSR content without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    // BlockAspirations
    await expect(page.locator(".aspirations-viewport")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(".aspirations-viewport .circle")).toHaveCount(4);

    // BlockBienvenue — text must be visible (opacity 1 in SSR)
    await expect(page.locator(".block-bienvenue")).toBeVisible();
    await expect(page.locator(".hero-bienvenue-char").first()).toBeVisible();

    // BlockRejoins — content must be visible (opacity 1 in SSR fallback)
    // In SSR no-JS, we check that content is present (triggered class is added by IntersectionObserver in non-SSR)
    await expect(page.locator(".block-rejoins")).toBeVisible();
    await expect(page.locator(".rejoins-title")).toHaveText("Rejoins-nous");

    // BlockVision — content must be visible in SSR/no-JS even before client-side triggers
    await expect(page.locator(".vision-section")).toBeVisible();
    await expect(page.locator(".vision-label")).toBeVisible();
    await expect(page.locator(".vision-quote")).toBeVisible();

    // Footer "Il y a une place pour toi !" — shutter chars must be visible in SSR (no-JS fallback CSS)
    await expect(page.locator(".shutter-char").first()).toBeVisible();
    await expect(page.locator(".footer-title")).toBeVisible();
    // Verify the text (spaces are &nbsp; = non-breaking \xa0)
    const footerText = await page.locator(".footer-title").innerText();
    expect(footerText.replace(/\xa0/g, " ")).toContain(
      "Il y a une place pour toi",
    );

    await context.close();
  });

  test("page loads with JS without 500 error", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Verify no Nuxt error
    const title = await page.title();
    expect(title).not.toContain("500");
    expect(title).toContain("Cieux Ouverts");

    // Verify SSR blocks are present
    await expect(page.locator(".aspirations-viewport")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator(".block-bienvenue")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator(".block-rejoins")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".vision-section")).toBeVisible({
      timeout: 5000,
    });

    // Verify no page errors
    expect(errors).toEqual([]);
  });

  test("circles are rendered correctly", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForTimeout(1000);

    const viewport = page.locator(".aspirations-viewport");
    await expect(viewport).toBeVisible({ timeout: 5000 });

    const circles = page.locator(".aspirations-viewport .circle");
    const count = await circles.count();
    expect(count).toBe(4);

    const texts = page.locator(".aspirations-viewport .text");
    expect(await texts.count()).toBe(4);

    // Verify aspiration texts
    await expect(texts.nth(0)).toHaveText(/Accueillir/);
    await expect(texts.nth(1)).toHaveText(/Célébrer/);
    await expect(texts.nth(2)).toHaveText(/Accompagner/);
    await expect(texts.nth(3)).toHaveText(/Témoigner/);

    expect(errors).toEqual([]);
  });

  test("triggered class added to internal blocks in public mode", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // Public mode (no admin)
    await page.goto("/");

    // Attendre un peu pour que les observers s'initialisent
    await page.waitForTimeout(500);

    // Scroll vers le bloc rejoins
    const rejoinsWrapper = page.locator(
      '.block-wrapper[data-block-type="rejoins"]',
    );
    await rejoinsWrapper.scrollIntoViewIfNeeded();

    // Attendre que l'IntersectionObserver ajoute la classe
    await page.waitForTimeout(500);

    // Vérifier que la classe triggered est ajoutée au wrapper
    await expect(rejoinsWrapper).toHaveClass(/triggered/);

    // Scroll vers le bloc aspirations
    const aspirationsWrapper = page.locator(
      '.block-wrapper[data-block-type="aspirations"]',
    );
    await aspirationsWrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(aspirationsWrapper).toHaveClass(/triggered/);

    // Scroll vers bienvenue
    const bienvenueWrapper = page.locator(
      '.block-wrapper[data-block-type="bienvenue"]',
    );
    await bienvenueWrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(bienvenueWrapper).toHaveClass(/triggered/);

    expect(errors).toEqual([]);
  });
});
