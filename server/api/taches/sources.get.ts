import { requireTaskAccess } from '../../utils/firebase-admin'
import { listerTaches } from '../../utils/taches'
import { getFirestoreConfig, getAccessToken, listFirestoreCollection, parseFirestoreDoc } from '../../utils/firebase'

/**
 * Éléments existants transformables en tâche.
 *
 * On ne recopie pas ces éléments dans le tableau : ils gardent leur vie
 * propre (une demande développeur se résout dans sa modale). L'import crée
 * une tâche qui pointe vers eux, ce qui permet de les suivre et surtout de
 * les attribuer à une seule personne.
 *
 * Les éléments déjà importés sont exclus : sans ça deux clics créeraient deux
 * tâches concurrentes pour un seul travail.
 */
export default defineEventHandler(async (event) => {
  await requireTaskAccess(event)

  const dejaImportees = new Set(
    (await listerTaches(event))
      .filter((t) => t.origineType && t.origineId)
      .map((t) => `${t.origineType}:${t.origineId}`),
  )

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  let demandes: any[] = []
  if (isTest) {
    const { getComments } = await import('../../utils/firestore-mock.js')
    demandes = getComments()
  } else {
    const config = getFirestoreConfig(event)
    if (config) {
      try {
        const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
        const docs = await listFirestoreCollection(config.projectId, accessToken, 'comments')
        demandes = docs.map((d: any) => ({
          ...(parseFirestoreDoc(d) || {}),
          id: String(d.name || '').split('/').pop() || '',
        }))
      } catch (err: any) {
        console.error('[taches/sources] lecture des demandes impossible :', err?.message || err)
      }
    }
  }

  // ── Événements de l'église ──
  // Ils vivent dans le Worker eglise-app, pas dans Firestore : on relaie le
  // jeton de l'appelant, déjà validé par requireTaskAccess. Best effort — le
  // Worker peut être injoignable, ça ne doit pas priver des demandes.
  let evenements: any[] = []
  if (isTest) {
    const { getChurchEventsMock } = await import('../../utils/member-mock.js')
    evenements = getChurchEventsMock()
  } else {
    try {
      const config = useRuntimeConfig(event)
      const apiUrl = config.public?.apiUrl || 'https://eglise-app.belletonv.workers.dev'
      const auth = getRequestHeader(event, 'authorization') || ''
      const res = await fetch(`${apiUrl}/api/church-events`, {
        headers: { authorization: auth, 'content-type': 'application/json' },
      })
      if (res.ok) evenements = await res.json()
    } catch (err: any) {
      console.error('[taches/sources] événements injoignables :', err?.message || err)
    }
  }

  const aujourdhui = new Date().toISOString().slice(0, 10)
  const evenementsAVenir = (Array.isArray(evenements) ? evenements : [])
    // Un événement passé n'a plus de préparation à confier.
    .filter((e) => e && e.id && e.start_date && e.start_date >= aujourdhui)
    .filter((e) => e.status !== 'cancelled')
    .filter((e) => !dejaImportees.has(`evenement:${e.id}`))
    .map((e) => ({
      type: 'evenement' as const,
      id: String(e.id),
      libelle: String(e.title || 'Événement sans titre').slice(0, 140),
      contexte: [e.start_date, e.start_time, e.location].filter(Boolean).join(' — '),
      debut: e.start_date,
      fin: e.end_date || e.start_date,
    }))

  const disponibles = demandes
    // Une demande résolue n'a plus de travail à suivre.
    .filter((d) => d && !d.resolved && d.id)
    .filter((d) => !dejaImportees.has(`demande:${d.id}`))
    .map((d) => ({
      type: 'demande' as const,
      id: String(d.id),
      libelle: String(d.message || '').slice(0, 140) || 'Demande sans texte',
      contexte: [d.pageSlug, d.blockLabel || d.blockType].filter(Boolean).join(' — '),
    }))

  return { sources: [...disponibles, ...evenementsAVenir] }
})
