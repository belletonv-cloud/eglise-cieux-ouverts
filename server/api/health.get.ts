// Diagnostic de configuration, utilisable EN PRODUCTION.
//
// Motivation : quand les variables d'environnement disparaissent côté
// Cloudflare, tous les endpoints Firestore renvoient un 500 opaque et le seul
// moyen de savoir laquelle manque était de deviner. Cet endpoint répond en
// une requête.
//
// Ne renvoie que des booléens « présent / absent » — jamais une valeur, jamais
// un fragment de clé.

import { getFirestoreConfig } from '../utils/firebase'
import { getMailjetConfig } from '../utils/send-email'

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

export default defineEventHandler((event) => {
  const firestore = getFirestoreConfig(event)
  const mailjet = getMailjetConfig()

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
      // L'adresse expéditeur n'est pas un secret et doit être vérifiable :
      // c'est la cause n°1 de rejet côté Mailjet (adresse non validée).
      fromEmail: process.env.NUXT_MAILJET_FROM_EMAIL || null,
    },
  }
})
