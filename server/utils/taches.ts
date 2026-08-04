import {
  getFirestoreConfig,
  getAccessToken,
  getFirestoreDoc,
  listFirestoreCollection,
  setFirestoreDoc,
  setFirestoreDocIfUnchanged,
  deleteFirestoreDoc,
  parseFirestoreDoc,
} from './firebase'

// Une seule notion de « tâche » quelle que soit son origine : le champ
// `source` sert de filtre dans l'interface, ce qui évite d'entretenir trois
// systèmes parallèles pour le service, le site et les projets.
export const SOURCES = ['service', 'site', 'projet'] as const
export const STATUTS = ['a_faire', 'en_cours', 'fait'] as const

export type TacheSource = (typeof SOURCES)[number]
export type TacheStatut = (typeof STATUTS)[number]

export interface Tache {
  id: string
  titre: string
  description: string
  source: TacheSource
  statut: TacheStatut
  /** Email de la personne qui a pris la tâche, ou null si elle est libre. */
  prisPar: string | null
  prisLe: string | null
  /** Bornes pour la vue Gantt (ISO court, ex. 2026-08-12). */
  debut: string | null
  fin: string | null
  creePar: string
  creeLe: string
  /**
   * Provenance, quand la tâche est née d'un élément existant (demande
   * développeur, événement). On ne recopie PAS l'élément : on garde son
   * identifiant pour éviter de l'importer deux fois et pour pouvoir
   * remonter à la source.
   */
  origineType: OrigineType
  origineId: string
  origineLibelle: string
}

export const ORIGINES = ['', 'demande', 'evenement'] as const
export type OrigineType = (typeof ORIGINES)[number]

export function normaliseOrigine(value: unknown): OrigineType {
  return ORIGINES.includes(value as OrigineType) ? (value as OrigineType) : ''
}

const COLLECTION = 'taches'

function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
}

export function assertTexte(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function normaliseSource(value: unknown): TacheSource {
  return SOURCES.includes(value as TacheSource) ? (value as TacheSource) : 'projet'
}

export function normaliseStatut(value: unknown): TacheStatut {
  return STATUTS.includes(value as TacheStatut) ? (value as TacheStatut) : 'a_faire'
}

/** Date ISO courte (AAAA-MM-JJ) ou null — les bornes Gantt sont facultatives. */
export function normaliseDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return value
}

async function tokenEtConfig(event: any) {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }
  const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
  return { config, accessToken }
}

function depuisDoc(doc: any): Tache {
  const data = parseFirestoreDoc(doc) || {}
  const id = String(doc.name || '').split('/').pop() || ''
  return {
    id,
    titre: data.titre || '',
    description: data.description || '',
    source: normaliseSource(data.source),
    statut: normaliseStatut(data.statut),
    prisPar: data.prisPar || null,
    prisLe: data.prisLe || null,
    debut: data.debut || null,
    fin: data.fin || null,
    creePar: data.creePar || '',
    creeLe: data.creeLe || '',
    origineType: normaliseOrigine(data.origineType),
    origineId: data.origineId || '',
    origineLibelle: data.origineLibelle || '',
  }
}

export async function listerTaches(event: any): Promise<Tache[]> {
  if (isTestEnv()) {
    const { getTaches } = await import('./firestore-mock.js')
    return getTaches().map((t: any) => {
      const { _rev, ...reste } = t
      return reste as Tache
    })
  }
  const { config, accessToken } = await tokenEtConfig(event)
  const docs = await listFirestoreCollection(config.projectId, accessToken, COLLECTION)
  return docs.map(depuisDoc)
}

export async function creerTache(event: any, tache: Tache): Promise<Tache> {
  if (isTestEnv()) {
    const { setTache } = await import('./firestore-mock.js')
    setTache(tache.id, tache)
    return tache
  }
  const { config, accessToken } = await tokenEtConfig(event)
  const { id, ...champs } = tache
  await setFirestoreDoc(config.projectId, accessToken, COLLECTION, id, champs)
  return tache
}

