import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(target, { waitUntil: 'domcontentloaded' })

  // wait a bit for wix hydration
  await page.waitForTimeout(1500)

  // inject observer and perform scrolling to trigger animations
  const timeline = await page.evaluate(async () => {
    const report = { started: performance.now(), records: [] }

    function findTargetByText(text) {
      const el = Array.from(document.querySelectorAll('h1,h2,h3,div,span')).find(e => e.innerText && e.innerText.trim().includes(text))
      return el
    }

    const textToFind = 'Ce qui nous anime'
    const targetEl = findTargetByText(textToFind)
    const container = targetEl ? (targetEl.closest('.wixui-box, [data-testid="responsive-container-content"], .comp-mnltd86r-container') || targetEl.parentElement) : document.body

    // helper id assignment
    let __counter = 0

    // capture initial snapshot of candidate elements in container
    const candidates = Array.from(container.querySelectorAll('*')).slice(0, 300)
    const initial = candidates.map(el => {
      if (!el.dataset.wixInspectId) el.dataset.wixInspectId = `wix-${++__counter}`
      const s = getComputedStyle(el)
      return { id: el.dataset.wixInspectId, tag: el.tagName.toLowerCase(), classes: Array.from(el.classList).slice(0,8), opacity: s.opacity, transform: s.transform, transitionDelay: s.transitionDelay, animationName: s.animationName }
    })

    report.initial = initial

    // set up mutation observer
    const records = []
    const mo = new MutationObserver((mutList) => {
      for (const m of mutList) {
        if (!m.target) continue
        const el = m.target
        if (!el.dataset.wixInspectId) el.dataset.wixInspectId = `wix-${++__counter}`
        const s = getComputedStyle(el)
        records.push({ time: performance.now(), id: el.dataset.wixInspectId, attribute: m.attributeName, oldValue: m.oldValue, newValue: el.getAttribute(m.attributeName), tag: el.tagName.toLowerCase(), classes: Array.from(el.classList).slice(0,8), computed: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, animationName: s.animationName } })
      }
    })
    mo.observe(container, { attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style'] })

    // scroll container into view and perform a few scroll steps
    container.scrollIntoView({ behavior: 'auto', block: 'center' })
    await new Promise(r => setTimeout(r, 300))
    for (let i = 0; i < 12; i++) {
      window.scrollBy({ top: 150, behavior: 'smooth' })
      await new Promise(r => setTimeout(r, 220))
    }

    // wait for animations to settle
    await new Promise(r => setTimeout(r, 1200))
    mo.disconnect()

    report.records = records
    report.ended = performance.now()
    // expose for debugging
    window.__wixAnimTimeline = report
    return report
  })

  // enrich timeline: take screenshots for each record and capture bounding boxes
  const enriched = { url: target, startedAt: Date.now(), items: [] }
  for (let i = 0; i < (timeline.records || []).length; i++) {
    const r = timeline.records[i]
    const sel = `[data-wix-inspect-id="${r.id}"]`
    try {
      await page.waitForSelector(sel, { timeout: 2000 })
      const handle = await page.$(sel)
      const box = await handle.boundingBox()
      let screenshot = null
      if (box) {
        const name = `${String(i+1).padStart(2,'0')}-${r.id}.png`
        const p = path.join(outDir, name)
        await page.screenshot({ path: p, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, 2000)), height: Math.max(1, Math.min(box.height, 2000)) } })
        screenshot = p
      }
      enriched.items.push({ record: r, screenshot })
    } catch (e) {
      enriched.items.push({ record: r, error: e.message })
    }
  }

  const outPath = path.join(outDir, 'wix-timeline.json')
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2))
  console.log('Saved timeline to', outPath)

  await context.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
