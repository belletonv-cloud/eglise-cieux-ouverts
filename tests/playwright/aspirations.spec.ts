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

    // BlockRejoins — content must be visible (checked via text)
    await expect(page.locator(".block-rejoins")).toBeVisible();
    await expect(page.locator(".rejoins-title")).toHaveText("Rejoins-nous");
    // In SSR no-JS, elements should be visible via CSS (opacity 1 for mobile and fallback)
    // The CSS fallback for mobile (<768px) sets opacity: 1, transform: none
    // For SSR no-JS we can't check IntersectionObserver-triggered classes
    await expect(page.locator(".rejoins-text-container")).toBeVisible();

    // BlockVision — must have .is-triggered class (content visible in no-JS)
    await expect(page.locator(".vision-section.is-triggered")).toBeVisible();
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

  test("triggered class added to wrapper on viewport entry (public mode)", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // Not in admin mode
    await page.goto("/");

    // Wait for hydration and scroll into view
    await page.waitForTimeout(1000);

    // Scroll to reveal rejoins block
    const rejoinsBlock = page.locator(
      '.block-wrapper[data-block-type="rejoins"]',
    );
    await rejoinsBlock.scrollIntoViewIfNeeded();

    // Check that triggered class is added (via IntersectionObserver fallback)
    await page.waitForTimeout(500); // Wait for observer callback
    await expect(rejoinsBlock).toHaveClass(/triggered/);

    // Same for aspirations
    const aspirationsBlock = page.locator(
      '.block-wrapper[data-block-type="aspirations"]',
    );
    await aspirationsBlock.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(aspirationsBlock).toHaveClass(/triggered/);

    expect(errors).toEqual([]);
  });
});
