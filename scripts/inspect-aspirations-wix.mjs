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
  await page.waitForTimeout(1200)

  const report = await page.evaluate(async () => {
    const keywords = ['Nos aspirations', 'Aspirations', 'aspir']
    function findByText(keys) {
      const texts = Array.from(document.querySelectorAll('h1,h2,h3,div,span'))
      for (const k of keys) {
        const found = texts.find(e => e.innerText && e.innerText.toLowerCase().includes(k.toLowerCase()))
        if (found) return found
      }
      return null
    }

    const titleEl = findByText(keywords)
    // fallback: look for elements with class containing 'aspir'
    let container = null
    if (titleEl) container = titleEl.closest('.wixui-box, section, [data-testid="responsive-container-content"]') || titleEl.parentElement
    if (!container) {
      const byClass = Array.from(document.querySelectorAll('[class]')).find(el => /aspir/i.test(el.className))
      if (byClass) container = byClass.closest('.wixui-box, section, [data-testid="responsive-container-content"]') || byClass.parentElement
    }
    if (!container) container = document.body

    // prepare candidate elements inside container
    const candidates = Array.from(container.querySelectorAll('*')).slice(0, 400)
    let counter = 0
    const snapshot = candidates.map(el => {
      if (!el.dataset.inspectId) el.dataset.inspectId = `asp-${++counter}`
      const s = getComputedStyle(el)
      return { id: el.dataset.inspectId, tag: el.tagName.toLowerCase(), classes: Array.from(el.classList).slice(0,8), opacity: s.opacity, transform: s.transform, transitionDelay: s.transitionDelay, animationName: s.animationName }
    })

    const records = []
    const mo = new MutationObserver((mutList) => {
      for (const m of mutList) {
        if (!m.target) continue
        const el = m.target
        if (!el.dataset.inspectId) el.dataset.inspectId = `asp-${++counter}`
        const s = getComputedStyle(el)
        records.push({ time: performance.now(), id: el.dataset.inspectId, tag: el.tagName.toLowerCase(), attribute: m.attributeName, oldValue: m.oldValue, newValue: el.getAttribute(m.attributeName), classes: Array.from(el.classList).slice(0,8), computed: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, animationName: s.animationName } })
      }
    })
    mo.observe(container, { attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style'] })

    // scroll to container and nudge to trigger
    container.scrollIntoView({ behavior: 'auto', block: 'center' })
    await new Promise(r => setTimeout(r, 300))
    // small scrolls to trigger intersection observers
    for (let i = 0; i < 12; i++) {
      window.scrollBy({ top: 140, behavior: 'smooth' })
      await new Promise(r => setTimeout(r, 220))
    }
    await new Promise(r => setTimeout(r, 1000))
    mo.disconnect()

    return { containerFound: !!container, titleText: titleEl ? titleEl.innerText.slice(0,200) : null, snapshotLength: snapshot.length, records }
  })

  // Enrich: capture styles and screenshots for records inside viewport
  const enriched = { url: target, requestedAt: Date.now(), titleText: report.titleText, items: [] }
  for (let i = 0; i < (report.records || []).length; i++) {
    const r = report.records[i]
    const sel = `[data-inspect-id="${r.id}"]` // we used data-inspect-id? earlier used dataset.inspectId -> attribute is data-inspect-id? Playwright matches dataset with hyphen
    // However dataset.inspectId becomes data-inspect-id in DOM
    const dataSel = `[data-inspect-id="${r.id}"]`
    try {
      // prefer the id with hyphen
      const handle = await page.$(dataSel) || await page.$(sel) || await page.$(`[data-wix-inspect-id="${r.id}"]`)
      if (!handle) { enriched.items.push({ record: r, error: 'element-not-found' }); continue }
      const box = await handle.boundingBox()
      let screenshot = null
      if (box && box.width > 0 && box.height > 0) {
        const name = `${String(i+1).padStart(2,'0')}-asp-${r.id}.png`
        const p = path.join(outDir, name)
        await page.screenshot({ path: p, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, 2000)), height: Math.max(1, Math.min(box.height, 2000)) } })
        screenshot = p
      }
      // computed style
      const computed = await page.evaluate(el => {
        const s = getComputedStyle(el)
        return { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, animationName: s.animationName }
      }, handle)
      enriched.items.push({ record: r, computed, screenshot })
    } catch (e) {
      enriched.items.push({ record: r, error: e.message })
    }
  }

  const outPath = path.join(outDir, 'aspirations-inspect.json')
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2))
  console.log('Saved aspirations report to', outPath)

  await context.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
