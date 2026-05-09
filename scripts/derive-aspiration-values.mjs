import fs from 'fs'
import path from 'path'

const file = path.resolve(process.cwd(),'test-results','aspirations-pixel.json')
if(!fs.existsSync(file)){
  console.error('Missing', file); process.exit(1)
}

const data = JSON.parse(fs.readFileSync(file,'utf8'))
const items = data.found || []
const targets = [
  "Accueillir et vivre l'unité",
  "Célébrer et cultiver la présence de Dieu",
  "Accompagner et restaurer les vies",
  "Témoigner et former des disciples",
]

function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }

const hits = []
for(const it of items){
  const t = it.text || ''
  for(const target of targets){
    if(fold(t).includes(fold(target))) hits.push({ target, id: it.id, tag: it.tag, text: t.slice(0,400), computed: it.style || it.styleComputed || it.styleComputed || it.style || it.computed || it.computed })
  }
}

// Also inspect samples for computed entries
const samples = data.samples || []
for(const s of samples){
  const rec = s.record || s.computed || s;
  const txt = s.shortText || s.computed && s.computed.shortText || ''
  if(!rec) continue
}

const report = {}
for(const h of hits){
  const c = h.computed || {}
  report[h.target] = report[h.target] || []
  report[h.target].push({ id: h.id, tag: h.tag, transitionDelay: c.transitionDelay, transitionDuration: c.transitionDuration, transitionTimingFunction: c.transitionTimingFunction, opacity: c.opacity, top: c.top })
}

const out = { derivedAt: Date.now(), file, report }
const outPath = path.resolve(process.cwd(),'test-results','aspirations-derived-values.json')
fs.writeFileSync(outPath, JSON.stringify(out,null,2))
console.log('Wrote', outPath)
