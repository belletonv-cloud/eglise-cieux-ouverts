import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

/**
 * Garde-fou sur une classe de bug qui s'est déjà produite plusieurs fois ici
 * (cf. CLAUDE.md : « tout listener doit être désabonné »).
 *
 * Un listener posé sur `window` ou `document` survit au démontage du composant
 * qui l'a posé. Les dégâts constatés dans ce dépôt :
 * - un `onAuthStateChanged` oublié dans pages/admin.vue corrompait l'état
 *   interne de Vue après navigation, plus aucune interaction possible ;
 * - le raccourci Ctrl+Z de AdminToolbar.vue restait branché après la sortie du
 *   mode admin, sur le singleton useAdmin() : un Ctrl+Z sur le site public
 *   annulait des blocs en silence, et en admin il en annulait autant que de
 *   montages précédents.
 *
 * On ne vérifie QUE `window.` / `document.` : un listener posé sur un élément
 * du composant meurt avec lui, il n'a pas besoin d'être retiré.
 *
 * `plugins/` est hors périmètre : ses listeners vivent volontairement le temps
 * de l'application (cf. plugins/deployment-check.client.ts).
 */

const ROOT = resolve(__dirname, '../..')
const DIRS = ['components', 'composables', 'layouts', 'pages']
const ADD_RE = /(?:window|document)\.addEventListener\(\s*["'`]([a-zA-Z:]+)["'`]/g
const REMOVE_RE = /(?:window|document)\.removeEventListener\(\s*["'`]([a-zA-Z:]+)["'`]/g

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(vue|js|ts)$/.test(entry)) out.push(full)
  }
  return out
}

function eventsOf(src: string, re: RegExp): Set<string> {
  const found = new Set<string>()
  for (const m of src.matchAll(re)) found.add(m[1])
  return found
}

const files = DIRS.flatMap((d) => walk(resolve(ROOT, d)))

test.describe('Nettoyage des listeners globaux', () => {
  test('le balayage trouve bien des fichiers à vérifier', () => {
    // Sans ça, une erreur de chemin rendrait toute la suite vide et verte.
    expect(files.length).toBeGreaterThan(20)
    expect(files.some((f) => f.endsWith('AdminToolbar.vue'))).toBe(true)
  })

  test('chaque événement écouté sur window/document est aussi retiré', () => {
    const manquants: string[] = []

    for (const file of files) {
      const src = readFileSync(file, 'utf-8')
      const ajoutes = eventsOf(src, ADD_RE)
      if (!ajoutes.size) continue
      const retires = eventsOf(src, REMOVE_RE)
      for (const evt of ajoutes) {
        if (!retires.has(evt)) {
          manquants.push(`${file.slice(ROOT.length + 1)} — "${evt}" ajouté sans removeEventListener`)
        }
      }
    }

    expect(manquants).toEqual([])
  })
})
