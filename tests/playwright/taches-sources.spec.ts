import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Phase 3 — transformer un élément existant en tâche suivie et attribuable.
 *
 * L'élément n'est PAS recopié : il garde sa vie propre, la tâche pointe vers
 * lui. Le lien sert surtout à ne pas l'importer deux fois — deux tâches pour
 * un seul travail ruineraient la prise exclusive.
 */
const ADMIN = { Authorization: 'Bearer mock-test-token' }

async function creerDemande(request: any, message: string) {
  const res = await request.post('/api/comments', {
    headers: ADMIN,
    data: { pageSlug: 'accueil', blockId: 'bloc-bienvenue', blockType: 'bienvenue', blockLabel: 'Bienvenue', message },
  })
  expect(res.ok()).toBe(true)
}

test.describe('Sources transformables en tâche', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('une demande développeur non résolue est proposée', async ({ request }) => {
    await creerDemande(request, 'Ajouter un compteur sur la page accueil')

    const res = await request.get('/api/taches/sources', { headers: ADMIN })
    expect(res.ok()).toBe(true)
    const { sources } = await res.json()
    const cible = sources.find((s: any) => s.libelle.includes('compteur'))
    expect(cible).toBeTruthy()
    expect(cible.type).toBe('demande')
    expect(cible.contexte).toContain('accueil')
  })

  test('sans authentification, les sources sont inaccessibles', async ({ request }) => {
    const res = await request.get('/api/taches/sources')
    expect(res.status()).toBe(401)
  })

  test('une demande importée disparaît des sources et devient une tâche', async ({ request }) => {
    await creerDemande(request, 'Corriger le pied de page')
    const avant = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    const source = avant.sources.find((s: any) => s.libelle.includes('pied de page'))
    expect(source).toBeTruthy()

    const creation = await request.post('/api/taches', {
      headers: ADMIN,
      data: {
        titre: source.libelle,
        source: 'site',
        origineType: 'demande',
        origineId: source.id,
        origineLibelle: source.libelle,
      },
    })
    expect(creation.ok()).toBe(true)
    const { tache } = await creation.json()
    expect(tache.origineType).toBe('demande')
    expect(tache.origineId).toBe(source.id)

    // Elle n'est plus proposée
    const apres = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    expect(apres.sources.some((s: any) => s.id === source.id)).toBe(false)
  })

  test('CONTRAINTE : un même élément ne peut pas produire deux tâches', async ({ request }) => {
    await creerDemande(request, 'Tache a importer une seule fois')
    const { sources } = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    const source = sources[0]

    const corps = {
      titre: source.libelle,
      source: 'site',
      origineType: 'demande',
      origineId: source.id,
      origineLibelle: source.libelle,
    }
    const premiere = await request.post('/api/taches', { headers: ADMIN, data: corps })
    expect(premiere.ok()).toBe(true)

    const seconde = await request.post('/api/taches', { headers: ADMIN, data: corps })
    expect(seconde.status()).toBe(409)
    expect((await seconde.json()).message).toContain('déjà été transformé')

    const { taches } = await (await request.get('/api/taches', { headers: ADMIN })).json()
    expect(taches.filter((t: any) => t.origineId === source.id).length).toBe(1)
  })

  test('une demande résolue n\'est plus proposée', async ({ request }) => {
    await creerDemande(request, 'Demande deja traitee')
    const { comments } = await (await request.get('/api/comments', { headers: ADMIN })).json()
    const c = comments.find((x: any) => x.message.includes('deja traitee'))

    await request.put(`/api/comments/${c.id}`, { headers: ADMIN, data: { resolved: true } })

    const { sources } = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    expect(sources.some((s: any) => s.id === c.id)).toBe(false)
  })

  test('depuis l\'interface : la demande apparaît et se transforme en un clic', async ({ page, request }) => {
    await creerDemande(request, 'Revoir le bloc galerie')

    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Tâches' }).click()
    await expect(page.locator('.taches-modal')).toBeVisible({ timeout: 5000 })

    const item = page.locator('.taches-source-item', { hasText: 'Revoir le bloc galerie' })
    await expect(item).toBeVisible({ timeout: 5000 })

    await item.locator('button', { hasText: 'Créer la tâche' }).click()

    // La carte apparaît, avec le rappel de sa provenance
    const carte = page.locator('.taches-carte', { hasText: 'Revoir le bloc galerie' })
    await expect(carte).toBeVisible({ timeout: 5000 })
    await expect(carte.locator('.taches-origine')).toContainText('Demande développeur')

    // …et la source n'est plus proposée
    await expect(page.locator('.taches-source-item', { hasText: 'Revoir le bloc galerie' })).toHaveCount(0)
  })
})

