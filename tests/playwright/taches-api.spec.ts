import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

/**
 * Tableau des tâches — contrainte centrale : une tâche prise par quelqu'un
 * ne doit jamais pouvoir être prise par un second.
 */
const ADMIN = { Authorization: 'Bearer mock-test-token' } // ci-admin@tests.fr
// Une SECONDE personne, réellement distincte : sans ça le test de double
// prise se contenterait de rejouer le même utilisateur et ne prouverait rien.
const AUTRE_EMAIL = 'beatrice@tests.fr'
const AUTRE = { Authorization: `Bearer mock-test-token:${AUTRE_EMAIL}` }

/** Donne un rôle à la seconde personne, sinon elle serait refusée en 403. */
async function inviterAutrePersonne(request: any, role = 'planning') {
  const res = await request.post('/api/admin/users', {
    headers: ADMIN,
    data: { email: AUTRE_EMAIL, role },
  })
  expect(res.ok()).toBe(true)
}

async function creerTache(request: any, titre: string, extra: Record<string, unknown> = {}) {
  const res = await request.post('/api/taches', {
    headers: ADMIN,
    data: { titre, source: 'projet', ...extra },
  })
  expect(res.ok()).toBe(true)
  return (await res.json()).tache
}

test.describe('API /api/taches', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('sans authentification, le tableau est inaccessible', async ({ request }) => {
    const res = await request.get('/api/taches')
    expect(res.status()).toBe(401)
  })

  test('une tâche créée est listée et démarre libre et à faire', async ({ request }) => {
    await creerTache(request, 'Préparer la salle')

    const res = await request.get('/api/taches', { headers: ADMIN })
    const { taches } = await res.json()
    const cible = taches.find((t: any) => t.titre === 'Préparer la salle')
    expect(cible).toBeTruthy()
    expect(cible.prisPar).toBeNull()
    expect(cible.statut).toBe('a_faire')
  })

  test('une tâche sans titre est refusée', async ({ request }) => {
    const res = await request.post('/api/taches', { headers: ADMIN, data: { titre: '   ' } })
    expect(res.status()).toBe(400)
  })

  test('prendre une tâche libre l\'attribue à la personne', async ({ request }) => {
    const tache = await creerTache(request, 'Accueil du dimanche')

    const res = await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })
    expect(res.ok()).toBe(true)
    const { tache: prise } = await res.json()
    expect(prise.prisPar).toBe('ci-admin@tests.fr')
    expect(prise.prisLe).toBeTruthy()
  })

  test('CONTRAINTE : une tâche déjà prise ne peut pas être reprise par quelqu\'un d\'autre', async ({ request }) => {
    await inviterAutrePersonne(request)
    const tache = await creerTache(request, 'Tâche convoitée')

    const premiere = await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })
    expect(premiere.ok()).toBe(true)

    const seconde = await request.post(`/api/taches/${tache.id}/prendre`, { headers: AUTRE })
    expect(seconde.status()).toBe(409)
    expect((await seconde.json()).message).toContain('vient d\'être prise')

    // Le titulaire d'origine n'a pas été écrasé
    const res = await request.get('/api/taches', { headers: ADMIN })
    const { taches } = await res.json()
    expect(taches.find((t: any) => t.id === tache.id).prisPar).toBe('ci-admin@tests.fr')
  })

  test('CONTRAINTE : deux personnes qui cliquent en même temps, un seul gagnant', async ({ request }) => {
    await inviterAutrePersonne(request)
    const tache = await creerTache(request, 'Course simultanée')

    const [a, b] = await Promise.all([
      request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN }),
      request.post(`/api/taches/${tache.id}/prendre`, { headers: AUTRE }),
    ])

    expect([a, b].filter((r) => r.ok()).length).toBe(1)
    expect([a, b].filter((r) => r.status() === 409).length).toBe(1)

    // Et le titulaire enregistré est bien celui qui a gagné
    const liste = await request.get('/api/taches', { headers: ADMIN })
    const cible = (await liste.json()).taches.find((t: any) => t.id === tache.id)
    const gagnant = a.ok() ? 'ci-admin@tests.fr' : AUTRE_EMAIL
    expect(cible.prisPar).toBe(gagnant)
  })

  test('le rôle planning peut prendre une tâche mais pas éditer le site', async ({ request }) => {
    await inviterAutrePersonne(request, 'planning')
    const tache = await creerTache(request, 'Tâche ouverte au planning')

    // Il peut prendre la tâche et la faire avancer
    const prise = await request.post(`/api/taches/${tache.id}/prendre`, { headers: AUTRE })
    expect(prise.ok()).toBe(true)
    const avance = await request.put(`/api/taches/${tache.id}`, { headers: AUTRE, data: { statut: 'en_cours' } })
    expect(avance.ok()).toBe(true)

    // Mais pas les actions réservées aux rôles d'édition (requireAdmin) :
    // ici la suppression, irréversible.
    //
    // Les endpoints d'édition du site (/api/menu, /api/pages...) ne sont pas
    // assertables ici : leur branche « mode test » écrit dans le mock et
    // retourne AVANT d'atteindre requireAdmin, qui ne protège que le chemin
    // Firestore réel.
    const suppr = await request.delete(`/api/taches/${tache.id}`, { headers: AUTRE })
    expect(suppr.status()).toBe(403)
  })

  test('une tâche prise ne peut être libérée que par son titulaire ou un admin', async ({ request }) => {
    await inviterAutrePersonne(request)
    const tache = await creerTache(request, 'Chasse gardée')
    await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })

    const vol = await request.post(`/api/taches/${tache.id}/liberer`, { headers: AUTRE })
    expect(vol.status()).toBe(403)

    const parLeTitulaire = await request.post(`/api/taches/${tache.id}/liberer`, { headers: ADMIN })
    expect(parLeTitulaire.ok()).toBe(true)
  })

  test('libérer une tâche la remet à disposition', async ({ request }) => {
    const tache = await creerTache(request, 'À relâcher')
    await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })

    const res = await request.post(`/api/taches/${tache.id}/liberer`, { headers: ADMIN })
    expect(res.ok()).toBe(true)
    expect((await res.json()).tache.prisPar).toBeNull()

    // Et elle redevient prenable
    const reprise = await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })
    expect(reprise.ok()).toBe(true)
  })

  test('l\'avancement et les dates sont modifiables, mais pas le titulaire', async ({ request }) => {
    const tache = await creerTache(request, 'Chantier peinture')
    await request.post(`/api/taches/${tache.id}/prendre`, { headers: ADMIN })

    const res = await request.put(`/api/taches/${tache.id}`, {
      headers: ADMIN,
      data: { statut: 'en_cours', debut: '2026-09-01', fin: '2026-09-15', prisPar: 'pirate@test.fr' },
    })
    expect(res.ok()).toBe(true)

    const liste = await request.get('/api/taches', { headers: ADMIN })
    const cible = (await liste.json()).taches.find((t: any) => t.id === tache.id)
    expect(cible.statut).toBe('en_cours')
    expect(cible.debut).toBe('2026-09-01')
    expect(cible.fin).toBe('2026-09-15')
    // Le champ prisPar envoyé dans le PUT doit être ignoré
    expect(cible.prisPar).toBe('ci-admin@tests.fr')
  })

  test('une date mal formée est ignorée plutôt que stockée telle quelle', async ({ request }) => {
    const tache = await creerTache(request, 'Dates douteuses', { debut: '01/09/2026' })
    expect(tache.debut).toBeNull()
  })

  test('une tâche supprimée disparaît du tableau', async ({ request }) => {
    const tache = await creerTache(request, 'À supprimer')

    const res = await request.delete(`/api/taches/${tache.id}`, { headers: ADMIN })
    expect(res.ok()).toBe(true)

    const liste = await request.get('/api/taches', { headers: ADMIN })
    expect((await liste.json()).taches.some((t: any) => t.id === tache.id)).toBe(false)
  })
})
