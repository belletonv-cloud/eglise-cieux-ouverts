// Diagnostic de configuration, utilisable EN PRODUCTION.
//
// Motivation : quand les variables d'environnement disparaissent côté
// Cloudflare, tous les endpoints Firestore renvoient un 500 opaque et le seul
// moyen de savoir laquelle manque était de deviner. Cet endpoint répond en
// une requête.
//
// Endpoint PUBLIC (il doit rester joignable quand tout le reste renvoie 500) :
// il ne renvoie que des booléens « présent / absent » — jamais une valeur,
// jamais un fragment de clé. Seule exception, réservée aux admins
// authentifiés : l'adresse expéditeur Mailjet (voir plus bas).

import { getFirestoreConfig } from '../utils/firebase'
import { getMailjetConfig } from '../utils/send-email'
import { callerIsAdmin } from '../utils/firebase-admin'

// Une clé présente mais mal recopiée (retours à la ligne perdus, guillemets
// conservés) échoue plus loin sur un `atob()` illisible. On vérifie donc la
// forme, pas seulement la présence — sans jamais renvoyer le contenu.
function privateKeyLooksValid(key: string): boolean {
  if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) return false
  const body = key
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN [\w\s]+-----/g, '')
    .replace(/-----END [\w\s]+-----/g, '')
    .replace(/\s/g, '')
  try {
    atob(body)
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const firestore = getFirestoreConfig(event)
  const mailjet = getMailjetConfig()
  const isAdmin = await callerIsAdmin(event)

  return {
    ok: Boolean(firestore),
    firestore: {
      configured: Boolean(firestore),
      projectId: Boolean(process.env.NUXT_FIREBASE_PROJECT_ID || useRuntimeConfig(event).firebaseProjectId),
      clientEmail: Boolean(process.env.NUXT_FIREBASE_CLIENT_EMAIL || useRuntimeConfig(event).firebaseClientEmail),
      privateKey: Boolean(process.env.NUXT_FIREBASE_PRIVATE_KEY || useRuntimeConfig(event).firebasePrivateKey),
      privateKeyValide: privateKeyLooksValid(
        (process.env.NUXT_FIREBASE_PRIVATE_KEY || useRuntimeConfig(event).firebasePrivateKey || '') as string
      ),
    },
    email: {
      configured: Boolean(mailjet),
      apiKey: Boolean(process.env.NUXT_MAILJET_API_KEY),
      apiSecret: Boolean(process.env.NUXT_MAILJET_API_SECRET),
      // Savoir si l'adresse expéditeur est renseignée suffit à tout le monde :
      // c'est la cause n°1 de rejet côté Mailjet (adresse non validée).
      fromEmail: Boolean(process.env.NUXT_MAILJET_FROM_EMAIL),
      // La valeur elle-même n'est jointe qu'à un admin authentifié. Elle était
      // renvoyée en clair à n'importe qui : c'est une adresse personnelle,
      // et exactement celle qu'on venait de retirer de /api/settings — la
      // laisser ici rendait ce correctif inutile, elle restait à une simple
      // requête non authentifiée.
      ...(isAdmin ? { fromEmailValeur: process.env.NUXT_MAILJET_FROM_EMAIL || null } : {}),
    },
  }
})
