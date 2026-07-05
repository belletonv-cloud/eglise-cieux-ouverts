import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../utils/firebase'
import { verifyFirebaseToken, isUserAdmin } from '../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  if (!await isUserAdmin(event, userInfo.email)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const body = await readBody(event)
  if (!body || !Array.isArray(body.menuItems)) {
    throw createError({ statusCode: 400, message: 'Données invalides' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'menu', {
      menuItems: body.menuItems,
      menuBgImage: body.menuBgImage || '',
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur sauvegarde menu: ${err.message || err}` })
  }
})
