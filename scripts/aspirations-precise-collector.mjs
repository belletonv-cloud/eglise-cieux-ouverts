import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }

async function run(){
  const outDir = path.resolve(process.cwd(),'test-results')
  fs.mkdirSync(outDir,{recursive:true})
  const target = process.argv[2] || process.env.TARGET_URL || 'https://www.cieuxouverts.bzh'
  console.log('Navigating to', target)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({viewport:{width:1280,height:900}})
  const page = await ctx.newPage()
  await page.goto(target,{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(800)

  const substrings = ['accueill','celebr','accomp','temoign']

  const data = await page.evaluate(async (subs) => {
    function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
    const heading = headings.find(h => /nos aspir/i.test(h.innerText))
    const container = heading ? (heading.closest('section,div')||heading.parentElement) : document.body
    if(!container) return { error: 'no-container' }

    // find candidate elements whose folded innerText contains any of the substrings
    const all = Array.from(container.querySelectorAll('*')).filter(e=>e.innerText && e.innerText.trim().length>0)
    const matches = subs.map(s => {
      const el = all.find(e => fold(e.innerText).includes(s))
      if(!el) return { substr: s, found:false }
      if(!el.dataset._aspId) el.dataset._aspId = 'asp-prec-' + Math.random().toString(36).slice(2,8)
      return { substr: s, found:true, id: el.dataset._aspId, text: el.innerText.slice(0,200) }
    })

    const samples = {}
    for(const m of matches){
      if(!m.found) continue
      const el = document.querySelector(`[data-_asp-id="${m.id}"]`) || document.querySelector(`#${m.id}`) || document.querySelector(`[data-asp-id="${m.id}"]`)
      if(!el) continue
      const get = ()=>{ const s=getComputedStyle(el); return { opacity:s.opacity, transform:s.transform, top:s.top, left:s.left, transitionDelay:s.transitionDelay, transitionDuration:s.transitionDuration, transitionTimingFunction:s.transitionTimingFunction } }
      const before = get()
      // attach observer
      const rec = []
      const mo = new MutationObserver((mutList)=>{ for(const mm of mutList){ rec.push({t:performance.now(), attr:mm.attributeName, old:mm.oldValue, classes:Array.from(el.classList), style:get()}) } })
      mo.observe(el,{attributes:true,subtree:false,attributeOldValue:true,attributeFilter:['class','style']})

      // scroll to activate
      const rect = el.getBoundingClientRect(); const pageY = rect.top + window.scrollY; const targetScroll = Math.max(0, Math.floor(pageY - window.innerHeight*0.35))
      window.scrollTo({top: targetScroll, behavior:'auto'})
      await new Promise(r=>setTimeout(r,80))

      const timeline=[]
      const start = performance.now()
      while(performance.now()-start < 1500){ timeline.push({t:performance.now(), style:get(), classes:Array.from(el.classList) }); await new Promise(r=>setTimeout(r,35)) }

      mo.disconnect()
      samples[m.id] = { substr: m.substr, id: m.id, text: m.text, before, timeline, mutations: rec }
    }

    return { matches, samples }
  }, substrings)

  const outPath = path.join(outDir,'aspirations-precise.json')
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log('Saved precise data to', outPath)

  await ctx.close(); await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
