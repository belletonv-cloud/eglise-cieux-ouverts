import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

/**
 * Garde-fou : aucun appel sortant du serveur ne doit utiliser `fetch` nu.
 *
 * Le site tourne sur le runtime Workers. Un `fetch` sans signal d'annulation
 * n'abandonne jamais de lui-même : si Firestore, l'API Google d'identité,
 * Mailjet ou le Worker `eglise-app` cessent de répondre sans refuser la
 * connexion, la requête reste suspendue jusqu'à ce que la plateforme la tue.
 * Les `catch` de dégradation déjà en place (menu et footer qui retombent sur
 * les defaults, page vide plutôt que 500) ne se déclenchent alors jamais —
 * ils attendent une erreur, et il n'y en a pas, seulement une attente.
 *
 * `server/utils/http.ts` est le seul endroit autorisé à appeler `fetch`
 * directement : c'est lui qui pose le `AbortSignal.timeout`.
 */

const ROOT = resolve(__dirname, '../..')
const SERVER = resolve(ROOT, 'server')
const AUTORISE = resolve(SERVER, 'utils/http.ts')

// `fetch(` non précédé de « WithTimeout », et pas en fin d'un autre identifiant
// (pour ne pas confondre avec `$fetch(` ou `refetch(`).
const FETCH_NU_RE = /(?<![\w$])fetch\s*\(/

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(ts|js)$/.test(entry)) out.push(full)
  }
  return out
}

const files = walk(SERVER).filter((f) => f !== AUTORISE)

test.describe('Délai maximal sur les appels sortants du serveur', () => {
  test('le balayage trouve bien des fichiers à vérifier', () => {
    // Sans ça, une erreur de chemin rendrait la suite vide et verte.
    expect(files.length).toBeGreaterThan(20)
    expect(files.some((f) => f.endsWith('utils/firebase.ts'))).toBe(true)
  })

  test('aucun `fetch` nu hors de server/utils/http.ts', () => {
    const fautifs: string[] = []

    for (const file of files) {
      const src = readFileSync(file, 'utf-8')
      for (const [i, ligne] of src.split('\n').entries()) {
        const nettoyee = ligne.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '')
        if (FETCH_NU_RE.test(nettoyee)) {
          fautifs.push(`${file.slice(ROOT.length + 1)}:${i + 1} — ${ligne.trim().slice(0, 90)}`)
        }
      }
    }

    expect(fautifs).toEqual([])
  })

  test('http.ts pose bien un signal de délai', () => {
    const src = readFileSync(AUTORISE, 'utf-8')
    expect(src).toContain('AbortSignal.timeout')
    expect(src).toMatch(/signal:\s*AbortSignal\.timeout\(/)
  })
})
