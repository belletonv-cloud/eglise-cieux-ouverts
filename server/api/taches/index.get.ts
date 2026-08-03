import { requireTaskAccess } from '../../utils/firebase-admin'
import { listerTaches } from '../../utils/taches'

export default defineEventHandler(async (event) => {
  await requireTaskAccess(event)
  const taches = await listerTaches(event)
  // Les plus récentes d'abord ; le tri fin (par échéance, par personne) se
  // fait côté interface, qui connaît le filtre actif.
  taches.sort((a, b) => (b.creeLe || '').localeCompare(a.creeLe || ''))
  return { taches }
})
