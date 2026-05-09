import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })
  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 1000 } })
  const page = await ctx.newPage()
  await page.goto(target, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)

  const out = await page.evaluate(async () => {
    function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }
    const heading = Array.from(document.querySelectorAll('h1,h2,h3')).find(h => /nos aspir/i.test(h.innerText))
    const container = heading ? (heading.closest('section,div') || heading.parentElement) : document.body
    if (!container) return { error: 'no-container' }

    // prepare element registry
    const elems = Array.from(container.querySelectorAll('*')).map((el, i) => {
      const id = el.dataset._aspDeepId || (el.dataset._aspDeepId = 'aspdeep-' + i)
      const s = getComputedStyle(el)
      return { id, tag: el.tagName.toLowerCase(), shortText: (el.innerText||'').slice(0,120), textFold: fold(el.innerText||''), classes: Array.from(el.classList).slice(0,8), initial: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction } }
    })

    const records = []
    const mo = new MutationObserver((mutList) => {
      for (const m of mutList) {
        const el = m.target
        const id = el.dataset._aspDeepId
        if (!id) continue
        const s = getComputedStyle(el)
        records.push({ time: performance.now(), id, tag: el.tagName.toLowerCase(), attribute: m.attributeName, oldValue: m.oldValue, classes: Array.from(el.classList).slice(0,8), computed: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction }, shortText: (el.innerText||'').slice(0,200) })
      }
    })
    mo.observe(container, { attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style'] })

    // scroll into view and nudge repeatedly
    container.scrollIntoView({ behavior: 'auto', block: 'center' })
    await new Promise(r => setTimeout(r, 200))
    for (let i = 0; i < 20; i++) { window.scrollBy({ top: 120, behavior: 'smooth' }); await new Promise(r => setTimeout(r, 160)) }
    await new Promise(r => setTimeout(r, 900))
    mo.disconnect()

    return { foundCount: elems.length, elements: elems, records }
  })

  const outPath = path.join(outDir, 'aspirations-deep.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Saved deep report to', outPath)

  await ctx.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
