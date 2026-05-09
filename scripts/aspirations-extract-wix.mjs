import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const TARGET_TEXTS = [
  "Accueillir et vivre l'unité",
  'Célébrer et cultiver la présence de Dieu',
  'Accompagner et restaurer les vies',
  'Témoigner et former des disciples'
]

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(target, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)

  const result = await page.evaluate(async (targets) => {
    function normalize(s){ return (s||'').replace(/\s+/g,' ').trim() }

    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
    const heading = headings.find(h => normalize(h.innerText).toLowerCase().includes('nos aspirations'))
    const container = heading ? (heading.closest('section,div') || heading.parentElement) : document.body

    // find nodes matching each target
    const matches = targets.map(t => {
      const el = Array.from(container.querySelectorAll('*')).find(e => normalize(e.innerText).toLowerCase().includes(normalize(t).toLowerCase()))
      return { text: t, found: !!el, selector: el ? (() => {
        if (!el.id) el.id = 'asp-ex-' + Math.random().toString(36).slice(2,8)
        return '#' + el.id
      })() : null }
    })

    // observe and sample each found element
    const samplesBy = {}
    for (const m of matches) {
      if (!m.found) continue
      const el = document.querySelector(m.selector)
      const samples = []
      const getStyle = () => {
        const s = getComputedStyle(el)
        return { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction }
      }

      samples.push({ t: performance.now(), style: getStyle(), classes: Array.from(el.classList) })

      // attach mutation observer for class/style changes
      const rec = []
      const mo = new MutationObserver((mutList) => {
        for (const m of mutList) {
          rec.push({ t: performance.now(), attribute: m.attributeName, oldValue: m.oldValue, classes: Array.from(el.classList), style: getStyle() })
        }
      })
      mo.observe(el, { attributes: true, attributeOldValue: true, attributeFilter: ['class','style'] })

      // scroll element into approximate activation position
      const rect = el.getBoundingClientRect()
      const pageY = rect.top + window.scrollY
      const targetScroll = Math.max(0, Math.floor(pageY - window.innerHeight * 0.35))
      window.scrollTo({ top: targetScroll, behavior: 'auto' })

      // sample high-frequency for 1500ms
      const start = performance.now()
      while (performance.now() - start < 1600) {
        samples.push({ t: performance.now(), style: getStyle(), classes: Array.from(el.classList) })
        await new Promise(r => setTimeout(r, 40))
      }

      mo.disconnect()
      samplesBy[m.text] = { selector: m.selector, samples, mutations: rec }
    }

    return { found: matches, timeline: samplesBy }
  }, TARGET_TEXTS)

  const outPath = path.join(outDir, 'aspirations-wix-extract.json')
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2))
  console.log('Saved extract to', outPath)

  await ctx.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
