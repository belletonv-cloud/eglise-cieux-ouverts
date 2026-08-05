import { requireTaskAccess, getUserRole } from '../../../utils/firebase-admin'
import { majTache, trouverTache, assertTexte } from '../../../utils/taches'

/**
 * Attribution d'une tâche à quelqu'un par un responsable.
 *
 * Complète la prise spontanée (/prendre) sans la remplacer : un pasteur peut
 * confier un service à un membre plutôt que d'attendre qu'il se propose.
 *
 * Réservé au rôle 'admin' : disposer du temps de quelqu'un d'autre n'est pas
 * une action d'édition de contenu. Un éditeur ou un membre au rôle 'planning'
 * peut prendre une tâche, pas en attribuer une.
 *
 * Une tâche déjà prise peut être réattribuée — le responsable est l'autorité —
 * mais l'ancien titulaire est renvoyé pour que l'interface le dise clairement
 * plutôt que de le remplacer en silence.
 */
export default defineEventHandler(async (event) => {
  const user = await requireTaskAccess(event)
  const role = await getUserRole(event, (user.email || '').toLowerCase())
  if (role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Seuls les responsables peuvent attribuer une tâche à quelqu\'un.',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Id manquant' })

  const body = await readBody(event)
  const email = assertTexte(body?.email, 180).toLowerCase()
  if (!email) throw createError({ statusCode: 400, message: 'Destinataire manquant.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Adresse email invalide.' })
  }

  const tache = await trouverTache(event, id)
  if (!tache) throw createError({ statusCode: 404, message: 'Tâche introuvable' })

  const ancienTitulaire = tache.prisPar
  if (ancienTitulaire === email) {
    return { tache, inchange: true }
  }

  await majTache(event, id, {
    prisPar: email,
    prisLe: new Date().toISOString(),
    assignePar: (user.email || '').toLowerCase(),
  })

  return {
    tache: { ...tache, prisPar: email, assignePar: (user.email || '').toLowerCase() },
    ancienTitulaire,
  }
})
