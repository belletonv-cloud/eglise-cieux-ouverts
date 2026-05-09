import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(target, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)

  // find the aspirations container by heading text
  const containerHandle = await page.evaluateHandle(() => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
    const found = headings.find(h => /Nos aspirations/i.test(h.innerText))
    if (!found) return document.body
    return found.closest('section,div') || found.parentElement || document.body
  })

  // expose a function to collect timelines for each list item inside the container
  const result = await page.evaluate(async (container) => {
    function q(sel) { return Array.from(container.querySelectorAll(sel)) }
    // try to find list items by looking for text lines inside the container
    const texts = Array.from(container.querySelectorAll('div, p, span, li')).filter(el => el.innerText && el.innerText.trim().length > 3)
    // Heuristic: choose those with short text lines (2-6 words) likely to be the aspirations
    const candidates = texts.filter(t => t.innerText.trim().split(/\s+/).length <= 8).slice(0, 8)

    // ensure each candidate has an id attribute for retrieval
    candidates.forEach((el, i) => { if (!el.dataset._aspId) el.dataset._aspId = `asp-item-${i}` })

    const items = candidates.map(el => ({ id: el.dataset._aspId, text: el.innerText.slice(0,200) }))

    // helper to sample computed style of an element
    function sample(el) { const s = getComputedStyle(el); return { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction } }

    // scroll container into view
    container.scrollIntoView({ behavior: 'auto', block: 'center' })
    await new Promise(r => setTimeout(r, 200))

    // for each item, set up a short high-frequency sampling around the activation
    const timeline = []
    for (const it of items) {
      const el = document.querySelector(`[data-_asp-id="${it.id}"]`) || document.querySelector(`[data-asp-id="${it.id}"]`)
      if (!el) continue
      const before = sample(el)
      // prepare to nudge scroll to trigger activation for this item
      const rect = el.getBoundingClientRect()
      const pageY = rect.top + window.scrollY
      // compute a target scroll that will put the item near top of viewport to trigger intersection
      const targetTop = Math.max(0, pageY - (window.innerHeight * 0.25))

      // perform incremental scroll toward target while sampling
      const samples = []
      const steps = 18
      const startY = window.scrollY
      for (let s = 1; s <= steps; s++) {
        const y = Math.floor(startY + (targetTop - startY) * (s / steps))
        window.scrollTo({ top: y, behavior: 'auto' })
        // sample multiple times quickly
        for (let k = 0; k < 3; k++) {
          samples.push({ t: performance.now(), style: sample(el), classes: Array.from(el.classList).slice(0,8) })
          await new Promise(r => setTimeout(r, 30))
        }
      }
      // final hold
      for (let k = 0; k < 8; k++) { samples.push({ t: performance.now(), style: sample(el), classes: Array.from(el.classList).slice(0,8) }); await new Promise(r => setTimeout(r, 40)) }

      timeline.push({ id: it.id, text: it.text, before, samples })
    }

    return { items: timeline }
  }, containerHandle)

  // save result and screenshots for each recorded item
  const out = { url: target, requestedAt: Date.now(), collected: result }
  const p = path.join(outDir, 'aspirations-pixel-timeline.json')
  fs.writeFileSync(p, JSON.stringify(out, null, 2))
  console.log('Saved timeline to', p)

  // take per-item screenshots
  const data = result.items || []
  for (let i = 0; i < data.length; i++) {
    const id = data[i].id
    try {
      const handle = await page.$(`[data-_asp-id="${id}"]`) || await page.$(`[data-asp-id="${id}"]`)
      if (!handle) continue
      const box = await handle.boundingBox()
      if (box && box.width > 0 && box.height > 0) {
        const fp = path.join(outDir, `asp-tl-${String(i+1).padStart(2,'0')}-${id}.png`)
        await page.screenshot({ path: fp, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, 1600)), height: Math.max(1, Math.min(box.height, 1200)) } })
      }
    } catch (e) {
      // ignore screenshot errors
    }
  }

  await ctx.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