export async function majTache(event: any, id: string, champs: Record<string, any>): Promise<void> {
  if (isTestEnv()) {
    const { getTache, setTache } = await import('./firestore-mock.js')
    const actuelle = getTache(id)
    if (!actuelle) throw createError({ statusCode: 404, message: 'Tâche introuvable' })
    const { _rev, ...reste } = actuelle
    setTache(id, { ...reste, ...champs })
    return
  }
  const { config, accessToken } = await tokenEtConfig(event)
  await setFirestoreDoc(config.projectId, accessToken, COLLECTION, id, champs, Object.keys(champs))
}

export async function supprimerTache(event: any, id: string): Promise<void> {
  if (isTestEnv()) {
    const { deleteTache } = await import('./firestore-mock.js')
    deleteTache(id)
    return
  }
  const { config, accessToken } = await tokenEtConfig(event)
  await deleteFirestoreDoc(config.projectId, accessToken, COLLECTION, id)
}

export type ResultatPrise =
  | { ok: true; tache: Tache }
  | { ok: false; raison: 'introuvable' | 'deja_prise'; parQui?: string }

/**
 * Prise de tâche atomique : si deux personnes cliquent en même temps, une
 * seule aboutit. L'écriture est conditionnée à l'état lu juste avant
 * (updateTime côté Firestore, _rev côté mock) ; celle qui arrive seconde est
 * rejetée sans rien écraser.
 */
export async function prendreTache(event: any, id: string, email: string): Promise<ResultatPrise> {
  const maintenant = new Date().toISOString()

  if (isTestEnv()) {
    const { getTache, setTacheIfUnchanged } = await import('./firestore-mock.js')
    const actuelle = getTache(id)
    if (!actuelle) return { ok: false, raison: 'introuvable' }
    if (actuelle.prisPar) return { ok: false, raison: 'deja_prise', parQui: actuelle.prisPar }
    const gagne = setTacheIfUnchanged(id, { prisPar: email, prisLe: maintenant }, actuelle._rev)
    if (!gagne) {
      const apres = getTache(id)
      return { ok: false, raison: 'deja_prise', parQui: apres?.prisPar || 'quelqu\'un d\'autre' }
    }
    const { _rev, ...reste } = getTache(id)
    return { ok: true, tache: reste as Tache }
  }

  const { config, accessToken } = await tokenEtConfig(event)
  const doc = await getFirestoreDoc(config.projectId, accessToken, COLLECTION, id)
  if (!doc) return { ok: false, raison: 'introuvable' }

  const actuelle = depuisDoc(doc)
  if (actuelle.prisPar) return { ok: false, raison: 'deja_prise', parQui: actuelle.prisPar }

  const gagne = await setFirestoreDocIfUnchanged(
    config.projectId,
    accessToken,
    COLLECTION,
    id,
    { prisPar: email, prisLe: maintenant },
    ['prisPar', 'prisLe'],
    doc.updateTime
  )
  if (!gagne) {
    const apres = await getFirestoreDoc(config.projectId, accessToken, COLLECTION, id)
    return {
      ok: false,
      raison: 'deja_prise',
      parQui: apres ? depuisDoc(apres).prisPar || 'quelqu\'un d\'autre' : 'quelqu\'un d\'autre',
    }
  }
  return { ok: true, tache: { ...actuelle, prisPar: email, prisLe: maintenant } }
}

export async function trouverTache(event: any, id: string): Promise<Tache | null> {
  if (isTestEnv()) {
    const { getTache } = await import('./firestore-mock.js')
    const t = getTache(id)
    if (!t) return null
    const { _rev, ...reste } = t
    return reste as Tache
  }
  const { config, accessToken } = await tokenEtConfig(event)
  const doc = await getFirestoreDoc(config.projectId, accessToken, COLLECTION, id)
  return doc ? depuisDoc(doc) : null
}
