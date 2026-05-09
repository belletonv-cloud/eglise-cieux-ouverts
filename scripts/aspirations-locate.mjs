import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const out = []
  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(target, { waitUntil: 'load' })
  await page.waitForTimeout(800)

  const texts = [
    "Accueillir et vivre l'unité",
    'Célébrer et cultiver la présence de Dieu',
    'Accompagner et restaurer les vies',
    'Témoigner et former des disciples'
  ]

  for (const t of texts) {
    const res = await page.evaluate((text) => {
      function normalize(s){ return (s||'').replace(/\s+/g,' ').trim() }
      const els = Array.from(document.querySelectorAll('div, p, span, li, h2, h3'))
      const found = els.filter(e => normalize(e.innerText || '').includes(normalize(text)))
      return found.slice(0,6).map(e => {
        const s = getComputedStyle(e)
        // attempt to find a nearby circle-like element: sibling or previous element with border-radius 50%
        const siblings = Array.from(e.parentElement ? e.parentElement.children : [])
        const circle = siblings.find(sib => getComputedStyle(sib).borderRadius && getComputedStyle(sib).borderRadius.indexOf('50%') !== -1)
        return { text: e.innerText.slice(0,200), tag: e.tagName, classes: Array.from(e.classList).slice(0,8), style: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction }, hasCircleSibling: !!circle, circleClasses: circle ? Array.from(circle.classList).slice(0,8) : null }
      })
    }, t)
    out.push({ query: t, results: res })
  }

  const p = path.resolve(process.cwd(), 'test-results', 'aspirations-locate.json')
  fs.writeFileSync(p, JSON.stringify(out, null, 2))
  console.log('Saved locate report to', p)
  await ctx.close()
  await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
