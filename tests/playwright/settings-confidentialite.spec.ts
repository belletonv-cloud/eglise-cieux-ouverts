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