test.describe('Événements et attribution', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('les événements à venir sont proposés, avec leur date', async ({ request }) => {
    const { sources } = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    const evts = sources.filter((s: any) => s.type === 'evenement')
    expect(evts.length).toBeGreaterThan(0)
    const culte = evts.find((e: any) => e.libelle.includes('Culte'))
    expect(culte).toBeTruthy()
    expect(culte.debut).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(culte.contexte).toContain('Morlaix')
  })

  test('un événement importé garde ses dates et sort des sources', async ({ request }) => {
    const { sources } = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    const evt = sources.find((s: any) => s.type === 'evenement')

    const res = await request.post('/api/taches', {
      headers: ADMIN,
      data: {
        titre: evt.libelle, source: 'service',
        origineType: 'evenement', origineId: evt.id, origineLibelle: evt.libelle,
        debut: evt.debut, fin: evt.fin,
      },
    })
    expect(res.ok()).toBe(true)
    const { tache } = await res.json()
    expect(tache.debut).toBe(evt.debut)
    expect(tache.origineType).toBe('evenement')

    const apres = await (await request.get('/api/taches/sources', { headers: ADMIN })).json()
    expect(apres.sources.some((s: any) => s.type === 'evenement' && s.id === evt.id)).toBe(false)
  })

  test('un responsable peut confier une tâche à quelqu\'un', async ({ request }) => {
    const c = await request.post('/api/taches', { headers: ADMIN, data: { titre: 'Installer la sono', source: 'service' } })
    const { tache } = await c.json()

    const res = await request.post(`/api/taches/${tache.id}/assigner`, {
      headers: ADMIN, data: { email: 'ci-member@tests.fr' },
    })
    expect(res.ok()).toBe(true)
    const corps = await res.json()
    expect(corps.tache.prisPar).toBe('ci-member@tests.fr')
    expect(corps.tache.assignePar).toBe('ci-admin@tests.fr')
  })

  test('CONTRAINTE : seul un responsable peut attribuer', async ({ request }) => {
    await request.post('/api/admin/users', {
      headers: ADMIN, data: { email: 'planif@tests.fr', role: 'planning' },
    })
    const c = await request.post('/api/taches', { headers: ADMIN, data: { titre: 'Tache a confier', source: 'service' } })
    const { tache } = await c.json()

    const res = await request.post(`/api/taches/${tache.id}/assigner`, {
      headers: { Authorization: 'Bearer mock-test-token:planif@tests.fr' },
      data: { email: 'ci-member@tests.fr' },
    })
    expect(res.status()).toBe(403)
    expect((await res.json()).message).toContain('responsables')
  })

  test('réattribuer signale l\'ancien titulaire plutôt que de l\'écraser en silence', async ({ request }) => {
    const c = await request.post('/api/taches', { headers: ADMIN, data: { titre: 'Tache reattribuee', source: 'service' } })
    const { tache } = await c.json()
    await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })

    const res = await request.post(`/api/taches/${tache.id}/assigner`, {
      headers: ADMIN, data: { email: 'ci-member@tests.fr' },
    })
    expect(res.ok()).toBe(true)
    const corps = await res.json()
    expect(corps.ancienTitulaire).toBe('ci-admin@tests.fr')
    expect(corps.tache.prisPar).toBe('ci-member@tests.fr')
  })

  test('une adresse invalide est refusée', async ({ request }) => {
    const c = await request.post('/api/taches', { headers: ADMIN, data: { titre: 'Tache email invalide', source: 'service' } })
    const { tache } = await c.json()
    const res = await request.post(`/api/taches/${tache.id}/assigner`, { headers: ADMIN, data: { email: 'pas-un-email' } })
    expect(res.status()).toBe(400)
  })

  test('depuis l\'interface : le responsable confie une tâche via le sélecteur', async ({ page, request }) => {
    await request.post('/api/taches', { headers: ADMIN, data: { titre: 'Preparer accueil dimanche', source: 'service' } })

    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Tâches' }).click()
    await expect(page.locator('.taches-modal')).toBeVisible({ timeout: 5000 })

    const carte = page.locator('.taches-carte', { hasText: 'Preparer accueil dimanche' })
    await expect(carte).toBeVisible({ timeout: 5000 })
    await carte.locator('.taches-assigner-select').selectOption('ci-member@tests.fr')

    await expect(carte.locator('.taches-titulaire')).toContainText('Confiée à ci-member@tests.fr', { timeout: 5000 })
  })
})
