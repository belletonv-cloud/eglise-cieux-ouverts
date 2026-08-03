import { requireTaskAccess } from '../../../utils/firebase-admin'
import { prendreTache } from '../../../utils/taches'

// Prise de tâche. Le 409 est la réponse attendue quand quelqu'un a été plus
// rapide : l'interface s'en sert pour dire qui a pris la tâche plutôt que
// d'afficher une erreur technique.
export default defineEventHandler(async (event) => {
  const user = await requireTaskAccess(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Id manquant' })
  if (!user.email) throw createError({ statusCode: 400, message: 'Compte sans adresse email' })

  const resultat = await prendreTache(event, id, user.email.toLowerCase())

  if (!resultat.ok) {
    if (resultat.raison === 'introuvable') {
      throw createError({ statusCode: 404, message: 'Tâche introuvable' })
    }
    throw createError({
      statusCode: 409,
      message: `Trop tard : cette tâche vient d'être prise par ${resultat.parQui}.`,
    })
  }
  return { tache: resultat.tache }
})
