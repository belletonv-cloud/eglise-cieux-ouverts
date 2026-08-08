import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

// Ce fichier était le seul sans reset : il héritait de l'état laissé par les
// specs jouées avant lui (le mock Firestore est module-scope et partagé entre
// fichiers, cf. l'en-tête de playwright.config.ts).
test.beforeEach(async ({ request }) => {
  await resetMock(request)
})

/** Audit : exécute chaque action et rapporte tout, sans s'arrêter au 1er échec. */
function journal() {
  const lignes: string[] = []
  return {
    lignes,
    async verifie(nom: string, fn: () => Promise<void>) {
      try {
        await fn()
        lignes.push(`OK   ${nom}`)
      } catch (e: any) {
        lignes.push(`KO   ${nom} — ${String(e.message || e).split('\n')[0].slice(0, 130)}`)
      }
    },
    bilan(titre: string) {
      const ko = lignes.filter((l) => l.startsWith('KO'))
      console.log(`\n──── ${titre} ────`)
      for (const l of lignes) console.log(l)
      console.log(`${lignes.length - ko.length}/${lignes.length} OK`)
    },
  }
}

async function fermerSidebar(page: any) {
  const f = page.locator('.admin-sidebar .admin-close-btn')
  if (await f.count()) await f.click()
  await page.waitForTimeout(150)
}

test('audit — modales de la barre admin', async ({ page }) => {
  const j = journal()
  await loginAsAdmin(page)

  const modales: [string, string][] = [
    ['Config', '.settings-modal'],
    ['Admins', '.version-modal'],
    ['Demandes', '.version-modal'],
    ['Messages', '.version-modal'],
    ['Versions', '.version-modal'],
    ['Tâches', '.taches-modal'],
    ['Événements', '.event-manager-overlay'],
  ]
  for (const [libelle, sel] of modales) {
    await j.verifie(`modale ${libelle}`, async () => {
      const btn = page.locator('.admin-btn-secondary', { hasText: libelle }).first()
      if (!(await btn.count())) throw new Error('bouton absent de la barre')
      await btn.click()
      await expect(page.locator(sel.split(',')[0]).first()).toBeVisible({ timeout: 6000 })
      const fermer = page.locator('.version-modal-close, .settings-modal .close-btn, .taches-close, .event-manager-close').first()
      if (await fermer.count()) await fermer.click()
      await page.waitForTimeout(250)
    })
  }
  j.bilan('MODALES')
  expect(j.lignes.filter((l) => l.startsWith('KO'))).toEqual([])
})

test('audit — actions sur les blocs', async ({ page }) => {
  const j = journal()
  await loginAsAdmin(page)

  await j.verifie('dupliquer un bloc', async () => {
    const avant = await page.locator('.block-wrapper').count()
    const w = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
    await w.click({ force: true })
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
    await page.locator('.admin-action-duplicate').click()
    await page.waitForTimeout(500)
    const apres = await page.locator('.block-wrapper').count()
    if (apres !== avant + 1) throw new Error(`${avant} -> ${apres}`)
  })

  await j.verifie('supprimer un bloc', async () => {
    const avant = await page.locator('.block-wrapper').count()
    await page.locator('.admin-action-danger').click()
    await page.waitForTimeout(500)
    const apres = await page.locator('.block-wrapper').count()
    if (apres !== avant - 1) throw new Error(`${avant} -> ${apres}`)
  })

  await j.verifie('annuler (undo) restaure le bloc', async () => {
    const avant = await page.locator('.block-wrapper').count()
    await page.locator('.undo-redo-group .admin-icon-btn').first().click()
    await page.waitForTimeout(500)
    const apres = await page.locator('.block-wrapper').count()
    if (apres !== avant + 1) throw new Error(`${avant} -> ${apres}`)
  })

  await j.verifie('rétablir (redo)', async () => {
    const avant = await page.locator('.block-wrapper').count()
    await page.locator('.undo-redo-group .admin-icon-btn').nth(1).click()
    await page.waitForTimeout(500)
    const apres = await page.locator('.block-wrapper').count()
    if (apres !== avant - 1) throw new Error(`${avant} -> ${apres}`)
  })

  await j.verifie('déplacer un bloc vers le haut', async () => {
    await fermerSidebar(page)
    const ordreAvant = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.block-wrapper')).map((w) => w.getAttribute('data-block-id')))
    const w = page.locator('.block-wrapper[data-block-type="vision"]').first()
    await w.scrollIntoViewIfNeeded()
    await w.click({ force: true })
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
    await page.locator('.admin-action-btn', { hasText: '↑' }).first().click()
    await page.waitForTimeout(500)
    const ordreApres = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.block-wrapper')).map((w) => w.getAttribute('data-block-id')))
    if (JSON.stringify(ordreAvant) === JSON.stringify(ordreApres)) throw new Error('ordre inchangé')
  })

  await j.verifie('ajouter un bloc', async () => {
    await fermerSidebar(page)
    const avant = await page.locator('.block-wrapper').count()
    await page.locator('.admin-btn-add-block').click()
    await expect(page.locator('.block-picker-modal')).toBeVisible({ timeout: 6000 })
    await page.locator('.block-picker-card').first().click()
    await page.waitForTimeout(800)
    const apres = await page.locator('.block-wrapper').count()
    if (apres <= avant) throw new Error(`aucun ajout (${avant} -> ${apres})`)
  })

  j.bilan('ACTIONS BLOCS')
  expect(j.lignes.filter((l) => l.startsWith('KO'))).toEqual([])
})

