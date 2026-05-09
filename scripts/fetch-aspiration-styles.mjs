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
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } })
  console.log('goto', TARGET)
  await page.goto(TARGET, { waitUntil: 'load' })
  await page.waitForTimeout(800)

  const info = await page.evaluate(({ targetsStr, foldStr })=>{
    const targets = JSON.parse(targetsStr)
    const fold = eval('(' + foldStr + ')')
    const results = []
    for(const t of targets){
      const els = Array.from(document.querySelectorAll('*')).filter(e=>fold(e.innerText||'').includes(fold(t))).slice(0,6)
      const gathered = []
      for(const el of els){
        const chain = []
        let cur = el
        for(let i=0;i<6 && cur;i++,cur=cur.parentElement){
          const s = getComputedStyle(cur)
          chain.push({ tag: cur.tagName.toLowerCase(), id: cur.id||null, classes: Array.from(cur.classList).slice(0,8), computed: { transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction, animationName: s.animationName, animationDelay: s.animationDelay, animationDuration: s.animationDuration, opacity: s.opacity, transform: s.transform, top: s.top, left: s.left } })
        }

        // within the closest ancestor, find elements with non-zero transitions
        const parent = el.closest('section,div') || document.body
        const candidates = Array.from(parent.querySelectorAll('*')).filter(x => {
          const s = getComputedStyle(x)
          return (s.transitionDelay && s.transitionDelay !== '0s') || (s.transitionDuration && s.transitionDuration !== '0s') || (s.animationName && s.animationName !== 'none')
        }).slice(0,12).map(x=>({ tag: x.tagName.toLowerCase(), classes: Array.from(x.classList).slice(0,8), computed: (function(){ const s=getComputedStyle(x); return { transitionDelay: s.transitionDelay, transitionDuration: s.transitionDuration, transitionTimingFunction: s.transitionTimingFunction, animationName: s.animationName, animationDelay: s.animationDelay, animationDuration: s.animationDuration, opacity: s.opacity, transform: s.transform } })() }))

        gathered.push({ snippet: (el.innerText||'').slice(0,300), chain, candidates })
      }
      results.push({ target: t, found: gathered.length>0, gathered })
    }
    return results
  }, { targetsStr: JSON.stringify(targets), foldStr: fold.toString() })

  const out = path.join(outDir,'aspirations-styles.json')
  fs.writeFileSync(out, JSON.stringify({ url: TARGET, ts: Date.now(), info }, null, 2))
  console.log('Wrote', out)
  await browser.close()
})().catch(e=>{ console.error(e); process.exit(1) })
