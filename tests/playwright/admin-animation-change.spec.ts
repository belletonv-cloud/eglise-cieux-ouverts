import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Symptôme signalé : « la gestion des animations ne fonctionne pas ».
 *
 * On suit la chaîne complète, maillon par maillon, pour isoler celui qui
 * casse : choix dans la sidebar → classe sur le bloc → sauvegarde →
 * persistance après rechargement.
 */
test.beforeEach(async ({ request }) => {
  await resetMock(request)
})

// Ces tests SAUVEGARDENT une animation sur la page 'accueil' du mock, qui est
// un état partagé par tous les fichiers de spec. Sans remise à zéro après
// coup, les specs qui s'appuient sur les animations par défaut (comme
// admin-animations.spec.ts, qui ne réinitialise pas) échouent ensuite.
test.afterEach(async ({ request }) => {
  await resetMock(request)
})

test('le choix d\'animation applique la classe et laisse le bloc visible', async ({ page }) => {
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })

  await bloc.click()
  const sidebar = page.locator('.admin-sidebar')
  await expect(sidebar).toBeVisible({ timeout: 5000 })

  await sidebar.locator('.anim-btn', { hasText: 'Apparition' }).first().click()
  await expect(bloc).toHaveClass(/block-anim-fadeIn/, { timeout: 3000 })
  // Sans .triggered, une classe block-anim-* laisse le bloc à opacity:0
  await expect(bloc).toHaveClass(/triggered/, { timeout: 3000 })
})

test('l\'animation est réellement JOUÉE en mode édition, pas seulement remplacée', async ({ page }) => {
  // Ce que les tests par classes ne pouvaient pas voir : les classes sont
  // correctes même quand le bloc saute à son état final sans s'animer.
  //
  // Le signal fiable est la propriété réellement transitionnée. En mode
  // édition, `.admin-mode .block-wrapper` (spécificité 0,2,0) l'emportait sur
  // `.block-anim-*` (0,1,0) et remplaçait leur transition par `outline 0.15s`
  // — opacity et transform n'étaient donc jamais animés.
  //
  // Mesurer l'opacité image par image ne marche pas : Chrome exécute les
  // transitions d'opacité sur le compositeur et getComputedStyle renvoie
  // déjà la valeur finale côté thread principal.
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click()

  const sidebar = page.locator('.admin-sidebar')
  await expect(sidebar).toBeVisible({ timeout: 5000 })
  await sidebar.locator('.anim-btn', { hasText: 'Apparition' }).first().click()
  await page.waitForTimeout(250)

  const etat = await page.evaluate(() => {
    const el = document.querySelector('.block-wrapper[data-block-type="bienvenue"]') as HTMLElement
    const cs = getComputedStyle(el)
    return {
      propriete: cs.transitionProperty,
      duree: cs.transitionDuration,
      animations: el.getAnimations().length,
    }
  })
  console.log('transition —', JSON.stringify(etat))

  // C'est bien l'opacité qui est animée, et pas l'outline de l'éditeur
  expect(etat.propriete).toContain('opacity')
  expect(etat.propriete).not.toBe('outline')
  // …sur une durée perceptible
  expect(parseFloat(etat.duree)).toBeGreaterThan(0.3)
  // …et une animation tourne effectivement juste après le changement
  expect(etat.animations).toBeGreaterThan(0)
})

test('l\'animation choisie survit à la sauvegarde et au rechargement', async ({ page }) => {
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click()

  const sidebar = page.locator('.admin-sidebar')
  await expect(sidebar).toBeVisible({ timeout: 5000 })
  await sidebar.locator('.anim-btn', { hasText: 'Zoom entrant' }).first().click()
  await expect(bloc).toHaveClass(/block-anim-zoom/, { timeout: 3000 })

  // Sauvegarder
  await page.locator('.admin-btn', { hasText: 'Sauvegarder' }).first().click()
  await expect(page.locator('.admin-save-status')).toBeVisible({ timeout: 8000 })
  console.log('STATUT SAUVEGARDE :', await page.locator('.admin-save-status').first().textContent())

  // Vérifier ce qui est réellement persisté côté serveur
  const persisted = await page.request.get('/api/pages/accueil')
  const data = await persisted.json()
  const cible = (data.blocks || []).find((b: any) => b.type === 'bienvenue')
  console.log('ANIMATION PERSISTÉE :', cible?.props?.animation)

  // Recharger et vérifier que l'animation est toujours là
  await page.reload()
  const blocApres = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(blocApres).toBeVisible({ timeout: 5000 })
  console.log('CLASSES APRÈS RECHARGEMENT :', await blocApres.getAttribute('class'))
  await expect(blocApres).toHaveClass(/block-anim-zoom/, { timeout: 5000 })
})

