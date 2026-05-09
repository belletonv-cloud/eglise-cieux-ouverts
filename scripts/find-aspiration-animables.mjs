import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run(){
  const outDir = path.resolve(process.cwd(),'test-results')
  fs.mkdirSync(outDir,{recursive:true})
  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(target,{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(800)

  const data = await page.evaluate(()=>{
    function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
    const heading = headings.find(h => fold(h.innerText || '').includes('nos aspirations'))
    const container = heading ? (heading.closest('section,div') || heading.parentElement) : document.body

    const all = Array.from(container.querySelectorAll('*'))
    const candidates = []
    for (const el of all) {
      const s = getComputedStyle(el)
      const td = s.transitionDelay || ''
      const ad = s.animationDelay || ''
      const hasDelay = (td && td !== '0s') || (ad && ad !== '0s')
      const br = s.borderRadius || ''
      if (hasDelay || br.indexOf('50%') !== -1 || el.className.toLowerCase().includes('aspir') || el.innerText && el.innerText.length < 120 && /accueill|cel[eé]br|accomp|temoig/i.test(el.innerText)) {
        const id = el.dataset._candId || (el.dataset._candId = 'cand-' + Math.random().toString(36).slice(2,8))
        candidates.push({ id, tag: el.tagName.toLowerCase(), text: el.innerText ? el.innerText.slice(0,200) : '', classes: Array.from(el.classList).slice(0,8), computed: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction, animationName: s.animationName, animationDelay: s.animationDelay, animationDuration: s.animationDuration, borderRadius: s.borderRadius } })
      }
    }
    return { containerTag: container.tagName, candidates }
  })

  const outPath = path.join(outDir,'aspirations-candidates.json')
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log('Saved candidates to', outPath)

  await ctx.close(); await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
