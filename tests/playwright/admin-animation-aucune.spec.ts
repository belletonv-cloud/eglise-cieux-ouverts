import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

/**
 * Seul le choix d'animation doit être visible.
 *
 * Bienvenue, Contact et Vision embarquent leurs propres @keyframes sur des
 * éléments internes (lettres du titre, sous-titre, colonnes…), indépendantes
 * du sélecteur. Elles s'ajoutaient à l'animation choisie et, bien plus
 * spectaculaires, la masquaient : quel que soit le choix on revoyait
 * l'animation d'origine du bloc, et « Aucune » n'arrêtait pas tout.
 *
 * Le piège de la correction : ces animations partent d'un état masqué que
 * seul le mouvement révèle. Les couper net rendrait le contenu invisible —
 * d'où la vérification systématique de l'opacité.
 */
const TOKEN = { Authorization: 'Bearer mock-test-token' }
const BLOCS_A_KEYFRAMES = ['bienvenue', 'contact', 'vision']

test.beforeEach(async ({ request }) => {
  await resetMock(request)
})
test.afterEach(async ({ request }) => {
  await resetMock(request)
})

async function prepare(page: any, request: any, animation: string) {
  const lecture = await request.get('/api/pages/test-blocks')
  const { blocks } = await lecture.json()
  for (const b of blocks) b.props = { ...(b.props || {}), animation }
  const ecriture = await request.put('/api/pages/test-blocks', { headers: TOKEN, data: { blocks } })
  expect(ecriture.ok()).toBe(true)

  await page.goto('/test-blocks')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1200)
}

function releve(page: any, type: string) {
  return page.evaluate((t: string) => {
    const w = document.querySelector(`.block-wrapper[data-block-type="${t}"]`) as HTMLElement
    if (!w) return null
    const duree = (a: Animation) => Number((a.effect as any)?.getTiming?.().duration) || 0
    const wrapper = (w.getAnimations?.() || []).map((a) => ({
      nom: (a as any).animationName || 'transition',
      duree: duree(a),
    }))
    const internes: { nom: string; duree: number; opacite: number }[] = []
    const vus = new Set<string>()
    const parcourt = (n: Element, prof: number) => {
      for (const a of (n as HTMLElement).getAnimations?.() || []) {
        const nom = ((a as any).animationName || '').replace(/-[a-f0-9]{6,}$/, '')
        if (nom && !vus.has(nom)) {
          vus.add(nom)
          internes.push({ nom, duree: duree(a), opacite: Number(getComputedStyle(n as HTMLElement).opacity) })
        }
      }
      if (prof < 5) for (const c of Array.from(n.children)) parcourt(c, prof + 1)
    }
    for (const c of Array.from(w.children)) parcourt(c, 0)
    return { classes: w.className, wrapper, internes }
  }, type)
}

test('« Aucune » : aucun bloc ne joue quoi que ce soit, et rien ne disparaît', async ({ page, request }) => {
  await prepare(page, request, 'none')

  for (const type of BLOCS_A_KEYFRAMES) {
    const r = await releve(page, type)
    console.log(`AUCUNE ${type} →`, JSON.stringify(r))
    expect(r, type).not.toBeNull()

    // Aucune animation sur le wrapper : rien n'a été choisi
    expect(r!.wrapper.filter((a: any) => a.nom !== 'transition'), type).toEqual([])
    // Les animations internes sont réduites à une durée imperceptible
    for (const i of r!.internes) {
      expect(i.duree, `${type} / ${i.nom}`).toBeLessThan(1)
      expect(i.opacite, `${type} / ${i.nom} doit rester visible`).toBeGreaterThan(0.9)
    }
  }
})

test('avec une animation choisie, elle seule est visible', async ({ page, request }) => {
  await prepare(page, request, 'fadeIn')

  for (const type of BLOCS_A_KEYFRAMES) {
    const r = await releve(page, type)
    console.log(`FADEIN ${type} →`, JSON.stringify(r))
    expect(r, type).not.toBeNull()
    expect(r!.classes, type).toContain('bloc-anim-controlee')

    // L'animation choisie se joue pleinement sur le wrapper
    const choisie = r!.wrapper.find((a: any) => a.nom === 'animFadeIn')
    expect(choisie, `${type} : l'animation choisie doit être présente`).toBeTruthy()
    expect(choisie!.duree, type).toBeGreaterThan(500)

    // …et les animations propres au bloc ne viennent plus la masquer
    for (const i of r!.internes) {
      expect(i.duree, `${type} / ${i.nom} ne doit plus concurrencer le choix`).toBeLessThan(1)
      expect(i.opacite, `${type} / ${i.nom} doit rester visible`).toBeGreaterThan(0.9)
    }
  }
})

test('les blocs sans sélecteur gardent leur animation d\'origine', async ({ page, request }) => {
  // rejoins, aspirations, nousRejoindre et footer n'exposent aucun choix :
  // leur animation n'a jamais été décidée par l'utilisateur et ne doit pas
  // être coupée par cette correction.
  await prepare(page, request, 'none')

  const r = await releve(page, 'rejoins')
  expect(r).not.toBeNull()
  console.log('REJOINS (intact) →', JSON.stringify(r!.internes))

  // Pas marqué : la neutralisation ne s'y applique pas
  expect(r!.classes).not.toContain('bloc-anim-controlee')
  // Ses animations sont toujours là. On ne teste pas leur durée : elles sont
  // pilotées au scroll (animation-timeline: view()), un mode où la durée
  // n'est pas une valeur temporelle et vaut 0 dans getTiming().
  expect(r!.internes.length, 'rejoins doit conserver ses animations').toBeGreaterThan(0)
  expect(r!.internes.map((i: any) => i.nom)).toContain('text-from-left')
})