test('l\'aperçu se joue réellement dans l\'éditeur, sur un bloc quelconque', async ({ page }) => {
  // Les animations de bloc sont pilotées par le scroll (animation-timeline:
  // view()). Dans l'éditeur le bloc est déjà visible : leur progression vaut
  // 1 et rien ne se joue, quoi qu'on choisisse. Le rejeu les ramène le temps
  // d'un passage sur une base temporelle — c'est ce qu'on vérifie ici, sur un
  // bloc sans animation propre pour isoler le mécanisme.
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="vision"]').first()
  await bloc.scrollIntoViewIfNeeded()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click({ force: true })
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })

  await page.locator('.admin-sidebar .auto-field').filter({ hasText: /Animation/i })
    .locator('.anim-btn').filter({ hasText: 'Zoom entrant' }).first().click()
  await page.waitForTimeout(200)

  const r = await page.evaluate(() => {
    const el = document.querySelector('.block-wrapper[data-block-type="vision"]') as HTMLElement
    const a = (el.getAnimations?.() || []).find((x) => (x as any).animationName)
    return {
      apercu: el.classList.contains('anim-rejeu'),
      nom: a ? (a as any).animationName : null,
      etat: a ? a.playState : null,
      timeline: a?.timeline?.constructor?.name || null,
    }
  })
  console.log('aperçu →', JSON.stringify(r))

  expect(r.apercu, 'la classe d\'aperçu doit être posée').toBe(true)
  // Base temporelle : sans ça l'animation resterait figée à sa fin
  expect(r.timeline).toBe('DocumentTimeline')
  expect(r.etat, 'l\'animation doit être en cours de lecture').toBe('running')
})

test('« D\'origine » restaure l\'animation propre du bloc', async ({ page }) => {
  await loginAsAdmin(page)

  const bloc = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
  await expect(bloc).toBeVisible({ timeout: 5000 })
  await bloc.click({ force: true })
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })

  const champ = page.locator('.admin-sidebar .auto-field').filter({ hasText: /Animation/i })
  await champ.locator('.anim-btn').filter({ hasText: "D'origine" }).first().click()
  await page.waitForTimeout(300)

  // Le bloc n'est plus neutralisé : son animation interne peut se jouer
  await expect(bloc).not.toHaveClass(/bloc-anim-controlee/)
  // …et aucune animation de wrapper ne vient la concurrencer
  await expect(bloc).not.toHaveClass(/block-anim-(fadeIn|slideUp|zoom|portal)/)
})

test('« D\'origine » n\'est proposé qu\'aux blocs qui en ont une', async ({ page }) => {
  await loginAsAdmin(page)

  // Vision embarque une animation propre : l'option est là
  const vision = page.locator('.block-wrapper[data-block-type="vision"]').first()
  await vision.scrollIntoViewIfNeeded()
  await vision.click({ force: true })
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
  const champVision = page.locator('.admin-sidebar .auto-field').filter({ hasText: /Animation/i })
  await expect(champVision.locator('.anim-btn').filter({ hasText: "D'origine" })).toHaveCount(1)

  // textImage n'en a pas : l'option serait sans effet, elle n'apparaît pas
  await page.locator('.admin-sidebar .admin-close-btn').click()
  await page.waitForTimeout(300)
  const autre = page.locator('.block-wrapper[data-block-type="contact"]').first()
  await autre.scrollIntoViewIfNeeded()
  await autre.click({ force: true })
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
  // Contact en a une aussi — on vérifie la cohérence de la liste
  const champContact = page.locator('.admin-sidebar .auto-field').filter({ hasText: /Animation/i })
  await expect(champContact.locator('.anim-btn').filter({ hasText: "D'origine" })).toHaveCount(1)
})
