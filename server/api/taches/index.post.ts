import { requireTaskAccess } from '../../utils/firebase-admin'
import { creerTache, listerTaches, assertTexte, normaliseSource, normaliseStatut, normaliseDate, normaliseOrigine } from '../../utils/taches'

export default defineEventHandler(async (event) => {
  const user = await requireTaskAccess(event)
  const body = await readBody(event)

  const titre = assertTexte(body?.titre, 140)
  if (!titre) {
    throw createError({ statusCode: 400, message: 'Le titre est obligatoire.' })
  }

  // Une source déjà importée ne doit pas produire de doublon : deux clics
  // sur la même demande créeraient sinon deux tâches concurrentes pour un
  // seul travail, exactement ce que la prise exclusive cherche à éviter.
  const origineType = normaliseOrigine(body?.origineType)
  const origineId = assertTexte(body?.origineId, 200)
  if (origineType && origineId) {
    const existante = (await listerTaches(event)).find(
      (t) => t.origineType === origineType && t.origineId === origineId,
    )
    if (existante) {
      throw createError({
        statusCode: 409,
        message: 'Cet élément a déjà été transformé en tâche.',
      })
    }
  }

  const tache = {
    id: crypto.randomUUID(),
    titre,
    description: assertTexte(body?.description, 2000),
    source: normaliseSource(body?.source),
    statut: normaliseStatut(body?.statut),
    prisPar: null,
    prisLe: null,
    assignePar: '',
    debut: normaliseDate(body?.debut),
    fin: normaliseDate(body?.fin),
    creePar: user.email || '',
    creeLe: new Date().toISOString(),
    origineType,
    origineId,
    origineLibelle: assertTexte(body?.origineLibelle, 200),
  }

  return { tache: await creerTache(event, tache) }
})
