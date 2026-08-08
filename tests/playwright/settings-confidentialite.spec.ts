import { test, expect } from '@playwright/test'
import { resetMock } from './helpers/reset'

/**
 * /api/settings est un endpoint PUBLIC : les pages vitrines y lisent
 * socialLinks, memberTabOrder et hideEventsPageIfEmpty sans authentification.
 *
 * Régression : il renvoyait aussi `contactEmails`, les adresses de destination
 * du formulaire de contact — l'adresse personnelle du responsable était donc
 * lisible par n'importe qui, sans jeton (constaté en production). Aucun
 * consommateur public n'en a besoin ; seule la modale Configuration de
 * AdminToolbar.vue s'en sert.
 *
 * Le token mock est décrit dans admin-roles.spec.ts.
 */

const ADMIN_TOKEN = 'mock-test-token'

test.describe('/api/settings — confidentialité des emails de contact', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('un appel anonyme reçoit les réglages publics mais aucun email de contact', async ({ request }) => {
    const res = await request.get('/api/settings')
    expect(res.ok()).toBe(true)

    const data = await res.json()
    expect(data.contactEmails).toBeUndefined()

    // Le reste doit rester servi tel quel : les vitrines en dépendent, et un
    // anonyme doit recevoir 200, pas 401.
    expect(Array.isArray(data.socialLinks)).toBe(true)
    expect(data.memberTabOrder).toEqual(['ressources', 'demandes', 'evenements'])
    expect(typeof data.hideEventsPageIfEmpty).toBe('boolean')
  })

  test('un admin authentifié reçoit bien les emails de contact', async ({ request }) => {
    const res = await request.get('/api/settings', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBe(true)

    const data = await res.json()
    expect(Array.isArray(data.contactEmails)).toBe(true)
    expect(data.contactEmails.length).toBeGreaterThan(0)
  })

  test('un jeton invalide est traité comme un anonyme, sans échouer', async ({ request }) => {
    const res = await request.get('/api/settings', {
      headers: { Authorization: 'Bearer pas-un-vrai-jeton' },
    })
    expect(res.ok()).toBe(true)
    expect((await res.json()).contactEmails).toBeUndefined()
  })
})

/**
 * /api/health est public par nécessité : il doit rester joignable quand tous
 * les autres endpoints renvoient 500 (c'est sa raison d'être). Son en-tête
 * annonce « booléens uniquement, jamais une valeur » — mais il renvoyait
 * l'adresse expéditeur Mailjet en clair, c'est-à-dire exactement l'adresse
 * personnelle qu'on venait de retirer de /api/settings. La laisser ici rendait
 * ce correctif inutile : elle restait à une requête non authentifiée.
 */
test.describe('/api/health — aucune valeur exposée aux anonymes', () => {
  test('un appel anonyme ne reçoit que des booléens', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBe(true)

    const data = await res.json()
    expect(typeof data.email.fromEmail).toBe('boolean')
    expect(data.email.fromEmailValeur).toBeUndefined()

    // Aucune chaîne nulle part : le diagnostic est entièrement booléen.
    const chaines: string[] = []
    const parcours = (o: any, chemin: string) => {
      for (const [k, v] of Object.entries(o ?? {})) {
        if (typeof v === 'object' && v !== null) parcours(v, `${chemin}.${k}`)
        else if (typeof v === 'string') chaines.push(`${chemin}.${k} = ${v}`)
      }
    }
    parcours(data, 'health')
    expect(chaines).toEqual([])
  })

  test('un admin authentifié peut lire l\'adresse expéditeur', async ({ request }) => {
    const res = await request.get('/api/health', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBe(true)
    expect(await res.json()).toHaveProperty('email.fromEmailValeur')
  })
})
