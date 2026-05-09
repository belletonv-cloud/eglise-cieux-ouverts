import fs from 'fs'
import path from 'path'

const targets = [
  "Accueillir et vivre l'unité",
  "Célébrer et cultiver la présence de Dieu",
  "Accompagner et restaurer les vies",
  "Témoigner et former des disciples",
]

function fold(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() }

const dir = path.resolve(process.cwd(),'test-results')
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.json'))

const results = {}
for(const t of targets) results[t] = []

for(const f of files){
  const p = path.join(dir,f)
  let obj
  try{ obj = JSON.parse(fs.readFileSync(p,'utf8')) }catch(e){ continue }

  const walk = (node, ctx=[])=>{
    if(!node || typeof node !== 'object') return
    // check candidate fields
    const textCandidates = ['text','shortText','innerText','label']
    for(const k of textCandidates){
      if(node[k] && typeof node[k] === 'string'){
        for(const t of targets){ if(fold(node[k]).includes(fold(t))) {
          // collect computed fields if present
          const computed = node.computed || node.style || node.record && node.record.computed || node.record || null
          const entry = { file: f, path: ctx.join('/'), snippet: (node[k]||'').slice(0,200), computed }
          results[t].push(entry)
        }}
      }
    }

    // also inspect classes or id
    if(node.classes && Array.isArray(node.classes)){
      for(const t of targets){ for(const c of node.classes){ if(fold(c).includes(fold(t).slice(0,8))){ results[t].push({ file: f, path: ctx.join('/'), classes: node.classes, computed: node.computed || node }) } } }
    }

    for(const k of Object.keys(node)) walk(node[k], ctx.concat(k))
  }

  walk(obj, [f])
}

// Summarize
const summary = {}
for(const t of targets){
  const list = results[t]
  const gathers = []
  for(const e of list){
    const c = e.computed || {}
    gathers.push({ file: e.file, path: e.path, snippet: e.snippet, transitionDelay: c.transitionDelay, transitionDuration: c.transitionDuration, transitionTimingFunction: c.transitionTimingFunction, opacity: c.opacity, top: c.top })
  }
  summary[t] = gathers
}

const outPath = path.join(dir,'aspirations-precise-extract.json')
fs.writeFileSync(outPath, JSON.stringify({ extractedAt: Date.now(), summary }, null, 2))
console.log('Wrote', outPath)
