import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * « Aucune » doit vouloir dire AUCUNE animation — seul le choix fait la
 * différence.
 *
 * Le piège : certains blocs (Bienvenue, Contact) embarquent leurs propres
 * @keyframes, indépendantes du sélecteur. Elles partent d'un état masqué que
 * seule l'animation révèle : les couper naïvement laisse le contenu
 * invisible. On vérifie donc les deux à la fois — plus rien ne s'anime, et
 * tout reste visible.
 */
test.beforeEach(async ({ request }) => {
  await resetMock(request)
})
test.afterEach(async ({ request }) => {
  await resetMock(request)
})

async function choisir(page: any, animation: string) {
  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click()
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
  await page.locator('.anim-btn', { hasText: animation }).first().click()
  await page.waitForTimeout(500)
  return bloc
}

function releve(page: any) {
  return page.evaluate(() => {
    const el = document.querySelector('.block-wrapper[data-block-type="bienvenue"]') as HTMLElement
    const enCours: string[] = []
    const parcourt = (n: Element, prof: number) => {
      for (const a of (n as HTMLElement).getAnimations?.() || []) {
        if (a.playState === 'running') enCours.push((a as any).animationName || 'transition')
      }
      if (prof < 5) for (const c of Array.from(n.children)) parcourt(c, prof + 1)
    }
    parcourt(el, 0)
    const car = el.querySelector('.hero-bienvenue-char') as HTMLElement | null
    return {
      classes: el.className,
      animationsEnCours: enCours,
      opaciteCaractere: car ? getComputedStyle(car).opacity : null,
    }
  })
}

test('« Aucune » ne laisse tourner aucune animation, et le contenu reste visible', async ({ page }) => {
  await loginAsAdmin(page)
  await choisir(page, 'Aucune')

  const r = await releve(page)
  console.log('AUCUNE →', JSON.stringify(r))

  // La classe de neutralisation est posée
  expect(r.classes).toContain('bloc-sans-animation')
  // Plus aucune classe d'animation de wrapper
  expect(r.classes).not.toMatch(/block-anim-(fadeIn|slideUp|slideLeft|zoom|portal|bounce|flip|wave)/)
  // Plus rien ne tourne, y compris les keyframes internes du bloc
  expect(r.animationsEnCours).toEqual([])
  // …sans rendre le texte invisible : c'était tout le piège
  expect(Number(r.opaciteCaractere)).toBeGreaterThan(0.9)
})

test('sur le site public aussi, « Aucune » ne laisse rien s\'animer', async ({ page, request }) => {
  // Surface la plus importante : c'est là que les visiteurs voient le site, et
  // là que les animations internes sont pilotées au scroll (animation-timeline).
  const lecture = await request.get('/api/pages/accueil')
  const { blocks } = await lecture.json()
  for (const b of blocks) {
    if (b.type === 'bienvenue') b.props = { ...(b.props || {}), animation: 'none' }
  }
  const ecriture = await request.put('/api/pages/accueil', {
    headers: { Authorization: 'Bearer mock-test-token' },
    data: { blocks },
  })
  expect(ecriture.ok()).toBe(true)

  await page.goto('/')
  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)

  const r = await releve(page)
  console.log('PUBLIC AUCUNE →', JSON.stringify(r))

  expect(r.classes).toContain('bloc-sans-animation')
  expect(r.animationsEnCours).toEqual([])
  expect(Number(r.opaciteCaractere)).toBeGreaterThan(0.9)
})

test('choisir une animation la réactive : c\'est bien le choix qui fait la différence', async ({ page }) => {
  await loginAsAdmin(page)

  await choisir(page, 'Aucune')
  const sans = await releve(page)
  expect(sans.classes).toContain('bloc-sans-animation')

  await page.locator('.anim-btn', { hasText: 'Apparition' }).first().click()
  await page.waitForTimeout(300)
  const avec = await releve(page)
  console.log('APPARITION →', JSON.stringify({ classes: avec.classes }))

  expect(avec.classes).not.toContain('bloc-sans-animation')
  expect(avec.classes).toContain('block-anim-fadeIn')

  // Et l'opacité est bien la propriété animée, pas l'outline de l'éditeur
  const propriete = await page.evaluate(() => {
    const el = document.querySelector('.block-wrapper[data-block-type="bienvenue"]') as HTMLElement
    return getComputedStyle(el).transitionProperty
  })
  expect(propriete).toContain('opacity')
})
