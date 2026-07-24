import { getFirestoreConfig, getAccessToken, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'

// Normalise le champ email : accepte le nouveau format (contactEmails: string[])
// et l'ancien format legacy (contactEmail: string) pour les documents Firestore
// existants écrits avant l'introduction des emails multiples.
function normalizeContactEmails(data: Record<string, any> | null): string[] {
  if (data?.contactEmails?.length) return data.contactEmails
  if (data?.contactEmail) return [data.contactEmail]
  return [process.env.CONTACT_EMAIL || 'contact@example.com']
}

// Réseaux sociaux : réglage GLOBAL (un seul jeu de liens pour tout le site —
// SiteHeader.vue, BlockContact.vue, BlockBienvenue.vue affichaient
// auparavant les mêmes URLs codées en dur indépendamment à 3 endroits,
// risque d'incohérence si on en changeait une sans les autres). Défaut =
// anciennes valeurs codées en dur, pour que les sites existants gardent le
// même rendu tant que l'admin n'a pas explicitement modifié ce réglage.
function normalizeSocialLinks(data: Record<string, any> | null): { platform: string; url: string }[] {
  if (Array.isArray(data?.socialLinks)) return data.socialLinks
  return [
    { platform: 'instagram', url: 'https://www.instagram.com/eglise_cieux_ouverts/' },
    { platform: 'facebook', url: 'https://www.facebook.com/eglisecieuxouverts' },
  ]
}

const MEMBER_TABS = ['ressources', 'demandes', 'evenements']

// Ordre des onglets de l'espace membre (pages/membre.vue) — réglable depuis
// l'admin. On ne fait confiance qu'à un tableau contenant exactement les 3
// clés connues (une seule fois chacune) ; sinon on retombe sur l'ordre
// historique codé en dur, pour ne jamais faire disparaître un onglet à
// cause d'une valeur Firestore corrompue/partielle.
function normalizeMemberTabOrder(data: Record<string, any> | null): string[] {
  const order = data?.memberTabOrder
  if (
    Array.isArray(order) &&
    order.length === MEMBER_TABS.length &&
    MEMBER_TABS.every((t) => order.includes(t))
  ) {
    return order
  }
  return MEMBER_TABS
}

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  if (isTest) {
    const { getSettings } = await import('../../utils/firestore-mock.js')
    const data = getSettings()
    return {
      contactEmails: normalizeContactEmails(data),
      hideEventsPageIfEmpty: data?.hideEventsPageIfEmpty === true,
      socialLinks: normalizeSocialLinks(data),
      memberTabOrder: normalizeMemberTabOrder(data),
    }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    return { contactEmails: normalizeContactEmails(null), socialLinks: normalizeSocialLinks(null), memberTabOrder: normalizeMemberTabOrder(null) }
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const doc = await getFirestoreDoc(config.projectId, accessToken, 'settings', 'config')
    const data = doc ? parseFirestoreDoc(doc) : null

    return {
      contactEmails: normalizeContactEmails(data),
      hideEventsPageIfEmpty: data?.hideEventsPageIfEmpty === true,
      socialLinks: normalizeSocialLinks(data),
      memberTabOrder: normalizeMemberTabOrder(data),
    }
  } catch (err: any) {
    console.error('Settings load error:', err)
    return { contactEmails: normalizeContactEmails(null), socialLinks: normalizeSocialLinks(null), memberTabOrder: normalizeMemberTabOrder(null) }
  }
})
