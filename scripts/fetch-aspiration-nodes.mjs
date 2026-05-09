import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const TARGET = process.argv[2] || 'https://www.cieuxouverts.bzh'
const targets = [
  "Accueillir et vivre l'unité",
  "Célébrer et cultiver la présence de Dieu",
  "Accompagner et restaurer les vies",
  "Témoigner et former des disciples",
]

function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }

;(async ()=>{
  const outDir = path.resolve(process.cwd(),'test-results')
  fs.mkdirSync(outDir,{recursive:true})
  const browser = await chromium.launch()
  const ctx = await browser.newContext({viewport:{width:1280,height:900}})
  const page = await ctx.newPage()
  console.log('goto', TARGET)
  await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)

  const nodes = await page.evaluate((targets)=>{
    function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }
    const all = Array.from(document.querySelectorAll('*'))
    const results = []
    for(const t of targets){
      const el = all.find(e => fold(e.innerText||'').includes(fold(t)))
      if(!el) { results.push({ target: t, found:false }); continue }
      const path = []
      let cur = el
      while(cur && cur !== document.body){
        const tag = cur.tagName.toLowerCase()
        const id = cur.id ? `#${cur.id}` : ''
        const cls = cur.className && typeof cur.className === 'string' ? '.' + cur.className.split(/\s+/).filter(Boolean).join('.') : ''
        path.unshift(`${tag}${id}${cls}`)
        cur = cur.parentElement
      }
      const s = getComputedStyle(el)
      results.push({ target: t, found:true, selectorPath: path.join(' > '), computed: { opacity: s.opacity, transform: s.transform, top: s.top, left: s.left, transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction, animationName: s.animationName, animationDelay: s.animationDelay, animationDuration: s.animationDuration }, classes: Array.from(el.classList).slice(0,8), text: el.innerText.slice(0,300) })
    }
    return results
  }, targets)

  const out = path.join(outDir,'aspirations-nodes.json')
  fs.writeFileSync(out, JSON.stringify({ url: TARGET, collectedAt: Date.now(), nodes }, null, 2))
  console.log('Wrote', out)

  await ctx.close(); await browser.close()
})().catch(e=>{ console.error(e); process.exit(1) })
