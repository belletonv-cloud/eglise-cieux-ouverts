import { requireTaskAccess } from '../../utils/firebase-admin'
import { majTache, trouverTache, assertTexte, normaliseSource, normaliseStatut, normaliseDate } from '../../utils/taches'

// Modifie le contenu d'une tâche. Volontairement incapable de changer
// `prisPar` : l'attribution passe uniquement par /prendre et /liberer, qui
// seuls garantissent qu'on ne peut pas voler une tâche déjà prise.
export default defineEventHandler(async (event) => {
  await requireTaskAccess(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Id manquant' })

  const existante = await trouverTache(event, id)
  if (!existante) throw createError({ statusCode: 404, message: 'Tâche introuvable' })

  const body = await readBody(event)
  const champs: Record<string, any> = {}

  if (body?.titre !== undefined) {
    const titre = assertTexte(body.titre, 140)
    if (!titre) throw createError({ statusCode: 400, message: 'Le titre est obligatoire.' })
    champs.titre = titre
  }
  if (body?.description !== undefined) champs.description = assertTexte(body.description, 2000)
  if (body?.source !== undefined) champs.source = normaliseSource(body.source)
  if (body?.statut !== undefined) champs.statut = normaliseStatut(body.statut)
  if (body?.debut !== undefined) champs.debut = normaliseDate(body.debut)
  if (body?.fin !== undefined) champs.fin = normaliseDate(body.fin)

  if (Object.keys(champs).length === 0) {
    throw createError({ statusCode: 400, message: 'Aucune modification.' })
  }

  await majTache(event, id, champs)
  return { tache: { ...existante, ...champs } }
})
