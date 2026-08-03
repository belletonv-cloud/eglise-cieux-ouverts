import { requireTaskAccess } from '../../utils/firebase-admin'
import { creerTache, assertTexte, normaliseSource, normaliseStatut, normaliseDate } from '../../utils/taches'

export default defineEventHandler(async (event) => {
  const user = await requireTaskAccess(event)
  const body = await readBody(event)

  const titre = assertTexte(body?.titre, 140)
  if (!titre) {
    throw createError({ statusCode: 400, message: 'Le titre est obligatoire.' })
  }

  const tache = {
    id: crypto.randomUUID(),
    titre,
    description: assertTexte(body?.description, 2000),
    source: normaliseSource(body?.source),
    statut: normaliseStatut(body?.statut),
    prisPar: null,
    prisLe: null,
    debut: normaliseDate(body?.debut),
    fin: normaliseDate(body?.fin),
    creePar: user.email || '',
    creeLe: new Date().toISOString(),
  }

  return { tache: await creerTache(event, tache) }
})
