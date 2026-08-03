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
