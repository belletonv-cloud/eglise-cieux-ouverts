const { chromium } = require('playwright')

async function diagnose(url) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  console.log('\n=== Diagnosing', url)
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 15000 })
  } catch (e) {
    console.log('  ✖ failed to open', url, e.message)
    await browser.close()
    return
  }

  try {
    await page.waitForSelector('.block-aspirations', { timeout: 10000 })
  } catch (e) {
    console.log('  ✖ .block-aspirations not found')
    await browser.close()
    return
  }

  const box = await page.$eval('.block-aspirations', el => el.getBoundingClientRect())
  const vh = await page.evaluate(() => window.innerHeight)
  const start = vh * 3

  const circlesCount = await page.$$eval('.aspiration-circle', els => els.length)
  console.log('  circles count:', circlesCount)

  const lineActive = 0.02

  // helper to capture state for an index
  async function capture(index) {
    return page.evaluate((idx) => {
      const circle = document.querySelectorAll('.aspiration-circle')[idx]
      const line = document.querySelectorAll('.aspiration-line')[idx]
      const text = line ? line.querySelector('.aspiration-text') : null
      function cs(el, prop) {
        return el ? window.getComputedStyle(el).getPropertyValue(prop) : null
      }
      const rect = document.querySelector('.block-aspirations').getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 3
      const end = 0
      let sp
      if (rect.top > start) sp = 0
      else if (rect.top < end) sp = 1
      else sp = 1 - ((rect.top - end) / (start - end))
      return {
        idx,
        circleClass: circle ? circle.className : null,
        lineClass: line ? line.className : null,
        circleInline: circle ? circle.getAttribute('style') : null,
        textInline: text ? text.getAttribute('style') : null,
        circleTop: circle ? circle.getBoundingClientRect().top : null,
        lineTop: line ? line.getBoundingClientRect().top : null,
        circleTransitionDelay: circle ? cs(circle, 'transition-delay') : null,
        circleTransitionDuration: circle ? cs(circle, 'transition-duration') : null,
        textTransitionDelay: text ? cs(text, 'transition-delay') : null,
        textTransitionDuration: text ? cs(text, 'transition-duration') : null,
        sectionRectTop: rect.top,
        scrollProgress: sp,
      }
    }, index)
  }

  // Scroll down activating items
  for (let i = 0; i < circlesCount; i++) {
    const lineTotal = 1 / Math.max(1, circlesCount)
    const startP = i * lineTotal + lineActive
    const desiredRectTop = start * (1 - startP) - 20

    await page.evaluate(({ desiredRectTop }) => {
      const el = document.querySelector('.block-aspirations')
      if (!el) return
      const elTopDocument = el.getBoundingClientRect().top + window.scrollY
      const targetScrollY = Math.max(0, Math.floor(elTopDocument - desiredRectTop))
      window.scrollTo({ top: targetScrollY, behavior: 'auto' })
    }, { desiredRectTop })

    await page.waitForTimeout(250)
    const state = await capture(i)
    console.log('  DOWN idx', i, JSON.stringify(state))
    try {
      await page.screenshot({ path: `tests/tools/screenshots/${hostSlug(url)}-down-${i}.png`, fullPage: false })
    } catch (e) {
      // ignore screenshot failure
    }
  }

  // Scroll up deactivating items in reverse
  for (let i = circlesCount - 1; i >= 0; i--) {
    const lineTotal = 1 / Math.max(1, circlesCount)
    const startP = i * lineTotal + lineActive
    const desiredRectTop = start * (1 - startP) + 60

    await page.evaluate(({ desiredRectTop }) => {
      const el = document.querySelector('.block-aspirations')
      if (!el) return
      const elTopDocument = el.getBoundingClientRect().top + window.scrollY
      const targetScrollY = Math.max(0, Math.floor(elTopDocument - desiredRectTop))
      window.scrollTo({ top: targetScrollY, behavior: 'auto' })
    }, { desiredRectTop })

    await page.waitForTimeout(250)
    const state = await capture(i)
    console.log('  UP   idx', i, JSON.stringify(state))
    try {
      await page.screenshot({ path: `tests/tools/screenshots/${hostSlug(url)}-up-${i}.png`, fullPage: false })
    } catch (e) {
      // ignore screenshot failure
    }
  }

  await browser.close()
}

(async () => {
  const targets = [
    'http://localhost:3001/',
    'https://eglise-cieux-ouverts.pages.dev/'
  ]
  for (const t of targets) {
    await diagnose(t)
  }
})().catch(e => {
  console.error(e)
  process.exit(1)
})

function hostSlug(url) {
  return url.replace(/https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_')
}
