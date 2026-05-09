import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto('http://localhost:3000/')

  // wait for content
  await page.waitForSelector('body', { timeout: 10000 })

  const report = await page.evaluate(() => {
    const aspirationsEl = document.querySelector('.block-aspirations') || document.querySelector('[data-testid="aspirations"]')
    function rectOf(el) {
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left, right: r.right, bottom: r.bottom }
    }

    const boxes = Array.from(document.querySelectorAll('*')).filter(el => el.classList && el.classList.contains('wixui-box'))
      .map((el, idx) => {
        const classes = Array.from(el.classList).slice(0,6)
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return {
          index: idx,
          id: el.id || null,
          classes,
          ariaHidden: el.getAttribute('aria-hidden'),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
          zIndex: style.zIndex,
          position: style.position,
          pointerEvents: style.pointerEvents,
          background: style.background || style.backgroundColor,
          backdropFilter: style.backdropFilter || null
        }
      })

    let aspirationsRect = null
    if (aspirationsEl) aspirationsRect = rectOf(aspirationsEl)

    // function to test overlap
    function overlaps(a, b) {
      if (!a || !b) return false
      return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom)
    }

    const overlapping = boxes.filter(b => aspirationsRect && overlaps(b.rect, aspirationsRect))

    return { found: boxes.length, boxes, aspirationsPresent: !!aspirationsEl, aspirationsRect, overlappingCount: overlapping.length, overlapping }
  })

  const outPath = path.join(outDir, 'wix-overlays.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log('Saved wix overlay report to', outPath)

  // take screenshot of full page
  const ssPath = path.join(outDir, 'wix-overlays-full.png')
  await page.screenshot({ path: ssPath, fullPage: true })
  console.log('Saved full page screenshot to', ssPath)

  await context.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
