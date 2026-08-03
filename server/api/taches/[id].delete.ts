import { requireAdmin } from '../../utils/firebase-admin'
import { supprimerTache, trouverTache } from '../../utils/taches'

// Suppression réservée aux rôles d'édition du site : irréversible, alors que
// le rôle 'planning' n'est censé que prendre et avancer des tâches.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Id manquant' })

  if (!(await trouverTache(event, id))) {
    throw createError({ statusCode: 404, message: 'Tâche introuvable' })
  }
  await supprimerTache(event, id)
  return { success: true }
})
