import { requireTaskAccess, getUserRole } from '../../../utils/firebase-admin'
import { majTache, trouverTache } from '../../../utils/taches'

// Libère une tâche. Réservé à la personne qui l'a prise, ou à un admin —
// sans quoi n'importe qui pourrait retirer une tâche des mains d'un autre.
export default defineEventHandler(async (event) => {
  const user = await requireTaskAccess(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Id manquant' })

  const tache = await trouverTache(event, id)
  if (!tache) throw createError({ statusCode: 404, message: 'Tâche introuvable' })
  if (!tache.prisPar) return { tache }

  const email = (user.email || '').toLowerCase()
  const role = await getUserRole(event, email)
  if (tache.prisPar !== email && role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: `Cette tâche est prise par ${tache.prisPar} — seule cette personne ou un administrateur peut la libérer.`,
    })
  }

  await majTache(event, id, { prisPar: null, prisLe: null })
  return { tache: { ...tache, prisPar: null, prisLe: null } }
})