test('audit — responsive, visibilité et sauvegarde', async ({ page }) => {
  const j = journal()
  await loginAsAdmin(page)

  for (const titre of ['Tablet', 'Mobile']) {
    await j.verifie(`aperçu ${titre}`, async () => {
      await page.locator(`.device-btn[title="${titre}"]`).click()
      await expect(page.locator('iframe').first()).toBeVisible({ timeout: 8000 })
    })
  }
  await j.verifie('retour Desktop', async () => {
    await page.locator('.device-btn[title="Desktop"]').click()
    await page.waitForTimeout(600)
    await expect(page.locator('.block-wrapper').first()).toBeVisible({ timeout: 8000 })
  })

  await j.verifie('masquer puis réafficher un bloc', async () => {
    const w = page.locator('.block-wrapper[data-block-type="bienvenue"]').first()
    await w.click({ force: true })
    await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
    await page.locator('.admin-vis-btn').click()
    await expect(page.locator('.admin-vis-btn')).toHaveClass(/off/, { timeout: 4000 })
    await page.locator('.admin-vis-btn').click()
    await expect(page.locator('.admin-vis-btn')).not.toHaveClass(/off/, { timeout: 4000 })
  })

  await j.verifie('hauteur minimale du bloc', async () => {
    const champ = page.locator('.admin-height-input')
    await champ.fill('500')
    await page.waitForTimeout(500)
    const h = await page.evaluate(() => {
      const el = document.querySelector('.block-wrapper[data-block-type="bienvenue"]') as HTMLElement
      return getComputedStyle(el).minHeight
    })
    if (h !== '500px') throw new Error(`minHeight = ${h}`)
    await champ.fill('')
  })

  await j.verifie('note développeur sur un bloc', async () => {
    await page.locator('.admin-comment-textarea').fill('Note audit')
    // Timeout explicite : sans lui, un libellé inattendu consomme les 120 s du
    // test entier et masque la vraie cause derrière un « Test timeout ».
    await page.locator('.admin-comment-actions button', { hasText: 'Créer la demande' }).first().click({ timeout: 6000 })
    await expect(page.locator('.toast-success, .admin-comment-resolved-note').first()).toBeVisible({ timeout: 6000 })
  })

  await j.verifie('sauvegarder', async () => {
    await fermerSidebar(page)
    await page.locator('.admin-btn', { hasText: 'Sauvegarder' }).first().click()
    await expect(page.locator('.admin-save-status', { hasText: /Sauvegard/ })).toBeVisible({ timeout: 12000 })
  })

  j.bilan('RESPONSIVE / VISIBILITÉ / SAUVEGARDE')
  expect(j.lignes.filter((l) => l.startsWith('KO'))).toEqual([])
})

test('audit — les blocs à contenu embarqué restent sélectionnables', async ({ page }) => {
  // Régression : le lecteur YouTube occupe tout son bloc et captait le clic.
  // elementFromPoint renvoyait l'iframe, la sélection n'atteignait jamais le
  // wrapper — le bloc était donc impossible à ouvrir, éditer ou supprimer.
  await page.goto('/test-blocks?admin=true')
  await page.waitForLoadState('networkidle')

  const bloc = page.locator('.block-wrapper[data-block-type="youtube"]')
  await bloc.scrollIntoViewIfNeeded()

  const pointeur = await page.evaluate(() => {
    const f = document.querySelector('.block-wrapper[data-block-type="youtube"] iframe') as HTMLElement
    return f ? getComputedStyle(f).pointerEvents : null
  })
  expect(pointeur, 'l\'iframe ne doit pas capter le clic en mode édition').toBe('none')

  await bloc.click()
  await expect(page.locator('.admin-sidebar')).toBeVisible({ timeout: 5000 })
})

test('audit — aucune erreur JS pendant un parcours admin', async ({ page }) => {
  const erreurs: string[] = []
  page.on('pageerror', (e) => erreurs.push(e.message))

  await loginAsAdmin(page)
  for (const t of ['bienvenue', 'vision', 'contact']) {
    const w = page.locator(`.block-wrapper[data-block-type="${t}"]`).first()
    await w.scrollIntoViewIfNeeded()
    await w.click({ force: true })
    await page.waitForTimeout(300)
    const btn = page.locator('.admin-sidebar .auto-field').filter({ hasText: /Animation/i }).locator('.anim-btn')
    if (await btn.count()) {
      await btn.first().click()
      await page.waitForTimeout(200)
    }
    await fermerSidebar(page)
  }
  await page.locator('.device-btn[title="Mobile"]').click()
  await page.waitForTimeout(800)
  await page.locator('.device-btn[title="Desktop"]').click()
  await page.waitForTimeout(500)

  expect(erreurs, `erreurs JS : ${erreurs.join(' | ')}`).toEqual([])
})
